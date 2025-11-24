/**
 * Authentication Service
 * Handles all authentication-related operations including login, signup, logout,
 * and token management using HTTP-only cookies.
 * 
 * **Features:**
 * - JWT token authentication
 * - Cookie-based token storage
 * - Remember me functionality (30 days vs 1 day)
 * - Automatic token validation
 * - Type-safe user data handling
 * 
 * @module AuthService
 */

'use client'

import { getCookie, deleteCookie, setCookie } from 'cookies-next'

import { logger } from '@_core'

import type LoginCredentials from '@_classes/LoginCredentials'
import type { IUser , RegisterModel } from '@_classes/User'


/**
 * API base URL loaded from environment variables.
 * Uses NEXT_PUBLIC_API_URL for consistency (available on both client and server).
 * Falls back to localhost if not specified.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254/api'

/**
 * Standard API response format from the backend.
 * All API endpoints return this structure for consistency.
 * 
 * @template T - The type of the payload data
 */
interface ApiResponse<T> {
	/** The actual data returned from the API, or null if error */
	payload: T | null
	/** Error or success message from the server */
	message: string | null
	/** HTTP status code (200, 201, 400, 401, etc.) */
	statusCode: number
}

/**
 * Verifies if the user is authenticated by checking token validity.
 * Fetches current user data from the server using the stored auth token.
 * Automatically clears invalid tokens.
 * 
 * **Use Cases:**
 * - App initialization (check if user is logged in)
 * - Protected route validation
 * - Token refresh/validation
 * 
 * @returns {Promise<IUser | null>} User object if authenticated, null otherwise
 * 
 * @example
 * ```typescript
 * import { logger } from '@_core';
 * 
 * import { Routes } from '@_features/navigation';
 * 
 * const user = await checkAuthStatus();
 * if (user) {
 *   logger.info('User authenticated', { userId: user.id, userName: user.name });
 * } else {
 *   router.push(Routes.openLoginModal());
 * }
 * ```
 */
export async function checkAuthStatus(): Promise<IUser | null> {
	// Retrieve auth token from cookie (key: 'at' = auth token)
	const token = getCookie('at')

	// No token means user is not authenticated
	if (!token) {
		return null
	}

	try {
		// Call backend to validate token and get user data
		const response = await fetch(`${API_URL}/account`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`, // Include token in Authorization header
			},
		})

		if (!response.ok) {
			// Token is invalid or expired, remove it from cookies
			deleteCookie('at')
			return null
		}

		// Parse response and return user data
		const data: ApiResponse<IUser> = await response.json()
		return data.payload
	} catch (error) {
		// Network error or server unreachable - this is expected when offline
		logger.debug('Auth status check failed', { error })
		return null
	}
}

/**
 * Authenticates a user with email/username and password.
 * On success, stores the JWT token in a cookie and returns user data.
 * Supports "Remember Me" functionality with different token expiration times.
 * 
 * **Token Expiration:**
 * - Remember Me (checked): 30 days
 * - Remember Me (unchecked): 1 day
 * 
 * @param {LoginCredentials} credentials - User's login credentials
 * @param {string} credentials.email - User's email or username
 * @param {string} credentials.password - User's password
 * @param {boolean} credentials.rememberUser - Whether to keep user logged in for 30 days
 * 
 * @returns {Promise<Object>} Object containing success status, user data, and token
 * @returns {boolean} returns.success - True if login succeeded
 * @returns {IUser} returns.user - User object (only if success is true)
 * @returns {string} returns.token - JWT token (only if success is true)
 * @returns {string} returns.message - Error message (only if success is false)
 * 
 * @example
 * ```typescript
 * const result = await login({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   rememberUser: true
 * });
 * 
 * import { logger } from '@_core';
 * 
 * import { Routes } from '@_features/navigation';
 * if (result.success) {
 *   logger.info('User logged in successfully', { userId: result.user.id, userName: result.user.name });
 *   router.push(Routes.Dashboard.location);
 * } else {
 *   notificationService.error(result.message, { component: 'LoginPage', action: 'login' });
 * }
 * ```
 */
export async function login(credentials: LoginCredentials): Promise<{
	success: boolean
	user?: IUser
	token?: string
	message?: string
}> {
	try {
		// Send login request to backend
		const response = await fetch(`${API_URL}/account/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(credentials),
		})

		const data: ApiResponse<string> = await response.json()

		// Check if login was successful (statusCode 200 and payload contains token)
		if (response.ok && data.statusCode === 200 && data.payload && typeof data.payload === 'string') {
			const token = data.payload // Token is the payload itself (string)

			// Store JWT token in cookie first
			setCookie('at', token, {
				// Set expiration based on "Remember Me" checkbox
				maxAge: credentials.rememberUser 
					? 30 * 24 * 60 * 60  // 30 days in seconds
					: 24 * 60 * 60       // 1 day in seconds
			})

			// Fetch user account data using the token
			try {
				const userResponse = await fetch(`${API_URL}/account`, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				})

				if (userResponse.ok) {
					const userData: ApiResponse<IUser> = await userResponse.json()
					
					if (userData.payload) {
						return {
							success: true,
							user: userData.payload,
							token: token,
						}
					}
				}

				// If user fetch fails, still return success with token
				// User data can be fetched later via checkAuthStatus
				logger.warn('Login successful but user data fetch failed', {
					status: userResponse.status,
					context: 'login_user_fetch',
				})
				
				return {
					success: true,
					token: token,
					// User will be fetched on next checkAuthStatus call
				}
			} catch (userFetchError) {
				// Network error fetching user, but login was successful
				logger.warn('Login successful but user data fetch error', {
					error: userFetchError,
					context: 'login_user_fetch',
				})
				
				return {
					success: true,
					token: token,
					// User will be fetched on next checkAuthStatus call
				}
			}
		}

		// Login failed (invalid credentials, account locked, etc.)
		return {
			success: false,
			message: data.message || 'Login failed. Please check your credentials.',
		}
	} catch (error) {
		// Network error (server down, no internet, etc.)
		logger.error('Login failed', { error, context: 'network_error' })
		return {
			success: false,
			message: 'Network error occurred. Please check your connection and try again.',
		}
	}
}

/**
 * Registers a new user account in the system.
 * Does NOT automatically log the user in - they must login after signup.
 * 
 * @param {RegisterModel} form - Registration form data
 * @param {string} form.username - Desired username
 * @param {string} form.email - User's email address
 * @param {string} form.password - User's password
 * @param {Name} form.name - User's full name (first, middle, last)
 * @param {Date} form.dateOfBirth - User's date of birth (optional)
 * 
 * @returns {Promise<Object>} Object containing success status and user data or error message
 * @returns {boolean} returns.success - True if signup succeeded
 * @returns {IUser} returns.user - Created user object (only if success is true)
 * @returns {string} returns.message - Error message (only if success is false)
 * 
 * @example
 * ```typescript
 * const result = await signup({
 *   username: 'johndoe',
 *   email: 'john@example.com',
 *   password: 'SecurePass123!',
 *   name: new Name({ first: 'John', last: 'Doe' }),
 *   dateOfBirth: new Date('1990-01-15')
 * });
 * 
 * import { Routes } from '@_features/navigation';
 * 
 * if (result.success) {
 *   notificationService.success('Account created! Please log in.', { component: 'SignupPage', action: 'signup' });
 *   router.push(Routes.openLoginModal());
 * } else {
 *   notificationService.error(result.message, { component: 'SignupPage', action: 'signup' });
 * }
 * ```
 */
export async function signup(form: RegisterModel): Promise<{
	success: boolean
	user?: IUser
	message?: string
}> {
	try {
		// Send signup request to backend
		const response = await fetch(`${API_URL}/account/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(form),
		})

		const data: ApiResponse<IUser> = await response.json()

		if (response.ok && data.payload) {
			// Account created successfully
			return {
				success: true,
				user: data.payload,
			}
		}

		// Signup failed (username taken, invalid email, validation error, etc.)
		return {
			success: false,
			message: data.message || 'Signup failed',
		}
	} catch (error) {
		// Network error (server down, no internet, etc.)
		logger.error('Signup failed', { error, context: 'network_error' })
		return {
			success: false,
			message: 'Network error occurred',
		}
	}
}

/**
 * Logs out the current user by removing the authentication token from cookies.
 * This immediately invalidates the user's session on the client side.
 * 
 * **Note:** This does NOT invalidate the token on the server (stateless JWT).
 * The token will remain valid until it expires naturally.
 * 
 * @example
 * ```typescript
 * import { Routes } from '@_features/navigation';
 * 
 * // In a logout button handler
 * const handleLogout = () => {
 *   logout();
 *   router.push(Routes.openLoginModal());
 *   notificationService.success('Logged out successfully', { component: 'LogoutButton', action: 'logout' });
 * };
 * ```
 */
export function logout(): void {
	deleteCookie('at') // Remove auth token cookie
}

/**
 * Retrieves the current authentication token from cookies.
 * Used by HTTP interceptors to add Authorization header to API requests.
 * 
 * @returns {string | undefined} JWT token string, or undefined if not logged in
 * 
 * @example
 * ```typescript
 * const token = getAuthToken();
 * if (token) {
 *   // Include in API request header
 *   headers.Authorization = `Bearer ${token}`;
 * }
 * ```
 */
export function getAuthToken(): string | undefined {
	return getCookie('at')?.toString()
}


