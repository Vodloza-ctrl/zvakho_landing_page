// src/api/subscriptions/current.js
export async function getCurrentSubscription(request, env, user) {
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
        
        // Get current subscription
        const subscription = await env.DB.prepare(`
            SELECT * FROM subscription_history 
            WHERE brand_id = ? 
            ORDER BY changed_at DESC 
            LIMIT 1
        `).bind(brandId).first();
        
        if (!subscription) {
            // Create default launch plan
            const now = new Date().toISOString();
            await env.DB.prepare(`
                INSERT INTO subscription_history (
                    brand_id, plan, status, fee_percentage, max_products, changed_at
                ) VALUES (?, 'launch', 'active', 12, 5, ?)
            `).bind(brandId, now).run();
            
            return new Response(JSON.stringify({
                success: true,
                subscription: {
                    plan: 'launch',
                    status: 'active',
                    fee_percentage: 12,
                    max_products: 5,
                    is_free: true
                }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get plan details
        const planDetails = {
            'launch': { name: 'Launch', is_free: true },
            'grow': { name: 'Grow', is_free: false },
            'business': { name: 'Business', is_free: false },
            'pro': { name: 'Pro', is_free: false }
        };
        
        return new Response(JSON.stringify({
            success: true,
            subscription: {
                plan: subscription.plan,
                status: subscription.status,
                fee_percentage: subscription.fee_percentage,
                max_products: subscription.max_products,
                is_free: planDetails[subscription.plan]?.is_free || true,
                plan_name: planDetails[subscription.plan]?.name || subscription.plan,
                changed_at: subscription.changed_at
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get subscription error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get subscription' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}