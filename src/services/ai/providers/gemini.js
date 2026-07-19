// src/services/ai/providers/gemini.js
export async function callGemini(prompt, env, options = {}) {
    const apiKey = env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not set');
    }
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    maxOutputTokens: options.maxTokens || 500
                }
            })
        }
    );
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini error: ${error}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}