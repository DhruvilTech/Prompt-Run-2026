import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wallet,
  Zap,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  PiggyBank,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { NumberCounter } from '../../components/ui/NumberCounter';
import { formatRupees } from '../../domain/financeFormatters';

export const DashboardPage: React.FC = () => {
  const { summary, state, toggleCommitmentPaid } = useFinance();
  const navigate = useNavigate();

  const isRisk = summary.financialRisk === 'high_risk';
  const isCaution = summary.financialRisk === 'caution';

  // Category breakdown for spending distribution
  const categoryMap = new Map<string, number>();
  state.transactions
    .filter((t) => t.type === 'expense' && !t.isPlanned)
    .forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

  const categories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
  const totalExpenses = summary.actualExpenses || 1;

  // Upcoming unpaid commitments
  const upcomingCommitments = state.commitments.filter((c) => !c.isPaid);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-midnight-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-paper-primary tracking-tight">
            Financial Command Center
          </h1>
          <p className="text-xs sm:text-sm text-paper-secondary mt-1">
            Real-time survival telemetry for Day {state.config.currentDay} of {state.config.totalDays}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<Cpu className="w-4 h-4" />}
            onClick={() => navigate('/simulate')}
          >
            Simulate a Decision
          </Button>
        </div>
      </div>

      {/* TOP ROW: Hero Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Panel 1: Primary Remaining Cash (5 cols) */}
        <Card elevated className="lg:col-span-5 p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-mint-lime/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-paper-secondary flex items-center gap-2">
                <Wallet className="w-4 h-4 text-mint-lime" />
                Remaining Cash in Pocket
              </span>
              <Badge variant={isRisk ? 'risk' : isCaution ? 'caution' : 'mint'}>
                {summary.financialRisk.replace('_', ' ')}
              </Badge>
            </div>

            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-paper-primary my-2">
              <NumberCounter value={summary.remainingCash} />
            </div>

            <p className="text-xs text-paper-muted">
              Started at ₹{state.config.startingBudget.toLocaleString('en-IN')}. Actual liquid cash
              in hand after all posted income and expenses.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-midnight-border grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-paper-muted block">Unpaid Commitments:</span>
              <span className="font-mono text-status-caution font-semibold">
                {formatRupees(summary.unpaidCommitmentsTotal)}
              </span>
            </div>
            <div>
              <span className="text-paper-muted block">Uncommitted Balance:</span>
              <span className="font-mono text-mint-highlight font-semibold">
                {formatRupees(summary.uncommittedBalance)}
              </span>
            </div>
          </div>
        </Card>

        {/* Panel 2: Safe Daily Spending Allowance (4 cols) */}
        <Card elevated className="lg:col-span-4 p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-mint-cyan/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-paper-secondary flex items-center gap-2">
                <Zap className="w-4 h-4 text-mint-cyan" />
                Safe Daily Allowance
              </span>
              <span className="text-xs font-mono text-paper-muted">
                {summary.daysRemaining} days left
              </span>
            </div>

            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-mint-highlight my-2">
              <NumberCounter value={summary.safeDailyAllowance} />
              <span className="text-sm font-normal text-paper-secondary"> /day</span>
            </div>

            <p className="text-xs text-paper-muted">
              Spending under this rate guarantees survival until Day 30 without running out of money.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-midnight-border flex items-center justify-between text-xs">
            <span className="text-paper-muted">Current Burn Rate:</span>
            <span className="font-mono font-bold text-paper-primary">
              {formatRupees(summary.actualDailyBurnRate)}/day
            </span>
          </div>
        </Card>

        {/* Panel 3: Financial Health & Risk Explanation (3 cols) */}
        <Card className="lg:col-span-3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase text-paper-secondary">
                Health Score
              </span>
              <span className="text-xl font-black font-mono text-mint-lime">
                {summary.financialHealthScore}
                <span className="text-xs text-paper-muted">/100</span>
              </span>
            </div>

            {/* Score visual meter */}
            <div className="w-full bg-midnight-border h-2 rounded-full overflow-hidden my-2">
              <div
                className="h-full bg-gradient-to-r from-status-risk via-status-caution to-mint-lime transition-all duration-700"
                style={{ width: `${summary.financialHealthScore}%` }}
              />
            </div>

            <div className="mt-4 p-2.5 rounded-xl bg-midnight-panel/90 border border-midnight-border text-xs leading-relaxed">
              <p className="font-semibold text-paper-primary mb-1 flex items-center gap-1.5">
                {isRisk ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-status-risk" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-mint-lime" />
                )}
                Diagnosis
              </p>
              <p className="text-paper-secondary">{summary.financialRiskReason}</p>
            </div>
          </div>

          <Link
            to="/insights"
            className="text-xs text-mint-lime hover:underline font-mono mt-4 flex items-center justify-between"
          >
            <span>View factor breakdown</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      {/* SECOND ROW: 30-Day Monthly Timeline & Projected Trajectory */}
      <Card elevated className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold font-display text-paper-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-mint-lime" />
              30-Day Survival Trajectory & Balance Projection
            </h2>
            <p className="text-xs text-paper-secondary">
              Actual recorded cashflow (Days 1–{state.config.currentDay}) contrasted against safe vs current burn pace.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-mint-lime">
              <span className="w-2.5 h-2.5 rounded-full bg-mint-lime" />
              Actual Historical
            </span>
            <span className="flex items-center gap-1.5 text-mint-cyan">
              <span className="w-2.5 h-0.5 bg-mint-cyan" />
              Safe Projection
            </span>
            <span className="flex items-center gap-1.5 text-status-caution">
              <span className="w-2.5 h-0.5 bg-status-caution border-dashed" />
              Current Pace Projection
            </span>
          </div>
        </div>

        {/* 30-Day Timeline Chart */}
        <div className="h-44 w-full relative pt-4 pb-2">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-paper-muted w-full" />
            <div className="border-b border-paper-muted w-full" />
            <div className="border-b border-paper-muted w-full" />
          </div>

          {/* SVG Sparkline Curve */}
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
            {/* Draw Actual Line (Day 1 to CurrentDay) */}
            {summary.projectedTrajectory.length > 1 && (
              <polyline
                fill="none"
                stroke="#B6FF5C"
                strokeWidth="2.5"
                points={summary.projectedTrajectory
                  .slice(0, state.config.currentDay)
                  .map((point) => {
                    const x = ((point.day - 1) / 29) * 300;
                    const maxB = state.config.startingBudget * 1.2;
                    const y = 100 - ((point.actualBalance ?? 0) / maxB) * 100;
                    return `${x},${Math.max(5, Math.min(95, y))}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Draw Safe Projection Line */}
            {summary.projectedTrajectory.length > 1 && (
              <polyline
                fill="none"
                stroke="#50E3C2"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                points={summary.projectedTrajectory
                  .map((point) => {
                    const x = ((point.day - 1) / 29) * 300;
                    const maxB = state.config.startingBudget * 1.2;
                    const y = 100 - (point.projectedSafeBalance / maxB) * 100;
                    return `${x},${Math.max(5, Math.min(95, y))}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Current Day Pin */}
            <circle
              cx={((state.config.currentDay - 1) / 29) * 300}
              cy={
                100 -
                ((summary.projectedTrajectory[state.config.currentDay - 1]?.actualBalance ?? summary.remainingCash) /
                  (state.config.startingBudget * 1.2)) *
                  100
              }
              r="4"
              fill="#B6FF5C"
              stroke="#080D12"
              strokeWidth="2"
            />
          </svg>

          {/* Day markers along the bottom */}
          <div className="flex justify-between items-center text-[10px] font-mono text-paper-muted mt-2 px-1">
            <span>Day 1 (Start)</span>
            <span className="text-mint-lime font-bold">Today: Day {state.config.currentDay}</span>
            <span>Day 15 (Midpoint)</span>
            <span>Day 30 (Month End)</span>
          </div>
        </div>

        {/* Forecast conclusion row */}
        <div className="mt-4 pt-3 border-t border-midnight-border flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
          <div>
            <span className="text-paper-muted">Projected Month-End Balance: </span>
            <span
              className={`font-mono font-bold ${
                summary.projectedMonthEndBalance >= 0 ? 'text-mint-lime' : 'text-status-risk'
              }`}
            >
              {formatRupees(summary.projectedMonthEndBalance)}
            </span>
          </div>
          <span className="text-paper-muted">
            {summary.projectedMonthEndBalance >= 0
              ? '✓ Current trajectory reaches the finish line safely.'
              : '⚠️ Projected to run negative before Day 30 at current burn rate.'}
          </span>
        </div>
      </Card>

      {/* THIRD ROW: Grid with 3 Columns: Upcoming Commitments, Category Breakdown, Savings Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Upcoming Commitments Card */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold font-display text-paper-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-status-caution" />
                Upcoming Commitments
              </h3>
              <Badge variant="caution">{upcomingCommitments.length} pending</Badge>
            </div>

            <div className="space-y-2 mt-3">
              {upcomingCommitments.length === 0 ? (
                <p className="text-xs text-paper-muted italic py-3 text-center">
                  All commitments for this month are paid!
                </p>
              ) : (
                upcomingCommitments.slice(0, 4).map((comm) => (
                  <div
                    key={comm.id}
                    className="p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border flex items-center justify-between hover:border-mint-lime/30 transition-all"
                  >
                    <div>
                      <p className="text-xs font-semibold text-paper-primary">{comm.name}</p>
                      <span className="text-[10px] text-paper-muted font-mono">
                        Due Day {comm.dueDay} • {comm.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-status-caution">
                        {formatRupees(comm.amount)}
                      </span>
                      <button
                        onClick={() => toggleCommitmentPaid(comm.id)}
                        title="Mark as Paid"
                        className="p-1 rounded-md text-paper-muted hover:text-mint-lime hover:bg-midnight-border transition-colors"
                        aria-label={`Mark ${comm.name} as paid`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/plan"
            className="text-xs text-mint-lime hover:underline font-mono mt-4 block text-center pt-2 border-t border-midnight-border"
          >
            Manage recurring commitments →
          </Link>
        </Card>

        {/* Category Breakdown Card */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold font-display text-paper-primary flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-mint-cyan" />
                Spending Breakdown
              </h3>
              <span className="text-xs font-mono text-paper-muted">
                {formatRupees(summary.actualExpenses)} total
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {categories.slice(0, 4).map(([category, amount]) => {
                const pct = Math.round((amount / totalExpenses) * 100);
                return (
                  <div
                    key={category}
                    onClick={() => navigate(`/transactions?category=${encodeURIComponent(category)}`)}
                    className="cursor-pointer group"
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-paper-secondary group-hover:text-mint-highlight transition-colors">
                        {category}
                      </span>
                      <span className="font-mono text-paper-primary font-semibold">
                        {formatRupees(amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-midnight-border h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-mint-cyan h-full rounded-full transition-all duration-300 group-hover:bg-mint-lime"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            to="/transactions"
            className="text-xs text-mint-cyan hover:underline font-mono mt-4 block text-center pt-2 border-t border-midnight-border"
          >
            View all transactions →
          </Link>
        </Card>

        {/* Savings Goals Preview */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold font-display text-paper-primary flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-mint-lime" />
                Savings Goals
              </h3>
              <Badge variant="mint">
                {formatRupees(summary.savingsAllocationsTotal)} allocated
              </Badge>
            </div>

            <div className="space-y-2.5 mt-3">
              {state.goals.map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-paper-primary">{goal.name}</span>
                      <span className="font-mono text-mint-lime font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-midnight-border h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-mint-lime to-mint-cyan h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-paper-muted mt-1.5">
                      <span>{formatRupees(goal.currentAmount)}</span>
                      <span>Target: {formatRupees(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            to="/goals"
            className="text-xs text-mint-lime hover:underline font-mono mt-4 block text-center pt-2 border-t border-midnight-border"
          >
            Manage savings goals →
          </Link>
        </Card>
      </div>

      {/* FOURTH ROW: Recent Transactions Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold font-display text-paper-primary">
            Recent Cash Activity
          </h3>
          <Link
            to="/transactions"
            className="text-xs font-mono text-mint-lime hover:underline flex items-center gap-1"
          >
            View all ({state.transactions.length})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-midnight-border">
          {state.transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    t.type === 'income'
                      ? 'bg-mint-lime/15 text-mint-lime border border-mint-lime/30'
                      : 'bg-status-risk/15 text-status-risk border border-status-risk/30'
                  }`}
                >
                  {t.type === 'income' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-paper-primary">{t.description}</p>
                  <span className="text-[10px] text-paper-muted font-mono">
                    Day {t.dayIndex} • {t.category}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-xs font-mono font-bold block ${
                    t.type === 'income' ? 'text-mint-lime' : 'text-paper-primary'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}
                  {formatRupees(t.amount)}
                </span>
                <span className="text-[10px] text-paper-muted font-mono">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
