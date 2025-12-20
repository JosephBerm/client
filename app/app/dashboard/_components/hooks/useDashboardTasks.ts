'use client'

/**
 * useDashboardTasks Hook
 *
 * Fetches dashboard tasks based on user role.
 * **MAANG-Level Architecture**: Uses useFetchWithCache for SWR pattern.
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Custom Hooks
 * @module useDashboardTasks
 */

import { useMemo } from 'react'

import { useFetchWithCache } from '@_shared/hooks/useFetchWithCache'
import API from '@_shared/services/api'

import type { DashboardTask } from '@_types/dashboard.types'

/**
 * Cache key for dashboard tasks.
 * Follows MAANG naming convention: domain-resource-action
 */
const CACHE_KEY = 'dashboard-tasks'

/**
 * Cache configuration (MAANG-level defaults)
 * - staleTime: 1 minute (tasks need fresher data than stats)
 * - cacheTime: 5 minutes (shorter cache for action items)
 * - revalidateOnFocus: true (critical to see new tasks)
 */
const CACHE_OPTIONS = {
	staleTime: 1 * 60 * 1000, // 1 minute
	cacheTime: 5 * 60 * 1000, // 5 minutes
	revalidateOnFocus: true,
	revalidateOnReconnect: true,
	retry: 2,
	componentName: 'useDashboardTasks',
}

/**
 * Hook for fetching dashboard tasks.
 *
 * **Features (via useFetchWithCache):**
 * - SWR pattern (stale-while-revalidate)
 * - Request deduplication
 * - Automatic revalidation on focus
 * - Retry with exponential backoff
 *
 * **Derived State:**
 * - urgentTasks: Tasks marked as urgent (separate list)
 * - regularTasks: Non-urgent tasks
 *
 * @returns Tasks, urgent/regular filtered lists, loading state, error, refetch
 *
 * @example
 * ```tsx
 * const { tasks, urgentTasks, regularTasks, isLoading, error } = useDashboardTasks()
 *
 * if (isLoading) return <Spinner />
 *
 * return (
 *   <>
 *     <UrgentTasksList tasks={urgentTasks} />
 *     <RegularTasksList tasks={regularTasks} />
 *   </>
 * )
 * ```
 */
export function useDashboardTasks() {
	const {
		data: tasks,
		isLoading,
		isValidating,
		error,
		refetch,
		invalidate,
		isFromCache,
	} = useFetchWithCache<DashboardTask[]>(
		CACHE_KEY,
		() => API.Dashboard.getTasks(),
		CACHE_OPTIONS
	)

	// Memoized derived state for urgent/regular task separation
	const { urgentTasks, regularTasks } = useMemo(() => {
		if (!tasks) {
			return { urgentTasks: [], regularTasks: [] }
		}
		
		return {
			urgentTasks: tasks.filter((task) => task.isUrgent),
			regularTasks: tasks.filter((task) => !task.isUrgent),
		}
	}, [tasks])

	return {
		tasks: tasks ?? [],
		urgentTasks,
		regularTasks,
		isLoading,
		isValidating,
		error,
		refetch,
		invalidate,
		isFromCache,
	}
}

export default useDashboardTasks
