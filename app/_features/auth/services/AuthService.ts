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
 * **Architecture:**
 * - Uses HttpService for API calls (DRY principle)
 * - Uses cookies-next for client-side cookie management
 * - All token operations happen client-side (marked 'use client')
 * 
 * @module AuthService
 */

'use client'

import { getCookie, deleteCookie, setCookie } from 'cookies-next'

import { logger } from '@_core'

import type LoginCredentials from '@_classes/LoginCredentials'
import type { IUser, RegisterModel } from '@_classes/User'

import { HttpService, type ApiResponse, AUTH_COOKIE_NAME } from '@_shared'

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
	// Retrieve auth token from cookie
	const token = getCookie(AUTH_COOKIE_NAME)

	// No token means user is not authenticated
	if (!token) {
		return null
	}

	try {
		// Call backend to validate token and get user data
		// HttpService automatically includes the auth token from cookies
		const response = await HttpService.get<IUser>('/account')

		if (response.status !== 200 || !response.data.payload) {
			// Token is invalid or expired, remove it from cookies
			deleteCookie(AUTH_COOKIE_NAME)
			return null
		}

		return response.data.payload
	} catch (error) {
		// Network error or server unreachable - this is expected when offline
		logger.debug('Auth status check failed', { error })
		return null
	}
}

/** Token expiration durations */
const TOKEN_EXPIRY = {
	REMEMBER_ME: 30 * 24 * 60 * 60, // 30 days in seconds
	DEFAULT: 24 * 60 * 60,          // 1 day in seconds
} as const

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
		// Send login request using HttpService (public endpoint, no auth needed)
		const response = await HttpService.postPublic<string>('/account/login', credentials)

		// Check if login was successful (statusCode 200 and payload contains token)
		if (response.status === 200 && response.data.statusCode === 200 && response.data.payload && typeof response.data.payload === 'string') {
			const token = response.data.payload // Token is the payload itself (string)

			// Store JWT token in cookie
			setCookie(AUTH_COOKIE_NAME, token, {
				maxAge: credentials.rememberUser 
					? TOKEN_EXPIRY.REMEMBER_ME
					: TOKEN_EXPIRY.DEFAULT,
			})

			// Fetch user account data using the new token
			// Now HttpService will automatically include the token we just set
			try {
				const userResponse = await HttpService.get<IUser>('/account')

				if (userResponse.status === 200 && userResponse.data.payload) {
					return {
						success: true,
						user: userResponse.data.payload,
						token: token,
					}
				}

				// If user fetch fails, still return success with token
				logger.warn('Login successful but user data fetch failed', {
					status: userResponse.status,
					context: 'login_user_fetch',
				})
				
				return {
					success: true,
					token: token,
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
				}
			}
		}

		// Login failed (invalid credentials, account locked, etc.)
		return {
			success: false,
			message: response.data.message ?? 'Login failed. Please check your credentials.',
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
		// Send signup request using HttpService (public endpoint, no auth needed)
		const response = await HttpService.postPublic<IUser>('/account/signup', form)

		if (response.status === 200 && response.data.payload) {
			// Account created successfully
			return {
				success: true,
				user: response.data.payload,
			}
		}

		// Signup failed (username taken, invalid email, validation error, etc.)
		return {
			success: false,
			message: response.data.message ?? 'Signup failed',
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
	deleteCookie(AUTH_COOKIE_NAME)
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
	return getCookie(AUTH_COOKIE_NAME)?.toString()
}


