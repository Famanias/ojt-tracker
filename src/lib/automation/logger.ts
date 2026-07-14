// ============================================================
// Automation Layer — Structured Logger
// ============================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function formatLogEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [Automation:${entry.module}]`;
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `${prefix} ${entry.level.toUpperCase()}: ${entry.message}${dataStr}`;
}

function createLogEntry(
  level: LogLevel,
  module: string,
  message: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    level,
    module,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Structured automation logger.
 * All automation-related logging flows through this module for consistent output.
 */
export const automationLogger = {
  debug(module: string, message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry('debug', module, message, data);
    console.debug(formatLogEntry(entry));
  },

  info(module: string, message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry('info', module, message, data);
    console.log(formatLogEntry(entry));
  },

  warn(module: string, message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry('warn', module, message, data);
    console.warn(formatLogEntry(entry));
  },

  error(module: string, message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry('error', module, message, data);
    console.error(formatLogEntry(entry));
  },

  /**
   * Log an event emission.
   */
  event(eventName: string, eventId: string, data?: Record<string, unknown>) {
    this.info('EventEmitter', `Event emitted: ${eventName}`, {
      eventId,
      ...data,
    });
  },

  /**
   * Log a gateway request/response.
   */
  gateway(
    action: 'request' | 'response' | 'error' | 'retry' | 'timeout' | 'disabled',
    eventName: string,
    data?: Record<string, unknown>
  ) {
    const level: LogLevel = action === 'error' || action === 'timeout' ? 'error'
      : action === 'retry' || action === 'disabled' ? 'warn'
      : 'info';
    this[level]('Gateway', `${action}: ${eventName}`, data);
  },
};
