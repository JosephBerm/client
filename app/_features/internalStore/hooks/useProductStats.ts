/**
 * useProductStats Hook
 * 
 * Fetches and manages product statistics for the internal store dashboard.
 * Follows the same pattern as useProviderStats and useCustomerStats.
 * 
 * @module internalStore/hooks
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { logger } from '@_core'
import { HttpService, notificationService } from '@_shared'

import type { ProductStats } from '../types'

/**
 * Default stats when loading or on error.
 */
const DEFAULT_STATS: ProductStats = {
	totalProducts: 0,
	activeProducts: 0,
	archivedProducts: 0,
	lowStockProducts: 0,
	outOfStockProducts: 0,
	totalInventoryValue: 0,
	categoryCount: 0,
}

interface UseProductStatsReturn {
	/** Product statistics */
	stats: ProductStats
	/** Whether stats are loading */
	isLoading: boolean
	/** Error message if any */
	error: string | null
	/** Refetch stats manually */
	refetch: () => Promise<void>
}

/**
 * Hook for fetching product statistics.
 * 
 * Fetches from /products/stats endpoint and provides:
 * - Total products count
 * - Active vs archived counts
 * - Low/out of stock counts
 * - Total inventory value
 * - Category count
 * 
 * @example
 * ```tsx
 * const { stats, isLoading, refetch } = useProductStats()
 * 
 * if (isLoading) return <Skeleton />
 * 
 * return (
 *   <StatsGrid>
 *     <StatCard title="Total Products" value={stats.totalProducts} />
 *     <StatCard title="Low Stock" value={stats.lowStockProducts} />
 *   </StatsGrid>
 * )
 * ```
 */
export function useProductStats(): UseProductStatsReturn {
	const [stats, setStats] = useState<ProductStats>(DEFAULT_STATS)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchStats = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const { data } = await HttpService.get<ProductStats>('/products/stats')

			if (data.statusCode !== 200) {
				setError(data.message ?? 'Failed to fetch product statistics')
				logger.warn('Product stats fetch failed', {
					statusCode: data.statusCode,
					message: data.message,
					component: 'useProductStats',
				})
				return
			}

			if (data.payload) {
				setStats(data.payload)
			}
		} catch (err) {
			const errorMessage = 'Failed to fetch product statistics'
			setError(errorMessage)
			logger.error('Product stats fetch error', {
				error: err,
				component: 'useProductStats',
			})
			// Don't show notification for stats - non-critical failure
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Fetch on mount
	useEffect(() => {
		void fetchStats()
	}, [fetchStats])

	const refetch = useCallback(async () => {
		await fetchStats()
	}, [fetchStats])

	return {
		stats,
		isLoading,
		error,
		refetch,
	}
}

export default useProductStats

