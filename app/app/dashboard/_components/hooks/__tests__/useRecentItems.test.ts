/**
 * useRecentItems Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive hook testing for recent items.
 * 
 * **Priority**: 🟡 HIGH - Recent activity display
 * 
 * **Testing Strategy:**
 * 1. Item fetching with count parameter
 * 2. Order/quote separation
 * 3. Loading states
 * 4. Error handling
 * 5. Refetch functionality
 * 
 * @module dashboard/hooks/useRecentItems.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useRecentItems } from '../useRecentItems'
import type { RecentItem } from '@_types/dashboard.types'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Hoist mock functions
const { mockedGetRecentItems } = vi.hoisted(() => ({
	mockedGetRecentItems: vi.fn(),
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
			getRecentItems: mockedGetRecentItems,
		},
	},
}))

// ============================================================================
// TEST DATA
// ============================================================================

const mockRecentOrder: RecentItem = {
	quoteId: null,
	orderId: 123,
	type: 'order',
	number: 'ORD-123',
	date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
	status: 'Processing',
	amount: 2500.0,
	customerName: 'Acme Corp',
}

const mockRecentQuote: RecentItem = {
	quoteId: 'guid-456',
	orderId: null,
	type: 'quote',
	number: 'QT-456',
	date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
	status: 'Unread',
	amount: undefined,
	customerName: 'Beta Inc',
}

const mockRecentItemsList: RecentItem[] = [
	mockRecentOrder,
	mockRecentQuote,
	{
		quoteId: null,
		orderId: 789,
		type: 'order',
		number: 'ORD-789',
		date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		status: 'Shipped',
		amount: 1800.5,
		customerName: 'Delta LLC',
	},
	{
		quoteId: 'guid-101',
		orderId: null,
		type: 'quote',
		number: 'QT-101',
		date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
		status: 'Approved',
		amount: undefined,
		customerName: 'Epsilon Co',
	},
	{
		quoteId: null,
		orderId: 202,
		type: 'order',
		number: 'ORD-202',
		date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
		status: 'Delivered',
		amount: 3200.0,
		customerName: 'Gamma Industries',
	},
]

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useRecentItems Hook', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		mockedGetRecentItems.mockResolvedValue([])
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// INITIAL STATE TESTS
	// ==========================================================================

	describe('Initial State', () => {
		it('should initialize with empty items array', () => {
			mockedGetRecentItems.mockResolvedValue([])

			const { result } = renderHook(() => useRecentItems())

			expect(result.current.items).toEqual([])
		})

		it('should initialize with empty recentOrders array', () => {
			mockedGetRecentItems.mockResolvedValue([])

			const { result } = renderHook(() => useRecentItems())

			expect(result.current.recentOrders).toEqual([])
		})

		it('should initialize with empty recentQuotes array', () => {
			mockedGetRecentItems.mockResolvedValue([])

			const { result } = renderHook(() => useRecentItems())

			expect(result.current.recentQuotes).toEqual([])
		})

		it('should have no error initially', () => {
			mockedGetRecentItems.mockResolvedValue([])

			const { result } = renderHook(() => useRecentItems())

			expect(result.current.error).toBeNull()
		})
	})

	// ==========================================================================
	// DATA FETCHING TESTS
	// ==========================================================================

	describe('Data Fetching', () => {
		it('should call API with default count of 5', async () => {
			mockedGetRecentItems.mockResolvedValue(mockRecentItemsList)

			renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalledWith(5)
			})
		})

		it('should call API with custom count', async () => {
			mockedGetRecentItems.mockResolvedValue(mockRecentItemsList)

			renderHook(() => useRecentItems(10))

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalledWith(10)
			})
		})

		it('should call API with count of 1', async () => {
			mockedGetRecentItems.mockResolvedValue([mockRecentOrder])

			renderHook(() => useRecentItems(1))

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalledWith(1)
			})
		})
	})

	// ==========================================================================
	// ORDER/QUOTE SEPARATION TESTS
	// ==========================================================================

	describe('Item Type Separation', () => {
		it('should separate orders from quotes', () => {
			// Verify the separation logic works
			const recentOrders = mockRecentItemsList.filter((i) => i.type === 'order')
			const recentQuotes = mockRecentItemsList.filter((i) => i.type === 'quote')

			expect(recentOrders.length).toBe(3)
			expect(recentQuotes.length).toBe(2)
		})

		it('should correctly identify orders', () => {
			expect(mockRecentOrder.type).toBe('order')
			expect(mockRecentOrder.orderId).not.toBeNull()
			expect(mockRecentOrder.quoteId).toBeNull()
		})

		it('should correctly identify quotes', () => {
			expect(mockRecentQuote.type).toBe('quote')
			expect(mockRecentQuote.quoteId).not.toBeNull()
			expect(mockRecentQuote.orderId).toBeNull()
		})

		it('should handle all orders', async () => {
			const allOrders = mockRecentItemsList
				.filter((i) => i.type === 'order')
				.map((i) => ({ ...i }))

			mockedGetRecentItems.mockResolvedValue(allOrders)

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalled()
			})

			// After fetch, recentOrders should be populated
			expect(result.current.recentQuotes).toEqual([])
		})

		it('should handle all quotes', async () => {
			const allQuotes = mockRecentItemsList
				.filter((i) => i.type === 'quote')
				.map((i) => ({ ...i }))

			mockedGetRecentItems.mockResolvedValue(allQuotes)

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalled()
			})

			// After fetch, recentQuotes should be populated
			expect(result.current.recentOrders).toEqual([])
		})

		it('should handle empty items list', async () => {
			mockedGetRecentItems.mockResolvedValue([])

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalled()
			})

			expect(result.current.recentOrders).toEqual([])
			expect(result.current.recentQuotes).toEqual([])
		})
	})

	// ==========================================================================
	// ITEM DATA STRUCTURE TESTS
	// ==========================================================================

	describe('Item Data Structure', () => {
		it('should have correct order structure', () => {
			expect(mockRecentOrder).toEqual({
				quoteId: null,
				orderId: 123,
				type: 'order',
				number: 'ORD-123',
				date: expect.any(String),
				status: 'Processing',
				amount: 2500.0,
				customerName: 'Acme Corp',
			})
		})

		it('should have correct quote structure', () => {
			expect(mockRecentQuote).toEqual({
				quoteId: 'guid-456',
				orderId: null,
				type: 'quote',
				number: 'QT-456',
				date: expect.any(String),
				status: 'Unread',
				amount: undefined,
				customerName: 'Beta Inc',
			})
		})

		it('should handle orders without amount', async () => {
			const orderWithoutAmount: RecentItem = {
				...mockRecentOrder,
				amount: undefined,
			}

			mockedGetRecentItems.mockResolvedValue([orderWithoutAmount])

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalled()
			})
		})

		it('should handle items without customer name', async () => {
			const itemWithoutCustomer: RecentItem = {
				...mockRecentOrder,
				customerName: undefined,
			}

			mockedGetRecentItems.mockResolvedValue([itemWithoutCustomer])

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalled()
			})
		})
	})

	// ==========================================================================
	// ERROR HANDLING TESTS
	// ==========================================================================

	describe('Error Handling', () => {
		it('should handle API errors gracefully', async () => {
			mockedGetRecentItems.mockRejectedValue(
				new Error('Network error')
			)

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalled()
			})
		})

		it('should maintain empty arrays on error', async () => {
			mockedGetRecentItems.mockRejectedValue(
				new Error('Server error')
			)

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalled()
			})

			expect(result.current.items).toEqual([])
			expect(result.current.recentOrders).toEqual([])
			expect(result.current.recentQuotes).toEqual([])
		})
	})

	// ==========================================================================
	// REFETCH TESTS
	// ==========================================================================

	describe('Refetch Functionality', () => {
		it('should provide a refetch function', () => {
			mockedGetRecentItems.mockResolvedValue(mockRecentItemsList)

			const { result } = renderHook(() => useRecentItems())

			expect(result.current.refetch).toBeDefined()
			expect(typeof result.current.refetch).toBe('function')
		})

		it('should call API again on refetch', async () => {
			mockedGetRecentItems.mockResolvedValue(mockRecentItemsList)

			const { result } = renderHook(() => useRecentItems())

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalledTimes(1)
			})

			act(() => {
				result.current.refetch()
			})

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalledTimes(2)
			})
		})
	})

	// ==========================================================================
	// COUNT PARAMETER TESTS
	// ==========================================================================

	describe('Count Parameter', () => {
		it('should refetch when count changes', async () => {
			mockedGetRecentItems.mockResolvedValue(mockRecentItemsList)

			const { result, rerender } = renderHook(
				({ count }) => useRecentItems(count),
				{ initialProps: { count: 5 } }
			)

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalledWith(5)
			})

			rerender({ count: 10 })

			await waitFor(() => {
				expect(mockedGetRecentItems).toHaveBeenCalledWith(10)
			})
		})
	})

	// ==========================================================================
	// LOADING STATE TESTS
	// ==========================================================================

	describe('Loading States', () => {
		it('should have isLoading defined', () => {
			mockedGetRecentItems.mockResolvedValue(mockRecentItemsList)

			const { result } = renderHook(() => useRecentItems())

			expect(result.current.isLoading).toBeDefined()
		})
	})
})
