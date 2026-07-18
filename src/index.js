// src/index.js - Main Router (FULL VERSION)
import { handleTest } from './api/test.js';
import { handleBrands } from './api/brands/index.js';
import { requireAuth } from './middleware/auth.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Test endpoint (no auth required)
        if (path === '/api/v2/test' || path === '/api/test') {
            return handleTest(request, env);
        }

        // Health check (no auth required)
        if (path === '/health' || path === '/api/health') {
            return new Response(JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                environment: 'development'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Brand endpoints (require auth)
        if (path.startsWith('/api/brands')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;
            return handleBrands(request, env, user);
        }

        // Default response
        return new Response(JSON.stringify({
            error: 'Not found - ZVAKHO v2 endpoint',
            available: [
                '/api/v2/test',
                '/api/test',
                '/health',
                '/api/brands (POST, GET)',
                '/api/brands/:id (GET, PUT)'
            ]
        }), { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};