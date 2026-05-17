import { describe, expect, test } from 'vitest';
import { formatDueDate } from './formatDueDate';

describe('formatDueDate', () => {
  const now = Date.parse('2026-05-17T12:00:00.000Z');

  test('returns none when there is no due date', () => {
    expect(formatDueDate(undefined, now)).toEqual({
      label: 'Sin fecha límite',
      state: 'none',
    });
  });

  test('marks overdue dates', () => {
    expect(formatDueDate(Date.parse('2026-05-17T11:59:00.000Z'), now).state).toBe('overdue');
  });

  test('marks dates inside the next 48 hours as due soon', () => {
    expect(formatDueDate(Date.parse('2026-05-19T11:00:00.000Z'), now).state).toBe('dueSoon');
  });

  test('marks later valid dates as upcoming', () => {
    expect(formatDueDate(Date.parse('2026-05-20T12:00:00.000Z'), now).state).toBe('upcoming');
  });
});
