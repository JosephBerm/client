/**
 * useProviderStats Hook
 * 
 * Fetches aggregate provider statistics for the dashboard.
 * Provides counts by status and other metrics.
 * 
 * **Uses API service for consistency with other features.**
 * 
 * **React Compiler Optimization:**
 * No useCallback needed - React Compiler handles memoization automatically.
 * 
 * @module providers/hooks
 */

'use client'

import { useEffect, useState } from 'react'

import { API } from '@_shared'
import { logger } from '@_core'

import type { AggregateProviderStats } from '../types'

interface UseProviderStatsOptions {
	/** Whether to fetch on mount */
	enabled?: boolean
}

interface UseProviderStatsReturn {
	stats: AggregateProviderStats | null
	isLoading: boolean
	error: Error | null
	refetch: () => Promise<void>
}

const defaultStats: AggregateProviderStats = {
	totalProviders: 0,
	activeProviders: 0,
	suspendedProviders: 0,
	archivedProviders: 0,
	newThisMonth: 0,
	withProducts: 0,
	withoutProducts: 0,
}

/**
 * Hook for fetching aggregate provider statistics.
 * 
 * @example
 * ```tsx
 * const { stats, isLoading, refetch } = useProviderStats()
 * 
 * return (
 *   <div>
 *     <p>Total: {stats?.totalProviders}</p>
 *     <p>Active: {stats?.activeProviders}</p>
 *   </div>
 * )
 * ```
 */
export function useProviderStats(
	options: UseProviderStatsOptions = {}
): UseProviderStatsReturn {
	const { enabled = true } = options
	
	const [stats, setStats] = useState<AggregateProviderStats | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	// React Compiler handles memoization - no useCallback needed
	const fetchStats = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Use centralized API service for consistency
			const { data } = await API.Providers.getAggregateStats()

			if (data.statusCode === 200 && data.payload) {
				setStats(data.payload)
			} else {
				throw new Error(data.message || 'Failed to fetch provider stats')
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Unknown error'
			setError(new Error(errorMessage))
			setStats(defaultStats)
			
			// Silently handle errors for aggregate stats (non-critical)
			logger.warn('Failed to fetch aggregate provider stats', { error: err })
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (enabled) {
			void fetchStats()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- fetchStats is stable via React Compiler
	}, [enabled])

	return {
		stats,
		isLoading,
		error,
		refetch: fetchStats,
	}
}

export default useProviderStats

