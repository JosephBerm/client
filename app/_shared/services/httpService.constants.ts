/**
 * HTTP Service Constants
 *
 * Centralized constants for HTTP service configuration.
 * Eliminates magic strings and ensures consistency across the codebase.
 *
 * @module httpService.constants
 */

/**
 * Authentication cookie name
 * Used throughout the application for JWT token storage
 */
export const AUTH_COOKIE_NAME = 'at' as const

/**
 * Authorization header prefix
 */
export const AUTH_HEADER_PREFIX = 'Bearer ' as const

/**
 * Default API base URL
 * Used as fallback when NEXT_PUBLIC_API_URL is not set
 *
 * NOTE: This must match the backend development server port.
 * The backend runs on port 5254 by default.
 *
 * IMPORTANT: Backend routes are versioned and prefixed (e.g., /api/v1/products, /api/v1/accounts).
 * API path is determined by controller routes combined with the global /api/v1 prefix.
 */
export const DEFAULT_API_BASE_URL = 'http://localhost:5254/api/v1' as const

/**
 * Request timeout in milliseconds
 * 30 seconds - industry standard for API requests
 */
export const REQUEST_TIMEOUT_MS = 30000 as const

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Content-Type header values
 */
export const CONTENT_TYPE = {
	JSON: 'application/json',
	FORM_DATA: 'multipart/form-data',
} as const

/**
 * HTTP methods
 */
export const HTTP_METHOD = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
} as const

/**
 * Response types for download method
 */
export const RESPONSE_TYPE = {
	BLOB: 'blob',
	ARRAY_BUFFER: 'arraybuffer',
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
	REQUEST_TIMEOUT: 'Request timeout',
	REQUEST_FAILED: 'Request failed',
	INTERNAL_SERVER_ERROR: 'Internal Server Error',
	FAILED_TO_GET_TOKEN: 'Failed to get auth token from cookies',
} as const
