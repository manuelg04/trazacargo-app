import { describe, expect, test } from 'vitest';
import {
  buildIsoFromDateAndTime,
  formatDateTimeInputDisplay,
  getDateInputValue,
  getTimeInputValue,
} from './dateTimeInput';

describe('dateTimeInput', () => {
  test('combines date and time into an ISO value', () => {
    const isoValue = buildIsoFromDateAndTime('2026-05-24', '08:30');
    const date = new Date(isoValue ?? '');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(24);
    expect(date.getHours()).toBe(8);
    expect(date.getMinutes()).toBe(30);
  });

  test('returns undefined when date or time is incomplete', () => {
    expect(buildIsoFromDateAndTime('', '08:30')).toBeUndefined();
    expect(buildIsoFromDateAndTime('2026-05-24', '')).toBeUndefined();
  });

  test('returns controlled input values from an ISO value', () => {
    const isoValue = buildIsoFromDateAndTime('2026-05-24', '08:30') ?? '';

    expect(getDateInputValue(isoValue)).toBe('2026-05-24');
    expect(getTimeInputValue(isoValue)).toBe('08:30');
  });

  test('formats empty and selected values in Spanish', () => {
    const isoValue = buildIsoFromDateAndTime('2026-05-24', '08:30') ?? '';

    expect(formatDateTimeInputDisplay(undefined)).toBe('Sin fecha seleccionada');
    expect(formatDateTimeInputDisplay(isoValue)).toContain('24 de mayo de 2026');
    expect(formatDateTimeInputDisplay(isoValue)).toContain('8:30');
  });
});
