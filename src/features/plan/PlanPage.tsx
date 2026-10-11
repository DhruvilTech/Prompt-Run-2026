import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatRupees } from '../../domain/financeFormatters';
import { VALID_CATEGORIES, validateAmount, sanitizeString } from '../../domain/financeValidation';
import { TransactionCategory } from '../../domain/financeTypes';

export const PlanPage: React.FC = () => {
  const { state, summary, updateConfig, addCommitment, deleteCommitment, toggleCommitmentPaid } =
    useFinance();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [commName, setCommName] = useState('');
  const [commAmountStr, setCommAmountStr] = useState('');
  const [commCategory, setCommCategory] = useState<TransactionCategory>('Subscriptions');
  const [commDueDay, setCommDueDay] = useState(15);
  const [commError, setCommError] = useState<string | null>(null);

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateAmount(commAmountStr);
    if (!validated.isValid) {
      setCommError(validated.error || 'Invalid amount');
      return;
    }

    addCommitment({
      name: sanitizeString(commName) || 'Recurring Commitment',
      amount: validated.value,
      category: commCategory,
      dueDay: commDueDay,
      isPaid: false,
    });

    setCommName('');
    setCommAmountStr('');
    setCommError(null);
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-midnight-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-paper-primary tracking-tight">
            Monthly Survival Plan
          </h1>
          <p className="text-xs sm:text-sm text-paper-secondary mt-1">
            Configure your 30-day budget baseline, timeline horizon, and recurring financial commitments.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setAddModalOpen(true)}
        >
          Add Recurring Commitment
        </Button>
      </div>

      {/* TOP CONFIGURATION ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Starting Budget Card */}
        <Card elevated className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-paper-secondary">
              Starting Budget
            </span>
            <Badge variant="mint">Baseline</Badge>
          </div>
          <div className="text-3xl font-mono font-black text-paper-primary my-1">
            {formatRupees(state.config.startingBudget)}
          </div>
          <p className="text-xs text-paper-muted">
            The foundation for the 30-day survival model. Default ₹10,000 for standard challenge.
          </p>
        </Card>

        {/* Timeline Horizon Card */}
        <Card elevated className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-paper-secondary">
              Planning Horizon
            </span>
            <Badge variant="cyan">Day {state.config.currentDay} of 30</Badge>
          </div>
          <div className="text-3xl font-mono font-black text-mint-highlight my-1">
            {summary.daysRemaining} Days Left
          </div>
          <p className="text-xs text-paper-muted">
            {state.config.currentDay} days elapsed. Safe spending distributes remaining uncommitted cash over {summary.daysRemaining} days.
          </p>
        </Card>

        {/* Emergency Safety Cushion Card */}
        <Card elevated className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-paper-secondary">
              Safety Buffer Target
            </span>
            <ShieldCheck className="w-4 h-4 text-mint-lime" />
          </div>
          <div className="text-3xl font-mono font-black text-paper-primary my-1">
            {formatRupees(state.config.emergencyBufferGoal)}
          </div>
          <p className="text-xs text-paper-muted">
            Recommended emergency floor reserved for unforeseen transit or medical hiccups.
          </p>
        </Card>
      </div>

      {/* RECURRING COMMITMENTS & SUBSCRIPTIONS SECTION */}
      <Card elevated className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-paper-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-mint-cyan" />
              Fixed Monthly Commitments & Subscriptions
            </h2>
            <p className="text-xs text-paper-secondary">
              Unpaid commitments are automatically reserved from your uncommitted balance so you never default on fixed bills.
            </p>
          </div>
          <div className="text-xs font-mono text-paper-muted">
            Unpaid Total: <span className="font-bold text-status-caution">{formatRupees(summary.unpaidCommitmentsTotal)}</span>
          </div>
        </div>

        {/* Commitments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-midnight-border text-paper-muted font-mono uppercase">
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Commitment Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Due Day</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight-border">
              {state.commitments.map((comm) => (
                <tr key={comm.id} className="hover:bg-midnight-panel/50 transition-colors">
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => toggleCommitmentPaid(comm.id)}
                      className="flex items-center gap-1.5 focus-visible:outline-none"
                      title={comm.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    >
                      {comm.isPaid ? (
                        <CheckCircle2 className="w-4 h-4 text-mint-lime" />
                      ) : (
                        <Circle className="w-4 h-4 text-paper-muted hover:text-status-caution" />
                      )}
                      <span className={comm.isPaid ? 'text-mint-lime font-mono' : 'text-paper-muted font-mono'}>
                        {comm.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </button>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-paper-primary">
                    {comm.name}
                    {comm.notes && (
                      <span className="block text-[10px] text-paper-muted font-normal">
                        {comm.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-paper-secondary">{comm.category}</td>
                  <td className="py-3.5 px-3 font-mono text-paper-muted">Day {comm.dueDay}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-right text-paper-primary">
                    {formatRupees(comm.amount)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      onClick={() => deleteCommitment(comm.id)}
                      className="p-1 rounded text-paper-muted hover:text-status-risk transition-colors"
                      aria-label={`Delete commitment ${comm.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QUICK HORIZON DAY CHANGER (INTERACTIVE SIMULATION CONTROL) */}
      <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-paper-primary flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-mint-lime" />
            Fast-Forward or Rewind Planning Day
          </h3>
          <p className="text-xs text-paper-secondary mt-0.5">
            Test how daily allowance changes as days advance across the month.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 5, 10, 15, 20, 25, 30].map((day) => (
            <button
              key={day}
              onClick={() => updateConfig({ currentDay: day })}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                state.config.currentDay === day
                  ? 'bg-mint-lime text-midnight-deep shadow-mint-glow/30'
                  : 'bg-midnight-panel text-paper-secondary hover:text-paper-primary hover:bg-midnight-border'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      </Card>

      {/* ADD COMMITMENT MODAL */}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add Recurring Commitment"
          description="Subscriptions, bills, and fixed commitments are locked in until paid."
        >
          <form onSubmit={handleAddCommitment} className="space-y-4">
            <Input
              label="Commitment Name"
              placeholder="e.g. WiFi Split, Mobile Plan, Gym"
              value={commName}
              onChange={(e) => setCommName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Amount (₹)"
              type="number"
              prefix="₹"
              placeholder="e.g. 299"
              value={commAmountStr}
              onChange={(e) => setCommAmountStr(e.target.value)}
              error={commError || undefined}
              required
            />

            <Select
              label="Category"
              value={commCategory}
              onChange={(e) => setCommCategory(e.target.value as TransactionCategory)}
              options={VALID_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <Input
              label="Due Day of Month (1 - 30)"
              type="number"
              min={1}
              max={30}
              value={commDueDay}
              onChange={(e) =>
                setCommDueDay(Math.min(30, Math.max(1, parseInt(e.target.value, 10) || 1)))
              }
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-midnight-border">
              <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Commitment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
