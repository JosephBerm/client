'use client'

/**
 * usePermissions Hook
 * 
 * React hook for permission-based access control in the frontend.
 * 
 * Features:
 * - Role level checks
 * - Permission checks (against user's role)
 * - Memoized for performance
 * - Type-safe with TypeScript
 * 
 * Architecture: Designed for portability and reusability.
 * 
 * @example
 * ```typescript
 * const { hasPermission, isAdmin, isSalesRepOrAbove } = usePermissions()
 * 
 * if (hasPermission(Resources.Quotes, Actions.Delete)) {
 *   // Show delete button
 * }
 * 
 * if (isAdmin) {
 *   // Show admin panel
 * }
 * ```
 * 
 * @module usePermissions
 */

import { useMemo, useCallback } from 'react'
import { useAuthStore } from '@_features/auth/stores/useAuthStore'
import {
	RoleLevels,
	Resources,
	Actions,
	Contexts,
	type Resource,
	type Action,
	type Context,
	type Permission,
	type RoleLevel,
	getRoleDisplayName,
	buildPermission,
} from '@_types/rbac'

// Re-export constants for convenience
export { Resources, Actions, Contexts, RoleLevels }

/**
 * Permission check result type
 */
interface PermissionCheck {
	resource: Resource
	action: Action
	context?: Context
}

/**
 * usePermissions hook return type
 */
interface UsePermissionsReturn {
	// User info
	user: ReturnType<typeof useAuthStore>['user']
	roleLevel: RoleLevel | undefined
	roleName: string
	isAuthenticated: boolean

	// Role checks (fast, in-memory)
	isAdmin: boolean
	isSalesManagerOrAbove: boolean
	isSalesRepOrAbove: boolean
	isFulfillmentCoordinatorOrAbove: boolean
	isCustomer: boolean

	// Permission checks
	hasPermission: (resource: Resource, action: Action, context?: Context) => boolean
	hasAnyPermission: (checks: PermissionCheck[]) => boolean
	hasAllPermissions: (checks: PermissionCheck[]) => boolean

	// Role level checks
	hasMinimumRole: (minimumRole: RoleLevel) => boolean

	// Utilities
	permissions: Set<Permission>
}

/**
 * Hook for checking user permissions and roles.
 * 
 * @returns Permission check utilities
 */
export function usePermissions(): UsePermissionsReturn {
	const user = useAuthStore((state) => state.user)

	// Get role level from user (backend sends role as number)
	const roleLevel = useMemo(() => {
		if (!user) return undefined
		// Handle both numeric role and string role
		const role = (user as any).role
		if (typeof role === 'number') return role as RoleLevel
		if (typeof role === 'string') {
			// Parse string role name to level
			const roleMap: Record<string, RoleLevel> = {
				customer: RoleLevels.Customer,
				salesrep: RoleLevels.SalesRep,
				sales_rep: RoleLevels.SalesRep,
				salesmanager: RoleLevels.SalesManager,
				sales_manager: RoleLevels.SalesManager,
				fulfillmentcoordinator: RoleLevels.FulfillmentCoordinator,
				fulfillment_coordinator: RoleLevels.FulfillmentCoordinator,
				admin: RoleLevels.Admin,
			}
			return roleMap[role.toLowerCase()] ?? RoleLevels.Customer
		}
		return RoleLevels.Customer
	}, [user])

	// Role display name
	const roleName = useMemo(() => getRoleDisplayName(roleLevel), [roleLevel])

	// Role checks (memoized)
	const isAdmin = useMemo(() => roleLevel !== undefined && roleLevel >= RoleLevels.Admin, [roleLevel])
	const isSalesManagerOrAbove = useMemo(
		() => roleLevel !== undefined && roleLevel >= RoleLevels.SalesManager,
		[roleLevel]
	)
	const isSalesRepOrAbove = useMemo(
		() => roleLevel !== undefined && roleLevel >= RoleLevels.SalesRep,
		[roleLevel]
	)
	const isFulfillmentCoordinatorOrAbove = useMemo(
		() => roleLevel !== undefined && roleLevel >= RoleLevels.FulfillmentCoordinator,
		[roleLevel]
	)
	const isCustomer = useMemo(() => roleLevel === RoleLevels.Customer, [roleLevel])

	// Build permissions set based on role level
	const permissions = useMemo(() => {
		const perms = new Set<Permission>()

		if (roleLevel === undefined) return perms

		// Customer permissions (base level)
		if (roleLevel >= RoleLevels.Customer) {
			perms.add(buildPermission(Resources.Quotes, Actions.Read, Contexts.Own))
			perms.add(buildPermission(Resources.Quotes, Actions.Create))
			perms.add(buildPermission(Resources.Quotes, Actions.Update, Contexts.Own))
			perms.add(buildPermission(Resources.Orders, Actions.Read, Contexts.Own))
			perms.add(buildPermission(Resources.Orders, Actions.Update, Contexts.Own))
			perms.add(buildPermission(Resources.Products, Actions.Read))
			perms.add(buildPermission(Resources.Customers, Actions.Read, Contexts.Own))
			perms.add(buildPermission(Resources.Customers, Actions.Update, Contexts.Own))
			perms.add(buildPermission(Resources.Users, Actions.Read, Contexts.Own))
			perms.add(buildPermission(Resources.Users, Actions.Update, Contexts.Own))
			perms.add(buildPermission(Resources.Settings, Actions.Read))
		}

		// SalesRep permissions
		if (roleLevel >= RoleLevels.SalesRep) {
			perms.add(buildPermission(Resources.Quotes, Actions.Read, Contexts.Assigned))
			perms.add(buildPermission(Resources.Quotes, Actions.Update, Contexts.Assigned))
			perms.add(buildPermission(Resources.Orders, Actions.Read, Contexts.Assigned))
			perms.add(buildPermission(Resources.Orders, Actions.Create))
			perms.add(buildPermission(Resources.Orders, Actions.Update, Contexts.Assigned))
			perms.add(buildPermission(Resources.Orders, Actions.ConfirmPayment))
			perms.add(buildPermission(Resources.Orders, Actions.UpdateTracking))
			perms.add(buildPermission(Resources.Customers, Actions.Read, Contexts.Assigned))
			perms.add(buildPermission(Resources.Customers, Actions.Create))
			perms.add(buildPermission(Resources.Customers, Actions.Update, Contexts.Assigned))
			perms.add(buildPermission(Resources.Vendors, Actions.Read))
			perms.add(buildPermission(Resources.Analytics, Actions.Read, Contexts.Own))
		}

		// SalesManager permissions
		if (roleLevel >= RoleLevels.SalesManager) {
			perms.add(buildPermission(Resources.Quotes, Actions.Read, Contexts.Team))
			perms.add(buildPermission(Resources.Quotes, Actions.Read, Contexts.All))
			perms.add(buildPermission(Resources.Quotes, Actions.Update, Contexts.All))
			perms.add(buildPermission(Resources.Quotes, Actions.Approve))
			perms.add(buildPermission(Resources.Quotes, Actions.Assign))
			perms.add(buildPermission(Resources.Orders, Actions.Read, Contexts.Team))
			perms.add(buildPermission(Resources.Orders, Actions.Read, Contexts.All))
			perms.add(buildPermission(Resources.Orders, Actions.Update, Contexts.All))
			perms.add(buildPermission(Resources.Orders, Actions.Approve))
			perms.add(buildPermission(Resources.Customers, Actions.Read, Contexts.Team))
			perms.add(buildPermission(Resources.Customers, Actions.Read, Contexts.All))
			perms.add(buildPermission(Resources.Customers, Actions.Update, Contexts.All))
			perms.add(buildPermission(Resources.Analytics, Actions.Read, Contexts.Team))
			perms.add(buildPermission(Resources.Analytics, Actions.Export))
			perms.add(buildPermission(Resources.Users, Actions.Read, Contexts.Team))
			perms.add(buildPermission(Resources.Users, Actions.Create))
			perms.add(buildPermission(Resources.Users, Actions.Update, Contexts.Team))
		}

		// FulfillmentCoordinator permissions
		if (roleLevel >= RoleLevels.FulfillmentCoordinator) {
			perms.add(buildPermission(Resources.Orders, Actions.Read, Contexts.All))
			perms.add(buildPermission(Resources.Orders, Actions.Update, Contexts.All))
			perms.add(buildPermission(Resources.Vendors, Actions.Update))
		}

		// Admin permissions (all)
		if (roleLevel >= RoleLevels.Admin) {
			perms.add(buildPermission(Resources.Quotes, Actions.Delete))
			perms.add(buildPermission(Resources.Orders, Actions.Delete))
			perms.add(buildPermission(Resources.Products, Actions.Create))
			perms.add(buildPermission(Resources.Products, Actions.Update))
			perms.add(buildPermission(Resources.Products, Actions.Delete))
			perms.add(buildPermission(Resources.Customers, Actions.Delete))
			perms.add(buildPermission(Resources.Vendors, Actions.Create))
			perms.add(buildPermission(Resources.Vendors, Actions.Delete))
			perms.add(buildPermission(Resources.Analytics, Actions.Read, Contexts.All))
			perms.add(buildPermission(Resources.Users, Actions.Read, Contexts.All))
			perms.add(buildPermission(Resources.Users, Actions.Update, Contexts.All))
			perms.add(buildPermission(Resources.Users, Actions.Delete))
			perms.add(buildPermission(Resources.Settings, Actions.Update))
			perms.add(buildPermission(Resources.Settings, Actions.Manage))
		}

		return perms
	}, [roleLevel])

	// Permission check function
	const hasPermission = useCallback(
		(resource: Resource, action: Action, context?: Context): boolean => {
			if (!user) return false

			// Admin bypasses all checks
			if (isAdmin) return true

			// Check exact permission with context
			if (context) {
				const exactPermission = buildPermission(resource, action, context)
				if (permissions.has(exactPermission)) return true
			}

			// Check permission without context (wildcard)
			const wildcardPermission = buildPermission(resource, action)
			if (permissions.has(wildcardPermission)) return true

			// Check "all" context permission
			const allPermission = buildPermission(resource, action, Contexts.All)
			if (permissions.has(allPermission)) return true

			return false
		},
		[user, isAdmin, permissions]
	)

	// Check if user has any of the specified permissions
	const hasAnyPermission = useCallback(
		(checks: PermissionCheck[]): boolean => {
			return checks.some((check) => hasPermission(check.resource, check.action, check.context))
		},
		[hasPermission]
	)

	// Check if user has all of the specified permissions
	const hasAllPermissions = useCallback(
		(checks: PermissionCheck[]): boolean => {
			return checks.every((check) => hasPermission(check.resource, check.action, check.context))
		},
		[hasPermission]
	)

	// Check minimum role level
	const hasMinimumRole = useCallback(
		(minimumRole: RoleLevel): boolean => {
			if (roleLevel === undefined) return false
			return roleLevel >= minimumRole
		},
		[roleLevel]
	)

	return {
		user,
		roleLevel,
		roleName,
		isAuthenticated: !!user,
		isAdmin,
		isSalesManagerOrAbove,
		isSalesRepOrAbove,
		isFulfillmentCoordinatorOrAbove,
		isCustomer,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		hasMinimumRole,
		permissions,
	}
}

export default usePermissions

