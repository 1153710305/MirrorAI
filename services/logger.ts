import { LogLevel } from '../types';

/**
 * 简单的日志记录器
 * 后期可扩展为发送日志到服务器
 */
class Logger {
  private static formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  static info(message: string, data?: any) {
    console.log(this.formatMessage(LogLevel.INFO, message), data || '');
  }

  static warn(message: string, data?: any) {
    console.warn(this.formatMessage(LogLevel.WARN, message), data || '');
  }

  static error(message: string, error?: any) {
    console.error(this.formatMessage(LogLevel.ERROR, message), error || '');
  }
}

export default Logger;