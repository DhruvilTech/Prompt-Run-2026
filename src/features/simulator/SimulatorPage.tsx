import React, { useState } from 'react';
import {
  Cpu,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Zap,
  Wallet,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  formatRupees,
  formatRupeesDelta,
} from '../../domain/financeFormatters';
import { VALID_CATEGORIES, validateAmount, sanitizeString } from '../../domain/financeValidation';
import { ScenarioImpactType, TransactionCategory } from '../../domain/financeTypes';

export const SimulatorPage: React.FC = () => {
  const {
    allScenarios,
    activeScenario,
    scenarioComparison,
    setActiveScenario,
    applyActiveScenario,
    discardActiveScenario,
    addCustomScenario,
  } = useFinance();

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Custom scenario form state
  const [customTitle, setCustomTitle] = useState('');
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [customCategory, setCustomCategory] = useState<TransactionCategory>('Shopping');
  const [customImpact, setCustomImpact] = useState<ScenarioImpactType>('one_off_expense');
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCreateCustomScenario = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateAmount(customAmountStr);
    if (!validated.isValid) {
      setCustomError(validated.error || 'Invalid amount');
      return;
    }
    const title = sanitizeString(customTitle) || 'Custom Decision';

    addCustomScenario({
      title,
      description: `Simulated ${customImpact.replace('_', ' ')} of ₹${validated.value}`,
      category: customCategory,
      impactType: customImpact,
      amount: validated.value,
    });

    setCustomTitle('');
    setCustomAmountStr('');
    setCustomError(null);
    setCustomModalOpen(false);
  };

  const handleApplyConfirmed = () => {
    applyActiveScenario();
    setConfirmModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-midnight-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-paper-primary tracking-tight">
              Decision Simulator
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-mint-lime/20 text-mint-lime border border-mint-lime/30">
              CORE DIFFERENTIATOR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-paper-secondary mt-1">
            “See the consequence before you spend.” Test hypothetical financial decisions with zero risk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeScenario && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={discardActiveScenario}
            >
              Reset to Baseline
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setCustomModalOpen(true)}
          >
            Create Custom Scenario
          </Button>
        </div>
      </div>

      {/* ACTIVE SIMULATION BANNER & BEFORE-AND-AFTER PANEL */}
      {scenarioComparison && activeScenario ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Active Scenario Card Header */}
          <div className="p-4 rounded-2xl bg-midnight-panel border border-mint-lime/40 shadow-mint-glow/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-mint-lime/15 text-mint-lime border border-mint-lime/30 mt-0.5">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-mint-highlight uppercase">
                    HYPOTHETICAL SIMULATION ACTIVE
                  </span>
                  <Badge variant="cyan">{activeScenario.category}</Badge>
                </div>
                <h2 className="text-lg font-bold text-paper-primary">{activeScenario.title}</h2>
                <p className="text-xs text-paper-secondary">{activeScenario.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={discardActiveScenario}>
                Discard Scenario
              </Button>
              <Button
                variant="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setConfirmModalOpen(true)}
              >
                Apply Decision Permanently
              </Button>
            </div>
          </div>

          {/* SIDE-BY-SIDE METRIC COMPARISON TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Remaining Cash */}
            <Card elevated className="p-5">
              <div className="flex items-center justify-between text-xs text-paper-secondary mb-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Wallet className="w-3.5 h-3.5 text-mint-lime" />
                  Remaining Cash
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    scenarioComparison.deltas.remainingCash >= 0
                      ? 'text-mint-lime'
                      : 'text-status-risk'
                  }`}
                >
                  {formatRupeesDelta(scenarioComparison.deltas.remainingCash)}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs font-mono text-paper-muted line-through">
                  {formatRupees(scenarioComparison.baseline.remainingCash)}
                </span>
                <ArrowRight className="w-3 h-3 text-paper-muted" />
                <span className="text-xl font-mono font-black text-paper-primary">
                  {formatRupees(scenarioComparison.simulated.remainingCash)}
                </span>
              </div>
            </Card>

            {/* Metric 2: Uncommitted Balance */}
            <Card elevated className="p-5">
              <div className="flex items-center justify-between text-xs text-paper-secondary mb-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-mint-cyan" />
                  Uncommitted Buffer
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    scenarioComparison.deltas.uncommittedBalance >= 0
                      ? 'text-mint-lime'
                      : 'text-status-risk'
                  }`}
                >
                  {formatRupeesDelta(scenarioComparison.deltas.uncommittedBalance)}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs font-mono text-paper-muted line-through">
                  {formatRupees(scenarioComparison.baseline.uncommittedBalance)}
                </span>
                <ArrowRight className="w-3 h-3 text-paper-muted" />
                <span className="text-xl font-mono font-black text-mint-highlight">
                  {formatRupees(scenarioComparison.simulated.uncommittedBalance)}
                </span>
              </div>
            </Card>

            {/* Metric 3: Safe Daily Allowance */}
            <Card elevated className="p-5 border-mint-lime/30">
              <div className="flex items-center justify-between text-xs text-paper-secondary mb-2">
                <span className="flex items-center gap-1.5 font-semibold text-mint-lime">
                  <Zap className="w-3.5 h-3.5" />
                  Daily Allowance
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    scenarioComparison.deltas.safeDailyAllowance >= 0
                      ? 'text-mint-lime'
                      : 'text-status-risk'
                  }`}
                >
                  {formatRupeesDelta(scenarioComparison.deltas.safeDailyAllowance)}/d
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs font-mono text-paper-muted line-through">
                  {formatRupees(scenarioComparison.baseline.safeDailyAllowance)}
                </span>
                <ArrowRight className="w-3 h-3 text-paper-muted" />
                <span className="text-xl font-mono font-black text-mint-lime">
                  {formatRupees(scenarioComparison.simulated.safeDailyAllowance)}
                  <span className="text-xs font-normal text-paper-muted">/d</span>
                </span>
              </div>
            </Card>

            {/* Metric 4: Health Score & Risk */}
            <Card elevated className="p-5">
              <div className="flex items-center justify-between text-xs text-paper-secondary mb-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-mint-lime" />
                  Health Score
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    scenarioComparison.deltas.healthScore >= 0
                      ? 'text-mint-lime'
                      : 'text-status-risk'
                  }`}
                >
                  {scenarioComparison.deltas.healthScore >= 0 ? '+' : ''}
                  {scenarioComparison.deltas.healthScore} pts
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs font-mono text-paper-muted line-through">
                  {scenarioComparison.baseline.financialHealthScore}/100
                </span>
                <ArrowRight className="w-3 h-3 text-paper-muted" />
                <span className="text-xl font-mono font-black text-paper-primary">
                  {scenarioComparison.simulated.financialHealthScore}/100
                </span>
              </div>
            </Card>
          </div>

          {/* VISUAL IMPACT & EXPLANATION CARD */}
          <Card elevated className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mint-lime" />
              <h3 className="text-base font-bold font-display text-paper-primary">
                Consequence Analysis & Trade-off Breakdown
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-midnight-panel border border-midnight-border text-sm leading-relaxed text-paper-primary">
              {scenarioComparison.tradeoffAnalysis}
            </div>

            {/* Recommendation badge */}
            <div className="p-4 rounded-xl bg-midnight-surface border border-midnight-border flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-caution shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono uppercase font-bold text-status-caution block">
                  ADVISORY RECOMMENDATION
                </span>
                <p className="text-xs text-paper-secondary mt-0.5">
                  {scenarioComparison.recommendedAction}
                </p>
              </div>
            </div>

            {/* Trajectory comparison curve */}
            <div className="pt-2">
              <span className="text-xs font-mono text-paper-muted block mb-2">
                PROJECTED MONTH-END IMPACT:
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-paper-muted">Current Plan: </span>
                  <span className="font-bold text-paper-primary">
                    {formatRupees(scenarioComparison.baseline.projectedMonthEndBalance)}
                  </span>
                </div>
                <ArrowRight className="w-3 h-3 text-paper-muted" />
                <div>
                  <span className="text-paper-muted">Simulated Finish: </span>
                  <span
                    className={`font-bold ${
                      scenarioComparison.simulated.projectedMonthEndBalance >= 0
                        ? 'text-mint-lime'
                        : 'text-status-risk'
                    }`}
                  >
                    {formatRupees(scenarioComparison.simulated.projectedMonthEndBalance)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Empty State / Prompt to choose scenario */
        <Card className="p-8 text-center border-dashed border-midnight-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-mint-lime/10 text-mint-lime border border-mint-lime/30 flex items-center justify-center mx-auto">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-display text-paper-primary">
            No Decision Scenario Selected
          </h2>
          <p className="text-xs text-paper-secondary max-w-md mx-auto">
            Select one of the realistic scenarios below or build your own custom decision to
            simulate how spending, income, or subscriptions will affect your ₹10,000 month.
          </p>
        </Card>
      )}

      {/* PREDEFINED SCENARIO CATALOG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-paper-primary">
            Decision Library ({allScenarios.length} Scenarios)
          </h2>
          <span className="text-xs font-mono text-paper-muted">
            Click any scenario to simulate live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allScenarios.map((sc) => {
            const isSelected = activeScenario?.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setActiveScenario(sc)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 text-left border ${
                  isSelected
                    ? 'bg-midnight-panel border-mint-lime shadow-mint-glow/20 ring-1 ring-mint-lime/50'
                    : 'glass-panel hover:border-mint-lime/30 hover:bg-midnight-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={sc.impactType === 'income' ? 'mint' : sc.impactType === 'unexpected_expense' ? 'risk' : 'cyan'}>
                    {sc.category}
                  </Badge>
                  <span
                    className={`font-mono text-xs font-bold ${
                      sc.impactType === 'income' ? 'text-mint-lime' : 'text-paper-primary'
                    }`}
                  >
                    {sc.impactType === 'income' ? '+' : '-'}
                    {formatRupees(sc.amount)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-paper-primary mb-1">{sc.title}</h3>
                <p className="text-xs text-paper-secondary line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>

                <div className="mt-4 pt-3 border-t border-midnight-border flex items-center justify-between text-[11px] font-mono">
                  <span className="text-paper-muted">
                    {sc.impactType.replace('_', ' ')}
                  </span>
                  <span className="text-mint-lime font-semibold flex items-center gap-1">
                    {isSelected ? 'Simulating...' : 'Preview Impact →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRM PERMANENT DECISION MODAL */}
      {confirmModalOpen && activeScenario && (
        <Modal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="Apply Decision Permanently?"
          description="This action will officially post the simulated transaction into your actual records."
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-midnight-panel border border-midnight-border text-xs leading-relaxed">
              <p className="font-semibold text-paper-primary mb-1">
                Applying: {activeScenario.title} ({formatRupees(activeScenario.amount)})
              </p>
              <p className="text-paper-secondary">
                This will officially update your remaining cash, safe daily allowance, and month-end trajectory.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-midnight-border">
              <Button variant="ghost" onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApplyConfirmed}>
                Confirm & Apply Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE CUSTOM SCENARIO MODAL */}
      {customModalOpen && (
        <Modal
          isOpen={customModalOpen}
          onClose={() => setCustomModalOpen(false)}
          title="Build Custom Decision Scenario"
          description="Test any financial hypothetical with the TENFLOW engine."
        >
          <form onSubmit={handleCreateCustomScenario} className="space-y-4">
            <Input
              label="Decision Title"
              placeholder="e.g. Buy Concert Ticket, Extra Freelance, New gym plan"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Amount (₹)"
              type="number"
              prefix="₹"
              placeholder="e.g. 1500"
              value={customAmountStr}
              onChange={(e) => setCustomAmountStr(e.target.value)}
              error={customError || undefined}
              required
            />

            <Select
              label="Impact Type"
              value={customImpact}
              onChange={(e) => setCustomImpact(e.target.value as ScenarioImpactType)}
              options={[
                { value: 'one_off_expense', label: 'One-off Discretionary Expense' },
                { value: 'unexpected_expense', label: 'Unexpected Emergency Expense' },
                { value: 'income', label: 'Additional Income Received' },
                { value: 'new_subscription', label: 'New Monthly Subscription Commitment' },
                { value: 'savings_allocation', label: 'Allocate to Savings Goal' },
                { value: 'reserve_buffer', label: 'Lock In Emergency Safety Buffer' },
              ]}
            />

            <Select
              label="Category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as TransactionCategory)}
              options={VALID_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-midnight-border">
              <Button type="button" variant="ghost" onClick={() => setCustomModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Simulate Scenario
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
