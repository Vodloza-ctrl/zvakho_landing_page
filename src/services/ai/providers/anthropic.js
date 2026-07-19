// src/services/ai/providers/anthropic.js
export async function callAnthropic(prompt, env, options = {}) {
    const apiKey = env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not set');
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: options.model || 'claude-3-haiku-20240307',
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature || 0.7,
            system: options.system || 'You are ZVAKHO\'s AI assistant.',
            messages: [{ role: 'user', content: prompt }]
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic error: ${error}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
}