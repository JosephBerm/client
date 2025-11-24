/**
 * Core - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Application-wide foundations used across all features.
 * Pure infrastructure code - no React dependencies, works everywhere.
 * 
 * **Architecture:**
 * - Logger: FAANG-level structured logging
 * - Validation: Zod schemas for type-safe forms
 * - Server + Client safe (no browser APIs)
 * 
 * @example
 * ```typescript
 * import { logger, emailSchema, loginSchema } from '@_core'
 * 
 * // Logging
 * logger.info('User action', { userId: '123' })
 * 
 * // Validation
 * const result = emailSchema.safeParse(email)
 * ```
 * 
 * @module core
 */

// ============================================================================
// LOGGER (Server + Client Safe - FAANG-Level)
// ============================================================================

// Default logger instance (most commonly used)
export { logger } from './logger'

// Logger classes and factories
export {
	Logger,
	getDefaultLogger,
	createLogger,
	createModuleLogger,
	createRequestLogger,
	createPerformanceLogger,
	createErrorLogger,
	configureRemoteLogging,
	resetDefaultLogger,
	loggers,
	isLogLevel,
} from './logger'

// Logger types
export type {
	LogLevel,
	LogMetadata,
	LogEntry,
	LogTransport,
	LoggerConfig,
	ILogger,
	LogContext,
	PerformanceTiming,
} from './logger'
export { LogLevelValue } from './logger'

// Logger transports
export {
	ConsoleTransport,
	BufferedTransport,
	RemoteTransport,
	createConsoleTransport,
	createBufferedConsoleTransport,
} from './logger'

// Logger utilities
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
} from './logger'

// ============================================================================
// VALIDATION (Server + Client Safe - Zod Schemas)
// ============================================================================

// Field-level schemas
export {
	emailSchema,
	passwordSchema,
	usernameSchema,
	phoneSchema,
	nameSchema,
	addressSchema,
} from './validation/validation-schemas'

// Form schemas
export {
	loginSchema,
	signupSchema,
	changePasswordSchema,
	profileUpdateSchema,
	productSchema,
	orderSchema,
	quoteSchema,
	customerSchema,
	providerSchema,
	contactSchema,
	searchFilterSchema,
} from './validation/validation-schemas'

// Form types
export type {
	LoginFormData,
	SignupFormData,
	ChangePasswordFormData,
	ProfileUpdateFormData,
	ProductFormData,
	OrderFormData,
	QuoteFormData,
	CustomerFormData,
	ProviderFormData,
	ContactFormData,
	SearchFilterFormData,
} from './validation/validation-schemas'

