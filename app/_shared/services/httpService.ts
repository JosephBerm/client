/**
 * Unified HTTP Service Layer - Works in Both Server and Client Contexts
 *
 * Modern, unified HTTP client that automatically adapts to runtime environment.
 * Uses native fetch API for optimal performance and compatibility.
 *
 * **Features:**
 * - Automatic runtime detection (server vs client)
 * - Automatic JWT token injection from cookies (adapts to environment)
 * - Standardized error handling
 * - Configurable timeout
 * - Type-safe with generic response wrapper
 * - AxiosResponse-compatible interface for backward compatibility
 * - Works in Server Components, Client Components, Route Handlers, and API Routes
 *
 * **Architecture:**
 * - Uses native fetch API (works everywhere)
 * - Runtime environment detection (typeof window)
 * - Dynamic cookie handling (cookies() for server, getCookies() for client)
 * - Consistent ApiResponse<T> format
 * - AxiosResponse-compatible return type
 * - DRY: Shared error handling, header conversion, and response parsing
 *
 * **Usage:**
 * ```typescript
 * import { HttpService } from '@_shared';
 *
 * // Works in Server Components
 * export default async function ServerPage() {
 *   const response = await HttpService.get<Product>('/products/123');
 *   const product = response.data.payload;
 * }
 *
 * // Works in Client Components
 * 'use client'
 * export default function ClientPage() {
 *   useEffect(() => {
 *     HttpService.get<Product[]>('/products').then(response => {
 *       setProducts(response.data.payload);
 *     });
 *   }, []);
 * }
 * ```
 *
 * @module httpService
 */

import { logger } from '@_core'

import {
	AUTH_COOKIE_NAME,
	AUTH_HEADER_PREFIX,
	CONTENT_TYPE,
	DEFAULT_API_BASE_URL,
	ERROR_MESSAGES,
	HTTP_STATUS,
	REQUEST_TIMEOUT_MS,
} from './httpService.constants'

// Import ApiResponse from the canonical location for internal use
import type { ApiResponse } from './api.types'

// Re-export for backward compatibility with imports from httpService
export type { ApiResponse } from './api.types'

/**
 * AxiosResponse-compatible interface for backward compatibility.
 * Allows existing code to work without changes.
 */
export interface AxiosResponse<T> {
	data: T
	status: number
	statusText: string
	headers: Headers
	config?: RequestInit
}

/**
 * Runtime environment detection
 */
const isServer = typeof window === 'undefined'

/**
 * Gets the authorization token from cookies (adapts to runtime environment)
 *
 * @returns Promise resolving to the auth token or null if not found
 */
async function getAuthToken(): Promise<string | null> {
	try {
		if (isServer) {
			// Server-side: use Next.js cookies() from next/headers
			const { cookies } = await import('next/headers')
			const cookieStore = await cookies()
			return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null
		} else {
			// Client-side: use cookies-next getCookies()
			const { getCookies } = await import('cookies-next')
			const cookies = getCookies()
			return cookies[AUTH_COOKIE_NAME] ?? null
		}
	} catch (error) {
		logger.warn(ERROR_MESSAGES.FAILED_TO_GET_TOKEN, { error })
		return null
	}
}

/**
 * Converts HeadersInit to a plain object, excluding specified headers
 *
 * @param headers - Headers to convert
 * @param excludeHeaders - Array of header names to exclude (case-insensitive)
 * @returns Plain object with header key-value pairs
 */
function headersToObject(
	headers: HeadersInit,
	excludeHeaders: string[] = []
): Record<string, string> {
	const excludeLower = excludeHeaders.map(h => h.toLowerCase())
	const result: Record<string, string> = {}

	if (headers instanceof Headers) {
		headers.forEach((value, key) => {
			if (!excludeLower.includes(key.toLowerCase())) {
				result[key] = value
			}
		})
	} else if (Array.isArray(headers)) {
		headers.forEach(([key, value]) => {
			if (!excludeLower.includes(key.toLowerCase())) {
				result[key] = value
			}
		})
	} else {
		Object.entries(headers).forEach(([key, value]) => {
			if (!excludeLower.includes(key.toLowerCase())) {
				result[key] = value
			}
		})
	}

	return result
}

/**
 * Creates headers for the request with authorization token
 *
 * @param customHeaders - Additional headers to include
 * @param excludeContentType - Whether to exclude Content-Type header (for FormData)
 * @returns Promise resolving to HeadersInit
 */
async function getHeaders(
	customHeaders: Record<string, string> = {},
	excludeContentType = false
): Promise<HeadersInit> {
	const token = await getAuthToken()
	const headers: Record<string, string> = {
		...customHeaders,
	}

	// Add Content-Type only if not excluded (e.g., for FormData)
	if (!excludeContentType) {
		headers['Content-Type'] = CONTENT_TYPE.JSON
	}

	// Add Authorization header if token exists
	if (token) {
		headers['Authorization'] = `${AUTH_HEADER_PREFIX}${token}`
	}

	return headers
}

/**
 * Makes a fetch request with timeout and error handling
 *
 * @param url - Full URL to fetch
 * @param options - Fetch options
 * @returns Promise resolving to Response
 * @throws Error if request times out or fails
 */
async function fetchWithTimeout(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		})
		clearTimeout(timeoutId)
		return response
	} catch (error) {
		clearTimeout(timeoutId)
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error(ERROR_MESSAGES.REQUEST_TIMEOUT)
		}
		throw error
	}
}

/**
 * Parses JSON response with error handling
 *
 * @param response - Fetch Response object
 * @returns Promise resolving to parsed JSON or error ApiResponse
 */
async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
	try {
		return await response.json()
	} catch {
		// If JSON parsing fails, return error response
		return {
			payload: null,
			message: `HTTP ${response.status}: ${response.statusText}`,
			statusCode: response.status,
		}
	}
}

/**
 * Creates an error ApiResponse
 *
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @returns Error ApiResponse
 */
function createErrorResponse<T>(
	statusCode: number,
	message: string
): ApiResponse<T> {
	return {
		payload: null,
		message,
		statusCode,
	}
}

/**
 * Converts fetch Response to AxiosResponse-compatible format
 *
 * @param response - Fetch Response object
 * @param data - Response data
 * @returns AxiosResponse-compatible object
 */
function toAxiosResponse<T>(response: Response, data: T): AxiosResponse<T> {
	return {
		data,
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
		config: {},
	}
}

/**
 * Handles HTTP request with standardized error handling
 *
 * MAANG-Level Token Management:
 * - Automatic token refresh on 401 (expired token)
 * - Retry original request after successful refresh
 * - Graceful fallback to logout on refresh failure
 *
 * @param url - Full URL to request
 * @param method - HTTP method
 * @param options - Fetch options
 * @param body - Request body (optional)
 * @param isRetry - Whether this is a retry after token refresh
 * @returns Promise resolving to AxiosResponse<ApiResponse<T>>
 */
async function handleRequest<T>(
	url: string,
	method: string,
	options: RequestInit,
	body?: BodyInit,
	isRetry: boolean = false
): Promise<AxiosResponse<ApiResponse<T>>> {
	try {
		const response = await fetchWithTimeout(url, {
			...options,
			method,
			body,
			// IMPORTANT: Required for HttpOnly refresh token cookie-based sessions (auth best practice).
			// Without this, browsers will not store Set-Cookie on cross-origin requests (e.g., localhost:3000 -> localhost:5254).
			credentials: options.credentials ?? 'include',
		})

		if (!response.ok) {
			// =====================================================================
			// AUTOMATIC TOKEN REFRESH (MAANG-Level Security)
			// =====================================================================
			// If 401 and not already a retry, try to refresh token and retry request
			if (response.status === HTTP_STATUS.UNAUTHORIZED && !isRetry) {
				// Check if this is a client-side request (can use tokenService)
				if (typeof window !== 'undefined') {
					try {
						// Dynamic import to avoid SSR issues
						const { refreshAccessToken } = await import('./tokenService')
						const newToken = await refreshAccessToken()

						if (newToken) {
							// Update headers with new token and retry
							const newHeaders = new Headers(options.headers)
							newHeaders.set('Authorization', `Bearer ${newToken}`)

							return handleRequest<T>(
								url,
								method,
								{ ...options, headers: newHeaders },
								body,
								true // Mark as retry to prevent infinite loop
							)
						}
					} catch (refreshError) {
						// Token refresh failed - log and continue to normal 401 handling
						logger.debug('Token refresh failed during request retry', {
							component: 'HttpService',
							action: 'handleRequest',
							error: refreshError instanceof Error ? refreshError.message : 'Unknown error',
						})
					}
				}
			}

			// =====================================================================
			// ACCOUNT STATUS CHECK (MAANG-Level Security)
			// =====================================================================
			// Check if this 401 is due to account status (suspended/locked/archived)
			// If so, dispatch event for forced logout
			if (response.status === HTTP_STATUS.UNAUTHORIZED) {
				// Dynamic import to avoid circular dependency and SSR issues
				try {
					const { checkAndHandleAccountStatusError } = await import('./accountStatusHandler')
					checkAndHandleAccountStatusError(response)
				} catch (statusCheckError) {
					// Log import/SSR errors at debug level (expected in SSR context)
					logger.debug('Account status check skipped', {
						component: 'HttpService',
						action: 'handleRequest',
						reason: statusCheckError instanceof Error ? statusCheckError.message : 'SSR context',
					})
				}
			}

			const errorData = await parseJsonResponse<T>(response)
			return toAxiosResponse(response, errorData)
		}

		const responseData = await parseJsonResponse<T>(response)
		return toAxiosResponse(response, responseData)
	} catch (error) {
		logger.error(`HttpService.${method.toLowerCase()} failed`, {
			error,
			url,
			component: 'HttpService',
		})

		// Return error response in ApiResponse format
		const errorResponse = createErrorResponse<T>(
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
			error instanceof Error ? error.message : ERROR_MESSAGES.REQUEST_FAILED
		)

		return toAxiosResponse(
			new Response(null, {
				status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
				statusText: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			}),
			errorResponse
		)
	}
}

/**
 * Unified HTTP Service Class
 *
 * Provides type-safe wrappers around native fetch API with standardized ApiResponse format.
 * Automatically adapts to server or client runtime environment.
 *
 * **Methods:**
 * - GET: Retrieve data
 * - POST: Create new resources or execute actions
 * - PUT: Update existing resources
 * - DELETE: Remove resources
 * - Download: Special POST for file downloads
 *
 * All methods automatically include JWT token and return AxiosResponse<ApiResponse<T>> format
 * for backward compatibility with existing code.
 *
 * @example
 * ```typescript
 * // GET request
 * const response = await HttpService.get<Product[]>('/products');
 * if (response.data.statusCode === 200) {
 *   const products = response.data.payload; // Product[]
 * }
 *
 * // POST request
 * const newProduct = await HttpService.post<Product>('/products', {
 *   name: 'Surgical Mask',
 *   price: 9.99
 * });
 *
 * // PUT request
 * const updated = await HttpService.put<Product>('/products/123', {
 *   name: 'Updated Name'
 * });
 *
 * // DELETE request
 * await HttpService.delete<void>('/products/123');
 * ```
 */
export class HttpService {
	private static readonly baseURL = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL

	/**
	 * Performs a GET request to retrieve data from the server.
	 *
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {RequestInit} options - Optional fetch options (for query params, use URLSearchParams in url)
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 *
	 * @example
	 * ```typescript
	 * // Get all products
	 * const products = await HttpService.get<Product[]>('/products');
	 *
	 * // Get single product by ID
	 * const product = await HttpService.get<Product>('/products/123');
	 *
	 * // With query parameters (build URL manually)
	 * const url = '/products?category=medical&page=1';
	 * const filtered = await HttpService.get<Product[]>(url);
	 * ```
	 */
	public static async get<T>(
		url: string,
		options: RequestInit = {}
	): Promise<AxiosResponse<ApiResponse<T>>> {
		const fullUrl = `${HttpService.baseURL}${url}`
		const headers = await getHeaders(options.headers as Record<string, string>)

		return handleRequest<T>(fullUrl, 'GET', { ...options, headers })
	}

	/**
	 * Performs a POST request to create resources or trigger actions.
	 *
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {any} data - Data to send in the request body
	 * @param {RequestInit} options - Optional fetch options
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 *
	 * @example
	 * ```typescript
	 * // Create new product
	 * const product = await HttpService.post<Product>('/products', {
	 *   name: 'Surgical Mask',
	 *   price: 9.99
	 * });
	 *
	 * // Submit search/filter
	 * const results = await HttpService.post<PagedResult<Product>>('/products/search', {
	 *   page: 1,
	 *   pageSize: 10,
	 *   filters: { category: 'medical' }
	 * });
	 *
	 * // Upload file with FormData
	 * const formData = new FormData();
	 * formData.append('file', file);
	 * const upload = await HttpService.post<UploadResult>('/upload', formData);
	 * ```
	 */
	public static async post<T>(
		url: string,
		data: unknown,
		options: RequestInit = {}
	): Promise<AxiosResponse<ApiResponse<T>>> {
		const fullUrl = `${HttpService.baseURL}${url}`
		const customHeaders = (options.headers as Record<string, string>) || {}

		// Don't set Content-Type for FormData (browser will set it with boundary)
		const isFormData = data instanceof FormData

		// Get headers excluding Content-Type for FormData
		const baseHeaders = await getHeaders({}, isFormData)
		const headersObj = headersToObject(baseHeaders, isFormData ? ['Content-Type'] : [])

		// Merge with custom headers
		const headers: HeadersInit = { ...headersObj, ...customHeaders }

		const body = isFormData ? data : JSON.stringify(data)

		return handleRequest<T>(fullUrl, 'POST', { ...options, headers }, body)
	}

	/**
	 * Performs a PUT request to update existing resources.
	 *
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {any} data - Updated data to send
	 * @param {RequestInit} options - Optional fetch options
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 *
	 * @example
	 * ```typescript
	 * // Update product
	 * const updated = await HttpService.put<Product>('/products/123', {
	 *   name: 'Updated Name',
	 *   price: 19.99
	 * });
	 * ```
	 */
	public static async put<T>(
		url: string,
		data: unknown,
		options: RequestInit = {}
	): Promise<AxiosResponse<ApiResponse<T>>> {
		const fullUrl = `${HttpService.baseURL}${url}`
		const headers = await getHeaders(options.headers as Record<string, string>)
		const body = JSON.stringify(data)

		return handleRequest<T>(fullUrl, 'PUT', { ...options, headers }, body)
	}

	/**
	 * Performs a DELETE request to remove resources.
	 *
	 * @template T - Expected type of the payload data (usually void)
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {any} data - Optional data to send (rarely used with DELETE)
	 * @param {RequestInit} options - Optional fetch options
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 *
	 * @example
	 * ```typescript
	 * // Delete product
	 * await HttpService.delete<void>('/products/123');
	 *
	 * // Soft delete with data
	 * await HttpService.delete<void>('/orders/789', {
	 *   reason: 'Customer requested cancellation'
	 * });
	 * ```
	 */
	public static async delete<T>(
		url: string,
		data: unknown = null,
		options: RequestInit = {}
	): Promise<AxiosResponse<ApiResponse<T>>> {
		const fullUrl = `${HttpService.baseURL}${url}`
		const headers = await getHeaders(options.headers as Record<string, string>)

		const requestOptions: RequestInit = {
			...options,
			headers,
		}

		if (data) {
			requestOptions.body = JSON.stringify(data)
		}

		return handleRequest<T>(fullUrl, 'DELETE', requestOptions)
	}

	/**
	 * Performs a POST request for file downloads.
	 * Special method that doesn't expect ApiResponse wrapper.
	 * Used for binary file downloads (PDFs, Excel, images, etc.)
	 *
	 * @template T - Expected response type (usually Blob or ArrayBuffer)
	 * @param {string} url - Endpoint URL for download
	 * @param {any} data - Optional filter/search parameters
	 * @param {RequestInit & { responseType?: 'blob' | 'arraybuffer' }} options - Fetch config with responseType
	 * @returns {Promise<AxiosResponse<T>>} Promise resolving to the file data
	 *
	 * @example
	 * ```typescript
	 * // Download PDF report
	 * const pdfResponse = await HttpService.download<Blob>(
	 *   '/reports/download',
	 *   { reportId: 123 },
	 *   { responseType: 'blob' }
	 * );
	 * const blob = pdfResponse.data; // Already a Blob
	 *
	 * // Create download link
	 * const url = window.URL.createObjectURL(blob);
	 * const link = document.createElement('a');
	 * link.href = url;
	 * link.download = 'report.pdf';
	 * link.click();
	 * ```
	 */
	public static async download<T>(
		url: string,
		data: unknown = null,
		options: RequestInit & { responseType?: 'blob' | 'arraybuffer' } = {}
	): Promise<AxiosResponse<T>> {
		const fullUrl = `${HttpService.baseURL}${url}`
		const { responseType = 'blob', ...fetchOptions } = options
		const headers = await getHeaders(fetchOptions.headers as Record<string, string>)

		try {
			const response = await fetchWithTimeout(fullUrl, {
				...fetchOptions,
				method: 'POST',
				headers,
				body: data ? JSON.stringify(data) : undefined,
			})

			// Handle different response types
			const responseData =
				responseType === 'arraybuffer'
					? ((await response.arrayBuffer()) as T)
					: ((await response.blob()) as T)

			return toAxiosResponse(response, responseData)
		} catch (error) {
			logger.error('HttpService.download failed', {
				error,
				url: fullUrl,
				component: 'HttpService',
			})

			throw error
		}
	}

	// ============================================================================
	// PUBLIC (NO-AUTH) METHODS
	// ============================================================================
	//
	// These methods do NOT access cookies() or any runtime-only APIs.
	// They can be used with Next.js 16 "use cache" directive for maximum performance.
	//
	// Use these for:
	// - Public product catalog browsing
	// - Category listings
	// - Product details (non-sensitive)
	// - Any endpoint that doesn't require authentication
	//
	// Benefits:
	// - Compatible with "use cache" (no cookies() access)
	// - Shared cache across all users
	// - Faster TTFB (Time to First Byte)
	// - Better SEO performance
	// - Lower server load
	// ============================================================================

	/**
	 * Performs a GET request WITHOUT authentication.
	 * Safe to use with "use cache" directive.
	 *
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {RequestInit} options - Optional fetch options
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 *
	 * @example
	 * ```typescript
	 * // Inside a "use cache" scope
	 * async function getCachedCategories() {
	 *   'use cache'
	 *   return HttpService.getPublic<Category[]>('/products/categories');
	 * }
	 * ```
	 */
	public static async getPublic<T>(
		url: string,
		options: RequestInit = {}
	): Promise<AxiosResponse<ApiResponse<T>>> {
		const fullUrl = `${HttpService.baseURL}${url}`
		const headers: HeadersInit = {
			'Content-Type': CONTENT_TYPE.JSON,
			...(options.headers as Record<string, string>),
		}

		return handleRequest<T>(fullUrl, 'GET', { ...options, headers })
	}

	/**
	 * Performs a POST request WITHOUT authentication.
	 * Safe to use with "use cache" directive.
	 *
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {any} data - Data to send in the request body
	 * @param {RequestInit} options - Optional fetch options
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 *
	 * @example
	 * ```typescript
	 * // Inside a "use cache" scope
	 * async function searchCachedProducts(filter: SearchFilter) {
	 *   'use cache'
	 *   cacheTag('products')
	 *   cacheLife('minutes')
	 *   return HttpService.postPublic<Product[]>('/products/search/public', filter);
	 * }
	 * ```
	 */
	public static async postPublic<T>(
		url: string,
		data: unknown,
		options: RequestInit = {}
	): Promise<AxiosResponse<ApiResponse<T>>> {
		const fullUrl = `${HttpService.baseURL}${url}`
		const customHeaders = (options.headers as Record<string, string>) || {}

		// Don't set Content-Type for FormData (browser will set it with boundary)
		const isFormData = data instanceof FormData

		const headers: HeadersInit = isFormData
			? { ...customHeaders }
			: { 'Content-Type': CONTENT_TYPE.JSON, ...customHeaders }

		const body = isFormData ? data : JSON.stringify(data)

		return handleRequest<T>(fullUrl, 'POST', { ...options, headers }, body)
	}
}

// Export default for backward compatibility (if needed)
export default HttpService
