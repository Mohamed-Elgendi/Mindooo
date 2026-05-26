// ============================================================
// MEMORYOS — useProgress Hook
// Version: 1.0.0
//
// Calculates all analytics and progress data.
// Reads from Supabase review_history and card_progress.
// Pure computation — no session logic.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { MASTERED_BOX, isCardDue } from '../config/boxes.config.js';



// ─── HOOK ────────────────────────────────────────────────────

export function useProgress(
  supabase,
  userId,
  curricula,
  allCards
) {
  const [analytics,     setAnalytics]     = useState(null);
  const [streak,        setStreak]        = useState(0);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  // ── Compute analytics from local card data ────────────────
  // Fast path — no Supabase needed for card counts

  const computeLocalAnalytics = useCallback(() => {
    const flat = Object.values(allCards).flat();

    const boxDist = {};
    for (let i = 0; i <= 15; i++) boxDist[i] = 0;
    flat.forEach(c => { boxDist[c.box] = (boxDist[c.box] || 0) + 1; });

    const perCurriculum = curricula.map(cur => {
      const cards = allCards[cur.id] || [];
      const totalReviews = cards.reduce((sum, c) => sum + c.totalReviews, 0);
      const totalOwned   = cards.reduce((sum, c) => sum + c.totalOwned,   0);
      const masteryRate  = totalReviews > 0
        ? Math.round((totalOwned / totalReviews) * 100)
        : 0;

      return {
        curriculumId: cur.id,
        label:        cur.label,
        icon:         cur.icon,
        colorKey:     cur.colorKey,
        totalCards:   cards.length,
        inBoxes:      cards.filter(c => c.box > 0).length,
        due:          cards.filter(c => c.box > 0 && isCardDue(c.dueAt)).length,
        mastered:     cards.filter(c => c.box >= MASTERED_BOX).length,
        reviews:      totalReviews,
        masteryRate,
      };
    });

    const totalReviews = flat.reduce((sum, c) => sum + c.totalReviews, 0);
    const totalOwned   = flat.reduce((sum, c) => sum + c.totalOwned,   0);
    const totalAlmost  = flat.reduce((sum, c) => sum + c.totalAlmost,  0);
    const totalFailed  = flat.reduce((sum, c) => sum + c.totalFailed,  0);

    return {
      totalCards:      flat.length,
      totalReviews,
      totalOwned,
      totalAlmost,
      totalFailed,
      cardsInBoxes:    flat.filter(c => c.box > 0).length,
      cardsMastered:   flat.filter(c => c.box >= MASTERED_BOX).length,
      cardsDue:        flat.filter(c => c.box > 0 && isCardDue(c.dueAt)).length,
      masteryRate:     totalReviews > 0
        ? Math.round((totalOwned / totalReviews) * 100)
        : 0,
      boxDistribution: boxDist,
      perCurriculum,
    };
  }, [allCards, curricula]);

  // ── Fetch streak from Supabase ─────────────────────────────

  const fetchStreak = useCallback(async () => {
    const { data, error } = await supabase
      .rpc('memoryos_get_streak', { p_user_id: userId });

    if (error) {
      console.error('[MemoryOS] Streak fetch error:', error);
      return 0;
    }

    return data as number ?? 0;
  }, [supabase, userId]);

  // ── Fetch 7-day activity from Supabase ────────────────────

  const fetchLast7Days = useCallback(async () => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      days.push({
        date:   dateStr,
        label:  d.toLocaleDateString('en', { weekday: 'short' }),
        total:  0,
        owned:  0,
        almost: 0,
        failed: 0,
      });
    }

    const startDate = days[0].date;

    const { data, error } = await supabase
      .from('memoryos_review_history')
      .select('result, reviewed_at')
      .eq('user_id', userId)
      .gte('reviewed_at', `${startDate}T00:00:00Z`);

    if (error) {
      console.error('[MemoryOS] Last 7 days fetch error:', error);
      return days;
    }

    (data || []).forEach((row: { result; reviewed_at }) => {
      const dateStr = row.reviewed_at.split('T')[0];
      const day     = days.find(d => d.date === dateStr);
      if (!day) return;

      day.total++;
      if (row.result === 'owned')  day.owned++;
      if (row.result === 'almost') day.almost++;
      if (row.result === 'fail')   day.failed++;
    });

    return days;
  }, [supabase, userId]);

  // ── Full analytics refresh ────────────────────────────────

  const refreshAnalytics = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [streakVal, last7Days] = await Promise.all([
        fetchStreak(),
        fetchLast7Days(),
      ]);

      const local = computeLocalAnalytics();
      setStreak(streakVal);

      setAnalytics({
        streak:          streakVal,
        masteryRate:     local.masteryRate     ?? 0,
        totalCards:      local.totalCards      ?? 0,
        totalReviews:    local.totalReviews    ?? 0,
        totalOwned:      local.totalOwned      ?? 0,
        totalAlmost:     local.totalAlmost     ?? 0,
        totalFailed:     local.totalFailed     ?? 0,
        cardsInBoxes:    local.cardsInBoxes    ?? 0,
        cardsMastered:   local.cardsMastered   ?? 0,
        cardsDue:        local.cardsDue        ?? 0,
        last7Days,
        boxDistribution: local.boxDistribution ?? {},
        perCurriculum:   local.perCurriculum   ?? [],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      console.error('[MemoryOS] Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, fetchStreak, fetchLast7Days, computeLocalAnalytics]);

  // Auto-refresh when cards change
  useEffect(() => {
    if (userId && Object.keys(allCards).length > 0) {
      refreshAnalytics();
    }
  }, [userId, allCards, refreshAnalytics]);

  // ── Daily progress helpers ────────────────────────────────

  function buildEmptyDailyProgress(curriculumId) {
    return {
      curriculumId,
      date:         new Date().toISOString().split('T')[0],
      reviewDone:   false,
      newDone:      false,
      previewDone:  false,
    };
  }

  function isAllDone(progress) {
    return progress.reviewDone && progress.newDone && progress.previewDone;
  }

  // ── Local quick counts (no async needed) ──────────────────

  function getDueCount(curriculumId) {
    return (allCards[curriculumId] || [])
      .filter(c => c.box > 0 && isCardDue(c.dueAt)).length;
  }

  function getNewCount(curriculumId) {
    return (allCards[curriculumId] || [])
      .filter(c => c.box === 0).length;
  }

  function getMasteredCount(curriculumId) {
    return (allCards[curriculumId] || [])
      .filter(c => c.box >= MASTERED_BOX).length;
  }

  function getTotalCount(curriculumId) {
    return (allCards[curriculumId] || []).length;
  }

  function getGlobalDueCount() {
    return Object.values(allCards).flat()
      .filter(c => c.box > 0 && isCardDue(c.dueAt)).length;
  }

  function getGlobalStats() {
    const flat = Object.values(allCards).flat();
    return {
      total:    flat.length,
      inBoxes:  flat.filter(c => c.box > 0).length,
      mastered: flat.filter(c => c.box >= MASTERED_BOX).length,
      due:      flat.filter(c => c.box > 0 && isCardDue(c.dueAt)).length,
    };
  }

  return {
    // Analytics state
    analytics,
    streak,
    loading,
    error,

    // Actions
    refreshAnalytics,

    // Daily progress helpers
    buildEmptyDailyProgress,
    isAllDone,

    // Quick count helpers (synchronous)
    getDueCount,
    getNewCount,
    getMasteredCount,
    getTotalCount,
    getGlobalDueCount,
    getGlobalStats,
  };
}
