// src/api/subscriptions/cancel.js
export async function cancelSubscription(request, env, user) {
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
        const { reason } = body;
        
        // Get current subscription
        const current = await env.DB.prepare(`
            SELECT * FROM subscription_history 
            WHERE brand_id = ? 
            ORDER BY changed_at DESC 
            LIMIT 1
        `).bind(brandId).first();
        
        if (!current) {
            return new Response(JSON.stringify({ 
                error: 'No subscription found' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (current.plan === 'launch') {
            return new Response(JSON.stringify({ 
                error: 'Cannot cancel free plan' 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Update status to cancelled
        await env.DB.prepare(`
            UPDATE subscription_history 
            SET status = 'cancelled'
            WHERE brand_id = ? AND plan = ? AND status = 'active'
        `).bind(brandId, current.plan).run();
        
        // Create launch plan as fallback
        const now = new Date().toISOString();
        await env.DB.prepare(`
            INSERT INTO subscription_history (
                brand_id, plan, status, fee_percentage, max_products, changed_at
            ) VALUES (?, 'launch', 'active', 12, 5, ?)
        `).bind(brandId, now).run();
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Subscription cancelled. Downgraded to Launch plan.',
            new_plan: 'launch'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Cancel subscription error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to cancel subscription' 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}