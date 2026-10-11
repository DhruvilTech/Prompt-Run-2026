/**
 * Domain definitions for TENFLOW financial calculations
 */

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food & Dining'
  | 'Travel & Transit'
  | 'Subscriptions'
  | 'Bills & Utilities'
  | 'Shopping'
  | 'Health & Wellness'
  | 'Entertainment'
  | 'Income & Freelance'
  | 'Savings Transfer'
  | 'Unexpected & Emergency'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // In Rupees (>= 0)
  category: TransactionCategory;
  description: string;
  date: string; // YYYY-MM-DD
  dayIndex: number; // 1 to 30
  isPlanned?: boolean; // false = posted actual, true = forecasted/planned
}

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  category: TransactionCategory;
  dueDay: number; // 1 to 30
  isPaid: boolean; // if true, recorded as actual transaction already
  paidTransactionId?: string; // linkage to prevent double counting
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDay?: number; // 1 to 30
  isVirtualAllocation: boolean; // Virtual reservation vs actual cash lock
  color?: string;
}

export interface PlanningConfig {
  startingBudget: number; // Standard ₹10,000
  totalDays: number; // Standard 30 days
  currentDay: number; // Day 1 to 30
  startDate: string; // ISO date for month start
  emergencyBufferGoal: number; // Target safety buffer (e.g. ₹1,000)
}

export type RiskLevel = 'stable' | 'caution' | 'high_risk';

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'danger';
  description: string;
}

export interface FinanceSummary {
  startingBudget: number;
  actualIncome: number;
  actualExpenses: number;
  remainingCash: number; // startingBudget + actualIncome - actualExpenses
  unpaidCommitmentsTotal: number;
  paidCommitmentsTotal: number;
  savingsAllocationsTotal: number;
  uncommittedBalance: number; // remainingCash - unpaidCommitments - savingsAllocations
  daysElapsed: number; // currentDay
  daysRemaining: number; // totalDays - currentDay + 1
  safeDailyAllowance: number; // uncommittedBalance / daysRemaining
  actualDailyBurnRate: number; // actualExpenses / daysElapsed
  burnRateMultiplier: number; // actualDailyBurnRate / safeDailyAllowance
  projectedMonthEndBalance: number;
  projectedTrajectory: Array<{
    day: number;
    actualBalance?: number;
    projectedSafeBalance: number;
    projectedCurrentPaceBalance: number;
  }>;
  financialRisk: RiskLevel;
  financialRiskReason: string;
  financialHealthScore: number; // 0 to 100
  healthFactors: HealthFactor[];
}

export type ScenarioImpactType =
  | 'one_off_expense'
  | 'unexpected_expense'
  | 'income'
  | 'new_subscription'
  | 'cancel_subscription'
  | 'savings_allocation'
  | 'reserve_buffer';

export interface DecisionScenario {
  id: string;
  title: string;
  description: string;
  category: TransactionCategory;
  impactType: ScenarioImpactType;
  amount: number;
  targetCommitmentId?: string; // for cancel subscription
  isCustom?: boolean;
}

export interface ScenarioComparison {
  scenario: DecisionScenario;
  baseline: FinanceSummary;
  simulated: FinanceSummary;
  deltas: {
    remainingCash: number;
    uncommittedBalance: number;
    safeDailyAllowance: number;
    projectedMonthEndBalance: number;
    savingsAllocationsTotal: number;
    healthScore: number;
  };
  tradeoffAnalysis: string;
  recommendedAction: string;
}

export interface AppState {
  config: PlanningConfig;
  transactions: Transaction[];
  commitments: Commitment[];
  goals: SavingsGoal[];
  activeScenarioId: string | null;
  customScenarios: DecisionScenario[];
}
