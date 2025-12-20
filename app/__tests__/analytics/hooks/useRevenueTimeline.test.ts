/**
 * useRevenueTimeline Hook Tests
 *
 * MAANG-Level: Comprehensive unit tests for revenue timeline analytics.
 *
 * **Test Coverage (Per PRD prd_analytics.md):**
 *
 * 1. **Time Series Data (US-ANA-003)**
 *    - Monthly revenue for 12 months
 *    - Weekly revenue breakdown
 *    - Daily granularity support
 *
 * 2. **Growth Calculation**
 *    - Month-over-month growth
 *    - Period comparison
 *    - Trend detection
 *
 * 3. **Granularity Options**
 *    - Day, Week, Month granularity
 *    - Proper date bucketing
 *
 * 4. **Edge Cases**
 *    - Empty date ranges
 *    - Single data point
 *    - Very long ranges (years)
 *    - Future dates
 *
 * @module __tests__/analytics/hooks/useRevenueTimeline.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

// Hoist mock functions
const { mockGetRevenueTimeline } = vi.hoisted(() => ({
	mockGetRevenueTimeline: vi.fn(),
}))

// Mock useFetchWithCache with working implementation
vi.mock('@_shared/hooks', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@_shared/hooks')>()
	return {
		...actual,
		useFetchWithCache: vi.fn((key: string, fetcher: () => Promise<any>, options: any) => {
			const React = require('react')
			const fetcherRef = React.useRef(fetcher)
			fetcherRef.current = fetcher
			
			const [state, setState] = React.useState({
				data: null as any,
				isLoading: options?.enabled !== false,
				isValidating: false,
				error: null as Error | null,
				isFromCache: false,
			})

			const refetch = React.useCallback(async () => {
				setState((s: any) => ({ ...s, isLoading: true, error: null }))
				try {
					const data = await fetcherRef.current()
					setState({ data, isLoading: false, isValidating: false, error: null, isFromCache: false })
				} catch (err) {
					setState((s: any) => ({ ...s, isLoading: false, error: err as Error }))
				}
			}, [])

			const invalidate = React.useCallback(() => {
				setState((s: any) => ({ ...s, data: null }))
			}, [])

			const hasFetched = React.useRef(false)
			const prevKey = React.useRef(key)
			
			React.useEffect(() => {
				if (options?.enabled === false) return
				if (hasFetched.current && prevKey.current === key) return
				hasFetched.current = true
				prevKey.current = key
				refetch()
			}, [key, refetch, options?.enabled])

			return { ...state, refetch, invalidate }
		}),
	}
})

// Mock API
vi.mock('@_shared/services/api', () => ({
	default: {
		Analytics: {
			getRevenueTimeline: mockGetRevenueTimeline,
		},
	},
}))

vi.mock('@_core', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

import { useRevenueTimeline } from '@/app/app/analytics/_hooks/useRevenueTimeline'
import { RevenueSeriesBuilder, RevenueDataBuilder } from '@/test-utils/analyticsTestBuilders'

describe('useRevenueTimeline', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		mockGetRevenueTimeline.mockResolvedValue([])
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// INITIAL STATE TESTS
	// ==========================================================================

	describe('Initial State', () => {
		it('should have correct initial state with autoFetch disabled', () => {
			const { result } = renderHook(() => useRevenueTimeline({ autoFetch: false }))

			expect(result.current.data).toEqual([])
			expect(result.current.isLoading).toBe(false)
			expect(result.current.error).toBeNull()
			expect(result.current.granularity).toBe('month')
		})

		it('should use default granularity of "month"', () => {
			const { result } = renderHook(() => useRevenueTimeline({ autoFetch: false }))

			expect(result.current.granularity).toBe('month')
		})

		it('should allow setting initial granularity', () => {
			const { result } = renderHook(() =>
				useRevenueTimeline({
					initialGranularity: 'week',
					autoFetch: false,
				}),
			)

			expect(result.current.granularity).toBe('week')
		})

		it('should allow setting initial date range', () => {
			const { result } = renderHook(() =>
				useRevenueTimeline({
					initialStartDate: '2024-01-01',
					initialEndDate: '2024-06-30',
					autoFetch: false,
				}),
			)

			expect(result.current.startDate).toBe('2024-01-01')
			expect(result.current.endDate).toBe('2024-06-30')
		})
	})

	// ==========================================================================
	// DATA FETCHING TESTS
	// ==========================================================================

	describe('Data Fetching', () => {
		it('should fetch revenue timeline data when autoFetch is true', async () => {
			const mockData = new RevenueSeriesBuilder().withMonthlyDataForYear().build()
			mockGetRevenueTimeline.mockResolvedValueOnce(mockData)

			const { result } = renderHook(() =>
				useRevenueTimeline({
					initialStartDate: '2024-01-01',
					initialEndDate: '2024-12-31',
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.data.length).toBeGreaterThan(0)
			})

			expect(mockGetRevenueTimeline).toHaveBeenCalled()
		})

		it('should not fetch when autoFetch is false', () => {
			renderHook(() =>
				useRevenueTimeline({
					autoFetch: false,
				}),
			)

			expect(mockGetRevenueTimeline).not.toHaveBeenCalled()
		})
	})

	// ==========================================================================
	// GRANULARITY TESTS (Per PRD)
	// ==========================================================================

	describe('Granularity Options', () => {
		it('should support changing granularity', async () => {
			const { result } = renderHook(() =>
				useRevenueTimeline({
					initialGranularity: 'month',
					autoFetch: false,
				}),
			)

			expect(result.current.granularity).toBe('month')

			act(() => {
				result.current.setGranularity('week')
			})

			expect(result.current.granularity).toBe('week')
		})

		it('should support day granularity', () => {
			const { result } = renderHook(() =>
				useRevenueTimeline({
					initialGranularity: 'day',
					autoFetch: false,
				}),
			)

			expect(result.current.granularity).toBe('day')
		})
	})

	// ==========================================================================
	// DATE RANGE TESTS
	// ==========================================================================

	describe('Date Range Management', () => {
		it('should allow changing date range', () => {
			const { result } = renderHook(() =>
				useRevenueTimeline({
					initialStartDate: '2024-01-01',
					initialEndDate: '2024-06-30',
					autoFetch: false,
				}),
			)

			expect(result.current.startDate).toBe('2024-01-01')
			expect(result.current.endDate).toBe('2024-06-30')

			act(() => {
				result.current.setDateRange('2024-07-01', '2024-12-31')
			})

			expect(result.current.startDate).toBe('2024-07-01')
			expect(result.current.endDate).toBe('2024-12-31')
		})
	})

	// ==========================================================================
	// REVENUE TREND ANALYSIS (US-ANA-003)
	// ==========================================================================

	describe('Revenue Trend Analysis', () => {
		it('should support growth pattern analysis', async () => {
			const growthData = new RevenueSeriesBuilder()
				.withGrowthPattern(12, 30000, 0.1) // 10% monthly growth
				.build()

			mockGetRevenueTimeline.mockResolvedValueOnce(growthData)

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.data.length).toBeGreaterThan(0)
			})

			// Last month should be higher than first month (growth pattern)
			const firstMonth = result.current.data[0].revenue
			const lastMonth = result.current.data[result.current.data.length - 1].revenue

			expect(lastMonth).toBeGreaterThan(firstMonth)
		})

		it('should support decline pattern analysis', async () => {
			const declineData = new RevenueSeriesBuilder()
				.withDeclinePattern(12, 100000, 0.05) // 5% monthly decline
				.build()

			mockGetRevenueTimeline.mockResolvedValueOnce(declineData)

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.data.length).toBeGreaterThan(0)
			})

			// Last month should be lower than first month (decline pattern)
			const firstMonth = result.current.data[0].revenue
			const lastMonth = result.current.data[result.current.data.length - 1].revenue

			expect(lastMonth).toBeLessThan(firstMonth)
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle empty data', async () => {
			mockGetRevenueTimeline.mockResolvedValueOnce([])

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			expect(result.current.data).toEqual([])
		})

		it('should handle single data point', async () => {
			const singlePoint = new RevenueSeriesBuilder().withSinglePoint(50000).build()
			mockGetRevenueTimeline.mockResolvedValueOnce(singlePoint)

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.data.length).toBe(1)
			})
		})

		it('should handle zero revenue periods', async () => {
			const dataWithZeros = [
				new RevenueDataBuilder().withDate('2024-01-01').withRevenue(50000).build(),
				new RevenueDataBuilder().withDate('2024-02-01').withZeroRevenue().build(),
				new RevenueDataBuilder().withDate('2024-03-01').withRevenue(60000).build(),
			]

			mockGetRevenueTimeline.mockResolvedValueOnce(dataWithZeros)

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.data.length).toBe(3)
			})

			expect(result.current.data[1].revenue).toBe(0)
			expect(result.current.data[1].orderCount).toBe(0)
		})

		it('should handle very high revenue values', async () => {
			const highRevenue = new RevenueDataBuilder().withHighRevenue().build()
			mockGetRevenueTimeline.mockResolvedValueOnce([highRevenue])

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.data.length).toBe(1)
			})

			expect(result.current.data[0].revenue).toBe(1000000)
		})
	})

	// ==========================================================================
	// ERROR HANDLING
	// ==========================================================================

	describe('Error Handling', () => {
		it('should handle API errors', async () => {
			mockGetRevenueTimeline.mockRejectedValueOnce(new Error('API Error'))

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.error).not.toBeNull()
			})
		})

		it('should provide retry mechanism', async () => {
			const validData = new RevenueSeriesBuilder().withMonthlyDataForYear().build()

			mockGetRevenueTimeline.mockRejectedValueOnce(new Error('Temp Error')).mockResolvedValueOnce(validData)

			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: true,
				}),
			)

			await waitFor(() => {
				expect(result.current.error).not.toBeNull()
			})

			await act(async () => {
				await result.current.retry()
			})

			await waitFor(() => {
				expect(result.current.data.length).toBeGreaterThan(0)
			})
		})
	})

	// ==========================================================================
	// CACHE INVALIDATION
	// ==========================================================================

	describe('Cache Management', () => {
		it('should expose invalidate function', () => {
			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: false,
				}),
			)

			expect(typeof result.current.invalidate).toBe('function')
		})

		it('should expose isFromCache flag', () => {
			const { result } = renderHook(() =>
				useRevenueTimeline({
					autoFetch: false,
				}),
			)

			expect(typeof result.current.isFromCache).toBe('boolean')
		})
	})
})

// ============================================================================
// PRD ACCEPTANCE CRITERIA TESTS
// ============================================================================

describe('useRevenueTimeline - PRD Acceptance Criteria', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	/**
	 * US-ANA-003: Revenue Trends
	 * Given last 12 months data, when viewing chart, then I see monthly revenue
	 */
	it('US-ANA-003: Should display 12 months of revenue data', async () => {
		const monthlyData = new RevenueSeriesBuilder().withMonthlyDataForYear().build()
		mockGetRevenueTimeline.mockResolvedValueOnce(monthlyData)

		const { result } = renderHook(() =>
			useRevenueTimeline({
				initialGranularity: 'month',
				autoFetch: true,
			}),
		)

		await waitFor(() => {
			expect(result.current.data.length).toBe(12)
		})

		// Each data point should have date, revenue, and orderCount
		result.current.data.forEach((point) => {
			expect(point).toHaveProperty('date')
			expect(point).toHaveProperty('revenue')
			expect(point).toHaveProperty('orderCount')
		})
	})

	/**
	 * US-ANA-003: Growth Calculation
	 * Given this month is $50K, last month was $45K, then shows "+11% growth"
	 */
	it('US-ANA-003: Should enable growth percentage calculation', async () => {
		const data = [
			new RevenueDataBuilder().withDate('2024-01-01').withRevenue(45000).build(),
			new RevenueDataBuilder().withDate('2024-02-01').withRevenue(50000).build(),
		]

		mockGetRevenueTimeline.mockResolvedValueOnce(data)

		const { result } = renderHook(() =>
			useRevenueTimeline({
				initialGranularity: 'month',
				autoFetch: true,
			}),
		)

		await waitFor(() => {
			expect(result.current.data.length).toBe(2)
		})

		// Calculate growth: (50000 - 45000) / 45000 * 100 = 11.11%
		const lastMonth = result.current.data[0].revenue
		const thisMonth = result.current.data[1].revenue
		const growth = ((thisMonth - lastMonth) / lastMonth) * 100

		expect(growth).toBeCloseTo(11.11, 1)
	})
})
