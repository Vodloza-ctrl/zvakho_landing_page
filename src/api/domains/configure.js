// src/api/domains/configure.js
export async function configureDomain(request, env, user) {
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
        const { domain_id } = body;
        
        if (!domain_id) {
            return new Response(JSON.stringify({ 
                error: 'Domain ID required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const domain = await env.DB.prepare(`
            SELECT * FROM domains 
            WHERE domain_id = ? AND brand_id = ?
        `).bind(domain_id, brandId).first();
        
        if (!domain) {
            return new Response(JSON.stringify({ 
                error: 'Domain not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (domain.status !== 'verified') {
            return new Response(JSON.stringify({
                error: 'Domain must be verified first',
                status: domain.status
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Configure DNS
        const configResult = await configureDNS(env, domain);
        
        // Update domain status
        await env.DB.prepare(`
            UPDATE domains 
            SET status = 'active',
                dns_records = ?,
                updated_at = ?
            WHERE domain_id = ?
        `).bind(
            JSON.stringify(configResult.records),
            new Date().toISOString(),
            domain_id
        ).run();
        
        // If this is primary, update brand
        if (domain.is_primary) {
            await env.DB.prepare(`
                UPDATE brands 
                SET custom_domain = ?
                WHERE brand_id = ?
            `).bind(domain.domain_name, brandId).run();
        }
        
        return new Response(JSON.stringify({
            success: true,
            domain: {
                ...domain,
                status: 'active'
            },
            dns_records: configResult.records,
            message: 'DNS configured successfully. SSL provisioning in progress...'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Configure domain error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to configure domain' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ────────────────────────────────────────────────
// CONFIGURE DNS USING CLOUDFLARE API
// ────────────────────────────────────────────────

async function configureDNS(env, domain) {
    const records = [];
    
    // Get Cloudflare credentials
    const zoneId = env.CLOUDFLARE_ZONE_ID;
    const apiToken = env.CLOUDFLARE_API_TOKEN;
    const workerUrl = env.WORKER_URL || 'https://zvakho-api-v2.workers.dev';
    
    if (zoneId && apiToken) {
        try {
            // Add A record (if domain uses @)
            await addDNSRecord(env, domain.domain_name, '@', 'A', '192.0.2.1', false, zoneId, apiToken);
            records.push({ type: 'A', name: '@', content: '192.0.2.1' });
            
            // Add CNAME for www
            await addDNSRecord(env, domain.domain_name, 'www', 'CNAME', `${domain.domain_name}`, false, zoneId, apiToken);
            records.push({ type: 'CNAME', name: 'www', content: domain.domain_name });
            
            // Add CNAME for store
            await addDNSRecord(env, domain.domain_name, 'store', 'CNAME', `${domain.domain_name}`, false, zoneId, apiToken);
            records.push({ type: 'CNAME', name: 'store', content: domain.domain_name });
            
            console.log('✅ DNS records added for:', domain.domain_name);
            
        } catch (error) {
            console.error('❌ DNS API error:', error);
            // Fallback to manual instructions
        }
    } else {
        // Fallback: Manual instructions
        records.push({
            type: 'A',
            name: '@',
            content: '192.0.2.1',
            instruction: 'Point A record to your Cloudflare IP'
        });
        records.push({
            type: 'CNAME',
            name: 'www',
            content: domain.domain_name,
            instruction: 'Point www CNAME to your domain'
        });
    }
    
    return { records };
}

async function addDNSRecord(env, domainName, subdomain, type, content, proxied, zoneId, apiToken) {
    const name = subdomain === '@' ? domainName : `${subdomain}.${domainName}`;
    
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: type,
                name: name,
                content: content,
                ttl: 300,
                proxied: proxied || false
            })
        }
    );
    
    const data = await response.json();
    
    if (!data.success) {
        console.warn('⚠️ DNS record creation warning:', data.errors);
    }
    
    return data;
}