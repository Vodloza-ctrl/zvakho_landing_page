// src/services/ai/index.js
import { callAnthropic } from './providers/anthropic.js';
import { callOpenAI } from './providers/openai.js';
import { callDeepSeek } from './providers/deepseek.js';
import { callGemini } from './providers/gemini.js';
import { getFallback } from './fallback.js';

// Provider registry
const providers = {
    anthropic: { 
        client: callAnthropic, 
        key: 'ANTHROPIC_API_KEY',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
    },
    openai: { 
        client: callOpenAI, 
        key: 'OPENAI_API_KEY',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
    },
    deepseek: { 
        client: callDeepSeek, 
        key: 'DEEPSEEK_API_KEY',
        models: ['deepseek-v3', 'deepseek-chat']
    },
    gemini: { 
        client: callGemini, 
        key: 'GEMINI_API_KEY',
        models: ['gemini-pro', 'gemini-1.5-pro']
    }
};

// Get active providers (those with API keys)
function getActiveProviders(env) {
    const active = [];
    for (const [name, config] of Object.entries(providers)) {
        if (env[config.key]) {
            active.push(name);
        }
    }
    return active;
}

// Main AI call with auto-failover
export async function callAI(prompt, env, options = {}) {
    const primary = options.provider || env.AI_PROVIDER || 'anthropic';
    const activeProviders = getActiveProviders(env);
    
    // If no providers configured, use fallback
    if (activeProviders.length === 0) {
        console.warn('⚠️ No AI providers configured, using fallback');
        return getFallback(prompt);
    }
    
    // If primary not available, use first active
    const providerName = activeProviders.includes(primary) ? primary : activeProviders[0];
    const config = providers[providerName];
    
    try {
        console.log(`🤖 Using AI provider: ${providerName}`);
        return await config.client(prompt, env, options);
    } catch (error) {
        console.error(`❌ ${providerName} failed:`, error.message);
        
        // Try other providers as fallback
        for (const fallbackName of activeProviders) {
            if (fallbackName === providerName) continue;
            
            try {
                console.log(`🔄 Trying fallback: ${fallbackName}`);
                const fallbackConfig = providers[fallbackName];
                return await fallbackConfig.client(prompt, env, options);
            } catch (fallbackError) {
                console.error(`❌ ${fallbackName} also failed:`, fallbackError.message);
            }
        }
        
        // All providers failed, use fallback
        console.warn('⚠️ All AI providers failed, using fallback');
        return getFallback(prompt);
    }
}

// Get available providers
export function getAvailableProviders(env) {
    return getActiveProviders(env);
}

// Check if AI is available
export function isAIAvailable(env) {
    return getActiveProviders(env).length > 0;
}