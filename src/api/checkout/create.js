// src/api/checkout/create.js
export async function createCheckout(request, env, user) {
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
        
        const body = await request.json();
        const { 
            product_id, 
            variant_id, 
            quantity = 1,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address
        } = body;
        
        if (!product_id) {
            return new Response(JSON.stringify({ 
                error: 'Product ID required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get product
        const product = await env.DB.prepare(`
            SELECT * FROM products 
            WHERE product_id = ? AND brand_id = ? AND status != 'archived'
        `).bind(product_id, brandId).first();
        
        if (!product) {
            return new Response(JSON.stringify({ 
                error: 'Product not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        let unit_price = product.price;
        let variant = null;
        
        if (variant_id) {
            variant = await env.DB.prepare(`
                SELECT * FROM product_variants 
                WHERE variant_id = ? AND product_id = ?
            `).bind(variant_id, product_id).first();
            
            if (variant) {
                unit_price += (variant.price_adjustment || 0);
            }
        }
        
        const total_amount = unit_price * quantity;
        
        // Create order
        const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
        const now = new Date().toISOString();
        
        await env.DB.prepare(`
            INSERT INTO orders (
                order_id, brand_id, order_number, customer_name, customer_email,
                customer_phone, shipping_address, amount, currency,
                status, payment_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)
        `).bind(
            orderId,
            brandId,
            orderId,
            customer_name || null,
            customer_email || null,
            customer_phone || null,
            shipping_address || null,
            total_amount,
            product.currency || 'USD',
            now,
            now
        ).run();
        
        // Add order items - INCLUDING ALL REQUIRED FIELDS
        await env.DB.prepare(`
            INSERT INTO order_items (
                item_id, order_id, product_id, artist_id, 
                product_name, product_type, quantity, 
                unit_price, line_total, brand_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            crypto.randomUUID(),
            orderId,
            product_id,
            brandId,  // artist_id (use brand_id)
            product.product_name,
            product.product_type,
            quantity,
            unit_price,
            total_amount,  // line_total
            brandId,
            now
        ).run();
        
        return new Response(JSON.stringify({
            success: true,
            order: {
                order_id: orderId,
                total_amount: total_amount,
                currency: product.currency || 'USD',
                items: [
                    {
                        product_id: product_id,
                        product_name: product.product_name,
                        quantity: quantity,
                        unit_price: unit_price,
                        total: total_amount,
                        variant: variant
                    }
                ]
            },
            payment_url: `/api/payments/create?order_id=${orderId}`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Create checkout error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create checkout: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}