// ============================================================
// Automation Layer — Configuration
// ============================================================

import type { AutomationGatewayConfig } from '../automation/types';

/**
 * Reads automation configuration from environment variables.
 * Falls back to sensible defaults for optional values.
 */
export function getAutomationConfig(): AutomationGatewayConfig {
  return {
    n8nUrl: process.env.N8N_URL ?? '',
    n8nApiKey: process.env.N8N_API_KEY ?? '',
    enabled: process.env.AUTOMATION_ENABLED === 'true',
    timeoutMs: parseInt(process.env.AUTOMATION_TIMEOUT ?? '10000', 10),
    maxRetries: parseInt(process.env.AUTOMATION_RETRIES ?? '3', 10),
    logLevel: (process.env.AUTOMATION_LOG_LEVEL as 'full' | 'minimal' | 'errors-only') ?? 'errors-only',
  };
}

/**
 * Validates that the automation config has the minimum required values.
 */
export function isAutomationConfigured(config: AutomationGatewayConfig): boolean {
  return config.enabled && !!config.n8nUrl && !!config.n8nApiKey;
}
