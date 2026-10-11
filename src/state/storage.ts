/**
 * Safe localStorage persistence and JSON export/import for TENFLOW
 */

import { AppState } from '../domain/financeTypes';
import { validateAppStateSchema } from '../domain/financeValidation';
import { getInitialAppState } from './sampleData';

const STORAGE_KEY = 'tenflow_state_v1';
const SCHEMA_VERSION = '1.0';

export interface StoredPayload {
  version: string;
  timestamp: string;
  data: AppState;
}

/**
 * Load persisted state safely, falling back to initial realistic data
 */
export function loadPersistedState(): AppState {
  if (typeof window === 'undefined') return getInitialAppState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppState();
      savePersistedState(initial);
      return initial;
    }

    const parsedJson = JSON.parse(raw);
    const candidateData = parsedJson?.data ?? parsedJson;

    const validation = validateAppStateSchema(candidateData);
    if (validation.isValid && validation.parsed) {
      return validation.parsed;
    }

    console.warn('Storage schema mismatch or corruption detected. Resetting to safe defaults.');
    const initial = getInitialAppState();
    savePersistedState(initial);
    return initial;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getInitialAppState();
  }
}

/**
 * Save state safely to localStorage
 */
export function savePersistedState(state: AppState): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const payload: StoredPayload = {
      version: SCHEMA_VERSION,
      timestamp: new Date().toISOString(),
      data: state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
    return false;
  }
}

/**
 * Clear persisted state
 */
export function clearPersistedState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Export state to downloadable JSON file
 */
export function exportStateAsJSON(state: AppState): void {
  const payload: StoredPayload = {
    version: SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    data: state,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `tenflow-plan-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
