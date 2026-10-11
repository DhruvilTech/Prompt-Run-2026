import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Info,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatRupees } from '../../domain/financeFormatters';
import { validateAmount, sanitizeString } from '../../domain/financeValidation';
import { SavingsGoal } from '../../domain/financeTypes';

export const GoalsPage: React.FC = () => {
  const { state, summary, addGoal, deleteGoal, contributeToGoal } = useFinance();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetStr, setGoalTargetStr] = useState('');
  const [goalInitialStr, setGoalInitialStr] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Contribute Modal
  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);
  const [contribAmountStr, setContribAmountStr] = useState('');
  const [contribError, setContribError] = useState<string | null>(null);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const validatedTarget = validateAmount(goalTargetStr);
    if (!validatedTarget.isValid) {
      setAddError(validatedTarget.error || 'Invalid target amount');
      return;
    }
    const initialVal = goalInitialStr ? validateAmount(goalInitialStr).value : 0;

    addGoal({
      name: sanitizeString(goalName) || 'Goal',
      targetAmount: validatedTarget.value,
      currentAmount: initialVal,
      targetDay: 30,
      isVirtualAllocation: true,
    });

    setGoalName('');
    setGoalTargetStr('');
    setGoalInitialStr('');
    setAddError(null);
    setAddModalOpen(false);
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribGoal) return;
    const validated = validateAmount(contribAmountStr);
    if (!validated.isValid) {
      setContribError(validated.error || 'Invalid amount');
      return;
    }

    if (validated.value > summary.uncommittedBalance) {
      setContribError(
        `Amount exceeds your uncommitted cash buffer (₹${summary.uncommittedBalance.toLocaleString('en-IN')})`
      );
      return;
    }

    contributeToGoal(contribGoal.id, validated.value);
    setContribGoal(null);
    setContribAmountStr('');
    setContribError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-midnight-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-paper-primary tracking-tight">
            Savings Goals & Future Reserves
          </h1>
          <p className="text-xs sm:text-sm text-paper-secondary mt-1">
            Earmark virtual cash buffers to build discipline without double-spending your ₹10,000 allowance.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setAddModalOpen(true)}
        >
          Create Savings Goal
        </Button>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card elevated className="p-5">
          <span className="text-xs font-mono font-bold uppercase text-paper-secondary block mb-1">
            Total Earmarked
          </span>
          <div className="text-3xl font-mono font-black text-mint-lime">
            {formatRupees(summary.savingsAllocationsTotal)}
          </div>
          <p className="text-xs text-paper-muted mt-1">
            Protected from daily spending allowances across all active goals.
          </p>
        </Card>

        <Card elevated className="p-5">
          <span className="text-xs font-mono font-bold uppercase text-paper-secondary block mb-1">
            Available Uncommitted Cash
          </span>
          <div className="text-3xl font-mono font-black text-mint-highlight">
            {formatRupees(summary.uncommittedBalance)}
          </div>
          <p className="text-xs text-paper-muted mt-1">
            Free cash you can safely allocate into goals today without default risk.
          </p>
        </Card>

        <Card elevated className="p-5">
          <span className="text-xs font-mono font-bold uppercase text-paper-secondary block mb-1">
            Active Targets
          </span>
          <div className="text-3xl font-mono font-black text-paper-primary">
            {state.goals.length} Goals
          </div>
          <p className="text-xs text-paper-muted mt-1">
            Emergency buffers & hardware upgrades being tracked this month.
          </p>
        </Card>
      </div>

      {/* ACCOUNTING INTEGRITY NOTICE */}
      <div className="p-4 rounded-2xl bg-midnight-panel border border-midnight-border flex items-start gap-3">
        <Info className="w-5 h-5 text-mint-cyan shrink-0 mt-0.5" />
        <div className="text-xs text-paper-secondary leading-relaxed">
          <span className="font-bold text-paper-primary block mb-0.5">
            Transparent Accounting Note:
          </span>
          Allocations made to goals represent virtual ring-fencing. They lower your safe daily
          spending allowance to prevent impulse buying, while your liquid cash stays securely in your
          account.
        </div>
      </div>

      {/* GOALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.goals.map((goal) => {
          const progress = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isFeasible = summary.uncommittedBalance >= remaining;

          return (
            <Card elevated key={goal.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-mint-lime/15 text-mint-lime border border-mint-lime/30">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-paper-primary">{goal.name}</h3>
                      <span className="text-[10px] font-mono text-paper-muted">
                        Target Month End (Day {goal.targetDay ?? 30})
                      </span>
                    </div>
                  </div>

                  <Badge variant={progress >= 100 ? 'mint' : isFeasible ? 'cyan' : 'caution'}>
                    {progress >= 100
                      ? 'COMPLETED'
                      : isFeasible
                      ? 'FEASIBLE'
                      : 'NEEDS MORE BUFFER'}
                  </Badge>
                </div>

                <div className="my-4">
                  <div className="flex justify-between items-baseline text-xs mb-1.5">
                    <span className="font-mono text-paper-secondary">
                      Current: <strong className="text-mint-lime">{formatRupees(goal.currentAmount)}</strong>
                    </span>
                    <span className="font-mono text-paper-muted">
                      Target: {formatRupees(goal.targetAmount)} ({progress}%)
                    </span>
                  </div>

                  <div className="w-full bg-midnight-border h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-mint-lime to-mint-cyan h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-paper-muted mt-2 font-mono">
                    <span>{remaining === 0 ? 'Goal Met!' : `₹${remaining.toLocaleString('en-IN')} remaining`}</span>
                    <span>Virtual Allocation</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-midnight-border flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setContribGoal(goal);
                    setContribAmountStr('200');
                    setContribError(null);
                  }}
                  disabled={progress >= 100}
                >
                  Contribute Cash
                </Button>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 rounded-lg text-paper-muted hover:text-status-risk transition-colors"
                  aria-label={`Delete goal ${goal.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CREATE GOAL MODAL */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Create New Savings Goal"
          description="Ring-fence money for high-priority targets like an emergency cushion or equipment."
        >
          <form onSubmit={handleAddGoal} className="space-y-4">
            <Input
              label="Goal Name"
              placeholder="e.g. Emergency Cushion, Course Tuition, Trip"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Target Amount (₹)"
              type="number"
              prefix="₹"
              placeholder="e.g. 2000"
              value={goalTargetStr}
              onChange={(e) => setGoalTargetStr(e.target.value)}
              error={addError || undefined}
              required
            />

            <Input
              label="Initial Contribution (Optional ₹)"
              type="number"
              prefix="₹"
              placeholder="e.g. 500"
              value={goalInitialStr}
              onChange={(e) => setGoalInitialStr(e.target.value)}
              helperText={`Up to ₹${summary.uncommittedBalance.toLocaleString('en-IN')} uncommitted cash available.`}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-midnight-border">
              <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Goal
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONTRIBUTE CASH MODAL */}
      {contribGoal && (
        <Modal
          isOpen={Boolean(contribGoal)}
          onClose={() => setContribGoal(null)}
          title={`Fund ${contribGoal.name}`}
          description={`Transfer uncommitted money into this goal. Available uncommitted cash: ₹${summary.uncommittedBalance.toLocaleString('en-IN')}`}
        >
          <form onSubmit={handleContribute} className="space-y-4">
            <Input
              label="Contribution Amount (₹)"
              type="number"
              prefix="₹"
              placeholder="e.g. 300"
              value={contribAmountStr}
              onChange={(e) => setContribAmountStr(e.target.value)}
              error={contribError || undefined}
              required
              autoFocus
            />

            <div className="flex items-center gap-2">
              {[100, 250, 500].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setContribAmountStr(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-midnight-panel border border-midnight-border text-xs font-mono text-paper-secondary hover:text-mint-lime"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-midnight-border">
              <Button type="button" variant="ghost" onClick={() => setContribGoal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Contribution
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
