'use client'

/**
 * useAnalyticsSummary Hook
 *
 * Custom hook for fetching and managing analytics summary data.
 * Uses useFetchWithCache for MAANG-level caching and deduplication.
 *
 * @see prd_analytics.md - Section 5.2 Frontend Hooks
 * @see useFetchWithCache for SWR implementation details
 * @module analytics/hooks/useAnalyticsSummary
 */

import { useCallback, useMemo, useState } from 'react'

import API from '@_shared/services/api'
import { useFetchWithCache } from '@_shared/hooks'
import type { AnalyticsSummary, TimeRangePreset } from '@_types/analytics.types'

import { getAnalyticsDateRange, getAnalyticsCacheKey } from './analyticsDateUtils'

export interface UseAnalyticsSummaryOptions {
	/** Initial time range preset */
	initialTimeRange?: TimeRangePreset
	/** Auto-fetch on mount */
	autoFetch?: boolean
}

export interface UseAnalyticsSummaryReturn {
	/** Analytics summary data */
	data: AnalyticsSummary | null
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
	/** Custom start date (when timeRange is 'custom') */
	startDate: string | null
	/** Custom end date (when timeRange is 'custom') */
	endDate: string | null
	/** Whether data came from cache */
	isFromCache: boolean
	/** Fetch analytics data */
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
 * Hook for fetching and managing analytics summary data.
 * Leverages useFetchWithCache for SWR pattern caching.
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   timeRange,
 *   setTimeRange,
 *   fetchData
 * } = useAnalyticsSummary({ initialTimeRange: '12m' })
 *
 * // Change time range - automatically refetches
 * setTimeRange('30d')
 * ```
 */
export function useAnalyticsSummary(
	options: UseAnalyticsSummaryOptions = {}
): UseAnalyticsSummaryReturn {
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
		() => getAnalyticsCacheKey('analytics-summary', dateParams.startDate, dateParams.endDate),
		[dateParams.startDate, dateParams.endDate]
	)

	// Use the MAANG-level useFetchWithCache hook
	const {
		data,
		isLoading,
		isValidating,
		error: fetchError,
		refetch,
		invalidate,
		isFromCache,
	} = useFetchWithCache<AnalyticsSummary>(
		cacheKey,
		() => API.Analytics.getSummary(dateParams.startDate, dateParams.endDate),
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 30 * 60 * 1000, // 30 minutes
			revalidateOnFocus: true,
			retry: 3,
			enabled: autoFetch,
			componentName: 'useAnalyticsSummary',
		}
	)

	// Derived state
	const hasLoaded = !isLoading && (data !== null || fetchError !== null)
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
		startDate: customStartDate,
		endDate: customEndDate,
		isFromCache,
		fetchData,
		setTimeRange,
		setCustomDateRange,
		retry,
		invalidate,
	}
}

export default useAnalyticsSummary
