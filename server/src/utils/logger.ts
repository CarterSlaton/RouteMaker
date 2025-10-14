/**
 * Logging utility with different log levels
 */

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private log(level: LogLevel, emoji: string, ...args: any[]): void {
    if (level <= this.level) {
      console.log(emoji, ...args);
    }
  }

  error(...args: any[]): void {
    this.log(LogLevel.ERROR, '❌', ...args);
  }

  warn(...args: any[]): void {
    this.log(LogLevel.WARN, '⚠️ ', ...args);
  }

  info(...args: any[]): void {
    this.log(LogLevel.INFO, 'ℹ️ ', ...args);
  }

  success(...args: any[]): void {
    this.log(LogLevel.INFO, '✅', ...args);
  }

  debug(...args: any[]): void {
    this.log(LogLevel.DEBUG, '🔍', ...args);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Export singleton instance
export const logger = new Logger(
  process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
);

export { LogLevel };
