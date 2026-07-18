// Main router
import { handleTest } from './api/test.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Test endpoint
        if (path === '/api/v2/test' || path === '/api/test') {
            return handleTest(request, env);
        }

        // Health check
        if (path === '/health' || path === '/api/health') {
            return new Response(JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                environment: 'development'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Default response
        return new Response(JSON.stringify({
            error: 'Not found - ZVAKHO v2 endpoint',
            available: ['/api/v2/test', '/api/test', '/health']
        }), { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
