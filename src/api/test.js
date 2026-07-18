// src/api/test.js
export async function handleTest(request, env) {
    // Test database connection
    try {
        const result = await env.DB.prepare('SELECT 1 as test').first();
        return new Response(JSON.stringify({
            success: true,
            message: 'ZVAKHO Rebuild API is working!',
            timestamp: new Date().toISOString(),
            version: '2.0.0-dev',
            dbConnected: !!result,
            dbTest: result
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            message: 'Database connection failed'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}