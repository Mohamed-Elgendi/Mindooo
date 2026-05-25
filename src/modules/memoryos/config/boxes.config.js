// src/modules/memoryos/config/boxes.config.js
export const BOXES = [
  { box: 1,  label: '1 hour',     short: '1h',   ms: 1000 * 60 * 60 },
  { box: 2,  label: '24 hours',   short: '24h',  ms: 1000 * 60 * 60 * 24 },
  { box: 3,  label: '3 days',     short: '3d',   ms: 1000 * 60 * 60 * 24 * 3 },
  { box: 4,  label: '7 days',     short: '7d',   ms: 1000 * 60 * 60 * 24 * 7 },
  { box: 5,  label: '14 days',    short: '14d',  ms: 1000 * 60 * 60 * 24 * 14 },
  { box: 6,  label: '21 days',    short: '21d',  ms: 1000 * 60 * 60 * 24 * 21 },
  { box: 7,  label: '30 days',    short: '30d',  ms: 1000 * 60 * 60 * 24 * 30 },
  { box: 8,  label: '40 days',    short: '40d',  ms: 1000 * 60 * 60 * 24 * 40 },
  { box: 9,  label: '60 days',    short: '60d',  ms: 1000 * 60 * 60 * 24 * 60 },
  { box: 10, label: '90 days',    short: '90d',  ms: 1000 * 60 * 60 * 24 * 90 },
  { box: 11, label: '120 days',   short: '4mo',  ms: 1000 * 60 * 60 * 24 * 120 },
  { box: 12, label: '180 days',   short: '6mo',  ms: 1000 * 60 * 60 * 24 * 180 },
  { box: 13, label: '9 months',   short: '9mo',  ms: 1000 * 60 * 60 * 24 * 270 },
  { box: 14, label: '1 year',     short: '1yr',  ms: 1000 * 60 * 60 * 24 * 365 },
  { box: 15, label: '∞ 3 months', short: '∞3mo', ms: 1000 * 60 * 60 * 24 * 90  },
];

export const MAX_BOX      = 15;
export const MASTERED_BOX = 14;
export const NEW_BOX      = 0;
export const HIGH_BOX     = 8;

export function getBox(box) {
  const clamped = Math.max(1, Math.min(box, MAX_BOX));
  return BOXES[clamped - 1];
}

export function getNextDueAt(box) {
  const interval = getBox(box);
  return new Date(Date.now() + interval.ms);
}

export function isCardDue(dueAt) {
  if (!dueAt) return true;
  return new Date() >= new Date(dueAt);
}

export function calculateBoxTransition(currentBox, result) {
  switch (result) {
    case 'owned': {
      const nextBox = Math.min(currentBox + 1, MAX_BOX);
      return { nextBox, nextDueAt: getNextDueAt(nextBox), reason: `Owned → Box ${nextBox}` };
    }
    case 'almost': {
      const stayBox = Math.max(currentBox, 1);
      return { nextBox: stayBox, nextDueAt: getNextDueAt(stayBox), reason: `Almost → Stay Box ${stayBox}` };
    }
    case 'fail':
    default:
      return { nextBox: 1, nextDueAt: getNextDueAt(1), reason: `Fail → Box 1` };
  }
}

export function buildBoxStatus(cards) {
  return BOXES.slice(0, 14).map(b => {
    const boxCards = cards.filter(c => c.box === b.box);
    const dueCards = boxCards.filter(c => isCardDue(c.dueAt));
    return { box: b.box, label: b.label, short: b.short, count: boxCards.length, dueCount: dueCards.length, isEmpty: boxCards.length === 0 };
  });
}
