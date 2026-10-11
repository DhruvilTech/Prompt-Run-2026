import {
  Zap,
  Layers,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useFinance } from '../../state/FinanceContext';
import { formatRupees } from '../../domain/financeFormatters';

export const FinancialControlSection: React.FC = () => {
  const { summary, state } = useFinance();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
        <Badge variant="mint">INTEGRATED CONTROL</Badge>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-paper-primary tracking-tight leading-tight">
          Five levers. One survival equation.
        </h2>
        <p className="text-sm sm:text-base text-paper-secondary leading-relaxed max-w-2xl mx-auto">
          Unlike ordinary expense trackers that just show you where your money went after it's gone,
          TENFLOW links all five financial components into one synchronized telemetry loop.
        </p>
      </div>

      {/* Asymmetric Editorial Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEVER 1: Safe Daily Allowance (5 cols) */}
        <Card elevated className="lg:col-span-5 p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-mint-lime font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> LEVER 01 // DYNAMIC ALLOWANCE
              </span>
              <span className="text-xs font-mono text-paper-muted">Day {state.config.currentDay} of 30</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-paper-primary">
              The only number you need to look at each morning.
            </h3>
            <p className="text-xs sm:text-sm text-paper-secondary leading-relaxed mt-2">
              Every rupee you spend or save dynamically changes your safe daily allowance across all
              remaining days. Spend under this allowance and month-end survival is guaranteed.
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-midnight-border flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-mono text-paper-muted uppercase block">
                Current Safe Allowance
              </span>
              <span className="text-3xl font-mono font-black text-mint-highlight">
                {formatRupees(summary.safeDailyAllowance)}
                <span className="text-xs font-normal text-paper-muted"> /day</span>
              </span>
            </div>
            <span className="text-xs font-mono text-paper-muted">
              {summary.daysRemaining} days remaining
            </span>
          </div>
        </Card>

        {/* LEVER 2: Unpaid Reserved Commitments & Chart (7 cols) */}
        <Card elevated className="lg:col-span-7 p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-mint-cyan font-bold flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> LEVER 02 // 30-DAY GLIDEPATH
              </span>
              <span className="text-xs font-mono text-paper-muted">Predictive Model</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-paper-primary">
              Planned Glidepath vs Historical Cash
            </h3>
            <p className="text-xs sm:text-sm text-paper-secondary leading-relaxed mt-2">
              Visualizes actual historical cash depletion against the sustainable safe trajectory to
              prevent mid-month crashes.
            </p>

            {/* High-quality Glidepath Chart */}
            <div className="h-40 w-full relative pt-4 pb-2 mt-4">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                {/* Safe projection line */}
                <polyline
                  fill="none"
                  stroke="#50E3C2"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  points={summary.projectedTrajectory
                    .map((p) => {
                      const x = ((p.day - 1) / 29) * 300;
                      const maxB = state.config.startingBudget * 1.2;
                      const y = 100 - (p.projectedSafeBalance / maxB) * 100;
                      return `${x},${Math.max(5, Math.min(95, y))}`;
                    })
                    .join(' ')}
                />
                {/* Actual line up to currentDay */}
                <polyline
                  fill="none"
                  stroke="#B6FF5C"
                  strokeWidth="3"
                  points={summary.projectedTrajectory
                    .slice(0, state.config.currentDay)
                    .map((p) => {
                      const x = ((p.day - 1) / 29) * 300;
                      const maxB = state.config.startingBudget * 1.2;
                      const y = 100 - ((p.actualBalance ?? 0) / maxB) * 100;
                      return `${x},${Math.max(5, Math.min(95, y))}`;
                    })
                    .join(' ')}
                />
              </svg>
              <div className="flex justify-between items-center text-[10px] font-mono text-paper-muted mt-2">
                <span>Day 1 (₹10,000)</span>
                <span className="text-mint-lime font-bold">Today (Day {state.config.currentDay})</span>
                <span>Day 30 Finish</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-midnight-border flex items-center justify-between text-xs">
            <span className="text-paper-muted">Projected Month-End Balance:</span>
            <span className="font-mono font-bold text-mint-lime">
              {formatRupees(summary.projectedMonthEndBalance)}
            </span>
          </div>
        </Card>

        {/* LEVER 3: Ring-Fenced Savings Buffers (4 cols) */}
        <Card className="lg:col-span-4 p-6 space-y-3">
          <span className="text-xs font-mono uppercase text-mint-lime font-bold block">
            LEVER 03 // VIRTUAL RING-FENCING
          </span>
          <h4 className="text-lg font-bold text-paper-primary">Savings Goals</h4>
          <p className="text-xs text-paper-secondary leading-relaxed">
            Allocations to goals are ring-fenced from daily spending without actually requiring
            external bank transfers. They protect cash from impulsive moments.
          </p>
          <div className="pt-3 border-t border-midnight-border font-mono text-xs text-mint-cyan">
            Active Buffer: {formatRupees(summary.savingsAllocationsTotal)}
          </div>
        </Card>

        {/* LEVER 4: Recurring Subscriptions Protection (4 cols) */}
        <Card className="lg:col-span-4 p-6 space-y-3">
          <span className="text-xs font-mono uppercase text-status-caution font-bold block">
            LEVER 04 // FIXED OBLIGATIONS
          </span>
          <h4 className="text-lg font-bold text-paper-primary">Reserved Commitments</h4>
          <p className="text-xs text-paper-secondary leading-relaxed">
            Unpaid bills and Spotify/WiFi dues are automatically subtracted from your spending pool.
            You will never accidentally spend money promised to upcoming bills.
          </p>
          <div className="pt-3 border-t border-midnight-border font-mono text-xs text-status-caution">
            Reserved: {formatRupees(summary.unpaidCommitmentsTotal)}
          </div>
        </Card>

        {/* LEVER 5: Emergency Buffer Cushion (4 cols) */}
        <Card className="lg:col-span-4 p-6 space-y-3">
          <span className="text-xs font-mono uppercase text-paper-secondary font-bold block">
            LEVER 05 // BUFFER RESILIENCE
          </span>
          <h4 className="text-lg font-bold text-paper-primary">Shock Absorption</h4>
          <p className="text-xs text-paper-secondary leading-relaxed">
            Maintains an untouchable ₹1,000 emergency floor to absorb unexpected dental, transit,
            or hardware repairs without pushing your month into debt.
          </p>
          <div className="pt-3 border-t border-midnight-border font-mono text-xs text-mint-highlight">
            Target Cushion: {formatRupees(state.config.emergencyBufferGoal)}
          </div>
        </Card>
      </div>
    </section>
  );
};
