// src/api/products/get.js
export async function getProduct(request, env, user, productId) {
    try {
        const product = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ?
        `).bind(productId, user.brand_id).first();
        
        if (!product) {
            return new Response(JSON.stringify({ 
                error: 'Product not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get variants
        const variants = await env.DB.prepare(`
            SELECT * FROM product_variants 
            WHERE product_id = ?
            ORDER BY color_name, size
        `).bind(productId).all();
        
        return new Response(JSON.stringify({
            success: true,
            product: product,
            variants: variants.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Get product error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get product' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}