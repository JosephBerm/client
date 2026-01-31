/**
 * useOrderActions Hook
 * 
 * Manages order workflow actions (confirm payment, update status, add tracking, cancel).
 * Uses useFormSubmit for DRY API handling with automatic loading state,
 * error notifications, and success callbacks.
 * 
 * **Features:**
 * - Confirm payment (Placed → Paid)
 * - Update status (Paid → Processing → Shipped → Delivered)
 * - Add tracking numbers
 * - Request/perform cancellation
 * - Role-based action availability
 * 
 * **Business Rules:**
 * - Sales reps can confirm payment for assigned orders
 * - Fulfillment can update status (Processing, Shipped, Delivered)
 * - Sales managers can cancel orders
 * - Customers can only request cancellation
 * 
 * **Performance (Next.js 16 / React 19 Best Practices):**
 * - useCallback for action wrappers: YES - Functions returned to consumers
 * - These are passed to event handlers and memoized components
 * - Stable references prevent unnecessary child re-renders
 * 
 * @see prd_orders.md - Full specification
 * @module app/orders/[id]/_components/hooks/useOrderActions
 */

'use client'

import { useCallback } from 'react'

import { useFormSubmit, API } from '@_shared'

import { OrderStatus } from '@_classes/Enums'

import type Order from '@_classes/Order'
import type { UseOrderActionsReturn } from '@_types/order.types'

/**
 * Custom hook for order workflow actions.
 * 
 * Provides methods to confirm payment, update status, add tracking,
 * and cancel orders with consistent error handling and loading states.
 * 
 * @param order - The order entity (null if not loaded)
 * @param onRefresh - Callback to refresh order data after update
 * @returns Order workflow operations and status
 * 
 * @example
 * ```tsx
 * const { 
 *   confirmPayment, 
 *   updateStatus, 
 *   cancelOrder, 
 *   isProcessing 
 * } = useOrderActions(order, refresh)
 * 
 * // Confirm payment
 * const handleConfirmPayment = async () => {
 *   const result = await confirmPayment('CHK-12345', 'Payment received via check')
 *   if (result.success) {
 *     // Payment confirmed
 *   }
 * }
 * 
 * // Mark as shipped
 * const handleShip = async () => {
 *   await updateStatus(OrderStatus.Shipped, 'TRK123456', 'FedEx', 'Shipped via FedEx Ground')
 * }
 * ```
 */
export function useOrderActions(
	order: Order | null,
	onRefresh?: () => Promise<void>
): UseOrderActionsReturn {
	const orderId = order?.id

	// =========================================================================
	// CONFIRM PAYMENT (Placed → Paid)
	// =========================================================================

	const { submit: confirmPaymentSubmit, isSubmitting: isConfirming } = useFormSubmit(
		async (data: { paymentReference?: string; notes?: string }) => {
			if (!orderId) throw new Error('Order ID required')
			return API.Orders.confirmPayment(orderId, data.paymentReference, data.notes)
		},
		{
			successMessage: 'Payment confirmed successfully',
			errorMessage: 'Failed to confirm payment',
			componentName: 'useOrderActions',
			actionName: 'confirmPayment',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	const confirmPayment = useCallback(
		async (paymentReference?: string, notes?: string): Promise<{ success: boolean }> => {
			return confirmPaymentSubmit({ paymentReference, notes })
		},
		[confirmPaymentSubmit]
	)

	// =========================================================================
	// UPDATE STATUS
	// =========================================================================

	const { submit: updateStatusSubmit, isSubmitting: isUpdatingStatus } = useFormSubmit(
		async (data: { 
			newStatus: OrderStatus
			trackingNumber?: string
			carrier?: string
			cancellationReason?: string
			notes?: string 
		}) => {
			if (!orderId) throw new Error('Order ID required')
			return API.Orders.updateStatus(
				orderId,
				data.newStatus,
				data.trackingNumber,
				data.carrier,
				data.cancellationReason,
				data.notes
			)
		},
		{
			successMessage: 'Order status updated',
			errorMessage: 'Failed to update order status',
			componentName: 'useOrderActions',
			actionName: 'updateStatus',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	const updateStatus = useCallback(
		async (
			newStatus: OrderStatus,
			trackingNumber?: string,
			carrier?: string,
			notes?: string
		): Promise<{ success: boolean }> => {
			return updateStatusSubmit({ newStatus, trackingNumber, carrier, notes })
		},
		[updateStatusSubmit]
	)

	// =========================================================================
	// ADD TRACKING
	// =========================================================================

	const { submit: addTrackingSubmit, isSubmitting: isAddingTracking } = useFormSubmit(
		async (data: { orderItemId: string; trackingNumber: string; carrier?: string }) => {
			if (!orderId) throw new Error('Order ID required')
			return API.Orders.addTracking(orderId, data.orderItemId, data.trackingNumber, data.carrier)
		},
		{
			successMessage: 'Tracking number added',
			errorMessage: 'Failed to add tracking number',
			componentName: 'useOrderActions',
			actionName: 'addTracking',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	const addTracking = useCallback(
		async (orderItemId: string, trackingNumber: string, carrier?: string): Promise<{ success: boolean }> => {
			return addTrackingSubmit({ orderItemId, trackingNumber, carrier })
		},
		[addTrackingSubmit]
	)

	// =========================================================================
	// REQUEST CANCELLATION (Customer)
	// =========================================================================

	const { submit: requestCancellationSubmit, isSubmitting: isRequestingCancellation } = useFormSubmit(
		async (data: { reason: string }) => {
			if (!orderId) throw new Error('Order ID required')
			return API.Orders.requestCancellation(orderId, data.reason)
		},
		{
			successMessage: 'Cancellation request submitted',
			errorMessage: 'Failed to submit cancellation request',
			componentName: 'useOrderActions',
			actionName: 'requestCancellation',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	const requestCancellation = useCallback(
		async (reason: string): Promise<{ success: boolean }> => {
			return requestCancellationSubmit({ reason })
		},
		[requestCancellationSubmit]
	)

	// =========================================================================
	// CANCEL ORDER (Manager)
	// =========================================================================

	const { submit: cancelOrderSubmit, isSubmitting: isCancelling } = useFormSubmit(
		async (data: { reason: string }) => {
			if (!orderId) throw new Error('Order ID required')
			return API.Orders.updateStatus(
				orderId,
				OrderStatus.Cancelled,
				undefined,
				undefined,
				data.reason,
				undefined
			)
		},
		{
			successMessage: 'Order cancelled',
			errorMessage: 'Failed to cancel order',
			componentName: 'useOrderActions',
			actionName: 'cancelOrder',
			onSuccess: async () => {
				await onRefresh?.()
			},
		}
	)

	const cancelOrder = useCallback(
		async (reason: string): Promise<{ success: boolean }> => {
			return cancelOrderSubmit({ reason })
		},
		[cancelOrderSubmit]
	)

	// =========================================================================
	// RETURN
	// =========================================================================

	return {
		confirmPayment,
		updateStatus,
		addTracking,
		requestCancellation,
		cancelOrder,
		isProcessing: isConfirming || isUpdatingStatus || isAddingTracking || isRequestingCancellation || isCancelling,
	}
}

export default useOrderActions

