// src/api/products/list.js
export async function listProducts(request, env, user) {
    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status') || 'all';
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const offset = parseInt(url.searchParams.get('offset')) || 0;
        
        let query = `
            SELECT * FROM products 
            WHERE brand_id = ?
        `;
        const params = [user.brand_id];
        
        if (status !== 'all') {
            query += ` AND status = ?`;
            params.push(status);
        }
        
        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        const products = await env.DB.prepare(query).bind(...params).all();
        
        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total FROM products 
            WHERE brand_id = ?
        `;
        const countParams = [user.brand_id];
        
        if (status !== 'all') {
            countQuery += ` AND status = ?`;
            countParams.push(status);
        }
        
        const total = await env.DB.prepare(countQuery).bind(...countParams).first();
        
        return new Response(JSON.stringify({
            success: true,
            products: products.results,
            pagination: {
                total: total?.total || 0,
                limit: limit,
                offset: offset
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ List products error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to list products' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}