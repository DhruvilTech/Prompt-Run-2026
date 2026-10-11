import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const InsightsPage: React.FC = () => {
  const { summary, state } = useFinance();

  // Dynamic state-derived insights
  const insightsList: Array<{
    id: string;
    type: 'critical' | 'caution' | 'positive';
    title: string;
    description: string;
    supportingStat: string;
    actionLabel: string;
    actionTo: string;
  }> = [];

  // Insight 1: Burn rate velocity
  if (summary.actualDailyBurnRate > summary.safeDailyAllowance * 1.25 && summary.actualDailyBurnRate > 0) {
    insightsList.push({
      id: 'burn-pace',
      type: 'critical',
      title: 'Daily Spending Exceeds Safe Pace',
      description: `You are burning ₹${summary.actualDailyBurnRate}/day, which is faster than your safe daily allowance of ₹${summary.safeDailyAllowance}/day. At this rate, your money will run out before Day 30.`,
      supportingStat: `${summary.burnRateMultiplier}x Sustainable Rate`,
      actionLabel: 'Test spending cuts in Decision Simulator',
      actionTo: '/simulate',
    });
  } else if (summary.actualDailyBurnRate <= summary.safeDailyAllowance) {
    insightsList.push({
      id: 'disciplined-pace',
      type: 'positive',
      title: 'Discipline Preserving Monthly Cash',
      description: `Your average daily burn of ₹${summary.actualDailyBurnRate}/day leaves comfortable headroom against your ₹${summary.safeDailyAllowance}/day allowance.`,
      supportingStat: `+₹${Math.round(summary.safeDailyAllowance - summary.actualDailyBurnRate)}/day surplus`,
      actionLabel: 'Consider funding a savings goal',
      actionTo: '/goals',
    });
  }

  // Insight 2: Subscriptions & Commitments burden
  const commitmentRatio = (summary.unpaidCommitmentsTotal / state.config.startingBudget) * 100;
  if (commitmentRatio > 15) {
    insightsList.push({
      id: 'commitment-load',
      type: 'caution',
      title: 'Fixed Subscriptions Lock Away Cash',
      description: `Unpaid commitments amount to ₹${summary.unpaidCommitmentsTotal.toLocaleString('en-IN')}, tying up ${Math.round(commitmentRatio)}% of your starting budget.`,
      supportingStat: `${Math.round(commitmentRatio)}% Fixed Share`,
      actionLabel: 'Review recurring subscriptions',
      actionTo: '/plan',
    });
  }

  // Insight 3: Emergency buffer resilience
  if (summary.uncommittedBalance < state.config.emergencyBufferGoal) {
    const deficit = state.config.emergencyBufferGoal - summary.uncommittedBalance;
    insightsList.push({
      id: 'buffer-deficit',
      type: 'caution',
      title: 'Emergency Cushion Needs Reinforcement',
      description: `Your uncommitted cash (₹${summary.uncommittedBalance}) is ₹${deficit} short of your ₹${state.config.emergencyBufferGoal} emergency goal.`,
      supportingStat: `₹${deficit} deficit`,
      actionLabel: 'Simulate buffer reserve scenario',
      actionTo: '/simulate',
    });
  }

  // Insight 4: Category dominance
  const categoryMap = new Map<string, number>();
  state.transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

  let topCategory = '';
  let topAmount = 0;
  for (const [cat, amt] of categoryMap.entries()) {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  }

  if (topAmount > 0 && summary.actualExpenses > 0) {
    const topPct = Math.round((topAmount / summary.actualExpenses) * 100);
    if (topPct > 35) {
      insightsList.push({
        id: 'category-concentration',
        type: 'caution',
        title: `${topCategory} Dominates Spending`,
        description: `${topCategory} accounts for ${topPct}% (₹${topAmount.toLocaleString('en-IN')}) of all expenses incurred so far.`,
        supportingStat: `${topPct}% of all expenses`,
        actionLabel: 'Filter category transactions',
        actionTo: `/transactions?category=${encodeURIComponent(topCategory)}`,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-midnight-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-paper-primary tracking-tight">
            Financial Insights & Outlook
          </h1>
          <p className="text-xs sm:text-sm text-paper-secondary mt-1">
            Algorithmic diagnostics derived from current cash velocity, commitments, and timeline.
          </p>
        </div>
      </div>

      {/* HEALTH SCORE COMPONENT BREAKDOWN */}
      <Card elevated className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-midnight-border">
          <div>
            <h2 className="text-base font-bold font-display text-paper-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mint-lime" />
              100-Point Financial Survival Score Breakdown
            </h2>
            <p className="text-xs text-paper-secondary mt-0.5">
              Transparent assessment score based on 4 deterministic factors. (Not a credit score).
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-mint-lime">
              {summary.financialHealthScore}
            </span>
            <span className="text-sm font-mono text-paper-muted">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.healthFactors.map((factor) => (
            <div
              key={factor.name}
              className="p-4 rounded-xl bg-midnight-panel/90 border border-midnight-border flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-paper-primary">{factor.name}</span>
                  <span className="font-mono font-bold text-mint-highlight">
                    {factor.score}/{factor.maxScore}
                  </span>
                </div>
                <div className="w-full bg-midnight-deep h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.status === 'good'
                        ? 'bg-mint-lime'
                        : factor.status === 'warning'
                        ? 'bg-status-caution'
                        : 'bg-status-risk'
                    }`}
                    style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-paper-secondary leading-relaxed">
                  {factor.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-midnight-border/60">
                <Badge
                  variant={
                    factor.status === 'good'
                      ? 'mint'
                      : factor.status === 'warning'
                      ? 'caution'
                      : 'risk'
                  }
                  size="sm"
                >
                  {factor.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* DYNAMIC ACTIONABLE INSIGHTS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display text-paper-primary">
          Actionable Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insightsList.map((item) => (
            <Card
              key={item.id}
              className={`p-5 flex flex-col justify-between border ${
                item.type === 'critical'
                  ? 'border-status-risk/40 bg-status-risk/5'
                  : item.type === 'caution'
                  ? 'border-status-caution/40 bg-status-caution/5'
                  : 'border-mint-lime/30 bg-mint-lime/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={
                      item.type === 'critical'
                        ? 'risk'
                        : item.type === 'caution'
                        ? 'caution'
                        : 'mint'
                    }
                  >
                    {item.supportingStat}
                  </Badge>
                  <span className="text-[10px] font-mono text-paper-muted uppercase">
                    SYSTEM DIAGNOSTIC
                  </span>
                </div>

                <h3 className="text-sm font-bold text-paper-primary mb-1">{item.title}</h3>
                <p className="text-xs text-paper-secondary leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <Link
                to={item.actionTo}
                className="pt-3 border-t border-midnight-border flex items-center justify-between text-xs font-mono font-bold text-mint-highlight hover:text-mint-lime transition-colors"
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
