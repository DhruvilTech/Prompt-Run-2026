import React from 'react';

export const HeroFallback: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-60"
      aria-hidden="true"
    >
      {/* 2D Geometric Luminous Rings & Orbit Fallback */}
      <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px]">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border border-mint-cyan/30 animate-[spin_40s_linear_infinite]" />
        {/* Mid angled ring */}
        <div className="absolute inset-8 rounded-full border border-mint-lime/40 animate-[spin_25s_linear_infinite_reverse] shadow-mint-glow" />
        {/* Inner ring */}
        <div className="absolute inset-20 rounded-full border border-mint-highlight/20" />
        {/* Core glow */}
        <div className="absolute inset-32 rounded-full bg-gradient-to-tr from-mint-lime/20 via-mint-cyan/15 to-transparent blur-2xl animate-pulse" />
        {/* Central nucleus */}
        <div className="absolute inset-[42%] rounded-2xl bg-midnight-panel border border-mint-lime/60 rotate-45 flex items-center justify-center shadow-panel" />
      </div>
    </div>
  );
};
