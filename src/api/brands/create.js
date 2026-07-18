// src/api/brands/create.js
import { validateBrandName, validateEmail, validatePhone, slugify } from '../../lib/validators.js';
import { execute, queryOne } from '../../lib/db.js';

export async function createBrand(request, env, user) {
    try {
        const body = await request.json();
        const { name, email, phone } = body;
        
        // Validate
        const nameCheck = validateBrandName(name);
        if (!nameCheck.valid) {
            return new Response(JSON.stringify({ error: nameCheck.error }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
            return new Response(JSON.stringify({ error: emailCheck.error }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const phoneCheck = validatePhone(phone);
        if (!phoneCheck.valid) {
            return new Response(JSON.stringify({ error: phoneCheck.error }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate slug
        const slug = slugify(name);
        
        // Check if slug exists
        const existing = await queryOne(
            env,
            'SELECT brand_id FROM brands WHERE brand_slug = ? AND deleted_at IS NULL',
            [slug]
        );
        
        if (existing) {
            return new Response(JSON.stringify({ 
                error: 'Brand name already taken' 
            }), { 
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create brand
        const brandId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        await execute(env, `
            INSERT INTO brands (
                brand_id, brand_name, brand_slug, brand_email, brand_phone,
                store_status, subscription_plan, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'draft', 'launch', ?, ?)
        `, [brandId, name, slug, email || null, phone || null, now, now]);
        
        // Update user with brand_id
        await execute(env, `
            UPDATE users SET brand_id = ?, role = 'admin' WHERE user_id = ?
        `, [brandId, user.user_id]);
        
        // Create subscription history
        await execute(env, `
            INSERT INTO subscription_history (
                brand_id, plan, status, fee_percentage, max_products, changed_at
            ) VALUES (?, 'launch', 'active', 12, 5, ?)
        `, [brandId, now]);
        
        // Get the created brand
        const brand = await queryOne(env, `
            SELECT * FROM brands WHERE brand_id = ?
        `, [brandId]);
        
        return new Response(JSON.stringify({
            success: true,
            brand: brand,
            message: 'Brand created successfully!'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Create brand error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create brand' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}