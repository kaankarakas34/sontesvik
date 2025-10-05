/**
 * Production-ready logging utility
 * Replaces console.log statements with proper logging
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel = import.meta.env.VITE_LOG_LEVEL || LogLevel.INFO;

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel as LogLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(entry: LogEntry): string {
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${
      entry.context ? ` (${entry.context})` : ''
    }`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data
    };

    if (this.isDevelopment) {
      // Development: use console with colors
      const formattedMessage = this.formatMessage(entry);
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data || '');
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data || '');
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data || '');
          break;
      }
    } else {
      // Production: send to logging service (implement as needed)
      this.sendToLoggingService(entry);
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // TODO: Implement actual logging service integration
    // Examples: Sentry, LogRocket, CloudWatch, etc.
    
    // For now, only log errors in production
    if (entry.level === LogLevel.ERROR) {
      console.error(this.formatMessage(entry), entry.data);
    }
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  // API specific logging methods
  apiError(endpoint: string, error: any, context?: string): void {
    this.error(
      `API Error: ${endpoint}`,
      context || 'API',
      {
        endpoint,
        error: error?.message || error,
        status: error?.response?.status,
        data: error?.response?.data
      }
    );
  }

  apiSuccess(endpoint: string, context?: string): void {
    this.debug(`API Success: ${endpoint}`, context || 'API');
  }

  userAction(action: string, context?: string, data?: any): void {
    this.info(`User Action: ${action}`, context || 'USER', data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience methods
export const logError = (message: string, context?: string, data?: any) => 
  logger.error(message, context, data);

export const logWarn = (message: string, context?: string, data?: any) => 
  logger.warn(message, context, data);

export const logInfo = (message: string, context?: string, data?: any) => 
  logger.info(message, context, data);

export const logDebug = (message: string, context?: string, data?: any) => 
  logger.debug(message, context, data);

export default logger;