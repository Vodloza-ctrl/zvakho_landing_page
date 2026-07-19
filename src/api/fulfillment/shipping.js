// src/api/fulfillment/shipping.js
export async function generateShippingLabel(request, env, user, orderId) {
    try {
        const brandId = user.brand_id;
        
        const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND brand_id = ?
        `).bind(orderId, brandId).first();
        
        if (!order) {
            return new Response(JSON.stringify({ 
                error: 'Order not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (order.status !== 'ready' && order.status !== 'processing') {
            return new Response(JSON.stringify({
                error: 'Order must be ready or processing for shipping'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate shipping label (simplified)
        const trackingNumber = 'ZVK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        
        await env.DB.prepare(`
            UPDATE orders 
            SET tracking_number = ?,
                shipping_carrier = 'ZVAKHO Express',
                status = 'shipped',
                updated_at = ?
            WHERE order_id = ?
        `).bind(trackingNumber, new Date().toISOString(), orderId).run();
        
        // Send notification
        await sendFulfillmentNotification(env, order, 'shipped');
        
        return new Response(JSON.stringify({
            success: true,
            order_id: orderId,
            tracking_number: trackingNumber,
            carrier: 'ZVAKHO Express',
            message: 'Shipping label generated'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Shipping label error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to generate shipping label' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}