import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Menu,
  X,
} from 'lucide-react';
import Lenis from 'lenis';
import { Hero3DCanvas } from './Hero3DCanvas';
import { ScrollytellingHero } from './ScrollytellingHero';
import { MoneyRealitySection } from './MoneyRealitySection';
import { DecisionSimulatorPreview } from './DecisionSimulatorPreview';
import { FinancialControlSection } from './FinancialControlSection';
import { FinalCTASection } from './FinalCTASection';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const handleScroll = () => {
      setNavScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToExperience = () => {
    const el = document.getElementById('scrollytelling-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-midnight-deep text-paper-primary selection:bg-mint-lime/30 selection:text-mint-highlight">
      {/* 1. TOP NAVIGATION */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          navScrolled
            ? 'bg-midnight-deep/90 backdrop-blur-xl border-b border-midnight-border py-3.5 shadow-panel'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Geometric Symbol */}
          <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none">
            <img
              src="/logo.svg"
              alt="TENFLOW Brand Symbol"
              className="w-8 h-8 rounded-xl group-hover:shadow-mint-glow transition-all"
            />
            <span className="font-display font-black text-xl tracking-wider text-paper-primary">
              TEN<span className="text-mint-lime">FLOW</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-mono font-medium text-paper-secondary">
            <button
              onClick={scrollToExperience}
              className="hover:text-mint-highlight transition-colors"
            >
              The Experience
            </button>
            <a href="#how-it-works" className="hover:text-mint-highlight transition-colors">
              How It Works
            </a>
            <Link to="/simulate" className="hover:text-mint-highlight transition-colors">
              Financial Simulator
            </Link>
          </div>

          {/* Nav Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/dashboard')}
            >
              Open Dashboard
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-paper-secondary hover:text-paper-primary hover:bg-midnight-panel"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-midnight-surface/95 backdrop-blur-xl border-b border-midnight-border px-6 py-4 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToExperience();
              }}
              className="block w-full text-left py-2 text-sm text-paper-secondary hover:text-mint-lime"
            >
              The Experience
            </button>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-paper-secondary hover:text-mint-lime"
            >
              How It Works
            </a>
            <Link
              to="/simulate"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-paper-secondary hover:text-mint-lime"
            >
              Decision Simulator
            </Link>
            <div className="pt-2">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => navigate('/dashboard')}
              >
                Open Dashboard
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 1 — CINEMATIC HERO (INTEGRATED 3D WEBGL COMPOSITION) */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-mint-lime/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-mint-cyan/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: High-Impact Typography & Action Suite (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight-panel border border-mint-lime/30 shadow-panel">
              <span className="w-2 h-2 rounded-full bg-mint-lime animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-mint-highlight uppercase font-bold">
                GEN Z FINTECH SURVIVAL // 2026 EDITION
              </span>
            </div>

            {/* Exact Required Display Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-paper-primary leading-[1.05]">
              ₹10,000. <br />
              30 DAYS. <br />
              <span className="text-mint-gradient">ONE MONTH TO GET IT RIGHT.</span>
            </h1>

            {/* Exact Required Supporting Copy */}
            <p className="max-w-xl text-base sm:text-lg text-paper-secondary leading-relaxed">
              Every coffee, subscription, late-night order, and unexpected bill changes your month.
              See the consequences before you spend.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
              <Button
                size="lg"
                variant="primary"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto text-base font-bold shadow-mint-glow"
              >
                Start my month
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={<Play className="w-4 h-4 text-mint-lime" />}
                onClick={scrollToExperience}
                className="w-full sm:w-auto text-base font-semibold"
              >
                Explore the experience
              </Button>
            </div>

            {/* Three Refined Editorial Metrics */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              <div className="p-3.5 rounded-2xl bg-midnight-panel/80 border border-midnight-border">
                <span className="text-[10px] font-mono text-paper-muted uppercase block">
                  Starting budget
                </span>
                <span className="text-base font-mono font-bold text-mint-highlight">₹10,000</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-panel/80 border border-midnight-border">
                <span className="text-[10px] font-mono text-paper-muted uppercase block">
                  Planning period
                </span>
                <span className="text-base font-mono font-bold text-paper-primary">30 Days</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-midnight-panel/80 border border-midnight-border">
                <span className="text-[10px] font-mono text-paper-muted uppercase block">Mode</span>
                <span className="text-base font-mono font-bold text-mint-cyan">
                  Interactive Simulation
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Real Three.js WebGL 3D Canvas Visual (5 cols) */}
          <div className="lg:col-span-5 h-[420px] sm:h-[500px] lg:h-[580px] w-full relative flex items-center justify-center">
            {/* The real WebGL scene running live */}
            <Hero3DCanvas className="w-full h-full" />

            {/* Floating Glassmorphic Telemetry Tag */}
            <div className="absolute bottom-4 right-4 glass-hud px-4 py-2.5 rounded-2xl pointer-events-none text-left">
              <span className="text-[10px] font-mono text-mint-lime font-bold uppercase block">
                CORE TELEMETRY
              </span>
              <span className="text-xs font-mono font-bold text-paper-primary">
                Safe Glidepath: Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PINNED SCROLLYTELLING EXPERIENCE */}
      <ScrollytellingHero />

      {/* SECTION 3 — THE MONEY REALITY */}
      <MoneyRealitySection />

      {/* SECTION 4 — THE DECISION SIMULATOR (LIVE EMBEDDED PREVIEW) */}
      <DecisionSimulatorPreview />

      {/* SECTION 5 — FINANCIAL CONTROL (ASYMMETRICAL BENTO GRID) */}
      <div id="how-it-works">
        <FinancialControlSection />
      </div>

      {/* SECTION 6 — FINAL CTA */}
      <FinalCTASection />

      {/* FOOTER */}
      <footer className="border-t border-midnight-border py-8 px-4 text-center text-xs text-paper-muted font-mono">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.svg" alt="TENFLOW" className="w-5 h-5" />
          <span className="font-display font-bold text-paper-primary">TENFLOW</span>
        </div>
        <p>Built for Frontend Arena Prompt Run 2026 • “Broke But Functional — Survive the Month”</p>
        <p className="text-[10px] mt-1 text-paper-muted/60">
          Strict TypeScript • Real Three.js WebGL Scrollytelling • Lenis Smooth Scrolling • Zero-Backend Local Persistence
        </p>
      </footer>
    </div>
  );
};
