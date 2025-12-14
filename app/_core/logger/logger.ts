/**
 * Logger Implementation
 * 
 * Core logging class implementing FAANG-level logging standards.
 * Provides structured, context-aware logging with multiple transports.
 * 
 * **FAANG Principles Implemented:**
 * - Structured logging (Google, Amazon)
 * - Context enrichment (Google Dapper, Amazon X-Ray)
 * - Performance tracking (Meta, Netflix)
 * - Log sampling (Google, Meta high-scale)
 * - Security (PII redaction, field sanitization)
 * - Pluggable transports (Netflix, Amazon)
 * 
 * **Features:**
 * - Multiple log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * - Structured metadata with automatic context
 * - Child loggers with inherited config
 * - Performance timers
 * - Log sampling for high-volume scenarios
 * - PII redaction for security/privacy
 * - Buffered logging for performance
 * - Remote transport support
 * 
 * @module logger/Logger
 */

import {
	redactSensitiveFields,
	sanitizeMetadata,
	normalizeError,
	shouldSample,
	mergeMetadata,
	meetsMinLevel,
	generateCorrelationId,
	getCurrentEnvironment,
} from './utils'

import type {
	LogLevel,
	LogMetadata,
	LogEntry,
	LoggerConfig,
	LogTransport,
	ILogger,
} from './types'

/**
 * Default logger configuration.
 * Optimized for development with sensible production defaults.
 * 
 * **Development:** DEBUG level, enabled, no sampling
 * **Production:** INFO level, enabled, 10% sampling for high-volume logs
 */
const DEFAULT_CONFIG: Required<LoggerConfig> = {
	level: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG',
	namespace: '',
	enabled: true,
	defaultMetadata: {},
	transports: [],
	enableSampling: process.env.NODE_ENV === 'production',
	sampleRate: 0.1, // 10% sampling in production
	enablePerformanceTracking: true,
	enableStackTraces: process.env.NODE_ENV !== 'production',
	redactFields: [],
	maxMetadataSize: 10 * 1024, // 10KB
	enableBuffering: false,
	bufferSize: 50,
	bufferFlushInterval: 5000, // 5 seconds
}

/**
 * Logger Class
 * 
 * Main logger implementation with full feature set.
 * 
 * **Thread-Safety:** Not applicable (JavaScript is single-threaded)
 * **Performance:** Optimized with buffering and sampling
 * **Memory:** Bounded by maxMetadataSize and bufferSize
 * 
 * @implements {ILogger}
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const logger = new Logger({ namespace: 'app' });
 * logger.info('Application started');
 * 
 * // With metadata
 * logger.error('Login failed', {
 *   userId: '123',
 *   error: new Error('Invalid credentials')
 * });
 * 
 * // Child logger
 * const authLogger = logger.child('auth');
 * authLogger.debug('Validating token');
 * 
 * // Performance tracking
 * const timer = logger.startTimer('Database Query');
 * await db.query('SELECT * FROM users');
 * timer(); // Automatically logs duration
 * ```
 */
export class Logger implements ILogger {
	private config: Required<LoggerConfig>
	private transports: LogTransport[] = []
	private activeGroups: string[] = []
	private timers: Map<string, number> = new Map()

	/**
	 * Creates a new Logger instance.
	 * 
	 * @param {Partial<LoggerConfig>} config - Logger configuration options
	 * 
	 * @example
	 * ```typescript
	 * const logger = new Logger({
	 *   level: 'INFO',
	 *   namespace: 'app:auth',
	 *   defaultMetadata: { service: 'authentication' },
	 *   enableSampling: true,
	 *   sampleRate: 0.1
	 * });
	 * ```
	 */
	constructor(config: Partial<LoggerConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config } as Required<LoggerConfig>
		this.transports = this.config.transports || []
	}

	/**
	 * Logs a message at TRACE level.
	 * Most verbose level, used for fine-grained debugging.
	 * 
	 * **Use Case:** Function entry/exit, loop iterations, detailed state
	 * 
	 * @param {string} message - Log message
	 * @param {LogMetadata} metadata - Additional structured data
	 * 
	 * @example
	 * ```typescript
	 * logger.trace('Entering function', { function: 'processOrder', args: { orderId: '123' } });
	 * ```
	 */
	public trace(message: string, metadata?: LogMetadata): void {
		this.log('TRACE', message, metadata)
	}

	/**
	 * Logs a message at DEBUG level.
	 * Detailed diagnostic information for development.
	 * 
	 * **Use Case:** Variable values, control flow, algorithm steps
	 * 
	 * @param {string} message - Log message
	 * @param {LogMetadata} metadata - Additional structured data
	 * 
	 * @example
	 * ```typescript
	 * logger.debug('Cache lookup', { key: 'user:123', hit: true });
	 * ```
	 */
	public debug(message: string, metadata?: LogMetadata): void {
		this.log('DEBUG', message, metadata)
	}

	/**
	 * Logs a message at INFO level.
	 * Informational messages about normal operation.
	 * 
	 * **Use Case:** Application lifecycle events, successful operations
	 * 
	 * @param {string} message - Log message
	 * @param {LogMetadata} metadata - Additional structured data
	 * 
	 * @example
	 * ```typescript
	 * logger.info('User logged in', { userId: '123', method: 'password' });
	 * ```
	 */
	public info(message: string, metadata?: LogMetadata): void {
		this.log('INFO', message, metadata)
	}

	/**
	 * Logs a message at WARN level.
	 * Potentially harmful situations or degraded performance.
	 * 
	 * **Use Case:** Deprecated API usage, fallback to defaults, retry attempts
	 * 
	 * @param {string} message - Log message
	 * @param {LogMetadata} metadata - Additional structured data
	 * 
	 * @example
	 * ```typescript
	 * logger.warn('API rate limit approaching', { usage: 90, limit: 100 });
	 * ```
	 */
	public warn(message: string, metadata?: LogMetadata): void {
		this.log('WARN', message, metadata)
	}

	/**
	 * Logs a message at ERROR level.
	 * Error events that might allow the app to continue.
	 * 
	 * **Use Case:** Caught exceptions, failed operations, data validation errors
	 * 
	 * @param {string} message - Log message
	 * @param {LogMetadata} metadata - Additional structured data (should include error)
	 * 
	 * @example
	 * ```typescript
	 * try {
	 *   await processPayment();
	 * } catch (error) {
	 *   logger.error('Payment processing failed', { error, orderId: '123' });
	 * }
	 * ```
	 */
	public error(message: string, metadata?: LogMetadata): void {
		this.log('ERROR', message, metadata)
	}

	/**
	 * Logs a message at FATAL level.
	 * Severe errors that will likely abort the application.
	 * 
	 * **Use Case:** Database connection lost, critical service unavailable, OOM
	 * 
	 * @param {string} message - Log message
	 * @param {LogMetadata} metadata - Additional structured data (should include error)
	 * 
	 * @example
	 * ```typescript
	 * logger.fatal('Database connection lost', { error, retriesAttempted: 5 });
	 * ```
	 */
	public fatal(message: string, metadata?: LogMetadata): void {
		this.log('FATAL', message, metadata)
	}

	/**
	 * Core logging method that processes and outputs log entries.
	 * 
	 * **Processing Pipeline:**
	 * 1. Check if logging is enabled
	 * 2. Check log level threshold
	 * 3. Apply sampling (if enabled)
	 * 4. Merge metadata (default + provided)
	 * 5. Normalize errors
	 * 6. Redact sensitive fields
	 * 7. Sanitize metadata
	 * 8. Create log entry
	 * 9. Send to transports
	 * 
	 * @private
	 * @param {LogLevel} level - Log level
	 * @param {string} message - Log message
	 * @param {LogMetadata} metadata - Log metadata
	 */
	private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
		// Check if logging is enabled
		if (!this.config.enabled) {
			return
		}

		// Check log level threshold
		if (!meetsMinLevel(level, this.config.level)) {
			return
		}

		// Apply sampling (skip some logs in production for performance)
		if (this.config.enableSampling && level !== 'ERROR' && level !== 'FATAL') {
			if (!shouldSample(this.config.sampleRate)) {
				return
			}
		}

		// Merge metadata: default + provided + auto-context
		let mergedMetadata = mergeMetadata(
			this.config.defaultMetadata,
			metadata,
			{
				environment: getCurrentEnvironment(),
			}
		)

		// Normalize error if present
		if (mergedMetadata.error) {
			const normalizedError = normalizeError(mergedMetadata.error)
			mergedMetadata.error = normalizedError

			// Add stack trace if enabled
			if (this.config.enableStackTraces && normalizedError.stack) {
				mergedMetadata.stack = normalizedError.stack
			}
		}

		// Redact sensitive fields
		if (this.config.redactFields.length > 0) {
			mergedMetadata = redactSensitiveFields(mergedMetadata, this.config.redactFields)
		}

		// Sanitize metadata to prevent huge logs
		const sanitizedMetadata = sanitizeMetadata(mergedMetadata, {
			maxObjectSize: this.config.maxMetadataSize,
		})
		
		if (!sanitizedMetadata) {
			mergedMetadata = {}
		} else {
			mergedMetadata = sanitizedMetadata
		}

		// Create log entry
		// Ensure timestamp is always a Date object to prevent toISOString errors
		let entryTimestamp: Date
		if (mergedMetadata.timestamp instanceof Date) {
			entryTimestamp = mergedMetadata.timestamp
		} else if (typeof mergedMetadata.timestamp === 'number') {
			entryTimestamp = new Date(mergedMetadata.timestamp)
		} else if (typeof mergedMetadata.timestamp === 'string') {
			entryTimestamp = new Date(mergedMetadata.timestamp)
		} else {
			entryTimestamp = new Date()
		}

		const entry: LogEntry = {
			timestamp: entryTimestamp,
			level,
			message,
			namespace: this.config.namespace,
			metadata: mergedMetadata,
		}

		// Send to all transports
		for (const transport of this.transports) {
			try {
				const result = transport.log(entry)
				// Handle promise rejection if transport.log returns a promise
				if (result instanceof Promise) {
					result.catch((error) => {
						// Fallback: If transport fails, log to console
						console.error('Transport failed:', transport.name, error)
					})
				}
			} catch (error) {
				// Fallback: If transport fails synchronously, log to console
				console.error('Transport failed:', transport.name, error)
			}
		}
	}

	/**
	 * Creates a child logger with inherited configuration and additional namespace.
	 * 
	 * **Pattern:** Hierarchical logging (Google, Amazon)
	 * 
	 * **Use Case:** Create specialized loggers for modules/components
	 * 
	 * @param {string} namespace - Additional namespace to append
	 * @param {LogMetadata} defaultMetadata - Additional default metadata
	 * @returns {ILogger} Child logger instance
	 * 
	 * @example
	 * ```typescript
	 * const appLogger = new Logger({ namespace: 'app' });
	 * const authLogger = appLogger.child('auth', { component: 'AuthService' });
	 * 
	 * authLogger.info('Login attempt'); // Namespace: 'app:auth'
	 * ```
	 */
	public child(namespace: string, defaultMetadata?: LogMetadata): ILogger {
		const childNamespace = this.config.namespace
			? `${this.config.namespace}:${namespace}`
			: namespace

		const childMetadata = mergeMetadata(this.config.defaultMetadata, defaultMetadata)

		const childLogger = new Logger({
			...this.config,
			namespace: childNamespace,
			defaultMetadata: childMetadata,
		})

		// Share transports with parent
		childLogger.transports = this.transports

		return childLogger
	}

	/**
	 * Adds a transport to this logger.
	 * 
	 * @param {LogTransport} transport - Transport to add
	 * 
	 * @example
	 * ```typescript
	 * logger.addTransport(new ConsoleTransport({ level: 'DEBUG' }));
	 * logger.addTransport(new RemoteTransport({ endpoint: 'https://logs.example.com' }));
	 * ```
	 */
	public addTransport(transport: LogTransport): void {
		this.transports.push(transport)
	}

	/**
	 * Removes a transport by name.
	 * 
	 * @param {string} name - Name of transport to remove
	 * 
	 * @example
	 * ```typescript
	 * logger.removeTransport('console');
	 * ```
	 */
	public removeTransport(name: string): void {
		const index = this.transports.findIndex((t) => t.name === name)
		if (index !== -1) {
			const transport = this.transports[index]
			
			// Close transport if it has a close method
			if (transport.close) {
				try {
					const result = transport.close()
					// Handle promise rejection if transport.close returns a promise
					if (result instanceof Promise) {
						result.catch((error) => {
							console.error('Transport close failed:', transport.name, error)
						})
					}
				} catch (error) {
					console.error('Transport close failed:', transport.name, error)
				}
			}
			
			this.transports.splice(index, 1)
		}
	}

	/**
	 * Updates logger configuration.
	 * 
	 * @param {Partial<LoggerConfig>} config - Configuration to update
	 * 
	 * @example
	 * ```typescript
	 * // Change log level at runtime
	 * logger.configure({ level: 'ERROR' });
	 * 
	 * // Disable sampling
	 * logger.configure({ enableSampling: false });
	 * ```
	 */
	public configure(config: Partial<LoggerConfig>): void {
		this.config = { ...this.config, ...config } as Required<LoggerConfig>
	}

	/**
	 * Flushes all buffered logs immediately.
	 * Should be called before app shutdown.
	 * 
	 * @returns {Promise<void>} Promise that resolves when flush is complete
	 * 
	 * @example
	 * ```typescript
	 * // Before app shutdown
	 * window.addEventListener('beforeunload', async () => {
	 *   await logger.flush();
	 * });
	 * ```
	 */
	public async flush(): Promise<void> {
		const flushPromises = this.transports
			.filter((t) => t.flush)
			.map(async (t) => t.flush!())

		await Promise.all(flushPromises)
	}

	/**
	 * Closes all transports and cleans up resources.
	 * Should be called when logger is no longer needed.
	 * 
	 * @returns {Promise<void>} Promise that resolves when close is complete
	 * 
	 * @example
	 * ```typescript
	 * // Clean up
	 * await logger.close();
	 * ```
	 */
	public async close(): Promise<void> {
		const closePromises = this.transports
			.filter((t) => t.close)
			.map(async (t) => t.close!())

		await Promise.all(closePromises)
		
		this.transports = []
	}

	/**
	 * Starts a performance timer and returns a function to end it.
	 * 
	 * **Pattern:** Performance monitoring (Meta, Netflix)
	 * 
	 * @param {string} label - Label for the timed operation
	 * @param {LogMetadata} metadata - Additional metadata to include in timing log
	 * @returns {Function} Function to call when operation completes
	 * 
	 * @example
	 * ```typescript
	 * const endTimer = logger.startTimer('Database Query');
	 * const users = await db.query('SELECT * FROM users');
	 * endTimer(); // Logs: "Database Query completed in 123.45ms"
	 * ```
	 */
	public startTimer(label: string, metadata?: LogMetadata): () => void {
		const startTime = performance.now()
		const timerId = generateCorrelationId()
		
		this.timers.set(timerId, startTime)

		return () => {
			const endTime = performance.now()
			const duration = endTime - startTime
			
			this.timers.delete(timerId)

			// Log performance timing
			this.debug(`${label} completed`, {
				...metadata,
				duration,
				performanceTiming: {
					label,
					duration,
					startTime,
					endTime,
				},
			})
		}
	}

	/**
	 * Creates a log group (console.group).
	 * Useful for grouping related logs together.
	 * 
	 * **Note:** Only works with ConsoleTransport
	 * 
	 * @param {string} label - Group label
	 * 
	 * @example
	 * ```typescript
	 * logger.group('User Authentication Flow');
	 * logger.info('Validating credentials');
	 * logger.info('Checking permissions');
	 * logger.info('Creating session');
	 * logger.groupEnd();
	 * ```
	 */
	public group(label: string): void {
		this.activeGroups.push(label)
		
		if (typeof console !== 'undefined' && console.group) {
			console.group(label)
		}
	}

	/**
	 * Ends the current log group.
	 * 
	 * @example
	 * ```typescript
	 * logger.group('Processing');
	 * logger.info('Step 1');
	 * logger.groupEnd();
	 * ```
	 */
	public groupEnd(): void {
		this.activeGroups.pop()
		
		if (typeof console !== 'undefined' && console.groupEnd) {
			console.groupEnd()
		}
	}

	/**
	 * Logs data in table format for better debugging.
	 * 
	 * **FAANG Pattern:** Chrome DevTools table view (Google), Meta/Amazon structured debugging
	 * 
	 * **Features:**
	 * - Displays arrays of objects in tabular format (most common use case)
	 * - Supports single objects as well
	 * - Automatic fallback to structured logging for non-console transports
	 * - Respects log levels (default: DEBUG)
	 * - Integrates with metadata system
	 * 
	 * **Use Cases:**
	 * - Displaying arrays of objects (users, orders, registrations)
	 * - Debugging structured data
	 * - Inspecting service worker registrations
	 * - Viewing cache statistics
	 * - Analyzing performance metrics
	 * 
	 * **Implementation:**
	 * - Uses console.table when ConsoleTransport is available (browser)
	 * - Falls back to structured JSON logging for remote transports
	 * - Automatically extracts table data into metadata
	 * 
	 * @param {string} message - Description of the table data
	 * @param {any} data - Data to display (array of objects, object, or any structured data)
	 * @param {LogLevel} level - Log level (default: DEBUG)
	 * @param {LogMetadata} metadata - Additional context metadata
	 * 
	 * @example
	 * ```typescript
	 * // Array of objects (most common use case)
	 * logger.table('Service Worker Registrations', registrations.map(r => ({
	 *   scope: r.scope,
	 *   state: r.active?.state,
	 *   installing: r.installing?.state
	 * })));
	 * 
	 * // Single object
	 * logger.table('User Preferences', preferences);
	 * 
	 * // With custom log level
	 * logger.table('Cache Statistics', cacheStats, 'INFO');
	 * 
	 * // With additional metadata
	 * logger.table('Performance Metrics', metrics, 'DEBUG', {
	 *   component: 'ServiceWorker',
	 *   timestamp: Date.now()
	 * });
	 * ```
	 */
	public table(message: string, data: any, level: LogLevel = 'DEBUG', metadata?: LogMetadata): void {
		// Check if logging is enabled
		if (!this.config.enabled) {
			return
		}

		// Check log level threshold
		if (!meetsMinLevel(level, this.config.level)) {
			return
		}

		// Prepare table metadata
		const tableMetadata: LogMetadata = {
			...metadata,
			tableData: data,
			tableType: Array.isArray(data) ? 'array' : typeof data,
			tableSize: Array.isArray(data) ? data.length : Object.keys(data || {}).length,
		}

		// Create a special log entry with table formatting flag
		const entry: LogEntry & { useTable?: boolean } = {
			timestamp: new Date(),
			level,
			message,
			namespace: this.config.namespace,
			metadata: tableMetadata,
			useTable: true, // Flag for ConsoleTransport to use console.table
		}

		// Send to all transports
		for (const transport of this.transports) {
			try {
				const result = transport.log(entry as LogEntry)
				// Handle promise rejection if transport.log returns a promise
				if (result instanceof Promise) {
					result.catch((error) => {
						// Fallback: If transport fails, log to console
						console.error('Transport failed:', transport.name, error)
					})
				}
			} catch (error) {
				// Fallback: If transport fails synchronously, log to console
				console.error('Transport failed:', transport.name, error)
			}
		}
	}

	/**
	 * Checks if a log level is enabled.
	 * 
	 * **Use Case:** Avoid expensive computations if log level is disabled
	 * 
	 * @param {LogLevel} level - Log level to check
	 * @returns {boolean} True if level is enabled
	 * 
	 * @example
	 * ```typescript
	 * if (logger.isLevelEnabled('DEBUG')) {
	 *   const expensiveData = computeExpensiveDebugData();
	 *   logger.debug('Debug data', { data: expensiveData });
	 * }
	 * ```
	 */
	public isLevelEnabled(level: LogLevel): boolean {
		return this.config.enabled && meetsMinLevel(level, this.config.level)
	}

	/**
	 * Gets the current logger configuration (read-only).
	 * 
	 * @returns {Readonly<LoggerConfig>} Current configuration
	 * 
	 * @example
	 * ```typescript
	 * import { logger } from '@_core/logger';
	 * 
	 * const config = logger.getConfig();
	 * logger.debug('Current logger configuration', { level: config.level });
	 * ```
	 */
	public getConfig(): Readonly<LoggerConfig> {
		return { ...this.config }
	}
}
