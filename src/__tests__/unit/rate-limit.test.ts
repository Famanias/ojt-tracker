import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Rate Limiter Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('allows all requests when Redis is unconfigured (development/test fallback)', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const res = await checkRateLimit('user-123');
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(100);
  });

  it('handles limit check gracefully without throwing when Redis credentials are omitted', async () => {
    const res1 = await checkRateLimit('test-id-1');
    const res2 = await checkRateLimit('test-id-2');

    expect(res1.allowed).toBe(true);
    expect(res2.allowed).toBe(true);
  });
});
