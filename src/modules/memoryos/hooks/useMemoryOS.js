import { useState, useEffect, useCallback } from 'react';
import { useSession } from './useSession.js';
import { useProgress } from './useProgress.js';
import { useBoxSystem } from './useBoxSystem.js';
import { getAllCurricula } from '../curricula/index.js';
import { GURUS } from '../data/gurus.data.js';
import { NOBEL_DOMAINS, getAllNobelCards } from '../data/nobel-mind.data.js';
import {
  analyzeMindState, generateCardsFromText, sendCoachMessage, streamCoachMessage,
  generatePerformanceInsights, computeSmartRecommendations,
  loadSectionOrder, saveSectionOrder, DEFAULT_SECTION_ORDER,
} from '../lib/ai-mind-lab.js';
import { DEFAULT_SETTINGS, MEMORYOS_VERSION } from '../config/settings.config.js';
import { getNextDueAt } from '../config/boxes.config.js';

export function useMemoryOS({ supabaseClient, userId, curricula: customCurricula, defaultSettings, onEvent, initialScreen = 'home', initialCurriculumId }) {
  const supabase = supabaseClient;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [screen, setScreen] = useState(initialScreen);
  const [navParams, setNavParams] = useState({});
  const [navHistory, setNavHistory] = useState([]);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...defaultSettings });
  const [sections, setSections] = useState(DEFAULT_SECTION_ORDER);
  const [allCards, setAllCards] = useState({});
  const [dailyProgress, setDailyProgress] = useState({});
  const [lastEvent, setLastEvent] = useState(null);
  const [activeGuruId, setActiveGuruId] = useState(null);
  const [activeGuruStepId, setActiveGuruStepId] = useState(null);
  const [completedGuruSteps, setCompletedGuruSteps] = useState({});
  const [guruGuidanceMode, setGuruGuidanceMode] = useState('pre-written');
  const [activeDomainId, setActiveDomainId] = useState(null);
  const curricula = customCurricula || getAllCurricula();
  const [activeCurriculumId, setActiveCurriculumId] = useState(initialCurriculumId || null);
  const [mindStateReport, setMindStateReport] = useState(null);
  const [aiInsights, setAIInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [coachHistory, setCoachHistory] = useState([]);
  const [aiLoading, setAILoading] = useState(false);

  const boxSystem = useBoxSystem();

  const sessionCallbacks = {
    onCardReviewed: async (params) => { await recordCardReview(params); },
    onSessionComplete: async (params) => { await recordSessionComplete(params); emitEvent('session:completed', params); },
    onDailyProgressUpdate: async (params) => { await updateDailyProgress(params.curriculumId, params.sessionType, params.done); },
  };

  const session = useSession(settings, sessionCallbacks);
  const progress = useProgress(supabase, userId, curricula, allCards);

  const emitEvent = useCallback((type, payload) => {
    const event = { type, payload, timestamp: new Date(), userId };
    setLastEvent(event);
    if (onEvent) onEvent(event);
  }, [userId, onEvent]);

  const navigate = useCallback((newScreen, params = {}) => {
    setNavHistory(prev => [...prev, screen]);
    setScreen(newScreen);
    setNavParams(params);
  }, [screen]);

  const goBack = useCallback(() => {
    setNavHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setScreen(last);
      setNavParams({});
      return prev.slice(0, -1);
    });
  }, []);

  useEffect(() => { if (userId) initializeMemoryOS(); }, [userId]);

  async function initializeMemoryOS() {
    setLoading(true); setError(null);
    try {
      await Promise.all([loadSettings(), loadCardProgress(), loadDailyProgress(), loadSectionConfig(), loadGuruProgress()]);
      setInitialized(true);
      emitEvent('initialized', { userId });
    } catch (err) {
      setError(err?.message || 'Failed to initialize MemoryOS');
      console.error('[MemoryOS] Init error:', err);
    } finally { setLoading(false); }
  }

  async function loadSettings() {
    try {
      const { data } = await supabase.rpc('memoryos_get_or_create_settings', { p_user_id: userId });
      if (data) {
        setSettings(prev => ({
          ...prev,
          repsPerPhase: data.reps_per_phase ?? prev.repsPerPhase,
          mode: data.mode ?? prev.mode,
          dailyNewCards: data.daily_new_cards ?? prev.dailyNewCards,
          strictOrder: data.strict_order ?? prev.strictOrder,
          showMindmap: data.show_mindmap ?? prev.showMindmap,
          showKeypoints: data.show_keypoints ?? prev.showKeypoints,
          usePhaseReps: data.use_phase_reps ?? prev.usePhaseReps,
          phaseReps: data.phase_reps ?? prev.phaseReps,
          theme: data.theme ?? prev.theme,
          ...defaultSettings,
        }));
      }
    } catch (err) { console.warn('[MemoryOS] Settings load failed:', err); }
  }

  async function loadCardProgress() {
    const { data, error: err } = await supabase.from('memoryos_card_progress').select('*').eq('user_id', userId);
    if (err) throw err;
    const progressMap = new Map();
    (data || []).forEach(row => progressMap.set(`${row.curriculum_id}:${row.card_id}`, row));
    const merged = {};
    curricula.forEach(curriculum => {
      merged[curriculum.id] = curriculum.cards.map(card => {
        const prog = progressMap.get(`${curriculum.id}:${card.id}`);
        return { ...card, box: prog?.box ?? 0, dueAt: prog?.due_at ? new Date(prog.due_at) : null,
          totalReviews: prog?.total_reviews ?? 0, totalOwned: prog?.total_owned ?? 0,
          totalAlmost: prog?.total_almost ?? 0, totalFailed: prog?.total_failed ?? 0,
          lastReviewed: prog?.last_reviewed ? new Date(prog.last_reviewed) : null,
          masteredAt: prog?.mastered_at ? new Date(prog.mastered_at) : null };
      });
    });
    const nobelCards = getAllNobelCards();
    merged['nobel-mind'] = nobelCards.map(card => {
      const prog = progressMap.get(`nobel-mind:${card.id}`);
      return { ...card, box: prog?.box ?? 0, dueAt: prog?.due_at ? new Date(prog.due_at) : null,
        totalReviews: prog?.total_reviews ?? 0, totalOwned: prog?.total_owned ?? 0,
        totalAlmost: prog?.total_almost ?? 0, totalFailed: prog?.total_failed ?? 0,
        lastReviewed: prog?.last_reviewed ? new Date(prog.last_reviewed) : null,
        masteredAt: prog?.mastered_at ? new Date(prog.mastered_at) : null };
    });
    setAllCards(merged);
  }

  async function loadDailyProgress() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('memoryos_daily_progress').select('*').eq('user_id', userId).eq('date', today);
    const progressMap = {};
    curricula.forEach(c => { progressMap[c.id] = { curriculumId: c.id, date: today, reviewDone: false, newDone: false, previewDone: false }; });
    progressMap['nobel-mind'] = { curriculumId: 'nobel-mind', date: today, reviewDone: false, newDone: false, previewDone: false };
    (data || []).forEach(row => { progressMap[row.curriculum_id] = { curriculumId: row.curriculum_id, date: row.date, reviewDone: row.review_done, newDone: row.new_done, previewDone: row.preview_done }; });
    setDailyProgress(progressMap);
  }

  async function loadSectionConfig() {
    try { setSections(await loadSectionOrder(userId, supabase)); } catch { setSections(DEFAULT_SECTION_ORDER); }
  }

  async function loadGuruProgress() {
    try {
      const { data } = await supabase.from('memoryos_user_settings').select('completed_guru_steps').eq('user_id', userId).single();
      if (data?.completed_guru_steps) setCompletedGuruSteps(data.completed_guru_steps);
    } catch {}
  }

  async function updateSettings(patch) {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    await supabase.from('memoryos_user_settings').upsert({
      user_id: userId, reps_per_phase: updated.repsPerPhase, mode: updated.mode,
      daily_new_cards: updated.dailyNewCards, strict_order: updated.strictOrder,
      show_mindmap: updated.showMindmap, show_keypoints: updated.showKeypoints,
      use_phase_reps: updated.usePhaseReps, phase_reps: updated.phaseReps, theme: updated.theme,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    emitEvent('settings:changed', patch);
  }

  async function reorderSections(newSections) { setSections(newSections); await saveSectionOrder(newSections, userId, supabase); }
  async function toggleSection(id) { await reorderSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)); }

  async function updateDailyProgress(curriculumId, sessionType, done) {
    const today = new Date().toISOString().split('T')[0];
    const current = dailyProgress[curriculumId] || { curriculumId, date: today, reviewDone: false, newDone: false, previewDone: false };
    const updated = { ...current,
      reviewDone: sessionType === 'review' ? done : current.reviewDone,
      newDone: sessionType === 'new' ? done : current.newDone,
      previewDone: sessionType === 'preview' ? done : current.previewDone };
    setDailyProgress(prev => ({ ...prev, [curriculumId]: updated }));
    await supabase.from('memoryos_daily_progress').upsert({
      user_id: userId, curriculum_id: curriculumId, date: today,
      review_done: updated.reviewDone, new_done: updated.newDone, preview_done: updated.previewDone,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,curriculum_id,date' });
  }

  async function resetDailyProgress() {
    const today = new Date().toISOString().split('T')[0];
    const allIds = [...curricula.map(c => c.id), 'nobel-mind'];
    const reset = {};
    allIds.forEach(id => { reset[id] = { curriculumId: id, date: today, reviewDone: false, newDone: false, previewDone: false }; });
    setDailyProgress(reset);
    await supabase.from('memoryos_daily_progress').upsert(
      allIds.map(id => ({ user_id: userId, curriculum_id: id, date: today, review_done: false, new_done: false, preview_done: false })),
      { onConflict: 'user_id,curriculum_id,date' }
    );
  }

  function startSession(curriculumId, sessionType) {
    const cards = allCards[curriculumId] || [];
    const queue = boxSystem.getQueueForSession(cards, sessionType, settings.dailyNewCards);
    if (!queue.length) return;
    session.startSession(curriculumId, sessionType, queue);
    navigate('session');
    emitEvent('session:started', { curriculumId, sessionType, queueLength: queue.length });
  }

  async function recordCardReview(params) {
    setAllCards(prev => {
      const currCards = prev[params.curriculumId] || [];
      return { ...prev, [params.curriculumId]: currCards.map(c => {
        if (c.id !== params.cardId) return c;
        return { ...c, box: params.boxAfter, dueAt: getNextDueAt(params.boxAfter),
          totalReviews: (c.totalReviews || 0) + 1,
          totalOwned: (c.totalOwned || 0) + (params.result === 'owned' ? 1 : 0),
          totalAlmost: (c.totalAlmost || 0) + (params.result === 'almost' ? 1 : 0),
          totalFailed: (c.totalFailed || 0) + (params.result === 'fail' ? 1 : 0),
          lastReviewed: new Date(),
          masteredAt: params.boxAfter >= 14 && !c.masteredAt ? new Date() : c.masteredAt };
      }) };
    });
    await supabase.rpc('memoryos_record_review', {
      p_user_id: userId, p_curriculum_id: params.curriculumId, p_card_id: params.cardId,
      p_session_id: params.sessionId, p_session_type: params.sessionType, p_result: params.result,
      p_box_before: params.boxBefore, p_box_after: params.boxAfter, p_reps: params.repsCompleted,
      p_phase_count: params.phaseCount, p_time_ms: params.timeMsSpent,
    });
    if (params.boxAfter >= 14) emitEvent('card:mastered', { cardId: params.cardId, curriculumId: params.curriculumId });
    emitEvent('card:reviewed', params);
  }

  async function recordSessionComplete(params) {
    await supabase.from('memoryos_sessions').upsert({
      id: params.sessionId, user_id: userId, curriculum_id: params.curriculumId, session_type: params.sessionType,
      cards_total: params.cardsTotal, cards_owned: params.cardsOwned, cards_almost: params.cardsAlmost,
      cards_failed: params.cardsFailed, mastery_rate: params.masteryRate, duration_ms: params.durationMs,
      completed_at: new Date().toISOString(), is_complete: true,
    }, { onConflict: 'id' });
  }

  function setActiveGuru(id) { setActiveGuruId(id); if (id) navigate('guru-detail', { guruId: id }); }

  async function completeGuruStep(guruId, stepId) {
    const updated = { ...completedGuruSteps, [guruId]: [...(completedGuruSteps[guruId] || []), stepId].filter((v, i, a) => a.indexOf(v) === i) };
    setCompletedGuruSteps(updated);
    await supabase.from('memoryos_user_settings').upsert({ user_id: userId, completed_guru_steps: updated, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  }

  function setActiveDomain(id) { setActiveDomainId(id); if (id) navigate('nobel-domain', { domainId: id }); }

  async function refreshMindState() {
    if (!progress.analytics) return;
    setAILoading(true);
    try {
      const [report, insights] = await Promise.all([
        analyzeMindState(progress.analytics, userId),
        generatePerformanceInsights(progress.analytics, userId),
      ]);
      setMindStateReport(report);
      setAIInsights(insights);
      setRecommendations(computeSmartRecommendations(progress.analytics, dailyProgress));
    } catch (err) { console.error('[MemoryOS] Mind state refresh error:', err); }
    finally { setAILoading(false); }
  }

  async function generateCards(text, topic, curriculumId) {
    setAILoading(true);
    try {
      const generated = await generateCardsFromText(text, topic, 8, userId);
      if (generated.length > 0) {
        const newCards = generated.map((c, i) => ({
          id: `ai-${Date.now()}-${i}`, topic: c.topic, difficulty: c.difficulty, icon: c.icon, colorKey: 'sage',
          unit: c.unit, keyPoints: c.keyPoints, box: 0, dueAt: null,
          totalReviews: 0, totalOwned: 0, totalAlmost: 0, totalFailed: 0, lastReviewed: null, masteredAt: null,
        }));
        setAllCards(prev => ({ ...prev, [curriculumId]: [...(prev[curriculumId] || []), ...newCards] }));
      }
      return generated;
    } finally { setAILoading(false); }
  }

  async function sendToCoach(message) {
    const userMsg = { role: 'user', content: message, ts: new Date() };
    setCoachHistory(prev => [...prev, userMsg]);
    setAILoading(true);
    try {
      const reply = await sendCoachMessage(message, coachHistory, userId);
      setCoachHistory(prev => [...prev, { role: 'coach', content: reply, ts: new Date() }]);
    } finally { setAILoading(false); }
  }

  async function* streamToCoach(message) {
    const userMsg = { role: 'user', content: message, ts: new Date() };
    setCoachHistory(prev => [...prev, userMsg]);
    let fullReply = '';
    for await (const chunk of streamCoachMessage(message, coachHistory, userId)) { fullReply += chunk; yield chunk; }
    setCoachHistory(prev => [...prev, { role: 'coach', content: fullReply, ts: new Date() }]);
  }

  function clearCoachHistory() { setCoachHistory([]); }

  async function addCustomCard(curriculumId, card) {
    const newCard = { ...card, box: 0, dueAt: null, totalReviews: 0, totalOwned: 0, totalAlmost: 0, totalFailed: 0, lastReviewed: null, masteredAt: null };
    setAllCards(prev => ({ ...prev, [curriculumId]: [...(prev[curriculumId] || []), newCard] }));
  }

  useEffect(() => {
    if (progress.analytics && initialized) setRecommendations(computeSmartRecommendations(progress.analytics, dailyProgress));
  }, [progress.analytics, initialized]);

  function getGlobalStats() { return progress.getGlobalStats(); }

  return {
    loading, error, initialized, version: MEMORYOS_VERSION,
    screen, navigate, navParams, goBack,
    settings, updateSettings,
    sections, reorderSections, toggleSection,
    allCards, dailyProgress, updateDailyProgress, resetDailyProgress,
    session, startSession, progress, boxes: boxSystem,
    gurus: GURUS, activeGuruId, activeGuruStepId, setActiveGuru,
    setActiveGuruStep: setActiveGuruStepId, completeGuruStep, completedGuruSteps,
    guruGuidanceMode, setGuruGuidanceMode,
    nobelDomains: NOBEL_DOMAINS, activeDomainId, setActiveDomain,
    mindStateReport, aiInsights, recommendations, coachHistory, aiLoading,
    refreshMindState, generateCards, sendToCoach, streamToCoach, clearCoachHistory,
    curricula, activeCurriculumId, setActiveCurriculum: setActiveCurriculumId, addCustomCard,
    lastEvent, getGlobalStats,
  };
}
