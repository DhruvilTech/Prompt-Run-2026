import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
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
import { Transaction, TransactionCategory, TransactionType } from '../../domain/financeTypes';

export const TransactionsPage: React.FC = () => {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [searchParams] = useSearchParams();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>(
    'date_desc'
  );

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Food & Dining');
  const [formDesc, setFormDesc] = useState('');
  const [formDay, setFormDay] = useState(state.config.currentDay);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirm Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingTx(null);
    setFormType('expense');
    setFormAmount('');
    setFormCategory('Food & Dining');
    setFormDesc('');
    setFormDay(state.config.currentDay);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTx(t);
    setFormType(t.type);
    setFormAmount(String(t.amount));
    setFormCategory(t.category);
    setFormDesc(t.description);
    setFormDay(t.dayIndex);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateAmount(formAmount);
    if (!validated.isValid) {
      setFormError(validated.error || 'Invalid amount');
      return;
    }

    const cleanDesc = sanitizeString(formDesc) || (formType === 'income' ? 'Income' : 'Expense');

    if (editingTx) {
      updateTransaction({
        ...editingTx,
        type: formType,
        amount: validated.value,
        category: formCategory,
        description: cleanDesc,
        dayIndex: formDay,
      });
    } else {
      addTransaction({
        type: formType,
        amount: validated.value,
        category: formCategory,
        description: cleanDesc,
        date: new Date().toISOString().split('T')[0] || '2026-10-11',
        dayIndex: formDay,
        isPlanned: false,
      });
    }

    setModalOpen(false);
  };

  // Filtered and Sorted list
  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          if (!matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.dayIndex - a.dayIndex;
        if (sortBy === 'date_asc') return a.dayIndex - b.dayIndex;
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [state.transactions, typeFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-midnight-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-paper-primary tracking-tight">
            Transaction Registry
          </h1>
          <p className="text-xs sm:text-sm text-paper-secondary mt-1">
            Complete record of posted income and expenses shaping your ₹10,000 month.
          </p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
          Record Transaction
        </Button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-paper-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-midnight-panel border border-midnight-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-paper-primary placeholder-paper-muted focus:outline-none focus:border-mint-lime/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
            className="bg-midnight-panel border border-midnight-border rounded-xl px-3 py-2 text-xs text-paper-secondary focus:outline-none focus:border-mint-lime/50"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-midnight-panel border border-midnight-border rounded-xl px-3 py-2 text-xs text-paper-secondary focus:outline-none focus:border-mint-lime/50"
          >
            <option value="all">All Categories</option>
            {VALID_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
              )
            }
            className="bg-midnight-panel border border-midnight-border rounded-xl px-3 py-2 text-xs text-paper-secondary focus:outline-none focus:border-mint-lime/50"
          >
            <option value="date_desc">Latest First (Day 30 → 1)</option>
            <option value="date_asc">Earliest First (Day 1 → 30)</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </Card>

      {/* TRANSACTIONS TABLE */}
      <Card elevated className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-midnight-panel/50 border-b border-midnight-border text-paper-muted font-mono uppercase">
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight-border">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-paper-muted italic">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-midnight-panel/60 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="text-mint-lime font-bold">Day {t.dayIndex}</span>
                      <span className="text-[10px] text-paper-muted block">{t.date}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-paper-primary">
                      {t.description}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={t.type === 'income' ? 'mint' : 'neutral'}>
                        {t.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={t.type === 'income' ? 'text-mint-lime' : 'text-paper-primary'}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatRupees(t.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 rounded-lg text-paper-muted hover:text-paper-primary hover:bg-midnight-border transition-colors"
                          aria-label={`Edit transaction ${t.description}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="p-1.5 rounded-lg text-paper-muted hover:text-status-risk hover:bg-midnight-border transition-colors"
                          aria-label={`Delete transaction ${t.description}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD / EDIT TRANSACTION MODAL */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTx ? 'Edit Transaction' : 'Record Transaction'}
          description="Log cashflow to synchronize your daily allowance calculation."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex bg-midnight-panel p-1 rounded-xl border border-midnight-border">
              <button
                type="button"
                onClick={() => setFormType('expense')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  formType === 'expense'
                    ? 'bg-status-risk/20 text-status-risk border border-status-risk/40'
                    : 'text-paper-secondary'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormType('income')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  formType === 'income'
                    ? 'bg-mint-lime/20 text-mint-lime border border-mint-lime/40'
                    : 'text-paper-secondary'
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
              placeholder="e.g. 350"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              error={formError || undefined}
              required
              autoFocus
            />

            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
              options={VALID_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <Input
              label="Description"
              placeholder="e.g. Metro pass, Chai, Freelance project"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              maxLength={80}
            />

            <Input
              label="Day of Month (1 - 30)"
              type="number"
              min={1}
              max={30}
              value={formDay}
              onChange={(e) =>
                setFormDay(Math.min(30, Math.max(1, parseInt(e.target.value, 10) || 1)))
              }
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-midnight-border">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingTx ? 'Update Transaction' : 'Record Transaction'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <Modal
          isOpen={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          title="Delete Transaction?"
          description="Are you sure you want to remove this transaction? This recalculates cash balances."
        >
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) deleteTransaction(deleteId);
                setDeleteId(null);
              }}
            >
              Confirm Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
