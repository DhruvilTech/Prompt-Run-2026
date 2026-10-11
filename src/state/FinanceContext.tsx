/* eslint-disable react-refresh/only-export-components */
/**
 * Global Finance Context and State Controller for TENFLOW
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppState,
  FinanceSummary,
  Transaction,
  Commitment,
  SavingsGoal,
  PlanningConfig,
  DecisionScenario,
  ScenarioComparison,
} from '../domain/financeTypes';
import {
  calculateFinanceSummary,
  simulateDecision,
  applyDecisionToState,
} from '../domain/financeEngine';
import { loadPersistedState, savePersistedState, clearPersistedState } from './storage';
import { getInitialAppState, PREDEFINED_SCENARIOS } from './sampleData';

interface FinanceContextValue {
  state: AppState;
  summary: FinanceSummary;
  allScenarios: DecisionScenario[];
  activeScenario: DecisionScenario | null;
  scenarioComparison: ScenarioComparison | null;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  addCommitment: (comm: Omit<Commitment, 'id'>) => void;
  updateCommitment: (comm: Commitment) => void;
  toggleCommitmentPaid: (id: string) => void;
  deleteCommitment: (id: string) => void;
  
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (goal: SavingsGoal) => void;
  contributeToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  
  updateConfig: (config: Partial<PlanningConfig>) => void;
  
  // Scenario actions
  setActiveScenario: (scenario: DecisionScenario | null) => void;
  applyActiveScenario: () => void;
  discardActiveScenario: () => void;
  addCustomScenario: (sc: Omit<DecisionScenario, 'id' | 'isCustom'>) => void;
  
  // System actions
  resetToSampleData: () => void;
  loadStateFromImport: (importedState: AppState) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadPersistedState());
  const [activeScenario, setActiveScenarioState] = useState<DecisionScenario | null>(null);

  // Auto-persist on state change
  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  // Derived baseline summary
  const summary = useMemo(() => {
    return calculateFinanceSummary(
      state.config,
      state.transactions,
      state.commitments,
      state.goals
    );
  }, [state]);

  // All scenarios (predefined + custom)
  const allScenarios = useMemo(() => {
    return [...PREDEFINED_SCENARIOS, ...(state.customScenarios || [])];
  }, [state.customScenarios]);

  // Dynamic simulation comparison
  const scenarioComparison = useMemo(() => {
    if (!activeScenario) return null;
    return simulateDecision(
      state.config,
      state.transactions,
      state.commitments,
      state.goals,
      activeScenario
    );
  }, [state, activeScenario]);

  // Transactions
  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setState((prev) => ({
      ...prev,
      transactions: [
        { ...tx, id },
        ...prev.transactions,
      ],
    }));
  }, []);

  const updateTransaction = useCallback((tx: Transaction) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === tx.id ? tx : t)),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  // Commitments
  const addCommitment = useCallback((comm: Omit<Commitment, 'id'>) => {
    const id = 'comm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setState((prev) => ({
      ...prev,
      commitments: [...prev.commitments, { ...comm, id }],
    }));
  }, []);

  const updateCommitment = useCallback((comm: Commitment) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.map((c) => (c.id === comm.id ? comm : c)),
    }));
  }, []);

  /**
   * Toggle commitment paid status with accounting integrity:
   * When paid, we post a linked actual transaction so cash decreases and unpaid commitment does not double count.
   */
  const toggleCommitmentPaid = useCallback((id: string) => {
    setState((prev) => {
      const commitment = prev.commitments.find((c) => c.id === id);
      if (!commitment) return prev;

      if (!commitment.isPaid) {
        // Mark paid and record actual transaction
        const txId = 'tx-comm-' + commitment.id;
        const newTx: Transaction = {
          id: txId,
          type: 'expense',
          amount: commitment.amount,
          category: commitment.category,
          description: `[Auto-Paid] ${commitment.name}`,
          date: new Date().toISOString().split('T')[0] || '2026-10-11',
          dayIndex: prev.config.currentDay,
          isPlanned: false,
        };

        return {
          ...prev,
          commitments: prev.commitments.map((c) =>
            c.id === id ? { ...c, isPaid: true, paidTransactionId: txId } : c
          ),
          transactions: [newTx, ...prev.transactions],
        };
      } else {
        // Revert to unpaid: remove linked transaction if found
        const txIdToRemove = commitment.paidTransactionId;
        return {
          ...prev,
          commitments: prev.commitments.map((c) =>
            c.id === id ? { ...c, isPaid: false, paidTransactionId: undefined } : c
          ),
          transactions: txIdToRemove
            ? prev.transactions.filter((t) => t.id !== txIdToRemove)
            : prev.transactions,
        };
      }
    });
  }, []);

  const deleteCommitment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c) => c.id !== id),
    }));
  }, []);

  // Goals
  const addGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    const id = 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, { ...goal, id }],
    }));
  }, []);

  const updateGoal = useCallback((goal: SavingsGoal) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goal.id ? goal : g)),
    }));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      ),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  }, []);

  // Config
  const updateConfig = useCallback((partial: Partial<PlanningConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...partial },
    }));
  }, []);

  // Scenarios
  const setActiveScenario = useCallback((scenario: DecisionScenario | null) => {
    setActiveScenarioState(scenario);
  }, []);

  const applyActiveScenario = useCallback(() => {
    if (!activeScenario) return;
    setState((prev) => {
      const nextCollections = applyDecisionToState(prev, activeScenario);
      return {
        ...prev,
        ...nextCollections,
      };
    });
    setActiveScenarioState(null);
  }, [activeScenario]);

  const discardActiveScenario = useCallback(() => {
    setActiveScenarioState(null);
  }, []);

  const addCustomScenario = useCallback((sc: Omit<DecisionScenario, 'id' | 'isCustom'>) => {
    const newScenario: DecisionScenario = {
      ...sc,
      id: 'custom-sc-' + Date.now(),
      isCustom: true,
    };
    setState((prev) => ({
      ...prev,
      customScenarios: [newScenario, ...(prev.customScenarios || [])],
    }));
    setActiveScenarioState(newScenario);
  }, []);

  // System
  const resetToSampleData = useCallback(() => {
    clearPersistedState();
    const fresh = getInitialAppState();
    setState(fresh);
    setActiveScenarioState(null);
  }, []);

  const loadStateFromImport = useCallback((importedState: AppState) => {
    setState(importedState);
    setActiveScenarioState(null);
  }, []);

  const value: FinanceContextValue = {
    state,
    summary,
    allScenarios,
    activeScenario,
    scenarioComparison,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCommitment,
    updateCommitment,
    toggleCommitmentPaid,
    deleteCommitment,
    addGoal,
    updateGoal,
    contributeToGoal,
    deleteGoal,
    updateConfig,
    setActiveScenario,
    applyActiveScenario,
    discardActiveScenario,
    addCustomScenario,
    resetToSampleData,
    loadStateFromImport,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
