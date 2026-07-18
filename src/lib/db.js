// Database helper functions
export async function query(env, sql, params = []) {
    try {
        const result = await env.DB.prepare(sql).bind(...params).all();
        return result.results || [];
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

export async function queryOne(env, sql, params = []) {
    try {
        const result = await env.DB.prepare(sql).bind(...params).first();
        return result || null;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

export async function execute(env, sql, params = []) {
    try {
        const result = await env.DB.prepare(sql).bind(...params).run();
        return result;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}
