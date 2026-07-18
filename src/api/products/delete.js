// src/api/products/delete.js
export async function deleteProduct(request, env, user, productId) {
    try {
        // Check if product exists
        const existing = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ?
        `).bind(productId, user.brand_id).first();
        
        if (!existing) {
            return new Response(JSON.stringify({ 
                error: 'Product not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Soft delete
        await env.DB.prepare(`
            UPDATE products 
            SET status = 'archived', updated_at = ?
            WHERE product_id = ?
        `).bind(new Date().toISOString(), productId).run();
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Product archived successfully'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Delete product error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete product' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}