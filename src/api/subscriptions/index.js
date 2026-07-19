// src/api/subscriptions/index.js
import { getPlans } from './plans.js';
import { getCurrentSubscription } from './current.js';
import { createSubscription } from './create.js';
import { cancelSubscription } from './cancel.js';

export async function handleSubscriptions(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/subscriptions', '');
    
    // GET /api/subscriptions/plans - Get all plans
    if (request.method === 'GET' && path === '/plans') {
        return getPlans(request, env, user);
    }
    
    // GET /api/subscriptions/current - Get current subscription
    if (request.method === 'GET' && path === '/current') {
        return getCurrentSubscription(request, env, user);
    }
    
    // POST /api/subscriptions/create - Create/upgrade subscription
    if (request.method === 'POST' && path === '/create') {
        return createSubscription(request, env, user);
    }
    
    // POST /api/subscriptions/cancel - Cancel subscription
    if (request.method === 'POST' && path === '/cancel') {
        return cancelSubscription(request, env, user);
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}