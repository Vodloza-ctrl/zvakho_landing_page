// Test endpoint
export async function handleTest(request, env) {
    return new Response(JSON.stringify({
        success: true,
        message: 'ZVAKHO Rebuild API is working!',
        timestamp: new Date().toISOString(),
        version: '2.0.0-dev'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}