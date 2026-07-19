// src/api/dashboard/index.js
export async function handleDashboard(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/dashboard', '');
    
    if (request.method === 'GET' && (path === '' || path === '/')) {
        return getDashboardStats(request, env, user);
    }
    
    if (request.method === 'GET' && path === '/products') {
        return getProductStats(request, env, user);
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}

async function getDashboardStats(request, env, user) {
    try {
        console.log('📊 Getting dashboard stats for:', user.brand_id);
        
        const brandId = user.brand_id;
        
        if (!brandId) {
            return new Response(JSON.stringify({ 
                error: 'Brand not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get total products
        console.log('📊 Getting product stats...');
        let products = { total: 0, published: 0, draft: 0 };
        try {
            const result = await env.DB.prepare(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
                FROM products WHERE brand_id = ?
            `).bind(brandId).first();
            products = result || { total: 0, published: 0, draft: 0 };
        } catch (err) {
            console.log('⚠️ Products query error:', err.message);
        }
        
        // Get total variants
        console.log('📊 Getting variant stats...');
        let variants = { total: 0 };
        try {
            const result = await env.DB.prepare(`
                SELECT COUNT(*) as total
                FROM product_variants pv
                JOIN products p ON pv.product_id = p.product_id
                WHERE p.brand_id = ?
            `).bind(brandId).first();
            variants = result || { total: 0 };
        } catch (err) {
            console.log('⚠️ Variants query error:', err.message);
        }
        
        // Get total orders (if table exists)
        console.log('📊 Getting order stats...');
        let orders = { total: 0 };
        try {
            const result = await env.DB.prepare(`
                SELECT COUNT(*) as total
                FROM orders WHERE brand_id = ?
            `).bind(brandId).first();
            orders = result || { total: 0 };
        } catch (err) {
            console.log('⚠️ Orders table might not exist:', err.message);
            orders = { total: 0 };
        }
        
        const stats = {
            products: {
                total: products.total || 0,
                published: products.published || 0,
                draft: products.draft || 0
            },
            variants: {
                total: variants.total || 0
            },
            orders: {
                total: orders.total || 0
            }
        };
        
        console.log('📊 Stats:', stats);
        
        return new Response(JSON.stringify({
            success: true,
            stats: stats
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Dashboard error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get dashboard stats: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function getProductStats(request, env, user) {
    try {
        const brandId = user.brand_id;
        
        const stats = await env.DB.prepare(`
            SELECT 
                product_type,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published
            FROM products 
            WHERE brand_id = ?
            GROUP BY product_type
        `).bind(brandId).all();
        
        return new Response(JSON.stringify({
            success: true,
            stats: stats.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Product stats error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get product stats' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}