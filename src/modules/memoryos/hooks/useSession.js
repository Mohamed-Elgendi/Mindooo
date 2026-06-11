// src/modules/memoryos/hooks/useSession.js
import { useState, useCallback, useRef } from 'react';
import {
  getPhasesForSession, getPhaseIndexMap, getFailRestartRules,
  getRepButtonLabel, getPhaseBgTint, getPhaseColor,
} from '../config/phases.config.js';
import { calculateBoxTransition } from '../config/boxes.config.js';

function buildInitialState() {
  return {
    sessionId: '', config: null, queue: [], currentIndex: 0,
    currentPhase: 0, repsDone: 0, repsTarget: 5,
    phaseDone: false, cardDone: false, sessionDone: false,
    writeInput: '', checkResult: null, log: [],
    timerSeconds: 0, timerRunning: false, startedAt: new Date(),
  };
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useSession(settings, callbacks) {
  const [state, setState]    = useState(buildInitialState);
  const stateRef             = useRef(buildInitialState());
  const timerRef             = useRef(null);
  const cardStartTimeRef     = useRef(Date.now());

  const setStateAndRef = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      stateRef.current = next;
      return next;
    });
  }, []);

  const card          = state.queue[state.currentIndex] ?? null;
  const phases        = state.config ? getPhasesForSession(state.config.sessionType) : [];
  const curPhase      = phases[state.currentPhase] ?? null;
  const phaseIndexMap = phases.length > 0 ? getPhaseIndexMap(phases) : null;

  const phaseProgress   = state.repsTarget > 0 ? Math.min((state.repsDone / state.repsTarget) * 100, 100) : 0;
  const sessionProgress = state.queue.length > 0 ? (state.currentIndex / state.queue.length) * 100 : 0;
  const masteryRate     = state.log.length > 0 ? Math.round((state.log.filter(l => l.result === 'owned').length / state.log.length) * 100) : 0;

  const isVerbalCheck  = phaseIndexMap ? state.currentPhase === phaseIndexMap.reciteBlindIndex && state.phaseDone && !state.cardDone : false;
  const isWriteBridge  = phaseIndexMap ? state.currentPhase === phaseIndexMap.writeBridgeIndex && state.phaseDone && !state.cardDone : false;
  const isWriteBlind   = phaseIndexMap ? state.currentPhase === phaseIndexMap.writeBlindIndex && !state.cardDone : false;
  const isBlindPhase   = curPhase?.blind && !state.phaseDone && !state.cardDone;
  const isPhaseAdvance = state.phaseDone && !state.cardDone && !isVerbalCheck && !isWriteBridge && !isWriteBlind;
  const showRepCounter = !state.phaseDone && !state.cardDone && !isWriteBlind;
  const repButtonLabel = curPhase ? getRepButtonLabel(curPhase) : '';
  const phaseBgTint    = curPhase ? getPhaseBgTint(curPhase.colorKey) : '#07080f';
  const phaseColor     = curPhase ? getPhaseColor(curPhase.colorKey) : '#3dd9c4';

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStateAndRef(s => ({ ...s, timerSeconds: s.timerSeconds + 1 }));
    }, 1000);
  }, [setStateAndRef]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const toggleTimer = useCallback(() => {
    setStateAndRef(s => {
      if (s.timerRunning) { stopTimer(); return { ...s, timerRunning: false }; }
      startTimer(); return { ...s, timerRunning: true };
    });
  }, [startTimer, stopTimer, setStateAndRef]);

  const startSession = useCallback((curriculumId, sessionType, queue) => {
    stopTimer();
    const sessionId  = generateId();
    const repsTarget = settings.usePhaseReps ? (settings.phaseReps[1] ?? settings.repsPerPhase) : settings.repsPerPhase;
    cardStartTimeRef.current = Date.now();
    const newState = {
      sessionId,
      config: { curriculumId, sessionType, repsPerPhase: settings.repsPerPhase, mode: settings.mode },
      queue, currentIndex: 0, currentPhase: 0, repsDone: 0, repsTarget,
      phaseDone: false, cardDone: false, sessionDone: false,
      writeInput: '', checkResult: null, log: [],
      timerSeconds: 0, timerRunning: settings.mode === 'timer', startedAt: new Date(),
    };
    stateRef.current = newState;
    setState(newState);
    if (settings.mode === 'timer') startTimer();
  }, [settings, startTimer, stopTimer]);

  const handleRep = useCallback(() => {
    setStateAndRef(s => {
      const next = s.repsDone + 1;
      return next >= s.repsTarget ? { ...s, repsDone: next, phaseDone: true } : { ...s, repsDone: next };
    });
  }, [setStateAndRef]);

  const adjustReps = useCallback((delta) => {
    setStateAndRef(s => ({ ...s, repsTarget: Math.max(s.repsDone + 1, s.repsTarget + delta) }));
  }, [setStateAndRef]);

  const advancePhase = useCallback(() => {
    setStateAndRef(s => {
      const phases    = getPhasesForSession(s.config.sessionType);
      const nextPhase = s.currentPhase + 1;
      if (nextPhase >= phases.length) return { ...s, cardDone: true, phaseDone: false };
      const repsTarget = settings.usePhaseReps ? (settings.phaseReps[nextPhase + 1] ?? settings.repsPerPhase) : settings.repsPerPhase;
      return { ...s, currentPhase: nextPhase, repsDone: 0, repsTarget, phaseDone: false, writeInput: '', checkResult: null, timerSeconds: settings.mode === 'timer' ? 0 : s.timerSeconds };
    });
  }, [settings, setStateAndRef]);

  const failVerbal = useCallback(() => {
    const repsTarget = settings.usePhaseReps ? (settings.phaseReps[1] ?? settings.repsPerPhase) : settings.repsPerPhase;
    setStateAndRef(s => ({ ...s, currentPhase: 0, repsDone: 0, repsTarget, phaseDone: false, writeInput: '', checkResult: null, timerSeconds: settings.mode === 'timer' ? 0 : s.timerSeconds }));
  }, [settings, setStateAndRef]);

  const failWritten = useCallback(() => {
    setStateAndRef(s => {
      const phases     = getPhasesForSession(s.config.sessionType);
      const failRules  = getFailRestartRules(phases);
      const restartIdx = failRules.writtenFailRestartIndex;
      const repsTarget = settings.usePhaseReps ? (settings.phaseReps[restartIdx + 1] ?? settings.repsPerPhase) : settings.repsPerPhase;
      return { ...s, currentPhase: restartIdx, repsDone: 0, repsTarget, phaseDone: false, writeInput: '', checkResult: null, timerSeconds: settings.mode === 'timer' ? 0 : s.timerSeconds };
    });
  }, [settings, setStateAndRef]);

  const setWriteInput = useCallback((value) => {
    setStateAndRef(s => ({ ...s, writeInput: value }));
  }, [setStateAndRef]);

  const checkWritten = useCallback(() => {
    setStateAndRef(s => {
      if (!s.queue[s.currentIndex]) return s;
      const target  = s.queue[s.currentIndex].unit.trim();
      const input   = s.writeInput.trim();
      const correct = input === target;
      const diff    = [];
      const maxLen  = Math.max(target.length, input.length);
      for (let i = 0; i < maxLen; i++) {
        const t = target[i], u = input[i];
        if (!u)       diff.push({ char: t, type: 'missing' });
        else if (!t)  diff.push({ char: u, type: 'extra' });
        else if (t === u) diff.push({ char: t, type: 'ok' });
        else          diff.push({ char: t, type: 'wrong' });
      }
      return { ...s, checkResult: { correct, diff } };
    });
  }, [setStateAndRef]);

  const retryWrite        = useCallback(() => { setStateAndRef(s => ({ ...s, writeInput: '', checkResult: null })); }, [setStateAndRef]);
  const completeAllPhases = useCallback(() => { setStateAndRef(s => ({ ...s, phaseDone: true, cardDone: true })); }, [setStateAndRef]);

  const markCard = useCallback(async (result) => {
    const s = stateRef.current;
    if (!s.queue[s.currentIndex] || !s.config) return;

    const card        = s.queue[s.currentIndex];
    const phases      = getPhasesForSession(s.config.sessionType);
    const transition  = calculateBoxTransition(card.box, result);
    const timeMsSpent = Date.now() - cardStartTimeRef.current;

    await callbacks.onCardReviewed({
      cardId: card.id, curriculumId: s.config.curriculumId, sessionId: s.sessionId,
      sessionType: s.config.sessionType, result, boxBefore: card.box,
      boxAfter: transition.nextBox, repsCompleted: s.repsDone,
      phaseCount: phases.length, timeMsSpent,
    });

    const newLog    = [...s.log, { card, result, timeMsSpent }];
    const nextIndex = s.currentIndex + 1;
    const isLast    = nextIndex >= s.queue.length;

    if (isLast) {
      stopTimer();
      const owned    = newLog.filter(l => l.result === 'owned').length;
      const almost   = newLog.filter(l => l.result === 'almost').length;
      const failed   = newLog.filter(l => l.result === 'fail').length;
      const rate     = Math.round((owned / newLog.length) * 100);
      const duration = Date.now() - s.startedAt.getTime();

      await callbacks.onSessionComplete({
        sessionId: s.sessionId, curriculumId: s.config.curriculumId,
        sessionType: s.config.sessionType, cardsTotal: newLog.length,
        cardsOwned: owned, cardsAlmost: almost, cardsFailed: failed,
        masteryRate: rate, durationMs: duration,
      });
      await callbacks.onDailyProgressUpdate({ curriculumId: s.config.curriculumId, sessionType: s.config.sessionType, done: true });
      setStateAndRef(prev => ({ ...prev, log: newLog, sessionDone: true }));
    } else {
      cardStartTimeRef.current = Date.now();
      const repsTarget = settings.usePhaseReps ? (settings.phaseReps[1] ?? settings.repsPerPhase) : settings.repsPerPhase;
      setStateAndRef(prev => ({
        ...prev, log: newLog, currentIndex: nextIndex, currentPhase: 0,
        repsDone: 0, repsTarget, phaseDone: false, cardDone: false,
        writeInput: '', checkResult: null, timerSeconds: settings.mode === 'timer' ? 0 : prev.timerSeconds,
      }));
    }
  }, [settings, callbacks, stopTimer, setStateAndRef]);

  const endSession = useCallback(() => {
    stopTimer();
    const initial = buildInitialState();
    stateRef.current = initial;
    setState(initial);
  }, [stopTimer]);

  const restartSession = useCallback(() => {
    if (!state.config) return;
    startSession(state.config.curriculumId, state.config.sessionType, state.queue);
  }, [state.config, state.queue, startSession]);

  const sessionStats = {
    owned: state.log.filter(l => l.result === 'owned').length,
    almost: state.log.filter(l => l.result === 'almost').length,
    failed: state.log.filter(l => l.result === 'fail').length,
    total: state.log.length, masteryRate,
  };

  return {
    state, card, curPhase, phases, phaseIndexMap,
    phaseProgress, sessionProgress, sessionStats,
    isBlindPhase, isVerbalCheck, isWriteBridge, isWriteBlind,
    isPhaseAdvance, showRepCounter, repButtonLabel, phaseBgTint, phaseColor,
    startSession, handleRep, adjustReps, advancePhase,
    failVerbal, failWritten, setWriteInput, checkWritten,
    retryWrite, completeAllPhases, markCard, endSession, restartSession, toggleTimer,
  };
}
