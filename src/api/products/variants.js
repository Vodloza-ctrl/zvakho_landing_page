// src/api/products/variants.js
export async function addVariant(request, env, user, productId) {
    try {
        // Check if product exists
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
        
        const body = await request.json();
        const { 
            color_name, 
            color_hex, 
            size, 
            price_adjustment = 0,
            stock_quantity = 0,
            mockup_url = null
        } = body;
        
        if (!color_name) {
            return new Response(JSON.stringify({ 
                error: 'Color name is required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const variantId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        await env.DB.prepare(`
            INSERT INTO product_variants (
                variant_id, product_id, color_name, color_hex, 
                size, price_adjustment, stock_quantity, mockup_url,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            variantId,
            productId,
            color_name,
            color_hex || null,
            size || null,
            price_adjustment,
            stock_quantity,
            mockup_url,
            now,
            now
        ).run();
        
        const variant = await env.DB.prepare(
            'SELECT * FROM product_variants WHERE variant_id = ?'
        ).bind(variantId).first();
        
        return new Response(JSON.stringify({
            success: true,
            variant: variant,
            message: 'Variant added successfully!'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Add variant error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to add variant' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function updateVariant(request, env, user, productId, variantId) {
    try {
        // Check if variant exists
        const existing = await env.DB.prepare(`
            SELECT * FROM product_variants 
            WHERE variant_id = ? AND product_id = ?
        `).bind(variantId, productId).first();
        
        if (!existing) {
            return new Response(JSON.stringify({ 
                error: 'Variant not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const body = await request.json();
        const updates = [];
        const values = [];
        
        const allowedFields = [
            'color_name', 'color_hex', 'size', 
            'price_adjustment', 'stock_quantity', 'mockup_url'
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
        
        values.push(new Date().toISOString(), variantId);
        
        await env.DB.prepare(`
            UPDATE product_variants 
            SET ${updates.join(', ')}, updated_at = ?
            WHERE variant_id = ?
        `).bind(...values).run();
        
        const variant = await env.DB.prepare(
            'SELECT * FROM product_variants WHERE variant_id = ?'
        ).bind(variantId).first();
        
        return new Response(JSON.stringify({
            success: true,
            variant: variant,
            message: 'Variant updated successfully!'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Update variant error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to update variant' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function deleteVariant(request, env, user, productId, variantId) {
    try {
        const result = await env.DB.prepare(`
            DELETE FROM product_variants 
            WHERE variant_id = ? AND product_id = ?
        `).bind(variantId, productId).run();
        
        if (result.meta.changes === 0) {
            return new Response(JSON.stringify({ 
                error: 'Variant not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Variant deleted successfully'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Delete variant error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete variant' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}