// ─────────────────────────────────────────────────────────────────
// db.js — The Data Service Layer
// ALL Supabase calls live here. Never call supabase from a component.
// ─────────────────────────────────────────────────────────────────
import { supabase } from "../supabase";

// ── CHRONICLES ────────────────────────────────────────────────────

/** Save a text chronicle with optional title */
export async function saveChronicle({ userId, title, text, wordCount, analysis }) {
  const { data, error } = await supabase
    .from("chronicles")
    .insert({
      user_id:         userId,
      title:           title?.trim() || "",
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

/** Save a voice note chronicle — uploads audio blob to Storage, saves URL */
export async function saveVoiceChronicle({ userId, title, blob, duration }) {
  try {
    // 1. Upload audio blob to Supabase Storage
    const ext      = blob.type.includes("ogg") ? "ogg" : "webm";
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("voice-notes")
      .upload(fileName, blob, { contentType: blob.type, upsert: false });

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from("voice-notes")
      .getPublicUrl(fileName);

    const audioUrl = urlData?.publicUrl ?? "";

    // 3. Save chronicle record
    const { data, error } = await supabase
      .from("chronicles")
      .insert({
        user_id:       userId,
        title:         title?.trim() || "",
        text:          "",
        word_count:    0,
        origin:        "voice",
        audio_url:     audioUrl,
        duration_secs: duration ?? 0,
        disposition:   "archive",
      })
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/** Save a Brain Dump Session — has text + optional voice audio */
export async function saveSessionChronicle({
  userId, title, text, wordCount, audioUrl, duration, analysis
}) {
  const { data, error } = await supabase
    .from("chronicles")
    .insert({
      user_id:         userId,
      title:           title?.trim() || "Brain Dump Session",
      text:            text ?? "",
      word_count:      wordCount ?? 0,
      origin:          "session",
      audio_url:       audioUrl ?? "",
      duration_secs:   duration ?? 0,
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

/** Upload a voice blob and return its public URL */
export async function uploadVoiceBlob({ userId, blob }) {
  const ext      = blob.type.includes("ogg") ? "ogg" : "webm";
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("voice-notes")
    .upload(fileName, blob, { contentType: blob.type, upsert: false });

  if (uploadError) return { url: "", error: uploadError };

  const { data: urlData } = supabase.storage
    .from("voice-notes")
    .getPublicUrl(fileName);

  return { url: urlData?.publicUrl ?? "", error: null };
}

/** Load the most recent chronicles for a user */
export async function loadChronicles(userId, limit = 30) {
  const { data, error } = await supabase
    .from("chronicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

/** Update a chronicle's title and/or text */
export async function updateChronicle(chronicleId, { title, text } = {}) {
  const updates = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title;
  if (text  !== undefined) {
    updates.text       = text;
    updates.word_count = text.trim().split(/\s+/).filter(Boolean).length;
  }
  const { error } = await supabase
    .from("chronicles")
    .update(updates)
    .eq("id", chronicleId);
  return { error };
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

export async function saveFocusSession({ userId, mode, modeName, plannedMins, actualSecs }) {
  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({ user_id: userId, mode, mode_name: modeName,
              planned_mins: plannedMins, actual_secs: actualSecs, completed: true })
    .select().single();
  return { data, error };
}

export async function loadFocusSessions(userId, limit = 10) {
  const { data, error } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

export async function getWeeklyFocusStats(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data, error } = await supabase
    .from("focus_sessions")
    .select("actual_secs, mode, created_at")
    .eq("user_id", userId)
    .gte("created_at", weekAgo.toISOString());
  if (error) return { totalMins: 0, sessionCount: 0, error };
  const totalSecs    = (data ?? []).reduce((s, r) => s + (r.actual_secs ?? 0), 0);
  const totalMins    = Math.round(totalSecs / 60);
  const sessionCount = (data ?? []).length;
  return { totalMins, sessionCount, error: null };
}

// ── USER PROFILE ──────────────────────────────────────────────────

export async function getOrCreateProfile(userId, firstName) {
  const { data: existing } = await supabase
    .from("user_profiles").select("*").eq("user_id", userId).single();
  if (existing) return { data: existing, error: null };
  const { data: created, error } = await supabase
    .from("user_profiles")
    .insert({ user_id: userId, first_name: firstName ?? "" })
    .select().single();
  return { data: created, error };
}

// ── DASHBOARD STATS ───────────────────────────────────────────────

export async function loadDashboardStats(userId) {
  const weekAgo    = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();

  const [chroniclesRes, focusRes, allChroniclesRes] = await Promise.all([
    supabase.from("chronicles").select("id, created_at, chaos_score")
      .eq("user_id", userId).gte("created_at", weekAgoISO),
    supabase.from("focus_sessions").select("actual_secs, mode_name, created_at")
      .eq("user_id", userId).gte("created_at", weekAgoISO),
    supabase.from("chronicles").select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const chronicles      = chroniclesRes.data ?? [];
  const focusSessions   = focusRes.data ?? [];
  const totalChronicles = allChroniclesRes.count ?? 0;

  const focusMinsThisWeek = Math.round(
    focusSessions.reduce((s, r) => s + (r.actual_secs ?? 0), 0) / 60
  );
  const avgChaosScore = chronicles.length > 0
    ? Math.round(chronicles.reduce((s, c) => s + (c.chaos_score ?? 0), 0) / chronicles.length)
    : 0;

  return {
    focusMinsThisWeek,
    dumpsThisWeek:    chronicles.length,
    totalChronicles,
    clarityScore:     Math.max(0, 100 - avgChaosScore),
    streak:           calculateStreak([...chronicles, ...focusSessions]),
    focusSessionCount: focusSessions.length,
  };
}

function calculateStreak(activities) {
  if (!activities.length) return 0;
  const days  = new Set(activities.map(a => new Date(a.created_at).toDateString()));
  const today = new Date();
  let streak  = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) { streak++; }
    else if (i > 0) break;
  }
  return streak;
}
