import { describe, expect, test } from 'vitest';
import { getKeyboardAvoidingBehavior, getKeyboardAwareBottomPadding } from './keyboardAwareScroll';

describe('keyboardAwareScroll', () => {
  test('uses platform behavior that keeps scroll content reachable', () => {
    expect(getKeyboardAvoidingBehavior('ios')).toBe('padding');
    expect(getKeyboardAvoidingBehavior('android')).toBe('height');
    expect(getKeyboardAvoidingBehavior('web')).toBe(undefined);
  });

  test('adds extra bottom room for controls above the keyboard', () => {
    expect(getKeyboardAwareBottomPadding(24, 48)).toBe(72);
    expect(getKeyboardAwareBottomPadding(32)).toBe(80);
  });
});
