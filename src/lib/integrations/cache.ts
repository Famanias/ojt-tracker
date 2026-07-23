// ============================================================
// Integration Resolution In-Memory Cache (60s TTL)
// ============================================================

export interface ResolvedIntegration {
  enabled: boolean;
  webhookUrl: string | null;
  config: Record<string, unknown>;
}

export interface ResolvedOrgIntegrations {
  organizationId: string;
  integrations: Record<string, ResolvedIntegration>;
}

interface CacheEntry {
  data: ResolvedOrgIntegrations;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const cache = new Map<string, CacheEntry>();

/**
 * Gets cached resolved integrations for an organization.
 */
export function getCachedOrgIntegrations(organizationId: string): ResolvedOrgIntegrations | null {
  const entry = cache.get(organizationId);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(organizationId);
    return null;
  }

  return entry.data;
}

/**
 * Sets cached resolved integrations for an organization.
 */
export function setCachedOrgIntegrations(organizationId: string, data: ResolvedOrgIntegrations): void {
  cache.set(organizationId, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Invalidates the cached integrations for an organization (e.g. after settings update).
 */
export function invalidateOrgIntegrationsCache(organizationId: string): void {
  cache.delete(organizationId);
}
