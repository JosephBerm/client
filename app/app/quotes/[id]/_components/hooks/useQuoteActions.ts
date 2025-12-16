/**
 * useQuoteActions Hook - Workflow Actions Pattern
 * 
 * Custom hook for managing quote workflow actions (status transitions, convert to order).
 * Uses `useFormSubmit` for DRY form submission handling.
 * 
 * **Features:**
 * - Status transitions (Mark as Read, Approve, Reject)
 * - Convert to Order functionality
 * - Automatic quote refresh after actions
 * - Loading states and error handling (via useFormSubmit)
 * - Type-safe with full TypeScript support
 * 
 * **Pattern:**
 * - Follows `useAccountDetailLogic` pattern for action handlers
 * - Uses `useFormSubmit` for all API calls (DRY, handles loading/error/success)
 * - Refreshes quote data after successful actions
 * 
 * @module app/quotes/[id]/_components/hooks/useQuoteActions
 */

'use client'

import { useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { useFormSubmit, API } from '@_shared'

import { QuoteStatus } from '@_classes/Enums'
import Quote from '@_classes/Quote'

import type { UseQuotePermissionsReturn } from './useQuotePermissions'

/**
 * Return type for useQuoteActions hook
 */
export interface UseQuoteActionsReturn {
	/** Handler for marking quote as read */
	handleMarkAsRead: () => Promise<void>
	/** Handler for approving quote */
	handleApprove: () => Promise<void>
	/** Handler for rejecting quote */
	handleReject: () => Promise<void>
	/** Handler for sending quote to customer */
	handleSendToCustomer: () => Promise<void>
	/** Handler for converting quote to order */
	handleConvertToOrder: () => Promise<void>
	/** Whether any action is currently processing */
	isProcessing: boolean
}

/**
 * Custom hook for quote workflow actions
 * 
 * Provides handlers for all quote workflow actions using `useFormSubmit` for DRY.
 * Each action updates the quote status via `API.Quotes.update` and refreshes the quote data.
 * 
 * **Actions:**
 * - Mark as Read: Updates status to Read
 * - Approve: Updates status to Approved
 * - Reject: Updates status to Rejected
 * - Send to Customer: Updates status to Approved (if not already)
 * - Convert to Order: Creates order from quote, navigates to order detail
 * 
 * @param quote - The quote entity
 * @param permissions - Permission flags from useQuotePermissions
 * @param onRefresh - Callback to refresh quote data after successful action
 * @returns Action handlers and processing state
 * 
 * @example
 * ```tsx
 * const { quote, refresh } = useQuoteDetails()
 * const permissions = useQuotePermissions(quote)
 * const { handleApprove, isProcessing } = useQuoteActions(quote, permissions, refresh)
 * 
 * <Button onClick={handleApprove} disabled={isProcessing}>
 *   Approve Quote
 * </Button>
 * ```
 */
export function useQuoteActions(
	quote: Quote | null,
	permissions: UseQuotePermissionsReturn,
	onRefresh?: () => Promise<void>
): UseQuoteActionsReturn {
	const router = useRouter()

	// Memoize quote ID to avoid unnecessary re-renders
	// Quote ID (React Compiler auto-memoizes simple property access)
	const quoteId = quote?.id

	// Helper to create updated quote with new status
	const createUpdatedQuote = useCallback(
		(newStatus: QuoteStatus): Quote | null => {
			if (!quote || !quoteId) return null
			return new Quote({
				...quote,
				status: newStatus,
			})
		},
		[quote, quoteId]
	)

	// Mark as Read action (Unread → Read)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const markAsReadSubmit = useFormSubmit(
		async (_data: Record<string, never>) => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}
			const updatedQuote = createUpdatedQuote(QuoteStatus.Read)
			if (!updatedQuote) {
				throw new Error('Failed to create updated quote')
			}
			return API.Quotes.update<Quote>(updatedQuote)
		},
		{
			successMessage: 'Quote marked as read',
			errorMessage: 'Failed to mark quote as read',
			componentName: 'useQuoteActions',
			actionName: 'markAsRead',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	// Approve action (Read → Approved)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const approveSubmit = useFormSubmit(
		async (_data: Record<string, never>) => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}
			const updatedQuote = createUpdatedQuote(QuoteStatus.Approved)
			if (!updatedQuote) {
				throw new Error('Failed to create updated quote')
			}
			return API.Quotes.update<Quote>(updatedQuote)
		},
		{
			successMessage: 'Quote approved successfully',
			errorMessage: 'Failed to approve quote',
			componentName: 'useQuoteActions',
			actionName: 'approve',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	// Reject action (Unread/Read → Rejected)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const rejectSubmit = useFormSubmit(
		async (_data: Record<string, never>) => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}
			const updatedQuote = createUpdatedQuote(QuoteStatus.Rejected)
			if (!updatedQuote) {
				throw new Error('Failed to create updated quote')
			}
			return API.Quotes.update<Quote>(updatedQuote)
		},
		{
			successMessage: 'Quote rejected',
			errorMessage: 'Failed to reject quote',
			componentName: 'useQuoteActions',
			actionName: 'reject',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	// Send to Customer action (ensures status is Approved)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const sendToCustomerSubmit = useFormSubmit(
		async (_data: Record<string, never>) => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}
			const updatedQuote = createUpdatedQuote(QuoteStatus.Approved)
			if (!updatedQuote) {
				throw new Error('Failed to create updated quote')
			}
			return API.Quotes.update<Quote>(updatedQuote)
		},
		{
			successMessage: 'Quote sent to customer',
			errorMessage: 'Failed to send quote to customer',
			componentName: 'useQuoteActions',
			actionName: 'sendToCustomer',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	// Convert to Order action
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const convertToOrderSubmit = useFormSubmit(
		async (_data: Record<string, never>) => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}
			return API.Orders.createFromQuote<{ id: string }>(quoteId)
		},
		{
			successMessage: 'Order created successfully',
			errorMessage: 'Failed to create order from quote',
			componentName: 'useQuoteActions',
			actionName: 'convertToOrder',
			onSuccess: async (result) => {
				if (result?.id) {
					router.push(Routes.Orders.detail(result.id))
				} else {
					// Fallback: refresh quote and stay on page
					await onRefresh?.()
				}
			},
		}
	)

	// Wrapper handlers (non-async for onClick handlers)
	const handleMarkAsRead = useCallback(async () => {
		const result = await markAsReadSubmit.submit({})
		if (!result.success) {
			logger.error('Mark as read failed', {
				quoteId,
				component: 'useQuoteActions',
				action: 'handleMarkAsRead',
			})
		}
	}, [markAsReadSubmit, quoteId])

	const handleApprove = useCallback(async () => {
		const result = await approveSubmit.submit({})
		if (!result.success) {
			logger.error('Approve failed', {
				quoteId,
				component: 'useQuoteActions',
				action: 'handleApprove',
			})
		}
	}, [approveSubmit, quoteId])

	const handleReject = useCallback(async () => {
		const result = await rejectSubmit.submit({})
		if (!result.success) {
			logger.error('Reject failed', {
				quoteId,
				component: 'useQuoteActions',
				action: 'handleReject',
			})
		}
	}, [rejectSubmit, quoteId])

	const handleSendToCustomer = useCallback(async () => {
		const result = await sendToCustomerSubmit.submit({})
		if (!result.success) {
			logger.error('Send to customer failed', {
				quoteId,
				component: 'useQuoteActions',
				action: 'handleSendToCustomer',
			})
		}
	}, [sendToCustomerSubmit, quoteId])

	const handleConvertToOrder = useCallback(async () => {
		const result = await convertToOrderSubmit.submit({})
		if (!result.success) {
			logger.error('Convert to order failed', {
				quoteId,
				component: 'useQuoteActions',
				action: 'handleConvertToOrder',
			})
		}
	}, [convertToOrderSubmit, quoteId])

	// Combined processing state (any action in progress)
	const isProcessing =
		markAsReadSubmit.isSubmitting ||
		approveSubmit.isSubmitting ||
		rejectSubmit.isSubmitting ||
		sendToCustomerSubmit.isSubmitting ||
		convertToOrderSubmit.isSubmitting

	return {
		handleMarkAsRead,
		handleApprove,
		handleReject,
		handleSendToCustomer,
		handleConvertToOrder,
		isProcessing,
	}
}
