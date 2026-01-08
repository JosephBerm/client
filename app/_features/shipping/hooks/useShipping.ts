/**
 * Shipping TanStack Query Hooks (MVP Feature #03)
 *
 * Custom hooks for shipping operations using TanStack Query.
 * Provides caching, optimistic updates, and proper error handling.
 *
 * **Architecture Pattern:**
 * - Uses centralized API.Shipping for all API calls
 * - Follows project conventions for data fetching
 *
 * @see docs/MVP_IMPLEMENTATION_PLANS/03_SHIPPING_INTEGRATION_PLAN.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import API from '@_shared/services/api'
import type { CreateLabelRequest, ShippingRateRequest } from '../types'

// =========================================================================
// QUERY KEY FACTORY
// =========================================================================

/**
 * Query key factory for shipping operations.
 * Ensures consistent cache key naming.
 */
export const shippingKeys = {
	all: ['shipping'] as const,
	rates: () => [...shippingKeys.all, 'rates'] as const,
	labels: () => [...shippingKeys.all, 'labels'] as const,
	label: (id: string) => [...shippingKeys.labels(), id] as const,
	orderLabels: (orderId: number) => [...shippingKeys.labels(), 'order', orderId] as const,
	tracking: (trackingNumber: string) => [...shippingKeys.all, 'tracking', trackingNumber] as const,
}

// =========================================================================
// RATE SHOPPING HOOKS
// =========================================================================

/**
 * Hook for fetching shipping rates.
 * Uses mutation since rate requests have parameters.
 */
export function useGetShippingRates() {
	return useMutation({
		mutationFn: async (request: ShippingRateRequest) => {
			const response = await API.Shipping.getRates(request)
			return response.data.payload!
		},
	})
}

// =========================================================================
// LABEL HOOKS
// =========================================================================

/**
 * Hook for fetching a single shipping label.
 */
export function useShippingLabel(labelId: string | undefined) {
	return useQuery({
		queryKey: shippingKeys.label(labelId || ''),
		queryFn: async () => {
			const response = await API.Shipping.getLabel(labelId!)
			return response.data.payload!
		},
		enabled: !!labelId,
	})
}

/**
 * Hook for fetching all shipping labels for an order.
 */
export function useOrderShippingLabels(orderId: number | undefined) {
	return useQuery({
		queryKey: shippingKeys.orderLabels(orderId || 0),
		queryFn: async () => {
			const response = await API.Shipping.getOrderLabels(orderId!)
			return response.data.payload!
		},
		enabled: !!orderId,
	})
}

/**
 * Hook for creating a shipping label.
 */
export function useCreateShippingLabel() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (request: CreateLabelRequest) => {
			const response = await API.Shipping.createLabel(request)
			return response.data.payload!
		},
		onSuccess: (newLabel) => {
			// Invalidate order labels cache
			queryClient.invalidateQueries({
				queryKey: shippingKeys.orderLabels(newLabel.orderId),
			})
		},
	})
}

/**
 * Hook for voiding a shipping label.
 */
export function useVoidShippingLabel() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (labelId: string) => {
			const response = await API.Shipping.voidLabel(labelId)
			return response.data.payload!
		},
		onSuccess: (_result, labelId) => {
			// Invalidate the specific label cache
			queryClient.invalidateQueries({
				queryKey: shippingKeys.label(labelId),
			})
			// Also invalidate all labels lists
			queryClient.invalidateQueries({
				queryKey: shippingKeys.labels(),
			})
		},
	})
}

// =========================================================================
// TRACKING HOOKS
// =========================================================================

/**
 * Hook for fetching tracking information.
 */
export function useShippingTracking(trackingNumber: string | undefined, carrier?: string) {
	return useQuery({
		queryKey: shippingKeys.tracking(trackingNumber || ''),
		queryFn: async () => {
			const response = await API.Shipping.getTracking(trackingNumber!, carrier)
			return response.data.payload!
		},
		enabled: !!trackingNumber,
		// Tracking info is relatively dynamic, refresh every 5 minutes
		staleTime: 5 * 60 * 1000,
	})
}
