import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-paper-secondary"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`w-full bg-midnight-panel/90 border ${
          error ? 'border-status-risk' : 'border-midnight-border'
        } rounded-xl px-3.5 py-2.5 text-sm text-paper-primary focus:outline-none focus:ring-2 focus:ring-mint-lime/80 focus:border-mint-lime/50 transition-all ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-midnight-surface text-paper-primary">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-status-risk font-medium mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-paper-muted mt-1">{helperText}</p>
      )}
    </div>
  );
};
