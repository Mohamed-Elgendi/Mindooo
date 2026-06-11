// ============================================================
// MEMORYOS — LLM GATEWAY
// Version: 1.0.0
// Multi-provider AI system with smart fallback chain
// ============================================================

// ─── PROVIDER CONFIGURATIONS ─────────────────────────────────

export const PROVIDER_CONFIGS = {
  'gemini-flash': {
    id:            'gemini-flash',
    name:          'Google Gemini Flash',
    model:         'gemini-1.5-flash',
    apiKeyEnvVar:  'VITE_GEMINI_API_KEY',
    baseUrl:       'https://generativelanguage.googleapis.com/v1beta/models',
    maxTokens:     8192,
    freeQuota:     1_500_000,
    priority:      1,
    tasks:         ['card-generation', 'summary', 'guru-guidance', 'simple', 'chat-coach'],
    latencyTarget: 3000,
  },
  'claude-haiku': {
    id:            'claude-haiku',
    name:          'Anthropic Claude Haiku',
    model:         'claude-haiku-4-5-20251001',
    apiKeyEnvVar:  'VITE_ANTHROPIC_API_KEY',
    baseUrl:       'https://api.anthropic.com/v1/messages',
    maxTokens:     4096,
    freeQuota:     0,
    priority:      2,
    tasks:         ['guru-guidance', 'mind-analysis', 'chat-coach', 'card-evaluation'],
    latencyTarget: 4000,
  },
  'gpt-4o-mini': {
    id:            'gpt-4o-mini',
    name:          'OpenAI GPT-4o Mini',
    model:         'gpt-4o-mini',
    apiKeyEnvVar:  'VITE_OPENAI_API_KEY',
    baseUrl:       'https://api.openai.com/v1/chat/completions',
    maxTokens:     4096,
    freeQuota:     0,
    priority:      3,
    tasks:         ['card-generation', 'guru-guidance', 'chat-coach', 'summary'],
    latencyTarget: 4000,
  },
  'groq-llama': {
    id:            'groq-llama',
    name:          'Groq Llama 3',
    model:         'llama-3.1-70b-versatile',
    apiKeyEnvVar:  'VITE_GROQ_API_KEY',
    baseUrl:       'https://api.groq.com/openai/v1/chat/completions',
    maxTokens:     4096,
    freeQuota:     14_400,
    priority:      4,
    tasks:         ['simple', 'card-generation', 'summary', 'chat-coach'],
    latencyTarget: 2000,
  },
};

// ─── TASK → PROVIDER ROUTING ──────────────────────────────────

export const TASK_ROUTING = {
  'guru-guidance':   ['gemini-flash', 'claude-haiku', 'gpt-4o-mini', 'groq-llama'],
  'card-generation': ['gemini-flash', 'groq-llama',   'gpt-4o-mini', 'claude-haiku'],
  'mind-analysis':   ['claude-haiku', 'gemini-flash',  'gpt-4o-mini'],
  'chat-coach':      ['gemini-flash', 'claude-haiku',  'groq-llama',  'gpt-4o-mini'],
  'card-evaluation': ['claude-haiku', 'gemini-flash',  'gpt-4o-mini'],
  'summary':         ['groq-llama',   'gemini-flash',  'gpt-4o-mini'],
  'simple':          ['groq-llama',   'gemini-flash'],
};

// ─── TOKEN QUOTA TRACKER ──────────────────────────────────────

const _quotaUsage = new Map();
const DAILY_USER_LIMIT = 50_000;

function quotaKey(userId, provider) {
  return `${userId}:${provider}:${new Date().toISOString().split('T')[0]}`;
}

function recordQuota(userId, provider, tokens) {
  const k    = quotaKey(userId, provider);
  const curr = _quotaUsage.get(k) || 0;
  _quotaUsage.set(k, curr + tokens);
}

function getQuota(userId, provider) {
  return _quotaUsage.get(quotaKey(userId, provider)) || 0;
}

function isUserOverDailyLimit(userId) {
  let total = 0;
  for (const [key, count] of _quotaUsage.entries()) {
    if (key.startsWith(`${userId}:`)) total += count;
  }
  return total >= DAILY_USER_LIMIT;
}

// ─── RESPONSE CACHE ───────────────────────────────────────────

const _cache    = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const MAX_SIZE  = 500;

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return { text: entry.text, tokens: entry.tokens };
}

function cacheSet(key, text, tokens) {
  if (_cache.size >= MAX_SIZE) {
    const oldest = _cache.keys().next().value;
    if (oldest) _cache.delete(oldest);
  }
  _cache.set(key, { text, tokens, ts: Date.now() });
}

// ─── PROVIDER CALLERS ─────────────────────────────────────────

function getKey(envVar) {
  return import.meta.env[envVar] || '';
}

async function callGemini(req, config) {
  const apiKey = getKey(config.apiKeyEnvVar);
  if (!apiKey) throw new Error('Gemini API key not set');

  const url  = `${config.baseUrl}/${config.model}:generateContent?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: req.systemPrompt }] },
    contents:           [{ role: 'user', parts: [{ text: req.userPrompt }] }],
    generationConfig: {
      maxOutputTokens: req.maxTokens || 1024,
      temperature:     req.temperature ?? 0.7,
    },
  };

  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { code: res.status, message: err?.error?.message || res.statusText, retry: res.status === 429 || res.status >= 500 };
  }

  const data   = await res.json();
  const text   = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokens = (data.usageMetadata?.promptTokenCount || 0) + (data.usageMetadata?.candidatesTokenCount || 0);
  return { text, tokens };
}

async function callClaude(req, config) {
  const apiKey = getKey(config.apiKeyEnvVar);
  if (!apiKey) throw new Error('Anthropic API key not set');

  const res = await fetch(config.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: config.model, max_tokens: req.maxTokens || 1024, system: req.systemPrompt, messages: [{ role: 'user', content: req.userPrompt }], temperature: req.temperature ?? 0.7 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { code: res.status, message: err?.error?.message || res.statusText, retry: res.status === 529 || res.status >= 500 };
  }

  const data   = await res.json();
  const text   = data.content?.[0]?.text || '';
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  return { text, tokens };
}

async function callOpenAI(req, config) {
  const apiKey = getKey(config.apiKeyEnvVar);
  if (!apiKey) throw new Error('OpenAI API key not set');

  const res = await fetch(config.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: config.model, max_tokens: req.maxTokens || 1024, temperature: req.temperature ?? 0.7, messages: [{ role: 'system', content: req.systemPrompt }, { role: 'user', content: req.userPrompt }] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { code: res.status, message: err?.error?.message || res.statusText, retry: res.status === 429 || res.status >= 500 };
  }

  const data   = await res.json();
  const text   = data.choices?.[0]?.message?.content || '';
  const tokens = data.usage?.total_tokens || 0;
  return { text, tokens };
}

async function callGroq(req, config) {
  const apiKey = getKey(config.apiKeyEnvVar);
  if (!apiKey) throw new Error('Groq API key not set');

  const res = await fetch(config.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: config.model, max_tokens: req.maxTokens || 1024, temperature: req.temperature ?? 0.7, messages: [{ role: 'system', content: req.systemPrompt }, { role: 'user', content: req.userPrompt }] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { code: res.status, message: err?.error?.message || res.statusText, retry: res.status === 429 || res.status >= 500 };
  }

  const data   = await res.json();
  const text   = data.choices?.[0]?.message?.content || '';
  const tokens = data.usage?.total_tokens || 0;
  return { text, tokens };
}

async function callProvider(providerId, req, config) {
  switch (providerId) {
    case 'gemini-flash': return callGemini(req, config);
    case 'claude-haiku': return callClaude(req, config);
    case 'gpt-4o-mini':  return callOpenAI(req, config);
    case 'groq-llama':   return callGroq(req, config);
    default: throw new Error(`Unknown provider: ${providerId}`);
  }
}

// ─── USAGE LOGGER ────────────────────────────────────────────

async function logUsage(supabase, userId, provider, task, tokens, latencyMs, cached, success) {
  try {
    await supabase.from('memoryos_ai_usage').insert({
      user_id: userId, provider, task,
      tokens_used: tokens, latency_ms: latencyMs,
      cached, success, logged_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[MemoryOS Gateway] Usage log failed:', err);
  }
}

// ─── MAIN GATEWAY FUNCTION ────────────────────────────────────

export async function llmRequest(req, supabase) {
  const startTime     = Date.now();
  const providerChain = TASK_ROUTING[req.task] || ['groq-llama'];

  // 1. Check cache
  if (req.cacheKey) {
    const cached = cacheGet(req.cacheKey);
    if (cached) {
      return { text: cached.text, provider: 'cache', tokensUsed: 0, cached: true, latencyMs: Date.now() - startTime, fallbackUsed: false, attemptCount: 0 };
    }
  }

  // 2. Check daily limit
  if (req.userId && isUserOverDailyLimit(req.userId)) {
    console.warn(`[MemoryOS Gateway] User ${req.userId} over daily limit`);
    return { text: 'You have reached your daily AI usage limit. Please try again tomorrow.', provider: 'cache', tokensUsed: 0, cached: false, latencyMs: Date.now() - startTime, fallbackUsed: false, attemptCount: 0 };
  }

  // 3. Try providers in order
  let attemptCount = 0;
  let fallbackUsed = false;
  const errors     = [];

  for (let i = 0; i < providerChain.length; i++) {
    const providerId = providerChain[i];
    const config     = PROVIDER_CONFIGS[providerId];
    if (!config) continue;

    const apiKey = getKey(config.apiKeyEnvVar);
    if (!apiKey) continue;

    if (i > 0) fallbackUsed = true;
    attemptCount++;

    try {
      const providerStart = Date.now();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject({ code: 408, message: 'Latency timeout', retry: true }), config.latencyTarget * 1.5)
      );

      const result = await Promise.race([
        callProvider(providerId, req, config),
        timeoutPromise,
      ]);

      const latencyMs = Date.now() - providerStart;

      if (req.userId) recordQuota(req.userId, providerId, result.tokens);
      if (req.cacheKey && result.text) cacheSet(req.cacheKey, result.text, result.tokens);

      logUsage(supabase, req.userId, providerId, req.task, result.tokens, latencyMs, false, true);

      return { text: result.text, provider: providerId, tokensUsed: result.tokens, cached: false, latencyMs: Date.now() - startTime, fallbackUsed, attemptCount };

    } catch (err) {
      const code    = err?.code || 500;
      const message = err?.message || 'Unknown error';
      const retry   = err?.retry !== false;

      errors.push(`${providerId}: ${code} ${message}`);
      logUsage(supabase, req.userId, providerId, req.task, 0, Date.now() - startTime, false, false);

      if (!retry && code >= 400 && code < 500 && code !== 429) break;

      if (i < providerChain.length - 1) {
        await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attemptCount - 1), 4000)));
      }
    }
  }

  // 4. All providers failed
  console.error('[MemoryOS Gateway] All providers failed:', errors.join(' | '));
  return { text: "I'm having trouble connecting right now. Please try again in a moment.", provider: 'cache', tokensUsed: 0, cached: false, latencyMs: Date.now() - startTime, fallbackUsed: true, attemptCount };
}

// ─── STREAMING GATEWAY ────────────────────────────────────────

export async function* llmStream(req, supabase) {
  const providerId = (TASK_ROUTING[req.task] || ['groq-llama'])[0];
  const config     = PROVIDER_CONFIGS[providerId];
  const apiKey     = config ? getKey(config.apiKeyEnvVar) : '';

  if (!apiKey) {
    const result = await llmRequest(req, supabase);
    yield result.text;
    return;
  }

  try {
    if (providerId === 'gemini-flash') {
      const url  = `${config.baseUrl}/${config.model}:streamGenerateContent?key=${apiKey}&alt=sse`;
      const body = {
        system_instruction: { parts: [{ text: req.systemPrompt }] },
        contents:           [{ role: 'user', parts: [{ text: req.userPrompt }] }],
        generationConfig:   { maxOutputTokens: req.maxTokens || 1024, temperature: req.temperature ?? 0.7 },
      };

      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch { /* ignore stream parse errors */ }
        }
      }
    } else {
      const result = await llmRequest(req, supabase);
      yield result.text;
    }
  } catch {
    const result = await llmRequest(req, supabase);
    yield result.text;
  }
}

// ─── QUOTA SUMMARY ────────────────────────────────────────────

export function getQuotaSummary(userId) {
  const DAILY_LIMIT = 50_000;
  let total         = 0;
  const providers   = {};

  for (const provider of Object.keys(PROVIDER_CONFIGS)) {
    const used      = getQuota(userId, provider);
    providers[provider] = used;
    total          += used;
  }

  return { providers, totalToday: total, remainingEstimate: Math.max(0, DAILY_LIMIT - total) };
}
