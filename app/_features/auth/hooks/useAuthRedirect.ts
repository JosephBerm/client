/**
 * useAuthRedirect Hook - React Interface for AuthRedirectService
 * 
 * Provides a React-friendly API for managing post-authentication redirects.
 * Handles router integration and automatic navigation after login.
 * 
 * **Features:**
 * - Type-safe intent capture
 * - Automatic redirect execution after login
 * - Integration with Next.js router
 * - Query parameter support (redirectTo)
 * - Cleanup on unmount
 * 
 * **Use Cases:**
 * 1. Capture intent before login (e.g., "Chat Now" button)
 * 2. Execute redirect after successful login
 * 3. Check if there's a pending redirect
 * 
 * @example
 * ```typescript
 * // In a component with auth-required action
 * function ChatNowButton() {
 *   const { captureIntent } = useAuthRedirect();
 *   const { isAuthenticated } = useAuthStore();
 *   
 *   const handleClick = () => {
 *     if (!isAuthenticated) {
 *       captureIntent('open_chat');
 *       openLoginModal();
 *     } else {
 *       openChat();
 *     }
 *   };
 *   
 *   return <Button onClick={handleClick}>Chat Now</Button>;
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // After successful login
 * function LoginModal({ onLoginSuccess }) {
 *   const { executePostAuthRedirect } = useAuthRedirect();
 *   
 *   const handleLoginSuccess = () => {
 *     onLoginSuccess?.();
 *     executePostAuthRedirect(); // Automatically navigates
 *   };
 * }
 * ```
 * 
 * @module auth/useAuthRedirect
 */

'use client'

import { useCallback, useMemo } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { logger } from '@_core'

import { 
	AuthRedirectService, 
	type AuthIntent, 
	type PostAuthRedirect 
} from '../services/AuthRedirectService'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for capturing an intent.
 */
export interface CaptureIntentOptions {
	/** Custom URL for 'custom' intent type */
	customUrl?: string
	/** Additional metadata to store with the intent */
	metadata?: Record<string, unknown>
}

/**
 * Options for executing post-auth redirect.
 */
export interface ExecuteRedirectOptions {
	/** Whether to clear stored data after redirect (default: true) */
	clearAfterRedirect?: boolean
	/** Callback after redirect is initiated */
	onRedirect?: (redirect: PostAuthRedirect) => void
	/** Custom redirect function (defaults to router.push) */
	redirectFn?: (url: string) => void
}

/**
 * Return type for useAuthRedirect hook.
 */
export interface UseAuthRedirectReturn {
	/**
	 * Captures an intent before opening the login modal.
	 * Call this when user clicks an auth-required action.
	 */
	captureIntent: (type: AuthIntent, options?: CaptureIntentOptions) => void
	
	/**
	 * Executes the post-authentication redirect.
	 * Call this after successful login.
	 */
	executePostAuthRedirect: (options?: ExecuteRedirectOptions) => PostAuthRedirect
	
	/**
	 * Gets the post-auth redirect info without navigating.
	 * Useful for preview or conditional logic.
	 */
	getPostAuthRedirect: () => PostAuthRedirect
	
	/**
	 * Checks if there's a pending redirect (intent or return URL).
	 */
	hasPendingRedirect: boolean
	
	/**
	 * Clears all pending redirect data.
	 * Useful when user cancels login.
	 */
	clearPendingRedirect: () => void
	
	/**
	 * Sets a return URL for post-auth redirect.
	 * Typically called by route guards/middleware.
	 */
	setReturnUrl: (url: string) => void
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

const COMPONENT_NAME = 'useAuthRedirect'

/**
 * useAuthRedirect Hook
 * 
 * React hook for managing post-authentication redirects.
 * Provides a clean API for capturing intents and executing redirects.
 * 
 * @returns Object with redirect management functions
 */
export function useAuthRedirect(): UseAuthRedirectReturn {
	const router = useRouter()
	const searchParams = useSearchParams()

	// Extract redirectTo from URL params (stable reference)
	const urlParamRedirectTo = searchParams.get('redirectTo')

	/**
	 * Captures an intent before login.
	 */
	const captureIntent = useCallback((
		type: AuthIntent,
		options?: CaptureIntentOptions
	) => {
		logger.debug('Capturing auth intent', {
			component: COMPONENT_NAME,
			intentType: type,
		})
		AuthRedirectService.captureIntent(type, options)
	}, [])

	/**
	 * Gets the post-auth redirect without executing.
	 */
	const getPostAuthRedirect = useCallback(() => {
		return AuthRedirectService.getPostAuthRedirect({
			clearAfterGet: false,
			urlParamReturnUrl: urlParamRedirectTo,
		})
	}, [urlParamRedirectTo])

	/**
	 * Executes the post-auth redirect.
	 */
	const executePostAuthRedirect = useCallback((
		options?: ExecuteRedirectOptions
	): PostAuthRedirect => {
		const { 
			clearAfterRedirect = true, 
			onRedirect,
			redirectFn,
		} = options ?? {}

		const redirect = AuthRedirectService.getPostAuthRedirect({
			clearAfterGet: clearAfterRedirect,
			urlParamReturnUrl: urlParamRedirectTo,
		})

		logger.info('Executing post-auth redirect', {
			component: COMPONENT_NAME,
			redirectType: redirect.type,
			url: redirect.url,
		})

		// Call the onRedirect callback if provided
		onRedirect?.(redirect)

		// Execute the redirect
		const navigate = redirectFn ?? router.push
		navigate(redirect.url)

		return redirect
	}, [router, urlParamRedirectTo])

	/**
	 * Checks if there's a pending redirect.
	 */
	const hasPendingRedirect = useMemo(() => {
		return AuthRedirectService.hasPendingRedirect() || !!urlParamRedirectTo
	}, [urlParamRedirectTo])

	/**
	 * Clears all pending redirect data.
	 */
	const clearPendingRedirect = useCallback(() => {
		logger.debug('Clearing pending redirect data', {
			component: COMPONENT_NAME,
		})
		AuthRedirectService.clearAll()
	}, [])

	/**
	 * Sets a return URL.
	 */
	const setReturnUrl = useCallback((url: string) => {
		AuthRedirectService.setReturnUrl(url)
	}, [])

	return {
		captureIntent,
		executePostAuthRedirect,
		getPostAuthRedirect,
		hasPendingRedirect,
		clearPendingRedirect,
		setReturnUrl,
	}
}

export default useAuthRedirect

