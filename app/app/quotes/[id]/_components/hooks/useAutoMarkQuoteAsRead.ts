/**
 * useAutoMarkQuoteAsRead Hook - Automatic Status Update Pattern
 * 
 * Automatically marks a quote as "Read" when an assigned sales rep opens an Unread quote.
 * Follows DRY principles by reusing existing `handleMarkAsRead` from `useQuoteActions`.
 * 
 * **Features:**
 * - Automatic status update on page load
 * - Only triggers for assigned sales reps
 * - Only triggers for Unread quotes
 * - Prevents duplicate updates with ref tracking
 * - Follows existing hook patterns for consistency
 * 
 * **Business Logic:**
 * - When a sales rep opens a quote assigned to them that is Unread,
 *   the quote is automatically marked as Read
 * - Notification is shown via `useFormSubmit` in `useQuoteActions`
 * 
 * **Pattern:**
 * - Similar to other auto-action hooks in the codebase
 * - Uses useEffect with proper dependency tracking
 * - Prevents infinite loops with ref-based tracking
 * 
 * @module app/quotes/[id]/_components/hooks/useAutoMarkQuoteAsRead
 */

'use client'

import { useEffect, useRef } from 'react'

import { logger } from '@_core'

import { QuoteStatus } from '@_classes/Enums'
import type Quote from '@_classes/Quote'

import type { UseQuotePermissionsReturn } from './useQuotePermissions'

/**
 * Hook configuration interface
 */
export interface UseAutoMarkQuoteAsReadConfig {
	/** The quote entity (null if not loaded) */
	quote: Quote | null
	/** Permission flags from useQuotePermissions */
	permissions: UseQuotePermissionsReturn
	/** Handler function to mark quote as read (from useQuoteActions) */
	handleMarkAsRead: () => Promise<void>
	/** Whether quote data is currently loading */
	isLoading: boolean
}

/**
 * Custom hook to automatically mark quote as Read when conditions are met
 * 
 * **Conditions:**
 * - Quote must be loaded (not null)
 * - Quote must not be loading
 * - User must be the assigned sales rep (isAssignedQuote)
 * - Quote status must be Unread
 * - Must not have already been auto-marked (prevents duplicate calls)
 * 
 * **Behavior:**
 * - Automatically calls `handleMarkAsRead` when all conditions are met
 * - Only runs once per quote load (tracked via ref)
 * - Notification is handled by `useFormSubmit` in `useQuoteActions`
 * 
 * @param config - Hook configuration
 * 
 * @example
 * ```tsx
 * const { quote, isLoading } = useQuoteDetails()
 * const permissions = useQuotePermissions(quote)
 * const { handleMarkAsRead } = useQuoteActions(quote, permissions, refresh)
 * 
 * // Auto-mark as read when conditions are met
 * useAutoMarkQuoteAsRead({
 *   quote,
 *   permissions,
 *   handleMarkAsRead,
 *   isLoading
 * })
 * ```
 */
export function useAutoMarkQuoteAsRead({
	quote,
	permissions,
	handleMarkAsRead,
	isLoading,
}: UseAutoMarkQuoteAsReadConfig): void {
	// Track if we've already attempted to auto-mark this quote
	// Prevents duplicate calls on re-renders and race conditions
	const hasAutoMarkedRef = useRef(false)
	const lastQuoteIdRef = useRef<string | undefined>(undefined)

	// Extract stable values for dependency tracking (MAANG pattern: minimize dependencies)
	const quoteId = quote?.id
	const quoteStatus = quote?.status
	const { isAssignedQuote } = permissions.context

	useEffect(() => {
		// Reset tracking when quote ID changes (new quote loaded)
		// Defensive: Handle both undefined and defined cases
		if (quoteId !== lastQuoteIdRef.current) {
			hasAutoMarkedRef.current = false
			lastQuoteIdRef.current = quoteId
		}

		// Early return if conditions not met (defensive programming)
		// Check in order of most likely to fail first (performance optimization)
		if (
			!quote || // Quote not loaded
			!quoteId || // Quote ID missing (defensive)
			isLoading || // Still loading
			hasAutoMarkedRef.current || // Already attempted (prevents duplicate calls)
			!isAssignedQuote || // Not assigned to current user
			quoteStatus !== QuoteStatus.Unread // Not Unread status
		) {
			return
		}

		// All conditions met - mark as read
		// Set flag BEFORE async call to prevent race conditions
		hasAutoMarkedRef.current = true
		
		// Fire and forget - notification handled by useFormSubmit
		// Defensive: Wrap in try-catch for error boundary (though useFormSubmit handles errors)
		void handleMarkAsRead().catch((error) => {
			// Reset flag on error so user can retry if needed
			// This is defensive programming - handle edge cases
			hasAutoMarkedRef.current = false
			logger.error('Failed to auto-mark quote as read', {
				error,
				quoteId,
				component: 'useAutoMarkQuoteAsRead',
				action: 'handleMarkAsRead',
			})
		})
		// MAANG pattern: Minimal dependencies - only depend on values actually used
		// quoteId and quoteStatus capture all necessary quote state changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quoteId, quoteStatus, isAssignedQuote, handleMarkAsRead, isLoading])
}

