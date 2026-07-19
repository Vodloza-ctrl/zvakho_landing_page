// src/api/domains/status.js
export async function getDomainStatus(request, env, user) {
    try {
        const brandId = user.brand_id;
        const url = new URL(request.url);
        const domainId = url.searchParams.get('domain_id');
        
        if (!brandId) {
            return new Response(JSON.stringify({ 
                error: 'Brand not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        let query = 'SELECT * FROM domains WHERE brand_id = ?';
        const params = [brandId];
        
        if (domainId) {
            query += ' AND domain_id = ?';
            params.push(domainId);
        }
        
        query += ' ORDER BY is_primary DESC, created_at DESC';
        
        const domains = await env.DB.prepare(query).bind(...params).all();
        
        // Check SSL status for each domain
        const enrichedDomains = await Promise.all((domains.results || []).map(async (domain) => {
            const sslStatus = await checkSSL(domain.domain_name);
            return {
                ...domain,
                ssl_status: sslStatus
            };
        }));
        
        return new Response(JSON.stringify({
            success: true,
            domains: enrichedDomains
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Domain status error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get domain status' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function checkSSL(domainName) {
    try {
        const response = await fetch(`https://${domainName}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            return {
                status: 'active',
                valid: true,
                message: 'SSL certificate is valid'
            };
        }
        
        return {
            status: 'pending',
            valid: false,
            message: 'SSL certificate not yet provisioned'
        };
        
    } catch (error) {
        return {
            status: 'pending',
            valid: false,
            message: 'SSL provisioning in progress...'
        };
    }
}