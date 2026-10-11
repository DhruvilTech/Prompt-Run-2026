import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { FinanceScene } from './FinanceScene';
import { HeroFallback } from './HeroFallback';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useFinance } from '../../state/FinanceContext';
import { formatRupees } from '../../domain/financeFormatters';

const STAGES = [
  {
    stage: 1,
    tag: 'STAGE 01 // THE LAUNCH',
    title: 'Your Month Starts Here',
    subtitle: 'Day 1 of 30 • Full Tank',
    progressVal: 0.1,
    color: 'mint',
  },
  {
    stage: 2,
    tag: 'STAGE 02 // DAILY FLOW',
    title: 'Small Decisions Add Up',
    subtitle: 'Days 2–10 • Micro-Costs',
    progressVal: 0.38,
    color: 'cyan',
  },
  {
    stage: 3,
    tag: 'STAGE 03 // THE SHOCK',
    title: 'Life Doesn’t Follow the Plan',
    subtitle: 'Day 16 • Unexpected Glitch',
    progressVal: 0.65,
    color: 'risk',
  },
  {
    stage: 4,
    tag: 'STAGE 04 // REGAIN CONTROL',
    title: 'Control the Next Decision',
    subtitle: 'Days 17–30 • Glidepath Resumed',
    progressVal: 0.9,
    color: 'mint',
  },
];

export const ScrollytellingHero: React.FC = () => {
  const navigate = useNavigate();
  const { summary, state } = useFinance();
  const [activeStage, setActiveStage] = useState(1);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // Detect WebGL capability safely
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLAvailable(false);
    } catch {
      setWebGLAvailable(false);
    }

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  const activeStageConfig = STAGES.find((s) => s.stage === activeStage) || STAGES[0]!;
  const scrollProgress = activeStageConfig.progressVal;

  // Exact calculated before and after for Stage 3 (Unexpected ₹1,500 expense)
  const unexpectedExpense = 1500;
  const daysLeft = summary.daysRemaining;
  const beforeAllowance = summary.safeDailyAllowance;
  const afterUncommitted = Math.max(0, summary.uncommittedBalance - unexpectedExpense);
  const afterAllowance = Math.round((afterUncommitted / Math.max(1, daysLeft)) * 100) / 100;

  return (
    <section
      id="scrollytelling-section"
      className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Section Eyebrow & Title */}
      <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
        <Badge variant="mint">THE SIGNATURE SCROLL EXPERIENCE</Badge>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-paper-primary tracking-tight leading-tight">
          The 30-Day Financial Orbit
        </h2>
        <p className="text-sm sm:text-base text-paper-secondary leading-relaxed max-w-xl mx-auto">
          Travel through the month in 4 cinematic stages. Watch the 3D financial core, orbital rings,
          and daily allowance dynamically react to reality.
        </p>

        {/* 4 Interactive Stage Switcher Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {STAGES.map((s) => {
            const isActive = activeStage === s.stage;
            return (
              <button
                key={s.stage}
                onClick={() => setActiveStage(s.stage)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 border ${
                  isActive
                    ? 'bg-mint-lime text-midnight-deep border-mint-lime shadow-mint-glow scale-105'
                    : 'glass-panel text-paper-secondary hover:text-paper-primary hover:border-mint-lime/40'
                }`}
              >
                0{s.stage} {s.title.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Stage Theater */}
      <Card elevated className="p-6 sm:p-10 relative overflow-hidden border-midnight-border shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[460px]">
          {/* Left Column: Rich Glassmorphic HUD Stage Card (6 cols) */}
          <div className="lg:col-span-6 space-y-5 relative z-10 text-left">
            {/* Stage Indicator Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-mint-lime">
                {activeStageConfig.tag}
              </span>
              <span className="text-xs font-mono text-paper-muted">
                {activeStageConfig.subtitle}
              </span>
            </div>

            {/* Stage 1: The Launch */}
            {activeStage === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-paper-primary">
                  {activeStageConfig.title}
                </h3>
                <div className="text-4xl sm:text-5xl font-mono font-black text-mint-highlight">
                  ₹{state.config.startingBudget.toLocaleString('en-IN')}
                </div>
                <p className="text-sm text-paper-secondary leading-relaxed">
                  You start with a clean slate. ₹10,000 cash in hand, 30 days ahead, and a calm
                  financial core. At this moment, your safe daily allowance is ₹333/day.
                </p>
                <div className="p-3.5 rounded-2xl bg-midnight-panel border border-midnight-border flex items-center justify-between text-xs font-mono">
                  <span className="text-paper-muted">Initial Horizon:</span>
                  <span className="text-mint-lime font-bold">30 Days Sustainable</span>
                </div>
              </div>
            )}

            {/* Stage 2: Daily Flow */}
            {activeStage === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-paper-primary">
                  {activeStageConfig.title}
                </h3>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-midnight-panel border border-midnight-border flex justify-between items-center text-xs">
                    <span className="font-medium text-paper-primary">Campus Lunch & Groceries</span>
                    <span className="font-mono font-bold text-paper-primary">-₹250</span>
                  </div>
                  <div className="p-3 rounded-xl bg-midnight-panel border border-midnight-border flex justify-between items-center text-xs">
                    <span className="font-medium text-paper-primary">Feeder Metro Transit Pass</span>
                    <span className="font-mono font-bold text-paper-primary">-₹120</span>
                  </div>
                  <div className="p-3 rounded-xl bg-midnight-panel border border-midnight-border flex justify-between items-center text-xs">
                    <span className="font-medium text-paper-primary">Prepaid 5G Mobile Plan</span>
                    <span className="font-mono font-bold text-status-caution">-₹299</span>
                  </div>
                </div>
                <p className="text-xs text-paper-secondary leading-relaxed">
                  Small daily expenses exert subtle gravitational pull. As cash leaves your pocket, the
                  orbit path registers each transaction particle.
                </p>
              </div>
            )}

            {/* Stage 3: The Financial Shock */}
            {activeStage === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-status-risk" />
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-status-risk">
                    {activeStageConfig.title}
                  </h3>
                </div>
                <div className="p-4 rounded-2xl bg-status-risk/10 border border-status-risk/30 flex justify-between items-center">
                  <span className="text-sm font-semibold text-paper-primary">Emergency Vehicle Repair</span>
                  <span className="font-mono font-black text-xl text-status-risk">-₹1,500</span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-midnight-panel border border-midnight-border text-xs">
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
                  Notice the tension lighting in the 3D scene! The TENFLOW engine instantly
                  redistributes remaining uncommitted cash over the remaining {daysLeft} days to prevent debt.
                </p>
              </div>
            )}

            {/* Stage 4: Regain Control */}
            {activeStage === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-mint-lime" />
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-mint-highlight">
                    {activeStageConfig.title}
                  </h3>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-midnight-panel border border-midnight-border flex justify-between items-center text-xs">
                    <span className="text-paper-secondary">Safe Daily Allowance:</span>
                    <span className="font-mono font-bold text-mint-lime">
                      {formatRupees(summary.safeDailyAllowance)}/day
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-midnight-panel border border-midnight-border flex justify-between items-center text-xs">
                    <span className="text-paper-secondary">Protected Savings Buffer:</span>
                    <span className="font-mono font-bold text-mint-cyan">
                      {formatRupees(summary.savingsAllocationsTotal)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-midnight-panel border border-midnight-border flex justify-between items-center text-xs">
                    <span className="text-paper-secondary">Projected Month-End Finish:</span>
                    <span className="font-mono font-bold text-paper-primary">
                      {formatRupees(summary.projectedMonthEndBalance)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-paper-secondary leading-relaxed">
                  The core stabilizes. By staying under your safe daily allowance, you successfully reach
                  Day 30 without running out of money.
                </p>
              </div>
            )}

            {/* Stage Stepper Navigation Buttons */}
            <div className="pt-4 border-t border-midnight-border flex items-center justify-between gap-3">
              <Button
                size="sm"
                variant="secondary"
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
                onClick={() => setActiveStage((prev) => Math.max(1, prev - 1))}
                disabled={activeStage === 1}
              >
                Previous
              </Button>

              {activeStage < 4 ? (
                <Button
                  size="sm"
                  variant="primary"
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                  onClick={() => setActiveStage((prev) => Math.min(4, prev + 1))}
                >
                  Next Stage (0{activeStage + 1})
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate('/dashboard')}
                >
                  Build My Financial Plan
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: 3D Scene Viewport (6 cols) */}
          <div className="lg:col-span-6 h-[400px] sm:h-[480px] w-full relative flex items-center justify-center rounded-2xl overflow-hidden bg-midnight-deep/60 border border-midnight-border">
            {webGLAvailable && !reducedMotion ? (
              <FinanceScene scrollProgress={scrollProgress} isReducedMotion={reducedMotion} />
            ) : (
              <HeroFallback />
            )}

            {/* Ambient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-deep/80 via-transparent to-midnight-deep/40 pointer-events-none" />

            {/* Stage Tag Overlay */}
            <div className="absolute bottom-4 right-4 glass-hud px-3.5 py-1.5 rounded-xl pointer-events-none text-right">
              <span className="text-[10px] font-mono text-mint-lime font-bold uppercase block">
                3D WebGL Telemetry
              </span>
              <span className="text-[11px] font-mono text-paper-secondary">
                Progress: Math.lerp({scrollProgress.toFixed(2)})
              </span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
