import React, { useEffect, useState, useRef } from 'react';
import { formatRupees } from '../../domain/financeFormatters';

interface NumberCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  isCurrency?: boolean;
  className?: string;
}

export const NumberCounter: React.FC<NumberCounterProps> = ({
  value,
  duration = 600,
  prefix = '',
  isCurrency = true,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    // If reduced motion is preferred, jump straight to value
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = prevValueRef.current;
    prevValueRef.current = value;
    const diff = value - startValue;

    if (diff === 0) {
      setDisplayValue(value);
      return;
    }

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * eased;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formattedText = isCurrency
    ? formatRupees(displayValue)
    : `${prefix}${Math.round(displayValue)}`;

  return (
    <span
      className={`tabular-nums font-mono tracking-tight ${className}`}
      aria-label={isCurrency ? formatRupees(value) : `${prefix}${value}`}
    >
      {formattedText}
    </span>
  );
};
