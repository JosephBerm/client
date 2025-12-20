'use client'

/**
 * useDashboardStats Hook
 *
 * Fetches dashboard statistics based on user role.
 * **MAANG-Level Architecture**: Uses useFetchWithCache for SWR pattern.
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Custom Hooks
 * @module useDashboardStats
 */

import { useFetchWithCache } from '@_shared/hooks/useFetchWithCache'
import API from '@_shared/services/api'

import type { DashboardStats } from '@_types/dashboard.types'

/**
 * Cache key for dashboard stats.
 * Follows MAANG naming convention: domain-resource-action
 */
const CACHE_KEY = 'dashboard-stats'

/**
 * Cache configuration (MAANG-level defaults)
 * - staleTime: 2 minutes (dashboard data can tolerate slight staleness)
 * - cacheTime: 10 minutes (preserve cache for navigation)
 * - revalidateOnFocus: true (refresh on tab focus)
 */
const CACHE_OPTIONS = {
	staleTime: 2 * 60 * 1000, // 2 minutes
	cacheTime: 10 * 60 * 1000, // 10 minutes
	revalidateOnFocus: true,
	revalidateOnReconnect: true,
	retry: 2,
	componentName: 'useDashboardStats',
}

/**
 * Hook for fetching dashboard statistics.
 * 
 * **Features (via useFetchWithCache):**
 * - SWR pattern (stale-while-revalidate)
 * - Request deduplication
 * - Automatic revalidation on focus
 * - Retry with exponential backoff
 * - Cache invalidation
 *
 * @returns Dashboard stats, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { stats, isLoading, error, refetch } = useDashboardStats()
 *
 * if (isLoading) return <Spinner />
 * if (error) return <ErrorMessage error={error} />
 *
 * return <StatsDisplay stats={stats} />
 * ```
 */
export function useDashboardStats() {
	const {
		data: stats,
		isLoading,
		isValidating,
		error,
		refetch,
		invalidate,
		isFromCache,
	} = useFetchWithCache<DashboardStats>(
		CACHE_KEY,
		() => API.Dashboard.getStats(),
		CACHE_OPTIONS
	)

	return {
		stats,
		isLoading,
		isValidating,
		error,
		refetch,
		invalidate,
		isFromCache,
	}
}

export default useDashboardStats
