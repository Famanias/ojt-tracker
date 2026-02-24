import { createBrowserClient } from '@supabase/ssr';

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try { new URL(url); return true; } catch { return false; }
}

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = isValidUrl(rawUrl) ? rawUrl! : 'https://placeholder.supabase.co';
  const key = rawKey && rawKey.length > 20 ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';
  return createBrowserClient(url, key);
}
