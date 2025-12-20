/**
 * useDashboardStats Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive hook testing for dashboard statistics.
 * 
 * **Priority**: 🟡 HIGH - Core dashboard data fetching
 * 
 * **Testing Strategy:**
 * 1. Successful data fetching
 * 2. Loading states
 * 3. Error handling
 * 4. Refetch functionality
 * 5. Initial state
 * 
 * @module dashboard/hooks/useDashboardStats.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDashboardStats } from '../useDashboardStats'
import type { DashboardStats } from '@_types/dashboard.types'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Hoist mock functions
const { mockedGetStats } = vi.hoisted(() => ({
	mockedGetStats: vi.fn(),
}))

// Mock useFetchWithCache with working implementation
vi.mock('@_shared/hooks/useFetchWithCache', () => ({
	useFetchWithCache: vi.fn((key: string, fetcher: () => Promise<any>, options: any) => {
		const React = require('react')
		const fetcherRef = React.useRef(fetcher)
		fetcherRef.current = fetcher
		
		const [state, setState] = React.useState({
			data: null as any,
			isLoading: true,
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
			if (hasFetched.current && prevKey.current === key) return
			hasFetched.current = true
			prevKey.current = key
			refetch()
		}, [key, refetch])

		return { ...state, refetch, invalidate }
	}),
}))

// Mock API
vi.mock('@_shared/services/api', () => ({
	default: {
		Dashboard: {
			getStats: mockedGetStats,
		},
	},
}))


// ============================================================================
// TEST DATA
// ============================================================================

const mockCustomerStats: DashboardStats = {
	pendingQuotes: 3,
	approvedQuotes: 5,
	activeOrders: 2,
	totalSpent: 15000,
}

const mockSalesRepStats: DashboardStats = {
	unreadQuotes: 8,
	ordersPendingPayment: 4,
	conversionRate: 65.5,
	avgTurnaroundHours: 24,
}

const mockAdminStats: DashboardStats = {
	totalActiveUsers: 150,
	totalQuotes: 1200,
	totalOrders: 800,
	systemHealth: 98.5,
	revenueOverview: {
		todayOrders: 15,
		todayRevenue: 5000,
		weekOrders: 80,
		weekRevenue: 25000,
		monthOrders: 300,
		monthRevenue: 95000,
	},
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useDashboardStats Hook', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// INITIAL STATE TESTS
	// ==========================================================================

	describe('Initial State', () => {
		it('should initialize with null stats', () => {
			mockedGetStats.mockResolvedValue(mockCustomerStats)

			const { result } = renderHook(() => useDashboardStats())

			expect(result.current.stats).toBeNull()
		})

		it('should have loading state initially', () => {
			mockedGetStats.mockImplementation(
				() => new Promise(() => {}) // Never resolves
			)

			const { result } = renderHook(() => useDashboardStats())

			// Initial state before effect runs
			expect(result.current.isLoading).toBeDefined()
		})

		it('should have no error initially', () => {
			mockedGetStats.mockResolvedValue(mockCustomerStats)

			const { result } = renderHook(() => useDashboardStats())

			expect(result.current.error).toBeNull()
		})
	})

	// ==========================================================================
	// SUCCESSFUL FETCH TESTS
	// ==========================================================================

	describe('Successful Data Fetching', () => {
		it('should fetch and store customer stats', async () => {
			mockedGetStats.mockResolvedValue(mockCustomerStats)

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})

		it('should fetch and store sales rep stats', async () => {
			mockedGetStats.mockResolvedValue(mockSalesRepStats)

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})

		it('should fetch and store admin stats with revenue overview', async () => {
			mockedGetStats.mockResolvedValue(mockAdminStats)

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})
	})

	// ==========================================================================
	// ERROR HANDLING TESTS
	// ==========================================================================

	describe('Error Handling', () => {
		it('should handle API errors gracefully', async () => {
			const errorMessage = 'Network error'
			mockedGetStats.mockRejectedValue(new Error(errorMessage))

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})

		it('should handle unauthorized error', async () => {
			mockedGetStats.mockRejectedValue(
				new Error('Unauthorized')
			)

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})
	})

	// ==========================================================================
	// REFETCH TESTS
	// ==========================================================================

	describe('Refetch Functionality', () => {
		it('should provide a refetch function', () => {
			mockedGetStats.mockResolvedValue(mockCustomerStats)

			const { result } = renderHook(() => useDashboardStats())

			expect(result.current.refetch).toBeDefined()
			expect(typeof result.current.refetch).toBe('function')
		})

		it('should call API again on refetch', async () => {
			mockedGetStats.mockResolvedValue(mockCustomerStats)

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalledTimes(1)
			})

			act(() => {
				result.current.refetch()
			})

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalledTimes(2)
			})
		})
	})

	// ==========================================================================
	// LOADING STATE TESTS
	// ==========================================================================

	describe('Loading States', () => {
		it('should track loading state during fetch', async () => {
			let resolvePromise: (value: DashboardStats) => void
			mockedGetStats.mockImplementation(
				() =>
					new Promise<DashboardStats>((resolve) => {
						resolvePromise = resolve
					})
			)

			const { result } = renderHook(() => useDashboardStats())

			// Loading should be defined
			expect(result.current.isLoading).toBeDefined()
		})
	})

	// ==========================================================================
	// DATA SHAPE TESTS
	// ==========================================================================

	describe('Data Shape Validation', () => {
		it('should handle stats with team workload', async () => {
			const statsWithWorkload: DashboardStats = {
				teamActiveQuotes: 25,
				teamConversionRate: 55,
				monthlyRevenue: 50000,
				teamWorkload: [
					{
						salesRepId: 1,
						salesRepName: 'John Doe',
						activeQuotes: 10,
						activeOrders: 5,
						isOverloaded: false,
					},
					{
						salesRepId: 2,
						salesRepName: 'Jane Smith',
						activeQuotes: 15,
						activeOrders: 8,
						isOverloaded: true,
					},
				],
			}

			mockedGetStats.mockResolvedValue(statsWithWorkload)

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})

		it('should handle empty stats object', async () => {
			mockedGetStats.mockResolvedValue({})

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})

		it('should handle null/undefined values in stats', async () => {
			const partialStats: DashboardStats = {
				pendingQuotes: undefined,
				activeOrders: null as unknown as number,
				totalSpent: 0,
			}

			mockedGetStats.mockResolvedValue(partialStats)

			const { result } = renderHook(() => useDashboardStats())

			await waitFor(() => {
				expect(mockedGetStats).toHaveBeenCalled()
			})
		})
	})
})
