'use client'

/**
 * useRecentItems Hook
 *
 * Fetches recent items (quotes and orders) based on user role.
 * **MAANG-Level Architecture**: Uses useFetchWithCache for SWR pattern.
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Custom Hooks
 * @module useRecentItems
 */

import { useMemo } from 'react'

import { useFetchWithCache } from '@_shared/hooks/useFetchWithCache'
import API from '@_shared/services/api'

import type { RecentItem } from '@_types/dashboard.types'

/**
 * Get cache key for recent items (includes count for unique caching)
 * Follows MAANG naming convention: domain-resource-action-params
 */
const getCacheKey = (count: number) => `dashboard-recent-items-${count}`

/**
 * Cache configuration (MAANG-level defaults)
 * - staleTime: 2 minutes (recent items can tolerate slight staleness)
 * - cacheTime: 10 minutes (preserve cache for navigation)
 * - revalidateOnFocus: true (refresh on tab focus)
 */
const CACHE_OPTIONS = {
	staleTime: 2 * 60 * 1000, // 2 minutes
	cacheTime: 10 * 60 * 1000, // 10 minutes
	revalidateOnFocus: true,
	revalidateOnReconnect: true,
	retry: 2,
	componentName: 'useRecentItems',
}

/**
 * Hook for fetching recent items (quotes and orders).
 *
 * **Features (via useFetchWithCache):**
 * - SWR pattern (stale-while-revalidate)
 * - Request deduplication
 * - Automatic revalidation on focus
 * - Retry with exponential backoff
 *
 * **Derived State:**
 * - recentOrders: Items of type 'order'
 * - recentQuotes: Items of type 'quote'
 *
 * @param count - Number of recent items to fetch (default: 5)
 * @returns Items, order/quote filtered lists, loading state, error, refetch
 *
 * @example
 * ```tsx
 * const { recentOrders, recentQuotes, isLoading } = useRecentItems(10)
 *
 * if (isLoading) return <Spinner />
 *
 * return (
 *   <>
 *     <RecentOrdersTable items={recentOrders} />
 *     <RecentQuotesTable items={recentQuotes} />
 *   </>
 * )
 * ```
 */
export function useRecentItems(count: number = 5) {
	const {
		data: items,
		isLoading,
		isValidating,
		error,
		refetch,
		invalidate,
		isFromCache,
	} = useFetchWithCache<RecentItem[]>(
		getCacheKey(count),
		() => API.Dashboard.getRecentItems(count),
		CACHE_OPTIONS
	)

	// Memoized derived state for order/quote separation
	const { recentOrders, recentQuotes } = useMemo(() => {
		if (!items) {
			return { recentOrders: [], recentQuotes: [] }
		}
		
		return {
			recentOrders: items.filter((item) => item.type === 'order'),
			recentQuotes: items.filter((item) => item.type === 'quote'),
		}
	}, [items])

	return {
		items: items ?? [],
		recentOrders,
		recentQuotes,
		isLoading,
		isValidating,
		error,
		refetch,
		invalidate,
		isFromCache,
	}
}

export default useRecentItems
