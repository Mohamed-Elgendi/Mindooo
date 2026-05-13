// src/services/db.js — Complete Data Service Layer
// ALL Supabase calls live here. Never call supabase from a component.

import { supabase } from "../supabase";

// ═══════════════════════════════════════════════════════════════
// CHRONICLES
// ═══════════════════════════════════════════════════════════════

export async function saveChronicle({ userId, title, text, wordCount, analysis, folderId, tags }) {
  const { data, error } = await supabase
    .from("chronicles")
    .insert({
      user_id:        userId,
      title:          title?.trim() || "",
      text:           text,
      word_count:     wordCount,
      origin:         "text",
      chaos_score:    analysis?.chaosScore    ?? 0,
      emotional_tone: analysis?.emotionalTone ?? "neutral",
      urgency_signals:analysis?.urgencySignals?? [],
      themes:         analysis?.themes        ?? [],
      ai_summary:     analysis?.summary       ?? "",
      disposition:    "archive",
      folder_id:      folderId || null,
      tags:           tags || [],
    })
    .select()
    .single();
  return { data, error };
}

export async function saveVoiceChronicle({ userId, title, blob, duration, folderId, tags }) {
  try {
    const ext      = blob.type.includes("ogg") ? "ogg" : "webm";
    const fileName = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("voice-notes")
      .upload(fileName, blob, { contentType: blob.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from("voice-notes").getPublicUrl(fileName);
    const audioUrl = urlData?.publicUrl ?? "";
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
        folder_id:     folderId || null,
        tags:          tags || [],
      })
      .select()
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function saveSessionChronicle({ userId, title, text, wordCount, audioUrl, duration, analysis, folderId, tags }) {
  const { data, error } = await supabase
    .from("chronicles")
    .insert({
      user_id:        userId,
      title:          title?.trim() || "Brain Dump Session",
      text:           text ?? "",
      word_count:     wordCount ?? 0,
      origin:         "session",
      audio_url:      audioUrl ?? "",
      duration_secs:  duration ?? 0,
      chaos_score:    analysis?.chaosScore    ?? 0,
      emotional_tone: analysis?.emotionalTone ?? "neutral",
      urgency_signals:analysis?.urgencySignals?? [],
      themes:         analysis?.themes        ?? [],
      ai_summary:     analysis?.summary       ?? "",
      disposition:    "archive",
      folder_id:      folderId || null,
      tags:           tags || [],
    })
    .select()
    .single();
  return { data, error };
}

export async function uploadVoiceBlob({ userId, blob }) {
  const ext      = blob.type.includes("ogg") ? "ogg" : "webm";
  const fileName = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("voice-notes")
    .upload(fileName, blob, { contentType: blob.type, upsert: false });
  if (uploadError) return { url: "", error: uploadError };
  const { data: urlData } = supabase.storage.from("voice-notes").getPublicUrl(fileName);
  return { url: urlData?.publicUrl ?? "", error: null };
}

export async function loadChronicles(userId, limit = 50) {
  const { data, error } = await supabase
    .from("chronicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

export async function loadChroniclesByFolder(userId, folderId) {
  const query = supabase
    .from("chronicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (folderId === "none") {
    query.is("folder_id", null);
  } else if (folderId) {
    query.eq("folder_id", folderId);
  }
  const { data, error } = await query;
  return { data: data ?? [], error };
}

export async function searchChronicles(userId, searchTerm) {
  const { data, error } = await supabase
    .from("chronicles")
    .select("*")
    .eq("user_id", userId)
    .or(`text.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,ai_summary.ilike.%${searchTerm}%`)
    .order("created_at", { ascending: false })
    .limit(50);
  return { data: data ?? [], error };
}

export async function updateChronicle(chronicleId, { title, text, folderId, tags } = {}) {
  const updates = { updated_at: new Date().toISOString() };
  if (title     !== undefined) updates.title     = title;
  if (folderId  !== undefined) updates.folder_id = folderId;
  if (tags      !== undefined) updates.tags      = tags;
  if (text !== undefined) {
    updates.text       = text;
    updates.word_count = text.trim().split(/\s+/).filter(Boolean).length;
  }
  const { error } = await supabase.from("chronicles").update(updates).eq("id", chronicleId);
  return { error };
}

export async function deleteChronicle(chronicleId) {
  const { error } = await supabase.from("chronicles").delete().eq("id", chronicleId);
  return { error };
}

// ═══════════════════════════════════════════════════════════════
// CHRONICLE FOLDERS
// ═══════════════════════════════════════════════════════════════

export async function loadFolders(userId) {
  const { data, error } = await supabase
    .from("chronicle_folders")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  return { data: data ?? [], error };
}

export async function createFolder(userId, { name, color, icon }) {
  const { data, error } = await supabase
    .from("chronicle_folders")
    .insert({ user_id: userId, name: name.trim(), color: color || "#8b5cf6", icon: icon || "📁" })
    .select()
    .single();
  return { data, error };
}

export async function updateFolder(folderId, { name, color, icon }) {
  const { error } = await supabase
    .from("chronicle_folders")
    .update({ name, color, icon })
    .eq("id", folderId);
  return { error };
}

export async function deleteFolder(folderId) {
  // Chronicles in this folder will have folder_id set to null (ON DELETE SET NULL)
  const { error } = await supabase.from("chronicle_folders").delete().eq("id", folderId);
  return { error };
}

// ═══════════════════════════════════════════════════════════════
// FOCUS SESSIONS
// ═══════════════════════════════════════════════════════════════

export async function saveFocusSession({ userId, mode, modeName, plannedMins, actualSecs }) {
  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({ user_id: userId, mode, mode_name: modeName, planned_mins: plannedMins, actual_secs: actualSecs, completed: true })
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
  const totalSecs = (data ?? []).reduce((s, r) => s + (r.actual_secs ?? 0), 0);
  return { totalMins: Math.round(totalSecs / 60), sessionCount: (data ?? []).length, error: null };
}

// ═══════════════════════════════════════════════════════════════
// CHAT HISTORY
// ═══════════════════════════════════════════════════════════════

export async function saveChatMessage({ userId, sessionId, role, content, engineId, providerId, model, isRefined }) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      user_id:    userId,
      session_id: sessionId,
      role,
      content,
      engine_id:  engineId  || "",
      provider_id: providerId || "",
      model:      model     || "",
      is_refined: isRefined || false,
    })
    .select()
    .single();
  return { data, error };
}

export async function loadChatSessions(userId) {
  // Load distinct sessions with the first message of each
  const { data, error } = await supabase
    .from("chat_messages")
    .select("session_id, content, created_at, role")
    .eq("user_id", userId)
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return { data: [], error };
  // Deduplicate by session_id — keep most recent per session
  const seen = new Set();
  const sessions = [];
  for (const msg of (data || [])) {
    if (!seen.has(msg.session_id)) {
      seen.add(msg.session_id);
      sessions.push(msg);
    }
  }
  return { data: sessions, error: null };
}

export async function loadChatHistory(userId, sessionId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  return { data: data ?? [], error };
}

export async function deleteChatSession(userId, sessionId) {
  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("user_id", userId)
    .eq("session_id", sessionId);
  return { error };
}

// ═══════════════════════════════════════════════════════════════
// SHARED AI PROVIDERS (read-only for users)
// ═══════════════════════════════════════════════════════════════

export async function loadSharedProviders() {
  const { data, error } = await supabase
    .from("ai_providers")
    .select("*")
    .eq("is_enabled", true)
    .eq("is_paused", false)
    .order("priority", { ascending: true });
  return { data: data ?? [], error };
}

export async function loadAllProviders() {
  const { data, error } = await supabase
    .from("ai_providers")
    .select("*")
    .order("priority", { ascending: true });
  return { data: data ?? [], error };
}

// ═══════════════════════════════════════════════════════════════
// USER PROFILE + DASHBOARD
// ═══════════════════════════════════════════════════════════════

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

export async function loadDashboardStats(userId) {
  const weekAgo    = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();
  const [chroniclesRes, focusRes, allChroniclesRes] = await Promise.all([
    supabase.from("chronicles").select("id, created_at, chaos_score").eq("user_id", userId).gte("created_at", weekAgoISO),
    supabase.from("focus_sessions").select("actual_secs, mode_name, created_at").eq("user_id", userId).gte("created_at", weekAgoISO),
    supabase.from("chronicles").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  const chronicles      = chroniclesRes.data ?? [];
  const focusSessions   = focusRes.data ?? [];
  const totalChronicles = allChroniclesRes.count ?? 0;
  const focusMinsThisWeek = Math.round(focusSessions.reduce((s, r) => s + (r.actual_secs ?? 0), 0) / 60);
  const avgChaos = chronicles.length > 0 ? Math.round(chronicles.reduce((s, c) => s + (c.chaos_score ?? 0), 0) / chronicles.length) : 0;
  return {
    focusMinsThisWeek,
    dumpsThisWeek:     chronicles.length,
    totalChronicles,
    clarityScore:      Math.max(0, 100 - avgChaos),
    streak:            calculateStreak([...chronicles, ...focusSessions]),
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
    if (days.has(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  return streak;
}
