// src/services/ai/providers/openai.js
export async function callOpenAI(prompt, env, options = {}) {
    const apiKey = env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY not set');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: options.model || 'gpt-3.5-turbo',
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
        throw new Error(`OpenAI error: ${error}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}