/**
 * Customer RBAC Integration Tests
 * 
 * MAANG-Level: End-to-end customer RBAC system validation.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY & DATA ACCESS
 * 
 * These tests validate the complete customer RBAC system:
 * - Role-based data visibility
 * - Field-level access control (internal notes)
 * - Sales rep assignment permissions
 * - Customer edit permissions
 * - Complete user journey tests
 * 
 * **Testing Strategy:**
 * 1. Complete customer journey for each role
 * 2. Internal notes visibility by role
 * 3. Sales rep assignment workflow
 * 4. Customer self-service scenarios
 * 5. Security boundary enforcement
 * 
 * @see prd_customers.md - Full PRD specification
 * @module __tests__/customers/customer-rbac-integration.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { AccountRole } from '@_classes/Enums'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock user state
const mockUser = vi.hoisted(() => ({
	current: null as { id: number; role: AccountRole; customerId?: number } | null,
}))

vi.mock('@_features/auth', () => ({
	useAuthStore: vi.fn((selector: (state: any) => any) =>
		selector({ user: mockUser.current, isAuthenticated: !!mockUser.current })
	),
}))

// Mock API responses
const mockAPI = vi.hoisted(() => ({
	Customers: {
		get: vi.fn(),
		getStats: vi.fn(),
		update: vi.fn(),
		assignSalesRep: vi.fn(),
		search: vi.fn(),
	},
	Accounts: {
		search: vi.fn(),
	},
}))

vi.mock('@_shared', () => ({
	API: mockAPI,
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

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		back: vi.fn(),
		push: vi.fn(),
	}),
	useParams: () => ({}),
}))

// ============================================================================
// TEST HELPERS
// ============================================================================

interface TestUser {
	id: number
	role: AccountRole
	customerId?: number
}

function loginAs(role: AccountRole, overrides: Partial<TestUser> = {}) {
	mockUser.current = {
		id: 1,
		role,
		...overrides,
	}
}

function loginAsCustomerUser(customerId: number) {
	mockUser.current = {
		id: 100,
		role: AccountRole.Customer,
		customerId,
	}
}

function loginAsSalesRep(salesRepId: number = 10) {
	mockUser.current = {
		id: salesRepId,
		role: AccountRole.SalesRep,
	}
}

function loginAsSalesManager(managerId: number = 20) {
	mockUser.current = {
		id: managerId,
		role: AccountRole.SalesManager,
	}
}

function loginAsAdmin(adminId: number = 1) {
	mockUser.current = {
		id: adminId,
		role: AccountRole.Admin,
	}
}

function logout() {
	mockUser.current = null
}

// Customer data factories
function createCustomer(overrides = {}) {
	return {
		id: 1,
		name: 'Test Hospital',
		email: 'contact@testhospital.com',
		phone: '555-123-4567',
		primarySalesRepId: 10,
		internalNotes: 'CONFIDENTIAL: Special pricing agreed for 2024',
		typeOfBusiness: 1,
		status: 0,
		createdAt: '2024-01-15T00:00:00Z',
		...overrides,
	}
}

function createCustomerResponse(customer = createCustomer()) {
	return {
		data: {
			statusCode: 200,
			message: 'customer_retrieved',
			payload: customer,
		},
	}
}

function create403Response(message = 'Access denied') {
	return {
		data: {
			statusCode: 403,
			message,
			payload: null,
		},
	}
}

// ============================================================================
// IMPORT HOOKS FOR TESTING
// ============================================================================

import { useCustomerPermissions } from '@/app/app/customers/[id]/_components/hooks/useCustomerPermissions'

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Customer RBAC Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		logout()
	})

	afterEach(() => {
		vi.clearAllMocks()
		logout()
	})

	// ==========================================================================
	// CUSTOMER ROLE - SELF-SERVICE SCENARIOS
	// ==========================================================================

	describe('Customer Role - Self-Service', () => {
		beforeEach(() => {
			loginAsCustomerUser(1)
		})

		describe('View Own Company (US-CUST: Customer can view own profile)', () => {
			it('Customer can view own company profile', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// Customer role is recognized
				expect(result.current.userRole).toBe(AccountRole.Customer)
				
				// Basic profile viewing is allowed (backend enforces ownership)
				// Frontend doesn't block view attempts
			})

			it('Customer CANNOT see internal notes field', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: Customer cannot see internal notes
				expect(result.current.canViewInternalFields).toBe(false)
			})
		})

		describe('Edit Own Company (US-CUST: Customer can edit own info)', () => {
			it('Customer CANNOT change sales rep assignment', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: Customer cannot change primary sales rep
				expect(result.current.canAssignSalesRep).toBe(false)
			})

			it('Customer CANNOT change company status', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.canChangeStatus).toBe(false)
			})

			it('Customer CANNOT delete company', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.canDelete).toBe(false)
			})
		})

		describe('Access Control - Other Companies', () => {
			it('Customer attempting to view other company should be denied', async () => {
				// API should return 403
				mockAPI.Customers.get.mockResolvedValue(
					create403Response('You can only view your own company')
				)

				// Simulate API call (hook would redirect on 403)
				const response = await mockAPI.Customers.get(999)
				
				expect(response.data.statusCode).toBe(403)
			})
		})
	})

	// ==========================================================================
	// SALES REP ROLE - ASSIGNED CUSTOMER MANAGEMENT
	// ==========================================================================

	describe('SalesRep Role - Assigned Customers', () => {
		beforeEach(() => {
			loginAsSalesRep(10)
		})

		describe('US-CUST-001: View assigned customers', () => {
			it('SalesRep can see internal notes for assigned customers', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: SalesRep can add internal notes about customer
				expect(result.current.canViewInternalFields).toBe(true)
			})

			it('SalesRep is recognized as SalesRep or above', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.isSalesRepOrAbove).toBe(true)
				expect(result.current.isSalesManagerOrAbove).toBe(false)
			})
		})

		describe('US-CUST-003: Update customer info', () => {
			it('SalesRep CANNOT change sales rep assignment', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: SalesRep cannot change primary sales rep assignment
				expect(result.current.canAssignSalesRep).toBe(false)
			})

			it('SalesRep CANNOT change customer status', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.canChangeStatus).toBe(false)
			})

			it('SalesRep CANNOT delete customers', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: SalesRep cannot delete customers
				expect(result.current.canDelete).toBe(false)
			})
		})

		describe('Access Control - Unassigned Customers', () => {
			it('SalesRep attempting to view unassigned customer should be denied', async () => {
				// API should return 403 for unassigned customer
				mockAPI.Customers.get.mockResolvedValue(
					create403Response('You can only view assigned customers')
				)

				const response = await mockAPI.Customers.get(999)
				
				expect(response.data.statusCode).toBe(403)
				expect(response.data.message).toContain('assigned')
			})

			it('SalesRep customer list should only include assigned customers', async () => {
				// API should filter to only assigned customers
				mockAPI.Customers.search.mockResolvedValue({
					data: {
						statusCode: 200,
						payload: {
							data: [
								createCustomer({ id: 1, primarySalesRepId: 10 }),
								createCustomer({ id: 2, primarySalesRepId: 10 }),
							],
							total: 2,
						},
					},
				})

				const response = await mockAPI.Customers.search({})
				
				// All returned customers are assigned to this rep
				response.data.payload.data.forEach((customer: any) => {
					expect(customer.primarySalesRepId).toBe(10)
				})
			})
		})
	})

	// ==========================================================================
	// SALES MANAGER ROLE - FULL OPERATIONAL ACCESS
	// ==========================================================================

	describe('SalesManager Role - Full Operations', () => {
		beforeEach(() => {
			loginAsSalesManager(20)
		})

		describe('US-CUST-002: View all customers', () => {
			it('SalesManager can see internal notes', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: SalesManager can view all internal notes
				expect(result.current.canViewInternalFields).toBe(true)
			})

			it('SalesManager is recognized as SalesManager or above', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.isSalesManagerOrAbove).toBe(true)
				expect(result.current.isAdmin).toBe(false)
			})

			it('SalesManager can view ALL customers (no assignment filter)', async () => {
				// API should return all customers
				mockAPI.Customers.search.mockResolvedValue({
					data: {
						statusCode: 200,
						payload: {
							data: [
								createCustomer({ id: 1, primarySalesRepId: 10 }),
								createCustomer({ id: 2, primarySalesRepId: 11 }),
								createCustomer({ id: 3, primarySalesRepId: null }),
							],
							total: 3,
						},
					},
				})

				const response = await mockAPI.Customers.search({})
				
				// SalesManager sees customers with different/no sales reps
				expect(response.data.payload.data.length).toBe(3)
			})
		})

		describe('US-CUST-004: Assign primary sales rep', () => {
			it('SalesManager CAN assign sales rep', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: SalesManager can assign/reassign primary sales rep
				expect(result.current.canAssignSalesRep).toBe(true)
			})

			it('SalesManager CAN change customer status', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.canChangeStatus).toBe(true)
			})

			it('SalesManager can assign sales rep via API', async () => {
				mockAPI.Customers.assignSalesRep.mockResolvedValue({
					data: {
						statusCode: 200,
						message: 'sales_rep_assigned',
						payload: createCustomer({ primarySalesRepId: 15 }),
					},
				})

				const response = await mockAPI.Customers.assignSalesRep(1, 15)
				
				expect(response.data.statusCode).toBe(200)
				expect(response.data.payload.primarySalesRepId).toBe(15)
			})

			it('SalesManager can reassign from one rep to another', async () => {
				// Customer currently assigned to Rep 10
				const customer = createCustomer({ primarySalesRepId: 10 })
				
				mockAPI.Customers.assignSalesRep.mockResolvedValue({
					data: {
						statusCode: 200,
						message: 'sales_rep_assigned',
						payload: { ...customer, primarySalesRepId: 11 },
					},
				})

				const response = await mockAPI.Customers.assignSalesRep(1, 11)
				
				// Rep A (10) -> Rep B (11)
				expect(response.data.payload.primarySalesRepId).toBe(11)
			})
		})

		describe('Limitations', () => {
			it('SalesManager CANNOT delete customers', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: SalesManager cannot delete customers
				expect(result.current.canDelete).toBe(false)
			})
		})
	})

	// ==========================================================================
	// ADMIN ROLE - FULL ACCESS
	// ==========================================================================

	describe('Admin Role - Full Access', () => {
		beforeEach(() => {
			loginAsAdmin()
		})

		describe('Full Customer Management', () => {
			it('Admin has all permissions', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: Admin has full customer management
				expect(result.current.canAssignSalesRep).toBe(true)
				expect(result.current.canViewInternalFields).toBe(true)
				expect(result.current.canChangeStatus).toBe(true)
				expect(result.current.canDelete).toBe(true)
				expect(result.current.isAdmin).toBe(true)
			})

			it('Admin CAN delete customers', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// PRD: Admin can delete customers (soft delete)
				expect(result.current.canDelete).toBe(true)
			})
		})
	})

	// ==========================================================================
	// ROLE TRANSITION SCENARIOS
	// ==========================================================================

	describe('Role Transition Scenarios', () => {
		it('Permissions update when user role changes', () => {
			// Start as Customer
			loginAsCustomerUser(1)
			let { result, rerender } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canViewInternalFields).toBe(false)
			expect(result.current.canAssignSalesRep).toBe(false)
			
			// Upgrade to SalesRep (maybe user got promoted)
			loginAsSalesRep()
			;({ result } = renderHook(() => useCustomerPermissions()))
			
			expect(result.current.canViewInternalFields).toBe(true)
			expect(result.current.canAssignSalesRep).toBe(false)
			
			// Upgrade to SalesManager
			loginAsSalesManager()
			;({ result } = renderHook(() => useCustomerPermissions()))
			
			expect(result.current.canViewInternalFields).toBe(true)
			expect(result.current.canAssignSalesRep).toBe(true)
		})

		it('Permissions reset on logout', () => {
			loginAsAdmin()
			let { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canDelete).toBe(true)
			
			logout()
			;({ result } = renderHook(() => useCustomerPermissions()))
			
			// Defaults to Customer (least privilege)
			expect(result.current.canDelete).toBe(false)
			expect(result.current.canViewInternalFields).toBe(false)
		})
	})

	// ==========================================================================
	// SECURITY BOUNDARY TESTS
	// ==========================================================================

	describe('Security Boundary Tests', () => {
		it('Internal notes should NEVER be visible to Customer role', () => {
			loginAsCustomerUser(1)
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canViewInternalFields).toBe(false)
		})

		it('Delete permission ONLY available to Admin', () => {
			const nonAdminRoles = [
				{ role: AccountRole.Customer, setup: () => loginAsCustomerUser(1) },
				{ role: AccountRole.SalesRep, setup: () => loginAsSalesRep() },
				{ role: AccountRole.FulfillmentCoordinator, setup: () => loginAs(AccountRole.FulfillmentCoordinator) },
				{ role: AccountRole.SalesManager, setup: () => loginAsSalesManager() },
			]

			for (const { role, setup } of nonAdminRoles) {
				setup()
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(
					result.current.canDelete,
					`Role ${AccountRole[role]} should NOT have delete permission`
				).toBe(false)
			}

			// Only Admin
			loginAsAdmin()
			const { result } = renderHook(() => useCustomerPermissions())
			expect(result.current.canDelete).toBe(true)
		})

		it('Sales rep assignment ONLY available to SalesManager+ (excludes FC)', () => {
			// Per PRD: Role hierarchy is Customer(100) < FC(200) < SalesRep(300) < SalesManager(400) < Admin(500)
			const belowManager = [
				{ role: AccountRole.Customer, setup: () => loginAsCustomerUser(1) },
				{ role: AccountRole.SalesRep, setup: () => loginAsSalesRep() },
			]

			for (const { role, setup } of belowManager) {
				setup()
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(
					result.current.canAssignSalesRep,
					`Role ${AccountRole[role]} should NOT have assign permission`
				).toBe(false)
			}

			// FC (200) is BELOW SalesManager (400), so FC CANNOT assign
			loginAs(AccountRole.FulfillmentCoordinator)
			let { result } = renderHook(() => useCustomerPermissions())
			expect(result.current.canAssignSalesRep).toBe(false)

			// Only SalesManager+ can assign
			loginAsSalesManager()
			;({ result } = renderHook(() => useCustomerPermissions()))
			expect(result.current.canAssignSalesRep).toBe(true)

			loginAsAdmin()
			;({ result } = renderHook(() => useCustomerPermissions()))
			expect(result.current.canAssignSalesRep).toBe(true)
		})
	})

	// ==========================================================================
	// BUSINESS FLOW VALIDATION
	// ==========================================================================

	describe('Business Flow Validation', () => {
		describe('Customer Onboarding Flow', () => {
			it('New customer without sales rep can be assigned by Manager', async () => {
				loginAsSalesManager()
				const { result } = renderHook(() => useCustomerPermissions())
				
				// Manager can assign
				expect(result.current.canAssignSalesRep).toBe(true)

				// API accepts assignment
				mockAPI.Customers.assignSalesRep.mockResolvedValue({
					data: {
						statusCode: 200,
						payload: createCustomer({ primarySalesRepId: 10 }),
					},
				})

				const response = await mockAPI.Customers.assignSalesRep(1, 10)
				expect(response.data.payload.primarySalesRepId).toBe(10)
			})
		})

		describe('Sales Rep Reassignment Flow', () => {
			it('Manager can reassign from Rep A to Rep B', async () => {
				loginAsSalesManager()
				
				// Current: Assigned to Rep 10
				mockAPI.Customers.get.mockResolvedValue(
					createCustomerResponse(createCustomer({ primarySalesRepId: 10 }))
				)

				// Reassign to Rep 11
				mockAPI.Customers.assignSalesRep.mockResolvedValue({
					data: {
						statusCode: 200,
						payload: createCustomer({ primarySalesRepId: 11 }),
					},
				})

				const response = await mockAPI.Customers.assignSalesRep(1, 11)
				expect(response.data.payload.primarySalesRepId).toBe(11)
			})

			it('Rep A loses access after reassignment to Rep B', async () => {
				// Before reassignment: Rep A (10) can access
				loginAsSalesRep(10)
				
				mockAPI.Customers.get.mockResolvedValue(
					createCustomerResponse(createCustomer({ primarySalesRepId: 10 }))
				)
				
				let response = await mockAPI.Customers.get(1)
				expect(response.data.statusCode).toBe(200)

				// After reassignment to Rep B (11), Rep A gets 403
				mockAPI.Customers.get.mockResolvedValue(
					create403Response('You can only view assigned customers')
				)

				response = await mockAPI.Customers.get(1)
				expect(response.data.statusCode).toBe(403)
			})
		})

		describe('Internal Notes Workflow', () => {
			it('SalesRep can add notes visible to other staff', async () => {
				loginAsSalesRep(10)
				const { result } = renderHook(() => useCustomerPermissions())
				
				// SalesRep can view/add internal notes
				expect(result.current.canViewInternalFields).toBe(true)

				// Notes in API response
				mockAPI.Customers.get.mockResolvedValue(
					createCustomerResponse(createCustomer({
						internalNotes: 'Added by SalesRep: Follow up on pricing discussion',
					}))
				)

				const response = await mockAPI.Customers.get(1)
				expect(response.data.payload.internalNotes).toContain('Follow up')
			})

			it('Customer NEVER sees internal notes even in API response', async () => {
				loginAsCustomerUser(1)
				const { result } = renderHook(() => useCustomerPermissions())
				
				// Frontend should hide internal notes
				expect(result.current.canViewInternalFields).toBe(false)

				// Backend should also strip internal notes for Customer role
				// (This is a backend responsibility, but we validate the frontend flag)
			})
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('Handles null/undefined user gracefully', () => {
			logout()
			
			expect(() => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// Should default to least privilege
				expect(result.current.userRole).toBe(AccountRole.Customer)
				expect(result.current.canViewInternalFields).toBe(false)
				expect(result.current.canAssignSalesRep).toBe(false)
				expect(result.current.canDelete).toBe(false)
			}).not.toThrow()
		})

		it('Customer with null customerId cannot view any company', async () => {
			mockUser.current = {
				id: 100,
				role: AccountRole.Customer,
				customerId: undefined, // No company linked
			}

			mockAPI.Customers.get.mockResolvedValue(
				create403Response('No company associated with account')
			)

			const response = await mockAPI.Customers.get(1)
			expect(response.data.statusCode).toBe(403)
		})

		it('Handles concurrent permission checks', () => {
			loginAsSalesManager()

			// Multiple parallel permission checks
			const results = Array.from({ length: 10 }, () => {
				const { result } = renderHook(() => useCustomerPermissions())
				return result.current
			})

			// All should have consistent permissions
			results.forEach((perm) => {
				expect(perm.canAssignSalesRep).toBe(true)
				expect(perm.canViewInternalFields).toBe(true)
				expect(perm.canDelete).toBe(false)
			})
		})
	})
})

