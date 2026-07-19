// src/api/payments/status.js
export async function getPaymentStatus(request, env, user) {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get('order_id');
        const reference = url.searchParams.get('reference');
        
        if (!orderId && !reference) {
            return new Response(JSON.stringify({ 
                error: 'Order ID or reference required' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        let order;
        
        if (orderId) {
            order = await env.DB.prepare(`
                SELECT * FROM orders 
                WHERE order_id = ? AND brand_id = ?
            `).bind(orderId, user.brand_id).first();
        } else {
            order = await env.DB.prepare(`
                SELECT * FROM orders 
                WHERE payment_reference = ? AND brand_id = ?
            `).bind(reference, user.brand_id).first();
        }
        
        if (!order) {
            return new Response(JSON.stringify({ 
                error: 'Order not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // If already paid, return
        if (order.payment_status === 'paid') {
            return new Response(JSON.stringify({
                success: true,
                order_id: order.order_id,
                payment_status: 'paid',
                paid_at: order.paid_at
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Poll Paynow if we have a poll_url
        if (order.poll_url) {
            try {
                const pollRes = await fetch(order.poll_url);
                const pollText = await pollRes.text();
                const parsed = parsePaynowResponse(pollText);
                
                if (parsed.status?.toLowerCase() === 'paid' || 
                    parsed.status?.toLowerCase() === 'awaiting delivery') {
                    
                    // Update order
                    await env.DB.prepare(`
                        UPDATE orders 
                        SET payment_status = 'paid',
                            paynow_reference = ?,
                            paynow_status = ?,
                            paid_at = ?,
                            updated_at = ?
                        WHERE order_id = ?
                    `).bind(
                        parsed.paynowreference || parsed.reference || '',
                        parsed.status || 'Paid',
                        new Date().toISOString(),
                        new Date().toISOString(),
                        order.order_id
                    ).run();
                    
                    return new Response(JSON.stringify({
                        success: true,
                        order_id: order.order_id,
                        payment_status: 'paid',
                        paynow_status: parsed.status
                    }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch (err) {
                console.log('Poll error:', err.message);
            }
        }
        
        return new Response(JSON.stringify({
            success: true,
            order_id: order.order_id,
            payment_status: 'pending',
            paynow_status: order.paynow_status || 'pending'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Status check error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to check status' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

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