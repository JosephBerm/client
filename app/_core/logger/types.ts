/**
 * Logging System Type Definitions
 * 
 * Type definitions for the centralized logging system.
 * Provides strong type safety for all logging operations.
 * 
 * **FAANG Principles:**
 * - Strongly typed for compile-time safety (Google, Meta)
 * - Structured metadata support (Amazon CloudWatch pattern)
 * - Flexible transport system (Netflix pattern)
 * - Performance-oriented design (Meta performance culture)
 * 
 * @module logger/types
 */

/**
 * Log severity levels following industry standards.
 * Ordered from least to most severe for filtering and prioritization.
 * 
 * **Standards:**
 * - Syslog RFC 5424 severity levels
 * - Winston/Pino log level conventions
 * - Google Cloud Logging severity levels
 * 
 * **Hierarchy:**
 * TRACE < DEBUG < INFO < WARN < ERROR < FATAL
 * 
 * **Usage Guidelines:**
 * - **TRACE**: Very detailed, fine-grained debugging (e.g., function entry/exit)
 * - **DEBUG**: Detailed diagnostic information for development
 * - **INFO**: Informational messages about normal operation
 * - **WARN**: Potentially harmful situations or degraded performance
 * - **ERROR**: Error events that might allow the app to continue
 * - **FATAL**: Severe errors that will likely abort the application
 * 
 * @example
 * ```typescript
 * import { LogLevel } from '@_core/logger/types';
 * 
 * const currentLevel: LogLevel = 'INFO';
 * ```
 */
export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

/**
 * Numeric representation of log levels for comparison and filtering.
 * Higher numbers indicate higher severity.
 * 
 * Used internally for level comparison (e.g., should this log be output?)
 * 
 * @internal
 */
export const LogLevelValue: Record<LogLevel, number> = {
	TRACE: 0,
	DEBUG: 1,
	INFO: 2,
	WARN: 3,
	ERROR: 4,
	FATAL: 5,
}

/**
 * Structured metadata that can be attached to any log entry.
 * All fields are optional to allow flexible logging.
 * 
 * **FAANG Pattern:** Structured logging with rich context (Google, Amazon, Meta)
 * 
 * **Common Fields:**
 * - **requestId**: Correlation ID for tracing requests across services
 * - **userId**: Current user identifier (for user-specific debugging)
 * - **sessionId**: Browser session identifier
 * - **component**: Module/component name (for filtering)
 * - **action**: Current action/operation being performed
 * - **duration**: Time taken for an operation (in milliseconds)
 * - **error**: Error object with stack trace
 * - **data**: Additional structured data (API responses, state, etc.)
 * 
 * @example
 * ```typescript
 * const metadata: LogMetadata = {
 *   requestId: 'req-123-abc',
 *   userId: 'user-456',
 *   component: 'AuthService',
 *   action: 'login',
 *   duration: 245,
 *   data: { email: 'user@example.com' }
 * };
 * ```
 */
export interface LogMetadata {
	/** Unique request/correlation ID for distributed tracing */
	requestId?: string
	/** User identifier for user-specific logs */
	userId?: string
	/** Session identifier for grouping related requests */
	sessionId?: string
	/** Component/module name for log filtering */
	component?: string
	/** Current action/operation being performed */
	action?: string
	/** Duration of operation in milliseconds */
	duration?: number
	/** Error object with stack trace */
	error?: Error | unknown
	/** Additional structured data (objects, arrays, etc.) */
	data?: Record<string, any>
	/** Custom tags for categorization */
	tags?: string[]
	/** Environment information */
	environment?: 'development' | 'staging' | 'production'
	/** Timestamp override (default: current time) */
	timestamp?: Date
	/** Additional custom fields */
	[key: string]: any
}

/**
 * Complete log entry structure.
 * This is the final format that gets sent to transports.
 * 
 * **Format:** JSON-structured for machine parsing (FAANG standard)
 * 
 * All log entries follow this consistent structure for:
 * - Easy parsing by log aggregation tools (DataDog, Splunk, ELK)
 * - Consistent querying and filtering
 * - Integration with monitoring systems
 * 
 * @example
 * ```typescript
 * const logEntry: LogEntry = {
 *   timestamp: new Date(),
 *   level: 'INFO',
 *   message: 'User logged in successfully',
 *   metadata: {
 *     userId: 'user-123',
 *     component: 'AuthService'
 *   }
 * };
 * ```
 */
export interface LogEntry {
	/** ISO 8601 timestamp of when the log was created */
	timestamp: Date
	/** Severity level of the log */
	level: LogLevel
	/** Human-readable log message */
	message: string
	/** Structured metadata attached to this log */
	metadata?: LogMetadata
	/** Namespace/category for the log (e.g., 'app:auth:service') */
	namespace?: string
}

/**
 * Log transport interface for output destinations.
 * Transports define where logs are sent (console, file, remote service, etc.)
 * 
 * **FAANG Pattern:** Pluggable transport system (Netflix, Google)
 * 
 * **Common Transports:**
 * - ConsoleTransport: Output to browser console (development)
 * - RemoteTransport: Send to DataDog, Sentry, etc. (production)
 * - BufferedTransport: Batch logs before sending (performance)
 * - FileTransport: Write to file (Node.js only)
 * 
 * @example
 * ```typescript
 * class CustomTransport implements LogTransport {
 *   name = 'custom';
 *   
 *   log(entry: LogEntry): void {
 *     // Send to your logging backend
 *     fetch('/api/logs', {
 *       method: 'POST',
 *       body: JSON.stringify(entry)
 *     });
 *   }
 * }
 * ```
 */
export interface LogTransport {
	/** Unique name for this transport */
	name: string
	/** Minimum log level this transport will handle */
	level?: LogLevel
	/** Send a log entry to the transport destination */
	log: (entry: LogEntry) => void | Promise<void>
	/** Optional: Flush any buffered logs */
	flush?: () => void | Promise<void>
	/** Optional: Clean up resources when transport is removed */
	close?: () => void | Promise<void>
}

/**
 * Configuration options for the Logger instance.
 * 
 * **FAANG Pattern:** Flexible configuration for different environments (Amazon, Meta)
 * 
 * @example
 * ```typescript
 * const config: LoggerConfig = {
 *   level: 'INFO',
 *   namespace: 'app:auth',
 *   enabled: process.env.NODE_ENV !== 'production',
 *   enableSampling: true,
 *   sampleRate: 0.1, // 10% of logs in production
 *   transports: [consoleTransport, datadogTransport]
 * };
 * ```
 */
export interface LoggerConfig {
	/** Minimum log level to output (logs below this are ignored) */
	level?: LogLevel
	/** Default namespace for all logs from this logger */
	namespace?: string
	/** Whether logging is enabled (false = all logs suppressed) */
	enabled?: boolean
	/** Default metadata to include in all logs */
	defaultMetadata?: LogMetadata
	/** Log transports to use (console, remote, etc.) */
	transports?: LogTransport[]
	/** Enable log sampling (reduces volume in production) */
	enableSampling?: boolean
	/** Sample rate (0.0 to 1.0, where 0.1 = 10% of logs) */
	sampleRate?: number
	/** Enable performance tracking for all logs */
	enablePerformanceTracking?: boolean
	/** Enable automatic error stack traces */
	enableStackTraces?: boolean
	/** Redact sensitive fields from logs (PII protection) */
	redactFields?: string[]
	/** Maximum size of metadata objects (prevents huge logs) */
	maxMetadataSize?: number
	/** Enable log buffering for performance */
	enableBuffering?: boolean
	/** Buffer size before flushing (number of logs) */
	bufferSize?: number
	/** Buffer flush interval in milliseconds */
	bufferFlushInterval?: number
}

/**
 * Logger interface defining the public API.
 * All logger instances must implement this interface.
 * 
 * **FAANG Pattern:** Consistent API across all logging instances (Google, Amazon)
 * 
 * @example
 * ```typescript
 * const logger: ILogger = createLogger({ namespace: 'app' });
 * 
 * logger.info('Application started');
 * logger.error('Login failed', { userId: '123' });
 * logger.debug('Cache hit', { key: 'user:123', value: userData });
 * ```
 */
export interface ILogger {
	/** Log at TRACE level (most verbose) */
	trace: (message: string, metadata?: LogMetadata) => void
	/** Log at DEBUG level (detailed diagnostic info) */
	debug: (message: string, metadata?: LogMetadata) => void
	/** Log at INFO level (general information) */
	info: (message: string, metadata?: LogMetadata) => void
	/** Log at WARN level (warning messages) */
	warn: (message: string, metadata?: LogMetadata) => void
	/** Log at ERROR level (error messages) */
	error: (message: string, metadata?: LogMetadata) => void
	/** Log at FATAL level (critical errors) */
	fatal: (message: string, metadata?: LogMetadata) => void

	/** Create a child logger with inherited config and additional namespace */
	child: (namespace: string, metadata?: LogMetadata) => ILogger
	/** Add a transport to this logger */
	addTransport: (transport: LogTransport) => void
	/** Remove a transport by name */
	removeTransport: (name: string) => void
	/** Update logger configuration */
	configure: (config: Partial<LoggerConfig>) => void
	/** Flush all buffered logs immediately */
	flush: () => Promise<void>
	/** Close all transports and clean up */
	close: () => Promise<void>

	/** Start a performance timer and return a function to end it */
	startTimer: (label: string, metadata?: LogMetadata) => () => void
	/** Create a group of related logs (for browser console grouping) */
	group: (label: string) => void
	/** End a log group */
	groupEnd: () => void

	/**
	 * Logs data in table format (console.table) for better debugging.
	 * **FAANG Pattern:** Chrome DevTools table view, Meta/Amazon structured debugging
	 * 
	 * @param {string} message - Description of the table data
	 * @param {any} data - Data to display in table (array of objects or object)
	 * @param {LogLevel} level - Log level (default: DEBUG)
	 * @param {LogMetadata} metadata - Additional context
	 * 
	 * @example
	 * ```typescript
	 * logger.table('Service Worker Registrations', registrations);
	 * logger.table('User Preferences', preferences, 'INFO');
	 * ```
	 */
	table: (message: string, data: any, level?: LogLevel, metadata?: LogMetadata) => void

	/** Check if a log level is enabled */
	isLevelEnabled: (level: LogLevel) => boolean
	/** Get current logger configuration */
	getConfig: () => Readonly<LoggerConfig>
}

/**
 * Context for correlation and distributed tracing.
 * Stores request-scoped information that should be included in all logs.
 * 
 * **FAANG Pattern:** Distributed tracing context (Google Dapper, Amazon X-Ray)
 * 
 * @example
 * ```typescript
 * const context: LogContext = {
 *   requestId: 'req-abc-123',
 *   userId: 'user-456',
 *   sessionId: 'session-789',
 *   traceId: 'trace-xyz'
 * };
 * ```
 */
export interface LogContext {
	/** Unique request identifier for correlation */
	requestId?: string
	/** User identifier */
	userId?: string
	/** Session identifier */
	sessionId?: string
	/** Distributed trace identifier */
	traceId?: string
	/** Parent span identifier (for nested operations) */
	spanId?: string
	/** Additional context fields */
	[key: string]: any
}

/**
 * Performance timing result.
 * Returned by performance tracking methods.
 * 
 * @example
 * ```typescript
 * const timing: PerformanceTiming = {
 *   label: 'Database Query',
 *   duration: 123.45,
 *   startTime: 1000,
 *   endTime: 1123.45
 * };
 * ```
 */
export interface PerformanceTiming {
	/** Label for the timed operation */
	label: string
	/** Duration in milliseconds */
	duration: number
	/** Start timestamp (performance.now()) */
	startTime: number
	/** End timestamp (performance.now()) */
	endTime: number
	/** Additional metadata */
	metadata?: LogMetadata
}

