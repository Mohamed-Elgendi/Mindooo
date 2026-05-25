// src/modules/memoryos/hooks/useMemoryOS.js
// Master hook — single entry point for all MemoryOS state and logic

import { useState, useEffect, useCallback, useRef } from 'react';

import { useSession }    from './useSession.js';
import { useProgress }   from './useProgress.js';
import { useBoxSystem }  from './useBoxSystem.js';

import { getAllCurricula }               from '../curricula/index.js';
import { GURUS }                        from '../data/gurus.data.js';
import { NOBEL_DOMAINS, getAllNobelCards } from '../data/nobel-mind.data.js';

import {
  analyzeMindState,
  generateCardsFromText,
  sendCoachMessage,
  streamCoachMessage,
  generatePerformanceInsights,
  computeSmartRecommendations,
  loadSectionOrder,
  saveSectionOrder,
  DEFAULT_SECTION_ORDER,
} from '../lib/ai-mind-lab.js';

import { DEFAULT_SETTINGS, MEMORYOS_VERSION } from '../config/settings.config.js';
import { getNextDueAt }                        from '../config/boxes.config.js';

// ─── HOOK ────────────────────────────────────────────────────

export function useMemoryOS({
  supabaseClient,
  userId,
  curricula:      customCurricula,
  defaultSettings,
  onEvent,
  initialScreen = 'home',
  initialCurriculumId,
}) {
  const supabase = supabaseClient;

  // ── Core state ─────────────────────────────────────────────
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [initialized,   setInitialized]   = useState(false);
  const [screen,        setScreen]        = useState(initialScreen);
  const [navParams,     setNavParams]     = useState({});
  const [navHistory,    setNavHistory]    = useState([]);

  const [settings,      setSettings]      = useState({ ...DEFAULT_SETTINGS, ...defaultSettings });
  const [sections,      setSections]      = useState(DEFAULT_SECTION_ORDER);
  const [allCards,      setAllCards]      = useState({});
  const [dailyProgress, setDailyProgress] = useState({});
  const [lastEvent,     setLastEvent]     = useState(null);

  // ── Guru state ─────────────────────────────────────────────
  const [activeGuruId,       setActiveGuruId]       = useState(null);
  const [activeGuruStepId,   setActiveGuruStepId]   = useState(null);
  const [completedGuruSteps, setCompletedGuruSteps] = useState({});
  const [guruGuidanceMode,   setGuruGuidanceMode]   = useState('pre-written'); // 'pre-written' | 'ai' | 'hybrid'

  // ── Nobel state ────────────────────────────────────────────
  const [activeDomainId, setActiveDomainId] = useState(null);

  // ── Curriculum state ───────────────────────────────────────
  const curricula = customCurricula || getAllCurricula();
  const [activeCurriculumId, setActiveCurriculumId] = useState(initialCurriculumId || null);

  // ── AI state ──────────────────────────────────────────────
  const [mindStateReport, setMindStateReport] = useState(null);
  const [aiInsights,      setAIInsights]      = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [coachHistory,    setCoachHistory]    = useState([]);
  const [aiLoading,       setAILoading]       = useState(false);

  // ── Sub-hooks ──────────────────────────────────────────────
  const boxSystem = useBoxSystem();

  const sessionCallbacks = {
    onCardReviewed: async (params) => {
      await recordCardReview(params);
    },
    onSessionComplete: async (params) => {
      await recordSessionComplete(params);
      emitEvent('session:completed', params);
    },
    onDailyProgressUpdate: async (params) => {
      await updateDailyProgress(params.curriculumId, params.sessionType, params.done);
    },
  };

  const session  = useSession(settings, sessionCallbacks);
  const progress = useProgress(supabase, userId, curricula, allCards);

  // ── Event emitter ──────────────────────────────────────────
  const emitEvent = useCallback((type, payload) => {
    const event = { type, payload, timestamp: new Date(), userId };
    setLastEvent(event);
    if (onEvent) onEvent(event);
  }, [userId, onEvent]);

  // ── Navigation ─────────────────────────────────────────────
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

  // ── Initialization ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    initializeMemoryOS();
  }, [userId]);

  async function initializeMemoryOS() {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadSettings(),
        loadCardProgress(),
        loadDailyProgress(),
        loadSectionConfig(),
        loadGuruProgress(),
      ]);
      setInitialized(true);
      emitEvent('initialized', { userId });
    } catch (err) {
      const msg = err?.message || 'Failed to initialize MemoryOS';
      setError(msg);
      console.error('[MemoryOS] Init error:', err);
    } finally {
      setLoading(false);
    }
  }

  // ── Load settings ──────────────────────────────────────────
  async function loadSettings() {
    try {
      const { data } = await supabase
        .rpc('memoryos_get_or_create_settings', { p_user_id: userId });
      if (data) {
        setSettings(prev => ({
          ...prev,
          repsPerPhase:  data.reps_per_phase  ?? prev.repsPerPhase,
          mode:          data.mode            ?? prev.mode,
          dailyNewCards: data.daily_new_cards ?? prev.dailyNewCards,
          strictOrder:   data.strict_order    ?? prev.strictOrder,
          showMindmap:   data.show_mindmap    ?? prev.showMindmap,
          showKeypoints: data.show_keypoints  ?? prev.showKeypoints,
          usePhaseReps:  data.use_phase_reps  ?? prev.usePhaseReps,
          phaseReps:     data.phase_reps      ?? prev.phaseReps,
          theme:         data.theme           ?? prev.theme,
          ...defaultSettings,
        }));
      }
    } catch (err) {
      console.warn('[MemoryOS] Settings load failed:', err);
    }
  }

  // ── Load card progress ─────────────────────────────────────
  async function loadCardProgress() {
    const { data, error: err } = await supabase
      .from('memoryos_card_progress')
      .select('*')
      .eq('user_id', userId);

    if (err) throw err;

    // Build progress map keyed by curriculum_id:card_id
    const progressMap = new Map();
    (data || []).forEach(row => {
      progressMap.set(`${row.curriculum_id}:${row.card_id}`, row);
    });

    const merged = {};

    // Merge curriculum cards with progress
    curricula.forEach(curriculum => {
      merged[curriculum.id] = curriculum.cards.map(card => {
        const key  = `${curriculum.id}:${card.id}`;
        const prog = progressMap.get(key);
        return {
          ...card,
          box:          prog?.box           ?? 0,
          dueAt:        prog?.due_at        ? new Date(prog.due_at) : null,
          totalReviews: prog?.total_reviews ?? 0,
          totalOwned:   prog?.total_owned   ?? 0,
          totalAlmost:  prog?.total_almost  ?? 0,
          totalFailed:  prog?.total_failed  ?? 0,
          lastReviewed: prog?.last_reviewed ? new Date(prog.last_reviewed) : null,
          masteredAt:   prog?.mastered_at   ? new Date(prog.mastered_at)   : null,
        };
      });
    });

    // Nobel Mind cards
    const nobelCards = getAllNobelCards();
    merged['nobel-mind'] = nobelCards.map(card => {
      const key  = `nobel-mind:${card.id}`;
      const prog = progressMap.get(key);
      return {
        ...card,
        box:          prog?.box           ?? 0,
        dueAt:        prog?.due_at        ? new Date(prog.due_at) : null,
        totalReviews: prog?.total_reviews ?? 0,
        totalOwned:   prog?.total_owned   ?? 0,
        totalAlmost:  prog?.total_almost  ?? 0,
        totalFailed:  prog?.total_failed  ?? 0,
        lastReviewed: prog?.last_reviewed ? new Date(prog.last_reviewed) : null,
        masteredAt:   prog?.mastered_at   ? new Date(prog.mastered_at)   : null,
      };
    });

    setAllCards(merged);
  }

  // ── Load daily progress ────────────────────────────────────
  async function loadDailyProgress() {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('memoryos_daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    const progressMap = {};

    // Initialize all curricula with false
    curricula.forEach(c => {
      progressMap[c.id] = {
        curriculumId: c.id,
        date:         today,
        reviewDone:   false,
        newDone:      false,
        previewDone:  false,
      };
    });

    // Also initialize nobel-mind
    progressMap['nobel-mind'] = {
      curriculumId: 'nobel-mind',
      date:         today,
      reviewDone:   false,
      newDone:      false,
      previewDone:  false,
    };

    (data || []).forEach(row => {
      progressMap[row.curriculum_id] = {
        curriculumId: row.curriculum_id,
        date:         row.date,
        reviewDone:   row.review_done,
        newDone:      row.new_done,
        previewDone:  row.preview_done,
      };
    });

    setDailyProgress(progressMap);
  }

  // ── Load section config ────────────────────────────────────
  async function loadSectionConfig() {
    try {
      const saved = await loadSectionOrder(userId, supabase);
      setSections(saved);
    } catch {
      setSections(DEFAULT_SECTION_ORDER);
    }
  }

  // ── Load guru progress ─────────────────────────────────────
  async function loadGuruProgress() {
    try {
      const { data } = await supabase
        .from('memoryos_user_settings')
        .select('completed_guru_steps')
        .eq('user_id', userId)
        .single();

      if (data?.completed_guru_steps) {
        setCompletedGuruSteps(data.completed_guru_steps);
      }
    } catch {
      // No guru progress yet — that's fine
    }
  }

  // ── Update settings ────────────────────────────────────────
  async function updateSettings(patch) {
    const updated = { ...settings, ...patch };
    setSettings(updated);

    await supabase
      .from('memoryos_user_settings')
      .upsert({
        user_id:         userId,
        reps_per_phase:  updated.repsPerPhase,
        mode:            updated.mode,
        daily_new_cards: updated.dailyNewCards,
        strict_order:    updated.strictOrder,
        show_mindmap:    updated.showMindmap,
        show_keypoints:  updated.showKeypoints,
        use_phase_reps:  updated.usePhaseReps,
        phase_reps:      updated.phaseReps,
        theme:           updated.theme,
        updated_at:      new Date().toISOString(),
      }, { onConflict: 'user_id' });

    emitEvent('settings:changed', patch);
  }

  // ── Section management ─────────────────────────────────────
  async function reorderSections(newSections) {
    setSections(newSections);
    await saveSectionOrder(newSections, userId, supabase);
  }

  async function toggleSection(id) {
    const updated = sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    await reorderSections(updated);
  }

  // ── Daily progress update ──────────────────────────────────
  async function updateDailyProgress(curriculumId, sessionType, done) {
    const today   = new Date().toISOString().split('T')[0];
    const current = dailyProgress[curriculumId] || {
      curriculumId, date: today,
      reviewDone: false, newDone: false, previewDone: false,
    };

    const updated = {
      ...current,
      reviewDone:  sessionType === 'review'  ? done : current.reviewDone,
      newDone:     sessionType === 'new'      ? done : current.newDone,
      previewDone: sessionType === 'preview'  ? done : current.previewDone,
    };

    setDailyProgress(prev => ({ ...prev, [curriculumId]: updated }));

    await supabase
      .from('memoryos_daily_progress')
      .upsert({
        user_id:       userId,
        curriculum_id: curriculumId,
        date:          today,
        review_done:   updated.reviewDone,
        new_done:      updated.newDone,
        preview_done:  updated.previewDone,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'user_id,curriculum_id,date' });
  }

  async function resetDailyProgress() {
    const today   = new Date().toISOString().split('T')[0];
    const allIds  = [...curricula.map(c => c.id), 'nobel-mind'];
    const reset   = {};
    allIds.forEach(id => {
      reset[id] = { curriculumId: id, date: today, reviewDone: false, newDone: false, previewDone: false };
    });
    setDailyProgress(reset);
    await supabase.from('memoryos_daily_progress').upsert(
      allIds.map(id => ({ user_id: userId, curriculum_id: id, date: today, review_done: false, new_done: false, preview_done: false })),
      { onConflict: 'user_id,curriculum_id,date' }
    );
  }

  // ── Start session ──────────────────────────────────────────
  function startSession(curriculumId, sessionType) {
    const cards = allCards[curriculumId] || [];
    const queue = boxSystem.getQueueForSession(cards, sessionType, settings.dailyNewCards);
    if (!queue.length) return;
    session.startSession(curriculumId, sessionType, queue);
    navigate('session');
    emitEvent('session:started', { curriculumId, sessionType, queueLength: queue.length });
  }

  // ── Record card review ─────────────────────────────────────
  async function recordCardReview(params) {
    // Optimistic UI update
    setAllCards(prev => {
      const currCards = prev[params.curriculumId] || [];
      return {
        ...prev,
        [params.curriculumId]: currCards.map(c => {
          if (c.id !== params.cardId) return c;
          const dueAt = getNextDueAt(params.boxAfter);
          return {
            ...c,
            box:          params.boxAfter,
            dueAt,
            totalReviews: (c.totalReviews || 0) + 1,
            totalOwned:   (c.totalOwned   || 0) + (params.result === 'owned'  ? 1 : 0),
            totalAlmost:  (c.totalAlmost  || 0) + (params.result === 'almost' ? 1 : 0),
            totalFailed:  (c.totalFailed  || 0) + (params.result === 'fail'   ? 1 : 0),
            lastReviewed: new Date(),
            masteredAt:   params.boxAfter >= 14 && !c.masteredAt ? new Date() : c.masteredAt,
          };
        }),
      };
    });

    // Persist to Supabase
    await supabase.rpc('memoryos_record_review', {
      p_user_id:       userId,
      p_curriculum_id: params.curriculumId,
      p_card_id:       params.cardId,
      p_session_id:    params.sessionId,
      p_session_type:  params.sessionType,
      p_result:        params.result,
      p_box_before:    params.boxBefore,
      p_box_after:     params.boxAfter,
      p_reps:          params.repsCompleted,
      p_phase_count:   params.phaseCount,
      p_time_ms:       params.timeMsSpent,
    });

    if (params.boxAfter >= 14) {
      emitEvent('card:mastered', { cardId: params.cardId, curriculumId: params.curriculumId });
    }
    emitEvent('card:reviewed', params);
  }

  // ── Record session complete ────────────────────────────────
  async function recordSessionComplete(params) {
    await supabase.from('memoryos_sessions').upsert({
      id:            params.sessionId,
      user_id:       userId,
      curriculum_id: params.curriculumId,
      session_type:  params.sessionType,
      cards_total:   params.cardsTotal,
      cards_owned:   params.cardsOwned,
      cards_almost:  params.cardsAlmost,
      cards_failed:  params.cardsFailed,
      mastery_rate:  params.masteryRate,
      duration_ms:   params.durationMs,
      completed_at:  new Date().toISOString(),
      is_complete:   true,
    }, { onConflict: 'id' });
  }

  // ── Guru management ────────────────────────────────────────
  function setActiveGuru(id) {
    setActiveGuruId(id);
    if (id) navigate('guru-detail', { guruId: id });
  }

  async function completeGuruStep(guruId, stepId) {
    const updated = {
      ...completedGuruSteps,
      [guruId]: [...(completedGuruSteps[guruId] || []), stepId]
        .filter((v, i, a) => a.indexOf(v) === i),
    };
    setCompletedGuruSteps(updated);
    await supabase.from('memoryos_user_settings').upsert({
      user_id:              userId,
      completed_guru_steps: updated,
      updated_at:           new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  // ── Nobel management ───────────────────────────────────────
  function setActiveDomain(id) {
    setActiveDomainId(id);
    if (id) navigate('nobel-domain', { domainId: id });
  }

  // ── AI Mind Lab ────────────────────────────────────────────
  async function refreshMindState() {
    if (!progress.analytics) return;
    setAILoading(true);
    try {
      const [report, insights] = await Promise.all([
        analyzeMindState(progress.analytics, userId, supabase),
        generatePerformanceInsights(progress.analytics, userId, supabase),
      ]);
      setMindStateReport(report);
      setAIInsights(insights);
      const recs = computeSmartRecommendations(progress.analytics, dailyProgress);
      setRecommendations(recs);
    } catch (err) {
      console.error('[MemoryOS] Mind state refresh error:', err);
    } finally {
      setAILoading(false);
    }
  }

  async function generateCards(text, topic, curriculumId) {
    setAILoading(true);
    try {
      const generated = await generateCardsFromText(text, topic, 8, userId, supabase);
      if (generated.length > 0) {
        const newCards = generated.map((c, i) => ({
          id:           `ai-${Date.now()}-${i}`,
          topic:        c.topic,
          difficulty:   c.difficulty,
          icon:         c.icon,
          colorKey:     'sage',
          unit:         c.unit,
          keyPoints:    c.keyPoints,
          box:          0,
          dueAt:        null,
          totalReviews: 0,
          totalOwned:   0,
          totalAlmost:  0,
          totalFailed:  0,
          lastReviewed: null,
          masteredAt:   null,
        }));
        setAllCards(prev => ({
          ...prev,
          [curriculumId]: [...(prev[curriculumId] || []), ...newCards],
        }));
      }
      return generated;
    } finally {
      setAILoading(false);
    }
  }

  async function sendToCoach(message) {
    const userMsg = { role: 'user', content: message, ts: new Date() };
    setCoachHistory(prev => [...prev, userMsg]);
    setAILoading(true);
    try {
      const reply   = await sendCoachMessage(message, coachHistory, userId, supabase);
      const coachMsg = { role: 'coach', content: reply, ts: new Date() };
      setCoachHistory(prev => [...prev, coachMsg]);
    } finally {
      setAILoading(false);
    }
  }

  async function* streamToCoach(message) {
    const userMsg = { role: 'user', content: message, ts: new Date() };
    setCoachHistory(prev => [...prev, userMsg]);
    let fullReply = '';
    for await (const chunk of streamCoachMessage(message, coachHistory, userId, supabase)) {
      fullReply += chunk;
      yield chunk;
    }
    const coachMsg = { role: 'coach', content: fullReply, ts: new Date() };
    setCoachHistory(prev => [...prev, coachMsg]);
  }

  function clearCoachHistory() { setCoachHistory([]); }

  // ── Add custom card ────────────────────────────────────────
  async function addCustomCard(curriculumId, card) {
    const newCard = {
      ...card,
      box: 0, dueAt: null,
      totalReviews: 0, totalOwned: 0, totalAlmost: 0, totalFailed: 0,
      lastReviewed: null, masteredAt: null,
    };
    setAllCards(prev => ({
      ...prev,
      [curriculumId]: [...(prev[curriculumId] || []), newCard],
    }));
  }

  // ── Auto-refresh recommendations when analytics change ─────
  useEffect(() => {
    if (progress.analytics && initialized) {
      const recs = computeSmartRecommendations(progress.analytics, dailyProgress);
      setRecommendations(recs);
    }
  }, [progress.analytics, initialized]);

  // ── Global stats helper ────────────────────────────────────
  function getGlobalStats() {
    return progress.getGlobalStats();
  }

  // ── Return ─────────────────────────────────────────────────
  return {
    // State
    loading,
    error,
    initialized,
    version: MEMORYOS_VERSION,

    // Navigation
    screen,
    navigate,
    navParams,
    goBack,

    // Settings
    settings,
    updateSettings,

    // Sections
    sections,
    reorderSections,
    toggleSection,

    // Cards
    allCards,

    // Daily progress
    dailyProgress,
    updateDailyProgress,
    resetDailyProgress,

    // Session
    session,
    startSession,

    // Progress & analytics
    progress,

    // Box system
    boxes: boxSystem,

    // Guru Center
    gurus:              GURUS,
    activeGuruId,
    activeGuruStepId,
    setActiveGuru,
    setActiveGuruStep:  setActiveGuruStepId,
    completeGuruStep,
    completedGuruSteps,
    guruGuidanceMode,
    setGuruGuidanceMode,

    // Nobel Mind
    nobelDomains:   NOBEL_DOMAINS,
    activeDomainId,
    setActiveDomain,

    // AI Mind Lab
    mindStateReport,
    aiInsights,
    recommendations,
    coachHistory,
    aiLoading,
    refreshMindState,
    generateCards,
    sendToCoach,
    streamToCoach,
    clearCoachHistory,

    // Curricula
    curricula,
    activeCurriculumId,
    setActiveCurriculum: setActiveCurriculumId,
    addCustomCard,

    // Events
    lastEvent,

    // Helpers
    getGlobalStats,
  };
}
