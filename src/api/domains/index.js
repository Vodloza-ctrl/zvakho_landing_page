// src/api/domains/index.js
import { listDomains } from './list.js';
import { createDomain } from './create.js';
import { verifyDomain } from './verify.js';
import { configureDomain } from './configure.js';
import { getDomainStatus } from './status.js';

export async function handleDomains(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/domains', '');
    
    // GET /api/domains - List domains
    if (request.method === 'GET' && (path === '' || path === '/')) {
        return listDomains(request, env, user);
    }
    
    // POST /api/domains - Add domain
    if (request.method === 'POST' && (path === '' || path === '/')) {
        return createDomain(request, env, user);
    }
    
    // POST /api/domains/verify - Verify domain
    if (request.method === 'POST' && path === '/verify') {
        return verifyDomain(request, env, user);
    }
    
    // POST /api/domains/configure - Configure DNS
    if (request.method === 'POST' && path === '/configure') {
        return configureDomain(request, env, user);
    }
    
    // GET /api/domains/status - Check status
    if (request.method === 'GET' && path === '/status') {
        return getDomainStatus(request, env, user);
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}