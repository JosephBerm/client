/**
 * useOrderActivity Hook
 *
 * Fetches order activity logs for the activity feed.
 * Uses React Query for caching and background refresh.
 *
 * @module app/orders/[id]/_components/hooks/useOrderActivity
 */

'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { API } from '@_shared'

import type { OrderActivityLogItem } from '@_types/order.types'

export const orderActivityKeys = {
	all: ['order-activity'] as const,
	byOrder: (orderId: string) => [...orderActivityKeys.all, orderId] as const,
}

export function useOrderActivity(
	orderId: string | null | undefined,
	options?: Omit<UseQueryOptions<OrderActivityLogItem[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: orderId ? orderActivityKeys.byOrder(orderId) : orderActivityKeys.all,
		queryFn: async () => {
			const response = await API.Orders.getActivity(orderId!)
			if (!response.data.payload) {
				throw new Error(response.data.message || 'Failed to load order activity')
			}
			return response.data.payload
		},
		enabled: !!orderId,
		staleTime: 30_000,
		...options,
	})
}

export default useOrderActivity
