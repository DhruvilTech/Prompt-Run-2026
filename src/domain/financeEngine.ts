/**
 * Pure, testable financial engine for TENFLOW.
 * All functions are deterministic and do not mutate input arguments.
 */

import {
  PlanningConfig,
  Transaction,
  Commitment,
  SavingsGoal,
  FinanceSummary,
  RiskLevel,
  HealthFactor,
  DecisionScenario,
  ScenarioComparison,
} from './financeTypes';

/**
 * Standard rounding to 2 decimal places to avoid IEEE-754 precision artifacts
 */
export function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate the comprehensive financial summary from state primitives
 */
export function calculateFinanceSummary(
  config: PlanningConfig,
  transactions: Transaction[],
  commitments: Commitment[],
  goals: SavingsGoal[]
): FinanceSummary {
  const { startingBudget, totalDays, currentDay, emergencyBufferGoal } = config;

  // 1. Posted Transactions (only actual transactions where isPlanned !== true)
  const actualTransactions = transactions.filter((t) => !t.isPlanned);
  
  const actualIncome = roundCurrency(
    actualTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Math.max(0, t.amount), 0)
  );

  const actualExpenses = roundCurrency(
    actualTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.max(0, t.amount), 0)
  );

  // Remaining Cash: B0 + income - expenses
  const remainingCash = roundCurrency(startingBudget + actualIncome - actualExpenses);

  // 2. Commitments (Subscriptions & recurring obligations)
  // Ensure commitments marked isPaid are not double-counted as unpaid reserves
  const unpaidCommitments = commitments.filter((c) => !c.isPaid);
  const paidCommitments = commitments.filter((c) => c.isPaid);

  const unpaidCommitmentsTotal = roundCurrency(
    unpaidCommitments.reduce((sum, c) => sum + Math.max(0, c.amount), 0)
  );

  const paidCommitmentsTotal = roundCurrency(
    paidCommitments.reduce((sum, c) => sum + Math.max(0, c.amount), 0)
  );

  // 3. Savings Allocations
  const savingsAllocationsTotal = roundCurrency(
    goals.reduce((sum, g) => sum + Math.max(0, g.currentAmount), 0)
  );

  // 4. Uncommitted Balance:
  // Liquid cash remaining after taking out money reserved for upcoming commitments and savings goals.
  // Never hide financial shortfalls by artificially clamping to zero.
  const uncommittedBalance = roundCurrency(
    remainingCash - unpaidCommitmentsTotal - savingsAllocationsTotal
  );

  // 5. Days Elapsed & Remaining
  const clampedDay = Math.min(Math.max(1, currentDay), totalDays);
  const daysElapsed = clampedDay;
  const daysRemaining = Math.max(1, totalDays - clampedDay + 1);

  // 6. Safe Daily Allowance
  // If uncommittedBalance <= 0, safe daily allowance is strictly 0 (no discretionary spend permitted)
  const safeDailyAllowance = roundCurrency(
    uncommittedBalance > 0 && daysRemaining > 0 ? uncommittedBalance / daysRemaining : 0
  );

  // 7. Actual Daily Burn Rate
  const actualDailyBurnRate = roundCurrency(
    daysElapsed > 0 ? actualExpenses / daysElapsed : 0
  );

  const burnRateMultiplier =
    safeDailyAllowance > 0
      ? roundCurrency(actualDailyBurnRate / safeDailyAllowance)
      : actualDailyBurnRate > 0
      ? 999
      : 1;

  // 8. Projected Month-End Balance
  // Scenario A: Spending at the safe allowance pace preserves uncommitted balance
  // Scenario B: Spending at the actual historical burn rate
  const projectedFutureSpend = roundCurrency(actualDailyBurnRate * (daysRemaining - 1));
  const projectedMonthEndBalance = roundCurrency(
    remainingCash - unpaidCommitmentsTotal - projectedFutureSpend
  );

  // 9. Day-by-day trajectory for charts (Days 1 to 30)
  const projectedTrajectory = generateTrajectory(
    totalDays,
    clampedDay,
    startingBudget,
    actualTransactions,
    safeDailyAllowance,
    actualDailyBurnRate,
    unpaidCommitments
  );

  // 10. Financial Risk Analysis
  const { riskLevel, reason } = evaluateRisk(
    uncommittedBalance,
    safeDailyAllowance,
    actualDailyBurnRate,
    daysRemaining,
    emergencyBufferGoal,
    unpaidCommitmentsTotal
  );

  // 11. Financial Health Score (0 - 100)
  const { score, factors } = evaluateHealthScore(
    uncommittedBalance,
    startingBudget,
    safeDailyAllowance,
    actualDailyBurnRate,
    daysRemaining,
    unpaidCommitmentsTotal,
    savingsAllocationsTotal,
    emergencyBufferGoal
  );

  return {
    startingBudget,
    actualIncome,
    actualExpenses,
    remainingCash,
    unpaidCommitmentsTotal,
    paidCommitmentsTotal,
    savingsAllocationsTotal,
    uncommittedBalance,
    daysElapsed,
    daysRemaining,
    safeDailyAllowance,
    actualDailyBurnRate,
    burnRateMultiplier,
    projectedMonthEndBalance,
    projectedTrajectory,
    financialRisk: riskLevel,
    financialRiskReason: reason,
    financialHealthScore: score,
    healthFactors: factors,
  };
}

/**
 * Generate 30-day projection trajectory for charts
 */
function generateTrajectory(
  totalDays: number,
  currentDay: number,
  startingBudget: number,
  actualTransactions: Transaction[],
  safeAllowance: number,
  burnRate: number,
  unpaidCommitments: Commitment[]
) {
  const trajectory: FinanceSummary['projectedTrajectory'] = [];

  // Cumulative actual spend per day
  let runningActualCash = startingBudget;
  const daySpendMap = new Map<number, number>();
  const dayIncomeMap = new Map<number, number>();

  for (const t of actualTransactions) {
    if (t.type === 'expense') {
      daySpendMap.set(t.dayIndex, (daySpendMap.get(t.dayIndex) || 0) + t.amount);
    } else {
      dayIncomeMap.set(t.dayIndex, (dayIncomeMap.get(t.dayIndex) || 0) + t.amount);
    }
  }

  // Find commitments due on future days
  const commitmentDayMap = new Map<number, number>();
  for (const c of unpaidCommitments) {
    commitmentDayMap.set(c.dueDay, (commitmentDayMap.get(c.dueDay) || 0) + c.amount);
  }

  let projectedCurrentPace = startingBudget;
  let projectedSafe = startingBudget;

  for (let day = 1; day <= totalDays; day++) {
    const inc = dayIncomeMap.get(day) || 0;
    const exp = daySpendMap.get(day) || 0;
    const dueComm = commitmentDayMap.get(day) || 0;

    if (day <= currentDay) {
      runningActualCash = roundCurrency(runningActualCash + inc - exp);
      projectedCurrentPace = runningActualCash;
      projectedSafe = runningActualCash;

      trajectory.push({
        day,
        actualBalance: runningActualCash,
        projectedSafeBalance: runningActualCash,
        projectedCurrentPaceBalance: runningActualCash,
      });
    } else {
      // Future projection: Never hide financial deficits by artificially forcing balances to zero
      projectedCurrentPace = roundCurrency(
        projectedCurrentPace - burnRate - dueComm
      );
      projectedSafe = roundCurrency(
        projectedSafe - safeAllowance - dueComm
      );

      trajectory.push({
        day,
        projectedSafeBalance: projectedSafe,
        projectedCurrentPaceBalance: projectedCurrentPace,
      });
    }
  }

  return trajectory;
}

/**
 * Deterministic financial risk evaluation
 */
function evaluateRisk(
  uncommittedBalance: number,
  safeDailyAllowance: number,
  actualDailyBurnRate: number,
  daysRemaining: number,
  emergencyBufferGoal: number,
  unpaidCommitmentsTotal: number
): { riskLevel: RiskLevel; reason: string } {
  if (uncommittedBalance <= 0) {
    return {
      riskLevel: 'high_risk',
      reason: 'Uncommitted balance is zero or exhausted. Any further spending breaches commitments.',
    };
  }

  if (safeDailyAllowance < 100 && daysRemaining > 5) {
    return {
      riskLevel: 'high_risk',
      reason: `Safe daily allowance is critically low (₹${safeDailyAllowance}/day) with ${daysRemaining} days left.`,
    };
  }

  if (actualDailyBurnRate > safeDailyAllowance * 1.5 && actualDailyBurnRate > 0) {
    return {
      riskLevel: 'high_risk',
      reason: `Spending pace (₹${actualDailyBurnRate}/day) is running 50%+ faster than safe allowance (₹${safeDailyAllowance}/day).`,
    };
  }

  if (uncommittedBalance < emergencyBufferGoal || uncommittedBalance < unpaidCommitmentsTotal * 0.5) {
    return {
      riskLevel: 'caution',
      reason: `Uncommitted cash is below emergency buffer target of ₹${emergencyBufferGoal}.`,
    };
  }

  if (actualDailyBurnRate > safeDailyAllowance * 1.1) {
    return {
      riskLevel: 'caution',
      reason: 'Current burn rate slightly exceeds sustainable daily allowance.',
    };
  }

  return {
    riskLevel: 'stable',
    reason: `Healthy financial pace. ₹${safeDailyAllowance}/day available for the remaining ${daysRemaining} days.`,
  };
}

/**
 * Transparent 100-point planning health score with component factors
 */
function evaluateHealthScore(
  uncommittedBalance: number,
  startingBudget: number,
  safeDailyAllowance: number,
  actualDailyBurnRate: number,
  _daysRemaining: number,
  unpaidCommitmentsTotal: number,
  savingsAllocationsTotal: number,
  emergencyBufferGoal: number
): { score: number; factors: HealthFactor[] } {
  const factors: HealthFactor[] = [];

  // Factor 1: Spending Pace Discipline (35 pts)
  let paceScore = 35;
  let paceStatus: HealthFactor['status'] = 'good';
  let paceDesc = 'Daily spending is aligned with sustainable allowance.';

  if (actualDailyBurnRate > 0 && safeDailyAllowance > 0) {
    const ratio = actualDailyBurnRate / safeDailyAllowance;
    if (ratio > 1.7) {
      paceScore = 5;
      paceStatus = 'danger';
      paceDesc = `Spending ₹${actualDailyBurnRate}/day vs safe ₹${safeDailyAllowance}/day is unsustainable.`;
    } else if (ratio > 1.2) {
      paceScore = 18;
      paceStatus = 'warning';
      paceDesc = 'Spending pace is somewhat high; moderation needed.';
    } else if (ratio > 0.9) {
      paceScore = 28;
      paceStatus = 'good';
      paceDesc = 'Pace is closely balanced with your target allowance.';
    } else {
      paceScore = 35;
      paceStatus = 'good';
      paceDesc = 'Under-budget burn rate leaves healthy surplus.';
    }
  } else if (safeDailyAllowance === 0) {
    paceScore = 0;
    paceStatus = 'danger';
    paceDesc = 'No daily allowance remaining.';
  }
  factors.push({
    name: 'Burn Rate Discipline',
    score: paceScore,
    maxScore: 35,
    status: paceStatus,
    description: paceDesc,
  });

  // Factor 2: Commitment Coverage (25 pts)
  let commScore = 25;
  let commStatus: HealthFactor['status'] = 'good';
  let commDesc = 'All upcoming commitments fully covered by cash.';

  if (uncommittedBalance <= 0) {
    commScore = 5;
    commStatus = 'danger';
    commDesc = 'Liquid balance threatens unpaid bills and obligations.';
  } else if (uncommittedBalance < unpaidCommitmentsTotal) {
    commScore = 14;
    commStatus = 'warning';
    commDesc = 'Cash cushion is tight relative to upcoming commitments.';
  }
  factors.push({
    name: 'Commitment Coverage',
    score: commScore,
    maxScore: 25,
    status: commStatus,
    description: commDesc,
  });

  // Factor 3: Emergency Buffer Resilience (25 pts)
  let bufferScore = 25;
  let bufferStatus: HealthFactor['status'] = 'good';
  let bufferDesc = 'Emergency buffer target intact.';

  const targetBuffer = Math.max(500, emergencyBufferGoal);
  if (uncommittedBalance >= targetBuffer) {
    bufferScore = 25;
    bufferStatus = 'good';
    bufferDesc = `Protected uncommitted reserve exceeds ₹${targetBuffer}.`;
  } else if (uncommittedBalance >= targetBuffer * 0.5) {
    bufferScore = 15;
    bufferStatus = 'warning';
    bufferDesc = `Uncommitted buffer is below target ₹${targetBuffer}.`;
  } else {
    bufferScore = Math.max(0, Math.round((uncommittedBalance / targetBuffer) * 15));
    bufferStatus = 'danger';
    bufferDesc = 'Emergency cushion critically compromised.';
  }
  factors.push({
    name: 'Buffer Resilience',
    score: bufferScore,
    maxScore: 25,
    status: bufferStatus,
    description: bufferDesc,
  });

  // Factor 4: Savings & Horizon Progress (15 pts)
  let savingsScore = 15;
  let savingsStatus: HealthFactor['status'] = 'good';
  let savingsDesc = 'Savings momentum maintained without stressing cashflow.';

  if (savingsAllocationsTotal === 0) {
    savingsScore = 8;
    savingsStatus = 'warning';
    savingsDesc = 'No active savings goals funded this month.';
  } else if (savingsAllocationsTotal > startingBudget * 0.5 && uncommittedBalance < 1000) {
    savingsScore = 10;
    savingsStatus = 'warning';
    savingsDesc = 'Aggressive savings goals are straining daily liquidity.';
  }
  factors.push({
    name: 'Savings & Future Security',
    score: savingsScore,
    maxScore: 15,
    status: savingsStatus,
    description: savingsDesc,
  });

  const totalScore = Math.min(100, Math.max(0, paceScore + commScore + bufferScore + savingsScore));

  return { score: totalScore, factors };
}

/**
 * Simulate a decision purely without mutating application state
 */
export function simulateDecision(
  baselineConfig: PlanningConfig,
  baselineTransactions: Transaction[],
  baselineCommitments: Commitment[],
  baselineGoals: SavingsGoal[],
  scenario: DecisionScenario
): ScenarioComparison {
  const baseline = calculateFinanceSummary(
    baselineConfig,
    baselineTransactions,
    baselineCommitments,
    baselineGoals
  );

  // Clone structures
  const simTransactions = [...baselineTransactions];
  let simCommitments = [...baselineCommitments];
  const simGoals = [...baselineGoals];

  const nowDay = baselineConfig.currentDay;
  const isoDate = new Date().toISOString().split('T')[0] || '2026-10-11';

  switch (scenario.impactType) {
    case 'one_off_expense':
    case 'unexpected_expense': {
      simTransactions.push({
        id: `sim-${scenario.id}`,
        type: 'expense',
        amount: scenario.amount,
        category: scenario.category,
        description: scenario.title,
        date: isoDate,
        dayIndex: nowDay,
        isPlanned: false,
      });
      break;
    }
    case 'income': {
      simTransactions.push({
        id: `sim-${scenario.id}`,
        type: 'income',
        amount: scenario.amount,
        category: scenario.category,
        description: scenario.title,
        date: isoDate,
        dayIndex: nowDay,
        isPlanned: false,
      });
      break;
    }
    case 'new_subscription': {
      simCommitments.push({
        id: `sim-${scenario.id}`,
        name: scenario.title,
        amount: scenario.amount,
        category: scenario.category,
        dueDay: Math.min(30, nowDay + 5),
        isPaid: false,
      });
      break;
    }
    case 'cancel_subscription': {
      if (scenario.targetCommitmentId) {
        simCommitments = simCommitments.filter((c) => c.id !== scenario.targetCommitmentId);
      } else {
        // Drop any matching by amount or category
        const idx = simCommitments.findIndex((c) => c.amount === scenario.amount && !c.isPaid);
        if (idx !== -1) {
          simCommitments.splice(idx, 1);
        }
      }
      break;
    }
    case 'savings_allocation': {
      if (simGoals.length > 0) {
        const firstGoal = simGoals[0]!;
        simGoals[0] = {
          ...firstGoal,
          currentAmount: firstGoal.currentAmount + scenario.amount,
        };
      } else {
        simGoals.push({
          id: `sim-goal-${scenario.id}`,
          name: 'Emergency Cushion',
          targetAmount: scenario.amount * 2,
          currentAmount: scenario.amount,
          isVirtualAllocation: true,
        });
      }
      break;
    }
    case 'reserve_buffer': {
      // Earmarks funds as an emergency goal
      simGoals.push({
        id: `sim-buffer-${scenario.id}`,
        name: 'Emergency Reserve',
        targetAmount: scenario.amount,
        currentAmount: scenario.amount,
        isVirtualAllocation: true,
      });
      break;
    }
  }

  const simulated = calculateFinanceSummary(
    baselineConfig,
    simTransactions,
    simCommitments,
    simGoals
  );

  const deltas = {
    remainingCash: roundCurrency(simulated.remainingCash - baseline.remainingCash),
    uncommittedBalance: roundCurrency(simulated.uncommittedBalance - baseline.uncommittedBalance),
    safeDailyAllowance: roundCurrency(simulated.safeDailyAllowance - baseline.safeDailyAllowance),
    projectedMonthEndBalance: roundCurrency(
      simulated.projectedMonthEndBalance - baseline.projectedMonthEndBalance
    ),
    savingsAllocationsTotal: roundCurrency(
      simulated.savingsAllocationsTotal - baseline.savingsAllocationsTotal
    ),
    healthScore: simulated.financialHealthScore - baseline.financialHealthScore,
  };

  // Generate clear plain-language trade-off analysis
  const tradeoffAnalysis = generateTradeoffAnalysis(scenario, baseline, simulated, deltas);
  const recommendedAction = generateRecommendation(deltas, simulated);

  return {
    scenario,
    baseline,
    simulated,
    deltas,
    tradeoffAnalysis,
    recommendedAction,
  };
}

function generateTradeoffAnalysis(
  scenario: DecisionScenario,
  baseline: FinanceSummary,
  simulated: FinanceSummary,
  deltas: ScenarioComparison['deltas']
): string {
  if (scenario.impactType === 'income') {
    return `Injecting ₹${scenario.amount.toLocaleString('en-IN')} increases your uncommitted cash to ₹${simulated.uncommittedBalance.toLocaleString('en-IN')}, expanding your safe daily spending allowance by +₹${Math.abs(deltas.safeDailyAllowance).toLocaleString('en-IN')}/day across the remaining ${baseline.daysRemaining} days.`;
  }

  if (scenario.impactType === 'new_subscription') {
    return `Adding the recurring ${scenario.title} (₹${scenario.amount}/mo) locks away ₹${scenario.amount} every month. It lowers your daily allowance by ₹${Math.abs(deltas.safeDailyAllowance)}/day because upcoming commitments must be honored before discretionary spending.`;
  }

  if (scenario.impactType === 'cancel_subscription') {
    return `Cancelling this commitment frees up ₹${Math.abs(deltas.uncommittedBalance).toLocaleString('en-IN')} in reserved funds, immediately restoring +₹${Math.abs(deltas.safeDailyAllowance)}/day to your daily allowance without requiring additional income.`;
  }

  if (deltas.safeDailyAllowance < 0) {
    return `Spending ₹${scenario.amount.toLocaleString('en-IN')} reduces your uncommitted balance to ₹${simulated.uncommittedBalance.toLocaleString('en-IN')}. Consequently, your safe daily allowance drops from ₹${baseline.safeDailyAllowance.toLocaleString('en-IN')} to ₹${simulated.safeDailyAllowance.toLocaleString('en-IN')} (a reduction of ₹${Math.abs(deltas.safeDailyAllowance).toLocaleString('en-IN')}/day) to ensure you survive the remaining ${baseline.daysRemaining} days without running broke.`;
  }

  return `This decision shifts your uncommitted buffer by ₹${deltas.uncommittedBalance.toLocaleString('en-IN')}, altering your month-end outlook.`;
}

function generateRecommendation(
  deltas: ScenarioComparison['deltas'],
  simulated: FinanceSummary
): string {
  if (simulated.uncommittedBalance <= 0) {
    return 'CRITICAL WARNING: This decision completely wipes out your uncommitted cash buffer. High risk of defaulting on fixed bills.';
  }
  if (simulated.safeDailyAllowance < 100) {
    return 'CAUTION: Your daily allowance will drop below ₹100/day. Consider postponing or finding an alternative trade-off.';
  }
  if ((deltas.remainingCash ?? 0) < 0 && deltas.healthScore < -10) {
    return 'MODERATE IMPACT: Feasible, but reduces your safety margin. Trim non-essential leisure for the next 3 days to offset.';
  }
  if (deltas.safeDailyAllowance >= 0) {
    return 'POSITIVE IMPACT: Strengthens your month-end projection and bolsters financial resilience.';
  }
  return 'SUSTAINABLE: Within your safe spending boundaries. Your remaining daily allowance remains workable.';
}

/**
 * Apply a simulated decision permanently to actual state with safety guards
 */
export function applyDecisionToState(
  state: {
    transactions: Transaction[];
    commitments: Commitment[];
    goals: SavingsGoal[];
    config: PlanningConfig;
  },
  scenario: DecisionScenario
): {
  transactions: Transaction[];
  commitments: Commitment[];
  goals: SavingsGoal[];
} {
  const newTransactions = [...state.transactions];
  let newCommitments = [...state.commitments];
  const newGoals = [...state.goals];

  const nowDay = state.config.currentDay;
  const isoDate = new Date().toISOString().split('T')[0] || '2026-10-11';
  const genId = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  switch (scenario.impactType) {
    case 'one_off_expense':
    case 'unexpected_expense': {
      newTransactions.unshift({
        id: genId,
        type: 'expense',
        amount: Math.max(0, scenario.amount),
        category: scenario.category,
        description: scenario.title,
        date: isoDate,
        dayIndex: nowDay,
        isPlanned: false,
      });
      break;
    }
    case 'income': {
      newTransactions.unshift({
        id: genId,
        type: 'income',
        amount: Math.max(0, scenario.amount),
        category: scenario.category,
        description: scenario.title,
        date: isoDate,
        dayIndex: nowDay,
        isPlanned: false,
      });
      break;
    }
    case 'new_subscription': {
      newCommitments.push({
        id: 'comm-' + Date.now(),
        name: scenario.title,
        amount: Math.max(0, scenario.amount),
        category: scenario.category,
        dueDay: Math.min(30, nowDay + 5),
        isPaid: false,
      });
      break;
    }
    case 'cancel_subscription': {
      if (scenario.targetCommitmentId) {
        newCommitments = newCommitments.filter((c) => c.id !== scenario.targetCommitmentId);
      } else {
        const idx = newCommitments.findIndex(
          (c) => c.amount === scenario.amount && !c.isPaid
        );
        if (idx !== -1) {
          newCommitments.splice(idx, 1);
        }
      }
      break;
    }
    case 'savings_allocation': {
      if (newGoals.length > 0) {
        const target = newGoals[0]!;
        newGoals[0] = {
          ...target,
          currentAmount: roundCurrency(target.currentAmount + scenario.amount),
        };
      } else {
        newGoals.push({
          id: 'goal-' + Date.now(),
          name: 'General Savings',
          targetAmount: scenario.amount * 2,
          currentAmount: scenario.amount,
          isVirtualAllocation: true,
        });
      }
      break;
    }
    case 'reserve_buffer': {
      newGoals.push({
        id: 'goal-buffer-' + Date.now(),
        name: 'Emergency Cushion',
        targetAmount: scenario.amount,
        currentAmount: scenario.amount,
        isVirtualAllocation: true,
      });
      break;
    }
  }

  return {
    transactions: newTransactions,
    commitments: newCommitments,
    goals: newGoals,
  };
}
