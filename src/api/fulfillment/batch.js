// src/api/fulfillment/batch.js
export async function createBatch(request, env, user) {
    try {
        const brandId = user.brand_id;
        const body = await request.json();
        const { order_ids, batch_name } = body;
        
        if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
            return new Response(JSON.stringify({
                error: 'At least one order ID required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Verify orders belong to brand
        const placeholders = order_ids.map(() => '?').join(',');
        const orders = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id IN (${placeholders}) AND brand_id = ?
        `).bind(...order_ids, brandId).all();
        
        if ((orders.results || []).length !== order_ids.length) {
            return new Response(JSON.stringify({
                error: 'Some orders not found or not owned by you'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create batch
        const batchId = 'BATCH-' + Date.now().toString(36).toUpperCase();
        const now = new Date().toISOString();
        
        await env.DB.prepare(`
            INSERT INTO batches (
                batch_id, brand_id, batch_name, order_ids, 
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
        `).bind(
            batchId,
            brandId,
            batch_name || `Batch ${new Date().toLocaleDateString()}`,
            JSON.stringify(order_ids),
            now,
            now
        ).run();
        
        // Update orders
        for (const orderId of order_ids) {
            await env.DB.prepare(`
                UPDATE orders 
                SET status = 'batched',
                    fulfilment_data = json_set(
                        COALESCE(fulfilment_data, '{}'),
                        '$.batch_id', ?
                    ),
                    updated_at = ?
                WHERE order_id = ?
            `).bind(batchId, now, orderId).run();
        }
        
        return new Response(JSON.stringify({
            success: true,
            batch_id: batchId,
            batch_name: batch_name || `Batch ${new Date().toLocaleDateString()}`,
            order_count: order_ids.length,
            order_ids: order_ids,
            status: 'pending'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Create batch error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create batch' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function getBatches(request, env, user) {
    try {
        const brandId = user.brand_id;
        
        const batches = await env.DB.prepare(`
            SELECT * FROM batches 
            WHERE brand_id = ?
            ORDER BY created_at DESC
        `).bind(brandId).all();
        
        return new Response(JSON.stringify({
            success: true,
            batches: batches.results || [],
            count: (batches.results || []).length
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Get batches error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get batches' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}