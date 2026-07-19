// src/api/domains/create.js
export async function createDomain(request, env, user) {
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
        
        // Check subscription allows custom domain
        const subscription = await env.DB.prepare(`
            SELECT * FROM subscription_history 
            WHERE brand_id = ? AND status = 'active'
            ORDER BY changed_at DESC LIMIT 1
        `).bind(brandId).first();
        
        const allowedPlans = ['business', 'pro'];
        if (!allowedPlans.includes(subscription?.plan)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Custom domains require Business or Pro plan',
                current_plan: subscription?.plan || 'launch',
                upgrade_required: true
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const body = await request.json();
        const { domain_name, is_primary = false } = body;
        
        if (!domain_name) {
            return new Response(JSON.stringify({ 
                error: 'Domain name required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Clean domain
        const cleanDomain = domain_name.trim().toLowerCase().replace(/^https?:\/\//, '');
        
        // Check if already exists
        const existing = await env.DB.prepare(`
            SELECT * FROM domains 
            WHERE domain_name = ? AND brand_id = ?
        `).bind(cleanDomain, brandId).first();
        
        if (existing) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Domain already added',
                status: existing.status
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate verification token
        const verificationToken = crypto.randomUUID().replace(/-/g, '');
        
        // Create domain record
        const domainId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        await env.DB.prepare(`
            INSERT INTO domains (
                domain_id, brand_id, domain_name, status, 
                verification_token, is_primary, created_at, updated_at
            ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
        `).bind(
            domainId,
            brandId,
            cleanDomain,
            verificationToken,
            is_primary ? 1 : 0,
            now,
            now
        ).run();
        
        return new Response(JSON.stringify({
            success: true,
            domain: {
                domain_id: domainId,
                domain_name: cleanDomain,
                status: 'pending',
                verification_token: verificationToken
            },
            verification: {
                type: 'TXT',
                name: `_zvakho-verify.${cleanDomain}`,
                value: verificationToken,
                instructions: `Add this TXT record to your DNS: _zvakho-verify.${cleanDomain} = ${verificationToken}`
            },
            next_step: 'Add the TXT record to your DNS, then call /api/domains/verify'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Create domain error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to add domain' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}