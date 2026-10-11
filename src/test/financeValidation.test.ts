import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateAmount,
  validateDayIndex,
  validateAppStateSchema,
  VALID_CATEGORIES,
} from '../domain/financeValidation';

describe('TENFLOW Finance Validation & Sanitization', () => {
  describe('sanitizeString', () => {
    it('strips malicious HTML script and iframe tags', () => {
      const malicious = '<script>alert("hack")</script>Coffee & Bagel<iframe src="evil.com"></iframe>';
      expect(sanitizeString(malicious)).toBe('Coffee & Bagel');
    });

    it('filters non-printable control characters', () => {
      const input = 'Swiggy\x00\x08Order';
      expect(sanitizeString(input)).toBe('SwiggyOrder');
    });

    it('enforces maxLength truncation', () => {
      const longText = 'A'.repeat(200);
      expect(sanitizeString(longText, 50).length).toBe(50);
    });

    it('handles non-string inputs gracefully', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(12345)).toBe('');
    });
  });

  describe('validateAmount', () => {
    it('accepts valid positive numbers and rounds to 2 decimals', () => {
      const result = validateAmount(150.456);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(150.46);
    });

    it('parses valid numeric string inputs', () => {
      const result = validateAmount('2499.50');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(2499.5);
    });

    it('rejects negative amounts below minimum', () => {
      const result = validateAmount(-100, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects NaN and non-finite values', () => {
      expect(validateAmount('abc').isValid).toBe(false);
      expect(validateAmount(NaN).isValid).toBe(false);
      expect(validateAmount(Infinity).isValid).toBe(false);
    });

    it('enforces maximum amount ceiling', () => {
      const result = validateAmount(20000000, 0, 10000000);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateDayIndex', () => {
    it('clamps values within 1 and total challenge days', () => {
      expect(validateDayIndex(0, 30)).toBe(1);
      expect(validateDayIndex(15, 30)).toBe(15);
      expect(validateDayIndex(45, 30)).toBe(30);
    });

    it('falls back to 1 for invalid non-numeric inputs', () => {
      expect(validateDayIndex('invalid', 30)).toBe(1);
      expect(validateDayIndex(NaN, 30)).toBe(1);
    });
  });

  describe('validateAppStateSchema', () => {
    it('recovers cleanly from valid serialized payload', () => {
      const payload = {
        config: {
          startingBudget: 10000,
          totalDays: 30,
          currentDay: 5,
          startDate: '2026-10-01',
          emergencyBufferGoal: 1000,
        },
        transactions: [
          {
            id: 't-1',
            type: 'expense',
            amount: 250,
            category: 'Food & Dining',
            description: 'Lunch',
            date: '2026-10-02',
            dayIndex: 2,
          },
        ],
        commitments: [],
        goals: [],
      };

      const result = validateAppStateSchema(payload);
      expect(result.isValid).toBe(true);
      expect(result.parsed!.config.startingBudget).toBe(10000);
      expect(result.parsed!.transactions.length).toBe(1);
    });

    it('rejects corrupt non-object payloads', () => {
      expect(validateAppStateSchema(null).isValid).toBe(false);
      expect(validateAppStateSchema('string').isValid).toBe(false);
      expect(validateAppStateSchema(42).isValid).toBe(false);
    });

    it('sanitizes categories against VALID_CATEGORIES whitelist', () => {
      const payload = {
        config: { startingBudget: 10000, totalDays: 30, currentDay: 1, startDate: '2026-10-01' },
        transactions: [
          {
            id: 't-bad',
            type: 'expense',
            amount: 50,
            category: 'HackingAttackCategory',
            description: 'Test',
            dayIndex: 1,
          },
        ],
      };

      const result = validateAppStateSchema(payload);
      expect(result.isValid).toBe(true);
      expect(result.parsed!.transactions[0]!.category).toBe('Other');
      expect(VALID_CATEGORIES).toContain('Other');
    });
  });
});
