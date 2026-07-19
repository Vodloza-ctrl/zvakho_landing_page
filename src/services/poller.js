// src/services/poller.js - Automatic payment status checker

export async function startPoller(env) {
    console.log('🔄 Starting payment poller...');
    
    // Poll every 30 seconds
    setInterval(async () => {
        try {
            await checkPendingPayments(env);
        } catch (error) {
            console.error('❌ Poller error:', error);
        }
    }, 30000); // 30 seconds
    
    console.log('✅ Payment poller started');
}

async function checkPendingPayments(env) {
    // Get orders that are pending payment
    const pendingOrders = await env.DB.prepare(`
        SELECT * FROM orders 
        WHERE payment_status = 'pending' 
        AND poll_url IS NOT NULL 
        AND poll_url != ''
        ORDER BY created_at DESC
        LIMIT 50
    `).all();
    
    if ((pendingOrders.results || []).length === 0) {
        return;
    }
    
    console.log(`🔍 Checking ${pendingOrders.results.length} pending orders...`);
    
    for (const order of (pendingOrders.results || [])) {
        try {
            await checkPaymentStatus(env, order);
        } catch (error) {
            console.error(`❌ Error checking order ${order.order_id}:`, error.message);
        }
    }
}

async function checkPaymentStatus(env, order) {
    if (!order.poll_url) return;
    
    const response = await fetch(order.poll_url);
    const text = await response.text();
    const parsed = parsePaynowResponse(text);
    
    const status = String(parsed.status || '').toLowerCase();
    const isPaid = status === 'paid' || status === 'awaiting delivery';
    
    if (isPaid) {
        console.log(`💰 Auto-poller: Payment confirmed for ${order.order_id}`);
        
        // Update order
        await env.DB.prepare(`
            UPDATE orders 
            SET payment_status = 'paid',
                paynow_status = ?,
                paynow_reference = ?,
                paid_at = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
            parsed.status || 'Paid',
            parsed.paynowreference || parsed.reference || '',
            new Date().toISOString(),
            new Date().toISOString(),
            order.order_id
        ).run();
        
        // Update order items
        await env.DB.prepare(`
            UPDATE order_items 
            SET fulfilment_status = 'processing',
                updated_at = ?
            WHERE order_id = ?
        `).bind(new Date().toISOString(), order.order_id).run();
        
        // Process the order
        await processPaidOrder(env, order);
        await sendPaymentNotifications(env, order);
    }
}

function parsePaynowResponse(text) {
    const result = {};
    if (!text) return result;
    const pairs = text.split(/[&\n]/);
    for (const pair of pairs) {
        const parts = pair.split('=');
        if (parts.length >= 2) {
            const key = decodeURIComponent(parts[0].trim());
            const value = decodeURIComponent(parts.slice(1).join('=').trim());
            result[key] = value;
        }
    }
    return result;
}

// Copy processPaidOrder and sendPaymentNotifications from webhook.js
// Or import them if you create a shared service