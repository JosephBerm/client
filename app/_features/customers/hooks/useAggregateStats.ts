/**
 * useAggregateStats Hook
 * 
 * Fetches aggregate customer statistics for the dashboard.
 * Provides counts by status and assignment metrics.
 * 
 * @module customers/hooks
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { API, notificationService } from '@_shared'

import type { AggregateCustomerStats } from '../types'

interface UseAggregateStatsOptions {
	/** Whether to fetch on mount */
	enabled?: boolean
}

interface UseAggregateStatsReturn {
	stats: AggregateCustomerStats | null
	isLoading: boolean
	error: Error | null
	refetch: () => Promise<void>
}

const defaultStats: AggregateCustomerStats = {
	totalCustomers: 0,
	activeCustomers: 0,
	pendingVerification: 0,
	suspendedCustomers: 0,
	inactiveCustomers: 0,
	churnedCustomers: 0,
	assignedToSalesRep: 0,
	unassigned: 0,
	byBusinessType: {},
}

/**
 * Hook for fetching aggregate customer statistics.
 * 
 * @example
 * ```tsx
 * const { stats, isLoading, refetch } = useAggregateStats()
 * 
 * return (
 *   <div>
 *     <p>Total: {stats?.totalCustomers}</p>
 *     <p>Active: {stats?.activeCustomers}</p>
 *   </div>
 * )
 * ```
 */
export function useAggregateStats(
	options: UseAggregateStatsOptions = {}
): UseAggregateStatsReturn {
	const { enabled = true } = options
	
	const [stats, setStats] = useState<AggregateCustomerStats | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const fetchStats = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			const { data } = await API.Customers.getAggregateStats()

			if (data.statusCode === 200 && data.payload) {
				setStats(data.payload)
			} else {
				throw new Error(data.message || 'Failed to fetch aggregate stats')
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			setError(new Error(errorMessage))
			setStats(defaultStats)
			
			// Silently handle errors for aggregate stats (non-critical)
			console.error('Failed to fetch aggregate customer stats:', err)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		if (enabled) {
			void fetchStats()
		}
	}, [enabled, fetchStats])

	return {
		stats,
		isLoading,
		error,
		refetch: fetchStats,
	}
}

export default useAggregateStats

