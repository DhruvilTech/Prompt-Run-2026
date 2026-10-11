import React, { useState } from 'react';
import {
  Coffee,
  Smartphone,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatRupees } from '../../domain/financeFormatters';

interface EventItem {
  day: number;
  title: string;
  category: string;
  amount: number;
  isPositive?: boolean;
  runningCash: number;
  safeAllowanceAfter: number;
  icon: React.ReactNode;
  consequence: string;
}

const REALITY_EVENTS: EventItem[] = [
  {
    day: 1,
    title: 'Month Launch',
    category: 'Budget Start',
    amount: 10000,
    isPositive: true,
    runningCash: 10000,
    safeAllowanceAfter: 333,
    icon: <Sparkles className="w-4 h-4 text-mint-lime" />,
    consequence: 'Full starting balance. You have ₹333/day across all 30 days.',
  },
  {
    day: 4,
    title: 'Classroom Lunch & Iced Coffee',
    category: 'Food & Dining',
    amount: -250,
    runningCash: 9750,
    safeAllowanceAfter: 325,
    icon: <Coffee className="w-4 h-4 text-paper-primary" />,
    consequence: 'Casual daily treat. Allowance barely notices (-₹8/day).',
  },
  {
    day: 8,
    title: 'Freelance Design Milestone',
    category: 'Side Income',
    amount: 1200,
    isPositive: true,
    runningCash: 10950,
    safeAllowanceAfter: 380,
    icon: <TrendingUp className="w-4 h-4 text-mint-lime" />,
    consequence: 'Side-gig injection! Safe daily allowance jumps to ₹380/day.',
  },
  {
    day: 12,
    title: 'Spotify Student & WiFi Split',
    category: 'Fixed Commitments',
    amount: -459,
    runningCash: 10491,
    safeAllowanceAfter: 350,
    icon: <Smartphone className="w-4 h-4 text-status-caution" />,
    consequence: 'Fixed subscriptions debited automatically. Cash buffer adjusts.',
  },
  {
    day: 16,
    title: 'Unexpected Flat Tyre & Brake Cable',
    category: 'The Shock',
    amount: -1500,
    runningCash: 8991,
    safeAllowanceAfter: 260,
    icon: <AlertTriangle className="w-4 h-4 text-status-risk" />,
    consequence: 'Emergency cost! Daily spending power drops sharply to ₹260/day.',
  },
  {
    day: 22,
    title: 'Late Night Midnight Feast',
    category: 'Impulse Temptation',
    amount: -450,
    runningCash: 8541,
    safeAllowanceAfter: 220,
    icon: <ShoppingBag className="w-4 h-4 text-paper-secondary" />,
    consequence: 'Impulse temptation under pressure. Discipline is tested.',
  },
  {
    day: 30,
    title: 'Month-End Survival Finish',
    category: 'Goal Realized',
    amount: 0,
    isPositive: true,
    runningCash: 1450,
    safeAllowanceAfter: 0,
    icon: <Sparkles className="w-4 h-4 text-mint-cyan" />,
    consequence: 'You made it! ₹1,450 surplus preserved for emergency savings.',
  },
];

export const MoneyRealitySection: React.FC = () => {
  const [activeDayIndex, setActiveDayIndex] = useState(4); // Highlight Shock by default
  const activeEvent = REALITY_EVENTS[activeDayIndex] || REALITY_EVENTS[0]!;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
        <Badge variant="caution">THE 30-DAY ANATOMY</Badge>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-paper-primary tracking-tight leading-tight">
          Your money doesn't disappear all at once.
        </h2>
        <p className="text-sm sm:text-base text-paper-secondary leading-relaxed max-w-2xl mx-auto">
          It bleeds in ₹120 chai runs, ₹299 auto-renewals, and one sudden puncture. TENFLOW maps every
          micro-transaction along the 30-day timeline so you see the finish line before it's gone.
        </p>
      </div>

      {/* Interactive Timeline Stepper */}
      <div className="relative mb-12">
        {/* Horizontal Connecting Guide Line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-midnight-border -translate-y-1/2 z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 relative z-10">
          {REALITY_EVENTS.map((event, idx) => {
            const isSelected = activeDayIndex === idx;
            const isShock = event.amount === -1500;
            return (
              <button
                key={event.day}
                onClick={() => setActiveDayIndex(idx)}
                className={`p-3.5 rounded-2xl text-left transition-all duration-200 border ${
                  isSelected
                    ? isShock
                      ? 'bg-status-risk/15 border-status-risk shadow-risk-glow/30'
                      : 'bg-midnight-panel border-mint-lime shadow-mint-glow/20'
                    : 'glass-panel hover:border-mint-lime/30 hover:bg-midnight-hover'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-paper-muted">
                    Day {event.day}
                  </span>
                  {event.icon}
                </div>

                <div className="text-xs font-bold text-paper-primary line-clamp-1">
                  {event.title}
                </div>

                <div
                  className={`text-xs font-mono font-black mt-1 ${
                    event.isPositive
                      ? 'text-mint-lime'
                      : isShock
                      ? 'text-status-risk'
                      : 'text-paper-secondary'
                  }`}
                >
                  {event.amount > 0 ? `+₹${event.amount}` : event.amount < 0 ? `-₹${Math.abs(event.amount)}` : 'Surplus'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Event Detail Feature Card */}
      <Card elevated className="max-w-4xl mx-auto p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={activeEvent.amount < 0 && Math.abs(activeEvent.amount) >= 1000 ? 'risk' : 'mint'}>
                {activeEvent.category}
              </Badge>
              <span className="text-xs font-mono text-paper-muted">Day {activeEvent.day} of 30</span>
            </div>

            <h3 className="text-2xl font-bold font-display text-paper-primary">
              {activeEvent.title}
            </h3>

            <p className="text-sm text-paper-secondary leading-relaxed">
              {activeEvent.consequence}
            </p>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-3 p-4 rounded-2xl bg-midnight-panel border border-midnight-border">
            <div>
              <span className="text-[10px] font-mono text-paper-muted uppercase block">
                Cash in Pocket
              </span>
              <span className="text-xl font-mono font-black text-paper-primary">
                {formatRupees(activeEvent.runningCash)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-paper-muted uppercase block">
                Safe Allowance
              </span>
              <span className="text-xl font-mono font-black text-mint-highlight">
                {activeEvent.safeAllowanceAfter > 0
                  ? `${formatRupees(activeEvent.safeAllowanceAfter)}/d`
                  : 'Goal Achieved'}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-midnight-border flex items-center justify-between text-[11px] font-mono">
              <span className="text-paper-muted">Transaction Impact:</span>
              <span
                className={`font-bold ${
                  activeEvent.isPositive
                    ? 'text-mint-lime'
                    : activeEvent.amount <= -1000
                    ? 'text-status-risk'
                    : 'text-status-caution'
                }`}
              >
                {activeEvent.amount > 0 ? '+' : ''}
                {formatRupees(activeEvent.amount)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
