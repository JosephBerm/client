'use client'

/**
 * useRevenueTimeline Hook
 *
 * Custom hook for fetching revenue timeline data for charts.
 * Uses useFetchWithCache for MAANG-level caching and deduplication.
 * Only available for SalesManager and Admin roles.
 *
 * @see prd_analytics.md - US-ANA-003
 * @see useFetchWithCache for SWR implementation details
 * @module analytics/hooks/useRevenueTimeline
 */

import { useCallback, useMemo, useState } from 'react'

import API from '@_shared/services/api'
import { useFetchWithCache, useRealtimeSubscription } from '@_shared/hooks'
import { useTenant } from '@_shared'
import { useAuthStore } from '@_features/auth'
import type { AnalyticsRevenueUpdatedEvent } from '@_shared/services/realtime/realtimeEventTypes'
import { getDateRange, serializeDateOnly } from '@_lib'
import type { RevenueData, TimelineGranularity } from '@_types/analytics.types'

import { getAnalyticsCacheKey } from './analyticsDateUtils'

export interface UseRevenueTimelineOptions {
	/** Initial granularity */
	initialGranularity?: TimelineGranularity
	/** Initial start date (default: 12 months ago) */
	initialStartDate?: string
	/** Initial end date (default: today) */
	initialEndDate?: string
	/** Auto-fetch on mount */
	autoFetch?: boolean
}

export interface UseRevenueTimelineReturn {
	/** Revenue timeline data */
	data: RevenueData[]
	/** Loading state (initial load) */
	isLoading: boolean
	/** Background revalidation state */
	isValidating: boolean
	/** Error message */
	error: string | null
	/** Whether initial data has been loaded */
	hasLoaded: boolean
	/** Current granularity */
	granularity: TimelineGranularity
	/** Current start date */
	startDate: string
	/** Current end date */
	endDate: string
	/** Whether data came from cache */
	isFromCache: boolean
	/** Fetch revenue timeline data */
	fetchData: () => Promise<void>
	/** Change granularity */
	setGranularity: (granularity: TimelineGranularity) => void
	/** Set date range */
	setDateRange: (startDate: string, endDate: string) => void
	/** Retry after error */
	retry: () => Promise<void>
	/** Invalidate cache */
	invalidate: () => void
}

/**
 * Get default date range using @_lib utilities (12 months / 1 year)
 */
function getDefaultDateRange(): { startDate: string; endDate: string } {
	const now = new Date()
	const range = getDateRange('1y', now)
	return {
		startDate: serializeDateOnly(range.from) ?? range.from.toISOString().split('T')[0],
		endDate: serializeDateOnly(range.to) ?? range.to.toISOString().split('T')[0],
	}
}

/**
 * Hook for fetching revenue timeline data.
 * Leverages useFetchWithCache for SWR pattern caching.
 *
 * @example
 * ```tsx
 * const { data, isLoading, granularity, setGranularity } = useRevenueTimeline()
 *
 * // Change to weekly view
 * setGranularity('week')
 * ```
 */
export function useRevenueTimeline(
	options: UseRevenueTimelineOptions = {}
): UseRevenueTimelineReturn {
	const { initialGranularity = 'month', initialStartDate, initialEndDate, autoFetch = true } =
		options
	const { uiConfig } = useTenant()
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const isAuthLoading = useAuthStore((state) => state.isLoading)
	const isRealtimeEnabled = uiConfig?.enabledFeatures?.includes('realtime-sockets') ?? false
	const shouldSubscribe = !isAuthLoading && isAuthenticated && isRealtimeEnabled

	// Get default dates using @_lib
	const defaultRange = useMemo(() => getDefaultDateRange(), [])

	// State
	const [granularity, setGranularityState] = useState<TimelineGranularity>(initialGranularity)
	const [startDate, setStartDate] = useState<string>(initialStartDate || defaultRange.startDate)
	const [endDate, setEndDate] = useState<string>(initialEndDate || defaultRange.endDate)

	// Cache key based on all parameters
	const cacheKey = useMemo(
		() => getAnalyticsCacheKey(`revenue-timeline-${granularity}`, startDate, endDate),
		[granularity, startDate, endDate]
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
	} = useFetchWithCache<RevenueData[]>(
		cacheKey,
		() => API.Analytics.getRevenueTimeline(startDate, endDate, granularity),
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 30 * 60 * 1000, // 30 minutes
			revalidateOnFocus: true,
			retry: 3,
			enabled: autoFetch,
			componentName: 'useRevenueTimeline',
		}
	)

	// Ensure data is always an array
	const data = rawData ?? []

	// Derived state
	const hasLoaded = !isLoading && (rawData !== null || fetchError !== null)
	const error = fetchError?.message ?? null

	/**
	 * Set granularity - triggers refetch via cache key change
	 */
	const setGranularity = useCallback((newGranularity: TimelineGranularity) => {
		setGranularityState(newGranularity)
	}, [])

	/**
	 * Set date range - triggers refetch via cache key change
	 */
	const setDateRange = useCallback((start: string, end: string) => {
		setStartDate(start)
		setEndDate(end)
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

	const handleRealtimeUpdate = useCallback(
		async (_payload: AnalyticsRevenueUpdatedEvent) => {
			await refetch()
		},
		[refetch]
	)

	useRealtimeSubscription<AnalyticsRevenueUpdatedEvent>(
		'analytics.revenue.updated',
		handleRealtimeUpdate,
		shouldSubscribe
	)

	return {
		data,
		isLoading,
		isValidating,
		error,
		hasLoaded,
		granularity,
		startDate,
		endDate,
		isFromCache,
		fetchData,
		setGranularity,
		setDateRange,
		retry,
		invalidate,
	}
}

export default useRevenueTimeline
