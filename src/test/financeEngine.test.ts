import { describe, it, expect } from 'vitest';
import {
  calculateFinanceSummary,
  simulateDecision,
  applyDecisionToState,
} from '../domain/financeEngine';
import { PlanningConfig, Transaction, Commitment, SavingsGoal, DecisionScenario } from '../domain/financeTypes';
import { validateAppStateSchema, validateAmount } from '../domain/financeValidation';

describe('TENFLOW Finance Engine', () => {
  const defaultConfig: PlanningConfig = {
    startingBudget: 10000,
    totalDays: 30,
    currentDay: 10,
    startDate: '2026-10-01',
    emergencyBufferGoal: 1000,
  };

  it('correctly calculates remaining cash from starting budget, income and expenses', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'expense', amount: 1500, category: 'Food & Dining', description: 'Groceries', date: '2026-10-02', dayIndex: 2 },
      { id: '2', type: 'income', amount: 2000, category: 'Income & Freelance', description: 'Gig', date: '2026-10-05', dayIndex: 5 },
    ];
    const commitments: Commitment[] = [];
    const goals: SavingsGoal[] = [];

    const summary = calculateFinanceSummary(defaultConfig, transactions, commitments, goals);

    expect(summary.startingBudget).toBe(10000);
    expect(summary.actualIncome).toBe(2000);
    expect(summary.actualExpenses).toBe(1500);
    expect(summary.remainingCash).toBe(10500); // 10000 + 2000 - 1500
  });

  it('reserves unpaid commitments and calculates safe daily allowance', () => {
    const transactions: Transaction[] = [];
    const commitments: Commitment[] = [
      { id: 'c1', name: 'WiFi', amount: 500, category: 'Bills & Utilities', dueDay: 15, isPaid: false },
      { id: 'c2', name: 'Gym', amount: 500, category: 'Health & Wellness', dueDay: 20, isPaid: true }, // Already paid
    ];
    const goals: SavingsGoal[] = [
      { id: 'g1', name: 'Emergency', targetAmount: 2000, currentAmount: 1000, isVirtualAllocation: true },
    ];

    const summary = calculateFinanceSummary(defaultConfig, transactions, commitments, goals);

    // Remaining cash is 10000
    // Unpaid commitments is 500 (since c2 is isPaid=true)
    // Savings allocations is 1000
    // Uncommitted balance = 10000 - 500 - 1000 = 8500
    expect(summary.unpaidCommitmentsTotal).toBe(500);
    expect(summary.uncommittedBalance).toBe(8500);

    // Current day is 10, total is 30 -> days remaining = 30 - 10 + 1 = 21
    expect(summary.daysRemaining).toBe(21);
    // Safe daily allowance = 8500 / 21 = 404.76
    expect(summary.safeDailyAllowance).toBe(404.76);
  });

  it('safely handles zero remaining days or final day', () => {
    const finalDayConfig: PlanningConfig = {
      ...defaultConfig,
      currentDay: 30,
    };
    const summary = calculateFinanceSummary(finalDayConfig, [], [], []);
    expect(summary.daysRemaining).toBe(1);
    expect(summary.safeDailyAllowance).toBe(10000);
  });

  it('determines High Risk when uncommitted balance is depleted', () => {
    const heavyExpense: Transaction[] = [
      { id: '1', type: 'expense', amount: 10500, category: 'Shopping', description: 'Excess spend', date: '2026-10-02', dayIndex: 2 },
    ];
    const summary = calculateFinanceSummary(defaultConfig, heavyExpense, [], []);
    expect(summary.remainingCash).toBe(-500);
    expect(summary.uncommittedBalance).toBe(0);
    expect(summary.financialRisk).toBe('high_risk');
  });

  it('simulates decisions purely without mutating baseline state', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'expense', amount: 500, category: 'Food & Dining', description: 'Food', date: '2026-10-02', dayIndex: 2 },
    ];
    const scenario: DecisionScenario = {
      id: 'headphones',
      title: 'Buy Headphones',
      description: 'Test purchase',
      category: 'Shopping',
      impactType: 'one_off_expense',
      amount: 2000,
    };

    const initialLength = transactions.length;
    const comparison = simulateDecision(defaultConfig, transactions, [], [], scenario);

    // Baseline should remain untouched
    expect(transactions.length).toBe(initialLength);
    expect(comparison.baseline.remainingCash).toBe(9500);
    expect(comparison.simulated.remainingCash).toBe(7500);
    expect(comparison.deltas.remainingCash).toBe(-2000);
    expect(comparison.deltas.safeDailyAllowance).toBeLessThan(0);
  });

  it('applies decision to state correctly', () => {
    const scenario: DecisionScenario = {
      id: 'gig',
      title: 'Freelance Payout',
      description: 'Gig income',
      category: 'Income & Freelance',
      impactType: 'income',
      amount: 1500,
    };

    const state = {
      config: defaultConfig,
      transactions: [] as Transaction[],
      commitments: [] as Commitment[],
      goals: [] as SavingsGoal[],
    };

    const result = applyDecisionToState(state, scenario);
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0]?.type).toBe('income');
    expect(result.transactions[0]?.amount).toBe(1500);
  });

  it('validates amount boundaries and sanitizes inputs', () => {
    const valid = validateAmount('1250.50');
    expect(valid.isValid).toBe(true);
    expect(valid.value).toBe(1250.5);

    const negative = validateAmount(-20);
    expect(negative.isValid).toBe(false);

    const textCorrupted = validateAmount('abc');
    expect(textCorrupted.isValid).toBe(false);
  });

  it('safely validates and recovers malformed AppState schemas', () => {
    const malformed = {
      config: { startingBudget: 'invalid', currentDay: 999 },
      transactions: [{ amount: 'corrupt', category: '<script>alert(1)</script>' }],
    };

    const validation = validateAppStateSchema(malformed);
    expect(validation.isValid).toBe(true);
    expect(validation.parsed?.config.startingBudget).toBe(10000); // Defaults cleanly
    expect(validation.parsed?.config.currentDay).toBe(30); // Clamped to max
  });
});
