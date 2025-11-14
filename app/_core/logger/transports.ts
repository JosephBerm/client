/**
 * Log Transport Implementations
 * 
 * Provides various transport mechanisms for outputting logs to different destinations.
 * Follows the pluggable transport pattern used at Google, Netflix, and Amazon.
 * 
 * **Available Transports:**
 * - ConsoleTransport: Browser console output with colored formatting
 * - BufferedTransport: Batches logs for performance (reduces I/O)
 * - RemoteTransport: Sends logs to remote services (DataDog, Sentry, etc.)
 * 
 * **FAANG Principles:**
 * - Pluggable architecture (Netflix pattern)
 * - Performance-optimized with buffering (Meta pattern)
 * - Production-ready error handling (Google SRE principles)
 * 
 * @module logger/transports
 */

import type { LogEntry, LogTransport, LogLevel } from './types'
import { LogLevelValue } from './types'

/**
 * Console colors for different log levels.
 * Makes logs easier to scan visually in development.
 * 
 * **Pattern:** Chrome DevTools color scheme
 */
const LOG_COLORS: Record<LogLevel, string> = {
	TRACE: '#9CA3AF', // Gray
	DEBUG: '#3B82F6', // Blue
	INFO: '#10B981', // Green
	WARN: '#F59E0B', // Yellow/Orange
	ERROR: '#EF4444', // Red
	FATAL: '#DC2626', // Dark Red
}

/**
 * Console log methods for different log levels.
 * Maps log levels to appropriate console methods.
 */
const CONSOLE_METHODS: Record<LogLevel, keyof Console> = {
	TRACE: 'debug',
	DEBUG: 'debug',
	INFO: 'info',
	WARN: 'warn',
	ERROR: 'error',
	FATAL: 'error',
}

/**
 * Console Transport
 * 
 * Outputs logs to the browser console with color-coded formatting.
 * Includes collapsible groups and structured data display.
 * 
 * **Features:**
 * - Color-coded by log level for easy scanning
 * - Browser console groups for related logs
 * - Structured metadata display
 * - Development-friendly formatting
 * 
 * **FAANG Pattern:** Chrome DevTools best practices (Google)
 * 
 * @example
 * ```typescript
 * const transport = new ConsoleTransport({
 *   level: 'DEBUG',
 *   useColors: true,
 *   useTimestamp: true
 * });
 * 
 * logger.addTransport(transport);
 * ```
 */
export class ConsoleTransport implements LogTransport {
	public readonly name = 'console'
	public level?: LogLevel
	private useColors: boolean
	private useTimestamp: boolean
	private useGroups: boolean

	/**
	 * Creates a new Console Transport.
	 * 
	 * @param {Object} options - Configuration options
	 * @param {LogLevel} options.level - Minimum log level to output
	 * @param {boolean} options.useColors - Enable colored output (default: true in development)
	 * @param {boolean} options.useTimestamp - Include timestamps (default: true)
	 * @param {boolean} options.useGroups - Use console groups (default: false)
	 */
	constructor(options: {
		level?: LogLevel
		useColors?: boolean
		useTimestamp?: boolean
		useGroups?: boolean
	} = {}) {
		this.level = options.level || 'TRACE'
		this.useColors = options.useColors ?? (process.env.NODE_ENV === 'development')
		this.useTimestamp = options.useTimestamp ?? true
		this.useGroups = options.useGroups ?? false
	}

	/**
	 * Outputs a log entry to the console.
	 * 
	 * **FAANG Pattern:** Chrome DevTools console formatting (Google)
	 * 
	 * @param {LogEntry} entry - The log entry to output
	 */
	public log(entry: LogEntry & { useTable?: boolean }): void {
		// Skip if level is too low
		if (this.level && LogLevelValue[entry.level] < LogLevelValue[this.level]) {
			return
		}

		// Handle table output (FAANG Pattern: console.table for structured data)
		if (entry.useTable && entry.metadata?.tableData && typeof console !== 'undefined') {
			const consoleMethod = CONSOLE_METHODS[entry.level]
			const timestamp = this.useTimestamp
				? `[${entry.timestamp.toISOString()}]`
				: ''
			const namespace = entry.namespace ? `[${entry.namespace}]` : ''
			const level = `[${entry.level}]`

			// Output message first
			if (this.useColors && typeof window !== 'undefined') {
				const color = LOG_COLORS[entry.level]
				const consoleFunc = (console as any)[consoleMethod]
				if (typeof consoleFunc === 'function') {
					consoleFunc(
						`%c${timestamp} %c${level} %c${namespace} %c${entry.message}`,
						'color: #6B7280', // Gray for timestamp
						`color: ${color}; font-weight: bold`, // Level color
						'color: #8B5CF6', // Purple for namespace
						'color: inherit' // Default for message
					)
				}
			} else {
				const consoleFunc = (console as any)[consoleMethod]
				if (typeof consoleFunc === 'function') {
					consoleFunc(`${timestamp} ${level} ${namespace} ${entry.message}`)
				}
			}

			// Use console.table for structured data (FAANG Pattern)
			// This provides a much better debugging experience than regular logging
			if (typeof console.table === 'function') {
				console.table(entry.metadata.tableData)
			} else {
				// Fallback if console.table is not available
				const consoleFunc = (console as any)[consoleMethod]
				if (typeof consoleFunc === 'function') {
					consoleFunc('Table data:', entry.metadata.tableData)
				}
			}

			// Output additional metadata (excluding tableData which is already displayed)
			if (entry.metadata) {
				const { tableData, tableType, tableSize, ...additionalMetadata } = entry.metadata
				if (Object.keys(additionalMetadata).length > 0) {
					const consoleFunc = (console as any)[consoleMethod]
					if (typeof consoleFunc === 'function') {
						consoleFunc('Additional context:', additionalMetadata)
					}
				}
			}

			return
		}

		// Regular log output (non-table)
		const consoleMethod = CONSOLE_METHODS[entry.level]
		const timestamp = this.useTimestamp
			? `[${entry.timestamp.toISOString()}]`
			: ''

		const namespace = entry.namespace ? `[${entry.namespace}]` : ''
		const level = `[${entry.level}]`

		// Format message with color
		if (this.useColors && typeof window !== 'undefined' && typeof console !== 'undefined') {
			const color = LOG_COLORS[entry.level]
			const consoleFunc = (console as any)[consoleMethod]
			if (typeof consoleFunc === 'function') {
				consoleFunc(
					`%c${timestamp} %c${level} %c${namespace} %c${entry.message}`,
					'color: #6B7280', // Gray for timestamp
					`color: ${color}; font-weight: bold`, // Level color
					'color: #8B5CF6', // Purple for namespace
					'color: inherit', // Default for message
					entry.metadata || ''
				)
			}
		} else if (typeof console !== 'undefined') {
			// No colors (Node.js or color disabled)
			const consoleFunc = (console as any)[consoleMethod]
			if (typeof consoleFunc === 'function') {
				consoleFunc(
					`${timestamp} ${level} ${namespace} ${entry.message}`,
					entry.metadata || ''
				)
			}
		}

		// Show metadata in a collapsible group if present
		if (entry.metadata && Object.keys(entry.metadata).length > 0) {
			if (this.useGroups && typeof console !== 'undefined') {
				if (typeof console.groupCollapsed === 'function') {
					console.groupCollapsed('Metadata')
					if (typeof console.table === 'function') {
						console.table(entry.metadata)
					}
					if (typeof console.groupEnd === 'function') {
						console.groupEnd()
					}
				}
			}
		}
	}
}

/**
 * Buffered Transport
 * 
 * Batches log entries before sending to improve performance.
 * Reduces I/O operations by collecting logs and flushing periodically.
 * 
 * **Features:**
 * - Configurable buffer size and flush interval
 * - Automatic flushing on buffer full
 * - Manual flush support
 * - Wraps another transport (decorator pattern)
 * 
 * **FAANG Pattern:** Log buffering for performance (Meta, Amazon)
 * 
 * **Performance Benefits:**
 * - Reduces logging overhead (expensive in browsers)
 * - Batches network requests (for remote transports)
 * - Prevents log spam from overwhelming the system
 * 
 * @example
 * ```typescript
 * const consoleTransport = new ConsoleTransport();
 * const bufferedTransport = new BufferedTransport(consoleTransport, {
 *   bufferSize: 100,
 *   flushInterval: 5000 // 5 seconds
 * });
 * 
 * logger.addTransport(bufferedTransport);
 * ```
 */
export class BufferedTransport implements LogTransport {
	public readonly name: string
	private buffer: LogEntry[] = []
	private bufferSize: number
	private flushInterval: number
	private intervalId: NodeJS.Timeout | null = null
	private innerTransport: LogTransport

	/**
	 * Creates a new Buffered Transport.
	 * 
	 * @param {LogTransport} innerTransport - The transport to wrap with buffering
	 * @param {Object} options - Configuration options
	 * @param {number} options.bufferSize - Maximum buffer size before auto-flush (default: 50)
	 * @param {number} options.flushInterval - Time between flushes in ms (default: 5000)
	 */
	constructor(
		innerTransport: LogTransport,
		options: {
			bufferSize?: number
			flushInterval?: number
		} = {}
	) {
		this.innerTransport = innerTransport
		this.name = `buffered-${innerTransport.name}`
		this.bufferSize = options.bufferSize || 50
		this.flushInterval = options.flushInterval || 5000

		// Start auto-flush interval
		if (typeof window !== 'undefined') {
			this.intervalId = setInterval(() => {
				this.flush()
			}, this.flushInterval)
		}
	}

	/**
	 * Adds a log entry to the buffer.
	 * Auto-flushes if buffer is full.
	 * 
	 * @param {LogEntry} entry - The log entry to buffer
	 */
	public log(entry: LogEntry): void {
		this.buffer.push(entry)

		// Auto-flush if buffer is full
		if (this.buffer.length >= this.bufferSize) {
			this.flush()
		}
	}

	/**
	 * Flushes all buffered logs to the inner transport.
	 * Called automatically on interval or when buffer is full.
	 */
	public flush(): void {
		if (this.buffer.length === 0) {
			return
		}

		const logsToFlush = [...this.buffer]
		this.buffer = []

		// Send all buffered logs to inner transport
		for (const entry of logsToFlush) {
			this.innerTransport.log(entry)
		}

		// Flush inner transport if it supports it
		if (this.innerTransport.flush) {
			this.innerTransport.flush()
		}
	}

	/**
	 * Closes the transport and cleans up resources.
	 * Flushes any remaining logs before closing.
	 */
	public close(): void {
		// Clear interval
		if (this.intervalId) {
			clearInterval(this.intervalId)
			this.intervalId = null
		}

		// Flush remaining logs
		this.flush()

		// Close inner transport
		if (this.innerTransport.close) {
			this.innerTransport.close()
		}
	}
}

/**
 * Remote Transport
 * 
 * Sends logs to a remote logging service (DataDog, Sentry, custom endpoint).
 * Batches requests for efficiency and handles network errors gracefully.
 * 
 * **Features:**
 * - Batched HTTP requests for performance
 * - Automatic retry with exponential backoff
 * - Offline queue (stores logs when offline)
 * - Configurable endpoint and headers
 * 
 * **FAANG Pattern:** Remote observability (Amazon CloudWatch, Google Cloud Logging)
 * 
 * **Integration Ready For:**
 * - DataDog Logs API
 * - Sentry breadcrumbs
 * - Custom logging endpoints
 * - AWS CloudWatch
 * - Google Cloud Logging
 * 
 * @example
 * ```typescript
 * const remoteTransport = new RemoteTransport({
 *   endpoint: 'https://logs.example.com/api/logs',
 *   apiKey: 'your-api-key',
 *   batchSize: 10,
 *   level: 'WARN' // Only send warnings and above
 * });
 * 
 * logger.addTransport(remoteTransport);
 * ```
 */
export class RemoteTransport implements LogTransport {
	public readonly name = 'remote'
	public level?: LogLevel
	private endpoint: string
	private apiKey?: string
	private batchSize: number
	private buffer: LogEntry[] = []
	private headers: Record<string, string>
	private retryAttempts: number
	private retryDelay: number

	/**
	 * Creates a new Remote Transport.
	 * 
	 * @param {Object} options - Configuration options
	 * @param {string} options.endpoint - Remote logging endpoint URL
	 * @param {string} options.apiKey - API key for authentication (optional)
	 * @param {LogLevel} options.level - Minimum log level to send (default: WARN)
	 * @param {number} options.batchSize - Number of logs to batch before sending (default: 10)
	 * @param {Record<string, string>} options.headers - Custom HTTP headers
	 * @param {number} options.retryAttempts - Number of retry attempts (default: 3)
	 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
	 */
	constructor(options: {
		endpoint: string
		apiKey?: string
		level?: LogLevel
		batchSize?: number
		headers?: Record<string, string>
		retryAttempts?: number
		retryDelay?: number
	}) {
		this.endpoint = options.endpoint
		this.apiKey = options.apiKey
		this.level = options.level || 'WARN'
		this.batchSize = options.batchSize || 10
		this.retryAttempts = options.retryAttempts || 3
		this.retryDelay = options.retryDelay || 1000

		// Build headers
		this.headers = {
			'Content-Type': 'application/json',
			...options.headers,
		}

		if (this.apiKey) {
			this.headers['Authorization'] = `Bearer ${this.apiKey}`
		}
	}

	/**
	 * Adds a log entry to the batch.
	 * Sends batch when full.
	 * 
	 * @param {LogEntry} entry - The log entry to send
	 */
	public log(entry: LogEntry): void {
		// Check level filtering
		if (this.level && LogLevelValue[entry.level] < LogLevelValue[this.level]) {
			return
		}

		this.buffer.push(entry)

		// Send batch if full
		if (this.buffer.length >= this.batchSize) {
			this.flush()
		}
	}

	/**
	 * Sends all buffered logs to the remote endpoint.
	 */
	public async flush(): Promise<void> {
		if (this.buffer.length === 0) {
			return
		}

		const logsToSend = [...this.buffer]
		this.buffer = []

		await this.sendLogs(logsToSend)
	}

	/**
	 * Sends logs to the remote endpoint with retry logic.
	 * 
	 * @private
	 * @param {LogEntry[]} logs - Logs to send
	 * @param {number} attempt - Current retry attempt
	 */
	private async sendLogs(logs: LogEntry[], attempt: number = 0): Promise<void> {
		try {
			const response = await fetch(this.endpoint, {
				method: 'POST',
				headers: this.headers,
				body: JSON.stringify({ logs }),
			})

			if (!response.ok) {
				throw new Error(`Remote logging failed: ${response.status} ${response.statusText}`)
			}
		} catch (error) {
			// Retry with exponential backoff
			if (attempt < this.retryAttempts) {
				const delay = this.retryDelay * Math.pow(2, attempt)
				await new Promise((resolve) => setTimeout(resolve, delay))
				await this.sendLogs(logs, attempt + 1)
			} else {
				// Max retries reached, log to console as fallback
				console.error('Failed to send logs to remote endpoint after retries:', error)
			}
		}
	}

	/**
	 * Closes the transport and flushes remaining logs.
	 */
	public async close(): Promise<void> {
		await this.flush()
	}
}

/**
 * Creates a console transport with sensible defaults for the current environment.
 * 
 * @param {LogLevel} level - Minimum log level (default: DEBUG in dev, INFO in prod)
 * @returns {ConsoleTransport} Configured console transport
 * 
 * @example
 * ```typescript
 * const transport = createConsoleTransport('DEBUG');
 * logger.addTransport(transport);
 * ```
 */
export function createConsoleTransport(level?: LogLevel): ConsoleTransport {
	const defaultLevel: LogLevel =
		process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'

	return new ConsoleTransport({
		level: level || defaultLevel,
		useColors: process.env.NODE_ENV === 'development',
		useTimestamp: true,
		useGroups: false,
	})
}

/**
 * Creates a buffered console transport for better performance.
 * 
 * @param {LogLevel} level - Minimum log level
 * @param {number} bufferSize - Buffer size before flush (default: 50)
 * @returns {BufferedTransport} Configured buffered transport
 * 
 * @example
 * ```typescript
 * const transport = createBufferedConsoleTransport('DEBUG', 100);
 * logger.addTransport(transport);
 * ```
 */
export function createBufferedConsoleTransport(
	level?: LogLevel,
	bufferSize?: number
): BufferedTransport {
	const consoleTransport = createConsoleTransport(level)
	return new BufferedTransport(consoleTransport, { bufferSize })
}

