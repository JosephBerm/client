/**
 * Logger Module - Core Exports
 * 
 * Centralized logging system with FAANG-level features.
 * Provides structured, context-aware logging for the entire application.
 * 
 * **Features:**
 * - Multiple log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * - Structured metadata with automatic context enrichment
 * - Child loggers with inherited configuration
 * - Performance timers for operation tracking
 * - Log sampling for high-volume scenarios
 * - PII redaction for security/privacy compliance
 * - Buffered logging for performance optimization
 * - Remote transport support (DataDog, Sentry, etc.)
 * - Pluggable transport system
 * 
 * **FAANG Principles Implemented:**
 * - Structured logging (Google, Amazon CloudWatch)
 * - Context enrichment (Google Dapper, Amazon X-Ray)
 * - Performance tracking (Meta, Netflix)
 * - Log sampling (Google, Meta high-scale)
 * - Security-first (PII redaction, GDPR/CCPA)
 * - Pluggable architecture (Netflix, Amazon)
 * 
 * **Quick Start:**
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * // Basic logging
 * logger.info('Application started');
 * logger.error('Operation failed', { error, userId: '123' });
 * 
 * // Structured logging
 * logger.info('User action', {
 *   userId: '123',
 *   action: 'purchase',
 *   amount: 99.99,
 *   metadata: { productId: 'prod-456' }
 * });
 * 
 * // Performance tracking
 * const timer = logger.startTimer('Database Query');
 * await db.query('SELECT * FROM users');
 * timer(); // Automatically logs duration
 * 
 * // Module-specific logger
 * import { createModuleLogger } from '@_core/logger';
 * const authLogger = createModuleLogger('auth');
 * authLogger.debug('Token validated', { userId: '123' });
 * ```
 * 
 * **Environment Configuration:**
 * - **Development:** DEBUG level, console output, full stack traces
 * - **Production:** INFO level, buffered output, 10% sampling, PII redaction
 * 
 * **Integration:**
 * - Works seamlessly in browser and Node.js environments
 * - Ready for DataDog, Sentry, and custom logging backends
 * - Migration-friendly from console-based logging
 * 
 * **Migration from Old Logger:**
 * The old logger is still available for backward compatibility but deprecated.
 * New code should use the new logger API.
 * 
 * ```typescript
 * // Old (deprecated)
 * import { logger } from '@_core/logger';
 * logger.log('message', data);
 * 
 * // New (recommended)
 * import { logger } from '@_core/logger';
 * logger.info('message', { data });
 * ```
 * 
 * @module logger
 */

// ============================================================================
// EXPORTS - New Logger System
// ============================================================================

// Core logger implementation
export { Logger } from './logger'

// Types
export type {
	LogLevel,
	LogMetadata,
	LogEntry,
	LogTransport,
	LoggerConfig,
	ILogger,
	LogContext,
	PerformanceTiming,
} from './types'
export { LogLevelValue } from './types'

// Transports
export {
	ConsoleTransport,
	BufferedTransport,
	RemoteTransport,
	createConsoleTransport,
	createBufferedConsoleTransport,
} from './transports'

// Utilities
export {
	redactSensitiveFields,
	sanitizeMetadata,
	normalizeError,
	shouldSample,
	extractContext,
	mergeMetadata,
	formatLogEntry,
	meetsMinLevel,
	generateCorrelationId,
	getCurrentEnvironment,
	DEFAULT_REDACT_FIELDS,
} from './utils'

// Factory functions and singleton
export {
	getDefaultLogger,
	createLogger,
	createModuleLogger,
	createRequestLogger,
	createPerformanceLogger,
	createErrorLogger,
	configureRemoteLogging,
	resetDefaultLogger,
	loggers,
} from './factory'

// Import for use below
import { getDefaultLogger } from './factory'

// ============================================================================
// DEFAULT LOGGER INSTANCE
// ============================================================================

/**
 * Default logger instance for application-wide use.
 * Pre-configured with environment-appropriate settings.
 * 
 * **This is the primary logger you should use in most cases.**
 * 
 * **Features:**
 * - Auto-configured for development/production
 * - Includes all FAANG-level capabilities
 * - Modern replacement for console-based logging
 * - Structured metadata support
 * - Performance tracking
 * 
 * @example
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * // Simple logging
 * logger.info('User logged in');
 * logger.error('Login failed', { error, userId: '123' });
 * 
 * // Structured logging
 * logger.info('Order placed', {
 *   orderId: 'order-123',
 *   userId: 'user-456',
 *   amount: 99.99,
 *   items: 3
 * });
 * 
 * // Performance tracking
 * const timer = logger.startTimer('API Call');
 * await fetch('/api/data');
 * timer();
 * 
 * // Debug logging (auto-filtered in production)
 * logger.debug('Cache state', { hits: 42, misses: 8 });
 * ```
 */
export const logger = getDefaultLogger()

// ============================================================================
// BACKWARD COMPATIBILITY LAYER
// ============================================================================


// ============================================================================
// CONVENIENCE RE-EXPORTS
// ============================================================================

/**
 * Default export for convenience.
 * Allows `import logger from '@_core/logger'`
 */
export default logger

/**
 * Type guard to check if a value is a valid log level.
 * 
 * @param {string} value - Value to check
 * @returns {boolean} True if value is a valid log level
 * 
 * @example
 * ```typescript
 * if (isLogLevel('INFO')) {
 *   logger.configure({ level: 'INFO' });
 * }
 * ```
 */
export function isLogLevel(value: string): value is import('./types').LogLevel {
	return ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(value)
}

// ============================================================================
// MODULE DOCUMENTATION
// ============================================================================

/**
 * @example Basic Usage
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * logger.info('Application started');
 * logger.error('Something failed', { error });
 * ```
 * 
 * @example Module-Specific Logger
 * ```typescript
 * import { createModuleLogger } from '@_core/logger';
 * 
 * const authLogger = createModuleLogger('auth');
 * authLogger.info('User authenticated', { userId: '123' });
 * ```
 * 
 * @example Performance Tracking
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * const timer = logger.startTimer('Database Query');
 * const users = await db.query('SELECT * FROM users');
 * timer(); // Logs duration automatically
 * ```
 * 
 * @example Structured Logging
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * logger.info('Order processed', {
 *   orderId: 'order-123',
 *   userId: 'user-456',
 *   amount: 99.99,
 *   status: 'completed',
 *   timestamp: new Date()
 * });
 * ```
 * 
 * @example Remote Logging Setup
 * ```typescript
 * import { configureRemoteLogging } from '@_core/logger';
 * 
 * configureRemoteLogging({
 *   endpoint: 'https://logs.example.com/api/logs',
 *   apiKey: process.env.LOG_API_KEY!,
 *   minLevel: 'WARN'
 * });
 * 
 * // Now all WARN+ logs are sent to remote service
 * logger.error('Critical error', { error });
 * ```
 * 
 * @example Child Logger
 * ```typescript
 * import { logger } from '@_core/logger';
 * 
 * const apiLogger = logger.child('api', {
 *   component: 'RestAPI',
 *   version: 'v1'
 * });
 * 
 * apiLogger.info('Request received'); // Namespace: 'app:api'
 * ```
 */
