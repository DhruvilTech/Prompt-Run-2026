import { describe, it, expect } from 'vitest';
import {
  formatRupees,
  formatRupeesDelta,
  formatPercent,
  formatDateLabel,
} from '../domain/financeFormatters';

describe('TENFLOW Finance Formatters', () => {
  describe('formatRupees', () => {
    it('formats standard positive integer amounts in INR currency style', () => {
      const result = formatRupees(10000);
      expect(result).toMatch(/₹\s?10,000/);
    });

    it('formats amounts with decimals when flag is true', () => {
      const result = formatRupees(404.76, true);
      expect(result).toMatch(/₹\s?404\.76/);
    });

    it('formats negative amounts with leading minus sign', () => {
      const result = formatRupees(-1500);
      expect(result).toContain('-');
      expect(result).toContain('1,500');
    });

    it('handles zero safely', () => {
      const result = formatRupees(0);
      expect(result).toMatch(/₹\s?0/);
    });

    it('safely handles NaN and non-finite inputs by returning ₹0', () => {
      expect(formatRupees(NaN)).toBe('₹0');
      expect(formatRupees(Infinity)).toBe('₹0');
      expect(formatRupees(-Infinity)).toBe('₹0');
    });
  });

  describe('formatRupeesDelta', () => {
    it('prepends positive sign to positive cashflow deltas', () => {
      const result = formatRupeesDelta(2000);
      expect(result).toMatch(/^\+₹\s?2,000/);
    });

    it('prepends negative sign to negative cashflow deltas', () => {
      const result = formatRupeesDelta(-500);
      expect(result).toMatch(/^-₹\s?500/);
    });

    it('returns ₹0 for zero delta without signs', () => {
      expect(formatRupeesDelta(0)).toBe('₹0');
    });

    it('handles NaN and non-finite numbers safely', () => {
      expect(formatRupeesDelta(NaN)).toBe('₹0');
      expect(formatRupeesDelta(Infinity)).toBe('₹0');
    });
  });

  describe('formatPercent', () => {
    it('formats integer percentages', () => {
      expect(formatPercent(75)).toBe('75%');
    });

    it('formats fractional percentages with custom decimals', () => {
      expect(formatPercent(88.64, 1)).toBe('88.6%');
    });

    it('safely falls back to 0% on invalid values', () => {
      expect(formatPercent(NaN)).toBe('0%');
      expect(formatPercent(Infinity)).toBe('0%');
    });
  });

  describe('formatDateLabel', () => {
    it('formats 30-day budget challenge day indices', () => {
      expect(formatDateLabel(1)).toBe('Day 1 of 30');
      expect(formatDateLabel(15)).toBe('Day 15 of 30');
      expect(formatDateLabel(30)).toBe('Day 30 of 30');
    });
  });
});
