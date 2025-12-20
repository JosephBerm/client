/**
 * Account Status Handler
 * 
 * Handles forced logout scenarios when backend detects invalid account status.
 * This is triggered when:
 * - User's account is suspended while they're logged in
 * - User's account is locked (too many failed attempts elsewhere)
 * - User's account is archived
 * 
 * MAANG-Level Pattern:
 * - Backend validates account status on EVERY request via middleware
 * - Returns 401 with X-Account-Status header
 * - Frontend detects this and forces immediate logout with message
 * 
 * @module accountStatusHandler
 */

'use client'

import { deleteCookie } from 'cookies-next'

import { logger } from '@_core'

import { AUTH_COOKIE_NAME } from './httpService.constants'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Account status error codes from backend.
 */
export type AccountStatusCode =
	| 'account_suspended'
	| 'account_locked'
	| 'account_archived'
	| 'email_verification_required'
	| 'account_not_found'
	| 'account_inactive'

/**
 * Account status error event payload.
 */
export interface AccountStatusError {
	code: AccountStatusCode
	message: string
}

// =========================================================================
// EVENT-BASED FORCED LOGOUT
// =========================================================================

/** Event name for account status errors */
const ACCOUNT_STATUS_EVENT = 'account-status-error'

/**
 * Dispatches an account status error event.
 * This will be caught by AccountStatusListener and trigger logout.
 * 
 * @param error - The account status error details
 */
export function dispatchAccountStatusError(error: AccountStatusError): void {
	if (typeof window === 'undefined') return

	const event = new CustomEvent(ACCOUNT_STATUS_EVENT, { detail: error })
	window.dispatchEvent(event)

	logger.warn('Account status error detected', {
		code: error.code,
		message: error.message,
		component: 'AccountStatusHandler',
	})
}

/**
 * Subscribes to account status error events.
 * 
 * @param handler - Function to call when account status error occurs
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToAccountStatusErrors(
	handler: (error: AccountStatusError) => void
): () => void {
	if (typeof window === 'undefined') return () => {}

	const listener = (event: Event) => {
		const customEvent = event as CustomEvent<AccountStatusError>
		handler(customEvent.detail)
	}

	window.addEventListener(ACCOUNT_STATUS_EVENT, listener)
	return () => window.removeEventListener(ACCOUNT_STATUS_EVENT, listener)
}

// =========================================================================
// RESPONSE CHECKING
// =========================================================================

/**
 * Checks if a fetch response indicates an account status error.
 * Call this after receiving a 401 response.
 * 
 * @param response - The fetch Response object
 * @returns True if this is an account status error (and event was dispatched)
 */
export function checkAndHandleAccountStatusError(response: Response): boolean {
	// Only check 401 responses
	if (response.status !== 401) return false

	const accountStatus = response.headers.get('X-Account-Status')
	const statusMessage = response.headers.get('X-Account-Status-Message')

	if (!accountStatus) return false

	// This is an account status error - dispatch event for forced logout
	dispatchAccountStatusError({
		code: accountStatus as AccountStatusCode,
		message: statusMessage || getDefaultMessage(accountStatus as AccountStatusCode),
	})

	return true
}

/**
 * Gets default message for account status code.
 */
function getDefaultMessage(code: AccountStatusCode): string {
	switch (code) {
		case 'account_suspended':
			return 'Your account has been suspended. Please contact your administrator.'
		case 'account_locked':
			return 'Your account is temporarily locked. Please try again later.'
		case 'account_archived':
			return 'Your account has been archived. Please contact support.'
		case 'email_verification_required':
			return 'Please verify your email address.'
		case 'account_not_found':
			return 'Your account no longer exists.'
		default:
			return 'Your account is not active. Please contact support.'
	}
}

// =========================================================================
// IMMEDIATE LOGOUT (used by listener)
// =========================================================================

/**
 * Immediately clears authentication state.
 * Called by AccountStatusListener after showing message.
 */
export function clearAuthState(): void {
	// Clear auth cookie
	deleteCookie(AUTH_COOKIE_NAME)

	// Clear localStorage auth state
	try {
		localStorage.removeItem('auth-storage')
	} catch {
		// localStorage not available (SSR)
	}
}

/**
 * Gets the login URL for redirect.
 */
export function getLoginUrl(): string {
	return '/?login=open'
}

