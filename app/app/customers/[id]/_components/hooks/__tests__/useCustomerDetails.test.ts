/**
 * useCustomerDetails Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive data fetching tests for customer detail page.
 * Tests all data loading scenarios, error handling, and edge cases.
 * 
 * **Priority**: 🔴 CRITICAL - DATA INTEGRITY
 * 
 * **What This Tests:**
 * - Customer data fetching (success, failure, not found)
 * - Linked accounts fetching
 * - Customer statistics fetching
 * - Create mode handling
 * - Invalid ID handling
 * - Loading state management
 * - Error handling and user notifications
 * - Refresh functionality
 * 
 * **Coverage Areas (from PRD prd_customers.md):**
 * - US-CUST-001: SalesRep viewing customer profile
 * - US-CUST-002: SalesManager viewing all customer data
 * - Backend-enforced RBAC (403 handling)
 * 
 * @see prd_customers.md - Full PRD specification
 * @module app/customers/[id]/_components/hooks/__tests__/useCustomerDetails.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCustomerDetails } from '../useCustomerDetails'
import Company from '@_classes/Company'
import User from '@_classes/User'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Create hoisted mocks to avoid top-level variable issues
const { mockRouterBack, mockRouterPush, mockCustomersGet, mockCustomersGetStats, mockAccountsSearch } = vi.hoisted(() => ({
	mockRouterBack: vi.fn(),
	mockRouterPush: vi.fn(),
	mockCustomersGet: vi.fn(),
	mockCustomersGetStats: vi.fn(),
	mockAccountsSearch: vi.fn(),
}))

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		back: mockRouterBack,
		push: mockRouterPush,
		replace: vi.fn(),
	}),
}))

vi.mock('@_shared', () => ({
	API: {
		Customers: {
			get: mockCustomersGet,
			getStats: mockCustomersGetStats,
		},
		Accounts: {
			search: mockAccountsSearch,
		},
	},
	notificationService: {
		error: vi.fn(),
		success: vi.fn(),
		info: vi.fn(),
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

// Aliases for cleaner test code
const mockRouter = {
	back: mockRouterBack,
	push: mockRouterPush,
}

const mockAPI = {
	Customers: {
		get: mockCustomersGet,
		getStats: mockCustomersGetStats,
	},
	Accounts: {
		search: mockAccountsSearch,
	},
}

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

function createMockCustomerResponse(overrides: Partial<Company> = {}) {
	return {
		data: {
			statusCode: 200,
			message: 'customer_retrieved',
			payload: {
				id: 1,
				name: 'Test Hospital',
				email: 'contact@testhospital.com',
				phone: '555-123-4567',
				primarySalesRepId: 10,
				typeOfBusiness: 1,
				status: 0,
				createdAt: '2024-01-15T00:00:00Z',
				...overrides,
			},
		},
	}
}

function createMockStatsResponse(customerId: number = 1) {
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
			},
		},
	}
}

function createMockAccountsResponse(customerId: number = 1) {
	return {
		data: {
			statusCode: 200,
			message: 'accounts_retrieved',
			payload: {
				data: [
					{
						id: 100,
						email: 'john@hospital.com',
						customerId,
						name: { first: 'John', last: 'Doe' },
						role: 0,
					},
					{
						id: 101,
						email: 'jane@hospital.com',
						customerId,
						name: { first: 'Jane', last: 'Smith' },
						role: 0,
					},
				],
				total: 2,
			},
		},
	}
}

function createErrorResponse(message: string = 'Error occurred') {
	return {
		data: {
			statusCode: 500,
			message,
			payload: null,
		},
	}
}

function create404Response() {
	return {
		data: {
			statusCode: 404,
			message: 'Customer not found',
			payload: null,
		},
	}
}

function create403Response() {
	return {
		data: {
			statusCode: 403,
			message: 'You can only view assigned customers',
			payload: null,
		},
	}
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useCustomerDetails Hook', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockRouter.back.mockClear()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	// ==========================================================================
	// SUCCESSFUL DATA FETCHING
	// ==========================================================================

	describe('Successful Data Fetching', () => {
		it('should fetch customer data successfully', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			// Initially loading
			expect(result.current.loading.customer).toBe(true)

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
			})

			// Customer loaded
			expect(result.current.customer.name).toBe('Test Hospital')
			expect(result.current.customer.email).toBe('contact@testhospital.com')
			expect(result.current.customerIdNum).toBe(1)
		})

		it('should fetch linked accounts successfully', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.accounts).toBe(false)
			})

			expect(result.current.accounts).toHaveLength(2)
			expect(result.current.accounts[0].email).toBe('john@hospital.com')
			expect(result.current.accounts[1].email).toBe('jane@hospital.com')
		})

		it('should fetch customer stats successfully', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.stats).toBe(false)
			})

			expect(result.current.stats).not.toBeNull()
			expect(result.current.stats?.totalOrders).toBe(15)
			expect(result.current.stats?.totalQuotes).toBe(25)
			expect(result.current.stats?.totalRevenue).toBe(45000.50)
		})

		it('should parse dates correctly in stats', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			expect(result.current.stats?.lastOrderDate).toBeInstanceOf(Date)
			expect(result.current.stats?.createdAt).toBeInstanceOf(Date)
		})
	})

	// ==========================================================================
	// CREATE MODE
	// ==========================================================================

	describe('Create Mode', () => {
		it('should return empty customer in create mode', async () => {
			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: 'create', isCreateMode: true })
			)

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
			})

			expect(result.current.customer).toBeInstanceOf(Company)
			expect(result.current.customer.id).toBe(0)
			expect(result.current.customer.name).toBe('')
			expect(result.current.customerIdNum).toBeNull()
		})

		it('should NOT fetch accounts in create mode', async () => {
			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: 'create', isCreateMode: true })
			)

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
			})

			expect(mockAPI.Accounts.search).not.toHaveBeenCalled()
			expect(result.current.accounts).toHaveLength(0)
		})

		it('should NOT fetch stats in create mode', async () => {
			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: 'create', isCreateMode: true })
			)

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
			})

			expect(mockAPI.Customers.getStats).not.toHaveBeenCalled()
			expect(result.current.stats).toBeNull()
		})
	})

	// ==========================================================================
	// ERROR HANDLING
	// ==========================================================================

	describe('Error Handling', () => {
		it('should handle customer not found (404)', async () => {
			mockAPI.Customers.get.mockResolvedValue(create404Response())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '999', isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})

		it('should handle access denied (403) for unassigned customers', async () => {
			mockAPI.Customers.get.mockResolvedValue(create403Response())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '123', isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})

		it('should handle API errors gracefully', async () => {
			mockAPI.Customers.get.mockRejectedValue(new Error('Network error'))

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})

		it('should handle accounts fetch error gracefully', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockRejectedValue(new Error('Accounts API error'))

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.accounts).toBe(false)
			})

			// Should set empty accounts array, not crash
			expect(result.current.accounts).toEqual([])
		})

		it('should handle stats fetch error gracefully (non-critical)', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())
			mockAPI.Customers.getStats.mockRejectedValue(new Error('Stats API error'))

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.stats).toBe(false)
			})

			// Stats are optional - should not crash, customer should still load
			expect(result.current.stats).toBeNull()
			expect(result.current.customer.name).toBe('Test Hospital')
		})
	})

	// ==========================================================================
	// INVALID ID HANDLING
	// ==========================================================================

	describe('Invalid ID Handling', () => {
		it('should navigate back for null customerId', async () => {
			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: null, isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})

		it('should navigate back for non-numeric customerId', async () => {
			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: 'invalid', isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})

		it('should navigate back for zero customerId', async () => {
			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '0', isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})

		it('should navigate back for negative customerId', async () => {
			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '-5', isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})

		it('should handle extremely large customerId', async () => {
			mockAPI.Customers.get.mockResolvedValue(create404Response())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '99999999999', isCreateMode: false })
			)

			await waitFor(() => {
				expect(mockRouter.back).toHaveBeenCalled()
			})
		})
	})

	// ==========================================================================
	// LOADING STATES
	// ==========================================================================

	describe('Loading States', () => {
		it('should have correct initial loading states', () => {
			mockAPI.Customers.get.mockImplementation(() => new Promise(() => {})) // Never resolves
			mockAPI.Customers.getStats.mockImplementation(() => new Promise(() => {}))
			mockAPI.Accounts.search.mockImplementation(() => new Promise(() => {}))

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			expect(result.current.loading.customer).toBe(true)
			expect(result.current.loading.accounts).toBe(false) // Waits for customer
			expect(result.current.loading.stats).toBe(false) // Waits for customer
		})

		it('should update loading states correctly on success', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
				expect(result.current.loading.accounts).toBe(false)
				expect(result.current.loading.stats).toBe(false)
			})
		})
	})

	// ==========================================================================
	// REFRESH FUNCTIONALITY
	// ==========================================================================

	describe('Refresh Functionality', () => {
		it('should refetch all data on refresh', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
			})

			// Clear mocks and call refresh
			vi.clearAllMocks()
			mockAPI.Customers.get.mockResolvedValue(
				createMockCustomerResponse({ name: 'Updated Hospital' })
			)
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			act(() => {
				result.current.refresh()
			})

			await waitFor(() => {
				expect(result.current.customer.name).toBe('Updated Hospital')
			})

			expect(mockAPI.Customers.get).toHaveBeenCalledTimes(1)
			expect(mockAPI.Customers.getStats).toHaveBeenCalledTimes(1)
			expect(mockAPI.Accounts.search).toHaveBeenCalledTimes(1)
		})
	})

	// ==========================================================================
	// SET CUSTOMER FUNCTIONALITY
	// ==========================================================================

	describe('setCustomer Functionality', () => {
		it('should update customer state when setCustomer is called', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
			})

			const updatedCustomer = new Company({
				id: 1,
				name: 'Updated Hospital Name',
				email: 'updated@hospital.com',
			})

			act(() => {
				result.current.setCustomer(updatedCustomer)
			})

			expect(result.current.customer.name).toBe('Updated Hospital Name')
			expect(result.current.customer.email).toBe('updated@hospital.com')
		})
	})

	// ==========================================================================
	// PRD SCENARIOS
	// ==========================================================================

	describe('PRD Scenario Validation', () => {
		describe('US-CUST-001: SalesRep viewing assigned customer', () => {
			it('should load complete customer profile with history', async () => {
				const customerWithHistory = createMockCustomerResponse({
					id: 1,
					name: 'Regional Medical Center',
					primarySalesRepId: 10,
				})

				mockAPI.Customers.get.mockResolvedValue(customerWithHistory)
				mockAPI.Customers.getStats.mockResolvedValue({
					data: {
						statusCode: 200,
						payload: {
							customerId: 1,
							totalOrders: 25,
							totalQuotes: 40,
							totalAccounts: 5,
							totalRevenue: 125000,
							lastOrderDate: '2024-12-15T00:00:00Z',
							createdAt: '2023-06-01T00:00:00Z',
						},
					},
				})
				mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse(1))

				const { result } = renderHook(() =>
					useCustomerDetails({ customerId: '1', isCreateMode: false })
				)

				await waitFor(() => {
					expect(result.current.loading.customer).toBe(false)
					expect(result.current.loading.stats).toBe(false)
				})

				// Verify all data loaded for SalesRep
				expect(result.current.customer.name).toBe('Regional Medical Center')
				expect(result.current.stats?.totalOrders).toBe(25)
				expect(result.current.stats?.totalQuotes).toBe(40)
				expect(result.current.accounts.length).toBeGreaterThan(0)
			})
		})

		describe('US-CUST-003: SalesRep cannot access unassigned customer', () => {
			it('should handle 403 when accessing unassigned customer', async () => {
				mockAPI.Customers.get.mockResolvedValue({
					data: {
						statusCode: 403,
						message: 'You can only view assigned customers',
						payload: null,
					},
				})

				const { result } = renderHook(() =>
					useCustomerDetails({ customerId: '999', isCreateMode: false })
				)

				await waitFor(() => {
					expect(mockRouter.back).toHaveBeenCalled()
				})
			})
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle customer with no accounts', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse())
			mockAPI.Accounts.search.mockResolvedValue({
				data: {
					statusCode: 200,
					payload: { data: [], total: 0 },
				},
			})

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.loading.accounts).toBe(false)
			})

			expect(result.current.accounts).toHaveLength(0)
		})

		it('should handle customer with null stats fields', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse())
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse())
			mockAPI.Customers.getStats.mockResolvedValue({
				data: {
					statusCode: 200,
					payload: {
						customerId: 1,
						totalOrders: 0,
						totalQuotes: 0,
						totalAccounts: 0,
						totalRevenue: 0,
						lastOrderDate: null, // No orders yet
						createdAt: '2024-12-01T00:00:00Z',
					},
				},
			})

			const { result } = renderHook(() =>
				useCustomerDetails({ customerId: '1', isCreateMode: false })
			)

			await waitFor(() => {
				expect(result.current.stats).not.toBeNull()
			})

			expect(result.current.stats?.lastOrderDate).toBeNull()
			expect(result.current.stats?.totalOrders).toBe(0)
		})

		it('should handle rapid customerId changes', async () => {
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse({ id: 1, name: 'First' }))
			mockAPI.Customers.getStats.mockResolvedValue(createMockStatsResponse(1))
			mockAPI.Accounts.search.mockResolvedValue(createMockAccountsResponse(1))

			const { result, rerender } = renderHook(
				({ customerId }) => useCustomerDetails({ customerId, isCreateMode: false }),
				{ initialProps: { customerId: '1' } }
			)

			// Change to different customer immediately
			mockAPI.Customers.get.mockResolvedValue(createMockCustomerResponse({ id: 2, name: 'Second' }))
			rerender({ customerId: '2' })

			await waitFor(() => {
				expect(result.current.loading.customer).toBe(false)
			})

			// Should show latest customer
			expect(mockAPI.Customers.get).toHaveBeenCalled()
		})
	})
})

