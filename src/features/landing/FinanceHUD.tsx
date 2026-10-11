import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { formatRupees } from '../../domain/financeFormatters';
import { Button } from '../../components/ui/Button';

interface FinanceHUDProps {
  scrollProgress: number; // 0.0 to 1.0
}

export const FinanceHUD: React.FC<FinanceHUDProps> = ({ scrollProgress }) => {
  const { summary, state } = useFinance();
  const navigate = useNavigate();

  // Active Stage determination
  let currentStage = 1;
  if (scrollProgress >= 0.75) currentStage = 4;
  else if (scrollProgress >= 0.5) currentStage = 3;
  else if (scrollProgress >= 0.25) currentStage = 2;

  // Exact calculated before and after for Stage 3 (Unexpected ₹1,500 expense)
  const unexpectedExpense = 1500;
  const daysLeft = summary.daysRemaining;
  const beforeAllowance = summary.safeDailyAllowance;
  const afterUncommitted = Math.max(0, summary.uncommittedBalance - unexpectedExpense);
  const afterAllowance = Math.round((afterUncommitted / Math.max(1, daysLeft)) * 100) / 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-4 sm:p-8">
      {/* STAGE 1: The Beginning (0.00 - 0.25) */}
      {currentStage === 1 && (
        <div className="w-full max-w-md glass-hud rounded-3xl p-6 sm:p-8 pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between text-xs font-mono mb-3">
            <span className="text-mint-lime uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              STAGE 01 • THE LAUNCH
            </span>
            <span className="text-paper-muted">Day 1 of 30</span>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-paper-secondary">
            Your Month Starts Here
          </h3>

          <div className="text-4xl sm:text-5xl font-mono font-black text-mint-highlight my-2">
            ₹{state.config.startingBudget.toLocaleString('en-IN')}
          </div>

          <p className="text-xs sm:text-sm text-paper-secondary leading-relaxed mt-2">
            30 days to make it count. A finite cash reserve, fixed obligations, and hundreds of micro-decisions ahead.
          </p>

          <div className="mt-5 pt-4 border-t border-midnight-border flex items-center justify-between text-xs font-mono text-paper-muted">
            <span>Scroll down to travel along the orbit</span>
            <span className="animate-bounce">↓</span>
          </div>
        </div>
      )}

      {/* STAGE 2: The Daily Flow (0.25 - 0.50) */}
      {currentStage === 2 && (
        <div className="w-full max-w-md glass-hud rounded-3xl p-6 sm:p-8 pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between text-xs font-mono mb-3">
            <span className="text-mint-cyan uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              STAGE 02 • THE DAILY FLOW
            </span>
            <span className="text-paper-muted">Days 2–10</span>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-paper-secondary">
            Small Decisions Add Up
          </h3>

          <div className="space-y-2.5 my-4">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border text-xs">
              <span className="text-paper-primary font-medium">Weekly Groceries & Food</span>
              <span className="font-mono font-bold text-paper-primary">-₹250</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border text-xs">
              <span className="text-paper-primary font-medium">Daily Metro Feeder Transit</span>
              <span className="font-mono font-bold text-paper-primary">-₹120</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border text-xs">
              <span className="text-paper-primary font-medium">Mobile 5G Data Recharge</span>
              <span className="font-mono font-bold text-status-caution">-₹299</span>
            </div>
          </div>

          <p className="text-xs text-paper-secondary leading-relaxed">
            Every transaction exerts gravitational pull on your safe daily allowance for the remaining days.
          </p>
        </div>
      )}

      {/* STAGE 3: The Unexpected Expense (0.50 - 0.75) */}
      {currentStage === 3 && (
        <div className="w-full max-w-md glass-hud rounded-3xl p-6 sm:p-8 pointer-events-auto border-status-risk/40 shadow-risk-glow/20 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between text-xs font-mono mb-3">
            <span className="text-status-risk uppercase tracking-widest font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              STAGE 03 • FINANCIAL SHOCK
            </span>
            <span className="text-status-risk font-bold">Unforeseen</span>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-status-risk">
            Life Doesn't Follow the Plan
          </h3>

          <div className="p-3.5 rounded-2xl bg-status-risk/10 border border-status-risk/30 my-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-paper-primary">Emergency Transit Repair</span>
              <span className="font-mono font-black text-lg text-status-risk">-₹1,500</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3 p-3 rounded-xl bg-midnight-panel/90 border border-midnight-border text-xs">
            <div>
              <span className="text-paper-muted block">Before Allowance:</span>
              <span className="font-mono font-bold text-mint-highlight">
                {formatRupees(beforeAllowance)}/day
              </span>
            </div>
            <div>
              <span className="text-paper-muted block">Recalculated Allowance:</span>
              <span className="font-mono font-bold text-status-risk">
                {formatRupees(afterAllowance)}/day
              </span>
            </div>
          </div>

          <p className="text-xs text-paper-secondary leading-relaxed">
            The TENFLOW engine instantly recalibrates your survival budget across the remaining {daysLeft} days.
          </p>
        </div>
      )}

      {/* STAGE 4: Regaining Control (0.75 - 1.00) */}
      {currentStage === 4 && (
        <div className="w-full max-w-md glass-hud rounded-3xl p-6 sm:p-8 pointer-events-auto shadow-mint-glow/30 border-mint-lime/40 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between text-xs font-mono mb-3">
            <span className="text-mint-lime uppercase tracking-widest font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              STAGE 04 • COMMAND THE FINISH
            </span>
            <span className="text-mint-lime font-bold">Resilient</span>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-mint-highlight">
            Control the Next Decision
          </h3>

          <div className="space-y-2.5 my-4">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border text-xs">
              <span className="text-paper-secondary">Safe Daily Allowance:</span>
              <span className="font-mono font-bold text-mint-lime">
                {formatRupees(summary.safeDailyAllowance)}/day
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border text-xs">
              <span className="text-paper-secondary">Protected Savings Buffer:</span>
              <span className="font-mono font-bold text-mint-cyan">
                {formatRupees(summary.savingsAllocationsTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-midnight-panel/80 border border-midnight-border text-xs">
              <span className="text-paper-secondary">Projected Month-End Finish:</span>
              <span className="font-mono font-bold text-paper-primary">
                {formatRupees(summary.projectedMonthEndBalance)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm font-bold shadow-mint-glow"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
            >
              Build My Financial Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
