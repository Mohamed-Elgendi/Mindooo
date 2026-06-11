// src/modules/memoryos/hooks/useBoxSystem.js
import {
  BOXES, MAX_BOX, NEW_BOX, HIGH_BOX, MASTERED_BOX,
  getNextDueAt, isCardDue, calculateBoxTransition, buildBoxStatus,
} from '../config/boxes.config.js';

export function useBoxSystem() {

  function getReviewQueue(cards) {
    return cards
      .filter(c => c.box > NEW_BOX && isCardDue(c.dueAt))
      .sort((a, b) => {
        const aTime = a.dueAt ? new Date(a.dueAt).getTime() : 0;
        const bTime = b.dueAt ? new Date(b.dueAt).getTime() : 0;
        return aTime - bTime;
      });
  }

  function getNewQueue(cards, limit) {
    return cards.filter(c => c.box === NEW_BOX).slice(0, limit);
  }

  function getPreviewQueue(cards, limit = 8) {
    return cards
      .filter(c => c.box > NEW_BOX && !isCardDue(c.dueAt))
      .sort((a, b) => {
        const aTime = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
        const bTime = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
        return aTime - bTime;
      })
      .slice(0, limit);
  }

  function getQueueForSession(cards, sessionType, dailyNew) {
    switch (sessionType) {
      case 'review':  return getReviewQueue(cards);
      case 'new':     return getNewQueue(cards, dailyNew);
      case 'preview': return getPreviewQueue(cards);
      default:        return [];
    }
  }

  function applyResult(card, result) {
    return calculateBoxTransition(card.box, result);
  }

  function isHighBoxFail(card) { return card.box >= HIGH_BOX; }
  function countNew(cards)      { return cards.filter(c => c.box === NEW_BOX).length; }
  function countDue(cards)      { return cards.filter(c => c.box > NEW_BOX && isCardDue(c.dueAt)).length; }
  function countInBoxes(cards)  { return cards.filter(c => c.box > NEW_BOX).length; }
  function countMastered(cards) { return cards.filter(c => c.box >= MASTERED_BOX).length; }

  function countByBox(cards) {
    const result = {};
    for (let i = 0; i <= MAX_BOX; i++) result[i] = 0;
    cards.forEach(c => { result[c.box] = (result[c.box] || 0) + 1; });
    return result;
  }

  function getBoxStatus(cards) { return buildBoxStatus(cards); }

  function hasCardsForSession(cards, sessionType, dailyNew) {
    return getQueueForSession(cards, sessionType, dailyNew).length > 0;
  }

  function getEmptySessionReason(cards, sessionType) {
    switch (sessionType) {
      case 'review':
        if (countDue(cards) === 0 && countInBoxes(cards) > 0)
          return 'No cards due yet — all scheduled for future review. Come back later!';
        return 'No cards in boxes yet — complete New Learning first.';
      case 'new':
        if (countNew(cards) === 0 && countInBoxes(cards) > 0)
          return 'All cards have been studied. Check Box Review for cards due today.';
        return 'No cards available. Add cards to this curriculum first.';
      case 'preview':
        return 'No upcoming cards to preview yet. Complete some New Learning sessions first.';
      default:
        return 'No cards available for this session.';
    }
  }

  function canStartSession(cards, sessionType, dailyProgress, strictOrder) {
    if (!strictOrder) return true;
    const dueCount = countDue(cards);
    const newCount = countNew(cards);
    switch (sessionType) {
      case 'review':  return true;
      case 'new':     return dueCount === 0 ? true : (dailyProgress?.reviewDone || false);
      case 'preview': return newCount === 0 ? (dailyProgress?.reviewDone || false) : (dailyProgress?.newDone || false);
      default:        return false;
    }
  }

  function getBlockingSession(sessionType) {
    switch (sessionType) {
      case 'new':     return 'review';
      case 'preview': return 'new';
      default:        return null;
    }
  }

  return {
    getReviewQueue, getNewQueue, getPreviewQueue, getQueueForSession,
    applyResult, isHighBoxFail,
    countNew, countDue, countInBoxes, countMastered, countByBox,
    getBoxStatus, hasCardsForSession, getEmptySessionReason,
    canStartSession, getBlockingSession,
    BOXES, MAX_BOX, NEW_BOX, HIGH_BOX, MASTERED_BOX, getNextDueAt, isCardDue,
  };
}
