// src/api/payments/webhook.js
export async function handleWebhook(request, env) {
    try {
        const body = await request.formData();
        const data = Object.fromEntries(body);
        
        console.log('📥 Webhook received:', data);
        
        const reference = data.reference || data.payment_reference || '';
        const status = data.status || data.payment_status || '';
        const paynowReference = data.paynowreference || data.transaction_reference || '';
        
        if (!reference) {
            return new Response('Missing reference', { status: 400 });
        }
        
        // Find order by payment reference
        const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE payment_reference = ?
        `).bind(reference).first();
        
        if (!order) {
            console.log('❌ Order not found for reference:', reference);
            return new Response('Order not found', { status: 404 });
        }
        
        // Check if already paid
        if (order.payment_status === 'paid') {
            return new Response('Already paid', { status: 200 });
        }
        
        // Update based on status
        const isPaid = status.toLowerCase() === 'paid' || 
                       status.toLowerCase() === 'awaiting delivery';
        
        if (isPaid) {
            await env.DB.prepare(`
                UPDATE orders 
                SET payment_status = 'paid',
                    paynow_reference = ?,
                    paynow_status = ?,
                    paid_at = ?,
                    updated_at = ?
                WHERE order_id = ?
            `).bind(
                paynowReference,
                status,
                new Date().toISOString(),
                new Date().toISOString(),
                order.order_id
            ).run();
            
            console.log('✅ Payment confirmed for order:', order.order_id);
            
            // Update order_items too
            await env.DB.prepare(`
                UPDATE order_items 
                SET fulfilment_status = 'processing',
                    updated_at = ?
                WHERE order_id = ?
            `).bind(new Date().toISOString(), order.order_id).run();
            
        } else {
            // Update status
            await env.DB.prepare(`
                UPDATE orders 
                SET paynow_status = ?,
                    updated_at = ?
                WHERE order_id = ?
            `).bind(status, new Date().toISOString(), order.order_id).run();
        }
        
        return new Response('OK', { status: 200 });
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return new Response('Error: ' + error.message, { status: 500 });
    }
}