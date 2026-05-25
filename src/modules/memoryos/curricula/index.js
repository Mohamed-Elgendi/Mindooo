// src/modules/memoryos/curricula/index.js
export const CURRICULUM_REGISTRY = {};
export function getCurriculum(id) { return CURRICULUM_REGISTRY[id]; }
export function getAllCurricula() { return Object.values(CURRICULUM_REGISTRY); }
export function getCurriculumIds() { return Object.keys(CURRICULUM_REGISTRY); }
export function isCurriculumRegistered(id) { return id in CURRICULUM_REGISTRY; }
