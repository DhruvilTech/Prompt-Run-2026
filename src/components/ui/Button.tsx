import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-lime focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-deep disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-mint-lime to-mint-cyan text-midnight-deep font-semibold hover:shadow-mint-glow hover:brightness-105 border border-mint-highlight/20',
    secondary:
      'bg-midnight-panel text-paper-primary hover:bg-midnight-border border border-midnight-border hover:border-mint-lime/30 shadow-panel',
    danger:
      'bg-status-risk/20 text-status-risk border border-status-risk/40 hover:bg-status-risk/30 hover:border-status-risk focus-visible:ring-status-risk',
    ghost:
      'bg-transparent text-paper-secondary hover:text-paper-primary hover:bg-midnight-panel/50 border border-transparent',
    glow:
      'bg-mint-lime text-midnight-deep font-bold shadow-mint-glow hover:brightness-110',
  }[variant];

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
