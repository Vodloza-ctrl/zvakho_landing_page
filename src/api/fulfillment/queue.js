// src/api/fulfillment/queue.js
export async function getFulfillmentQueue(request, env, user) {
    try {
        const brandId = user.brand_id;
        
        if (!brandId) {
            return new Response(JSON.stringify({ 
                error: 'Brand not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get orders ready for fulfillment
        const orders = await env.DB.prepare(`
            SELECT 
                o.*,
                GROUP_CONCAT(oi.product_name) as items,
                SUM(oi.quantity) as total_items
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.order_id
            WHERE o.brand_id = ? 
            AND o.payment_status = 'paid'
            AND o.status != 'delivered'
            AND o.status != 'cancelled'
            GROUP BY o.order_id
            ORDER BY o.paid_at ASC
            LIMIT 50
        `).bind(brandId).all();
        
        // Count by status
        const counts = await env.DB.prepare(`
            SELECT 
                status,
                COUNT(*) as count
            FROM orders
            WHERE brand_id = ? AND payment_status = 'paid'
            GROUP BY status
        `).bind(brandId).all();
        
        const statusCounts = {};
        for (const row of (counts.results || [])) {
            statusCounts[row.status] = row.count;
        }
        
        return new Response(JSON.stringify({
            success: true,
            queue: orders.results || [],
            summary: {
                pending: statusCounts['pending'] || 0,
                processing: statusCounts['processing'] || 0,
                ready: statusCounts['ready'] || 0,
                shipped: statusCounts['shipped'] || 0,
                delivered: statusCounts['delivered'] || 0,
                total: (orders.results || []).length
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Queue error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get fulfillment queue' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}