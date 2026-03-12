export function isCancellationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /aborted|cancelled while waiting in queue|cancelled queued task/i.test(message);
}
