// src/api/fulfillment/process.js
export async function processOrder(request, env, user, orderId) {
    try {
        const brandId = user.brand_id;
        
        if (!brandId) {
            return new Response(JSON.stringify({ 
                error: 'Brand not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get order
        const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE order_id = ? AND brand_id = ?
        `).bind(orderId, brandId).first();
        
        if (!order) {
            return new Response(JSON.stringify({ 
                error: 'Order not found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (order.payment_status !== 'paid') {
            return new Response(JSON.stringify({ 
                error: 'Order not paid' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get order items
        const items = await env.DB.prepare(`
            SELECT * FROM order_items 
            WHERE order_id = ?
        `).bind(orderId).all();
        
        // Determine production method
        const totalQuantity = items.results?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        let productionMethod = 'dtf'; // Default
        
        if (totalQuantity > 50) {
            productionMethod = 'screen-print';
        } else if (totalQuantity > 20) {
            productionMethod = 'hybrid';
        }
        
        // Update order
        await env.DB.prepare(`
            UPDATE orders 
            SET status = 'processing',
                production_method = ?,
                fulfilment_data = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
            productionMethod,
            JSON.stringify({
                total_quantity: totalQuantity,
                items: items.results || [],
                processed_at: new Date().toISOString()
            }),
            new Date().toISOString(),
            orderId
        ).run();
        
        // Update order items
        await env.DB.prepare(`
            UPDATE order_items 
            SET fulfilment_status = 'processing',
                updated_at = ?
            WHERE order_id = ?
        `).bind(new Date().toISOString(), orderId).run();
        
        // Send notification
        await sendFulfillmentNotification(env, order, 'processing');
        
        return new Response(JSON.stringify({
            success: true,
            order_id: orderId,
            production_method: productionMethod,
            total_quantity: totalQuantity,
            message: `Order processing started using ${productionMethod}`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Process order error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to process order' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ────────────────────────────────────────────────
// SEND FULFILLMENT NOTIFICATION
// ────────────────────────────────────────────────

async function sendFulfillmentNotification(env, order, status) {
    try {
        if (!env.MANYCHAT_API_TOKEN || !order.customer_phone) return;
        
        let phone = String(order.customer_phone).replace(/\D/g, '');
        if (phone.startsWith('0')) {
            phone = '263' + phone.slice(1);
        }
        if (phone.length < 10) return;
        
        const messages = {
            'processing': '🎨 Your order is being prepared! We\'re working on it.',
            'ready': '✅ Your order is ready! We\'ll ship it soon.',
            'shipped': '📦 Your order has been shipped! Tracking: ',
            'delivered': '📬 Your order has been delivered! Enjoy!'
        };
        
        // Send via ManyChat
        const findRes = await fetch(
            `https://api.manychat.com/fb/subscriber/findByPhone?phone=%2B${phone}`,
            {
                headers: {
                    'Authorization': `Bearer ${env.MANYCHAT_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!findRes.ok) return;
        
        const findData = await findRes.json();
        const subscriberId = findData?.data?.id;
        
        if (!subscriberId) return;
        
        await fetch("https://api.manychat.com/fb/sending/sendFlow", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.MANYCHAT_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subscriber_id: subscriberId,
                flow_ns: "content20260531175501_037112",
                data: [
                    { field_name: "order_status", field_value: status },
                    { field_name: "order_message", field_value: messages[status] || 'Your order is being processed.' },
                    { field_name: "order_reference", field_value: order.order_id }
                ]
            })
        });
        
        console.log('✅ Fulfillment notification sent:', status);
        
    } catch (error) {
        console.error('❌ Notification error:', error);
    }
}