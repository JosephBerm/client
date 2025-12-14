'use client'

/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions.
 * Use for fine-grained access control in the UI.
 * 
 * @example
 * ```tsx
 * <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
 *   <DeleteButton />
 * </PermissionGuard>
 * 
 * // With fallback
 * <PermissionGuard 
 *   resource={Resources.Analytics} 
 *   action={Actions.Export}
 *   fallback={<UpgradePrompt />}
 * >
 *   <ExportButton />
 * </PermissionGuard>
 * ```
 * 
 * @module PermissionGuard
 */

import { ReactNode } from 'react'
import { usePermissions, Resources, Actions, Contexts } from '@_shared/hooks/usePermissions'
import type { Resource, Action, Context } from '@_types/rbac'

interface PermissionGuardProps {
	/** Resource type to check */
	resource: Resource
	/** Action type to check */
	action: Action
	/** Optional context scope */
	context?: Context
	/** Content to render if permission denied */
	fallback?: ReactNode
	/** Content to render if permission granted */
	children: ReactNode
}

/**
 * Conditionally renders children based on user permissions.
 */
export function PermissionGuard({
	resource,
	action,
	context,
	fallback = null,
	children,
}: PermissionGuardProps) {
	const { hasPermission } = usePermissions()

	if (!hasPermission(resource, action, context)) {
		return <>{fallback}</>
	}

	return <>{children}</>
}

// Re-export constants for convenience
export { Resources, Actions, Contexts }

export default PermissionGuard

