export function getDrumIndexFromOffset(offsetY: number, itemHeight: number, valueCount: number) {
  if (valueCount <= 0 || itemHeight <= 0 || !Number.isFinite(offsetY)) {
    return 0;
  }

  const rawIndex = Math.round(offsetY / itemHeight);
  return Math.max(0, Math.min(valueCount - 1, rawIndex));
}

export function getDrumValueFromOffset<T>(values: T[], offsetY: number, itemHeight: number) {
  const index = getDrumIndexFromOffset(offsetY, itemHeight, values.length);
  return values[index];
}
