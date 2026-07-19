// src/api/domains/list.js
export async function listDomains(request, env, user) {
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
        
        const domains = await env.DB.prepare(`
            SELECT * FROM domains 
            WHERE brand_id = ?
            ORDER BY is_primary DESC, created_at ASC
        `).bind(brandId).all();
        
        // Also get the subdomain
        const brand = await env.DB.prepare(`
            SELECT brand_slug FROM brands WHERE brand_id = ?
        `).bind(brandId).first();
        
        const subdomain = `${brand?.brand_slug || 'brand'}.zvakho.co.zw`;
        
        return new Response(JSON.stringify({
            success: true,
            subdomain: subdomain,
            domains: domains.results || [],
            count: (domains.results || []).length
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ List domains error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to list domains' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}