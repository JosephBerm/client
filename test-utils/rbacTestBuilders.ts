/**
 * RBAC Test Data Builders
 *
 * MAANG-Level: Provides deterministic test data for RBAC testing.
 * Ensures consistent, predictable permission testing across all test files.
 *
 * **Benefits:**
 * - DRY: No duplicate user/permission data creation
 * - Flexibility: Easy to create users with specific role levels
 * - Type-safe: Full TypeScript support
 * - Realistic: Matches production user structures
 *
 * @module test-utils/rbacTestBuilders
 */

import { Resources, Actions, Contexts, buildPermission } from '@_types/rbac'
import type { Resource, Action, Context, Permission } from '@_types/rbac'
import { RoleLevels, type RoleLevelValue } from '@_shared'

// Type alias for role levels (for backward compatibility)
type RoleLevel = RoleLevelValue

// ============================================================================
// USER BUILDER
// ============================================================================

interface TestUser {
	id: number
	email: string
	role: RoleLevel
	customerId?: number
	name?: {
		first: string
		last: string
	}
	customer?: {
		name: string
		id: number
	}
	phone?: string
	isActive?: boolean
	createdAt?: Date
}

/**
 * Test User Builder
 *
 * Builder pattern for creating user objects for RBAC testing.
 *
 * @example
 * ```typescript
 * const admin = new TestUserBuilder().asAdmin().build()
 * const customer = new TestUserBuilder().asCustomer().withCustomerId(123).build()
 * const salesRep = new TestUserBuilder()
 *   .asSalesRep()
 *   .withEmail('rep@company.com')
 *   .build()
 * ```
 */
export class TestUserBuilder {
	private user: TestUser = {
		id: 1,
		email: 'test@medsource.com',
		role: RoleLevels.Customer,
		customerId: 100,
		name: { first: 'Test', last: 'User' },
		customer: { name: 'Test Hospital', id: 100 },
		phone: '555-0100',
		isActive: true,
		createdAt: new Date('2024-01-01'),
	}

	// -------------------------------------------------------------------------
	// Role Presets
	// -------------------------------------------------------------------------

	asCustomer(): this {
		this.user.role = RoleLevels.Customer
		this.user.email = 'customer@hospital.com'
		return this
	}

	asSalesRep(): this {
		this.user.role = RoleLevels.SalesRep
		this.user.email = 'salesrep@medsource.com'
		return this
	}

	asSalesManager(): this {
		this.user.role = RoleLevels.SalesManager
		this.user.email = 'manager@medsource.com'
		return this
	}

	asFulfillmentCoordinator(): this {
		this.user.role = RoleLevels.FulfillmentCoordinator
		this.user.email = 'fulfillment@medsource.com'
		return this
	}

	asAdmin(): this {
		this.user.role = RoleLevels.Admin
		this.user.email = 'admin@medsource.com'
		return this
	}

	// -------------------------------------------------------------------------
	// Custom Properties
	// -------------------------------------------------------------------------

	withId(id: number): this {
		this.user.id = id
		return this
	}

	withEmail(email: string): this {
		this.user.email = email
		return this
	}

	withRole(role: RoleLevel): this {
		this.user.role = role
		return this
	}

	withCustomerId(customerId: number): this {
		this.user.customerId = customerId
		return this
	}

	withName(first: string, last: string): this {
		this.user.name = { first, last }
		return this
	}

	withCustomer(name: string, id: number): this {
		this.user.customer = { name, id }
		return this
	}

	withPhone(phone: string): this {
		this.user.phone = phone
		return this
	}

	asInactive(): this {
		this.user.isActive = false
		return this
	}

	// -------------------------------------------------------------------------
	// Edge Cases
	// -------------------------------------------------------------------------

	withoutCustomerId(): this {
		this.user.customerId = undefined
		return this
	}

	withZeroCustomerId(): this {
		this.user.customerId = 0
		return this
	}

	withoutCustomer(): this {
		this.user.customer = undefined
		return this
	}

	withInvalidRole(): this {
		this.user.role = -999 as RoleLevel
		return this
	}

	withRoleBetweenLevels(level: number): this {
		this.user.role = level as RoleLevel
		return this
	}

	// -------------------------------------------------------------------------
	// Build
	// -------------------------------------------------------------------------

	build(): TestUser {
		return { ...this.user }
	}
}

// ============================================================================
// PERMISSION CHECK BUILDER
// ============================================================================

interface PermissionCheck {
	resource: Resource
	action: Action
	context?: Context
}

/**
 * Permission Check Builder
 *
 * Builder pattern for creating permission check scenarios.
 *
 * @example
 * ```typescript
 * const checks = new PermissionCheckBuilder()
 *   .canReadOwnQuotes()
 *   .canCreateOrders()
 *   .cannotDeleteUsers()
 *   .build()
 * ```
 */
export class PermissionCheckBuilder {
	private checks: { check: PermissionCheck; expected: boolean }[] = []

	// -------------------------------------------------------------------------
	// Quote Permissions
	// -------------------------------------------------------------------------

	canReadOwnQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Read, context: Contexts.Own },
			expected: true,
		})
		return this
	}

	canReadAssignedQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Read, context: Contexts.Assigned },
			expected: true,
		})
		return this
	}

	canReadAllQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Read, context: Contexts.All },
			expected: true,
		})
		return this
	}

	canCreateQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Create },
			expected: true,
		})
		return this
	}

	canApproveQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Approve },
			expected: true,
		})
		return this
	}

	canAssignQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Assign },
			expected: true,
		})
		return this
	}

	canDeleteQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Delete },
			expected: true,
		})
		return this
	}

	cannotApproveQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Approve },
			expected: false,
		})
		return this
	}

	cannotDeleteQuotes(): this {
		this.checks.push({
			check: { resource: Resources.Quotes, action: Actions.Delete },
			expected: false,
		})
		return this
	}

	// -------------------------------------------------------------------------
	// Order Permissions
	// -------------------------------------------------------------------------

	canReadOwnOrders(): this {
		this.checks.push({
			check: { resource: Resources.Orders, action: Actions.Read, context: Contexts.Own },
			expected: true,
		})
		return this
	}

	canCreateOrders(): this {
		this.checks.push({
			check: { resource: Resources.Orders, action: Actions.Create },
			expected: true,
		})
		return this
	}

	canConfirmPayment(): this {
		this.checks.push({
			check: { resource: Resources.Orders, action: Actions.ConfirmPayment },
			expected: true,
		})
		return this
	}

	canUpdateTracking(): this {
		this.checks.push({
			check: { resource: Resources.Orders, action: Actions.UpdateTracking },
			expected: true,
		})
		return this
	}

	canApproveOrders(): this {
		this.checks.push({
			check: { resource: Resources.Orders, action: Actions.Approve },
			expected: true,
		})
		return this
	}

	cannotCreateOrders(): this {
		this.checks.push({
			check: { resource: Resources.Orders, action: Actions.Create },
			expected: false,
		})
		return this
	}

	// -------------------------------------------------------------------------
	// User Permissions
	// -------------------------------------------------------------------------

	canCreateUsers(): this {
		this.checks.push({
			check: { resource: Resources.Users, action: Actions.Create },
			expected: true,
		})
		return this
	}

	canDeleteUsers(): this {
		this.checks.push({
			check: { resource: Resources.Users, action: Actions.Delete },
			expected: true,
		})
		return this
	}

	cannotDeleteUsers(): this {
		this.checks.push({
			check: { resource: Resources.Users, action: Actions.Delete },
			expected: false,
		})
		return this
	}

	// -------------------------------------------------------------------------
	// Settings Permissions
	// -------------------------------------------------------------------------

	canManageSettings(): this {
		this.checks.push({
			check: { resource: Resources.Settings, action: Actions.Manage },
			expected: true,
		})
		return this
	}

	cannotManageSettings(): this {
		this.checks.push({
			check: { resource: Resources.Settings, action: Actions.Manage },
			expected: false,
		})
		return this
	}

	// -------------------------------------------------------------------------
	// Analytics Permissions
	// -------------------------------------------------------------------------

	canReadOwnAnalytics(): this {
		this.checks.push({
			check: { resource: Resources.Analytics, action: Actions.Read, context: Contexts.Own },
			expected: true,
		})
		return this
	}

	canExportAnalytics(): this {
		this.checks.push({
			check: { resource: Resources.Analytics, action: Actions.Export },
			expected: true,
		})
		return this
	}

	cannotAccessAnalytics(): this {
		this.checks.push({
			check: { resource: Resources.Analytics, action: Actions.Read, context: Contexts.Own },
			expected: false,
		})
		return this
	}

	// -------------------------------------------------------------------------
	// Custom Checks
	// -------------------------------------------------------------------------

	withPermission(resource: Resource, action: Action, context?: Context, expected = true): this {
		this.checks.push({
			check: { resource, action, context },
			expected,
		})
		return this
	}

	withoutPermission(resource: Resource, action: Action, context?: Context): this {
		this.checks.push({
			check: { resource, action, context },
			expected: false,
		})
		return this
	}

	// -------------------------------------------------------------------------
	// Build
	// -------------------------------------------------------------------------

	build(): { check: PermissionCheck; expected: boolean }[] {
		return [...this.checks]
	}

	buildChecks(): PermissionCheck[] {
		return this.checks.map((c) => c.check)
	}
}

// ============================================================================
// ROLE PERMISSION PRESETS
// ============================================================================

/**
 * Pre-built permission sets for each role.
 * Useful for validating complete role permission matrices.
 */
export const RolePermissionPresets = {
	/**
	 * All permissions a Customer should have
	 */
	Customer: new PermissionCheckBuilder()
		.canReadOwnQuotes()
		.canCreateQuotes()
		.withPermission(Resources.Quotes, Actions.Update, Contexts.Own)
		.canReadOwnOrders()
		.withPermission(Resources.Orders, Actions.Update, Contexts.Own)
		.withPermission(Resources.Products, Actions.Read)
		.withPermission(Resources.Customers, Actions.Read, Contexts.Own)
		.withPermission(Resources.Customers, Actions.Update, Contexts.Own)
		.withPermission(Resources.Users, Actions.Read, Contexts.Own)
		.withPermission(Resources.Users, Actions.Update, Contexts.Own)
		.withPermission(Resources.Settings, Actions.Read)
		.build(),

	/**
	 * All permissions a SalesRep should have (includes Customer)
	 */
	SalesRep: new PermissionCheckBuilder()
		// Inherited from Customer
		.canReadOwnQuotes()
		.canCreateQuotes()
		.withPermission(Resources.Quotes, Actions.Update, Contexts.Own)
		.canReadOwnOrders()
		.withPermission(Resources.Products, Actions.Read)
		.withPermission(Resources.Settings, Actions.Read)
		// SalesRep specific
		.canReadAssignedQuotes()
		.withPermission(Resources.Quotes, Actions.Update, Contexts.Assigned)
		.withPermission(Resources.Orders, Actions.Read, Contexts.Assigned)
		.canCreateOrders()
		.withPermission(Resources.Orders, Actions.Update, Contexts.Assigned)
		.canConfirmPayment()
		.canUpdateTracking()
		.withPermission(Resources.Customers, Actions.Read, Contexts.Assigned)
		.withPermission(Resources.Customers, Actions.Create)
		.withPermission(Resources.Customers, Actions.Update, Contexts.Assigned)
		.withPermission(Resources.Vendors, Actions.Read)
		.canReadOwnAnalytics()
		.build(),

	/**
	 * All permissions a SalesManager should have (includes SalesRep)
	 */
	SalesManager: new PermissionCheckBuilder()
		// Manager specific
		.canReadAllQuotes()
		.withPermission(Resources.Quotes, Actions.Read, Contexts.Team)
		.withPermission(Resources.Quotes, Actions.Update, Contexts.All)
		.canApproveQuotes()
		.canAssignQuotes()
		.withPermission(Resources.Orders, Actions.Read, Contexts.All)
		.withPermission(Resources.Orders, Actions.Read, Contexts.Team)
		.withPermission(Resources.Orders, Actions.Update, Contexts.All)
		.canApproveOrders()
		.withPermission(Resources.Customers, Actions.Read, Contexts.All)
		.withPermission(Resources.Customers, Actions.Read, Contexts.Team)
		.withPermission(Resources.Customers, Actions.Update, Contexts.All)
		.withPermission(Resources.Analytics, Actions.Read, Contexts.Team)
		.canExportAnalytics()
		.canCreateUsers()
		.withPermission(Resources.Users, Actions.Read, Contexts.Team)
		.withPermission(Resources.Users, Actions.Update, Contexts.Team)
		.build(),

	/**
	 * Permissions a SalesManager should NOT have
	 */
	SalesManagerRestrictions: new PermissionCheckBuilder()
		.cannotDeleteQuotes()
		.withoutPermission(Resources.Orders, Actions.Delete)
		.cannotDeleteUsers()
		.cannotManageSettings()
		.withoutPermission(Resources.Products, Actions.Create)
		.withoutPermission(Resources.Products, Actions.Delete)
		.build(),

	/**
	 * All Admin-only permissions (things only Admin can do)
	 */
	AdminOnly: new PermissionCheckBuilder()
		.canDeleteQuotes()
		.withPermission(Resources.Orders, Actions.Delete)
		.withPermission(Resources.Products, Actions.Create)
		.withPermission(Resources.Products, Actions.Update)
		.withPermission(Resources.Products, Actions.Delete)
		.withPermission(Resources.Customers, Actions.Delete)
		.withPermission(Resources.Vendors, Actions.Create)
		.withPermission(Resources.Vendors, Actions.Delete)
		.withPermission(Resources.Analytics, Actions.Read, Contexts.All)
		.withPermission(Resources.Users, Actions.Read, Contexts.All)
		.withPermission(Resources.Users, Actions.Update, Contexts.All)
		.canDeleteUsers()
		.withPermission(Resources.Settings, Actions.Update)
		.canManageSettings()
		.build(),
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a complete permission matrix for testing all role/resource/action combinations.
 */
export function createPermissionMatrix(): Map<RoleLevel, Set<Permission>> {
	const matrix = new Map<RoleLevel, Set<Permission>>()

	// Customer permissions
	const customerPerms = new Set<Permission>([
		'quotes:read:own',
		'quotes:create',
		'quotes:update:own',
		'orders:read:own',
		'orders:update:own',
		'products:read',
		'customers:read:own',
		'customers:update:own',
		'users:read:own',
		'users:update:own',
		'settings:read',
	])
	matrix.set(RoleLevels.Customer, customerPerms)

	// SalesRep permissions (includes Customer)
	const salesRepPerms = new Set<Permission>([
		...customerPerms,
		'quotes:read:assigned',
		'quotes:update:assigned',
		'orders:read:assigned',
		'orders:create',
		'orders:update:assigned',
		'orders:confirm_payment',
		'orders:update_tracking',
		'customers:read:assigned',
		'customers:create',
		'customers:update:assigned',
		'vendors:read',
		'analytics:read:own',
	])
	matrix.set(RoleLevels.SalesRep, salesRepPerms)

	// SalesManager permissions (includes SalesRep)
	const salesManagerPerms = new Set<Permission>([
		...salesRepPerms,
		'quotes:read:team',
		'quotes:read:all',
		'quotes:update:all',
		'quotes:approve',
		'quotes:assign',
		'orders:read:team',
		'orders:read:all',
		'orders:update:all',
		'orders:approve',
		'customers:read:team',
		'customers:read:all',
		'customers:update:all',
		'analytics:read:team',
		'analytics:export',
		'users:read:team',
		'users:create',
		'users:update:team',
	])
	matrix.set(RoleLevels.SalesManager, salesManagerPerms)

	// FulfillmentCoordinator permissions
	const fulfillmentPerms = new Set<Permission>([
		...salesManagerPerms,
		'orders:read:all',
		'orders:update:all',
		'vendors:update',
	])
	matrix.set(RoleLevels.FulfillmentCoordinator, fulfillmentPerms)

	// Admin has all permissions (handled separately in tests)
	matrix.set(RoleLevels.Admin, new Set(['*'] as any))

	return matrix
}

/**
 * Validates that a permission check result matches expected value.
 */
export function assertPermission(
	hasPermission: (resource: Resource, action: Action, context?: Context) => boolean,
	check: PermissionCheck,
	expected: boolean,
	roleDescription: string = ''
): void {
	const permString = buildPermission(check.resource, check.action, check.context)
	const result = hasPermission(check.resource, check.action, check.context)

	if (result !== expected) {
		throw new Error(
			`Permission mismatch${roleDescription ? ` for ${roleDescription}` : ''}: ` +
				`${permString} expected ${expected}, got ${result}`
		)
	}
}

// ============================================================================
// EXPORTS
// ============================================================================

export { RoleLevels, Resources, Actions, Contexts, buildPermission }

export type { RoleLevel, Resource, Action, Context, Permission, TestUser, PermissionCheck }
