-- ═══════════════════════════════════════════════════════════════
-- MINDOO — DATABASE MIGRATIONS
-- Run all of these in Supabase SQL Editor in order.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. SHARED AI PROVIDERS (admin-managed, all users see them) ──
-- Drop old per-user table if it exists and start fresh
DROP TABLE IF EXISTS ai_providers CASCADE;

CREATE TABLE ai_providers (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id              text NOT NULL UNIQUE,
  name                     text NOT NULL,
  company                  text DEFAULT '',
  api_key                  text DEFAULT '',
  base_url                 text NOT NULL,
  model                    text NOT NULL,
  api_format               text DEFAULT 'openai',
  priority                 integer DEFAULT 99,
  is_enabled               boolean DEFAULT true,
  is_paused                boolean DEFAULT false,
  max_requests_per_minute  integer DEFAULT 30,
  max_requests_per_day     integer DEFAULT 1000,
  max_tokens_per_request   integer DEFAULT 4000,
  cooldown_on_rate_limit   integer DEFAULT 62,
  cooldown_on_error        integer DEFAULT 15,
  notes                    text DEFAULT '',
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

-- No RLS — this is a shared admin table readable by all authenticated users
-- Only Supabase service role (admin) can write to it
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

-- All logged-in users can READ providers
CREATE POLICY "All users can read providers"
ON ai_providers FOR SELECT
TO authenticated
USING (true);

-- Only service role can INSERT/UPDATE/DELETE (managed via Supabase dashboard or admin panel)
-- No insert/update/delete policy = only service role can modify

-- ── 2. SEED DEFAULT PROVIDERS ────────────────────────────────────
INSERT INTO ai_providers (
  provider_id, name, company, api_key, base_url, model, api_format,
  priority, is_enabled, is_paused,
  max_requests_per_minute, max_requests_per_day, max_tokens_per_request,
  cooldown_on_rate_limit, cooldown_on_error, notes
) VALUES
  ('groq',     'Groq',              'Groq',       '', 'https://api.groq.com/openai/v1/chat/completions',                                                     'llama-3.3-70b-versatile',                   'openai',    1, true, false, 30,  14400, 8000,  62, 15, 'Free tier — fast llama model'),
  ('gemini',   'Gemini',            'Google',     '', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',             'gemini-2.0-flash',                          'google',    2, true, false, 15,  1500,  8000,  65, 15, 'Google Gemini — free tier'),
  ('openrouter','OpenRouter',       'OpenRouter', '', 'https://openrouter.ai/api/v1/chat/completions',                                                        'meta-llama/llama-3.3-70b-instruct:free',    'openai',    3, true, false, 20,  200,   8000,  65, 20, 'Free tier — many models'),
  ('glm',      'GLM (Zhipu)',       'Zhipu AI',   '', 'https://open.bigmodel.cn/api/paas/v4/chat/completions',                                                'glm-4-flash',                               'openai',    4, true, false, 60,  1000,  8000,  62, 15, 'Free flash tier'),
  ('deepseek', 'DeepSeek',         'DeepSeek',   '', 'https://api.deepseek.com/v1/chat/completions',                                                         'deepseek-chat',                             'openai',    5, true, false, 60,  1000,  32000, 62, 15, 'Very affordable'),
  ('openai',   'ChatGPT (GPT-4o)', 'OpenAI',     '', 'https://api.openai.com/v1/chat/completions',                                                           'gpt-4o-mini',                               'openai',    6, true, false, 60,  1000,  16000, 62, 15, 'GPT-4o-mini affordable'),
  ('anthropic','Claude',           'Anthropic',  '', 'https://api.anthropic.com/v1/messages',                                                                'claude-haiku-4-5-20251001',                 'anthropic', 7, true, false, 60,  1000,  8000,  62, 15, 'Needs proxy — CORS blocked'),
  ('mistral',  'Mistral',          'Mistral AI', '', 'https://api.mistral.ai/v1/chat/completions',                                                           'mistral-small-latest',                      'openai',    8, true, false, 60,  1000,  32000, 62, 15, 'European AI'),
  ('qwen',     'Qwen',             'Alibaba',    '', 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',                                   'qwen-plus',                                 'openai',    9, true, false, 60,  1000,  30000, 62, 15, 'Multilingual')
ON CONFLICT (provider_id) DO NOTHING;

-- ── 3. CHAT HISTORY ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  session_id   uuid NOT NULL,
  role         text NOT NULL,   -- 'user' | 'assistant'
  content      text NOT NULL,
  engine_id    text DEFAULT '',
  provider_id  text DEFAULT '',
  model        text DEFAULT '',
  is_refined   boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_user_session_idx ON chat_messages(user_id, session_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_idx ON chat_messages(user_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat messages"
ON chat_messages FOR ALL USING (auth.uid() = user_id);

-- ── 4. CHRONICLE FOLDERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chronicle_folders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  name       text NOT NULL,
  color      text DEFAULT '#8b5cf6',
  icon       text DEFAULT '📁',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chronicle_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own folders"
ON chronicle_folders FOR ALL USING (auth.uid() = user_id);

-- Add folder_id and tags to chronicles if not already there
ALTER TABLE chronicles
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES chronicle_folders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tags      text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS chronicles_folder_idx ON chronicles(folder_id);
CREATE INDEX IF NOT EXISTS chronicles_tags_idx   ON chronicles USING gin(tags);

-- ── 5. QUOTA TRACKING PER USER (for shared providers) ────────────
CREATE TABLE IF NOT EXISTS provider_quota (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users NOT NULL,
  provider_id         text NOT NULL,
  requests_today      integer DEFAULT 0,
  requests_this_minute integer DEFAULT 0,
  last_request_at     timestamptz,
  last_reset_day      date DEFAULT CURRENT_DATE,
  total_requests      integer DEFAULT 0,
  total_failures      integer DEFAULT 0,
  UNIQUE(user_id, provider_id)
);

ALTER TABLE provider_quota ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quota"
ON provider_quota FOR ALL USING (auth.uid() = user_id);
