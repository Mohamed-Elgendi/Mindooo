// ============================================================
// MEMORYOS — useSession Hook
// Version: 1.0.0
//
// The complete session state machine.
// Manages all phase transitions, rep counting, write checking,
// mastery judgments, and result recording.
//
// This hook is pure logic — no Supabase calls, no UI.
// All database writes are emitted as callbacks to the parent.
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  getPhasesForSession,
  getPhaseIndexMap,
  getFailRestartRules,
  getRepButtonLabel,
  getPhaseBgTint,
} from '../config/phases.config.js';

import {
  calculateBoxTransition,
  getNextDueAt,
  HIGH_BOX,
} from '../config/boxes.config.js';


// ─── CALLBACK TYPES ──────────────────────────────────────────



  /** Called when the full session completes — persist session record */
  onSessionComplete: (params: {
    sessionId;
    curriculumId;
    sessionType;
    cardsTotal;
    cardsOwned;
    cardsAlmost;
    cardsFailed;
    masteryRate;
    durationMs;
  }

  /** Called when daily progress should be updated */
  onDailyProgressUpdate: (params: {
    curriculumId;
    sessionType;
    done;
  }
}

// ─── INITIAL STATE ────────────────────────────────────────────

function buildInitialState() {
  return {
    sessionId:    '',
    config as any,
    queue:        [],
    currentIndex: 0,
    currentPhase: 0,
    repsDone:     0,
    repsTarget:   5,
    phaseDone:    false,
    cardDone:     false,
    sessionDone:  false,
    writeInput:   '',
    checkResult,
    log:          [],
    timerSeconds: 0,
    timerRunning: false,
    startedAt:    new Date(),
  };
}

// ─── HOOK ────────────────────────────────────────────────────

export function useSession(
  settings,
  callbacks
) {
  const [state, setState]       = useState(buildInitialState);
  const stateRef                = useRef(buildInitialState());
  const timerRef                = useRef | null>(null);
  const cardStartTimeRef        = useRef(Date.now());

  // Keep stateRef in sync with state for use inside async callbacks
  const setStateAndRef = useCallback((updater | ((prev) => SessionState)) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      stateRef.current = next;
      return next;
    });
  }, []);

  // ── Derived values ────────────────────────────────────────

  const card          = state.queue[state.currentIndex] ?? null;
  const phases        = state.config ? getPhasesForSession(state.config.sessionType) : [];
  const curPhase      = phases[state.currentPhase] ?? null;
  const phaseIndexMap = phases.length > 0 ? getPhaseIndexMap(phases) ;
  const failRules     = phases.length > 0 ? getFailRestartRules(phases) ;

  const phaseProgress   = state.repsTarget > 0
    ? Math.min((state.repsDone / state.repsTarget) * 100, 100)
    : 0;

  const sessionProgress = state.queue.length > 0
    ? (state.currentIndex / state.queue.length) * 100
    : 0;

  const masteryRate = state.log.length > 0
    ? Math.round((state.log.filter(l => l.result === 'owned').length / state.log.length) * 100)
    : 0;

  // Phase type flags — used by Session component to decide what to render
  const isBlindPhase     = curPhase?.blind && !state.phaseDone && !state.cardDone;
  const isVerbalCheck    = phaseIndexMap
    ? state.currentPhase === phaseIndexMap.reciteBlindIndex && state.phaseDone && !state.cardDone
    : false;
  const isWriteBridge    = phaseIndexMap
    ? state.currentPhase === phaseIndexMap.writeBridgeIndex && state.phaseDone && !state.cardDone
    : false;
  const isWriteBlind     = phaseIndexMap
    ? state.currentPhase === phaseIndexMap.writeBlindIndex && !state.cardDone
    : false;
  const isPhaseAdvance   = state.phaseDone && !state.cardDone && !isVerbalCheck && !isWriteBridge && !isWriteBlind;
  const showRepCounter   = !state.phaseDone && !state.cardDone && !isWriteBlind;

  const repButtonLabel = curPhase ? getRepButtonLabel(curPhase) : '';
  const phaseBgTint    = curPhase ? getPhaseBgTint(curPhase.colorKey) : '#07080f';

  // ── Timer ─────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStateAndRef(s => ({ ...s, timerSeconds: s.timerSeconds + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    stopTimer();
    setStateAndRef(s => ({ ...s, timerSeconds: 0 }));
  }, [stopTimer]);

  const toggleTimer = useCallback(() => {
    setStateAndRef(s => {
      if (s.timerRunning) {
        stopTimer();
        return { ...s, timerRunning: false };
      } else {
        startTimer();
        return { ...s, timerRunning: true };
      }
    });
  }, [startTimer, stopTimer]);

  // ── Session start ─────────────────────────────────────────

  const startSession = useCallback((
    curriculumId,
    sessionType,
    queue
  ) => {
    stopTimer();

    const sessionId  = uuidv4();
    const phases     = getPhasesForSession(sessionType);
    const repsTarget = settings.usePhaseReps
      ? (settings.phaseReps[1] ?? settings.repsPerPhase)
      : settings.repsPerPhase;

    cardStartTimeRef.current = Date.now();

    setStateAndRef({
      sessionId,
      config: {
        curriculumId,
        sessionType,
        phases,
        repsPerPhase: settings.usePhaseReps ? settings.phaseReps : settings.repsPerPhase,
        mode:         settings.mode,
        dailyNew:     settings.dailyNewCards,
      },
      queue,
      currentIndex: 0,
      currentPhase: 0,
      repsDone:     0,
      repsTarget,
      phaseDone:    false,
      cardDone:     false,
      sessionDone:  false,
      writeInput:   '',
      checkResult,
      log:          [],
      timerSeconds: 0,
      timerRunning: settings.mode === 'timer',
      startedAt:    new Date(),
    });

    if (settings.mode === 'timer') startTimer();
  }, [settings, startTimer, stopTimer]);

  // ── Rep tap ───────────────────────────────────────────────

  const handleRep = useCallback(() => {
    setStateAndRef(s => {
      const next = s.repsDone + 1;
      if (next >= s.repsTarget) {
        return { ...s, repsDone: next, phaseDone: true };
      }
      return { ...s, repsDone: next };
    });
  }, []);

  // ── Adjust reps mid-card ──────────────────────────────────

  const adjustReps = useCallback((delta) => {
    setStateAndRef(s => ({
      ...s,
      repsTarget: Math.max(s.repsDone + 1, s.repsTarget + delta),
    }));
  }, []);

  // ── Advance to next phase ─────────────────────────────────

  const advancePhase = useCallback(() => {
    setStateAndRef(s => {
      const phases     = getPhasesForSession(s.config.sessionType);
      const nextPhase  = s.currentPhase + 1;

      if (nextPhase >= phases.length) {
        // All phases complete
        return { ...s, cardDone: true, phaseDone: false };
      }

      const repsTarget = settings.usePhaseReps
        ? (settings.phaseReps[nextPhase + 1] ?? settings.repsPerPhase)
        : settings.repsPerPhase;

      return {
        ...s,
        currentPhase: nextPhase,
        repsDone:     0,
        repsTarget,
        phaseDone:    false,
        writeInput:   '',
        checkResult,
        timerSeconds: settings.mode === 'timer' ? 0 : s.timerSeconds,
      };
    });
  }, [settings]);

  // ── Verbal fail — restart from phase 0 ───────────────────

  const failVerbal = useCallback(() => {
    const repsTarget = settings.usePhaseReps
      ? (settings.phaseReps[1] ?? settings.repsPerPhase)
      : settings.repsPerPhase;

    setStateAndRef(s => ({
      ...s,
      currentPhase: 0,
      repsDone:     0,
      repsTarget,
      phaseDone:    false,
      writeInput:   '',
      checkResult,
      timerSeconds: settings.mode === 'timer' ? 0 : s.timerSeconds,
    }));
  }, [settings]);

  // ── Written fail — restart from Read→Write phase ──────────

  const failWritten = useCallback(() => {
    setStateAndRef(s => {
      const phases     = getPhasesForSession(s.config.sessionType);
      const failRules  = getFailRestartRules(phases);
      const restartIdx = failRules.writtenFailRestartIndex;

      const repsTarget = settings.usePhaseReps
        ? (settings.phaseReps[restartIdx + 1] ?? settings.repsPerPhase)
        : settings.repsPerPhase;

      return {
        ...s,
        currentPhase: restartIdx,
        repsDone:     0,
        repsTarget,
        phaseDone:    false,
        writeInput:   '',
        checkResult,
        timerSeconds: settings.mode === 'timer' ? 0 : s.timerSeconds,
      };
    });
  }, [settings]);

  // ── Write input ───────────────────────────────────────────

  const setWriteInput = useCallback((value) => {
    setStateAndRef(s => ({ ...s, writeInput: value }));
  }, []);

  // ── Check written answer ──────────────────────────────────

  const checkWritten = useCallback(() => {
    setStateAndRef(s => {
      if (!s.queue[s.currentIndex]) return s;

      const target  = s.queue[s.currentIndex].unit.trim();
      const input   = s.writeInput.trim();
      const correct = input === target;

      const diff: DiffChar[] = [];
      const maxLen = Math.max(target.length, input.length);

      for (let i = 0; i < maxLen; i++) {
        const t = target[i];
        const u = input[i];

        if (!u)       diff.push({ char: t, type: 'missing' });
        else if (!t)  diff.push({ char: u, type: 'extra'   });
        else if (t === u) diff.push({ char: t, type: 'ok'  });
        else          diff.push({ char: t, type: 'wrong'   });
      }

      const result = { correct, diff };
      return { ...s, checkResult: result };
    });
  }, []);

  const retryWrite = useCallback(() => {
    setStateAndRef(s => ({ ...s, writeInput: '', checkResult }));
  }, []);

  // ── Complete all phases after successful write ────────────

  const completeAllPhases = useCallback(() => {
    setStateAndRef(s => ({ ...s, phaseDone: true, cardDone: true }));
  }, []);

  // ── Mark card with result ─────────────────────────────────

  const markCard = useCallback(async (result) => {
    // Use ref for reliable async access to current state
    // (avoids the React closure stale-state problem)
    const s = stateRef.current;

    if (!s.queue[s.currentIndex] || !s.config) return;

    const card        = s.queue[s.currentIndex];
    const phases      = getPhasesForSession(s.config.sessionType);
    const transition  = calculateBoxTransition(card.box, result);
    const timeMsSpent = Date.now() - cardStartTimeRef.current;

    // Record this review
    await callbacks.onCardReviewed({
      cardId:        card.id,
      curriculumId:  s.config.curriculumId,
      sessionId:     s.sessionId,
      sessionType:   s.config.sessionType,
      result,
      boxBefore:     card.box,
      boxAfter:      transition.nextBox,
      repsCompleted: s.repsDone,
      phaseCount:    phases.length,
      timeMsSpent,
    });

    // Update log
    const newLog = [...s.log, { card, result, timeMsSpent }];
    const nextIndex = s.currentIndex + 1;
    const isLast    = nextIndex >= s.queue.length;

    if (isLast) {
      // Session complete
      stopTimer();

      const owned  = newLog.filter(l => l.result === 'owned').length;
      const almost = newLog.filter(l => l.result === 'almost').length;
      const failed = newLog.filter(l => l.result === 'fail').length;
      const rate   = Math.round((owned / newLog.length) * 100);
      const duration = Date.now() - s.startedAt.getTime();

      await callbacks.onSessionComplete({
        sessionId:    s.sessionId,
        curriculumId: s.config.curriculumId,
        sessionType:  s.config.sessionType,
        cardsTotal:   newLog.length,
        cardsOwned:   owned,
        cardsAlmost:  almost,
        cardsFailed:  failed,
        masteryRate:  rate,
        durationMs:   duration,
      });

      await callbacks.onDailyProgressUpdate({
        curriculumId: s.config.curriculumId,
        sessionType:  s.config.sessionType,
        done:         true,
      });

      setStateAndRef(prev => ({ ...prev, log: newLog, sessionDone: true }));
    } else {
      // Advance to next card
      cardStartTimeRef.current = Date.now();

      const repsTarget = settings.usePhaseReps
        ? (settings.phaseReps[1] ?? settings.repsPerPhase)
        : settings.repsPerPhase;

      setStateAndRef(prev => ({
        ...prev,
        log:          newLog,
        currentIndex: nextIndex,
        currentPhase: 0,
        repsDone:     0,
        repsTarget,
        phaseDone:    false,
        cardDone:     false,
        writeInput:   '',
        checkResult,
        timerSeconds: settings.mode === 'timer' ? 0 : prev.timerSeconds,
      }));
    }
  }, [settings, callbacks, stopTimer]);

  // ── End session early ─────────────────────────────────────

  const endSession = useCallback(() => {
    stopTimer();
    setStateAndRef(buildInitialState);
  }, [stopTimer]);

  // ── Restart same session ──────────────────────────────────

  const restartSession = useCallback(() => {
    if (!state.config) return;
    startSession(
      state.config.curriculumId,
      state.config.sessionType,
      state.queue
    );
  }, [state.config, state.queue, startSession]);

  // ── Session log stats ─────────────────────────────────────

  const sessionStats = {
    owned:  state.log.filter(l => l.result === 'owned').length,
    almost: state.log.filter(l => l.result === 'almost').length,
    failed: state.log.filter(l => l.result === 'fail').length,
    total:  state.log.length,
    masteryRate,
  };

  return {
    // State
    state,
    card,
    curPhase,
    phases,
    phaseIndexMap,

    // Progress
    phaseProgress,
    sessionProgress,
    sessionStats,

    // Phase type flags (for conditional rendering)
    isBlindPhase,
    isVerbalCheck,
    isWriteBridge,
    isWriteBlind,
    isPhaseAdvance,
    showRepCounter,
    repButtonLabel,
    phaseBgTint,

    // Actions
    startSession,
    handleRep,
    adjustReps,
    advancePhase,
    failVerbal,
    failWritten,
    setWriteInput,
    checkWritten,
    retryWrite,
    completeAllPhases,
    markCard,
    endSession,
    restartSession,
    toggleTimer,
  };
}
