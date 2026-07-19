// src/api/fulfillment/update.js
export async function updateFulfillmentStatus(request, env, user, orderId) {
    try {
        const brandId = user.brand_id;
        const body = await request.json();
        const { status, tracking_number, shipping_carrier } = body;
        
        const allowedStatuses = ['pending', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'];
        
        if (!status || !allowedStatuses.includes(status)) {
            return new Response(JSON.stringify({
                error: 'Invalid status',
                allowed: allowedStatuses
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update order
        const updates = ['status = ?', 'updated_at = ?'];
        const values = [status, new Date().toISOString()];
        
        if (tracking_number) {
            updates.push('tracking_number = ?');
            values.push(tracking_number);
        }
        
        if (shipping_carrier) {
            updates.push('shipping_carrier = ?');
            values.push(shipping_carrier);
        }
        
        if (status === 'delivered') {
            updates.push('delivered_at = ?');
            values.push(new Date().toISOString());
        }
        
        values.push(orderId);
        
        await env.DB.prepare(`
            UPDATE orders 
            SET ${updates.join(', ')}
            WHERE order_id = ? AND brand_id = ?
        `).bind(...values, brandId).run();
        
        // Update order items if delivered
        if (status === 'delivered') {
            await env.DB.prepare(`
                UPDATE order_items 
                SET fulfilment_status = 'delivered',
                    updated_at = ?
                WHERE order_id = ?
            `).bind(new Date().toISOString(), orderId).run();
        }
        
        // Send notification
        const order = await env.DB.prepare(`
            SELECT * FROM orders WHERE order_id = ?
        `).bind(orderId).first();
        
        if (order) {
            await sendFulfillmentNotification(env, order, status);
        }
        
        return new Response(JSON.stringify({
            success: true,
            order_id: orderId,
            status: status,
            message: `Order status updated to ${status}`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Update status error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update status' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}