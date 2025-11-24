/**
 * Logger Factory and Singleton
 * 
 * Provides factory functions and singleton instance for easy logger creation.
 * Implements the Factory pattern and Singleton pattern for consistent logging.
 * 
 * **FAANG Pattern:** Centralized logger management (Google, Amazon)
 * 
 * **Features:**
 * - Default logger singleton for simple use cases
 * - Factory function for creating custom loggers
 * - Pre-configured logger instances for common scenarios
 * - Environment-aware configuration
 * 
 * @module logger/factory
 */

import { Logger } from './logger'
import { BufferedTransport, RemoteTransport, createConsoleTransport } from './transports'
import { getCurrentEnvironment } from './utils'

import type { LoggerConfig, ILogger, LogLevel } from './types'

/**
 * Singleton logger instance for application-wide use.
 * Pre-configured with sensible defaults for the current environment.
 * 
 * **Configuration:**
 * - Development: DEBUG level, console transport, colors enabled
 * - Production: INFO level, buffered console, sampling enabled
 * 
 * **Use Case:** Simple logging without custom configuration
 * 
 * @example
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * logger.info('Application started');
 * logger.error('Something failed', { error });
 * ```
 */
let defaultLoggerInstance: ILogger | null = null

/**
 * Gets or creates the default logger singleton.
 * Lazy initialization on first access.
 * 
 * @returns {ILogger} Default logger instance
 */
export function getDefaultLogger(): ILogger {
	if (!defaultLoggerInstance) {
		defaultLoggerInstance = createDefaultLogger()
	}
	return defaultLoggerInstance
}

/**
 * Creates the default logger with environment-specific configuration.
 * 
 * **Development Configuration:**
 * - Level: DEBUG
 * - Transport: Console (with colors)
 * - Sampling: Disabled
 * - Stack traces: Enabled
 * 
 * **Production Configuration:**
 * - Level: INFO
 * - Transport: Buffered Console
 * - Sampling: Enabled (10%)
 * - Stack traces: Disabled
 * - PII redaction: Enabled
 * 
 * @private
 * @returns {ILogger} Configured logger
 */
function createDefaultLogger(): ILogger {
	const environment = getCurrentEnvironment()
	const isDevelopment = environment === 'development'

	// Base configuration
	const config: Partial<LoggerConfig> = {
		namespace: 'app',
		level: isDevelopment ? 'DEBUG' : 'INFO',
		enabled: true,
		enableSampling: !isDevelopment,
		sampleRate: isDevelopment ? 1.0 : 0.1, // 100% in dev, 10% in prod
		enablePerformanceTracking: true,
		enableStackTraces: isDevelopment,
		redactFields: [
			'password',
			'token',
			'apiKey',
			'secret',
			'authorization',
		],
		maxMetadataSize: 10 * 1024, // 10KB
		defaultMetadata: {
			environment,
		},
	}

	// Create logger
	const logger = new Logger(config)

	// Add appropriate transport
	if (isDevelopment) {
		// Development: Simple console transport
		logger.addTransport(createConsoleTransport('DEBUG'))
	} else {
		// Production: Buffered console transport for performance
		const consoleTransport = createConsoleTransport('INFO')
		const bufferedTransport = new BufferedTransport(consoleTransport, {
			bufferSize: 50,
			flushInterval: 5000, // 5 seconds
		})
		logger.addTransport(bufferedTransport)
	}

	return logger
}

/**
 * Creates a custom logger with the specified configuration.
 * 
 * **Pattern:** Factory method (Gang of Four)
 * 
 * @param {Partial<LoggerConfig>} config - Logger configuration
 * @returns {ILogger} Configured logger instance
 * 
 * @example
 * ```typescript
 * // Create logger for auth module
 * const authLogger = createLogger({
 *   namespace: 'app:auth',
 *   level: 'DEBUG',
 *   defaultMetadata: { component: 'AuthService' }
 * });
 * 
 * authLogger.info('User logged in', { userId: '123' });
 * ```
 */
export function createLogger(config?: Partial<LoggerConfig>): ILogger {
	const logger = new Logger(config)

	// Add console transport if none provided
	if (!config?.transports || config.transports.length === 0) {
		logger.addTransport(createConsoleTransport(config?.level))
	}

	return logger
}

/**
 * Creates a logger for a specific module/component.
 * Inherits from the default logger with additional namespace.
 * 
 * **Pattern:** Module-scoped logging (Google, Meta)
 * 
 * @param {string} namespace - Module/component namespace
 * @param {Partial<LoggerConfig>} config - Additional configuration
 * @returns {ILogger} Module logger
 * 
 * @example
 * ```typescript
 * // In AuthService.ts
 * const logger = createModuleLogger('auth');
 * logger.info('Validating token'); // Namespace: 'app:auth'
 * 
 * // In ImageService.ts
 * const logger = createModuleLogger('images', { level: 'DEBUG' });
 * logger.debug('Loading image', { url });
 * ```
 */
export function createModuleLogger(
	namespace: string,
	config?: Partial<LoggerConfig>
): ILogger {
	return getDefaultLogger().child(namespace, config?.defaultMetadata)
}

/**
 * Creates a logger for API/HTTP requests.
 * Pre-configured with request-specific metadata.
 * 
 * **Use Case:** HTTP request/response logging
 * 
 * @param {Object} options - Request options
 * @param {string} options.requestId - Unique request ID
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {string} options.url - Request URL
 * @param {string} options.userId - User ID (if authenticated)
 * @returns {ILogger} Request logger
 * 
 * @example
 * ```typescript
 * const requestLogger = createRequestLogger({
 *   requestId: 'req-123',
 *   method: 'POST',
 *   url: '/api/users',
 *   userId: 'user-456'
 * });
 * 
 * requestLogger.info('Request started');
 * requestLogger.info('Request completed', { statusCode: 200, duration: 245 });
 * ```
 */
export function createRequestLogger(options: {
	requestId: string
	method?: string
	url?: string
	userId?: string
}): ILogger {
	return getDefaultLogger().child('request', {
		requestId: options.requestId,
		method: options.method,
		url: options.url,
		userId: options.userId,
	})
}

/**
 * Creates a logger for performance monitoring.
 * Optimized for tracking operation timing and metrics.
 * 
 * **Use Case:** Performance profiling and monitoring
 * 
 * @param {string} namespace - Performance namespace
 * @returns {ILogger} Performance logger
 * 
 * @example
 * ```typescript
 * const perfLogger = createPerformanceLogger('database');
 * 
 * const timer = perfLogger.startTimer('SELECT query');
 * const results = await db.query('SELECT * FROM users');
 * timer(); // Logs: "SELECT query completed in 123ms"
 * ```
 */
export function createPerformanceLogger(namespace: string): ILogger {
	return createLogger({
		namespace: `perf:${namespace}`,
		level: 'DEBUG',
		enablePerformanceTracking: true,
		defaultMetadata: {
			category: 'performance',
		},
	})
}

/**
 * Creates a logger for error tracking.
 * Configured to capture errors with full stack traces.
 * 
 * **Use Case:** Error monitoring and debugging
 * 
 * @param {string} namespace - Error namespace
 * @returns {ILogger} Error logger
 * 
 * @example
 * ```typescript
 * const errorLogger = createErrorLogger('payment');
 * 
 * try {
 *   await processPayment();
 * } catch (error) {
 *   errorLogger.error('Payment failed', {
 *     error,
 *     orderId: '123',
 *     amount: 99.99
 *   });
 * }
 * ```
 */
export function createErrorLogger(namespace: string): ILogger {
	return createLogger({
		namespace: `error:${namespace}`,
		level: 'ERROR',
		enableStackTraces: true,
		defaultMetadata: {
			category: 'error',
		},
	})
}

/**
 * Configures remote logging (DataDog, Sentry, etc.).
 * Adds a remote transport to the default logger.
 * 
 * **Integration:** DataDog, Sentry, Custom endpoints
 * 
 * @param {Object} options - Remote logging configuration
 * @param {string} options.endpoint - Remote logging endpoint
 * @param {string} options.apiKey - API key for authentication
 * @param {LogLevel} options.minLevel - Minimum log level to send (default: WARN)
 * @param {number} options.batchSize - Batch size for remote logs (default: 10)
 * 
 * @example
 * ```typescript
 * // Configure DataDog logging
 * configureRemoteLogging({
 *   endpoint: 'https://http-intake.logs.datadoghq.com/v1/input',
 *   apiKey: process.env.DATADOG_API_KEY!,
 *   minLevel: 'WARN'
 * });
 * 
 * // Now all WARN+ logs are sent to DataDog
 * logger.error('Critical error', { error });
 * ```
 */
export function configureRemoteLogging(options: {
	endpoint: string
	apiKey: string
	minLevel?: LogLevel
	batchSize?: number
}): void {
	const remoteTransport = new RemoteTransport({
		endpoint: options.endpoint,
		apiKey: options.apiKey,
		level: options.minLevel || 'WARN',
		batchSize: options.batchSize || 10,
	})

	getDefaultLogger().addTransport(remoteTransport)
}

/**
 * Resets the default logger (useful for testing).
 * 
 * @internal
 * @example
 * ```typescript
 * // In test teardown
 * resetDefaultLogger();
 * ```
 */
export function resetDefaultLogger(): void {
	if (defaultLoggerInstance) {
		defaultLoggerInstance.close()
		defaultLoggerInstance = null
	}
}

/**
 * Pre-configured logger instances for convenience.
 * 
 * @example
 * ```typescript
 * import { loggers } from '@_core/logger';
 * 
 * loggers.auth.info('User logged in');
 * loggers.api.error('Request failed');
 * loggers.performance.debug('Query time', { duration: 123 });
 * ```
 */
export const loggers = {
	/** Default application logger */
	get app(): ILogger {
		return getDefaultLogger()
	},
	/** Authentication logger */
	get auth(): ILogger {
		return createModuleLogger('auth')
	},
	/** API/HTTP logger */
	get api(): ILogger {
		return createModuleLogger('api')
	},
	/** Database logger */
	get database(): ILogger {
		return createModuleLogger('database')
	},
	/** Performance logger */
	get performance(): ILogger {
		return createPerformanceLogger('app')
	},
	/** Error logger */
	get error(): ILogger {
		return createErrorLogger('app')
	},
	/** Image service logger */
	get images(): ILogger {
		return createModuleLogger('images')
	},
	/** Forms logger */
	get forms(): ILogger {
		return createModuleLogger('forms')
	},
	/** Store/Products logger */
	get store(): ILogger {
		return createModuleLogger('store')
	},
}

