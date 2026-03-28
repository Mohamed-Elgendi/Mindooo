// ─────────────────────────────────────────────────────────────────
// db.js — The Data Service Layer
//
// ALL Supabase calls live here. Never import supabase directly
// in a component. Import from this file instead.
//
// Benefits:
// - Change database provider → change this file only
// - Every query in one place → easy to audit and debug
// - Error handling centralized → components stay clean
// ─────────────────────────────────────────────────────────────────
import { supabase } from "../supabase";

// ── CHRONICLES ────────────────────────────────────────────────────

/** Save a new chronicle. Returns { data, error } */
export async function saveChronicle({ userId, text, wordCount, analysis }) {
  const { data, error } = await supabase
    .from("chronicles")
    .insert({
      user_id:         userId,
      text:            text,
      word_count:      wordCount,
      origin:          "text",
      chaos_score:     analysis?.chaosScore     ?? 0,
      emotional_tone:  analysis?.emotionalTone  ?? "neutral",
      urgency_signals: analysis?.urgencySignals ?? [],
      themes:          analysis?.themes         ?? [],
      ai_summary:      analysis?.summary        ?? "",
      disposition:     "archive",
    })
    .select()
    .single();

  return { data, error };
}

/** Load the most recent chronicles for a user */
export async function loadChronicles(userId, limit = 20) {
  const { data, error } = await supabase
    .from("chronicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data ?? [], error };
}

/** Load total chronicle count for a user */
export async function getChronicleCount(userId) {
  const { count, error } = await supabase
    .from("chronicles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return { count: count ?? 0, error };
}

/** Delete a chronicle */
export async function deleteChronicle(chronicleId) {
  const { error } = await supabase
    .from("chronicles")
    .delete()
    .eq("id", chronicleId);

  return { error };
}

// ── FOCUS SESSIONS ────────────────────────────────────────────────

/** Save a completed focus session */
export async function saveFocusSession({ userId, mode, modeName, plannedMins, actualSecs }) {
  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({
      user_id:      userId,
      mode:         mode,
      mode_name:    modeName,
      planned_mins: plannedMins,
      actual_secs:  actualSecs,
      completed:    true,
    })
    .select()
    .single();

  return { data, error };
}

/** Load recent focus sessions */
export async function loadFocusSessions(userId, limit = 10) {
  const { data, error } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data ?? [], error };
}

/** Get total focus minutes this week */
export async function getWeeklyFocusStats(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("focus_sessions")
    .select("actual_secs, mode, created_at")
    .eq("user_id", userId)
    .gte("created_at", weekAgo.toISOString());

  if (error) return { totalMins: 0, sessionCount: 0, error };

  const totalSecs  = (data ?? []).reduce((sum, s) => sum + (s.actual_secs ?? 0), 0);
  const totalMins  = Math.round(totalSecs / 60);
  const sessionCount = (data ?? []).length;

  return { totalMins, sessionCount, error: null };
}

// ── USER PROFILE ──────────────────────────────────────────────────

/** Get or create a user profile */
export async function getOrCreateProfile(userId, firstName) {
  // Try to get existing profile
  const { data: existing, error: fetchError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) return { data: existing, error: null };

  // Create new profile
  const { data: created, error: createError } = await supabase
    .from("user_profiles")
    .insert({
      user_id:    userId,
      first_name: firstName ?? "",
    })
    .select()
    .single();

  return { data: created, error: createError };
}

/** Update profile stats after a chronicle save */
export async function incrementDumpCount(userId) {
  const { error } = await supabase.rpc("increment_dump_count", {
    p_user_id: userId,
  });
  // If RPC doesn't exist yet, do it manually
  if (error) {
    await supabase
      .from("user_profiles")
      .update({ total_dumps: supabase.rpc("total_dumps + 1") })
      .eq("user_id", userId);
  }
  return { error };
}

// ── DASHBOARD STATS ───────────────────────────────────────────────

/**
 * Load all stats needed for the Home dashboard in one call.
 * Returns aggregated data — never raw rows.
 */
export async function loadDashboardStats(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();

  // Run queries in parallel for speed
  const [chroniclesRes, focusRes, allChroniclesRes] = await Promise.all([
    // This week's chronicles
    supabase
      .from("chronicles")
      .select("id, created_at, chaos_score")
      .eq("user_id", userId)
      .gte("created_at", weekAgoISO),

    // This week's focus sessions
    supabase
      .from("focus_sessions")
      .select("actual_secs, mode_name, created_at")
      .eq("user_id", userId)
      .gte("created_at", weekAgoISO),

    // All-time chronicle count
    supabase
      .from("chronicles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const chronicles     = chroniclesRes.data ?? [];
  const focusSessions  = focusRes.data ?? [];
  const totalChronicles = allChroniclesRes.count ?? 0;

  // Calculate stats
  const focusMinsThisWeek = Math.round(
    focusSessions.reduce((sum, s) => sum + (s.actual_secs ?? 0), 0) / 60
  );
  const dumpsThisWeek = chronicles.length;
  const avgChaosScore = chronicles.length > 0
    ? Math.round(chronicles.reduce((sum, c) => sum + (c.chaos_score ?? 0), 0) / chronicles.length)
    : 0;
  const clarityScore = Math.max(0, 100 - avgChaosScore);

  // Calculate streak (consecutive days with at least one activity)
  const streak = calculateStreak([...chronicles, ...focusSessions]);

  return {
    focusMinsThisWeek,
    dumpsThisWeek,
    totalChronicles,
    clarityScore,
    streak,
    focusSessionCount: focusSessions.length,
  };
}

// ── HELPERS ───────────────────────────────────────────────────────

function calculateStreak(activities) {
  if (!activities.length) return 0;

  const days = new Set(
    activities.map(a => new Date(a.created_at).toDateString())
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}