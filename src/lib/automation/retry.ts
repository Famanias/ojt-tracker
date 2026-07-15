// ============================================================
// Automation Layer — Retry Utility
// ============================================================

import { automationLogger } from './logger';

export interface RetryOptions {
  /** Maximum number of retries (default: 3) */
  maxRetries: number;
  /** Base delay between retries in ms (default: 1000). Uses exponential backoff. */
  baseDelayMs?: number;
  /** Maximum delay cap in ms (default: 10000) */
  maxDelayMs?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay with jitter.
 */
function getBackoffDelay(attempt: number, baseMs: number, maxMs: number): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseMs;
  return Math.min(exponential + jitter, maxMs);
}

/**
 * Retry an async function with exponential backoff.
 * Returns the result on success, or throws the final error after exhausting retries.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  options?: Partial<RetryOptions>
): Promise<{ result: T; retries: number }> {
  const opts: Required<RetryOptions> = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await fn();
      return { result, retries: attempt };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < opts.maxRetries) {
        const delay = getBackoffDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
        automationLogger.gateway('retry', label, {
          attempt: attempt + 1,
          maxRetries: opts.maxRetries,
          delayMs: Math.round(delay),
          error: lastError.message,
        });
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
