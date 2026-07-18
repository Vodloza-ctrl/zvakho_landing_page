// src/api/brands/simple.js - SUPER SIMPLE APPROACH
// src/api/brands/simple.js
export async function simpleCreateBrand(request, env, user) {
    console.log('🚀 SIMPLE VERSION STARTED');
    
    // 🔍 DEBUG: Check what's in env
    console.log('📋 ENV keys:', Object.keys(env));
    console.log('📋 DB binding exists?', !!env.DB);
    
    // 🔍 DEBUG: Try to list tables directly
    try {
        console.log('🔍 Attempting to list tables...');
        const tables = await env.DB.prepare(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).all();
        console.log('📊 Tables found:', tables.results.map(r => r.name));
    } catch (err) {
        console.log('❌ Failed to list tables:', err.message);
    }
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
        
        // 5. DIRECT DATABASE INSERT - NO HELPER FUNCTIONS
        console.log('💾 Attempting direct insert...');
        
        const insertResult = await env.DB.prepare(`
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
        
        console.log('✅ Insert result:', insertResult);
        
        // 6. DIRECT SELECT
        console.log('🔍 Fetching created brand...');
        
        const brand = await env.DB.prepare(
            'SELECT * FROM brands WHERE brand_id = ?'
        ).bind(brandId).first();
        
        console.log('✅ Brand found:', brand);
        
        // 7. Return success
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
            error: 'Failed: ' + error.message,
            stack: error.stack
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}