import { describe, expect, test } from 'vitest';
import {
  formatCurrencyDisplay,
  formatMoneyInput,
  parseMoneyInputToNumber,
  sanitizeMoneyInput,
} from './moneyInput';

describe('moneyInput', () => {
  test('formats plain numbers with Colombian thousand separators', () => {
    expect(formatMoneyInput('3200000')).toBe('3.200.000');
  });

  test('parses formatted values to clean numbers', () => {
    expect(parseMoneyInputToNumber('3.200.000')).toBe(3200000);
  });

  test('parses currency-looking values to clean numbers', () => {
    expect(parseMoneyInputToNumber('$ 3.200.000')).toBe(3200000);
  });

  test('returns undefined for empty values', () => {
    expect(parseMoneyInputToNumber('')).toBeUndefined();
  });

  test('ignores non numeric characters', () => {
    expect(parseMoneyInputToNumber('abc123def')).toBe(123);
  });

  test('normalizes leading zeros consistently', () => {
    expect(sanitizeMoneyInput('0001200')).toBe('1200');
    expect(formatMoneyInput('0001200')).toBe('1.200');
  });

  test('formats display currency without decimals', () => {
    expect(formatCurrencyDisplay(3200000)).toBe('$ 3.200.000');
    expect(formatCurrencyDisplay(undefined)).toBe('No informado');
  });
});
