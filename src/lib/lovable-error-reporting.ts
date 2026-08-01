export function reportLovableError(error: unknown, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.warn('Lovable error report', error, context);
  }
}
