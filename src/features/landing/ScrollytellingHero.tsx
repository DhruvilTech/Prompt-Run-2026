import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mouse,
  Compass,
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
  const [scrubberDay, setScrubberDay] = useState(1);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Stage card references for intersection observer
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

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

  // Natural Scroll-Driven Stage Detection
  useEffect(() => {
    const stageRefs = [
      { stage: 1, ref: stage1Ref },
      { stage: 2, ref: stage2Ref },
      { stage: 3, ref: stage3Ref },
      { stage: 4, ref: stage4Ref },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matched = stageRefs.find((s) => s.ref.current === entry.target);
            if (matched) {
              setActiveStage(matched.stage);
              // Map stage to day index for scrubber
              const dayMapping = [1, 7, 16, 26];
              setScrubberDay(dayMapping[matched.stage - 1] ?? 1);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-30% 0px -30% 0px',
        threshold: 0.2,
      }
    );

    stageRefs.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const activeStageConfig = STAGES.find((s) => s.stage === activeStage) || STAGES[0]!;
  
  // Calculate continuous scroll progress (either from scrubber or active stage)
  const scrollProgress = ((scrubberDay - 1) / 29) * 0.8 + 0.1;

  // Exact calculated before and after for Stage 3
  const unexpectedExpense = 1500;
  const daysLeft = summary.daysRemaining;
  const beforeAllowance = summary.safeDailyAllowance;
  const afterUncommitted = Math.max(0, summary.uncommittedBalance - unexpectedExpense);
  const afterAllowance = Math.round((afterUncommitted / Math.max(1, daysLeft)) * 100) / 100;

  const handleScrubberChange = (newDay: number) => {
    setScrubberDay(newDay);
    if (newDay <= 5) setActiveStage(1);
    else if (newDay <= 14) setActiveStage(2);
    else if (newDay <= 22) setActiveStage(3);
    else setActiveStage(4);
  };

  return (
    <section
      id="scrollytelling-section"
      className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-10 space-y-3">
        <Badge variant="mint">3D SCROLL-DRIVEN FINANCIAL TELEMETRY</Badge>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-paper-primary tracking-tight leading-tight">
          The 30-Day Financial Orbit
        </h2>
        <p className="text-sm sm:text-base text-paper-secondary leading-relaxed max-w-xl mx-auto">
          Scroll down naturally to travel through your month. Watch the 3D Rupee Coin, orbital telemetry,
          and daily allowance dynamically react to financial reality.
        </p>

        {/* Scroll Indicator Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight-panel border border-midnight-border text-xs font-mono text-paper-secondary pt-2">
          <Mouse className="w-3.5 h-3.5 text-mint-lime animate-bounce" />
          <span>Scroll to advance stages</span>
          <span className="text-paper-muted">•</span>
          <span className="text-mint-lime font-bold">Stage 0{activeStage} of 04</span>
        </div>
      </div>

      {/* 2-Column Pinned Scrollytelling Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Column: Natural Vertical Scroll Story Stack (6 cols) */}
        <div className="lg:col-span-6 space-y-16 py-4">
          {/* STAGE 1 CARD */}
          <div
            ref={stage1Ref}
            className={`transition-all duration-300 p-6 sm:p-8 rounded-3xl border ${
              activeStage === 1
                ? 'bg-midnight-panel border-mint-lime/50 shadow-mint-glow/20 scale-[1.01]'
                : 'glass-panel border-midnight-border/60 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-mint-lime">
                STAGE 01 // THE LAUNCH
              </span>
              <span className="text-xs font-mono text-paper-muted">Day 1 of 30 • Full Tank</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-display text-paper-primary mb-2">
              Your Month Starts Here
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-black text-mint-highlight my-3">
              ₹{state.config.startingBudget.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-paper-secondary leading-relaxed mb-4">
              You start with a clean slate. ₹10,000 cash in hand, 30 days ahead, and a calm
              financial core. At this moment, your safe daily allowance is ₹333/day.
            </p>
            <div className="p-3.5 rounded-2xl bg-midnight-deep border border-midnight-border flex items-center justify-between text-xs font-mono">
              <span className="text-paper-muted">Initial Horizon:</span>
              <span className="text-mint-lime font-bold">30 Days Sustainable</span>
            </div>
          </div>

          {/* STAGE 2 CARD */}
          <div
            ref={stage2Ref}
            className={`transition-all duration-300 p-6 sm:p-8 rounded-3xl border ${
              activeStage === 2
                ? 'bg-midnight-panel border-mint-cyan/50 shadow-cyan-glow/20 scale-[1.01]'
                : 'glass-panel border-midnight-border/60 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-mint-cyan">
                STAGE 02 // DAILY FLOW
              </span>
              <span className="text-xs font-mono text-paper-muted">Days 2–10 • Micro-Costs</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-display text-paper-primary mb-2">
              Small Decisions Add Up
            </h3>
            <div className="space-y-2.5 my-3">
              <div className="p-3 rounded-xl bg-midnight-deep border border-midnight-border flex justify-between items-center text-xs">
                <span className="font-medium text-paper-primary">Campus Lunch & Groceries</span>
                <span className="font-mono font-bold text-paper-primary">-₹250</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-deep border border-midnight-border flex justify-between items-center text-xs">
                <span className="font-medium text-paper-primary">Feeder Metro Transit Pass</span>
                <span className="font-mono font-bold text-paper-primary">-₹120</span>
              </div>
              <div className="p-3 rounded-xl bg-midnight-deep border border-midnight-border flex justify-between items-center text-xs">
                <span className="font-medium text-paper-primary">Prepaid 5G Mobile Plan</span>
                <span className="font-mono font-bold text-status-caution">-₹299</span>
              </div>
            </div>
            <p className="text-xs text-paper-secondary leading-relaxed">
              Small daily expenses exert subtle gravitational pull. As cash leaves your pocket, the
              orbital telemetry registers each transaction particle.
            </p>
          </div>

          {/* STAGE 3 CARD */}
          <div
            ref={stage3Ref}
            className={`transition-all duration-300 p-6 sm:p-8 rounded-3xl border ${
              activeStage === 3
                ? 'bg-midnight-panel border-status-risk/50 shadow-risk-glow scale-[1.01]'
                : 'glass-panel border-midnight-border/60 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-status-risk">
                STAGE 03 // THE SHOCK
              </span>
              <span className="text-xs font-mono text-paper-muted">Day 16 • Unexpected Glitch</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-status-risk" />
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-status-risk">
                Life Doesn’t Follow the Plan
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-status-risk/10 border border-status-risk/30 flex justify-between items-center my-3">
              <span className="text-sm font-semibold text-paper-primary">Emergency Vehicle Repair</span>
              <span className="font-mono font-black text-xl text-status-risk">-₹1,500</span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-midnight-deep border border-midnight-border text-xs mb-3">
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

          {/* STAGE 4 CARD */}
          <div
            ref={stage4Ref}
            className={`transition-all duration-300 p-6 sm:p-8 rounded-3xl border ${
              activeStage === 4
                ? 'bg-midnight-panel border-mint-lime/50 shadow-mint-glow/20 scale-[1.01]'
                : 'glass-panel border-midnight-border/60 opacity-60 hover:opacity-90'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-mint-lime">
                STAGE 04 // REGAIN CONTROL
              </span>
              <span className="text-xs font-mono text-paper-muted">Days 17–30 • Glidepath Resumed</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-mint-lime" />
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-paper-primary">
                Control the Next Decision
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-mint-lime/10 border border-mint-lime/30 flex justify-between items-center my-3">
              <span className="text-sm font-semibold text-paper-primary">Safe Finish Line</span>
              <span className="font-mono font-black text-xl text-mint-lime">Survive Month End</span>
            </div>
            <p className="text-sm text-paper-secondary leading-relaxed mb-5">
              By adhering to your newly calibrated daily allowance of ₹{afterAllowance}/day, you reach Day 30
              with money in pocket, zero high-interest debt, and zero regrets.
            </p>
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
            >
              Open Live Command Center
            </Button>
          </div>
        </div>

        {/* Right Column: Sticky 3D WebGL Coin Viewport & Interactive Timeline Scrubber (6 cols) */}
        <div className="lg:col-span-6 lg:sticky lg:top-28">
          <Card
            elevated
            className="p-5 sm:p-6 relative overflow-hidden border-midnight-border shadow-2xl bg-midnight-surface/90 backdrop-blur-xl"
          >
            {/* Scrubber & Telemetry Topbar */}
            <div className="flex items-center justify-between pb-4 border-b border-midnight-border text-xs font-mono">
              <span className="flex items-center gap-2 font-bold text-mint-lime">
                <Compass className="w-4 h-4" />
                3D COIN TELEMETRY
              </span>
              <span className="text-paper-muted">
                Day {scrubberDay} of 30 • {activeStageConfig.tag.split('//')[1]}
              </span>
            </div>

            {/* Live 3D Canvas */}
            <div className="h-[360px] sm:h-[420px] w-full relative flex items-center justify-center my-2">
              {webGLAvailable ? (
                <FinanceScene
                  scrollProgress={scrollProgress}
                  isReducedMotion={reducedMotion}
                />
              ) : (
                <HeroFallback />
              )}

              {/* Floating Real-Time Telemetry HUD Badge */}
              <div className="absolute bottom-3 right-3 glass-hud px-3.5 py-2 rounded-xl pointer-events-none text-left">
                <span className="text-[10px] font-mono text-mint-lime font-bold uppercase block">
                  ORBITAL POSITION
                </span>
                <span className="text-xs font-mono font-bold text-paper-primary">
                  {scrollProgress < 0.25
                    ? 'State: Nominal'
                    : scrollProgress < 0.5
                    ? 'State: Flow Active'
                    : scrollProgress < 0.75
                    ? 'State: Hazard Shock'
                    : 'State: Stabilized'}
                </span>
              </div>
            </div>

            {/* Interactive Timeline Scrubber (Innovation: Drag or Click any Day 1 to 30) */}
            <div className="pt-4 border-t border-midnight-border space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-paper-muted flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-mint-cyan" />
                  Interactive Day Scrubber:
                </span>
                <span className="text-mint-highlight font-bold">
                  Day {scrubberDay}
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={30}
                value={scrubberDay}
                onChange={(e) => handleScrubberChange(parseInt(e.target.value, 10))}
                className="w-full accent-mint-lime h-2 bg-midnight-deep rounded-lg cursor-pointer"
                aria-label="30-day timeline interactive scrubber"
              />

              <div className="flex justify-between text-[10px] font-mono text-paper-muted">
                <span className={scrubberDay <= 5 ? 'text-mint-lime font-bold' : ''}>Day 1 (Start)</span>
                <span className={scrubberDay > 5 && scrubberDay <= 14 ? 'text-mint-cyan font-bold' : ''}>Day 10</span>
                <span className={scrubberDay > 14 && scrubberDay <= 22 ? 'text-status-risk font-bold' : ''}>Day 16 (Shock)</span>
                <span className={scrubberDay > 22 ? 'text-mint-lime font-bold' : ''}>Day 30 (Survive)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
