/**
 * Authentication Service
 * 
 * MAANG-Level JWT Token Management:
 * - Short-lived access tokens (15 min)
 * - Long-lived refresh tokens (7-30 days) with automatic rotation
 * - Silent token refresh on expiration
 * - Automatic logout on refresh failure
 * - Secure cookie-based token storage
 * 
 * Architecture:
 * - Uses HttpService for ALL API calls (DRY principle)
 * - Uses tokenService for token management
 * - All token operations happen client-side (marked 'use client')
 * 
 * @module AuthService
 */

'use client'

import { getCookie, deleteCookie } from 'cookies-next'

import { logger } from '@_core'

import { 
	HttpService, 
	AUTH_COOKIE_NAME,
	storeTokens,
	clearTokens,
	getRefreshToken,
	startAutoRefresh,
	stopAutoRefresh,
} from '@_shared'

import type LoginCredentials from '@_classes/LoginCredentials'
import type { IUser, RegisterModel } from '@_classes/User'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Token pair response from backend
 */
interface TokenPairResponse {
	accessToken: string
	refreshToken: string
	accessTokenExpires: string
	refreshTokenExpires: string
	requiresPasswordChange: boolean
	message?: string
}

/**
 * Login result
 */
export interface LoginResult {
	success: boolean
	user?: IUser
	accessToken?: string
	requiresPasswordChange?: boolean
	message?: string
}

/**
 * Signup result
 */
export interface SignupResult {
	success: boolean
	user?: IUser
	accessToken?: string
	message?: string
}

// =========================================================================
// AUTH STATUS
// =========================================================================

/**
 * Verifies if the user is authenticated by checking token validity.
 * Fetches current user data from the server using the stored auth token.
 * 
 * @returns User object if authenticated, null otherwise
 */
export async function checkAuthStatus(): Promise<IUser | null> {
	const token = getCookie(AUTH_COOKIE_NAME)

	if (!token) {
		return null
	}

	try {
		const response = await HttpService.get<IUser>('/account')

		if (response.status !== 200 || !response.data.payload) {
			clearTokens()
			return null
		}

		return response.data.payload
	} catch (error) {
		logger.debug('Auth status check failed', {
			component: 'AuthService',
			action: 'checkAuthStatus',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
		return null
	}
}

// =========================================================================
// LOGIN
// =========================================================================

/**
 * Authenticates a user with email/username and password.
 * Returns token pair (access + refresh) with automatic rotation.
 * 
 * MAANG-Level Security:
 * - Short-lived access tokens (15 min)
 * - Long-lived refresh tokens (7-30 days)
 * - Token rotation on each refresh
 * 
 * @param credentials - User's login credentials
 * @returns Login result with user data and tokens
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
	try {
		// Use HttpService.postPublic for public endpoints (DRY principle)
		const response = await HttpService.postPublic<TokenPairResponse>('/account/login', {
			username: credentials.username, // Can be email or username
			password: credentials.password,
			rememberUser: credentials.rememberUser,
		})

		// Check for error response
		if (response.status !== 200 || !response.data.payload) {
			const errorMessage = response.data.message ?? 'Login failed'
			
			logger.warn('Login failed', {
				component: 'AuthService',
				action: 'login',
				status: response.status,
				message: errorMessage,
			})
			
			return {
				success: false,
				message: translateLoginError(errorMessage),
			}
		}

		const tokenData = response.data.payload

		// Store tokens using token service
		storeTokens({
			accessToken: tokenData.accessToken,
			refreshToken: tokenData.refreshToken,
			accessTokenExpires: tokenData.accessTokenExpires,
			refreshTokenExpires: tokenData.refreshTokenExpires,
		})

		// Start automatic token refresh
		startAutoRefresh()

		// Check if password change is required
		if (tokenData.requiresPasswordChange) {
			logger.info('Login successful - password change required', {
				component: 'AuthService',
				action: 'login',
			})
			return {
				success: true,
				accessToken: tokenData.accessToken,
				requiresPasswordChange: true,
				message: 'Password change required',
			}
		}

		// Fetch user data
		try {
			const userResponse = await HttpService.get<IUser>('/account')
			
			if (userResponse.status === 200 && userResponse.data.payload) {
				logger.info('Login successful', {
					component: 'AuthService',
					action: 'login',
					userId: userResponse.data.payload.id ?? undefined,
				})
				return {
					success: true,
					user: userResponse.data.payload,
					accessToken: tokenData.accessToken,
				}
			}
		} catch (userError) {
			logger.warn('Login successful but user fetch failed', {
				component: 'AuthService',
				action: 'login',
				error: userError instanceof Error ? userError.message : 'Unknown error',
			})
		}

		// Return success even if user fetch failed
		return {
			success: true,
			accessToken: tokenData.accessToken,
		}
	} catch (error) {
		logger.error('Login failed - network error', {
			component: 'AuthService',
			action: 'login',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
		return {
			success: false,
			message: 'Network error occurred. Please check your connection.',
		}
	}
}

/**
 * Translates backend error codes to user-friendly messages
 */
function translateLoginError(errorCode: string): string {
	// Using a switch for better type safety and linting compliance
	switch (errorCode) {
		case 'invalid_credentials':
			return 'Invalid email or password'
		case 'account_locked':
			return 'Account is locked. Please try again later or contact support.'
		case 'account_suspended':
			return 'Account is suspended. Please contact support.'
		case 'account_not_found':
			return 'Account not found'
		case 'email_verification_required':
			return 'Please verify your email address before logging in.'
		default:
			return errorCode
	}
}

// =========================================================================
// SIGNUP
// =========================================================================

/**
 * Registers a new user account.
 * On success, automatically logs in the user and returns token pair.
 * 
 * @param form - Registration form data
 * @returns Signup result with user data and tokens
 */
export async function signup(form: RegisterModel): Promise<SignupResult> {
	try {
		// Use HttpService.postPublic for public endpoints (DRY principle)
		const response = await HttpService.postPublic<TokenPairResponse>('/account/signup', form)

		// Check for error response
		if (response.status !== 200 || !response.data.payload) {
			return {
				success: false,
				message: response.data.message ?? 'Signup failed',
			}
		}

		const tokenData = response.data.payload

		// Store tokens
		storeTokens({
			accessToken: tokenData.accessToken,
			refreshToken: tokenData.refreshToken,
			accessTokenExpires: tokenData.accessTokenExpires,
			refreshTokenExpires: tokenData.refreshTokenExpires,
		})

		// Start automatic token refresh
		startAutoRefresh()

		// Fetch user data
		try {
			const userResponse = await HttpService.get<IUser>('/account')
			
			if (userResponse.status === 200 && userResponse.data.payload) {
				logger.info('Signup successful', {
					component: 'AuthService',
					action: 'signup',
					userId: userResponse.data.payload.id ?? undefined,
				})
				return {
					success: true,
					user: userResponse.data.payload,
					accessToken: tokenData.accessToken,
				}
			}
		} catch (userError) {
			logger.warn('Signup successful but user fetch failed', {
				component: 'AuthService',
				action: 'signup',
				error: userError instanceof Error ? userError.message : 'Unknown error',
			})
		}

		return {
			success: true,
			accessToken: tokenData.accessToken,
		}
	} catch (error) {
		logger.error('Signup failed - network error', {
			component: 'AuthService',
			action: 'signup',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
		return {
			success: false,
			message: 'Network error occurred. Please try again.',
		}
	}
}

// =========================================================================
// LOGOUT
// =========================================================================

/**
 * Logs out the user by revoking tokens and clearing local storage.
 * 
 * MAANG-Level Logout:
 * - Revokes refresh token on server (prevents session restoration)
 * - Clears all tokens from cookies
 * - Stops automatic token refresh
 * 
 * Note: Server revocation is fire-and-forget (non-blocking).
 * User logout happens immediately regardless of server response.
 * 
 * @param revokeOnServer - Whether to call server to revoke refresh token (default: true)
 */
export function logout(revokeOnServer: boolean = true): void {
	// Stop auto-refresh first
	stopAutoRefresh()

	// Try to revoke refresh token on server (best effort)
	if (revokeOnServer) {
		const refreshToken = getRefreshToken()
		
		if (refreshToken) {
			// Use HttpService.postPublic for server revocation (best effort, don't await)
			// We don't block on this - user logout should be immediate
			HttpService.postPublic('/auth/logout', { refreshToken })
				.then(() => {
					logger.debug('Server token revocation successful', {
						component: 'AuthService',
						action: 'logout',
					})
				})
				.catch((fetchError) => {
					// Log but don't block - server revocation is best effort
					logger.debug('Server token revocation failed (best effort)', {
						component: 'AuthService',
						action: 'logout',
						error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
					})
				})
		}
	}

	// Clear all tokens locally (this happens immediately)
	clearTokens()
	deleteCookie(AUTH_COOKIE_NAME)
	
	logger.info('User logged out', {
		component: 'AuthService',
		action: 'logout',
	})
}

// =========================================================================
// TOKEN HELPERS
// =========================================================================

/**
 * Gets the current authentication token from cookies.
 * 
 * @returns JWT token string, or undefined if not logged in
 */
export function getAuthToken(): string | undefined {
	return getCookie(AUTH_COOKIE_NAME)?.toString()
}
