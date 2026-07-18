// src/api/products/create.js
export async function createProduct(request, env, user) {
    try {
        // Check if user has a brand
        if (!user.brand_id) {
            return new Response(JSON.stringify({ 
                error: 'You must have a brand to create products' 
            }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const body = await request.json();
        console.log('📦 Creating product:', body);
        
        const { 
            product_name, 
            product_type, 
            price, 
            description,
            currency = 'USD',
            stock = 0,
            main_image_url,
            limited_release = 0,
            preorder_enabled = 0
        } = body;
        
        // Validate
        if (!product_name || product_name.length < 2) {
            return new Response(JSON.stringify({ 
                error: 'Product name must be at least 2 characters' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const validTypes = ['t-shirt', 'hoodie', 'cap', 'tote-bag', 'mug', 'poster'];
        if (!validTypes.includes(product_type)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid product type. Allowed: ' + validTypes.join(', ')
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (!price || price <= 0) {
            return new Response(JSON.stringify({ 
                error: 'Price must be greater than 0' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate SKU
        const sku = `${product_type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        
        // Create product
        const productId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        await env.DB.prepare(`
            INSERT INTO products (
                product_id, brand_id, product_type, product_name, 
                price, currency, stock, description, 
                main_image_url, sku, status, 
                limited_release, preorder_enabled, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)
        `).bind(
            productId,
            user.brand_id,
            product_type,
            product_name,
            price,
            currency,
            stock || 0,
            description || null,
            main_image_url || null,
            sku,
            limited_release ? 1 : 0,
            preorder_enabled ? 1 : 0,
            now,
            now
        ).run();
        
        // Get the created product
        const product = await env.DB.prepare(
            'SELECT * FROM products WHERE product_id = ?'
        ).bind(productId).first();
        
        return new Response(JSON.stringify({
            success: true,
            product: product,
            message: 'Product created successfully!'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Create product error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create product: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}