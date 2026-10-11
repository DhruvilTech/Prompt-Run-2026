import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center overflow-hidden">
      {/* Restrained glowing background orbital ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[450px] h-[450px] sm:w-[600px] sm:h-[600px] rounded-full border border-mint-lime/20 shadow-mint-glow/30 animate-[spin_60s_linear_infinite]" />
        <div className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full border border-mint-cyan/15 animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute w-[200px] h-[200px] bg-mint-lime/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-panel border border-mint-lime/30 text-mint-lime text-xs font-mono font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          READY FOR DAY 01
        </div>

        <h2 className="text-4xl sm:text-6xl font-black font-display text-paper-primary tracking-tight leading-[1.08]">
          Make it to day 30. <br />
          <span className="text-mint-gradient">On your terms.</span>
        </h2>

        <p className="text-sm sm:text-base text-paper-secondary leading-relaxed">
          Start with ₹10,000. Test your decisions. Take control of the month ahead.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={() => navigate('/dashboard')}
            className="text-base font-bold shadow-mint-glow w-full sm:w-auto"
          >
            Build my plan
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/simulate')}
            className="text-base font-semibold w-full sm:w-auto"
          >
            Open Decision Simulator
          </Button>
        </div>
      </div>
    </section>
  );
};
