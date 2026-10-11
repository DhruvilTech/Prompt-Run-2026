import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefix,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-paper-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-mint-lime/80 focus-within:ring-offset-1 focus-within:ring-offset-midnight-deep transition-all">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-paper-muted font-mono font-bold text-sm">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full bg-midnight-panel/90 border ${
            error ? 'border-status-risk' : 'border-midnight-border'
          } rounded-xl px-3.5 py-2.5 text-sm text-paper-primary placeholder-paper-muted focus:outline-none focus:border-mint-lime/50 disabled:opacity-50 disabled:cursor-not-allowed ${
            prefix ? 'pl-8' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-status-risk flex items-center gap-1 mt-1 font-medium">
          <span aria-hidden="true">⚠️</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-paper-muted mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
