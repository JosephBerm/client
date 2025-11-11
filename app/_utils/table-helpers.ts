import { SortingState } from '@tanstack/react-table'

/**
 * Convert TanStack Table sorting state to backend API format
 * Backend expects: { sortBy: string, sortOrder: 'asc' | 'desc' }
 * TanStack Table provides: [{ id: string, desc: boolean }]
 */
export function convertSortingToApi(sorting: SortingState): {
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
} {
	if (!sorting || sorting.length === 0) {
		return {}
	}

	const firstSort = sorting[0]
	return {
		sortBy: firstSort.id,
		sortOrder: firstSort.desc ? 'desc' : 'asc',
	}
}

/**
 * Create a fetch function for server tables that works with the backend API
 * This handles the conversion between TanStack Table state and backend API format
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
		const { sortBy, sortOrder } = convertSortingToApi(sorting || [])

		// Prepare the request body for GenericSearchFilter
		const requestBody = {
			page,
			pageSize,
			sortBy,
			sortOrder,
			filters: additionalFilters || {},
		}

		// Import HttpService dynamically to avoid circular dependencies
		const { HttpService } = await import('@_services/httpService')
		
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

/**
 * Format date for display in tables
 */
export function formatDate(date: Date | string | null | undefined): string {
	if (!date) return '-'
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

/**
 * Format currency for display in tables
 */
export function formatCurrency(amount: number | null | undefined): string {
	if (amount === null || amount === undefined) return '-'
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}

/**
 * Truncate text for table cells
 */
export function truncate(text: string | null | undefined, maxLength: number = 50): string {
	if (!text) return '-'
	if (text.length <= maxLength) return text
	return text.slice(0, maxLength) + '...'
}


