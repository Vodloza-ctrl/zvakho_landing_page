// src/api/payments/webhook.js
export async function handleWebhook(request, env) {
    try {
        // Get the raw text from Paynow
        const rawBody = await request.text();
        console.log('📥 Webhook received:', rawBody);
        
        // Parse Paynow response (key=value&key2=value2 format)
        const data = parsePaynowResponse(rawBody);
        console.log('📦 Parsed webhook data:', data);
        
        const reference = data.reference || data.payment_reference || '';
        const status = data.status || data.payment_status || '';
        const paynowReference = data.paynowreference || data.transaction_reference || '';
        const amount = parseFloat(data.amount || 0);
        
        if (!reference) {
            console.log('❌ No reference in webhook');
            return new Response('Missing reference', { status: 400 });
        }
        
        // Find the order by payment reference
        const order = await env.DB.prepare(`
            SELECT * FROM orders 
            WHERE payment_reference = ? 
            OR order_id = ?
        `).bind(reference, reference).first();
        
        if (!order) {
            console.log('❌ Order not found for reference:', reference);
            return new Response('Order not found', { status: 404 });
        }
        
        // If already paid, ignore
        if (order.payment_status === 'paid') {
            console.log('✅ Order already paid:', order.order_id);
            return new Response('OK - Already paid', { status: 200 });
        }
        
        // Check if payment is successful
        const isPaid = status.toLowerCase() === 'paid' || 
                       status.toLowerCase() === 'awaiting delivery' ||
                       status.toLowerCase() === 'completed';
        
        if (isPaid) {
            console.log('💰 Payment confirmed for order:', order.order_id);
            
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
                paynowReference || reference,
                status || 'Paid',
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
            
            // ─── AUTO-PROCESS SUBSCRIPTIONS ───
            await processPaidOrder(env, order);
            
            // ─── SEND NOTIFICATIONS ───
            await sendPaymentNotifications(env, order);
            
            return new Response('OK - Payment confirmed', { status: 200 });
        }
        
        // Payment pending or failed
        await env.DB.prepare(`
            UPDATE orders 
            SET paynow_status = ?,
                paynow_error = ?,
                updated_at = ?
            WHERE order_id = ?
        `).bind(
            status || 'Pending',
            data.error || '',
            new Date().toISOString(),
            order.order_id
        ).run();
        
        return new Response('OK - Status updated', { status: 200 });
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return new Response('Error: ' + error.message, { status: 500 });
    }
}

// ────────────────────────────────────────────────
// AUTO-PROCESS PAID ORDER
// ────────────────────────────────────────────────

async function processPaidOrder(env, order) {
    console.log('🔄 Processing paid order:', order.order_id);
    
    // Check if this is a subscription order
    const orderItems = await env.DB.prepare(`
        SELECT * FROM order_items 
        WHERE order_id = ?
    `).bind(order.order_id).all();
    
    for (const item of (orderItems.results || [])) {
        // Check if this is a subscription product
        if (item.product_type === 'subscription' || 
            item.product_name?.toLowerCase().includes('subscription')) {
            
            console.log('🎯 Subscription detected:', item.product_name);
            
            // Get the subscription plan from product metadata
            const product = await env.DB.prepare(`
                SELECT * FROM products 
                WHERE product_id = ?
            `).bind(item.product_id).first();
            
            if (product?.metadata) {
                try {
                    const metadata = JSON.parse(product.metadata);
                    const plan = metadata.subscription_plan;
                    
                    if (plan) {
                        console.log('📋 Upgrading to plan:', plan);
                        await upgradeSubscription(env, order.brand_id, plan);
                    }
                } catch (e) {
                    console.log('⚠️ Failed to parse metadata:', e.message);
                }
            }
        }
    }
}

// ────────────────────────────────────────────────
// UPGRADE SUBSCRIPTION
// ────────────────────────────────────────────────

async function upgradeSubscription(env, brandId, plan) {
    const planDetails = {
        'grow': { fee: 6, max_products: 100 },
        'business': { fee: 3, max_products: -1 },
        'pro': { fee: 1, max_products: -1 }
    };
    
    const details = planDetails[plan];
    if (!details) {
        console.log('❌ Invalid plan:', plan);
        return;
    }
    
    const now = new Date().toISOString();
    
    // Deactivate current subscription
    await env.DB.prepare(`
        UPDATE subscription_history 
        SET status = 'completed'
        WHERE brand_id = ? AND status = 'active'
    `).bind(brandId).run();
    
    // Create new subscription
    await env.DB.prepare(`
        INSERT INTO subscription_history (
            brand_id, plan, status, fee_percentage, max_products, changed_at
        ) VALUES (?, ?, 'active', ?, ?, ?)
    `).bind(
        brandId,
        plan,
        details.fee,
        details.max_products,
        now
    ).run();
    
    console.log('✅ Subscription upgraded to:', plan);
}

// ────────────────────────────────────────────────
// SEND NOTIFICATIONS
// ────────────────────────────────────────────────

async function sendPaymentNotifications(env, order) {
    try {
        console.log('📱 Sending notifications for order:', order.order_id);
        
        // Get brand details
        const brand = await env.DB.prepare(`
            SELECT * FROM brands WHERE brand_id = ?
        `).bind(order.brand_id).first();
        
        // Send WhatsApp notification (via ManyChat)
        if (env.MANYCHAT_API_TOKEN && order.customer_phone) {
            await sendWhatsAppNotification(env, order, brand);
        }
        
        // Add to audit log
        await env.DB.prepare(`
            INSERT INTO audit_logs (
                log_id, brand_id, user_id, action, resource, resource_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            crypto.randomUUID(),
            order.brand_id,
            null,
            'payment_received',
            'order',
            order.order_id,
            new Date().toISOString()
        ).run();
        
        console.log('✅ Notifications sent for order:', order.order_id);
        
    } catch (error) {
        console.error('❌ Notification error:', error);
    }
}

async function sendWhatsAppNotification(env, order, brand) {
    try {
        // Format phone
        let phone = String(order.customer_phone).replace(/\D/g, '');
        if (phone.startsWith('0')) {
            phone = '263' + phone.slice(1);
        }
        if (phone.length < 10) return;
        
        // Check if subscriber exists in ManyChat
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
        
        // Send payment confirmation flow
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
                    { field_name: "order_product", field_value: "Payment Confirmed" },
                    { field_name: "order_reference", field_value: order.order_id },
                    { field_name: "order_amount", field_value: String(order.amount || 0) },
                    { field_name: "artist_name", field_value: brand?.brand_name || "ZVAKHO" }
                ]
            })
        });
        
        console.log('✅ WhatsApp notification sent');
        
    } catch (error) {
        console.error('❌ WhatsApp notification error:', error);
    }
}

// ────────────────────────────────────────────────
// HELPER: Parse Paynow Response
// ────────────────────────────────────────────────

function parsePaynowResponse(text) {
    const result = {};
    if (!text) return result;
    
    // Handle both & and \n separated
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