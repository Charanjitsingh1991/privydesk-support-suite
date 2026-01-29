type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = context ? `[${context}]` : '';
      const logFn = console[level] || console.log;
      
      if (data) {
        logFn(`${prefix} ${message}`, data);
      } else {
        logFn(`${prefix} ${message}`);
      }
    }

    // Send critical errors to monitoring service
    if (level === 'error') {
      this.reportError(entry);
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: unknown): void {
    this.log('error', message, context, data);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  private reportError(entry: LogEntry): void {
    // TODO: Integrate with error tracking service (e.g., Sentry)
    // For now, just ensure it's logged
    if (!this.isDevelopment) {
      // In production, you might want to send to a logging service
      console.error('Production Error:', entry);
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance();

// Convenience exports
export const debug = (message: string, context?: string, data?: unknown) =>
  logger.debug(message, context, data);
export const info = (message: string, context?: string, data?: unknown) =>
  logger.info(message, context, data);
export const warn = (message: string, context?: string, data?: unknown) =>
  logger.warn(message, context, data);
export const error = (message: string, context?: string, data?: unknown) =>
  logger.error(message, context, data);
