/**
 * useCustomerStats Hook
 * 
 * Fetches and manages individual customer statistics data.
 * Uses the centralized API service for consistency.
 * 
 * @module customers/hooks
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { API } from '@_shared'

import { logger } from '@/app/_core'

import type { CustomerStats } from '../types'

interface UseCustomerStatsOptions {
	/** Customer ID to fetch stats for */
	customerId: number | null
	/** Disable automatic fetching */
	enabled?: boolean
}

interface UseCustomerStatsReturn {
	/** Customer statistics data */
	stats: CustomerStats | null
	/** Loading state */
	isLoading: boolean
	/** Error message if fetch failed */
	error: string | null
	/** Refresh stats data */
	refetch: () => Promise<void>
}

/**
 * Hook for fetching individual customer statistics.
 * 
 * @example
 * ```tsx
 * const { stats, isLoading, error, refetch } = useCustomerStats({
 *   customerId: 123,
 * })
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage message={error} />
 * 
 * return <CustomerStatsCard stats={stats} />
 * ```
 */
export function useCustomerStats({
	customerId,
	enabled = true,
}: UseCustomerStatsOptions): UseCustomerStatsReturn {
	const [stats, setStats] = useState<CustomerStats | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchStats = useCallback(async () => {
		if (!customerId || !enabled) {
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const { data } = await API.Customers.getStats(customerId)

			if (data.statusCode === 200 && data.payload) {
				setStats({
					customerId: data.payload.customerId,
					totalOrders: data.payload.totalOrders,
					totalQuotes: data.payload.totalQuotes,
					totalAccounts: data.payload.totalAccounts,
					totalRevenue: data.payload.totalRevenue,
					lastOrderDate: data.payload.lastOrderDate
						? new Date(data.payload.lastOrderDate)
						: null,
					createdAt: new Date(data.payload.createdAt),
				})
			} else {
				throw new Error(data.message ?? 'Failed to fetch customer statistics')
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load customer stats'
			setError(message)
			logger.error('useCustomerStats: Failed to fetch stats', {
				customerId,
				error: err,
			})
		} finally {
			setIsLoading(false)
		}
	}, [customerId, enabled])

	useEffect(() => {
		void fetchStats()
	}, [fetchStats])

	return {
		stats,
		isLoading,
		error,
		refetch: fetchStats,
	}
}

export default useCustomerStats

