-- ── USER PROVIDER PREFERENCES ────────────────────────────────────
-- Each user's personal settings per provider
CREATE TABLE IF NOT EXISTS user_provider_preferences (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  provider_id text NOT NULL,
  is_enabled  boolean DEFAULT true,
  is_paused   boolean DEFAULT false,
  priority    integer DEFAULT 99,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

ALTER TABLE user_provider_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
ON user_provider_preferences FOR ALL
USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS user_prefs_user_idx
ON user_provider_preferences(user_id);

-- ── ADMIN READ POLICY ON ai_providers ────────────────────────────
-- Allow authenticated users to read providers (already exists)
-- Allow admin to write (we check is_admin in the app layer)
-- For full security in production, use a Supabase Edge Function
-- For now the app checks is_admin before showing admin UI

-- ── VERIFY ───────────────────────────────────────────────────────
SELECT 'Setup complete' as status;
