import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Cpu,
  Target,
  Sparkles,
  Settings,
  Plus,
  Menu,
  X,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../../state/FinanceContext';
import { Button } from '../ui/Button';
import { QuickAddModal } from '../finance/QuickAddModal';
import { formatRupees } from '../../domain/financeFormatters';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { to: '/simulate', label: 'Decision Simulator', icon: Cpu, highlight: true },
  { to: '/plan', label: 'Monthly Plan', icon: CalendarDays },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/goals', label: 'Savings Goals', icon: Target },
  { to: '/insights', label: 'Insights & Outlook', icon: Sparkles },
  { to: '/settings', label: 'Settings & Data', icon: Settings },
];

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { summary, state } = useFinance();
  const location = useLocation();

  const isRisk = summary.financialRisk === 'high_risk';
  const isCaution = summary.financialRisk === 'caution';

  return (
    <div className="min-h-screen bg-midnight-deep flex flex-col md:flex-row text-paper-primary">
      {/* Quick Add Modal */}
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-midnight-surface/90 backdrop-blur-md border-b border-midnight-border sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="TENFLOW Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-extrabold text-lg tracking-wider text-paper-primary">
            TEN<span className="text-mint-lime">FLOW</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setQuickAddOpen(true)}
            aria-label="Add transaction"
          >
            Add
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 rounded-xl text-paper-secondary hover:text-paper-primary hover:bg-midnight-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-lime"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-midnight-deep/95 backdrop-blur-xl p-6 flex flex-col justify-between animate-in fade-in">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-midnight-border">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <img src="/logo.svg" alt="TENFLOW" className="w-8 h-8 rounded-lg" />
                <span className="font-display font-extrabold text-lg tracking-wider">
                  TEN<span className="text-mint-lime">FLOW</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-paper-secondary hover:text-paper-primary"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="mt-6 space-y-1.5" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-mint-lime/15 text-mint-highlight border border-mint-lime/30 shadow-sm'
                        : 'text-paper-secondary hover:text-paper-primary hover:bg-midnight-panel'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-mint-lime' : 'text-paper-muted'}`} />
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="ml-auto text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-mint-lime/20 text-mint-lime font-bold">
                        Differentiator
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-midnight-border">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-center block text-paper-muted hover:text-mint-lime"
            >
              ← Return to Cinematic Experience
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-midnight-surface/80 backdrop-blur-xl border-r border-midnight-border p-5 shrink-0 sticky top-0 h-screen z-30"
        aria-label="Sidebar navigation"
      >
        <div>
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 px-2 py-2 mb-6 group focus-visible:outline-none"
          >
            <div className="relative">
              <img
                src="/logo.svg"
                alt="TENFLOW Logo"
                className="w-9 h-9 rounded-xl group-hover:shadow-mint-glow transition-all"
              />
            </div>
            <div>
              <span className="font-display font-black text-xl tracking-wider text-paper-primary block leading-none">
                TEN<span className="text-mint-lime">FLOW</span>
              </span>
              <span className="text-[10px] text-paper-muted font-mono tracking-widest uppercase block mt-1">
                FINANCIAL SURVIVAL
              </span>
            </div>
          </Link>

          {/* Planning Horizon Widget */}
          <div className="mb-6 p-3 rounded-xl bg-midnight-panel/80 border border-midnight-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-paper-muted font-mono">DAY {state.config.currentDay} / 30</span>
              <span
                className={`flex items-center gap-1 font-mono text-[11px] font-semibold ${
                  isRisk
                    ? 'text-status-risk'
                    : isCaution
                    ? 'text-status-caution'
                    : 'text-mint-lime'
                }`}
              >
                {isRisk ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                {summary.financialRisk.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-midnight-deep h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-mint-lime to-mint-cyan h-full rounded-full transition-all duration-500"
                style={{ width: `${(state.config.currentDay / state.config.totalDays) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-paper-muted mt-2">
              <span>Allowance:</span>
              <span className="font-mono text-mint-highlight font-bold">
                {formatRupees(summary.safeDailyAllowance)}/day
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-mint-lime/10 text-mint-highlight border border-mint-lime/30 shadow-sm'
                        : 'text-paper-secondary hover:text-paper-primary hover:bg-midnight-panel/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-mint-lime/20 text-mint-lime font-bold">
                      PRO
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-midnight-border space-y-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setQuickAddOpen(true)}
          >
            Record Cashflow
          </Button>

          <Link
            to="/"
            className="block text-center text-xs text-paper-muted hover:text-mint-highlight transition-colors py-1 font-mono"
          >
            ← 3D Scrollytelling Hero
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-midnight-surface/50 backdrop-blur-md border-b border-midnight-border sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-paper-muted tracking-wider uppercase">
              30-Day Budget Cycle:
            </span>
            <span className="text-xs font-mono font-bold text-mint-highlight bg-midnight-panel px-2.5 py-1 rounded-md border border-midnight-border">
              ₹{state.config.startingBudget.toLocaleString('en-IN')} Initial Target
            </span>
            <span className="text-xs text-paper-muted">
              • {summary.daysRemaining} days remaining
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Health Meter */}
            <div className="flex items-center gap-2 bg-midnight-panel px-3 py-1 rounded-lg border border-midnight-border text-xs">
              <span className="text-paper-muted">Health Score:</span>
              <span className="font-mono font-bold text-mint-lime">
                {summary.financialHealthScore}/100
              </span>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setQuickAddOpen(true)}
            >
              + Quick Add
            </Button>
          </div>
        </header>

        {/* Page View Body */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
