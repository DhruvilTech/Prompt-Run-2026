import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'mint' | 'cyan' | 'caution' | 'risk' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  }[size];

  const variantStyles = {
    mint: 'bg-mint-lime/10 text-mint-lime border border-mint-lime/30',
    cyan: 'bg-mint-cyan/10 text-mint-cyan border border-mint-cyan/30',
    caution: 'bg-status-caution/10 text-status-caution border border-status-caution/30',
    risk: 'bg-status-risk/10 text-status-risk border border-status-risk/30',
    neutral: 'bg-midnight-border text-paper-secondary border border-midnight-border',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider font-mono ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
