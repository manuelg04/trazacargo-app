import { describe, expect, test } from 'vitest';
import { getDrumIndexFromOffset, getDrumValueFromOffset } from './drumPicker';

describe('drumPicker', () => {
  test('selects the closest item from a scroll offset', () => {
    expect(getDrumIndexFromOffset(0, 32, 12)).toBe(0);
    expect(getDrumIndexFromOffset(47, 32, 12)).toBe(1);
    expect(getDrumIndexFromOffset(49, 32, 12)).toBe(2);
  });

  test('keeps scroll selection inside the available values', () => {
    expect(getDrumIndexFromOffset(-30, 32, 12)).toBe(0);
    expect(getDrumIndexFromOffset(800, 32, 12)).toBe(11);
  });

  test('returns the selected value from the available options', () => {
    expect(getDrumValueFromOffset([0, 15, 30, 45], 67, 32)).toBe(30);
    expect(getDrumValueFromOffset([1, 2, 3], 600, 32)).toBe(3);
  });
});
