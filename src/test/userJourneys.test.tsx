import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { FinanceProvider, useFinance } from '../state/FinanceContext';
import { clearPersistedState } from '../state/storage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FinanceProvider>{children}</FinanceProvider>
);

describe('TENFLOW Critical User Journeys', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  it('Journey 1: Loads default initial state and computes synchronized telemetry', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });

    expect(result.current.state.config.startingBudget).toBe(10000);
    expect(result.current.summary.remainingCash).toBeGreaterThan(0);
    expect(result.current.summary.safeDailyAllowance).toBeGreaterThan(0);
    expect(result.current.summary.daysRemaining).toBe(21); // Day 10 of 30
  });

  it('Journey 2: Record cashflow (expense and income) updating balances immediately', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });

    const initialCash = result.current.summary.remainingCash;
    const initialAllowance = result.current.summary.safeDailyAllowance;

    // Record an expense of 500
    act(() => {
      result.current.addTransaction({
        type: 'expense',
        amount: 500,
        category: 'Food & Dining',
        description: 'Team Pizza',
        date: '2026-10-10',
        dayIndex: 10,
        isPlanned: false,
      });
    });

    expect(result.current.summary.remainingCash).toBe(initialCash - 500);
    expect(result.current.summary.safeDailyAllowance).toBeLessThan(initialAllowance);

    // Record an income of 1,000
    act(() => {
      result.current.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Income & Freelance',
        description: 'Tutoring',
        date: '2026-10-10',
        dayIndex: 10,
        isPlanned: false,
      });
    });

    expect(result.current.summary.remainingCash).toBe(initialCash - 500 + 1000);
  });

  it('Journey 3: Toggle commitment status prevents double deduction', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });

    const firstCommitment = result.current.state.commitments[0]!;
    expect(firstCommitment.isPaid).toBe(false);

    const initialCash = result.current.summary.remainingCash;
    const initialUnpaidTotal = result.current.summary.unpaidCommitmentsTotal;

    // Mark commitment as paid
    act(() => {
      result.current.toggleCommitmentPaid(firstCommitment.id);
    });

    const updatedCommitment = result.current.state.commitments.find(
      (c) => c.id === firstCommitment.id
    )!;
    expect(updatedCommitment.isPaid).toBe(true);

    // Remaining cash is reduced by commitment amount (via posted transaction)
    expect(result.current.summary.remainingCash).toBe(initialCash - firstCommitment.amount);
    // Unpaid commitments total is decreased
    expect(result.current.summary.unpaidCommitmentsTotal).toBe(
      initialUnpaidTotal - firstCommitment.amount
    );
  });

  it('Journey 4: Create and fund savings goal without breaking cashflow', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });

    const initialGoalCount = result.current.state.goals.length;
    const initialAllocations = result.current.summary.savingsAllocationsTotal;

    act(() => {
      result.current.addGoal({
        name: 'New Laptop Fund',
        targetAmount: 5000,
        currentAmount: 200,
        isVirtualAllocation: true,
      });
    });

    expect(result.current.state.goals.length).toBe(initialGoalCount + 1);
    expect(result.current.summary.savingsAllocationsTotal).toBe(initialAllocations + 200);
  });

  it('Journey 5: Preview hypothetical decision and discard without mutating state', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });

    const initialTxCount = result.current.state.transactions.length;
    const baselineAllowance = result.current.summary.safeDailyAllowance;

    const testScenario = result.current.allScenarios[0]!;

    // Select scenario
    act(() => {
      result.current.setActiveScenario(testScenario);
    });

    expect(result.current.scenarioComparison).not.toBeNull();
    expect(result.current.scenarioComparison?.deltas.safeDailyAllowance).toBeLessThan(0);
    // Baseline state is unmutated
    expect(result.current.state.transactions.length).toBe(initialTxCount);
    expect(result.current.summary.safeDailyAllowance).toBe(baselineAllowance);

    // Discard scenario
    act(() => {
      result.current.discardActiveScenario();
    });

    expect(result.current.activeScenario).toBeNull();
    expect(result.current.scenarioComparison).toBeNull();
    expect(result.current.state.transactions.length).toBe(initialTxCount);
  });

  it('Journey 6: Apply hypothetical decision permanently updates records exactly once', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });

    const initialTxCount = result.current.state.transactions.length;
    const testScenario = result.current.allScenarios[0]!; // Buy Headphones 2000

    act(() => {
      result.current.setActiveScenario(testScenario);
    });

    act(() => {
      result.current.applyActiveScenario();
    });

    // Exactly one transaction added
    expect(result.current.state.transactions.length).toBe(initialTxCount + 1);
    const addedTx = result.current.state.transactions[0]!;
    expect(addedTx.amount).toBe(testScenario.amount);
    expect(result.current.activeScenario).toBeNull();
  });

  it('Journey 7: Reset to sample data restores original defaults cleanly', () => {
    const { result } = renderHook(() => useFinance(), { wrapper });

    // Mutate state by adding a transaction
    act(() => {
      result.current.addTransaction({
        type: 'expense',
        amount: 9999,
        category: 'Other',
        description: 'Huge purchase',
        date: '2026-10-10',
        dayIndex: 10,
      });
    });

    expect(result.current.summary.financialRisk).toBe('high_risk');

    // Reset
    act(() => {
      result.current.resetToSampleData();
    });

    expect(result.current.state.config.startingBudget).toBe(10000);
    expect(result.current.summary.remainingCash).toBeGreaterThan(5000);
  });
});
