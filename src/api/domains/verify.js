// src/api/domains/verify.js
export async function verifyDomain(request, env, user) {
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
        
        // Get domain
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
        
        if (domain.status === 'verified' || domain.status === 'active') {
            return new Response(JSON.stringify({
                success: true,
                domain: domain,
                message: 'Domain already verified'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check TXT record
        const token = domain.verification_token;
        const domainName = domain.domain_name;
        const txtName = `_zvakho-verify.${domainName}`;
        
        // Try to resolve TXT record
        const isVerified = await checkTxtRecord(txtName, token);
        
        if (!isVerified) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Verification failed',
                message: `TXT record not found. Add: ${txtName} = ${token}`,
                status: domain.status
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update domain status
        await env.DB.prepare(`
            UPDATE domains 
            SET status = 'verified',
                verified_at = ?,
                updated_at = ?
            WHERE domain_id = ?
        `).bind(
            new Date().toISOString(),
            new Date().toISOString(),
            domain_id
        ).run();
        
        // Auto-configure DNS
        const configResult = await configureDNS(env, domain);
        
        return new Response(JSON.stringify({
            success: true,
            domain: {
                ...domain,
                status: 'verified'
            },
            dns_configuration: configResult,
            next_step: 'DNS configuration in progress. Check status in 2-5 minutes.'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Verify domain error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to verify domain: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ────────────────────────────────────────────────
// CHECK TXT RECORD
// ────────────────────────────────────────────────

async function checkTxtRecord(txtName, expectedValue) {
    try {
        // Use Cloudflare DNS API or public DNS resolver
        const response = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(txtName)}&type=TXT`,
            {
                headers: {
                    'Accept': 'application/dns-json'
                }
            }
        );
        
        if (!response.ok) return false;
        
        const data = await response.json();
        const answers = data.Answer || [];
        
        for (const answer of answers) {
            if (answer.type === 16) { // TXT record
                // Parse TXT data (comes as a string with quotes)
                const txtData = answer.data.replace(/^"|"$/g, '');
                if (txtData === expectedValue) {
                    return true;
                }
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ TXT check error:', error);
        return false;
    }
}