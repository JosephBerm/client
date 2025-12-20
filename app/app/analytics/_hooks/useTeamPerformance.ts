'use client'

/**
 * useTeamPerformance Hook
 *
 * Custom hook for fetching team performance analytics.
 * Uses useFetchWithCache for MAANG-level caching and deduplication.
 * Only available for SalesManager and Admin roles.
 *
 * @see prd_analytics.md - US-ANA-002
 * @see useFetchWithCache for SWR implementation details
 * @module analytics/hooks/useTeamPerformance
 */

import { useCallback, useMemo, useState } from 'react'

import API from '@_shared/services/api'
import { useFetchWithCache } from '@_shared/hooks'
import type { SalesRepPerformance, TimeRangePreset } from '@_types/analytics.types'

import { getAnalyticsDateRange, getAnalyticsCacheKey } from './analyticsDateUtils'

export interface UseTeamPerformanceOptions {
	/** Initial time range preset */
	initialTimeRange?: TimeRangePreset
	/** Auto-fetch on mount */
	autoFetch?: boolean
}

export interface UseTeamPerformanceReturn {
	/** Team performance data */
	data: SalesRepPerformance[]
	/** Loading state (initial load) */
	isLoading: boolean
	/** Background revalidation state */
	isValidating: boolean
	/** Error message */
	error: string | null
	/** Whether initial data has been loaded */
	hasLoaded: boolean
	/** Current time range preset */
	timeRange: TimeRangePreset
	/** Whether data came from cache */
	isFromCache: boolean
	/** Fetch team performance data */
	fetchData: () => Promise<void>
	/** Change time range preset */
	setTimeRange: (preset: TimeRangePreset) => void
	/** Set custom date range */
	setCustomDateRange: (startDate: string, endDate: string) => void
	/** Retry after error */
	retry: () => Promise<void>
	/** Invalidate cache */
	invalidate: () => void
}

/**
 * Hook for fetching team performance analytics.
 * Leverages useFetchWithCache for SWR pattern caching.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useTeamPerformance()
 *
 * // Render leaderboard
 * data.map(rep => (
 *   <div key={rep.salesRepId}>{rep.salesRepName}: {rep.conversionRate}%</div>
 * ))
 * ```
 */
export function useTeamPerformance(
	options: UseTeamPerformanceOptions = {}
): UseTeamPerformanceReturn {
	const { initialTimeRange = '12m', autoFetch = true } = options

	// Time range state
	const [timeRange, setTimeRangeState] = useState<TimeRangePreset>(initialTimeRange)
	const [customStartDate, setCustomStartDate] = useState<string | null>(null)
	const [customEndDate, setCustomEndDate] = useState<string | null>(null)

	// Calculate date parameters based on time range
	const dateParams = useMemo(() => {
		if (timeRange === 'custom' && customStartDate && customEndDate) {
			return { startDate: customStartDate, endDate: customEndDate }
		}
		if (timeRange !== 'custom') {
			return getAnalyticsDateRange(timeRange)
		}
		return { startDate: undefined, endDate: undefined }
	}, [timeRange, customStartDate, customEndDate])

	// Cache key based on date parameters
	const cacheKey = useMemo(
		() => getAnalyticsCacheKey('team-performance', dateParams.startDate, dateParams.endDate),
		[dateParams.startDate, dateParams.endDate]
	)

	// Use the MAANG-level useFetchWithCache hook
	const {
		data: rawData,
		isLoading,
		isValidating,
		error: fetchError,
		refetch,
		invalidate,
		isFromCache,
	} = useFetchWithCache<SalesRepPerformance[]>(
		cacheKey,
		() => API.Analytics.getTeamPerformance(dateParams.startDate, dateParams.endDate),
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 30 * 60 * 1000, // 30 minutes
			revalidateOnFocus: true,
			retry: 3,
			enabled: autoFetch,
			componentName: 'useTeamPerformance',
		}
	)

	// Ensure data is always an array
	const data = rawData ?? []

	// Derived state
	const hasLoaded = !isLoading && (rawData !== null || fetchError !== null)
	const error = fetchError?.message ?? null

	/**
	 * Set time range preset - triggers refetch via cache key change
	 */
	const setTimeRange = useCallback((preset: TimeRangePreset) => {
		setTimeRangeState(preset)
		if (preset !== 'custom') {
			setCustomStartDate(null)
			setCustomEndDate(null)
		}
	}, [])

	/**
	 * Set custom date range
	 */
	const setCustomDateRange = useCallback((start: string, end: string) => {
		setTimeRangeState('custom')
		setCustomStartDate(start)
		setCustomEndDate(end)
	}, [])

	/**
	 * Manual fetch trigger
	 */
	const fetchData = useCallback(async () => {
		await refetch()
	}, [refetch])

	/**
	 * Retry after error
	 */
	const retry = useCallback(async () => {
		await refetch()
	}, [refetch])

	return {
		data,
		isLoading,
		isValidating,
		error,
		hasLoaded,
		timeRange,
		isFromCache,
		fetchData,
		setTimeRange,
		setCustomDateRange,
		retry,
		invalidate,
	}
}

export default useTeamPerformance
