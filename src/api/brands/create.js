// src/api/brands/create.js
import { validateBrandName, validateEmail, validatePhone, slugify } from '../../lib/validators.js';
import { execute, queryOne } from '../../lib/db.js';

export async function createBrand(request, env, user) {
    try {
        console.log('📝 Starting brand creation...');
        console.log('👤 User:', user);
        
        const body = await request.json();
        console.log('📦 Request body:', body);
        
        const { name, email, phone } = body;
        
        // Validate
        console.log('🔍 Validating name...');
        const nameCheck = validateBrandName(name);
        if (!nameCheck.valid) {
            console.log('❌ Name validation failed:', nameCheck.error);
            return new Response(JSON.stringify({ error: nameCheck.error }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('🔍 Validating email...');
        const emailCheck = validateEmail(email);
        if (!emailCheck.valid) {
            console.log('❌ Email validation failed:', emailCheck.error);
            return new Response(JSON.stringify({ error: emailCheck.error }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('🔍 Validating phone...');
        const phoneCheck = validatePhone(phone);
        if (!phoneCheck.valid) {
            console.log('❌ Phone validation failed:', phoneCheck.error);
            return new Response(JSON.stringify({ error: phoneCheck.error }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate slug
        const slug = slugify(name);
        console.log('🔑 Generated slug:', slug);
        
        // Check if slug exists
        console.log('🔍 Checking if brand exists...');
        try {
            const existing = await queryOne(
                env,
                'SELECT brand_id FROM brands WHERE brand_slug = ? AND deleted_at IS NULL',
                [slug]
            );
            console.log('📊 Existing brand check result:', existing);
            
            if (existing) {
                console.log('❌ Brand already exists');
                return new Response(JSON.stringify({ 
                    error: 'Brand name already taken' 
                }), { 
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (dbError) {
            console.log('❌ Database query failed:', dbError);
            return new Response(JSON.stringify({ 
                error: 'Database error: ' + dbError.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create brand
        const brandId = crypto.randomUUID();
        const now = new Date().toISOString();
        console.log('🆕 Creating brand with ID:', brandId);
        
        try {
            console.log('📝 Inserting brand...');
            await execute(env, `
                INSERT INTO brands (
                    brand_id, brand_name, brand_slug, brand_email, brand_phone,
                    store_status, subscription_plan, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'draft', 'launch', ?, ?)
            `, [brandId, name, slug, email || null, phone || null, now, now]);
            console.log('✅ Brand inserted successfully');
        } catch (dbError) {
            console.log('❌ Brand insert failed:', dbError);
            return new Response(JSON.stringify({ 
                error: 'Database insert error: ' + dbError.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update user with brand_id
        console.log('📝 Updating user...');
        try {
            await execute(env, `
                UPDATE users SET brand_id = ?, role = 'admin' WHERE user_id = ?
            `, [brandId, user.user_id]);
            console.log('✅ User updated successfully');
        } catch (dbError) {
            console.log('❌ User update failed:', dbError);
            // Brand was created, so this is a partial failure
            // We'll still return success but note the issue
        }
        
        // Create subscription history
        console.log('📝 Creating subscription history...');
        try {
            await execute(env, `
                INSERT INTO subscription_history (
                    brand_id, plan, status, fee_percentage, max_products, changed_at
                ) VALUES (?, 'launch', 'active', 12, 5, ?)
            `, [brandId, now]);
            console.log('✅ Subscription history created');
        } catch (dbError) {
            console.log('❌ Subscription history failed:', dbError);
            // Non-critical error, continue
        }
        
        // Get the created brand
        console.log('📝 Fetching created brand...');
        try {
            const brand = await queryOne(env, `
                SELECT * FROM brands WHERE brand_id = ?
            `, [brandId]);
            
            console.log('✅ Brand created successfully!');
            
            return new Response(JSON.stringify({
                success: true,
                brand: brand,
                message: 'Brand created successfully!'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (dbError) {
            console.log('❌ Fetch brand failed:', dbError);
            return new Response(JSON.stringify({ 
                error: 'Brand created but couldn\'t fetch it' 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
    } catch (error) {
        console.error('❌ Create brand error:', error);
        console.error('Stack trace:', error.stack);
        return new Response(JSON.stringify({ 
            error: 'Failed to create brand: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}