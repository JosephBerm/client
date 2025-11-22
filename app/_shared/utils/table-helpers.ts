/**
 * Table Utilities and Helpers
 * 
 * Utility functions for working with TanStack Table and server-side data tables.
 * Provides conversions, fetchers, and formatters for consistent table implementations.
 * 
 * **Features:**
 * - TanStack Table ↔ Backend API conversions
 * - Server table data fetcher factory
 * - Common formatting functions (dates, currency, text truncation)
 * - Consistent null/undefined handling
 * 
 * **Use Cases:**
 * - Converting sorting state from TanStack Table to backend format
 * - Creating server table fetch functions
 * - Formatting table cell values for display
 * 
 * @example
 * ```typescript
 * import { createServerTableFetcher, formatCurrency, formatDate } from '@_shared';
 * 
 * // Create a fetcher for products
 * const fetchProducts = createServerTableFetcher<Product>('/api/products');
 * 
 * // Use in table column
 * {
 *   accessorKey: 'price',
 *   cell: ({ getValue }) => formatCurrency(getValue() as number)
 * }
 * ```
 * 
 * @module table-helpers
 */

import { SortingState } from '@tanstack/react-table'

/**
 * Converts TanStack Table sorting state to backend API format.
 * 
 * **Conversion:**
 * - TanStack Table: `[{ id: 'columnName', desc: boolean }]`
 * - Backend API: `{ sortBy: 'columnName', sortOrder: 'asc' | 'desc' }`
 * 
 * Only the first sort column is used (backend supports single-column sort).
 * 
 * @param {SortingState} sorting - TanStack Table sorting state array
 * @returns {Object} Backend-compatible sorting object
 * @returns {string} returns.sortBy - Column name to sort by
 * @returns {'asc'|'desc'} returns.sortOrder - Sort direction
 * 
 * @example
 * ```typescript
 * const sorting = [{ id: 'name', desc: false }];
 * const apiSort = convertSortingToApi(sorting);
 * // { sortBy: 'name', sortOrder: 'asc' }
 * 
 * const descSorting = [{ id: 'price', desc: true }];
 * const apiDescSort = convertSortingToApi(descSorting);
 * // { sortBy: 'price', sortOrder: 'desc' }
 * ```
 */
export function convertSortingToApi(sorting: SortingState): {
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
} {
	// Return empty object if no sorting is applied
	if (!sorting || sorting.length === 0) {
		return {}
	}

	// Only use first sort (backend supports single-column sorting)
	const firstSort = sorting[0]
	return {
		sortBy: firstSort.id,
		sortOrder: firstSort.desc ? 'desc' : 'asc',
	}
}

/**
 * Factory function that creates a server table fetch function.
 * Handles conversion between TanStack Table state and backend API format.
 * Automatically wraps requests with proper headers and authentication.
 * 
 * **Features:**
 * - Converts TanStack Table state to backend GenericSearchFilter format
 * - Handles dynamic imports to avoid circular dependencies
 * - Provides default fallback for failed requests
 * - Type-safe with generic data type
 * 
 * @template T - Type of data items returned from the server
 * 
 * @param {string} endpoint - Backend API endpoint (e.g., '/api/products/search')
 * @param {Record<string, any>} additionalFilters - Optional custom filters to include in every request
 * 
 * @returns {Function} Async function compatible with useServerTable hook
 * 
 * @example
 * ```typescript
 * // Create a fetcher for products with category filter
 * const fetchProducts = createServerTableFetcher<Product>(
 *   '/api/products/search',
 *   { category: 'medical' }
 * );
 * 
 * // Use with useServerTable hook
 * const { data, isLoading } = useServerTable(fetchProducts, {
 *   initialPageSize: 20
 * });
 * 
 * // Or use directly with ServerDataGrid
 * <ServerDataGrid
 *   endpoint="/api/orders/search"
 *   columns={orderColumns}
 * />
 * ```
 */
export function createServerTableFetcher<T>(
	endpoint: string,
	additionalFilters?: Record<string, any>
) {
	return async (params: {
		page: number
		pageSize: number
		sorting?: SortingState
		filters?: any
	}) => {
		const { page, pageSize, sorting } = params
		
		// Convert TanStack Table sorting to API format
		const { sortBy, sortOrder } = convertSortingToApi(sorting || [])

		// Prepare request body matching GenericSearchFilter structure
		const requestBody = {
			page,
			pageSize,
			sortBy,
			sortOrder,
			filters: additionalFilters || {}, // Custom filters (e.g., category, status)
		}

		// Dynamic import to avoid circular dependencies
		const { HttpService } = await import('../services/httpService')
		
		// Make POST request to search endpoint
		const response = await HttpService.post<{
			data: T[]
			page: number
			pageSize: number
			total: number
			totalPages: number
			hasNext: boolean
			hasPrevious: boolean
		}>(endpoint, requestBody)

		// Backend wraps response in { payload, message, statusCode }
		// Return payload or fallback to empty result
		return response.data.payload || {
			data: [],
			page: 1,
			pageSize: 10,
			total: 0,
			totalPages: 0,
			hasNext: false,
			hasPrevious: false,
		}
	}
}

// ==========================================
// TABLE CELL FORMATTERS
// ==========================================

/**
 * Re-export formatters from @_lib for convenience.
 * These are pure functions moved to the lib layer for better organization.
 * 
 * formatDate comes from @_lib/dates, formatCurrency and truncate from @_lib/formatters
 * 
 * @see {@link @_lib} for all utility implementations
 */
export { formatDate, formatCurrency, truncate } from '@_lib'


