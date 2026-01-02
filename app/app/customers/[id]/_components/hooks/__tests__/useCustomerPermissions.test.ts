/**
 * useCustomerPermissions Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive permission testing for customers.
 * Tests all customer-related permissions across all roles.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY & DATA ACCESS
 * 
 * **What This Tests:**
 * - View permissions (Own, Assigned, All contexts)
 * - Edit permissions (Contact info, internal notes)
 * - Assign sales rep permissions (SalesManager+)
 * - Delete/Archive permissions (Admin only)
 * - Internal notes visibility
 * 
 * **Coverage Areas (from PRD prd_customers.md):**
 * - Customer: View own company, edit own info, CANNOT see internal notes
 * - SalesRep: View/edit assigned customers, add internal notes
 * - SalesManager: View all, assign sales reps, full operational access
 * - Admin: Full access including delete/archive
 * 
 * @see prd_customers.md - Full PRD specification
 * @module app/customers/[id]/_components/hooks/__tests__/useCustomerPermissions.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCustomerPermissions } from '../useCustomerPermissions'
import { AccountRole, type AccountRoleType } from '@_classes/Enums'
import { RoleLevelNames } from '@_types/rbac'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock the auth store
const mockUser = vi.hoisted(() => ({
	current: null as { role: AccountRoleType } | null,
}))

vi.mock('@_features/auth', () => ({
	useAuthStore: vi.fn((selector: (state: any) => any) =>
		selector({ user: mockUser.current })
	),
}))

// ============================================================================
// TEST HELPERS
// ============================================================================

function setUserRole(role: AccountRoleType) {
	mockUser.current = { role }
}

/** Helper to get role name for test descriptions */
function getRoleName(role: AccountRoleType): string {
	return RoleLevelNames[role] ?? `Role ${role}`
}

function clearUser() {
	mockUser.current = null
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useCustomerPermissions Hook', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		clearUser()
	})

	afterEach(() => {
		vi.clearAllMocks()
		clearUser()
	})

	// ==========================================================================
	// CUSTOMER ROLE PERMISSIONS (from PRD Section 3)
	// ==========================================================================

	describe('Customer Role Permissions', () => {
		beforeEach(() => {
			setUserRole(AccountRole.Customer)
		})

		it('Customer CANNOT assign sales rep', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: Customer cannot change primary sales rep
			expect(result.current.canAssignSalesRep).toBe(false)
		})

		it('Customer CANNOT view internal fields', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: Customer cannot see internal notes
			expect(result.current.canViewInternalFields).toBe(false)
		})

		it('Customer CANNOT change customer status', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canChangeStatus).toBe(false)
		})

		it('Customer CANNOT delete customers', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canDelete).toBe(false)
		})

		it('Customer is NOT SalesRep or above', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.isSalesRepOrAbove).toBe(false)
			expect(result.current.isSalesManagerOrAbove).toBe(false)
			expect(result.current.isAdmin).toBe(false)
		})

		it('Customer has correct role level', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.userRole).toBe(AccountRole.Customer)
		})
	})

	// ==========================================================================
	// SALES REP ROLE PERMISSIONS (from PRD Section 3)
	// ==========================================================================

	describe('SalesRep Role Permissions', () => {
		beforeEach(() => {
			setUserRole(AccountRole.SalesRep)
		})

		it('SalesRep CANNOT assign sales rep', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: SalesRep cannot change primary sales rep assignment
			expect(result.current.canAssignSalesRep).toBe(false)
		})

		it('SalesRep CAN view internal fields', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: SalesRep can add internal notes about customer
			expect(result.current.canViewInternalFields).toBe(true)
		})

		it('SalesRep CANNOT change customer status', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: SalesRep can update customer contact info, not status
			expect(result.current.canChangeStatus).toBe(false)
		})

		it('SalesRep CANNOT delete customers', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: SalesRep cannot delete customers
			expect(result.current.canDelete).toBe(false)
		})

		it('SalesRep IS SalesRep or above', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.isSalesRepOrAbove).toBe(true)
			expect(result.current.isSalesManagerOrAbove).toBe(false)
			expect(result.current.isAdmin).toBe(false)
		})

		it('SalesRep has correct role level', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.userRole).toBe(AccountRole.SalesRep)
		})
	})

	// ==========================================================================
	// FULFILLMENT COORDINATOR ROLE PERMISSIONS
	// Note: Per PRD hierarchy: Customer (100) < FC (200) < SalesRep (300) < SalesManager (400) < Admin (500)
	// FulfillmentCoordinator is BELOW SalesRep and SalesManager!
	// ==========================================================================

	describe('FulfillmentCoordinator Role Permissions', () => {
		beforeEach(() => {
			setUserRole(AccountRole.FulfillmentCoordinator)
		})

		it('FulfillmentCoordinator CANNOT assign sales rep (FC is below SalesManager)', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// FC (200) < SalesManager (400) - does NOT have manager-level permissions
			expect(result.current.canAssignSalesRep).toBe(false)
		})

		it('FulfillmentCoordinator CANNOT view internal fields (below SalesRep)', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// FC (200) < SalesRep (300) - does not have internal field access
			expect(result.current.canViewInternalFields).toBe(false)
		})

		it('FulfillmentCoordinator CANNOT change customer status (FC < SalesManager)', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// FC (200) < SalesManager (400) - does NOT have manager-level permissions
			expect(result.current.canChangeStatus).toBe(false)
		})

		it('FulfillmentCoordinator CANNOT delete customers', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// Only Admin can delete
			expect(result.current.canDelete).toBe(false)
		})

		it('FulfillmentCoordinator is NOT SalesRep or above (FC < SalesRep)', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// Per PRD: FC (200) < SalesRep (300)
			expect(result.current.isSalesRepOrAbove).toBe(false)
			expect(result.current.isSalesManagerOrAbove).toBe(false)
			expect(result.current.isAdmin).toBe(false)
		})
	})

	// ==========================================================================
	// SALES MANAGER ROLE PERMISSIONS (from PRD Section 3)
	// ==========================================================================

	describe('SalesManager Role Permissions', () => {
		beforeEach(() => {
			setUserRole(AccountRole.SalesManager)
		})

		it('SalesManager CAN assign sales rep', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: SalesManager can assign/reassign primary sales rep
			expect(result.current.canAssignSalesRep).toBe(true)
		})

		it('SalesManager CAN view internal fields', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: SalesManager can view all internal notes
			expect(result.current.canViewInternalFields).toBe(true)
		})

		it('SalesManager CAN change customer status', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canChangeStatus).toBe(true)
		})

		it('SalesManager CANNOT delete customers', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: SalesManager cannot delete customers
			expect(result.current.canDelete).toBe(false)
		})

		it('SalesManager IS SalesManager or above', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.isSalesRepOrAbove).toBe(true)
			expect(result.current.isSalesManagerOrAbove).toBe(true)
			expect(result.current.isAdmin).toBe(false)
		})

		it('SalesManager has correct role level', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.userRole).toBe(AccountRole.SalesManager)
		})
	})

	// ==========================================================================
	// ADMIN ROLE PERMISSIONS (from PRD Section 3)
	// ==========================================================================

	describe('Admin Role Permissions', () => {
		beforeEach(() => {
			setUserRole(AccountRole.Admin)
		})

		it('Admin CAN assign sales rep', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: Admin has full customer management
			expect(result.current.canAssignSalesRep).toBe(true)
		})

		it('Admin CAN view internal fields', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canViewInternalFields).toBe(true)
		})

		it('Admin CAN change customer status', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canChangeStatus).toBe(true)
		})

		it('Admin CAN delete customers', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			// PRD: Admin can delete customers (soft delete)
			expect(result.current.canDelete).toBe(true)
		})

		it('Admin IS Admin', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.isSalesRepOrAbove).toBe(true)
			expect(result.current.isSalesManagerOrAbove).toBe(true)
			expect(result.current.isAdmin).toBe(true)
		})

		it('Admin has correct role level', () => {
			const { result } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.userRole).toBe(AccountRole.Admin)
		})
	})

	// ==========================================================================
	// EDGE CASES
	// ==========================================================================

	describe('Edge Cases', () => {
		it('should handle null user gracefully', () => {
			clearUser()
			
			const { result } = renderHook(() => useCustomerPermissions())
			
			// Should default to Customer role (least privileged)
			expect(result.current.userRole).toBe(AccountRole.Customer)
			expect(result.current.canAssignSalesRep).toBe(false)
			expect(result.current.canViewInternalFields).toBe(false)
			expect(result.current.canChangeStatus).toBe(false)
			expect(result.current.canDelete).toBe(false)
			expect(result.current.isSalesRepOrAbove).toBe(false)
			expect(result.current.isSalesManagerOrAbove).toBe(false)
			expect(result.current.isAdmin).toBe(false)
		})

		it('should handle undefined role gracefully', () => {
			mockUser.current = { role: undefined as any }
			
			const { result } = renderHook(() => useCustomerPermissions())
			
			// Should default to Customer role
			expect(result.current.userRole).toBe(AccountRole.Customer)
			expect(result.current.canAssignSalesRep).toBe(false)
		})

		it('should memoize return value when role unchanged', () => {
			setUserRole(AccountRole.SalesRep)
			
			const { result, rerender } = renderHook(() => useCustomerPermissions())
			const firstResult = result.current
			
			rerender()
			
			// Same object reference (memoized)
			expect(result.current).toBe(firstResult)
		})

		it('should update when role changes', () => {
			setUserRole(AccountRole.Customer)
			
			const { result, rerender } = renderHook(() => useCustomerPermissions())
			
			expect(result.current.canViewInternalFields).toBe(false)
			
			// Upgrade role
			setUserRole(AccountRole.SalesRep)
			rerender()
			
			expect(result.current.canViewInternalFields).toBe(true)
		})
	})

	// ==========================================================================
	// PRD USER STORIES VALIDATION
	// ==========================================================================

	describe('PRD User Story Validation', () => {
		describe('US-CUST-001: SalesRep views assigned customers', () => {
			beforeEach(() => {
				setUserRole(AccountRole.SalesRep)
			})

			it('SalesRep should have view capability', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// SalesRep needs internal field access to manage relationships
				expect(result.current.isSalesRepOrAbove).toBe(true)
				expect(result.current.canViewInternalFields).toBe(true)
			})
		})

		describe('US-CUST-002: SalesManager views all customers', () => {
			beforeEach(() => {
				setUserRole(AccountRole.SalesManager)
			})

			it('SalesManager should have full view capability', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.isSalesManagerOrAbove).toBe(true)
				expect(result.current.canViewInternalFields).toBe(true)
			})
		})

		describe('US-CUST-003: SalesRep updates customer info', () => {
			beforeEach(() => {
				setUserRole(AccountRole.SalesRep)
			})

			it('SalesRep can edit customer info but not status', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				// Can add notes (internal fields)
				expect(result.current.canViewInternalFields).toBe(true)
				// Cannot change status
				expect(result.current.canChangeStatus).toBe(false)
			})

			it('SalesRep cannot assign sales rep', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.canAssignSalesRep).toBe(false)
			})
		})

		describe('US-CUST-004: SalesManager assigns primary sales rep', () => {
			beforeEach(() => {
				setUserRole(AccountRole.SalesManager)
			})

			it('SalesManager can assign sales rep', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.canAssignSalesRep).toBe(true)
			})

			it('SalesManager cannot delete (only Admin)', () => {
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(result.current.canDelete).toBe(false)
			})
		})
	})

	// ==========================================================================
	// ROLE HIERARCHY VALIDATION
	// Per PRD: Customer (100) < FC (200) < SalesRep (300) < SalesManager (400) < Admin (500)
	// ==========================================================================

	describe('Role Hierarchy Validation', () => {
		it('should correctly order role permissions based on actual hierarchy', () => {
			// Test in actual enum order (by value) per PRD
			const roles = [
				AccountRole.Customer,              // 100
				AccountRole.FulfillmentCoordinator, // 200
				AccountRole.SalesRep,              // 300
				AccountRole.SalesManager,          // 400
				AccountRole.Admin,                 // 500
			]

			const permissions = roles.map((role) => {
				setUserRole(role)
				const { result } = renderHook(() => useCustomerPermissions())
				return {
					role,
					canViewInternalFields: result.current.canViewInternalFields,
					canAssignSalesRep: result.current.canAssignSalesRep,
					canChangeStatus: result.current.canChangeStatus,
					canDelete: result.current.canDelete,
				}
			})

			// Customer (100): no permissions
			expect(permissions[0].canViewInternalFields).toBe(false)
			expect(permissions[0].canAssignSalesRep).toBe(false)
			expect(permissions[0].canDelete).toBe(false)

			// FulfillmentCoordinator (200): below SalesRep, limited permissions
			expect(permissions[1].canViewInternalFields).toBe(false)
			expect(permissions[1].canAssignSalesRep).toBe(false)
			expect(permissions[1].canDelete).toBe(false)

			// SalesRep (300): view internal only
			expect(permissions[2].canViewInternalFields).toBe(true)
			expect(permissions[2].canAssignSalesRep).toBe(false)
			expect(permissions[2].canDelete).toBe(false)

			// SalesManager (400): can assign
			expect(permissions[3].canViewInternalFields).toBe(true)
			expect(permissions[3].canAssignSalesRep).toBe(true)
			expect(permissions[3].canDelete).toBe(false)

			// Admin (500): full access
			expect(permissions[4].canViewInternalFields).toBe(true)
			expect(permissions[4].canAssignSalesRep).toBe(true)
			expect(permissions[4].canDelete).toBe(true)
		})
	})

	// ==========================================================================
	// SECURITY BOUNDARY TESTS
	// ==========================================================================

	describe('Security Boundary Tests', () => {
		it('Delete permission is ONLY available to Admin', () => {
			const nonAdminRoles = [
				AccountRole.Customer,
				AccountRole.SalesRep,
				AccountRole.FulfillmentCoordinator,
				AccountRole.SalesManager,
			]

			for (const role of nonAdminRoles) {
				setUserRole(role)
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(
					result.current.canDelete,
					`Role ${getRoleName(role)} should NOT have delete permission`
				).toBe(false)
			}

			// Only Admin
			setUserRole(AccountRole.Admin)
			const { result } = renderHook(() => useCustomerPermissions())
			expect(result.current.canDelete).toBe(true)
		})

		it('Assign permission is ONLY available to SalesManager+ (excludes FC)', () => {
			// Per PRD: Roles BELOW SalesManager (400) cannot assign
			const belowManagerRoles = [
				AccountRole.Customer,              // 100
				AccountRole.FulfillmentCoordinator, // 200
				AccountRole.SalesRep,              // 300
			]

			for (const role of belowManagerRoles) {
				setUserRole(role)
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(
					result.current.canAssignSalesRep,
					`Role ${getRoleName(role)} should NOT have assign permission`
				).toBe(false)
			}

			// Only SalesManager+ can assign (FC is 200, which is < 400 SalesManager)
			const managerPlusRoles = [
				AccountRole.SalesManager,          // 400
				AccountRole.Admin,                 // 500
			]
			for (const role of managerPlusRoles) {
				setUserRole(role)
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(
					result.current.canAssignSalesRep,
					`Role ${getRoleName(role)} SHOULD have assign permission`
				).toBe(true)
			}
		})

		it('Internal notes visibility is ONLY available to SalesRep+', () => {
			// Per PRD: Customer and FC cannot see internal notes (both below SalesRep)
			const belowSalesRepRoles = [
				AccountRole.Customer,              // 100
				AccountRole.FulfillmentCoordinator, // 200
			]
			
			for (const role of belowSalesRepRoles) {
				setUserRole(role)
				const { result } = renderHook(() => useCustomerPermissions())
				expect(
					result.current.canViewInternalFields,
					`Role ${getRoleName(role)} should NOT see internal fields`
				).toBe(false)
			}

			// SalesRep+ can see internal notes
			const staffRoles = [
				AccountRole.SalesRep,              // 300
				AccountRole.SalesManager,          // 400
				AccountRole.Admin,                 // 500
			]

			for (const role of staffRoles) {
				setUserRole(role)
				const { result } = renderHook(() => useCustomerPermissions())
				
				expect(
					result.current.canViewInternalFields,
					`Role ${getRoleName(role)} SHOULD see internal fields`
				).toBe(true)
			}
		})
	})
})

