// src/api/checkout/index.js
import { createCheckout } from './create.js';
import { confirmCheckout } from './confirm.js';

export async function handleCheckout(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/checkout', '');
    
    // POST /api/checkout/create - Create checkout
    if (request.method === 'POST' && path === '/create') {
        return createCheckout(request, env, user);
    }
    
    // POST /api/checkout/confirm - Confirm checkout
    if (request.method === 'POST' && path === '/confirm') {
        return confirmCheckout(request, env, user);
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}