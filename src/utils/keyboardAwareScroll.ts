type KeyboardBehavior = 'height' | 'position' | 'padding' | undefined;

export function getKeyboardAvoidingBehavior(platform: string): KeyboardBehavior {
  if (platform === 'ios') return 'padding';
  if (platform === 'android') return 'height';
  return undefined;
}

export function getKeyboardAwareBottomPadding(basePaddingBottom: number, extraBottomRoom = 48) {
  return basePaddingBottom + extraBottomRoom;
}
