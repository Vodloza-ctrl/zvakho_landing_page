// src/api/checkout/confirm.js
export async function confirmCheckout(request, env, user) {
    try {
        const body = await request.json();
        const { order_id, payment_reference, payment_status } = body;
        
        if (!order_id) {
            return new Response(JSON.stringify({ 
                error: 'Order ID required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update order
        await env.DB.prepare(`
            UPDATE orders 
            SET payment_status = ?,
                payment_reference = ?,
                updated_at = ?
            WHERE order_id = ? AND brand_id = ?
        `).bind(
            payment_status || 'paid',
            payment_reference || null,
            new Date().toISOString(),
            order_id,
            user.brand_id
        ).run();
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Order confirmed',
            order_id: order_id
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Confirm checkout error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to confirm checkout' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}