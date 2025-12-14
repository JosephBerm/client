/**
 * AuthRedirectService - Centralized Post-Authentication Redirect Management
 * 
 * MAANG-level service for managing where users go after successful authentication.
 * Follows industry best practices from Google, Stripe, and Vercel.
 * 
 * **Business Logic:**
 * 1. **Default Behavior**: Always redirect to Dashboard after login
 * 2. **Return URL**: If user was trying to access a protected page, redirect there
 * 3. **Intent-Based**: If user clicked an auth-required action (e.g., "Chat Now"),
 *    redirect back to that context/action after login
 * 
 * **Priority Order (highest to lowest):**
 * 1. Intent (stored action that triggered login, e.g., "open_chat")
 * 2. Return URL (protected page user was trying to access)
 * 3. Default (Dashboard)
 * 
 * **Storage Strategy:**
 * - Uses sessionStorage (cleared when browser closes)
 * - One-time use (cleared after redirect)
 * - Prevents stale redirects from persisting
 * 
 * **Security Considerations:**
 * - Validates URLs to prevent open redirect attacks
 * - Only allows internal routes (starts with /)
 * - Rejects external URLs and javascript: URIs
 * 
 * @example
 * ```typescript
 * import { AuthRedirectService } from '@_features/auth';
 * 
 * // Before opening login modal (capture intent)
 * AuthRedirectService.captureIntent('open_chat');
 * openLoginModal();
 * 
 * // After successful login (execute redirect)
 * const redirect = AuthRedirectService.getPostAuthRedirect();
 * router.push(redirect.url);
 * // redirect.type will be 'intent', 'returnUrl', or 'default'
 * ```
 * 
 * @module auth/AuthRedirectService
 */

import { Routes } from '@_features/navigation'

import { logger } from '@_core'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Supported authentication intents.
 * These represent actions that require authentication.
 * Uses camelCase for consistency with TypeScript naming conventions.
 */
export type AuthIntent = 
	| 'openChat'        // User clicked "Chat Now" or similar
	| 'requestQuote'    // User wants to request a quote
	| 'checkout'        // User wants to checkout
	| 'viewOrder'       // User wants to view order details
	| 'contactSupport'  // User wants to contact support
	| 'custom'          // Custom intent with associated URL

/**
 * Intent data stored in session storage.
 */
export interface StoredIntent {
	/** The type of intent */
	type: AuthIntent
	/** Timestamp when intent was captured */
	timestamp: number
	/** Optional custom URL for 'custom' intent type */
	customUrl?: string
	/** Optional metadata for the intent */
	metadata?: Record<string, unknown>
}

/**
 * Result of post-authentication redirect calculation.
 */
export interface PostAuthRedirect {
	/** The URL to redirect to */
	url: string
	/** How the redirect was determined */
	type: 'intent' | 'returnUrl' | 'default'
	/** Original intent if applicable */
	intent?: StoredIntent
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEYS = {
	intent: 'auth_intent',
	returnUrl: 'auth_return_url',
} as const

/** Maximum age for stored intents (5 minutes) */
const INTENT_MAX_AGE_MS = 5 * 60 * 1000

/** Maximum age for return URLs (10 minutes) */
const RETURN_URL_MAX_AGE_MS = 10 * 60 * 1000

const COMPONENT_NAME = 'AuthRedirectService'

// ============================================================================
// INTENT ROUTING MAP
// ============================================================================

/**
 * Maps intents to their post-auth destinations.
 * 
 * BUSINESS LOGIC:
 * - Most intents redirect to Dashboard first, then the UI component
 *   handles the specific action (e.g., opening chat)
 * - This ensures user sees their Dashboard and the action is contextual
 * 
 * NOTE: Keys use snake_case to match AuthIntent type. This is intentional
 * as these are domain-specific identifiers, not arbitrary object properties.
 */
const INTENT_ROUTES: Record<AuthIntent, (intent: StoredIntent) => string> = {
	// Chat Now: Go to Dashboard, LiveChatBubble will auto-open
	// We pass a query param so the component knows to open
	openChat: () => `${Routes.Dashboard.location}?action=open_chat`,
	
	// Request Quote: Go to cart or quotes page
	requestQuote: () => Routes.Cart.location,
	
	// Checkout: Go to cart
	checkout: () => Routes.Cart.location,
	
	// View Order: Go to orders list (specific order would need ID in metadata)
	viewOrder: (intent) => {
		const orderId = intent.metadata?.orderId
		return orderId 
			? Routes.Orders.detail(String(orderId))
			: Routes.Orders.location
	},
	
	// Contact Support: Go to Dashboard with chat open
	contactSupport: () => `${Routes.Dashboard.location}?action=open_chat`,
	
	// Custom: Use the provided URL or fallback to Dashboard
	custom: (intent) => intent.customUrl ?? Routes.Dashboard.location,
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

/**
 * AuthRedirectService
 * 
 * Singleton-style service for managing post-authentication redirects.
 * All methods are static for ease of use throughout the application.
 */
export class AuthRedirectService {
	// ========================================================================
	// INTENT MANAGEMENT
	// ========================================================================

	/**
	 * Captures an intent before opening the login modal.
	 * Call this when a user clicks an action that requires authentication.
	 * 
	 * @param type - The type of intent
	 * @param options - Optional configuration
	 * @param options.customUrl - Custom URL for 'custom' intent type
	 * @param options.metadata - Additional data to store with the intent
	 * 
	 * @example
	 * ```typescript
	 * // Before opening login modal
	 * AuthRedirectService.captureIntent('open_chat');
	 * 
	 * // With custom URL
	 * AuthRedirectService.captureIntent('custom', { 
	 *   customUrl: '/app/orders/123' 
	 * });
	 * 
	 * // With metadata
	 * AuthRedirectService.captureIntent('view_order', {
	 *   metadata: { orderId: 123 }
	 * });
	 * ```
	 */
	public static captureIntent(
		type: AuthIntent,
		options?: { customUrl?: string; metadata?: Record<string, unknown> }
	): void {
		if (typeof window === 'undefined') {
			logger.warn('captureIntent called on server - no-op', {
				component: COMPONENT_NAME,
			})
			return
		}

		const intent: StoredIntent = {
			type,
			timestamp: Date.now(),
			customUrl: options?.customUrl,
			metadata: options?.metadata,
		}

		try {
			sessionStorage.setItem(STORAGE_KEYS.intent, JSON.stringify(intent))
			logger.info('Auth intent captured', {
				component: COMPONENT_NAME,
				intentType: type,
				metadata: options?.metadata,
			})
		} catch (error) {
			logger.warn('Failed to store auth intent', {
				component: COMPONENT_NAME,
				error,
			})
		}
	}

	/**
	 * Retrieves the stored intent if it exists and is still valid.
	 * 
	 * @returns The stored intent or null if none/expired
	 */
	public static getIntent(): StoredIntent | null {
		if (typeof window === 'undefined') {
			return null
		}

		try {
			const stored = sessionStorage.getItem(STORAGE_KEYS.intent)
			if (!stored) {
				return null
			}

			const intent: StoredIntent = JSON.parse(stored)
			
			// Check if intent has expired
			const age = Date.now() - intent.timestamp
			if (age > INTENT_MAX_AGE_MS) {
				logger.debug('Auth intent expired, clearing', {
					component: COMPONENT_NAME,
					age,
					maxAge: INTENT_MAX_AGE_MS,
				})
				AuthRedirectService.clearIntent()
				return null
			}

			return intent
		} catch (error) {
			logger.warn('Failed to retrieve auth intent', {
				component: COMPONENT_NAME,
				error,
			})
			return null
		}
	}

	/**
	 * Clears the stored intent.
	 * Called automatically after redirect is executed.
	 */
	public static clearIntent(): void {
		if (typeof window === 'undefined') {
			return
		}

		try {
			sessionStorage.removeItem(STORAGE_KEYS.intent)
		} catch (error) {
			logger.warn('Failed to clear auth intent', {
				component: COMPONENT_NAME,
				error,
			})
		}
	}

	// ========================================================================
	// RETURN URL MANAGEMENT
	// ========================================================================

	/**
	 * Stores a return URL (typically the protected page user was trying to access).
	 * 
	 * @param url - The URL to return to after login
	 * 
	 * @example
	 * ```typescript
	 * // In middleware or route guard
	 * if (!isAuthenticated) {
	 *   AuthRedirectService.setReturnUrl(pathname);
	 *   redirect(Routes.openLoginModal());
	 * }
	 * ```
	 */
	public static setReturnUrl(url: string): void {
		if (typeof window === 'undefined') {
			return
		}

		// Validate URL (security: prevent open redirect attacks)
		if (!AuthRedirectService.isValidInternalUrl(url)) {
			logger.warn('Invalid return URL rejected', {
				component: COMPONENT_NAME,
				url,
			})
			return
		}

		try {
			const data = {
				url,
				timestamp: Date.now(),
			}
			sessionStorage.setItem(STORAGE_KEYS.returnUrl, JSON.stringify(data))
			logger.debug('Return URL stored', {
				component: COMPONENT_NAME,
				url,
			})
		} catch (error) {
			logger.warn('Failed to store return URL', {
				component: COMPONENT_NAME,
				error,
			})
		}
	}

	/**
	 * Retrieves the stored return URL if it exists and is still valid.
	 * 
	 * @returns The return URL or null if none/expired
	 */
	public static getReturnUrl(): string | null {
		if (typeof window === 'undefined') {
			return null
		}

		try {
			const stored = sessionStorage.getItem(STORAGE_KEYS.returnUrl)
			if (!stored) {
				return null
			}

			const data = JSON.parse(stored)
			
			// Check if return URL has expired
			const age = Date.now() - data.timestamp
			if (age > RETURN_URL_MAX_AGE_MS) {
				logger.debug('Return URL expired, clearing', {
					component: COMPONENT_NAME,
					age,
					maxAge: RETURN_URL_MAX_AGE_MS,
				})
				AuthRedirectService.clearReturnUrl()
				return null
			}

			return data.url
		} catch (error) {
			logger.warn('Failed to retrieve return URL', {
				component: COMPONENT_NAME,
				error,
			})
			return null
		}
	}

	/**
	 * Clears the stored return URL.
	 * Called automatically after redirect is executed.
	 */
	public static clearReturnUrl(): void {
		if (typeof window === 'undefined') {
			return
		}

		try {
			sessionStorage.removeItem(STORAGE_KEYS.returnUrl)
		} catch (error) {
			logger.warn('Failed to clear return URL', {
				component: COMPONENT_NAME,
				error,
			})
		}
	}

	// ========================================================================
	// POST-AUTH REDIRECT CALCULATION
	// ========================================================================

	/**
	 * Calculates the post-authentication redirect destination.
	 * 
	 * **Priority Order:**
	 * 1. Intent (if valid)
	 * 2. Return URL (if valid)
	 * 3. Default (Dashboard)
	 * 
	 * @param options - Configuration options
	 * @param options.clearAfterGet - Whether to clear stored data after retrieval (default: true)
	 * @param options.urlParamReturnUrl - Return URL from query parameter (e.g., ?redirectTo=...)
	 * 
	 * @returns PostAuthRedirect with URL, type, and optional intent data
	 * 
	 * @example
	 * ```typescript
	 * // After successful login
	 * const redirect = AuthRedirectService.getPostAuthRedirect();
	 * console.log(redirect.type); // 'intent' | 'returnUrl' | 'default'
	 * router.push(redirect.url);
	 * ```
	 */
	public static getPostAuthRedirect(options?: {
		clearAfterGet?: boolean
		urlParamReturnUrl?: string | null
	}): PostAuthRedirect {
		const { clearAfterGet = true, urlParamReturnUrl } = options ?? {}

		// Priority 1: Check for intent
		const intent = AuthRedirectService.getIntent()
		if (intent) {
			const intentRoute = INTENT_ROUTES[intent.type]
			const url = intentRoute(intent)

			if (clearAfterGet) {
				AuthRedirectService.clearIntent()
			}

			logger.info('Post-auth redirect: intent-based', {
				component: COMPONENT_NAME,
				intentType: intent.type,
				url,
			})

			return {
				url,
				type: 'intent',
				intent,
			}
		}

		// Priority 2: Check for return URL (URL param takes precedence over storage)
		const storedReturnUrl = AuthRedirectService.getReturnUrl()
		const returnUrl = urlParamReturnUrl ?? storedReturnUrl

		if (returnUrl && AuthRedirectService.isValidInternalUrl(returnUrl)) {
			if (clearAfterGet) {
				AuthRedirectService.clearReturnUrl()
			}

			logger.info('Post-auth redirect: return URL', {
				component: COMPONENT_NAME,
				url: returnUrl,
				source: urlParamReturnUrl ? 'urlParam' : 'storage',
			})

			return {
				url: returnUrl,
				type: 'returnUrl',
			}
		}

		// Priority 3: Default to Dashboard
		logger.info('Post-auth redirect: default (Dashboard)', {
			component: COMPONENT_NAME,
		})

		return {
			url: Routes.Dashboard.location,
			type: 'default',
		}
	}

	// ========================================================================
	// URL VALIDATION
	// ========================================================================

	/**
	 * Validates that a URL is a safe internal URL.
	 * Prevents open redirect attacks by rejecting:
	 * - External URLs (starting with http://, https://, //)
	 * - javascript: URIs
	 * - data: URIs
	 * - Any URL not starting with /
	 * 
	 * @param url - The URL to validate
	 * @returns true if the URL is safe to redirect to
	 */
	public static isValidInternalUrl(url: string): boolean {
		if (!url || typeof url !== 'string') {
			return false
		}

		// Must start with /
		if (!url.startsWith('/')) {
			return false
		}

		// Reject protocol-relative URLs
		if (url.startsWith('//')) {
			return false
		}

		// Reject dangerous protocols
		const lowerUrl = url.toLowerCase()
		if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
			return false
		}

		// Basic XSS prevention
		if (url.includes('<') || url.includes('>')) {
			return false
		}

		return true
	}

	// ========================================================================
	// UTILITY METHODS
	// ========================================================================

	/**
	 * Clears all stored redirect data.
	 * Useful for cleanup or testing.
	 */
	public static clearAll(): void {
		AuthRedirectService.clearIntent()
		AuthRedirectService.clearReturnUrl()
		logger.debug('All auth redirect data cleared', {
			component: COMPONENT_NAME,
		})
	}

	/**
	 * Checks if there's any pending redirect data.
	 * 
	 * @returns true if there's an intent or return URL stored
	 */
	public static hasPendingRedirect(): boolean {
		return AuthRedirectService.getIntent() !== null || 
			   AuthRedirectService.getReturnUrl() !== null
	}
}

export default AuthRedirectService

