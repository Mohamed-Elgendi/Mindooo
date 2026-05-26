// ============================================================
// MEMORYOS — useBoxSystem Hook
// Version: 1.0.0
//
// Handles all SRS (Spaced Repetition System) calculations.
// Pure logic — no UI, no Supabase calls.
// Used by useSession and useProgress.
// ============================================================

import {
  BOXES,
  MAX_BOX,
  NEW_BOX,
  HIGH_BOX,
  MASTERED_BOX,
  getNextDueAt,
  isCardDue,
  calculateBoxTransition,
  buildBoxStatus,

} from '../config/boxes.config.js';


// ─── HOOK ────────────────────────────────────────────────────
export function useBoxSystem() {

  // ── Queue builders ────────────────────────────────────────

  /** Cards available for Box Review (due and in boxes) */
  function getReviewQueue(cards) {
    return cards
      .filter(c => c.box > NEW_BOX && isCardDue(c.dueAt))
      .sort((a, b) => {
        // Due longest ago first
        const aTime = a.dueAt?.getTime() ?? 0;
        const bTime = b.dueAt?.getTime() ?? 0;
        return aTime - bTime;
      });
  }

  /** Cards available for New Learning (never studied) */
  function getNewQueue(
    cards[],
    limit
  ) {
    return cards
      .filter(c => c.box === NEW_BOX)
      .slice(0, limit);
  }

  /** Cards available for Preview (upcoming, not yet due) */
  function getPreviewQueue(
    cards[],
    limit = 8
  ) {
    return cards
      .filter(c => c.box > NEW_BOX && !isCardDue(c.dueAt))
      .sort((a, b) => {
        // Due soonest first (priming upcoming content)
        const aTime = a.dueAt?.getTime() ?? Infinity;
        const bTime = b.dueAt?.getTime() ?? Infinity;
        return aTime - bTime;
      })
      .slice(0, limit);
  }

  /** Get the correct queue for a session type */
  function getQueueForSession(
    cards,
    sessionType,
    dailyNew
  ) {
    switch (sessionType) {
      case 'review':  return getReviewQueue(cards);
      case 'new':     return getNewQueue(cards, dailyNew);
      case 'preview': return getPreviewQueue(cards);
      default:        return [];
    }
  }

  // ── Box transitions ───────────────────────────────────────

  /** Calculate the next box and due date after a review result */
  function applyResult(
    card,
    result
  ) {
    return calculateBoxTransition(card.box, result);
  }

  /** Whether a fail should trigger high-box rules (box 8+) */
  function isHighBoxFail(card) {
    return card.box >= HIGH_BOX;
  }

  // ── Count helpers ─────────────────────────────────────────

  function countNew(cards) {
    return cards.filter(c => c.box === NEW_BOX).length;
  }

  function countDue(cards) {
    return cards.filter(c => c.box > NEW_BOX && isCardDue(c.dueAt)).length;
  }

  function countInBoxes(cards) {
    return cards.filter(c => c.box > NEW_BOX).length;
  }

  function countMastered(cards) {
    return cards.filter(c => c.box >= MASTERED_BOX).length;
  }

  function countByBox(cards) {
    const result = {};
    for (let i = 0; i <= MAX_BOX; i++) result[i] = 0;
    cards.forEach(c => { result[c.box] = (result[c.box] || 0) + 1; });
    return result;
  }

  // ── Status builders ───────────────────────────────────────

  function getBoxStatus(cards) {
    return buildBoxStatus(cards);
  }

  // ── Session availability ──────────────────────────────────

  /** Whether a session type has cards available to study */
  function hasCardsForSession(
    cards,
    sessionType,
    dailyNew
  ) {
    return getQueueForSession(cards, sessionType, dailyNew).length > 0;
  }

  /** Why a session has no cards (for user-facing messages) */
  function getEmptySessionReason(
    cards,
    sessionType
  ) {
    switch (sessionType) {
      case 'review':
        if (countDue(cards) === 0 && countInBoxes(cards) > 0) {
          return 'No cards due yet — all your cards are scheduled for future review. Come back later!';
        }
        return 'No cards in boxes yet — complete New Learning first to add cards to the box system.';

      case 'new':
        if (countNew(cards) === 0 && countInBoxes(cards) > 0) {
          return 'All cards have been studied. Check Box Review for cards due today.';
        }
        return 'No cards available. Add cards to this curriculum first.';

      case 'preview':
        return 'No upcoming cards to preview yet. Complete some New Learning sessions first.';

      default:
        return 'No cards available for this session.';
    }
  }

  // ── Session order enforcement ─────────────────────────────

  /**
   * Whether a session type can be started given daily progress.
   *
   * Rules:
   * - Box Review: always accessible
   * - New Learning: free if no cards are due (Day 1 / all caught up),
   *                 otherwise requires Review to be done first
   * - Preview: free if no new cards remain,
   *            otherwise requires New Learning done first
   */
  function canStartSession(
    cards,
    sessionType,
    dailyProgress: { reviewDone; newDone; previewDone },
    strictOrder
  ) {
    if (!strictOrder) return true;

    const dueCount = countDue(cards);
    const newCount = countNew(cards);

    switch (sessionType) {
      case 'review':
        return true;

      case 'new':
        // If there are no due cards, New Learning is always free
        // (covers Day 1 and the case where user is caught up)
        if (dueCount === 0) return true;
        return dailyProgress.reviewDone;

      case 'preview':
        // If all cards are in boxes, only require review done
        if (newCount === 0) return dailyProgress.reviewDone;
        return dailyProgress.newDone;

      default:
        return false;
    }
  }

  /** Which session to suggest skipping to unlock the current one */
  function getBlockingSession(sessionType) | null {
    switch (sessionType) {
      case 'new':     return 'review';
      case 'preview': return 'new';
      default:        return null;
    }
  }

  return {
    // Queue builders
    getReviewQueue,
    getNewQueue,
    getPreviewQueue,
    getQueueForSession,

    // Box transitions
    applyResult,
    isHighBoxFail,

    // Count helpers
    countNew,
    countDue,
    countInBoxes,
    countMastered,
    countByBox,

    // Status
    getBoxStatus,

    // Session availability
    hasCardsForSession,
    getEmptySessionReason,

    // Order enforcement
    canStartSession,
    getBlockingSession,

    // Re-export config constants for convenience
    BOXES,
    MAX_BOX,
    NEW_BOX,
    HIGH_BOX,
    MASTERED_BOX,
    getNextDueAt,
    isCardDue,
  };
}
