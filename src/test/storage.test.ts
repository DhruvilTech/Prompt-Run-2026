import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
} from '../state/storage';
import { AppState } from '../domain/financeTypes';

describe('TENFLOW Storage Adapter & Vault', () => {
  const mockState: AppState = {
    config: {
      startingBudget: 10000,
      totalDays: 30,
      currentDay: 12,
      startDate: '2026-10-01',
      emergencyBufferGoal: 1000,
    },
    transactions: [
      {
        id: 'tx-1',
        type: 'expense',
        amount: 350,
        category: 'Food & Dining',
        description: 'Team Dinner',
        date: '2026-10-05',
        dayIndex: 5,
      },
    ],
    commitments: [],
    goals: [],
    activeScenarioId: null,
    customScenarios: [],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('successfully persists application state with versioned envelope', () => {
    const success = savePersistedState(mockState);
    expect(success).toBe(true);

    const raw = localStorage.getItem('tenflow_state_v1');
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe('1.0');
    expect(parsed.data.config.startingBudget).toBe(10000);
  });

  it('loads and validates persisted state from storage', () => {
    savePersistedState(mockState);
    const loaded = loadPersistedState();

    expect(loaded).not.toBeNull();
    expect(loaded.config.currentDay).toBe(12);
    expect(loaded.transactions.length).toBe(1);
  });

  it('falls back to default realistic initial app state when storage is empty', () => {
    localStorage.clear();
    const loaded = loadPersistedState();
    expect(loaded).toBeDefined();
    expect(loaded.config.startingBudget).toBe(10000);
    expect(loaded.transactions.length).toBeGreaterThan(0);
  });

  it('safely handles malformed JSON by resetting to safe initial state', () => {
    localStorage.setItem('tenflow_state_v1', '{invalid-json-payload-corrupt');
    const loaded = loadPersistedState();

    expect(loaded).toBeDefined();
    expect(loaded.config.startingBudget).toBe(10000);
  });

  it('resets and clears storage when clearPersistedState is invoked', () => {
    savePersistedState(mockState);
    expect(localStorage.getItem('tenflow_state_v1')).not.toBeNull();

    clearPersistedState();
    expect(localStorage.getItem('tenflow_state_v1')).toBeNull();
  });
});
