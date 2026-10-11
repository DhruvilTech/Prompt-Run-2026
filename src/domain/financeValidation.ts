/**
 * Safe input validation and schema sanitization for TENFLOW
 */

import { AppState, PlanningConfig, Transaction, Commitment, SavingsGoal, TransactionCategory } from './financeTypes';

export const VALID_CATEGORIES: TransactionCategory[] = [
  'Food & Dining',
  'Travel & Transit',
  'Subscriptions',
  'Bills & Utilities',
  'Shopping',
  'Health & Wellness',
  'Entertainment',
  'Income & Freelance',
  'Savings Transfer',
  'Unexpected & Emergency',
  'Other',
];

/**
 * Sanitize plain strings: remove HTML tags, control chars, trim
 */
export function sanitizeString(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string') return '';
  const noHtml = input.replace(/<[^>]*>/g, '').trim();
  const clean = Array.from(noHtml)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (code >= 32 && code !== 127) || code > 159;
    })
    .join('');
  return clean.slice(0, maxLength);
}

/**
 * Validate numeric positive amount (in Rupees)
 */
export function validateAmount(val: unknown, min = 0, max = 10000000): { isValid: boolean; value: number; error?: string } {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, value: 0, error: 'Please enter a valid numeric amount.' };
  }
  if (num < min) {
    return { isValid: false, value: 0, error: `Amount cannot be less than ₹${min}.` };
  }
  if (num > max) {
    return { isValid: false, value: 0, error: `Amount cannot exceed ₹${max.toLocaleString('en-IN')}.` };
  }
  return { isValid: true, value: Math.round(num * 100) / 100 };
}

/**
 * Validate day index (1 to 30)
 */
export function validateDayIndex(val: unknown, maxDay = 30): number {
  const num = parseInt(String(val), 10);
  if (isNaN(num) || num < 1) return 1;
  return Math.min(num, maxDay);
}

/**
 * Validate imported JSON AppState schema safely
 */
export function validateAppStateSchema(data: unknown): { isValid: boolean; parsed?: AppState; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Imported data is not a valid JSON object.' };
  }

  const raw = data as Record<string, unknown>;

  // Validate Config
  const rawConfig = (raw.config || {}) as Record<string, unknown>;
  const config: PlanningConfig = {
    startingBudget: typeof rawConfig.startingBudget === 'number' && rawConfig.startingBudget >= 0 ? rawConfig.startingBudget : 10000,
    totalDays: typeof rawConfig.totalDays === 'number' && rawConfig.totalDays > 0 ? rawConfig.totalDays : 30,
    currentDay: typeof rawConfig.currentDay === 'number' ? validateDayIndex(rawConfig.currentDay, 30) : 10,
    startDate: typeof rawConfig.startDate === 'string' ? sanitizeString(rawConfig.startDate, 30) : '2026-10-01',
    emergencyBufferGoal: typeof rawConfig.emergencyBufferGoal === 'number' && rawConfig.emergencyBufferGoal >= 0 ? rawConfig.emergencyBufferGoal : 1000,
  };

  // Validate Transactions
  const rawTransactions = Array.isArray(raw.transactions) ? raw.transactions : [];
  const transactions: Transaction[] = [];

  for (const item of rawTransactions) {
    if (item && typeof item === 'object') {
      const t = item as Record<string, unknown>;
      const amountVal = validateAmount(t.amount);
      if (amountVal.isValid) {
        const cat = VALID_CATEGORIES.includes(t.category as TransactionCategory)
          ? (t.category as TransactionCategory)
          : 'Other';

        transactions.push({
          id: sanitizeString(t.id, 64) || 'tx-' + Math.random().toString(36).substring(2, 9),
          type: t.type === 'income' ? 'income' : 'expense',
          amount: amountVal.value,
          category: cat,
          description: sanitizeString(t.description, 80) || 'Transaction',
          date: sanitizeString(t.date, 30) || '2026-10-11',
          dayIndex: validateDayIndex(t.dayIndex, config.totalDays),
          isPlanned: Boolean(t.isPlanned),
        });
      }
    }
  }

  // Validate Commitments
  const rawCommitments = Array.isArray(raw.commitments) ? raw.commitments : [];
  const commitments: Commitment[] = [];

  for (const item of rawCommitments) {
    if (item && typeof item === 'object') {
      const c = item as Record<string, unknown>;
      const amountVal = validateAmount(c.amount);
      if (amountVal.isValid) {
        const cat = VALID_CATEGORIES.includes(c.category as TransactionCategory)
          ? (c.category as TransactionCategory)
          : 'Subscriptions';

        commitments.push({
          id: sanitizeString(c.id, 64) || 'comm-' + Math.random().toString(36).substring(2, 9),
          name: sanitizeString(c.name, 60) || 'Recurring Bill',
          amount: amountVal.value,
          category: cat,
          dueDay: validateDayIndex(c.dueDay, config.totalDays),
          isPaid: Boolean(c.isPaid),
          paidTransactionId: c.paidTransactionId ? sanitizeString(c.paidTransactionId, 64) : undefined,
          notes: c.notes ? sanitizeString(c.notes, 120) : undefined,
        });
      }
    }
  }

  // Validate Goals
  const rawGoals = Array.isArray(raw.goals) ? raw.goals : [];
  const goals: SavingsGoal[] = [];

  for (const item of rawGoals) {
    if (item && typeof item === 'object') {
      const g = item as Record<string, unknown>;
      const targetVal = validateAmount(g.targetAmount);
      const currentVal = validateAmount(g.currentAmount);

      if (targetVal.isValid) {
        goals.push({
          id: sanitizeString(g.id, 64) || 'goal-' + Math.random().toString(36).substring(2, 9),
          name: sanitizeString(g.name, 60) || 'Savings Goal',
          targetAmount: targetVal.value,
          currentAmount: currentVal.isValid ? currentVal.value : 0,
          targetDay: g.targetDay ? validateDayIndex(g.targetDay, config.totalDays) : undefined,
          isVirtualAllocation: Boolean(g.isVirtualAllocation),
        });
      }
    }
  }

  return {
    isValid: true,
    parsed: {
      config,
      transactions,
      commitments,
      goals,
      activeScenarioId: null,
      customScenarios: [],
    },
  };
}
