// src/api/subscriptions/create.js
export async function createSubscription(request, env, user) {
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
        
        const body = await request.json();
        const { plan } = body;
        
        const validPlans = ['launch', 'grow', 'business', 'pro'];
        if (!validPlans.includes(plan)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid plan. Must be one of: ' + validPlans.join(', ')
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const planDetails = {
            'launch': { fee: 12, max_products: 5, price: 0 },
            'grow': { fee: 6, max_products: 100, price: 5 },
            'business': { fee: 3, max_products: -1, price: 15 },
            'pro': { fee: 1, max_products: -1, price: 39 }
        };
        
        // Check if current plan is the same
        const current = await env.DB.prepare(`
            SELECT plan FROM subscription_history 
            WHERE brand_id = ? 
            ORDER BY changed_at DESC 
            LIMIT 1
        `).bind(brandId).first();
        
        if (current?.plan === plan) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Already on this plan',
                subscription: {
                    plan: plan,
                    status: 'active'
                }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // For paid plans, create payment
        const details = planDetails[plan];
        if (details.price > 0) {
            // Payment needed - redirect to payment flow
            return new Response(JSON.stringify({
                success: false,
                requires_payment: true,
                plan: plan,
                amount: details.price,
                currency: 'USD',
                message: 'Payment required to upgrade',
                payment_url: `/api/checkout/subscription?plan=${plan}`
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Free plan - update directly
        const now = new Date().toISOString();
        await env.DB.prepare(`
            INSERT INTO subscription_history (
                brand_id, plan, status, fee_percentage, max_products, changed_at
            ) VALUES (?, ?, 'active', ?, ?, ?)
        `).bind(brandId, plan, details.fee, details.max_products, now).run();
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Subscription updated successfully',
            subscription: {
                plan: plan,
                status: 'active',
                fee_percentage: details.fee,
                max_products: details.max_products
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Create subscription error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to create subscription' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}