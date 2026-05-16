export function getMimeTypeLabel(mimeType?: string) {
  if (!mimeType) {
    return undefined;
  }

  if (mimeType === 'application/pdf') {
    return 'PDF';
  }

  if (mimeType.startsWith('image/')) {
    return 'Imagen';
  }

  if (mimeType.includes('word')) {
    return 'Word';
  }

  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'Excel';
  }

  return mimeType;
}
