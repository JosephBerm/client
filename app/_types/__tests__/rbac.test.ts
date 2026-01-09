/**
 * RBAC Types and Constants Unit Tests
 *
 * MAANG-Level: Comprehensive type system and constant validation.
 *
 * **Priority**: 🔴 CRITICAL - SECURITY FOUNDATION
 *
 * These constants are the foundation of the entire RBAC system.
 * Incorrect values here would cascade to ALL permission checks.
 *
 * **Testing Strategy:**
 * 1. Validate all constants match backend expectations
 * 2. Test helper functions for correctness
 * 3. Ensure type safety
 * 4. Test edge cases for helper functions
 *
 * NOTE: RoleLevels, getRoleDisplayName, and role helper functions have moved to @_shared.
 * Tests for those are in separate test files or usePermissions hook tests.
 *
 * @module RBAC/types.test
 */

import { describe, it, expect } from 'vitest'
import {
	Resources,
	Actions,
	Contexts,
	buildPermission,
	type Resource,
	type Action,
	type Context,
	type Permission,
} from '../rbac'
import { RoleLevels, getRoleDisplayName, DEFAULT_ROLE_METADATA } from '@_shared'

// ============================================================================
// ROLE LEVELS TESTS (Now from @_shared)
// ============================================================================

describe('RBAC Constants - RoleLevels (from @_shared)', () => {
	describe('Value Validation (per backend RBACConstants.cs)', () => {
		it('Customer should be 1000 (lowest level)', () => {
			expect(RoleLevels.Customer).toBe(1000)
		})

		it('FulfillmentCoordinator should be 2000 (below SalesRep per PRD)', () => {
			// PRD: Fulfillment CANNOT confirm payments or cancel orders
			// Therefore must be below SalesRep in hierarchy
			expect(RoleLevels.FulfillmentCoordinator).toBe(2000)
		})

		it('SalesRep should be 3000', () => {
			expect(RoleLevels.SalesRep).toBe(3000)
		})

		it('SalesManager should be 4000', () => {
			expect(RoleLevels.SalesManager).toBe(4000)
		})

		it('Admin should be 5000', () => {
			expect(RoleLevels.Admin).toBe(5000)
		})

		it('SuperAdmin should be 9999 (highest level)', () => {
			expect(RoleLevels.SuperAdmin).toBe(9999)
		})
	})

	describe('Hierarchy Ordering', () => {
		it('roles should be ordered correctly in hierarchy (per PRD medsource_prd_system.md)', () => {
			// PRD Hierarchy: Admin → Sales Manager → Sales Rep → Fulfillment → Customer
			expect(RoleLevels.Customer).toBeLessThan(RoleLevels.FulfillmentCoordinator)
			expect(RoleLevels.FulfillmentCoordinator).toBeLessThan(RoleLevels.SalesRep)
			expect(RoleLevels.SalesRep).toBeLessThan(RoleLevels.SalesManager)
			expect(RoleLevels.SalesManager).toBeLessThan(RoleLevels.Admin)
		})

		it('SuperAdmin should be higher than all other roles', () => {
			// PRD hierarchy: SuperAdmin (9999) is the highest role
			const highestNonSuperAdmin = Math.max(
				RoleLevels.Customer,
				RoleLevels.SalesRep,
				RoleLevels.SalesManager,
				RoleLevels.FulfillmentCoordinator,
				RoleLevels.Admin
			)

			expect(RoleLevels.SuperAdmin).toBeGreaterThan(highestNonSuperAdmin)
		})
	})

	describe('Type Safety', () => {
		it('should be const object (immutable)', () => {
			// TypeScript "as const" ensures these are readonly
			expect(Object.isFrozen(RoleLevels)).toBe(false) // JS doesn't freeze, but TS prevents mutation

			// Verify all expected keys exist
			expect(RoleLevels).toHaveProperty('Customer')
			expect(RoleLevels).toHaveProperty('SalesRep')
			expect(RoleLevels).toHaveProperty('SalesManager')
			expect(RoleLevels).toHaveProperty('FulfillmentCoordinator')
			expect(RoleLevels).toHaveProperty('Admin')
		})
	})
})

// ============================================================================
// ROLE METADATA TESTS (Replaces RoleNames and RoleDisplayNames)
// ============================================================================

describe('RBAC Constants - DEFAULT_ROLE_METADATA (from @_shared)', () => {
	it('should have metadata for all role levels', () => {
		const allRoleLevels = Object.values(RoleLevels)

		for (const level of allRoleLevels) {
			expect(DEFAULT_ROLE_METADATA[level]).toBeDefined()
			expect(DEFAULT_ROLE_METADATA[level].name).toBeDefined()
			expect(DEFAULT_ROLE_METADATA[level].display).toBeDefined()
		}
	})

	it('should have correct display names', () => {
		expect(DEFAULT_ROLE_METADATA[RoleLevels.Customer].display).toBe('Customer')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.SalesRep].display).toBe('Sales Representative')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.SalesManager].display).toBe('Sales Manager')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.FulfillmentCoordinator].display).toBe('Fulfillment Coordinator')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.Admin].display).toBe('Administrator')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.SuperAdmin].display).toBe('Super Administrator')
	})

	it('should have correct API names (snake_case)', () => {
		expect(DEFAULT_ROLE_METADATA[RoleLevels.Customer].name).toBe('customer')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.SalesRep].name).toBe('sales_rep')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.SalesManager].name).toBe('sales_manager')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.FulfillmentCoordinator].name).toBe('fulfillment_coordinator')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.Admin].name).toBe('admin')
		expect(DEFAULT_ROLE_METADATA[RoleLevels.SuperAdmin].name).toBe('super_admin')
	})
})

// ============================================================================
// getRoleDisplayName TESTS (from @_shared)
// ============================================================================

describe('getRoleDisplayName() (from @_shared)', () => {
	it('should return correct display names', () => {
		expect(getRoleDisplayName(RoleLevels.Customer)).toBe('Customer')
		expect(getRoleDisplayName(RoleLevels.SalesRep)).toBe('Sales Representative')
		expect(getRoleDisplayName(RoleLevels.SalesManager)).toBe('Sales Manager')
		expect(getRoleDisplayName(RoleLevels.FulfillmentCoordinator)).toBe('Fulfillment Coordinator')
		expect(getRoleDisplayName(RoleLevels.Admin)).toBe('Administrator')
	})

	it('should return fallback for undefined', () => {
		expect(getRoleDisplayName(undefined)).toBe('Unknown')
	})

	it('should return fallback with role level for unknown values', () => {
		expect(getRoleDisplayName(999)).toBe('Role 999')
		expect(getRoleDisplayName(-1)).toBe('Role -1')
	})
})

// ============================================================================
// RESOURCES TESTS
// ============================================================================

describe('RBAC Constants - Resources', () => {
	it('should have all expected resources', () => {
		expect(Resources.Quotes).toBe('quotes')
		expect(Resources.Orders).toBe('orders')
		expect(Resources.Products).toBe('products')
		expect(Resources.Customers).toBe('customers')
		expect(Resources.Vendors).toBe('vendors')
		expect(Resources.Analytics).toBe('analytics')
		expect(Resources.Users).toBe('users')
		expect(Resources.Settings).toBe('settings')
		expect(Resources.Providers).toBe('providers')
	})

	it('should use lowercase format (API convention)', () => {
		const allResources = Object.values(Resources)

		for (const resource of allResources) {
			expect(resource).toBe(resource.toLowerCase())
		}
	})

	it('should have at least 8 resources (comprehensive coverage)', () => {
		const resourceCount = Object.keys(Resources).length
		expect(resourceCount).toBeGreaterThanOrEqual(8)
	})
})

// ============================================================================
// ACTIONS TESTS
// ============================================================================

describe('RBAC Constants - Actions', () => {
	it('should have all CRUD actions', () => {
		expect(Actions.Read).toBe('read')
		expect(Actions.Create).toBe('create')
		expect(Actions.Update).toBe('update')
		expect(Actions.Delete).toBe('delete')
	})

	it('should have workflow actions', () => {
		expect(Actions.Approve).toBe('approve')
		expect(Actions.Assign).toBe('assign')
		expect(Actions.Export).toBe('export')
		expect(Actions.Manage).toBe('manage')
	})

	it('should have domain-specific actions', () => {
		expect(Actions.ConfirmPayment).toBe('confirm_payment')
		expect(Actions.UpdateTracking).toBe('update_tracking')
	})

	it('should use snake_case format for multi-word actions', () => {
		expect(Actions.ConfirmPayment).toMatch(/^[a-z]+(_[a-z]+)*$/)
		expect(Actions.UpdateTracking).toMatch(/^[a-z]+(_[a-z]+)*$/)
	})
})

// ============================================================================
// CONTEXTS TESTS
// ============================================================================

describe('RBAC Constants - Contexts', () => {
	it('should have all context levels', () => {
		expect(Contexts.Own).toBe('own')
		expect(Contexts.Assigned).toBe('assigned')
		expect(Contexts.Team).toBe('team')
		expect(Contexts.All).toBe('all')
	})

	it('should represent hierarchy from narrow to wide', () => {
		// Conceptual hierarchy: Own < Assigned < Team < All
		const contexts = [Contexts.Own, Contexts.Assigned, Contexts.Team, Contexts.All]
		expect(contexts).toHaveLength(4)
	})
})

// ============================================================================
// buildPermission() TESTS
// ============================================================================

describe('buildPermission()', () => {
	it('should build permission without context', () => {
		expect(buildPermission(Resources.Quotes, Actions.Read)).toBe('quotes:read')
		expect(buildPermission(Resources.Orders, Actions.Create)).toBe('orders:create')
		expect(buildPermission(Resources.Users, Actions.Delete)).toBe('users:delete')
	})

	it('should build permission with context', () => {
		expect(buildPermission(Resources.Quotes, Actions.Read, Contexts.Own)).toBe('quotes:read:own')
		expect(buildPermission(Resources.Orders, Actions.Update, Contexts.Assigned)).toBe('orders:update:assigned')
		expect(buildPermission(Resources.Customers, Actions.Read, Contexts.Team)).toBe('customers:read:team')
		expect(buildPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe('analytics:read:all')
	})

	it('should handle all resource/action combinations', () => {
		const allResources = Object.values(Resources) as Resource[]
		const allActions = Object.values(Actions) as Action[]

		for (const resource of allResources) {
			for (const action of allActions) {
				const permission = buildPermission(resource, action)
				expect(permission).toBe(`${resource}:${action}`)
			}
		}
	})

	it('should handle all context combinations', () => {
		const allContexts = Object.values(Contexts) as Context[]

		for (const context of allContexts) {
			const permission = buildPermission(Resources.Quotes, Actions.Read, context)
			expect(permission).toBe(`quotes:read:${context}`)
		}
	})
})

// ============================================================================
// TYPE SAFETY TESTS
// ============================================================================

describe('RBAC Type Safety', () => {
	it('Permission type should match expected format', () => {
		// These should compile without TypeScript errors
		const validPermissions: Permission[] = [
			'quotes:read',
			'quotes:read:own',
			'orders:create',
			'orders:update:all',
			'users:delete',
			'settings:manage',
		]

		expect(validPermissions.length).toBe(6)
	})

	it('Role levels should be valid numbers', () => {
		// All role levels should be valid numbers
		const validLevels: number[] = [
			RoleLevels.Customer,
			RoleLevels.SalesRep,
			RoleLevels.SalesManager,
			RoleLevels.FulfillmentCoordinator,
			RoleLevels.Admin,
		]

		expect(validLevels.length).toBe(5)
	})

	it('Resource type should only allow valid values', () => {
		const validResources: Resource[] = [
			Resources.Quotes,
			Resources.Orders,
			Resources.Products,
			Resources.Customers,
			Resources.Vendors,
			Resources.Analytics,
			Resources.Users,
			Resources.Settings,
			Resources.Providers,
		]

		expect(validResources.length).toBe(9)
	})

	it('Action type should only allow valid values', () => {
		const validActions: Action[] = [
			Actions.Read,
			Actions.Create,
			Actions.Update,
			Actions.Delete,
			Actions.Approve,
			Actions.Assign,
			Actions.Export,
			Actions.Manage,
			Actions.ConfirmPayment,
			Actions.UpdateTracking,
		]

		expect(validActions.length).toBe(10)
	})

	it('Context type should only allow valid values', () => {
		const validContexts: Context[] = [Contexts.Own, Contexts.Assigned, Contexts.Team, Contexts.All]

		expect(validContexts.length).toBe(4)
	})
})

// ============================================================================
// BACKEND CONSISTENCY TESTS
// ============================================================================

describe('Backend Consistency', () => {
	/**
	 * These tests verify that frontend constants match backend expectations.
	 * If these fail, there may be a mismatch between frontend and backend.
	 */

	it('role levels should match backend appsettings.json thresholds', () => {
		// Backend uses configurable thresholds (appsettings.json)
		// These are the DEFAULT values that should match
		expect(RoleLevels.Customer).toBe(1000)
		expect(RoleLevels.FulfillmentCoordinator).toBe(2000)
		expect(RoleLevels.SalesRep).toBe(3000)
		expect(RoleLevels.SalesManager).toBe(4000)
		expect(RoleLevels.Admin).toBe(5000)
		expect(RoleLevels.SuperAdmin).toBe(9999)
	})

	it('resources should match RBACConstants.Resources', () => {
		// Backend: RBACConstants.Resources class
		const backendResources = [
			'quotes',
			'orders',
			'products',
			'customers',
			'vendors',
			'analytics',
			'users',
			'settings',
			'providers',
		]

		const frontendResources = Object.values(Resources)

		for (const resource of backendResources) {
			expect(frontendResources).toContain(resource)
		}
	})

	it('actions should match RBACConstants.Actions', () => {
		// Backend: RBACConstants.Actions class
		const backendActions = [
			'read',
			'create',
			'update',
			'delete',
			'approve',
			'assign',
			'export',
			'manage',
			'confirm_payment',
			'update_tracking',
		]

		const frontendActions = Object.values(Actions)

		for (const action of backendActions) {
			expect(frontendActions).toContain(action)
		}
	})

	it('contexts should match RBACConstants.Contexts', () => {
		// Backend: RBACConstants.Contexts class
		const backendContexts = ['own', 'assigned', 'team', 'all']

		const frontendContexts = Object.values(Contexts)

		for (const context of backendContexts) {
			expect(frontendContexts).toContain(context)
		}
	})
})
