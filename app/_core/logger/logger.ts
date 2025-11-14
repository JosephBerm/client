/**
 * Logger Utility - Development-Only Logging
 * 
 * Centralized logging utility that only logs in development mode.
 * Prevents console pollution in production builds.
 * 
 * **Features:**
 * - Development-only logging (no production overhead)
 * - Grouped logging for better organization
 * - Error logging with context
 * - Warning logging for non-critical issues
 * - Performance logging for debugging
 * 
 * **Usage:**
 * - Use `logger.log()` for general debugging
 * - Use `logger.error()` for errors
 * - Use `logger.warn()` for warnings
 * - Use `logger.group()` for grouped logs
 * - Use `logger.performance()` for performance metrics
 * 
 * @module logger
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Logger utility with development-only logging.
 * All methods are no-ops in production.
 */
export const logger = {
	/**
	 * Logs a message with optional data (development only).
	 * 
	 * @param message - Log message
	 * @param data - Optional data object to log
	 * 
	 * @example
	 * ```typescript
	 * logger.log('Image loaded', { productId: '123', url: '...' });
	 * ```
	 */
	log: (message: string, data?: any): void => {
		if (isDevelopment) {
			if (data !== undefined) {
				console.log(`[${message}]`, data)
			} else {
				console.log(`[${message}]`)
			}
		}
	},

	/**
	 * Logs an error with optional context (development only).
	 * 
	 * @param message - Error message
	 * @param error - Error object or context data
	 * 
	 * @example
	 * ```typescript
	 * logger.error('Image load failed', { productId: '123', url: '...' });
	 * ```
	 */
	error: (message: string, error?: any): void => {
		if (isDevelopment) {
			if (error !== undefined) {
				console.error(`[ERROR] ${message}`, error)
			} else {
				console.error(`[ERROR] ${message}`)
			}
		}
	},

	/**
	 * Logs a warning with optional context (development only).
	 * 
	 * @param message - Warning message
	 * @param data - Optional context data
	 * 
	 * @example
	 * ```typescript
	 * logger.warn('Missing image URL', { productId: '123' });
	 * ```
	 */
	warn: (message: string, data?: any): void => {
		if (isDevelopment) {
			if (data !== undefined) {
				console.warn(`[WARN] ${message}`, data)
			} else {
				console.warn(`[WARN] ${message}`)
			}
		}
	},

	/**
	 * Starts a grouped log section (development only).
	 * Must be closed with logger.groupEnd().
	 * 
	 * @param label - Group label
	 * 
	 * @example
	 * ```typescript
	 * logger.group('ProductCard');
	 * logger.log('Image URL', url);
	 * logger.groupEnd();
	 * ```
	 */
	group: (label: string): void => {
		if (isDevelopment) {
			console.group(`[${label}]`)
		}
	},

	/**
	 * Ends a grouped log section (development only).
	 * 
	 * @example
	 * ```typescript
	 * logger.group('ProductCard');
	 * logger.log('Image URL', url);
	 * logger.groupEnd();
	 * ```
	 */
	groupEnd: (): void => {
		if (isDevelopment) {
			console.groupEnd()
		}
	},

	/**
	 * Logs performance metrics (development only).
	 * 
	 * @param label - Performance label
	 * @param startTime - Start time (from performance.now())
	 * 
	 * @example
	 * ```typescript
	 * const start = performance.now();
	 * // ... do work
	 * logger.performance('Image load', start);
	 * ```
	 */
	performance: (label: string, startTime: number): void => {
		if (isDevelopment) {
			const duration = performance.now() - startTime
			console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`)
		}
	},
}

