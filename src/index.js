// src/index.js

import { handleTest } from './api/test.js';
import { handleBrands } from './api/brands/index.js';
import { handleProducts } from './api/products/index.js';
import { handleDashboard } from './api/dashboard/index.js';
import { handleSubscriptions } from './api/subscriptions/index.js';
import { handleCheckout } from './api/checkout/index.js';
import { handlePayments } from './api/payments/index.js';
import { handleDomains } from './api/domains/index.js';
import { handleFulfillment } from './api/fulfillment/index.js';
import { requireAuth } from './middleware/auth.js';
import { startPoller } from './services/poller.js';

export default {
    async fetch(request, env) {
        // Start poller once
        if (!globalThis._pollerStarted) {
            globalThis._pollerStarted = true;
            await startPoller(env);
        }

        const url = new URL(request.url);
        const path = url.pathname;

        // Test endpoint (no auth required)
        if (path === '/api/v2/test' || path === '/api/test') {
            return handleTest(request, env);
        }

        // Health check (no auth required)
        if (path === '/health' || path === '/api/health') {
            return new Response(
                JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    environment: 'development'
                }),
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // Brand endpoints (require auth)
        if (path.startsWith('/api/brands')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handleBrands(request, env, user);
        }

        // Product endpoints (require auth)
        if (path.startsWith('/api/products')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handleProducts(request, env, user);
        }

        // Dashboard endpoints (require auth)
        if (path.startsWith('/api/dashboard')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handleDashboard(request, env, user);
        }

        // Subscriptions endpoints (require auth)
        if (path.startsWith('/api/subscriptions')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handleSubscriptions(request, env, user);
        }

        // Checkout endpoints (require auth)
        if (path.startsWith('/api/checkout')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handleCheckout(request, env, user);
        }

        // Payments endpoints
        if (path.startsWith('/api/payments')) {
            // Webhook doesn't need auth
            if (path === '/api/payments/webhook') {
                return handlePayments(request, env, null);
            }

            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handlePayments(request, env, user);
        }

        // Domains endpoints (require auth)
        if (path.startsWith('/api/domains')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handleDomains(request, env, user);
        }

        // Fulfillment endpoints (require auth)
        if (path.startsWith('/api/fulfillment')) {
            const user = await requireAuth(request, env);
            if (user instanceof Response) return user;

            return handleFulfillment(request, env, user);
        }

        // Default response
        return new Response(
            JSON.stringify({
                error: 'Not found - ZVAKHO v2 endpoint',
                available: [
                    '/api/v2/test',
                    '/api/health',
                    '/api/brands',
                    '/api/products',
                    '/api/dashboard',
                    '/api/subscriptions',
                    '/api/checkout',
                    '/api/payments',
                    '/api/domains',
                    '/api/fulfillment'
                ]
            }),
            {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};