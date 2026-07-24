/**
 * Single Source of Truth for allowed external origins in Content-Security-Policy.
 * 
 * ARCHITECTURAL INVARIANT: Developers MUST NOT hardcode or append domains directly inside
 * middleware or page layouts. Add new third-party services to this registry.
 */

export interface ProfileOrigins {
  scriptSrc: string[];
  styleSrc: string[];
  connectSrc: string[];
  frameSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
}

export type SecurityProfile = 'development' | 'production' | 'test';

const SHARED_ORIGINS = {
  turnstile: 'https://challenges.cloudflare.com',
  supabaseWs: 'wss://*.supabase.co',
  supabaseHttps: 'https://*.supabase.co',
  vercelVitals: 'https://vitals.vercel-insights.com',
  vercelAnalytics: 'https://*.vercel-analytics.com',
};

export const CSP_ORIGINS: Record<SecurityProfile, ProfileOrigins> = {
  development: {
    scriptSrc: [
      SHARED_ORIGINS.turnstile,
      SHARED_ORIGINS.vercelAnalytics,
    ],
    styleSrc: [],
    connectSrc: [
      SHARED_ORIGINS.supabaseHttps,
      SHARED_ORIGINS.supabaseWs,
      SHARED_ORIGINS.turnstile,
      SHARED_ORIGINS.vercelVitals,
      SHARED_ORIGINS.vercelAnalytics,
      'http://localhost:*',
      'ws://localhost:*',
      'http://127.0.0.1:*',
      'ws://127.0.0.1:*',
    ],
    frameSrc: [
      SHARED_ORIGINS.turnstile,
    ],
    imgSrc: [
      SHARED_ORIGINS.supabaseHttps,
    ],
    fontSrc: [],
  },

  production: {
    scriptSrc: [
      SHARED_ORIGINS.turnstile,
      SHARED_ORIGINS.vercelAnalytics,
    ],
    styleSrc: [],
    connectSrc: [
      SHARED_ORIGINS.supabaseHttps,
      SHARED_ORIGINS.supabaseWs,
      SHARED_ORIGINS.turnstile,
      SHARED_ORIGINS.vercelVitals,
      SHARED_ORIGINS.vercelAnalytics,
    ],
    frameSrc: [
      SHARED_ORIGINS.turnstile,
    ],
    imgSrc: [
      SHARED_ORIGINS.supabaseHttps,
    ],
    fontSrc: [],
  },

  test: {
    scriptSrc: [],
    styleSrc: [],
    connectSrc: ['http://localhost:*'],
    frameSrc: [],
    imgSrc: [],
    fontSrc: [],
  },
};
