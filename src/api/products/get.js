// src/api/products/get.js
export async function getProduct(request, env, user, productId) {
    try {
        console.log('🔍 Getting product:', productId);
        console.log('👤 User:', user);
        console.log('🏷️ Brand ID:', user.brand_id);
        
        // First, check if product exists at all (without brand filter)
        const allProducts = await env.DB.prepare(`
            SELECT * FROM products WHERE product_id = ?
        `).bind(productId).first();
        
        console.log('📦 Product in DB:', allProducts);
        
        if (!allProducts) {
            return new Response(JSON.stringify({ 
                error: 'Product not found in database' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if product belongs to user's brand
        const product = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ?
        `).bind(productId, user.brand_id).first();
        
        if (!product) {
            console.log('❌ Product exists but brand_id mismatch');
            console.log('Product brand_id:', allProducts.brand_id);
            console.log('User brand_id:', user.brand_id);
            
            return new Response(JSON.stringify({ 
                error: 'Product not found for your brand',
                debug: {
                    productBrandId: allProducts.brand_id,
                    userBrandId: user.brand_id
                }
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
            error: 'Failed to get product: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}