import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useFinance } from '../../state/FinanceContext';
import { VALID_CATEGORIES, validateAmount, sanitizeString } from '../../domain/financeValidation';
import { TransactionCategory, TransactionType } from '../../domain/financeTypes';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, state } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [description, setDescription] = useState('');
  const [dayIndex, setDayIndex] = useState(state.config.currentDay);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateAmount(amountStr);
    if (!validated.isValid) {
      setError(validated.error || 'Invalid amount');
      return;
    }

    const cleanDesc = sanitizeString(description) || (type === 'income' ? 'Income entry' : 'Expense entry');

    addTransaction({
      type,
      amount: validated.value,
      category,
      description: cleanDesc,
      date: new Date().toISOString().split('T')[0] || '2026-10-11',
      dayIndex: Number(dayIndex) || state.config.currentDay,
      isPlanned: false,
    });

    setAmountStr('');
    setDescription('');
    setError(null);
    onClose();
  };

  const categoryOptions = VALID_CATEGORIES.map((c) => ({ value: c, label: c }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transaction"
      description="Quickly record cashflow to synchronize your daily budget."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Income / Expense */}
        <div className="flex bg-midnight-panel p-1 rounded-xl border border-midnight-border">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-status-risk/20 text-status-risk border border-status-risk/40 shadow-sm'
                : 'text-paper-secondary hover:text-paper-primary'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-mint-lime/20 text-mint-lime border border-mint-lime/40 shadow-sm'
                : 'text-paper-secondary hover:text-paper-primary'
            }`}
          >
            Income
          </button>
        </div>

        <Input
          label="Amount (₹)"
          type="number"
          step="any"
          prefix="₹"
          placeholder="e.g. 250"
          value={amountStr}
          onChange={(e) => {
            setAmountStr(e.target.value);
            if (error) setError(null);
          }}
          error={error || undefined}
          required
          autoFocus
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          options={categoryOptions}
        />

        <Input
          label="Description"
          placeholder="e.g. Metro card recharge, Groceries, Dinner"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={80}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Day of Month (1 - 30)"
            type="number"
            min={1}
            max={30}
            value={dayIndex}
            onChange={(e) => setDayIndex(Math.min(30, Math.max(1, parseInt(e.target.value, 10) || 1)))}
          />
          <div className="flex flex-col justify-end">
            <span className="text-xs text-paper-muted pb-3">
              Defaults to current day ({state.config.currentDay})
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-midnight-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Record Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
