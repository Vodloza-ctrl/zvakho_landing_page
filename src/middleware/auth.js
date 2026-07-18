// Authentication middleware
export async function authenticate(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    try {
        const token = authHeader.split(' ')[1];
        
        const session = await env.DB.prepare(
            'SELECT * FROM sessions WHERE token = ? AND is_active = 1'
        ).bind(token).first();

        if (!session) return null;

        const user = await env.DB.prepare(`
            SELECT u.*, b.brand_id, b.brand_slug, b.brand_name
            FROM users u
            LEFT JOIN brands b ON u.brand_id = b.brand_id
            WHERE u.user_id = ?
        `).bind(session.user_id).first();

        return user;
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

export async function requireAuth(request, env) {
    const user = await authenticate(request, env);
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    return user;
}

export async function requireBrand(user) {
    if (!user?.brand_id) {
        return new Response(JSON.stringify({ error: 'Brand required' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    return null;
}
