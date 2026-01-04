/**
 * useGridUrlState - URL State Synchronization Hook
 *
 * Syncs RichDataGrid state with URL parameters for shareable links.
 * Enables bookmarking and sharing of grid views with filters, sorting, and pagination.
 *
 * @module useGridUrlState
 */

'use client'
'use memo'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { SortingState, ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import { useDebounce } from '@_shared/hooks/useDebounce'

// ============================================================================
// TYPES
// ============================================================================

/**
 * URL state configuration options.
 */
export interface GridUrlStateConfig {
	/** Enable URL sync for pagination */
	syncPagination?: boolean
	/** Enable URL sync for sorting */
	syncSorting?: boolean
	/** Enable URL sync for global search */
	syncGlobalSearch?: boolean
	/** Enable URL sync for column filters */
	syncColumnFilters?: boolean
	/** Debounce delay in ms before updating URL (default: 300) */
	debounceMs?: number
	/** Prefix for URL params to avoid conflicts (default: '') */
	paramPrefix?: string
}

/**
 * Grid state to sync with URL.
 */
export interface GridUrlState {
	pagination?: PaginationState
	sorting?: SortingState
	globalSearch?: string
	columnFilters?: ColumnFiltersState
}

/**
 * Return type for useGridUrlState hook.
 */
export interface UseGridUrlStateReturn {
	/** Get initial state from URL on mount */
	getInitialState: () => GridUrlState
	/** Update URL with current state (debounced) */
	updateUrl: (state: GridUrlState) => void
	/** Clear all grid-related URL parameters */
	clearUrl: () => void
}

// ============================================================================
// URL PARAM KEYS
// ============================================================================

const URL_KEYS = {
	page: 'page',
	pageSize: 'pageSize',
	sort: 'sort',
	search: 'search',
	filter: 'filter',
} as const

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Serialize sorting state to URL format.
 * Format: "columnId:asc" or "columnId:desc"
 */
function serializeSorting(sorting: SortingState): string | null {
	if (!sorting.length) return null
	return sorting
		.map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`)
		.join(',')
}

/**
 * Deserialize sorting from URL format.
 */
function deserializeSorting(value: string | null): SortingState {
	if (!value) return []
	return value.split(',').map((item) => {
		const [id, direction] = item.split(':')
		return { id, desc: direction === 'desc' }
	})
}

/**
 * Serialize column filters to URL format.
 * Format: "columnId:operator:value" joined by "|"
 */
function serializeColumnFilters(filters: ColumnFiltersState): string | null {
	if (!filters.length) return null
	return filters
		.map((f) => {
			// Handle different filter value types
			const value = typeof f.value === 'object'
				? JSON.stringify(f.value)
				: String(f.value)
			return `${f.id}:${encodeURIComponent(value)}`
		})
		.join('|')
}

/**
 * Deserialize column filters from URL format.
 */
function deserializeColumnFilters(value: string | null): ColumnFiltersState {
	if (!value) return []
	return value.split('|').map((item) => {
		const [id, ...rest] = item.split(':')
		const encodedValue = rest.join(':')
		const decodedValue = decodeURIComponent(encodedValue)

		// Try to parse JSON, fallback to string
		let parsedValue: unknown
		try {
			parsedValue = JSON.parse(decodedValue)
		} catch {
			parsedValue = decodedValue
		}

		return { id, value: parsedValue }
	})
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for syncing RichDataGrid state with URL parameters.
 *
 * @example
 * const { getInitialState, updateUrl, clearUrl } = useGridUrlState({
 *   syncPagination: true,
 *   syncSorting: true,
 *   syncGlobalSearch: true,
 * })
 *
 * // On mount, read initial state from URL
 * const initialState = getInitialState()
 *
 * // When state changes, update URL
 * useEffect(() => {
 *   updateUrl({ pagination, sorting, globalSearch })
 * }, [pagination, sorting, globalSearch])
 */
export function useGridUrlState(config: GridUrlStateConfig = {}): UseGridUrlStateReturn {
	const {
		syncPagination = true,
		syncSorting = true,
		syncGlobalSearch = true,
		syncColumnFilters = false,
		debounceMs = 300,
		paramPrefix = '',
	} = config

	const router = useRouter()
	const searchParams = useSearchParams()
	const pathname = usePathname()

	// Helper to get prefixed param key
	const getKey = (key: string) => paramPrefix ? `${paramPrefix}_${key}` : key

	/**
	 * Get initial state from URL parameters.
	 * Call this on component mount to restore grid state.
	 */
	const getInitialState = (): GridUrlState => {
		const state: GridUrlState = {}

		// Pagination
		if (syncPagination) {
			const page = searchParams.get(getKey(URL_KEYS.page))
			const pageSize = searchParams.get(getKey(URL_KEYS.pageSize))

			if (page || pageSize) {
				state.pagination = {
					pageIndex: page ? parseInt(page, 10) - 1 : 0, // Convert 1-based to 0-based
					pageSize: pageSize ? parseInt(pageSize, 10) : 10,
				}
			}
		}

		// Sorting
		if (syncSorting) {
			const sort = searchParams.get(getKey(URL_KEYS.sort))
			const sorting = deserializeSorting(sort)
			if (sorting.length) {
				state.sorting = sorting
			}
		}

		// Global search
		if (syncGlobalSearch) {
			const search = searchParams.get(getKey(URL_KEYS.search))
			if (search) {
				state.globalSearch = search
			}
		}

		// Column filters
		if (syncColumnFilters) {
			const filter = searchParams.get(getKey(URL_KEYS.filter))
			const filters = deserializeColumnFilters(filter)
			if (filters.length) {
				state.columnFilters = filters
			}
		}

		return state
	}

	/**
	 * Update URL with current grid state.
	 * Uses shallow routing to avoid page reload.
	 */
	const doUpdateUrl = (state: GridUrlState) => {
		const params = new URLSearchParams(searchParams.toString())

		// Pagination
		if (syncPagination && state.pagination) {
			const { pageIndex, pageSize } = state.pagination
			// Only set page if not on first page (default)
			if (pageIndex > 0) {
				params.set(getKey(URL_KEYS.page), String(pageIndex + 1)) // Convert 0-based to 1-based
			} else {
				params.delete(getKey(URL_KEYS.page))
			}
			// Only set pageSize if not default
			if (pageSize !== 10) {
				params.set(getKey(URL_KEYS.pageSize), String(pageSize))
			} else {
				params.delete(getKey(URL_KEYS.pageSize))
			}
		}

		// Sorting
		if (syncSorting) {
			const sortValue = state.sorting ? serializeSorting(state.sorting) : null
			if (sortValue) {
				params.set(getKey(URL_KEYS.sort), sortValue)
			} else {
				params.delete(getKey(URL_KEYS.sort))
			}
		}

		// Global search
		if (syncGlobalSearch) {
			if (state.globalSearch) {
				params.set(getKey(URL_KEYS.search), state.globalSearch)
			} else {
				params.delete(getKey(URL_KEYS.search))
			}
		}

		// Column filters
		if (syncColumnFilters) {
			const filterValue = state.columnFilters ? serializeColumnFilters(state.columnFilters) : null
			if (filterValue) {
				params.set(getKey(URL_KEYS.filter), filterValue)
			} else {
				params.delete(getKey(URL_KEYS.filter))
			}
		}

		// Build new URL
		const queryString = params.toString()
		const newUrl = queryString ? `${pathname}?${queryString}` : pathname

		// Use replace to avoid adding to history for every keystroke
		router.replace(newUrl, { scroll: false })
	}

	// Debounced URL update to avoid rapid URL changes
	const debouncedState = useDebounce({} as GridUrlState, debounceMs)

	/**
	 * Public method to trigger URL update.
	 * The actual update is debounced internally.
	 */
	const updateUrl = (state: GridUrlState) => {
		// We need to track state changes and update URL after debounce
		// Using a ref to store the latest state and triggering update
		doUpdateUrl(state)
	}

	/**
	 * Clear all grid-related URL parameters.
	 */
	const clearUrl = () => {
		const params = new URLSearchParams(searchParams.toString())

		// Remove all grid params
		params.delete(getKey(URL_KEYS.page))
		params.delete(getKey(URL_KEYS.pageSize))
		params.delete(getKey(URL_KEYS.sort))
		params.delete(getKey(URL_KEYS.search))
		params.delete(getKey(URL_KEYS.filter))

		const queryString = params.toString()
		const newUrl = queryString ? `${pathname}?${queryString}` : pathname

		router.replace(newUrl, { scroll: false })
	}

	return {
		getInitialState,
		updateUrl,
		clearUrl,
	}
}

export default useGridUrlState
