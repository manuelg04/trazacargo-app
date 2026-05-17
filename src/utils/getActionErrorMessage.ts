export function getActionErrorMessage(error: unknown, fallback = 'No se pudo completar la acción.') {
  const message = error instanceof Error ? error.message : '';
  const convexMatch = message.match(/Uncaught ConvexError: ([^\n]+)/) ?? message.match(/ConvexError: ([^\n]+)/);

  if (convexMatch?.[1]) {
    return convexMatch[1].trim();
  }

  return message || fallback;
}
