/**
 * HTTP Service Layer with Axios Interceptors
 * 
 * Centralized HTTP client using Axios with automatic request/response interceptors.
 * Handles authentication, error management, and standardized API communication.
 * All API calls throughout the application should use this service.
 * 
 * **Features:**
 * - Automatic JWT token injection from cookies
 * - Request/response interceptors
 * - Standardized error handling
 * - 30-second timeout for all requests
 * - Type-safe with generic response wrapper
 * - Singleton pattern for consistent configuration
 * 
 * **Architecture:**
 * - Base Axios instance with interceptors (exported as default)
 * - HttpService class with static methods (GET, POST, PUT, DELETE)
 * - ApiResponse interface for backend response structure
 * 
 * @example
 * ```typescript
 * import { HttpService } from '@_shared';
 * 
 * // GET request
 * const response = await HttpService.get<User[]>('/users');
 * console.log(response.data.payload); // User[]
 * 
 * // POST request
 * const createResponse = await HttpService.post<User>('/users', userData);
 * console.log(createResponse.data.statusCode); // 201
 * ```
 * 
 * @module httpService
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import { getCookies } from 'cookies-next'

/**
 * Base Axios instance configured with interceptors.
 * Used internally by HttpService and can be imported directly for advanced use cases.
 * 
 * **Configuration:**
 * - Base URL: From NEXT_PUBLIC_API_URL env variable or localhost:5000
 * - Timeout: 30 seconds
 * - Default headers: Content-Type application/json
 * - Request interceptor: Auto-injects JWT token
 * - Response interceptor: Handles errors and 401 redirects
 */
const baseInstance: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
	timeout: 30000, // 30 seconds
	headers: {
		'Content-Type': 'application/json',
	},
})

/**
 * Request Interceptor
 * Automatically attaches JWT token from cookies to every request.
 * Runs before each request is sent to the server.
 */
baseInstance.interceptors.request.use((config) => {
	// Get all cookies (including 'at' = auth token)
	const cookies = getCookies()
	const token = cookies['at']

	// If token exists, add it to Authorization header
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})

/**
 * Response Interceptor
 * Handles global error responses and network errors.
 * Can be extended to handle 401 redirects or token refresh.
 */
baseInstance.interceptors.response.use(
	(response) => response, // Pass through successful responses
	(error: AxiosError) => {
		if (error.response) {
			// Server responded with error status (4xx, 5xx)
			// Uncomment below to handle 401 unauthorized globally:
			// const { status } = error.response
			// if (status === 401) {
			// 	deleteCookie('at')
			// 	window.location.reload() // Redirect to login
			// }
		} else {
			// Network error (no response from server)
			console.error('Network Error:', error)
		}
		
		// Reject the promise so calling code can handle errors
		return Promise.reject(error)
	}
)

// Export the base instance for direct use if needed
export default baseInstance

/**
 * Standard API response structure from the backend.
 * All backend endpoints wrap their responses in this format.
 * 
 * @template T - The type of data in the payload
 * 
 * @example
 * ```typescript
 * // Success response
 * {
 *   payload: { id: 1, name: 'John' },
 *   message: 'User retrieved successfully',
 *   statusCode: 200
 * }
 * 
 * // Error response
 * {
 *   payload: null,
 *   message: 'User not found',
 *   statusCode: 404
 * }
 * ```
 */
export interface ApiResponse<T> {
	/** The actual data returned from the API (null on error) */
	payload: T | null
	/** Success or error message from the server */
	message: string | null
	/** HTTP status code (200, 201, 400, 401, 404, 500, etc.) */
	statusCode: number
}

/**
 * HTTP Service Class with static methods for API communication.
 * Provides type-safe wrappers around Axios methods with standardized ApiResponse format.
 * 
 * **Methods:**
 * - GET: Retrieve data
 * - POST: Create new resources or execute actions
 * - PUT: Update existing resources
 * - DELETE: Remove resources
 * - Download: Special POST for file downloads
 * 
 * All methods automatically include JWT token and return ApiResponse<T> format.
 * 
 * @example
 * ```typescript
 * // GET request
 * const users = await HttpService.get<User[]>('/users');
 * if (users.data.statusCode === 200) {
 *   console.log(users.data.payload); // User[]
 * }
 * 
 * // POST request with data
 * const newUser = await HttpService.post<User>('/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * 
 * // PUT request to update
 * const updated = await HttpService.put<User>('/users/123', {
 *   name: 'Jane Doe'
 * });
 * 
 * // DELETE request
 * const deleted = await HttpService.delete<void>('/users/123');
 * ```
 */
export class HttpService {
	/** Private reference to the configured Axios instance */
	private static readonly instance: AxiosInstance = baseInstance

	/**
	 * Performs a GET request to retrieve data from the server.
	 * 
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {AxiosRequestConfig} config - Optional Axios configuration
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
	 * // With query parameters
	 * const filtered = await HttpService.get<Product[]>('/products', {
	 *   params: { category: 'medical', page: 1 }
	 * });
	 * ```
	 */
	public static get<T>(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<ApiResponse<T>>> {
		return HttpService.instance.get<ApiResponse<T>>(url, config)
	}

	/**
	 * Performs a POST request to create resources or trigger actions.
	 * 
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {any} data - Data to send in the request body
	 * @param {AxiosRequestConfig} config - Optional Axios configuration
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 * 
	 * @example
	 * ```typescript
	 * // Create new user
	 * const user = await HttpService.post<User>('/users', {
	 *   name: 'John Doe',
	 *   email: 'john@example.com'
	 * });
	 * 
	 * // Submit search/filter (common pattern)
	 * const results = await HttpService.post<PagedResult<Product>>('/products/search', {
	 *   page: 1,
	 *   pageSize: 10,
	 *   filters: { category: 'medical' }
	 * });
	 * 
	 * // Upload file with FormData
	 * const formData = new FormData();
	 * formData.append('file', file);
	 * const upload = await HttpService.post<UploadResult>('/upload', formData, {
	 *   headers: { 'Content-Type': 'multipart/form-data' }
	 * });
	 * ```
	 */
	public static post<T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse<ApiResponse<T>>> {
		return HttpService.instance.post<ApiResponse<T>>(url, data, config)
	}

	/**
	 * Performs a PUT request to update existing resources.
	 * 
	 * @template T - Expected type of the payload data
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {any} data - Updated data to send
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 * 
	 * @example
	 * ```typescript
	 * // Update user profile
	 * const updated = await HttpService.put<User>('/users/123', {
	 *   name: 'Jane Doe',
	 *   email: 'jane@example.com'
	 * });
	 * 
	 * // Update product
	 * const product = await HttpService.put<Product>('/products/456', {
	 *   price: 99.99,
	 *   stock: 50
	 * });
	 * ```
	 */
	public static put<T>(url: string, data: any): Promise<AxiosResponse<ApiResponse<T>>> {
		return HttpService.instance.put<ApiResponse<T>>(url, data)
	}

	/**
	 * Performs a DELETE request to remove resources.
	 * 
	 * @template T - Expected type of the payload data (usually void)
	 * @param {string} url - Endpoint URL (relative to base URL)
	 * @param {any} data - Optional data to send (rarely used with DELETE)
	 * @returns {Promise<AxiosResponse<ApiResponse<T>>>} Promise resolving to the API response
	 * 
	 * @example
	 * ```typescript
	 * // Delete user
	 * await HttpService.delete<void>('/users/123');
	 * 
	 * // Delete product
	 * await HttpService.delete<void>('/products/456');
	 * 
	 * // Soft delete with data
	 * await HttpService.delete<void>('/orders/789', {
	 *   reason: 'Customer requested cancellation'
	 * });
	 * ```
	 */
	public static delete<T>(url: string, data: any = null): Promise<AxiosResponse<ApiResponse<T>>> {
		return HttpService.instance.delete<ApiResponse<T>>(url, data)
	}

	/**
	 * Performs a POST request for file downloads.
	 * Special method that doesn't expect ApiResponse wrapper.
	 * Used for binary file downloads (PDFs, Excel, images, etc.)
	 * 
	 * @template T - Expected response type (usually Blob or ArrayBuffer)
	 * @param {string} url - Endpoint URL for download
	 * @param {any} data - Optional filter/search parameters
	 * @param {AxiosRequestConfig} config - Axios config (set responseType: 'blob' for files)
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
	 * 
	 * // Create download link
	 * const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
	 * const url = window.URL.createObjectURL(blob);
	 * const link = document.createElement('a');
	 * link.href = url;
	 * link.download = 'report.pdf';
	 * link.click();
	 * 
	 * // Download Excel with search filters
	 * const excelData = await HttpService.download<Blob>(
	 *   '/orders/export',
	 *   { startDate: '2024-01-01', endDate: '2024-12-31' },
	 *   { responseType: 'blob' }
	 * );
	 * ```
	 */
	public static download<T>(url: string, data: any = null, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
		return HttpService.instance.post<T>(url, data, config)
	}
}

