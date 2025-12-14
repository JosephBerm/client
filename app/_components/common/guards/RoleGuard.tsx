'use client'

/**
 * RoleGuard Component
 * 
 * Conditionally renders children based on user role level.
 * Use for role-based access control in the UI.
 * 
 * @example
 * ```tsx
 * // Show only to admins
 * <RoleGuard minimumRole={RoleLevels.Admin}>
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * // Show to SalesRep and above
 * <RoleGuard minimumRole={RoleLevels.SalesRep}>
 *   <SalesTools />
 * </RoleGuard>
 * 
 * // With fallback
 * <RoleGuard 
 *   minimumRole={RoleLevels.SalesManager}
 *   fallback={<AccessDenied />}
 * >
 *   <ManagerDashboard />
 * </RoleGuard>
 * ```
 * 
 * @module RoleGuard
 */

import { ReactNode } from 'react'
import { usePermissions, RoleLevels } from '@_shared/hooks/usePermissions'
import type { RoleLevel } from '@_types/rbac'

interface RoleGuardProps {
	/** Minimum role level required */
	minimumRole: RoleLevel
	/** Content to render if role check fails */
	fallback?: ReactNode
	/** Content to render if role check passes */
	children: ReactNode
}

/**
 * Conditionally renders children based on user role level.
 */
export function RoleGuard({
	minimumRole,
	fallback = null,
	children,
}: RoleGuardProps) {
	const { hasMinimumRole } = usePermissions()

	if (!hasMinimumRole(minimumRole)) {
		return <>{fallback}</>
	}

	return <>{children}</>
}

// Re-export constants for convenience
export { RoleLevels }

export default RoleGuard

