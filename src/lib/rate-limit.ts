// ============================================================
// Rate Limiting Helper
// ============================================================
// Provides a reusable sliding-window rate limiter backed by
// Upstash Redis. When Redis is unconfigured (local dev / test),
// all requests are allowed through so the app remains fully
// functional without Redis credentials.
//
// Usage:
//   const result = await checkRateLimit(identifier);
//   if (!result.allowed) {
//     return NextResponse.json({ error: 'Too Many Requests' }, {
//       status: 429,
//       headers: { 'Retry-After': String(result.retryAfterSeconds) },
//     });
//   }
// ============================================================

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets. Only set when allowed=false. */
  retryAfterSeconds?: number;
}

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Redis not configured — allow all requests in dev/test
    return null;
  }

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    // 100 requests per 60-second sliding window per unique identifier
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    analytics: false,
    prefix: 'nexus:rl',
  });

  return limiter;
}

/**
 * Checks rate limit for a given identifier (e.g. user ID, org ID, or IP).
 * Returns allowed=true immediately when Redis is not configured.
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const rl = getLimiter();

  // Graceful no-op when Redis is absent
  if (!rl) {
    return { allowed: true, remaining: 100 };
  }

  try {
    const { success, remaining, reset } = await rl.limit(identifier);

    if (!success) {
      const nowMs = Date.now();
      const retryAfterSeconds = Math.ceil((reset - nowMs) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
    }

    return { allowed: true, remaining };
  } catch (err) {
    // Never block a request due to a Redis failure — fail open
    console.error('[RateLimit] Redis error, failing open:', err);
    return { allowed: true, remaining: -1 };
  }
}
