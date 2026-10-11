import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../state/FinanceContext';
import { formatRupees, formatRupeesDelta } from '../../domain/financeFormatters';
import { simulateDecision } from '../../domain/financeEngine';
import { DecisionScenario } from '../../domain/financeTypes';

const PREVIEW_DECISIONS: DecisionScenario[] = [
  {
    id: 'headphones',
    title: 'Should you spend ₹2,000 on headphones?',
    description: 'Upgrade to active noise-cancelling studio headphones for campus study sessions.',
    category: 'Shopping',
    impactType: 'one_off_expense',
    amount: 2000,
  },
  {
    id: 'dinner',
    title: 'Order a late-night feast for ₹450?',
    description: 'Swiggy/Zomato gourmet burger and milkshake delivery after midnight.',
    category: 'Food & Dining',
    impactType: 'one_off_expense',
    amount: 450,
  },
  {
    id: 'arcade',
    title: 'Spend ₹800 on weekend entertainment?',
    description: 'IMAX movie premiere and arcade games with roommates.',
    category: 'Entertainment',
    impactType: 'one_off_expense',
    amount: 800,
  },
  {
    id: 'freelance',
    title: 'Clear freelance milestone for +₹2,000?',
    description: 'Deliver responsive frontend components to client and receive instant transfer.',
    category: 'Income & Freelance',
    impactType: 'income',
    amount: 2000,
  },
];

export const DecisionSimulatorPreview: React.FC = () => {
  const { state, setActiveScenario } = useFinance();
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const activeScenario = PREVIEW_DECISIONS[selectedIdx] || PREVIEW_DECISIONS[0]!;

  // Run the actual pure finance engine simulation!
  const comparison = simulateDecision(
    state.config,
    state.transactions,
    state.commitments,
    state.goals,
    activeScenario
  );

  const handleOpenSimulator = () => {
    setActiveScenario(activeScenario);
    navigate('/simulate');
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-lime/10 border border-mint-lime/30 text-mint-lime text-xs font-mono font-bold uppercase">
          <Cpu className="w-3.5 h-3.5" />
          FLAGSHIP DIFFERENTIATOR
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-paper-primary tracking-tight leading-tight">
          Test the decision before you spend a single rupee.
        </h2>
        <p className="text-sm sm:text-base text-paper-secondary leading-relaxed max-w-2xl mx-auto">
          In real life, once money is spent, you're stuck with the fallout. TENFLOW gives you a risk-free
          consequence engine so you know whether you will survive Day 30.
        </p>
      </div>

      {/* Decision Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto mb-8">
        {PREVIEW_DECISIONS.map((dec, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={dec.id}
              onClick={() => setSelectedIdx(idx)}
              className={`p-3.5 rounded-2xl text-left transition-all duration-200 border ${
                isSelected
                  ? 'bg-midnight-panel border-mint-lime shadow-mint-glow/20 ring-1 ring-mint-lime/50'
                  : 'glass-panel hover:border-mint-lime/30 hover:bg-midnight-hover'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-paper-muted">{dec.category}</span>
                <span
                  className={`font-bold ${
                    dec.impactType === 'income' ? 'text-mint-lime' : 'text-paper-primary'
                  }`}
                >
                  {dec.impactType === 'income' ? '+' : '-'}
                  {formatRupees(dec.amount)}
                </span>
              </div>
              <div className="text-xs font-bold text-paper-primary line-clamp-2">
                {dec.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Before-and-After Comparison Canvas */}
      <Card elevated className="max-w-4xl mx-auto p-6 sm:p-9 relative overflow-hidden">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-midnight-border">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-mint-lime font-bold">
              LIVE SIMULATION TELEMETRY
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-paper-primary mt-1">
              {activeScenario.title}
            </h3>
          </div>
          <Badge variant={activeScenario.impactType === 'income' ? 'mint' : 'caution'}>
            {activeScenario.category}
          </Badge>
        </div>

        {/* 3 Metric Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Metric 1: Remaining Cash */}
          <div className="p-4 rounded-2xl bg-midnight-panel border border-midnight-border">
            <span className="text-[11px] font-mono uppercase text-paper-muted block mb-1">
              Liquid Cash in Pocket
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono text-paper-muted line-through">
                {formatRupees(comparison.baseline.remainingCash)}
              </span>
              <span className="text-xs font-mono font-bold text-paper-secondary">
                {formatRupeesDelta(comparison.deltas.remainingCash)}
              </span>
            </div>
            <div className="text-2xl font-mono font-black text-paper-primary mt-1">
              {formatRupees(comparison.simulated.remainingCash)}
            </div>
          </div>

          {/* Metric 2: Safe Daily Allowance */}
          <div className="p-4 rounded-2xl bg-midnight-panel border border-mint-lime/40 shadow-mint-glow/15">
            <span className="text-[11px] font-mono uppercase text-mint-lime font-bold block mb-1">
              Safe Daily Allowance
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono text-paper-muted line-through">
                {formatRupees(comparison.baseline.safeDailyAllowance)}/d
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  comparison.deltas.safeDailyAllowance >= 0
                    ? 'text-mint-lime'
                    : 'text-status-risk'
                }`}
              >
                {formatRupeesDelta(comparison.deltas.safeDailyAllowance)}/d
              </span>
            </div>
            <div className="text-2xl font-mono font-black text-mint-highlight mt-1">
              {formatRupees(comparison.simulated.safeDailyAllowance)}
              <span className="text-xs font-normal text-paper-muted"> /day</span>
            </div>
          </div>

          {/* Metric 3: Projected Month-End Balance */}
          <div className="p-4 rounded-2xl bg-midnight-panel border border-midnight-border">
            <span className="text-[11px] font-mono uppercase text-paper-muted block mb-1">
              Projected Month-End Finish
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono text-paper-muted line-through">
                {formatRupees(comparison.baseline.projectedMonthEndBalance)}
              </span>
              <span className="text-xs font-mono font-bold text-paper-secondary">
                {formatRupeesDelta(comparison.deltas.projectedMonthEndBalance)}
              </span>
            </div>
            <div
              className={`text-2xl font-mono font-black mt-1 ${
                comparison.simulated.projectedMonthEndBalance >= 0
                  ? 'text-mint-lime'
                  : 'text-status-risk'
              }`}
            >
              {formatRupees(comparison.simulated.projectedMonthEndBalance)}
            </div>
          </div>
        </div>

        {/* Engine Trade-off Narrative */}
        <div className="p-4 rounded-2xl bg-midnight-surface border border-midnight-border text-xs sm:text-sm text-paper-secondary leading-relaxed mb-6">
          <strong className="text-paper-primary block mb-1">Engine Analysis:</strong>
          {comparison.tradeoffAnalysis}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-midnight-border">
          <span className="text-xs text-paper-muted font-mono">
            Derived directly from TENFLOW deterministic calculation engine.
          </span>
          <Button
            variant="primary"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={handleOpenSimulator}
          >
            Launch Full Decision Simulator
          </Button>
        </div>
      </Card>
    </section>
  );
};
