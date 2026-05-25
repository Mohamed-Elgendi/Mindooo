// ============================================================
// MEMORYOS — LLM GATEWAY
// Version: 1.0.0
//
// Multi-provider AI system with:
// - Smart token quota management
// - Automatic fallback chain
// - Per-user rate limiting
// - Response caching
// - Usage tracking via Supabase
// - Task-based model routing
//
// PROVIDERS (free tier priority order):
// 1. Google Gemini Flash  → largest free tier, fast
// 2. Anthropic Claude Haiku → smart, efficient
// 3. OpenAI GPT-4o-mini   → reliable fallback
// 4. Groq Llama-3          → very fast, generous free
// 5. Cache                 → zero tokens, instant
// ============================================================


// ─── TYPES ───────────────────────────────────────────────────









// ─── PROVIDER CONFIGURATIONS ─────────────────────────────────

export const PROVIDER_CONFIGS = {
  'gemini-flash': {
    id:           'gemini-flash',
    name:         'Google Gemini Flash',
    model:        'gemini-1.5-flash',
    apiKeyEnvVar: 'GEMINI_API_KEY',
    baseUrl:      'https://generativelanguage.googleapis.com/v1beta/models',
    maxTokens:    8192,
    freeQuota:    1_500_000,   // 1.5M tokens/day free
    priority:     1,
    tasks:        ['card-generation', 'summary', 'guru-guidance', 'simple', 'chat-coach'],
    latencyTarget: 3000,
  },
  'claude-haiku': {
    id:           'claude-haiku',
    name:         'Anthropic Claude Haiku',
    model:        'claude-haiku-4-5-20251001',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    baseUrl:      'https://api.anthropic.com/v1/messages',
    maxTokens:    4096,
    freeQuota:    0,           // no free tier — use sparingly
    priority:     2,
    tasks:        ['guru-guidance', 'mind-analysis', 'chat-coach', 'card-evaluation'],
    latencyTarget: 4000,
  },
  'gpt-4o-mini': {
    id:           'gpt-4o-mini',
    name:         'OpenAI GPT-4o Mini',
    model:        'gpt-4o-mini',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    baseUrl:      'https://api.openai.com/v1/chat/completions',
    maxTokens:    4096,
    freeQuota:    0,           // no free tier
    priority:     3,
    tasks:        ['card-generation', 'guru-guidance', 'chat-coach', 'summary'],
    latencyTarget: 4000,
  },
  'groq-llama': {
    id:           'groq-llama',
    name:         'Groq Llama 3',
    model:        'llama-3.1-70b-versatile',
    apiKeyEnvVar: 'GROQ_API_KEY',
    baseUrl:      'https://api.groq.com/openai/v1/chat/completions',
    maxTokens:    4096,
    freeQuota:    14_400,      // 14,400 tokens/min free
    priority:     4,
    tasks:        ['simple', 'card-generation', 'summary', 'chat-coach'],
    latencyTarget: 2000,       // Groq is very fast
  },
  'cache': {
    id:           'cache',
    name:         'Cache',
    model:        'cache',
    apiKeyEnvVar: '',
    baseUrl:      '',
    maxTokens:    0,
    freeQuota:    Infinity,
    priority:     0,           // highest priority when available
    tasks:        ['card-generation', 'summary', 'guru-guidance', 'simple'],
    latencyTarget: 50,
  },
};

// ─── TASK → PROVIDER ROUTING MAP ─────────────────────────────
// Defines which providers to try, in order, for each task type

export const TASK_ROUTING = {
  'guru-guidance':  ['gemini-flash', 'claude-haiku', 'gpt-4o-mini', 'groq-llama'],
  'card-generation':['gemini-flash', 'groq-llama',   'gpt-4o-mini', 'claude-haiku'],
  'mind-analysis':  ['claude-haiku', 'gemini-flash',  'gpt-4o-mini'],
  'chat-coach':     ['gemini-flash', 'claude-haiku',  'groq-llama',  'gpt-4o-mini'],
  'card-evaluation':['claude-haiku', 'gemini-flash',  'gpt-4o-mini'],
  'summary':        ['groq-llama',   'gemini-flash',  'gpt-4o-mini'],
  'simple':         ['groq-llama',   'gemini-flash'],
};

// ─── TOKEN QUOTA TRACKER ─────────────────────────────────────
// In-memory quota tracking per provider per user session
// Persisted to Supabase at session end

class TokenQuotaTracker {
  private usage = new Map();
  private readonly DAILY_USER_LIMIT = 50_000; // total tokens per user per day

  key(userId, provider) {
    return `${userId}:${provider}:${new Date().toISOString().split('T')[0]}`;
  }

  record(userId, provider, tokens): void {
    const k    = this.key(userId, provider);
    const curr = this.usage.get(k) || 0;
    this.usage.set(k, curr + tokens);
  }

  get(userId, provider) {
    return this.usage.get(this.key(userId, provider)) || 0;
  }

  isUserOverDailyLimit(userId) {
    let total = 0;
    for (const [key, count] of this.usage.entries()) {
      if (key.startsWith(`${userId}:`)) total += count;
    }
    return total >= this.DAILY_USER_LIMIT;
  }

  getAll() {
    return Object.fromEntries(this.usage.entries());
  }
}

const quotaTracker = new TokenQuotaTracker();

// ─── RESPONSE CACHE ───────────────────────────────────────────
// Simple in-memory LRU cache — extend with Redis for production

class ResponseCache {
  private cache = new Map();
  private readonly TTL_MS  = 1000 * 60 * 60 * 24; // 24 hours
  private readonly MAX_SIZE = 500;

  get(key): { text; tokens } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return { text: entry.text, tokens: entry.tokens };
  }

  set(key, text, tokens): void {
    if (this.cache.size >= this.MAX_SIZE) {
      // Evict oldest entry
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { text, tokens, ts: Date.now() });
  }
}

const responseCache = new ResponseCache();

// ─── PROVIDER CALLERS ─────────────────────────────────────────

async function callGemini(
  req:    LLMRequest,
  config
) {
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const url = `${config.baseUrl}/${config.model}:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: req.systemPrompt }] },
    contents:           [{ role: 'user', parts: [{ text: req.userPrompt }] }],
    generationConfig: {
      maxOutputTokens: req.maxTokens || 1024,
      temperature:     req.temperature ?? 0.7,
    },
  };

  const res  = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { code: res.status, message: err?.error?.message || res.statusText, retry: res.status === 429 || res.status >= 500 };
  }

  const data   = await res.json();
  const text   = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokens = (data.usageMetadata?.promptTokenCount || 0) +
                 (data.usageMetadata?.candidatesTokenCount || 0);

  return { text, tokens };
}

async function callClaude(
  req:    LLMRequest,
  config
) {
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const body = {
    model:      config.model,
    max_tokens: req.maxTokens || 1024,
    system:     req.systemPrompt,
    messages:   [{ role: 'user', content: req.userPrompt }],
    temperature: req.temperature ?? 0.7,
  };

  const res = await fetch(config.baseUrl, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
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

async function callOpenAI(
  req:    LLMRequest,
  config
) {
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const body = {
    model:       config.model,
    max_tokens:  req.maxTokens || 1024,
    temperature: req.temperature ?? 0.7,
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user',   content: req.userPrompt   },
    ],
  };

  const res = await fetch(config.baseUrl, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
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

async function callGroq(
  req:    LLMRequest,
  config
) {
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  // Groq uses OpenAI-compatible API
  const body = {
    model:       config.model,
    max_tokens:  req.maxTokens || 1024,
    temperature: req.temperature ?? 0.7,
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user',   content: req.userPrompt   },
    ],
  };

  const res = await fetch(config.baseUrl, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
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

// ─── PROVIDER DISPATCHER ─────────────────────────────────────

async function callProvider(
  provider,
  req:      LLMRequest,
  config:   ProviderConfig
) {
  switch (provider) {
    case 'gemini-flash': return callGemini(req, config);
    case 'claude-haiku': return callClaude(req, config);
    case 'gpt-4o-mini':  return callOpenAI(req, config);
    case 'groq-llama':   return callGroq(req, config);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

// ─── USAGE LOGGER ────────────────────────────────────────────

async function logUsage(
  supabase:  SupabaseClient,
  userId:    string,
  provider:  LLMProvider,
  task:      TaskType,
  tokens:    number,
  latencyMs,
  cached:    boolean,
  success:   boolean
) {
  try {
    await supabase.from('memoryos_ai_usage').insert({
      user_id:    userId,
      provider,
      task,
      tokens_used: tokens,
      latency_ms: latencyMs,
      cached,
      success,
      logged_at:  new Date().toISOString(),
    });
  } catch (err) {
    // Non-critical — don't throw
    console.warn('[MemoryOS Gateway] Usage log failed:', err);
  }
}

// ─── MAIN GATEWAY FUNCTION ────────────────────────────────────

export async function llmRequest(
  req:      LLMRequest,
  supabase: SupabaseClient
) {
  const startTime    = Date.now();
  const providerChain = TASK_ROUTING[req.task];

  // ── 1. Check cache first ────────────────────────────────
  if (req.cacheKey) {
    const cached = responseCache.get(req.cacheKey);
    if (cached) {
      return {
        text:         cached.text,
        provider:     'cache',
        tokensUsed:   0,
        cached:       true,
        latencyMs:    Date.now() - startTime,
        fallbackUsed: false,
        attemptCount: 0,
      };
    }
  }

  // ── 2. Check user daily limit ───────────────────────────
  if (quotaTracker.isUserOverDailyLimit(req.userId)) {
    console.warn(`[MemoryOS Gateway] User ${req.userId} over daily limit`);
    return {
      text:         'You have reached your daily AI usage limit. Please try again tomorrow.',
      provider:     'cache',
      tokensUsed:   0,
      cached:       false,
      latencyMs:    Date.now() - startTime,
      fallbackUsed: false,
      attemptCount: 0,
    };
  }

  // ── 3. Try providers in order ───────────────────────────
  let attemptCount  = 0;
  let fallbackUsed  = false;
  const errors[] = [];

  for (let i = 0; i < providerChain.length; i++) {
    const providerId = providerChain[i];
    const config     = PROVIDER_CONFIGS[providerId];

    if (!config || !process.env[config.apiKeyEnvVar]) {
      // Skip providers without API keys configured
      continue;
    }

    if (i > 0) fallbackUsed = true;
    attemptCount++;

    try {
      const providerStart = Date.now();

      // Race: provider call vs latency threshold
      const result = await Promise.race([
        callProvider(providerId, req, config),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject({ code: 408, message: 'Latency timeout', retry: true }),
          config.latencyTarget * 1.5) // 1.5x target before timeout
        ),
      ]);

      const latencyMs = Date.now() - providerStart;

      // Record quota usage
      quotaTracker.record(req.userId, providerId, result.tokens);

      // Cache if cacheKey provided
      if (req.cacheKey && result.text) {
        responseCache.set(req.cacheKey, result.text, result.tokens);
      }

      // Log usage (non-blocking)
      logUsage(supabase, req.userId, providerId, req.task, result.tokens, latencyMs, false, true);

      return {
        text:         result.text,
        provider:     providerId,
        tokensUsed:   result.tokens,
        cached:       false,
        latencyMs:    Date.now() - startTime,
        fallbackUsed,
        attemptCount,
      };

    } catch (err: any) {
      const code    = err?.code || 500;
      const message = err?.message || 'Unknown error';
      const retry   = err?.retry !== false;

      errors.push(`${providerId}: ${code} ${message}`);

      // Log failed attempt
      logUsage(supabase, req.userId, providerId, req.task, 0, Date.now() - startTime, false, false);

      // 429 = rate limited → always try next provider
      // 5xx = server error → try next provider
      // 4xx (not 429) = bad request → don't retry same error on other providers
      if (!retry && code >= 400 && code < 500 && code !== 429) {
        console.error(`[MemoryOS Gateway] Non-retriable error: ${message}`);
        break;
      }

      // Add exponential backoff before next attempt (only between same-tier retries)
      if (i < providerChain.length - 1) {
        const backoffMs = Math.min(1000 * Math.pow(2, attemptCount - 1), 4000);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  // ── 4. All providers failed — return graceful degradation
  console.error('[MemoryOS Gateway] All providers failed:', errors.join(' | '));

  return {
    text:         'I\'m having trouble connecting right now. Please try again in a moment.',
    provider:     'cache',
    tokensUsed:   0,
    cached:       false,
    latencyMs:    Date.now() - startTime,
    fallbackUsed: true,
    attemptCount,
  };
}

// ─── STREAMING GATEWAY ────────────────────────────────────────
// For real-time streaming responses (chat coach, guru guidance)

export async function* llmStream(
  req:      LLMRequest,
  supabase: SupabaseClient
) {
  // For streaming, try Gemini first (best streaming support on free tier)
  // Fall back to non-streaming if streaming not available

  const providerId = TASK_ROUTING[req.task][0];
  const config     = PROVIDER_CONFIGS[providerId];
  const apiKey     = process.env[config.apiKeyEnvVar];

  if (!apiKey || providerId === 'cache') {
    // Fall back to non-streaming
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
        generationConfig: {
          maxOutputTokens: req.maxTokens || 1024,
          temperature:     req.temperature ?? 0.7,
        },
      };

      const res = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

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
          } catch { /* ignore parse errors in stream */ }
        }
      }
    } else {
      // Non-streaming fallback
      const result = await llmRequest(req, supabase);
      yield result.text;
    }
  } catch (err) {
    // Streaming failed — fall back to non-streaming
    const result = await llmRequest(req, supabase);
    yield result.text;
  }
}

// ─── QUOTA SUMMARY (for AI Mind Lab dashboard) ────────────────

export function getQuotaSummary(userId): {
  providers;
  totalToday;
  remainingEstimate;
} {
  const DAILY_LIMIT = 50_000;
  let total = 0;
  const providers = {} as Record<LLMProvider, number>;

  for (const provider of Object.keys(PROVIDER_CONFIGS) as LLMProvider[]) {
    const used = quotaTracker.get(userId, provider);
    providers[provider] = used;
    total += used;
  }

  return {
    providers,
    totalToday:        total,
    remainingEstimate: Math.max(0, DAILY_LIMIT - total),
  };
}

// ─── SUPABASE TABLE for AI usage tracking ────────────────────
// Add this to your schema.sql:
//
// CREATE TABLE IF NOT EXISTS memoryos_ai_usage (
//   id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   user_id     UUID NOT NULL REFERENCES auth.users(id),
//   provider    TEXT NOT NULL,
//   task        TEXT NOT NULL,
//   tokens_used INTEGER DEFAULT 0,
//   latency_ms  INTEGER,
//   cached      BOOLEAN DEFAULT FALSE,
//   success     BOOLEAN DEFAULT TRUE,
//   logged_at   TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE INDEX idx_ai_usage_user ON memoryos_ai_usage(user_id, logged_at DESC);
