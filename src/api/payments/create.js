// src/api/payments/create.js
export async function createPayment(request, env, user) {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get('order_id');
        
        if (!orderId) {
            return new Response(JSON.stringify({ 
                error: 'Order ID required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get order
        const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND brand_id = ?
        `).bind(orderId, user.brand_id).first();
        
        if (!order) {
            return new Response(JSON.stringify({ 
                error: 'Order not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (order.payment_status === 'paid') {
            return new Response(JSON.stringify({
                success: true,
                message: 'Order already paid',
                order_id: orderId,
                payment_status: 'paid'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate payment reference
        const reference = `ZVAKHO_${user.brand_id.slice(0, 8)}_${Date.now()}`;
        
        // Get Paynow credentials from env
        const integrationId = env.PAYNOW_INTEGRATION_ID;
        const integrationKey = env.PAYNOW_INTEGRATION_KEY;
        const baseUrl = env.BASE_URL || 'https://zvakho-payments-v2.yasibomedia.workers.dev';
        
        if (!integrationId || !integrationKey) {
            return new Response(JSON.stringify({ 
                error: 'Payment system not configured' 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get order items
        const items = await env.DB.prepare(`
            SELECT * FROM order_items 
            WHERE order_id = ?
        `).bind(orderId).all();
        
        const productName = items.results?.[0]?.product_name || 'Product';
        
        // Build Paynow fields
        const fields = {
            resulturl: `${baseUrl}/api/payments/webhook`,
            returnurl: `${baseUrl}/api/payments/status?order_id=${orderId}`,
            reference: reference,
            amount: order.amount.toFixed(2),
            id: integrationId,
            additionalinfo: `${productName} - Order ${orderId}`,
            authemail: order.customer_email || '',
            phone: order.customer_phone || '',
            method: 'ecocash',
            status: 'Message'
        };
        
        // Generate hash
        const hash = await generatePaynowHash(fields, integrationKey);
        
        // Send to Paynow
        const paynowResponse = await fetch('https://www.paynow.co.zw/interface/remotetransaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                ...fields,
                hash: hash
            })
        });
        
        const responseText = await paynowResponse.text();
        const parsed = parsePaynowResponse(responseText);
        
        // Update order with payment details
        await env.DB.prepare(`
            UPDATE orders 
            SET payment_reference = ?,
                poll_url = ?,
                browser_url = ?,
                paynow_status = ?,
                paynow_error = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
            reference,
            parsed.pollurl || '',
            parsed.browserurl || '',
            parsed.status || 'pending',
            parsed.error || '',
            new Date().toISOString(),
            orderId
        ).run();
        
        // Save payment reference in order_items
        await env.DB.prepare(`
            UPDATE order_items 
            SET payment_reference = ?
            WHERE order_id = ?
        `).bind(reference, orderId).run();
        
        return new Response(JSON.stringify({
            success: true,
            order_id: orderId,
            reference: reference,
            payment_url: parsed.browserurl || '',
            poll_url: parsed.pollurl || '',
            payment_status: 'pending',
            paynow_status: parsed.status || 'pending'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Create payment error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create payment: ' + error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper: Generate Paynow hash
async function generatePaynowHash(fields, key) {
    let str = '';
    const exclude = ['hash'];
    const sortedKeys = Object.keys(fields).sort();
    
    for (const k of sortedKeys) {
        if (!exclude.includes(k)) {
            str += fields[k];
        }
    }
    str += key;
    
    const buf = await crypto.subtle.digest(
        'SHA-512',
        new TextEncoder().encode(str)
    );
    
    return [...new Uint8Array(buf)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

// Helper: Parse Paynow response
function parsePaynowResponse(text) {
    const result = {};
    if (!text) return result;
    
    text.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (!k) return;
        result[decodeURIComponent(k).toLowerCase()] = decodeURIComponent(v || '');
    });
    
    return result;
}