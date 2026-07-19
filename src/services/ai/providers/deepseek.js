// src/services/ai/providers/deepseek.js
export async function callDeepSeek(prompt, env, options = {}) {
    const apiKey = env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY not set');
    }
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: options.model || 'deepseek-chat',
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7,
            messages: [
                { role: 'system', content: options.system || 'You are ZVAKHO\'s AI assistant.' },
                { role: 'user', content: prompt }
            ]
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek error: ${error}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}