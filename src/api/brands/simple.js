// src/api/brands/simple.js - SUPER SIMPLE APPROACH
export async function simpleCreateBrand(request, env, user) {
    console.log('🚀 SIMPLE VERSION STARTED');
    console.log('👤 User:', user);
    
    try {
        // 1. Get the request body
        const body = await request.json();
        console.log('📦 Body:', body);
        
        const { name, email, phone } = body;
        
        // 2. Validate
        if (!name || name.length < 2) {
            return new Response(JSON.stringify({ 
                error: 'Name too short' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // 3. Generate slug
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
        console.log('🔑 Slug:', slug);
        
        // 4. Generate IDs
        const brandId = crypto.randomUUID();
        const now = new Date().toISOString();
        console.log('🆔 Brand ID:', brandId);
        
        // 5. DIRECT DATABASE INSERT
        console.log('💾 Attempting direct insert...');
        
        await env.DB.prepare(`
            INSERT INTO brands (
                brand_id, brand_name, brand_slug, brand_email, brand_phone,
                store_status, subscription_plan, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'draft', 'launch', ?, ?)
        `).bind(
            brandId, 
            name, 
            slug, 
            email || null, 
            phone || null, 
            now, 
            now
        ).run();
        
        console.log('✅ Insert successful');
        
        // 6. Link user to brand
        if (user && user.user_id) {
            console.log('🔗 Linking user to brand...');
            await env.DB.prepare(`
                UPDATE users 
                SET brand_id = ?, role = 'admin' 
                WHERE user_id = ?
            `).bind(brandId, user.user_id).run();
            console.log('✅ User linked');
        }
        
        // 7. Get the created brand
        console.log('🔍 Fetching created brand...');
        const brand = await env.DB.prepare(
            'SELECT * FROM brands WHERE brand_id = ?'
        ).bind(brandId).first();
        
        console.log('✅ Brand found:', brand);
        
        // 8. Return success
        return new Response(JSON.stringify({
            success: true,
            brand: brand,
            message: 'Brand created successfully!'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ ERROR:', error);
        console.error('❌ STACK:', error.stack);
        
        return new Response(JSON.stringify({
            error: 'Failed: ' + error.message
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}