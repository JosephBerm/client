/**
 * useFinanceAnalytics Hook
 * 
 * Custom hook for managing finance analytics data fetching, state, and business logic.
 * Follows FAANG-level patterns for data fetching, error handling, and state management.
 * 
 * **Features:**
 * - Initial data fetch on mount
 * - Filtered search with date ranges
 * - Data validation and error handling
 * - Loading states management
 * - Download functionality
 * - Retry mechanism
 * - Comprehensive logging and observability
 * 
 * **State Management:**
 * - financeNumbers: Current finance data
 * - filter: Current search filter
 * - isLoading: Loading state
 * - hasLoaded: Whether initial load completed
 * - timeRange: Selected time range preset
 * - error: Error message (if any)
 * 
 * **Business Logic:**
 * - Validates API responses
 * - Handles empty data states
 * - Calculates derived metrics (profit margin, AOV, etc.)
 * - Manages filter state
 * 
 * @example
 * ```tsx
 * const {
 *   financeNumbers,
 *   filter,
 *   isLoading,
 *   hasData,
 *   handleTimeRangeChange,
 *   handleDateChange,
 *   handleApplyFilter,
 *   handleDownload,
 *   handleRetry,
 * } = useFinanceAnalytics();
 * ```
 * 
 * @module features/analytics/hooks/useFinanceAnalytics
 */

'use client'

import { useEffect, useState, useRef, type ChangeEvent } from 'react'

import { logger } from '@_core'

import { getDateRange, parseDate, parseDateOrNow, type DateRangePreset } from '@_lib'
import { isEmptyFinanceData, isValidFinanceData } from '@_lib'

import { API } from '@_shared'

import FinanceNumbers from '@_classes/FinanceNumbers'
import FinanceSearchFilter from '@_classes/FinanceSearchFilter'

const TIME_RANGES = ['7d', '30d', '90d', '1y', 'custom'] as const
export type TimeRange = (typeof TIME_RANGES)[number]

// Component name for logging (FAANG-level best practice)
const COMPONENT_NAME = 'useFinanceAnalytics'

/**
 * Merges filter updates into a base filter.
 */
const mergeFilter = (base: FinanceSearchFilter, updates: Partial<FinanceSearchFilter>) =>
	Object.assign(new FinanceSearchFilter(), base, updates)

/**
 * Return type for useFinanceAnalytics hook.
 */
export interface UseFinanceAnalyticsReturn {
	// State
	financeNumbers: FinanceNumbers
	filter: FinanceSearchFilter
	isLoading: boolean
	hasLoaded: boolean
	timeRange: TimeRange
	error: string | null
	
	// Derived state
	hasData: boolean
	profitMarginValue: number
	averageOrderValueValue: number
	productsPerOrderValue: number
	
	// Event handlers
	handleTimeRangeChange: (range: TimeRange) => void
	handleDateChange: (key: 'FromDate' | 'ToDate') => (event: ChangeEvent<HTMLInputElement>) => void
	handleApplyFilter: () => void
	handleDownload: () => void
	handleRetry: () => void
}

/**
 * useFinanceAnalytics Hook
 * 
 * Manages all finance analytics data fetching, state, and business logic.
 * 
 * @returns Hook return object with state and handlers
 */
export function useFinanceAnalytics(): UseFinanceAnalyticsReturn {
	const [financeNumbers, setFinanceNumbers] = useState(() => new FinanceNumbers())
	const [filter, setFilter] = useState(() => new FinanceSearchFilter())
	const [isLoading, setIsLoading] = useState(false)
	const [hasLoaded, setHasLoaded] = useState(false)
	const [timeRange, setTimeRange] = useState<TimeRange>('30d')
	const [error, setError] = useState<string | null>(null)
	
	// Track mount state for logging
	const isMountedRef = useRef(false)

	/**
	 * Fetches finance numbers from the API.
	 * Handles errors and validates response data.
	 */
	const fetchFinanceNumbers = async () => {
		setIsLoading(true)
		setError(null)

		// Only log in development - API call logging for debugging
		if (process.env.NODE_ENV === 'development') {
			logger.debug('Fetching finance numbers', {
				component: COMPONENT_NAME,
				context: 'initial_load',
			})
		}

		try {
			const { data } = await API.Finance.getFinanceNumbers()
			
			// Validate response
			if (data.statusCode !== 200) {
				// Always log warnings - important for production debugging
				logger.warn('Finance numbers API returned non-200 status', {
					component: COMPONENT_NAME,
					statusCode: data.statusCode,
					message: data?.message,
					context: 'initial_load',
				})
				throw new Error(data?.message ?? 'Unable to fetch finance numbers')
			}

			// Validate payload structure
			if (!data.payload) {
				// No data is valid - backend hasn't been set up yet
				// Only log in development - not an error condition
				if (process.env.NODE_ENV === 'development') {
					logger.debug('Finance numbers API returned empty payload (backend not configured)', {
						component: COMPONENT_NAME,
						context: 'initial_load',
					})
				}
				setFinanceNumbers(new FinanceNumbers())
				return
			}

			// Validate data structure
			if (!isValidFinanceData(data.payload)) {
				// Always log warnings - data integrity issues are important
				logger.warn('Invalid finance data structure received', {
					component: COMPONENT_NAME,
					payload: data.payload,
					context: 'initial_load',
				})
				setFinanceNumbers(new FinanceNumbers())
				return
			}

			// Create FinanceNumbers instance from validated data
			const financeData = new FinanceNumbers(data.payload)
			setFinanceNumbers(financeData)
			
			// No success logging - only log errors/warnings for performance
		} catch (err) {
			// Always log errors - critical for production debugging
			logger.error('Failed to fetch finance numbers', {
				component: COMPONENT_NAME,
				error: err instanceof Error ? err.message : 'Unknown error',
				stack: err instanceof Error ? err.stack : undefined,
				context: 'initial_load',
			})
			setError(err instanceof Error ? err.message : 'Unable to fetch finance numbers')
			// Reset to empty state on error
			setFinanceNumbers(new FinanceNumbers())
		} finally {
			setIsLoading(false)
			setHasLoaded(true)
		}
	}

	// Track mount state (no logging - not critical and impacts performance)
	useEffect(() => {
		if (!isMountedRef.current) {
			isMountedRef.current = true
		}
	}, [])

	useEffect(() => {
		void fetchFinanceNumbers()
	}, [])

	/**
	 * Applies search filter and fetches filtered finance numbers.
	 */
	const applySearch = async (override?: FinanceSearchFilter) => {
		const payload = override ?? filter

		setIsLoading(true)
		setError(null)

		// Only log in development - API call logging for debugging
		if (process.env.NODE_ENV === 'development') {
			logger.debug('Applying finance search filter', {
				component: COMPONENT_NAME,
				context: 'search',
				fromDate: payload.FromDate?.toISOString(),
				toDate: payload.ToDate?.toISOString(),
				customerId: payload.customerId,
			})
		}

		try {
			const { data } = await API.Finance.searchFinnanceNumbers(payload)
			
			// Validate response
			if (data.statusCode !== 200) {
				// Always log warnings - important for production debugging
				logger.warn('Finance search API returned non-200 status', {
					component: COMPONENT_NAME,
					statusCode: data.statusCode,
					message: data?.message,
					context: 'search',
					filter: {
						fromDate: payload.FromDate?.toISOString(),
						toDate: payload.ToDate?.toISOString(),
					},
				})
				throw new Error(data?.message ?? 'Unable to fetch finance numbers')
			}

			// Validate payload structure
			if (!data.payload) {
				// No data is valid - backend hasn't been set up yet
				// Only log in development - not an error condition
				if (process.env.NODE_ENV === 'development') {
					logger.debug('Finance search API returned empty payload (no data for filter)', {
						component: COMPONENT_NAME,
						context: 'search',
						filter: {
							fromDate: payload.FromDate?.toISOString(),
							toDate: payload.ToDate?.toISOString(),
						},
					})
				}
				setFinanceNumbers(new FinanceNumbers())
				return
			}

			// Validate data structure
			if (!isValidFinanceData(data.payload)) {
				// Always log warnings - data integrity issues are important
				logger.warn('Invalid finance data structure received from search', {
					component: COMPONENT_NAME,
					payload: data.payload,
					context: 'search',
					filter: {
						fromDate: payload.FromDate?.toISOString(),
						toDate: payload.ToDate?.toISOString(),
					},
				})
				setFinanceNumbers(new FinanceNumbers())
				return
			}

			// Create FinanceNumbers instance from validated data
			const financeData = new FinanceNumbers(data.payload)
			setFinanceNumbers(financeData)
			
			// No success logging - only log errors/warnings for performance
		} catch (err) {
			// Always log errors - critical for production debugging
			logger.error('Failed to fetch finance numbers from search', {
				component: COMPONENT_NAME,
				error: err instanceof Error ? err.message : 'Unknown error',
				stack: err instanceof Error ? err.stack : undefined,
				context: 'search',
				filter: {
					fromDate: payload.FromDate?.toISOString(),
					toDate: payload.ToDate?.toISOString(),
					customerId: payload.customerId,
				},
			})
			setError(err instanceof Error ? err.message : 'Unable to fetch finance numbers')
			// Reset to empty state on error
			setFinanceNumbers(new FinanceNumbers())
		} finally {
			setIsLoading(false)
			setHasLoaded(true)
		}
	}

	const handleTimeRangeChange = (range: TimeRange) => {
		try {
			// Only log in development - user action logging for debugging
			if (process.env.NODE_ENV === 'development') {
				logger.debug('Time range changed', {
					component: COMPONENT_NAME,
					previousRange: timeRange,
					newRange: range,
				})
			}

			setTimeRange(range)

			if (range === 'custom') {
				return
			}

			const dateRange = getDateRange(range as DateRangePreset)
			const updatedFilter = mergeFilter(filter, { FromDate: dateRange.from, ToDate: dateRange.to })
			setFilter(updatedFilter)
			
			void applySearch(updatedFilter)
		} catch (error) {
			// Always log errors - critical for production debugging
			logger.error('Failed to handle time range change', {
				component: COMPONENT_NAME,
				error: error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
				range,
			})
			setError('Failed to change time range. Please try again.')
		}
	}

	const handleDateChange =
		(key: 'FromDate' | 'ToDate') =>
		(event: ChangeEvent<HTMLInputElement>) => {
			try {
				const value = parseDate(event.target.value)
				// No logging for frequent input changes - performance impact

				const updatedFilter = mergeFilter(filter, { [key]: value } as Partial<FinanceSearchFilter>)
				setFilter(updatedFilter)
			} catch (error) {
				// Always log errors - critical for production debugging
				logger.error('Failed to handle date change', {
					component: COMPONENT_NAME,
					error: error instanceof Error ? error.message : 'Unknown error',
					field: key,
					inputValue: event.target.value,
				})
				setError('Failed to update date filter. Please try again.')
			}
		}

	const handleApplyFilter = () => {
		try {
			if (!filter.FromDate || !filter.ToDate) {
				// Always log warnings - important for production debugging
				logger.warn('Apply filter called with missing dates', {
					component: COMPONENT_NAME,
					hasFromDate: !!filter.FromDate,
					hasToDate: !!filter.ToDate,
				})
				setError('Please select both start and end dates.')
				return
			}

			// Only log in development - user action logging for debugging
			if (process.env.NODE_ENV === 'development') {
				logger.debug('Applying custom date filter', {
					component: COMPONENT_NAME,
					fromDate: filter.FromDate.toISOString(),
					toDate: filter.ToDate.toISOString(),
				})
			}

			void applySearch()
		} catch (error) {
			// Always log errors - critical for production debugging
			logger.error('Failed to apply filter', {
				component: COMPONENT_NAME,
				error: error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
				fromDate: filter.FromDate?.toISOString(),
				toDate: filter.ToDate?.toISOString(),
			})
			setError('Failed to apply filter. Please try again.')
		}
	}

	const handleDownload = () => {
		void (async () => {
			try {
				// Only log in development - user action logging for debugging
				if (process.env.NODE_ENV === 'development') {
					logger.debug('Initiating finance report download', {
						component: COMPONENT_NAME,
						fromDate: filter.FromDate?.toISOString(),
						toDate: filter.ToDate?.toISOString(),
					})
				}

				const { data } = await API.Finance.downloadFinanceNumbers(filter)
				
				if (!data) {
					// Always log warnings - important for production debugging
					logger.warn('Download API returned no data', {
						component: COMPONENT_NAME,
					})
					setError('No data available for download.')
					return
				}

				if (!(data instanceof Blob)) {
					// Always log warnings - important for production debugging
					logger.warn('Download API returned invalid data type', {
						component: COMPONENT_NAME,
						dataType: typeof data,
					})
					setError('Invalid download data received.')
					return
				}

				const url = window.URL.createObjectURL(data)
				const link = document.createElement('a')
				link.href = url
				const today = parseDateOrNow()
				const filename = `finance-report-${today.toISOString().split('T')[0]}.xlsx`
				link.download = filename
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				window.URL.revokeObjectURL(url)

				// No success logging - only log errors/warnings for performance
			} catch (err) {
				// Always log errors - critical for production debugging
				logger.error('Failed to download finance report', {
					component: COMPONENT_NAME,
					error: err instanceof Error ? err.message : 'Unknown error',
					stack: err instanceof Error ? err.stack : undefined,
					fromDate: filter.FromDate?.toISOString(),
					toDate: filter.ToDate?.toISOString(),
				})
				setError('Unable to download finance report. Please try again later.')
			}
		})()
	}

	const handleRetry = () => {
		try {
			// Only log in development - user action logging for debugging
			if (process.env.NODE_ENV === 'development') {
				logger.debug('Retrying finance numbers fetch', {
					component: COMPONENT_NAME,
					previousError: error,
				})
			}
			setError(null)
			void fetchFinanceNumbers()
		} catch (err) {
			// Always log errors - critical for production debugging
			logger.error('Failed to retry fetch', {
				component: COMPONENT_NAME,
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			setError('Failed to retry. Please refresh the page.')
		}
	}

	// Calculate safe values with proper fallbacks
	const profitMarginValue = Number.isFinite(financeNumbers.profitMargin) && financeNumbers.profitMargin >= 0
		? financeNumbers.profitMargin
		: 0
	const averageOrderValueValue = Number.isFinite(financeNumbers.averageOrderValue) && financeNumbers.averageOrderValue >= 0
		? financeNumbers.averageOrderValue
		: 0
	const productsPerOrderValue = financeNumbers.orders.totalOrders > 0
		? financeNumbers.orders.totalProductsSold / financeNumbers.orders.totalOrders
		: 0

	// Check if we have any data to display
	const hasData = !isEmptyFinanceData(financeNumbers)

	// Log calculation warnings if needed
	useEffect(() => {
		if (hasData && hasLoaded) {
			if (!Number.isFinite(profitMarginValue) || profitMarginValue < 0) {
				logger.warn('Invalid profit margin calculated', {
					component: COMPONENT_NAME,
					profitMarginValue,
					revenue: financeNumbers.sales.totalRevenue,
					profit: financeNumbers.sales.totalProfit,
				})
			}
			if (!Number.isFinite(averageOrderValueValue) || averageOrderValueValue < 0) {
				logger.warn('Invalid average order value calculated', {
					component: COMPONENT_NAME,
					averageOrderValueValue,
					revenue: financeNumbers.sales.totalRevenue,
					orders: financeNumbers.orders.totalOrders,
				})
			}
			if (!Number.isFinite(productsPerOrderValue) || productsPerOrderValue < 0) {
				logger.warn('Invalid products per order calculated', {
					component: COMPONENT_NAME,
					productsPerOrderValue,
					totalProducts: financeNumbers.orders.totalProductsSold,
					totalOrders: financeNumbers.orders.totalOrders,
				})
			}
		}
	}, [profitMarginValue, averageOrderValueValue, productsPerOrderValue, hasData, hasLoaded, financeNumbers.sales.totalRevenue, financeNumbers.sales.totalProfit, financeNumbers.orders.totalOrders, financeNumbers.orders.totalProductsSold])

	return {
		// State
		financeNumbers,
		filter,
		isLoading,
		hasLoaded,
		timeRange,
		error,
		
		// Derived state
		hasData,
		profitMarginValue,
		averageOrderValueValue,
		productsPerOrderValue,
		
		// Event handlers
		handleTimeRangeChange,
		handleDateChange,
		handleApplyFilter,
		handleDownload,
		handleRetry,
	}
}
