/**
 * useOrderDetails Hook
 * 
 * Manages order detail page state including data fetching,
 * loading state, and error handling.
 * 
 * **Features:**
 * - Fetch order by ID
 * - Loading/error states
 * - Refresh functionality
 * - Role-based data filtering (auto-applied by backend)
 * 
 * **Performance (Next.js 16 / React 19 Best Practices):**
 * - useCallback for fetchOrder: YES - Passed to useEffect dependency
 * - useCallback for refresh: YES - Returned to consumers, passed to children
 * - These prevent unnecessary effect re-runs and child re-renders
 * 
 * @see prd_orders.md - Order Management PRD
 * @module app/orders/[id]/_components/hooks/useOrderDetails
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { Routes } from '@_features/navigation'
import { API, notificationService, useRouteParam } from '@_shared'

import Order from '@_classes/Order'

import type { UseOrderDetailsReturn } from '@_types/order.types'

/**
 * Custom hook for managing order detail state.
 * 
 * Handles fetching, loading, error states, and refresh for an order.
 * Automatically navigates back to orders list on error.
 * 
 * @returns Order details state and operations
 * 
 * @example
 * ```tsx
 * const { order, isLoading, error, refresh } = useOrderDetails()
 * 
 * if (isLoading) return <LoadingSpinner />
 * if (error) return <ErrorMessage error={error} />
 * if (!order) return null
 * 
 * return <OrderDetail order={order} onRefresh={refresh} />
 * ```
 */
export function useOrderDetails(): UseOrderDetailsReturn {
	const router = useRouter()
	const orderIdParam = useRouteParam('id')

	const [order, setOrder] = useState<Order | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	/**
	 * Fetches order data from API.
	 * Navigates to orders list on error.
	 */
	const fetchOrder = useCallback(async () => {
		if (!orderIdParam) {
			router.push(Routes.Orders.location)
			return
		}

		try {
			setIsLoading(true)
			setError(null)

			const orderId = Number(orderIdParam)

			// Validate parsed number
			if (!Number.isFinite(orderId) || orderId <= 0) {
				notificationService.error('Invalid order ID', {
					metadata: { orderId: orderIdParam },
					component: 'useOrderDetails',
					action: 'fetchOrder',
				})
				router.push(Routes.Orders.location)
				return
			}

			const { data } = await API.Orders.get<Order>(orderId)

			if (!data.payload) {
				notificationService.error(data.message || 'Order not found', {
					metadata: { orderId: orderIdParam },
					component: 'useOrderDetails',
					action: 'fetchOrder',
				})
				router.push(Routes.Orders.location)
				return
			}

			setOrder(new Order(data.payload))
		} catch (err: unknown) {
			const errorObj = err instanceof Error ? err : new Error('Failed to load order')
			setError(errorObj)
			notificationService.error('Unable to load order', {
				metadata: { error: err, orderId: orderIdParam },
				component: 'useOrderDetails',
				action: 'fetchOrder',
			})
		} finally {
			setIsLoading(false)
		}
	}, [orderIdParam, router])

	/**
	 * Refreshes order data.
	 * Called after successful workflow actions.
	 */
	const refresh = useCallback(async () => {
		await fetchOrder()
	}, [fetchOrder])

	// Initial fetch on mount and when orderId changes
	useEffect(() => {
		void fetchOrder()
	}, [fetchOrder])

	return {
		order,
		isLoading,
		error,
		refresh,
	}
}

export default useOrderDetails

