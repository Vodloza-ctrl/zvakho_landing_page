// src/api/payments/confirm.js
export async function confirmPayment(request, env, user) {
    try {
        const body = await request.json();
        const { order_id } = body;
        
        if (!order_id) {
            return new Response(JSON.stringify({ 
                error: 'Order ID required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND brand_id = ?
        `).bind(order_id, user.brand_id).first();
        
        if (!order) {
            return new Response(JSON.stringify({ 
                error: 'Order not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (order.payment_status === 'paid') {
            return new Response(JSON.stringify({
                success: true,
                message: 'Already paid'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Manually confirm payment
        await env.DB.prepare(`
            UPDATE orders 
            SET payment_status = 'paid',
                paid_at = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
            new Date().toISOString(),
            new Date().toISOString(),
            order_id
        ).run();
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Payment confirmed manually',
            order_id: order_id
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Confirm payment error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to confirm payment' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}