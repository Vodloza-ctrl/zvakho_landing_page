// src/api/payments/index.js
import { createPayment } from './create.js';
import { handleWebhook } from './webhook.js';
import { getPaymentStatus } from './status.js';
import { confirmPayment } from './confirm.js';

export async function handlePayments(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/payments', '');
    
    // POST /api/payments/create - Create payment
    if (request.method === 'POST' && path === '/create') {
        return createPayment(request, env, user);
    }
    
    // POST /api/payments/webhook - Paynow webhook (no auth required)
    if (request.method === 'POST' && path === '/webhook') {
        return handleWebhook(request, env);
    }
    
    // GET /api/payments/status - Check payment status
    if (request.method === 'GET' && path === '/status') {
        return getPaymentStatus(request, env, user);
    }
    
    // POST /api/payments/confirm - Manual confirm (admin)
    if (request.method === 'POST' && path === '/confirm') {
        return confirmPayment(request, env, user);
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}