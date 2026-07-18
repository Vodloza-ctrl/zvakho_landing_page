// src/api/products/update.js
export async function updateProduct(request, env, user, productId) {
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
        
        const body = await request.json();
        const updates = [];
        const values = [];
        
        const allowedFields = [
            'product_name', 'product_type', 'price', 'currency', 
            'stock', 'description', 'main_image_url', 'status',
            'limited_release', 'preorder_enabled', 'preorder_close_date'
        ];
        
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(body[field]);
            }
        }
        
        if (updates.length === 0) {
            return new Response(JSON.stringify({ 
                error: 'No fields to update' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        values.push(new Date().toISOString(), productId);
        
        await env.DB.prepare(`
            UPDATE products 
            SET ${updates.join(', ')}, updated_at = ?
            WHERE product_id = ?
        `).bind(...values).run();
        
        const product = await env.DB.prepare(
            'SELECT * FROM products WHERE product_id = ?'
        ).bind(productId).first();
        
        return new Response(JSON.stringify({
            success: true,
            product: product,
            message: 'Product updated successfully!'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Update product error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update product' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}