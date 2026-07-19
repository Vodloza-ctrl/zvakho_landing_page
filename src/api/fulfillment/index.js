// src/api/fulfillment/index.js
import { getFulfillmentQueue } from './queue.js';
import { processOrder } from './process.js';
import { updateFulfillmentStatus } from './update.js';
import { createBatch, getBatches } from './batch.js';
import { generateShippingLabel } from './shipping.js';

export async function handleFulfillment(request, env, user) {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/fulfillment', '');
    
    // GET /api/fulfillment/queue - Get pending orders
    if (request.method === 'GET' && path === '/queue') {
        return getFulfillmentQueue(request, env, user);
    }
    
    // POST /api/fulfillment/process/:order_id - Process order
    if (request.method === 'POST' && path.startsWith('/process/')) {
        const orderId = path.split('/')[2];
        return processOrder(request, env, user, orderId);
    }
    
    // PUT /api/fulfillment/update/:order_id - Update status
    if (request.method === 'PUT' && path.startsWith('/update/')) {
        const orderId = path.split('/')[2];
        return updateFulfillmentStatus(request, env, user, orderId);
    }
    
    // POST /api/fulfillment/batch - Create batch
    if (request.method === 'POST' && path === '/batch') {
        return createBatch(request, env, user);
    }
    
    // GET /api/fulfillment/batches - Get batches
    if (request.method === 'GET' && path === '/batches') {
        return getBatches(request, env, user);
    }
    
    // POST /api/fulfillment/shipping/:order_id - Generate shipping label
    if (request.method === 'POST' && path.startsWith('/shipping/')) {
        const orderId = path.split('/')[2];
        return generateShippingLabel(request, env, user, orderId);
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
    });
}