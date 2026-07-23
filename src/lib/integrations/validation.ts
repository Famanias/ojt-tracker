// ============================================================
// Integration Validation & Masking Utilities
// ============================================================

export type IntegrationProvider = 'slack' | 'discord' | 'teams' | 'webhook';

const SLACK_WEBHOOK_REGEX = /^https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9_\-\/]+$/;
const DISCORD_WEBHOOK_REGEX = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_\-]+$/;
const GENERIC_WEBHOOK_REGEX = /^https?:\/\/.+/;

/**
 * Validates whether a given URL is valid for the specified provider.
 */
export function validateWebhookUrl(provider: IntegrationProvider, url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { isValid: false, error: 'Webhook URL cannot be empty.' };
  }

  const trimmed = url.trim();

  switch (provider) {
    case 'slack':
      if (!SLACK_WEBHOOK_REGEX.test(trimmed)) {
        return {
          isValid: false,
          error: 'Invalid Slack Incoming Webhook URL. Format should be: https://hooks.slack.com/services/T.../B.../...',
        };
      }
      break;

    case 'discord':
      if (!DISCORD_WEBHOOK_REGEX.test(trimmed)) {
        return {
          isValid: false,
          error: 'Invalid Discord Webhook URL. Format should be: https://discord.com/api/webhooks/ID/TOKEN',
        };
      }
      break;

    case 'teams':
    case 'webhook':
      if (!GENERIC_WEBHOOK_REGEX.test(trimmed)) {
        return { isValid: false, error: 'Invalid URL. Must start with http:// or https://' };
      }
      break;
  }

  return { isValid: true };
}

/**
 * Masks sensitive webhook URLs before returning them to the UI client.
 * Example: https://hooks.slack.com/services/T00/B00/XXXXXX -> https://hooks.slack.com/services/T00/B00/•••XXXX
 */
export function maskWebhookUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.length <= 15) return '••••••••••••';

  try {
    const parsed = new URL(trimmed);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      const lastPart = pathParts[pathParts.length - 1];
      const maskedLast = '••••' + lastPart.slice(-4);
      pathParts[pathParts.length - 1] = maskedLast;
      return `${parsed.protocol}//${parsed.host}/${pathParts.join('/')}`;
    }
  } catch {
    // Ignore URL parse error
  }

  return trimmed.slice(0, 12) + '••••••••' + trimmed.slice(-4);
}
