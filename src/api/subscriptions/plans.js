// src/api/subscriptions/plans.js
export async function getPlans(request, env, user) {
    const plans = [
        {
            id: 'launch',
            name: 'Launch',
            price: 0,
            currency: 'USD',
            price_label: 'Free',
            fee_percentage: 12,
            max_products: 5,
            features: [
                '5 products',
                '12% transaction fee',
                'Basic storefront',
                'WhatsApp integration',
                'Paynow payments'
            ],
            limits: {
                products: 5,
                variants_per_product: 10,
                storage_mb: 50
            },
            is_free: true,
            popular: false
        },
        {
            id: 'grow',
            name: 'Grow',
            price: 5,
            currency: 'USD',
            price_label: '$5/mo',
            fee_percentage: 6,
            max_products: 100,
            features: [
                '100 products',
                '6% transaction fee',
                'Custom storefront',
                'WhatsApp integration',
                'Paynow payments',
                'Advanced analytics',
                'Email support'
            ],
            limits: {
                products: 100,
                variants_per_product: 20,
                storage_mb: 500
            },
            is_free: false,
            popular: true
        },
        {
            id: 'business',
            name: 'Business',
            price: 15,
            currency: 'USD',
            price_label: '$15/mo',
            fee_percentage: 3,
            max_products: -1, // Unlimited
            features: [
                'Unlimited products',
                '3% transaction fee',
                'Custom storefront',
                'Custom domain support',
                'WhatsApp integration',
                'Paynow payments',
                'Advanced analytics',
                'Priority support',
                'API access'
            ],
            limits: {
                products: -1,
                variants_per_product: 50,
                storage_mb: 2000
            },
            is_free: false,
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 39,
            currency: 'USD',
            price_label: '$39/mo',
            fee_percentage: 1,
            max_products: -1, // Unlimited
            features: [
                'Unlimited products',
                '1% transaction fee',
                'White label storefront',
                'Custom domain support',
                'AI design generation',
                'WhatsApp integration',
                'Paynow payments',
                'Advanced analytics',
                'Priority support',
                'API access',
                'Team accounts'
            ],
            limits: {
                products: -1,
                variants_per_product: 100,
                storage_mb: 10000
            },
            is_free: false,
            popular: false
        }
    ];
    
    return new Response(JSON.stringify({
        success: true,
        plans: plans
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}