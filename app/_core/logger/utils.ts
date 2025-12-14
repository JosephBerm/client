/**
 * Logger Utility Functions
 * 
 * Helper functions for log processing, formatting, and security.
 * Implements FAANG-level best practices for log handling.
 * 
 * **Features:**
 * - PII redaction (GDPR/CCPA compliance)
 * - Metadata sanitization
 * - Error normalization
 * - Log sampling
 * - Context extraction
 * 
 * **FAANG Principles:**
 * - Security-first (Google, Meta data protection)
 * - Performance-optimized (Amazon efficiency)
 * - Privacy-compliant (Apple privacy standards)
 * 
 * @module logger/utils
 */

import { LogLevelValue } from './types'

import type { LogLevel, LogMetadata, LogEntry, LogContext } from './types'

/**
 * Fields that should be redacted from logs for security/privacy.
 * Prevents accidentally logging sensitive user data (PII, credentials, etc.)
 * 
 * **Compliance:** GDPR, CCPA, SOC 2, PCI DSS
 * 
 * **Common PII Fields:**
 * - Passwords, tokens, API keys
 * - Credit card numbers, SSN
 * - Email addresses, phone numbers (in some cases)
 * - Addresses, dates of birth
 */
export const DEFAULT_REDACT_FIELDS = [
	'password',
	'passwordConfirm',
	'oldPassword',
	'newPassword',
	'token',
	'accessToken',
	'refreshToken',
	'apiKey',
	'secret',
	'secretKey',
	'privateKey',
	'creditCard',
	'cardNumber',
	'cvv',
	'ssn',
	'socialSecurity',
	'authorization',
	'cookie',
	'cookies',
]

/**
 * Redacts sensitive fields from an object.
 * Recursively searches nested objects and arrays.
 * 
 * **Pattern:** Deep redaction with circular reference protection (Google, Meta)
 * 
 * @param {any} obj - Object to redact
 * @param {string[]} fieldsToRedact - Field names to redact (case-insensitive)
 * @param {string} redactedValue - Replacement value (default: '[REDACTED]')
 * @returns {any} New object with sensitive fields redacted
 * 
 * @example
 * ```typescript
 * const data = {
 *   username: 'john',
 *   password: 'secret123',
 *   profile: { email: 'john@example.com' }
 * };
 * 
 * const safe = redactSensitiveFields(data, ['password']);
 * // Result: { username: 'john', password: '[REDACTED]', profile: { email: 'john@example.com' } }
 * ```
 */
export function redactSensitiveFields(
	obj: any,
	fieldsToRedact: string[] = DEFAULT_REDACT_FIELDS,
	redactedValue: string = '[REDACTED]'
): any {
	// Internal recursive function with seen set
	const redactRecursive = (
		current: any,
		fields: string[],
		seen: WeakSet<object>
	): any => {
		if (current === null || current === undefined) {
			return current
		}

		// Primitive types - return as-is
		if (typeof current !== 'object') {
			return current
		}

		// Protect against circular references
		if (seen.has(current)) {
			return '[Circular]'
		}
		seen.add(current)

		// Array - redact each element
		if (Array.isArray(current)) {
			return current.map((item) => redactRecursive(item, fields, seen))
		}

		// Object - redact fields
		const redacted: Record<string, any> = {}
		const lowerFieldsToRedact = fields.map((f) => f.toLowerCase())

		for (const [key, value] of Object.entries(current)) {
			// Check if field should be redacted (case-insensitive)
			if (lowerFieldsToRedact.includes(key.toLowerCase())) {
				redacted[key] = redactedValue
			} else if (typeof value === 'object' && value !== null) {
				// Recursively redact nested objects
				redacted[key] = redactRecursive(value, fields, seen)
			} else {
				redacted[key] = value
			}
		}

		return redacted
	}

	// Start recursion with new WeakSet
	const seen = new WeakSet<object>()
	return redactRecursive(obj, fieldsToRedact, seen)
}

/**
 * Sanitizes metadata to prevent logging large objects that can cause performance issues.
 * Truncates large strings, limits array lengths, and controls object depth.
 * 
 * **Pattern:** Metadata size control (Amazon, Netflix performance)
 * 
 * @param {LogMetadata} metadata - Metadata to sanitize
 * @param {Object} options - Sanitization options
 * @param {number} options.maxStringLength - Max string length (default: 1000)
 * @param {number} options.maxArrayLength - Max array length (default: 100)
 * @param {number} options.maxDepth - Max object nesting depth (default: 5)
 * @param {number} options.maxObjectSize - Max total object size in bytes (default: 10KB)
 * @returns {LogMetadata} Sanitized metadata
 * 
 * @example
 * ```typescript
 * const metadata = {
 *   data: 'x'.repeat(5000), // Very long string
 *   items: Array(500).fill('item') // Large array
 * };
 * 
 * const safe = sanitizeMetadata(metadata, { maxStringLength: 100 });
 * // Truncates strings and arrays to prevent huge logs
 * ```
 */
export function sanitizeMetadata(
	metadata: LogMetadata | undefined,
	options: {
		maxStringLength?: number
		maxArrayLength?: number
		maxDepth?: number
		maxObjectSize?: number
	} = {}
): LogMetadata | undefined {
	if (!metadata) {
		return undefined
	}

	const maxStringLength = options.maxStringLength || 1000
	const maxArrayLength = options.maxArrayLength || 100
	const maxDepth = options.maxDepth || 5
	const maxObjectSize = options.maxObjectSize || 10 * 1024 // 10KB

	// Check total size (rough estimate)
	const estimatedSize = JSON.stringify(metadata).length
	if (estimatedSize > maxObjectSize) {
		return {
			_truncated: true,
			_originalSize: estimatedSize,
			_message: 'Metadata too large, truncated',
		}
	}

	return sanitizeValue(metadata, 0, maxStringLength, maxArrayLength, maxDepth) as LogMetadata
}

/**
 * Recursively sanitizes a value.
 * 
 * @private
 */
function sanitizeValue(
	value: any,
	depth: number,
	maxStringLength: number,
	maxArrayLength: number,
	maxDepth: number
): any {
	// Max depth reached
	if (depth > maxDepth) {
		return '[Max Depth Exceeded]'
	}

	// Null/undefined
	if (value === null || value === undefined) {
		return value
	}

	// String - truncate if too long
	if (typeof value === 'string') {
		if (value.length > maxStringLength) {
			return value.substring(0, maxStringLength) + '... [truncated]'
		}
		return value
	}

	// Number, boolean, etc.
	if (typeof value !== 'object') {
		return value
	}

	// Array - limit length
	if (Array.isArray(value)) {
		if (value.length > maxArrayLength) {
			return [
				...value.slice(0, maxArrayLength).map((item) =>
					sanitizeValue(item, depth + 1, maxStringLength, maxArrayLength, maxDepth)
				),
				`... [${value.length - maxArrayLength} more items]`,
			]
		}
		return value.map((item) =>
			sanitizeValue(item, depth + 1, maxStringLength, maxArrayLength, maxDepth)
		)
	}

	// Object - recursively sanitize
	const sanitized: Record<string, any> = {}
	for (const [key, val] of Object.entries(value)) {
		sanitized[key] = sanitizeValue(val, depth + 1, maxStringLength, maxArrayLength, maxDepth)
	}
	return sanitized
}

/**
 * Normalizes an error object to a loggable format.
 * Extracts message, stack trace, and additional properties.
 * 
 * **Pattern:** Error normalization (Google, Amazon error handling)
 * 
 * @param {unknown} error - Error to normalize (can be Error, string, object, etc.)
 * @returns {Object} Normalized error object
 * @returns {string} returns.message - Error message
 * @returns {string} returns.stack - Stack trace (if available)
 * @returns {string} returns.name - Error name/type
 * @returns {any} returns.cause - Error cause (if available)
 * 
 * @example
 * ```typescript
 * try {
 *   throw new Error('Something failed');
 * } catch (err) {
 *   const normalized = normalizeError(err);
 *   logger.error('Operation failed', { error: normalized });
 * }
 * ```
 */
export function normalizeError(error: unknown): {
	message: string
	stack?: string
	name?: string
	cause?: any
	[key: string]: any
} {
	// Already an Error object
	if (error instanceof Error) {
		return {
			message: error.message,
			stack: error.stack,
			name: error.name,
			cause: error.cause,
			// Include any custom properties
			...Object.getOwnPropertyNames(error).reduce((acc, key) => {
				if (!['message', 'stack', 'name', 'cause'].includes(key)) {
					acc[key] = (error as any)[key]
				}
				return acc
			}, {} as Record<string, any>),
		}
	}

	// String error
	if (typeof error === 'string') {
		return {
			message: error,
			name: 'StringError',
		}
	}

	// Object with message property
	if (error && typeof error === 'object' && 'message' in error) {
		return {
			message: String(error.message),
			...(error as any),
		}
	}

	// Unknown error type
	return {
		message: String(error),
		name: 'UnknownError',
	}
}

/**
 * Determines if a log should be sampled based on the configured sample rate.
 * Uses random sampling for simplicity (can be replaced with deterministic sampling).
 * 
 * **Pattern:** Log sampling for high-volume applications (Google, Meta)
 * 
 * **Use Case:** In production, reduce log volume by only keeping a percentage of logs.
 * Essential for high-traffic applications where logging every event is impractical.
 * 
 * @param {number} sampleRate - Sample rate (0.0 to 1.0, where 0.1 = 10% of logs)
 * @returns {boolean} True if log should be kept, false if it should be dropped
 * 
 * @example
 * ```typescript
 * // Keep 10% of logs in production
 * const shouldLog = shouldSample(0.1);
 * if (shouldLog) {
 *   logger.debug('Detailed debug info');
 * }
 * ```
 */
export function shouldSample(sampleRate: number): boolean {
	if (sampleRate >= 1.0) {
		return true // Keep all logs
	}
	if (sampleRate <= 0.0) {
		return false // Drop all logs
	}
	return Math.random() < sampleRate
}

/**
 * Extracts context information from the current environment.
 * Automatically captures request ID, user ID, session ID, etc.
 * 
 * **Pattern:** Automatic context enrichment (Google Dapper, Amazon X-Ray)
 * 
 * **Browser Context:**
 * - User agent
 * - URL and pathname
 * - Session storage data
 * - Performance timing
 * 
 * **Server Context:**
 * - Request headers
 * - Environment variables
 * - Process information
 * 
 * @returns {LogContext} Extracted context
 * 
 * @example
 * ```typescript
 * const context = extractContext();
 * logger.info('User action', { ...context, action: 'click' });
 * ```
 */
export function extractContext(): LogContext {
	const context: LogContext = {}

	// Browser environment
	if (typeof window !== 'undefined') {
		// URL information
		context.url = window.location.href
		context.pathname = window.location.pathname

		// User agent
		context.userAgent = navigator.userAgent

		// Session ID from storage (if available)
		try {
			const sessionId = sessionStorage.getItem('sessionId')
			if (sessionId) {
				context.sessionId = sessionId
			}
		} catch {
			// Session storage not available
		}

		// Performance timing (page load time)
		if (performance && performance.timing) {
			const {timing} = performance
			if (timing.loadEventEnd && timing.navigationStart) {
				context.pageLoadTime = timing.loadEventEnd - timing.navigationStart
			}
		}
	}

	// Server environment (Node.js)
	if (typeof process !== 'undefined') {
		context.nodeVersion = process.version
		context.platform = process.platform
		context.environment = process.env.NODE_ENV
	}

	return context
}

/**
 * Merges multiple metadata objects with conflict resolution.
 * Later metadata takes precedence over earlier metadata.
 * 
 * @param {...LogMetadata} metadatas - Metadata objects to merge
 * @returns {LogMetadata} Merged metadata
 * 
 * @example
 * ```typescript
 * const base = { userId: '123', component: 'auth' };
 * const specific = { action: 'login', duration: 245 };
 * const merged = mergeMetadata(base, specific);
 * // Result: { userId: '123', component: 'auth', action: 'login', duration: 245 }
 * ```
 */
export function mergeMetadata(...metadatas: (LogMetadata | undefined)[]): LogMetadata {
	return metadatas.reduce<LogMetadata>((acc, metadata) => {
		if (!metadata) {
			return acc
		}
		return { ...acc, ...metadata }
	}, {})
}

/**
 * Formats a log entry as a JSON string.
 * 
 * @param {LogEntry} entry - Log entry to format
 * @param {boolean} pretty - Whether to pretty-print (default: false)
 * @returns {string} JSON string
 * 
 * @example
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * const json = formatLogEntry(entry, true);
 * // Use formatted JSON for custom output or API transmission
 * logger.debug('Formatted log entry', { formatted: json });
 * ```
 */
export function formatLogEntry(entry: LogEntry, pretty: boolean = false): string {
	// Defensive timestamp handling to prevent toISOString errors
	const safeTimestamp = entry.timestamp instanceof Date 
		? entry.timestamp 
		: new Date(entry.timestamp as unknown as number | string)
	const formatted = {
		timestamp: safeTimestamp.toISOString(),
		level: entry.level,
		message: entry.message,
		namespace: entry.namespace,
		...entry.metadata,
	}

	return pretty ? JSON.stringify(formatted, null, 2) : JSON.stringify(formatted)
}

/**
 * Checks if a log level meets the minimum threshold.
 * 
 * @param {LogLevel} level - Current log level
 * @param {LogLevel} minLevel - Minimum level required
 * @returns {boolean} True if level meets or exceeds minimum
 * 
 * @example
 * ```typescript
 * const shouldLog = meetsMinLevel('ERROR', 'WARN'); // true
 * const shouldLog = meetsMinLevel('DEBUG', 'WARN'); // false
 * ```
 */
export function meetsMinLevel(level: LogLevel, minLevel: LogLevel): boolean {
	return LogLevelValue[level] >= LogLevelValue[minLevel]
}

/**
 * Generates a unique correlation ID for request tracking.
 * 
 * **Pattern:** UUID v4 generation (standard across FAANG)
 * 
 * @returns {string} Unique correlation ID
 * 
 * @example
 * ```typescript
 * const requestId = generateCorrelationId();
 * logger.info('Request started', { requestId });
 * ```
 */
export function generateCorrelationId(): string {
	// Simple UUID v4 implementation
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0
		const v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

/**
 * Gets the current environment (development, staging, production).
 * 
 * @returns {'development' | 'staging' | 'production'} Current environment
 * 
 * @example
 * ```typescript
 * const env = getCurrentEnvironment();
 * if (env === 'production') {
 *   // Use production logging config
 * }
 * ```
 */
export function getCurrentEnvironment(): 'development' | 'staging' | 'production' {
	const nodeEnv: string = process.env.NODE_ENV || 'development'
	
	if (nodeEnv === 'production') {
		return 'production'
	}
	
	if (nodeEnv === 'staging' || nodeEnv === 'test') {
		return 'staging'
	}
	
	return 'development'
}

