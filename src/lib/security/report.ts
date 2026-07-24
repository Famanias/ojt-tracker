/**
 * Telemetry formatter for CSP violation reports.
 * Supports legacy application/csp-report format and modern Report-To payload structure.
 */

export interface CspViolationReport {
  blockedUri: string;
  violatedDirective: string;
  effectiveDirective?: string;
  originalPolicy?: string;
  documentUri?: string;
  referrer?: string;
  statusCode?: number;
  userAgent?: string;
  timestamp: string;
  rawReportType: 'legacy-csp-report' | 'reporting-api' | 'unknown';
}

export function parseCspReportPayload(
  payload: unknown,
  userAgent?: string
): CspViolationReport {
  const timestamp = new Date().toISOString();

  if (typeof payload !== 'object' || payload === null) {
    return {
      blockedUri: 'unknown',
      violatedDirective: 'unknown',
      userAgent,
      timestamp,
      rawReportType: 'unknown',
    };
  }

  const obj = payload as Record<string, unknown>;

  // Legacy CSP Report format: { "csp-report": { "blocked-uri": "...", ... } }
  if ('csp-report' in obj && typeof obj['csp-report'] === 'object' && obj['csp-report'] !== null) {
    const legacy = obj['csp-report'] as Record<string, unknown>;
    return {
      blockedUri: String(legacy['blocked-uri'] || legacy['blockedURI'] || 'unknown'),
      violatedDirective: String(legacy['violated-directive'] || legacy['violatedDirective'] || 'unknown'),
      effectiveDirective: legacy['effective-directive'] ? String(legacy['effective-directive']) : undefined,
      originalPolicy: legacy['original-policy'] ? String(legacy['original-policy']) : undefined,
      documentUri: legacy['document-uri'] ? String(legacy['document-uri']) : undefined,
      referrer: legacy['referrer'] ? String(legacy['referrer']) : undefined,
      statusCode: typeof legacy['status-code'] === 'number' ? legacy['status-code'] : undefined,
      userAgent,
      timestamp,
      rawReportType: 'legacy-csp-report',
    };
  }

  // Modern Reporting API format: Array of reports [ { type: "csp-violation", body: { ... } } ]
  const item = Array.isArray(payload) ? payload[0] : obj;
  if (typeof item === 'object' && item !== null) {
    const body = (typeof item.body === 'object' && item.body !== null) ? item.body as Record<string, unknown> : item;
    return {
      blockedUri: String(body.blockedURL || body.blockedUri || body['blocked-uri'] || 'unknown'),
      violatedDirective: String(body.violatedDirective || body['violated-directive'] || 'unknown'),
      effectiveDirective: body.effectiveDirective ? String(body.effectiveDirective) : undefined,
      originalPolicy: body.originalPolicy ? String(body.originalPolicy) : undefined,
      documentUri: String(body.documentURL || body.documentUri || item.url || 'unknown'),
      referrer: body.referrer ? String(body.referrer) : undefined,
      statusCode: typeof body.statusCode === 'number' ? body.statusCode : undefined,
      userAgent,
      timestamp,
      rawReportType: 'reporting-api',
    };
  }

  return {
    blockedUri: 'unknown',
    violatedDirective: 'unknown',
    userAgent,
    timestamp,
    rawReportType: 'unknown',
  };
}
