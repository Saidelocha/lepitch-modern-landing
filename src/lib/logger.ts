/**
 * Intelligent Logging Utility
 * Provides conditional logging based on environment and log levels
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface LogContext {
  sessionId?: string
  userId?: string
  ip?: string
  timestamp?: boolean
  userAgent?: string
  requestId?: string
  method?: string
  url?: string
  statusCode?: number
  duration?: number
  error?: Error | string
  metadata?: Record<string, string | number | boolean | undefined>
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private isProduction: boolean
  private isTest: boolean

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.isTest = process.env.NODE_ENV === 'test'
    this.logLevel = this.getLogLevel()
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env['LOG_LEVEL'] as LogLevel
    
    // Default log levels by environment
    if (this.isTest) return 'error' // Minimal logs in tests
    if (this.isProduction) return 'warn' // Only warnings and errors in production
    if (envLevel && ['error', 'warn', 'info', 'debug'].includes(envLevel)) {
      return envLevel
    }
    
    return 'info' // Development default
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    }
    
    return levels[level] <= levels[this.logLevel]
  }

  private formatMessage(message: string, context?: LogContext): string {
    const timestamp = context?.timestamp !== false ? new Date().toISOString() : ''
    const sessionId = context?.sessionId ? ` [${context.sessionId.substring(0, 8)}...]` : ''
    const ip = context?.ip ? ` [${this.maskIp(context.ip)}]` : ''
    
    return `${timestamp}${sessionId}${ip} ${message}`
  }

  private maskIp(ip: string): string {
    if (ip.includes(':')) {
      // IPv6 - mask last parts
      const parts = ip.split(':')
      return parts.slice(0, 3).join(':') + ':***'
    } else {
      // IPv4 - mask last octet
      const parts = ip.split('.')
      return parts.slice(0, 3).join('.') + '.*'
    }
  }

  private logWithContext(level: LogLevel, message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(message, context)
    
    if (data && typeof data === 'object') {
      console[level](formattedMessage, data)
    } else {
      console[level](formattedMessage)
    }
  }

  // Public logging methods
  error(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    this.logWithContext('error', `❌ ${message}`, context, data)
  }

  warn(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    this.logWithContext('warn', `⚠️ ${message}`, context, data)
  }

  info(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    this.logWithContext('info', `ℹ️ ${message}`, context, data)
  }

  debug(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    this.logWithContext('debug', `🔍 ${message}`, context, data)
  }

  // Specialized logging methods for common use cases
  security(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    this.logWithContext('warn', `🛡️ SECURITY: ${message}`, context, data)
  }

  rateLimit(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    // Only log rate limit issues in development or if they're critical
    if (this.isProduction && !message.includes('exceeded')) return
    this.logWithContext('warn', `🚦 RATE LIMIT: ${message}`, context, data)
  }

  ai(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    // AI logs are debug level - only shown when debugging
    this.logWithContext('debug', `🤖 AI: ${message}`, context, data)
  }

  survey(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    // Survey logs are debug level - only shown when debugging
    this.logWithContext('debug', `📋 SURVEY: ${message}`, context, data)
  }

  email(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    // Email logs are important - info level
    this.logWithContext('info', `📧 EMAIL: ${message}`, context, data)
  }

  performance(message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) {
    // Performance logs only in development or when explicitly debugging
    if (this.isProduction) return
    this.logWithContext('debug', `⚡ PERF: ${message}`, context, data)
  }

  // Conditional logging for development only
  devOnly(callback: () => void) {
    if (!this.isProduction && !this.isTest) {
      callback()
    }
  }

  // Grouped logging for related operations
  group(title: string, callback: () => void) {
    if (!this.shouldLog('debug')) return
    
    console.group(`🔍 ${title}`)
    try {
      callback()
    } finally {
      console.groupEnd()
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export convenience functions
export const log = {
  error: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.error(message, context, data),
  warn: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.warn(message, context, data),
  info: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.info(message, context, data),
  debug: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.debug(message, context, data),
  security: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.security(message, context, data),
  rateLimit: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.rateLimit(message, context, data),
  ai: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.ai(message, context, data),
  survey: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.survey(message, context, data),
  email: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.email(message, context, data),
  performance: (message: string, context?: LogContext, data?: Record<string, string | number | boolean | undefined | null | object>) => logger.performance(message, context, data),
  devOnly: (callback: () => void) => logger.devOnly(callback),
  group: (title: string, callback: () => void) => logger.group(title, callback)
}