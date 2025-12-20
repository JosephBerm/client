/**
 * useCustomerStats Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive statistics fetching tests.
 * Tests customer statistics retrieval, error handling, and edge cases.
 * 
 * **Priority**: 🟡 HIGH - BUSINESS INTELLIGENCE
 * 
 * **What This Tests:**
 * - Stats fetching for valid customer
 * - Error handling (network, 404, 403)
 * - Enabled/disabled state
 * - Refetch functionality
 * - Date parsing
 * - Edge cases (zero stats, null dates)
 * 
 * **Coverage Areas (from PRD prd_customers.md):**
 * - US-CUST-001: SalesRep sees customer order/quote history
 * - US-CUST-002: SalesManager sees customer assignment & stats
 * 
 * @see prd_customers.md - Section 4 User Stories
 * @module _features/customers/hooks/__tests__/useCustomerStats.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCustomerStats } from '../useCustomerStats'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Create hoisted mocks to avoid top-level variable issues
const mockGetStats = vi.hoisted(() => vi.fn())

vi.mock('@_shared', () => ({
	API: {
		Customers: {
			getStats: mockGetStats,
		},
	},
}))

vi.mock('@/app/_core', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

// Alias for cleaner test code
const mockAPI = {
	Customers: {
		getStats: mockGetStats,
	},
}

// ============================================================================
// TEST DATA
// ============================================================================

function createSuccessResponse(customerId: number = 1, overrides = {}) {
	return {
		data: {
			statusCode: 200,
			message: 'stats_retrieved',
			payload: {
				customerId,
				totalOrders: 15,
				totalQuotes: 25,
				totalAccounts: 3,
				totalRevenue: 45000.50,
				lastOrderDate: '2024-12-01T00:00:00Z',
				createdAt: '2024-01-15T00:00:00Z',
				...overrides,
			},
		},
	}
}

function createErrorResponse(message: string = 'Error') {
	return {
		data: {
			statusCode: 500,
			message,
			payload: null,
		},
	}
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useCustomerStats Hook', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// SUCCESSFUL FETCHING
	// ==========================================================================

	describe('Successful Fetching', () => {
		it('should fetch stats successfully', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(1))

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			// Initially loading
			expect(result.current.isLoading).toBe(true)
			expect(result.current.stats).toBeNull()
			expect(result.current.error).toBeNull()

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			expect(result.current.stats).not.toBeNull()
			expect(result.current.stats?.customerId).toBe(1)
			expect(result.current.stats?.totalOrders).toBe(15)
			expect(result.current.stats?.totalQuotes).toBe(25)
			expect(result.current.stats?.totalAccounts).toBe(3)
			expect(result.current.stats?.totalRevenue).toBe(45000.50)
			expect(result.current.error).toBeNull()
		})

		it('should parse dates correctly', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(1))

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			expect(result.current.stats?.lastOrderDate).toBeInstanceOf(Date)
			expect(result.current.stats?.createdAt).toBeInstanceOf(Date)
		})

		it('should call API with correct customer ID', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(123))

			renderHook(() => useCustomerStats({ customerId: 123 }))

			await waitFor(() => {
				expect(mockAPI.Customers.getStats).toHaveBeenCalledWith(123)
			})
		})
	})

	// ==========================================================================
	// ERROR HANDLING
	// ==========================================================================

	describe('Error Handling', () => {
		it('should handle API errors', async () => {
			mockAPI.Customers.getStats.mockRejectedValue(new Error('Network error'))

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			expect(result.current.stats).toBeNull()
			expect(result.current.error).toBe('Network error')
		})

		it('should handle non-200 status codes', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createErrorResponse('Stats not available'))

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false)
			})

			expect(result.current.stats).toBeNull()
			expect(result.current.error).toBe('Stats not available')
		})

		it('should handle 403 access denied', async () => {
			mockAPI.Customers.getStats.mockResolvedValue({
				data: {
					statusCode: 403,
					message: 'Access denied',
					payload: null,
				},
			})

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.error).not.toBeNull()
			})

			expect(result.current.stats).toBeNull()
		})

		it('should handle 404 customer not found', async () => {
			mockAPI.Customers.getStats.mockResolvedValue({
				data: {
					statusCode: 404,
					message: 'Customer not found',
					payload: null,
				},
			})

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 999 })
			)

			await waitFor(() => {
				expect(result.current.error).not.toBeNull()
			})

			expect(result.current.stats).toBeNull()
			expect(result.current.error).toContain('not found')
		})
	})

	// ==========================================================================
	// ENABLED/DISABLED STATE
	// ==========================================================================

	describe('Enabled/Disabled State', () => {
		it('should NOT fetch when enabled is false', async () => {
			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1, enabled: false })
			)

			// Wait a bit to ensure no fetch happens
			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(mockAPI.Customers.getStats).not.toHaveBeenCalled()
			expect(result.current.isLoading).toBe(false)
			expect(result.current.stats).toBeNull()
		})

		it('should fetch when enabled is true (default)', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(1))

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1, enabled: true })
			)

			await waitFor(() => {
				expect(mockAPI.Customers.getStats).toHaveBeenCalled()
			})
		})

		it('should fetch when enabled transitions from false to true', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(1))

			const { result, rerender } = renderHook(
				({ enabled }) => useCustomerStats({ customerId: 1, enabled }),
				{ initialProps: { enabled: false } }
			)

			// Initially not fetching
			expect(mockAPI.Customers.getStats).not.toHaveBeenCalled()

			// Enable fetching
			rerender({ enabled: true })

			await waitFor(() => {
				expect(mockAPI.Customers.getStats).toHaveBeenCalled()
			})
		})
	})

	// ==========================================================================
	// NULL CUSTOMER ID
	// ==========================================================================

	describe('Null Customer ID', () => {
		it('should NOT fetch when customerId is null', async () => {
			const { result } = renderHook(() =>
				useCustomerStats({ customerId: null })
			)

			await new Promise((resolve) => setTimeout(resolve, 100))

			expect(mockAPI.Customers.getStats).not.toHaveBeenCalled()
			expect(result.current.isLoading).toBe(false)
			expect(result.current.stats).toBeNull()
		})

		it('should fetch when customerId changes from null to valid', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(1))

			const { result, rerender } = renderHook(
				({ customerId }) => useCustomerStats({ customerId }),
				{ initialProps: { customerId: null as number | null } }
			)

			expect(mockAPI.Customers.getStats).not.toHaveBeenCalled()

			rerender({ customerId: 1 })

			await waitFor(() => {
				expect(mockAPI.Customers.getStats).toHaveBeenCalledWith(1)
			})
		})
	})

	// ==========================================================================
	// REFETCH FUNCTIONALITY
	// ==========================================================================

	describe('Refetch Functionality', () => {
		it('should refetch data when refetch is called', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(1))

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			expect(mockAPI.Customers.getStats).toHaveBeenCalledTimes(1)

			// Clear and setup new response
			mockAPI.Customers.getStats.mockClear()
			mockAPI.Customers.getStats.mockResolvedValue(
				createSuccessResponse(1, { totalOrders: 20 })
			)

			await act(async () => {
				await result.current.refetch()
			})

			expect(mockAPI.Customers.getStats).toHaveBeenCalledTimes(1)
			expect(result.current.stats?.totalOrders).toBe(20)
		})

		it('should clear error on successful refetch', async () => {
			// First call fails
			mockAPI.Customers.getStats.mockRejectedValueOnce(new Error('Failed'))

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.error).not.toBeNull()
			})

			// Refetch succeeds
			mockAPI.Customers.getStats.mockResolvedValue(createSuccessResponse(1))

			await act(async () => {
				await result.current.refetch()
			})

			expect(result.current.error).toBeNull()
			expect(result.current.stats).not.toBeNull()
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle zero stats (new customer)', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(
				createSuccessResponse(1, {
					totalOrders: 0,
					totalQuotes: 0,
					totalAccounts: 0,
					totalRevenue: 0,
					lastOrderDate: null,
				})
			)

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			expect(result.current.stats?.totalOrders).toBe(0)
			expect(result.current.stats?.totalQuotes).toBe(0)
			expect(result.current.stats?.totalRevenue).toBe(0)
			expect(result.current.stats?.lastOrderDate).toBeNull()
		})

		it('should handle null lastOrderDate', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(
				createSuccessResponse(1, { lastOrderDate: null })
			)

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			expect(result.current.stats?.lastOrderDate).toBeNull()
		})

		it('should handle very large revenue values', async () => {
			mockAPI.Customers.getStats.mockResolvedValue(
				createSuccessResponse(1, { totalRevenue: 9999999999.99 })
			)

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			expect(result.current.stats?.totalRevenue).toBe(9999999999.99)
		})

		it('should handle customer ID change', async () => {
			mockAPI.Customers.getStats
				.mockResolvedValueOnce(createSuccessResponse(1, { totalOrders: 10 }))
				.mockResolvedValueOnce(createSuccessResponse(2, { totalOrders: 20 }))

			const { result, rerender } = renderHook(
				({ customerId }) => useCustomerStats({ customerId }),
				{ initialProps: { customerId: 1 } }
			)

			await waitFor(() => {
				expect(result.current.stats?.totalOrders).toBe(10)
			})

			rerender({ customerId: 2 })

			await waitFor(() => {
				expect(result.current.stats?.totalOrders).toBe(20)
			})
		})
	})

	// ==========================================================================
	// PRD SCENARIOS
	// ==========================================================================

	describe('PRD Scenario Validation', () => {
		it('US-CUST-001: SalesRep sees customer order/quote history stats', async () => {
			// SalesRep viewing assigned customer stats
			mockAPI.Customers.getStats.mockResolvedValue({
				data: {
					statusCode: 200,
					payload: {
						customerId: 1,
						totalOrders: 25,
						totalQuotes: 40,
						totalAccounts: 5,
						totalRevenue: 125000.00,
						lastOrderDate: '2024-12-15T00:00:00Z',
						createdAt: '2023-06-01T00:00:00Z',
					},
				},
			})

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 1 })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			// SalesRep can see comprehensive stats
			expect(result.current.stats?.totalOrders).toBe(25)
			expect(result.current.stats?.totalQuotes).toBe(40)
			expect(result.current.stats?.totalRevenue).toBe(125000.00)
			expect(result.current.stats?.lastOrderDate).toBeInstanceOf(Date)
		})

		it('US-CUST-002: SalesManager sees all customer stats', async () => {
			// SalesManager viewing any customer stats
			mockAPI.Customers.getStats.mockResolvedValue({
				data: {
					statusCode: 200,
					payload: {
						customerId: 999, // Any customer
						totalOrders: 50,
						totalQuotes: 80,
						totalAccounts: 10,
						totalRevenue: 500000.00,
						lastOrderDate: '2024-12-20T00:00:00Z',
						createdAt: '2020-01-01T00:00:00Z',
					},
				},
			})

			const { result } = renderHook(() =>
				useCustomerStats({ customerId: 999 })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			// SalesManager sees full stats for oversight
			expect(result.current.stats?.totalOrders).toBe(50)
			expect(result.current.stats?.totalRevenue).toBe(500000.00)
		})
	})
})

