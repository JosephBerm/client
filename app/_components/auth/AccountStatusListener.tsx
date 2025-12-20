'use client'

/**
 * Account Status Listener
 * 
 * Global component that listens for account status errors and handles
 * forced logout with appropriate user feedback.
 * 
 * MAANG-Level Pattern:
 * - Placed in root layout to catch all status errors
 * - Shows toast notification with reason
 * - Forces immediate logout and redirect
 * - Prevents further API calls after detection
 * 
 * @module AccountStatusListener
 */

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@_features/auth/stores/useAuthStore'

import {
	notificationService,
	subscribeToAccountStatusErrors,
	clearAuthState,
	getLoginUrl,
	type AccountStatusError,
} from '@_shared'

/**
 * AccountStatusListener Component
 * 
 * Listens for account status errors dispatched by HttpService and handles
 * forced logout with user notification.
 * 
 * Should be placed in the root layout to ensure it's always mounted.
 */
export default function AccountStatusListener(): null {
	const router = useRouter()
	const logout = useAuthStore((state) => state.logout)
	const isHandling = useRef(false)

	useEffect(() => {
		const handleAccountStatusError = (error: AccountStatusError) => {
			// Prevent multiple handlers for same error
			if (isHandling.current) {
				return
			}
			isHandling.current = true

			// Show notification with error message
			notificationService.error(error.message, {
				action: 'account_status_error',
			})

			// Clear all auth state
			clearAuthState()
			logout()

			// Redirect to login page after a short delay (let toast show)
			setTimeout(() => {
				router.push(getLoginUrl())
				isHandling.current = false
			}, 500)
		}

		// Subscribe to account status errors
		const unsubscribe = subscribeToAccountStatusErrors(handleAccountStatusError)

		return () => {
			unsubscribe()
		}
	}, [router, logout])

	// This component renders nothing
	return null
}

