'use client'

/**
 * usePermissions Hook - Database-Driven Version
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This hook fetches permissions from the backend API instead of hardcoding them.
 * Uses useFetchWithCache for SWR-pattern caching (following codebase conventions).
 *
 * DRY COMPLIANCE:
 * - BEFORE: ~80 lines of hardcoded if (roleLevel >= X) perms.add(...)
 * - AFTER: Fetches from /rbac/my-permissions API
 *
 * CACHING:
 * - Uses useFetchWithCache (existing codebase pattern)
 * - 5 minute stale time
 * - Background revalidation on focus
 *
 * Industry Reference: AWS IAM getEffectivePermissions pattern
 * @see https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html
 *
 * @see useFetchWithCache - For caching implementation
 * @see server/Controllers/RBACController.cs - GetMyPermissions endpoint
 * @module usePermissions
 */

import { useMemo, useCallback } from 'react'

import { useAuthStore } from '@_features/auth/stores/useAuthStore'
import { logger } from '@_core'
import { API } from '@_shared'
import { useFetchWithCache } from './useFetchWithCache'
import {
    Resources,
    Actions,
    Contexts,
    type Resource,
    type Action,
    type Context,
    type Permission,
    buildPermission,
} from '@_types/rbac'
import { DEFAULT_ROLE_THRESHOLDS } from '@_shared/constants'

// Re-export constants for convenience (backwards compatibility)
export { Resources, Actions, Contexts }

// Re-export RoleLevels for backward compatibility
export { LEGACY_ROLE_LEVELS as RoleLevels } from '@_shared/constants'

/**
 * Permission check parameters
 */
interface PermissionCheck {
    resource: Resource
    action: Action
    context?: Context
}

/**
 * usePermissions hook return type
 */
export interface UsePermissionsReturn {
    // User info
    user: import('@_classes/User').IUser | null
    roleLevel: number | undefined
    roleName: string
    isAuthenticated: boolean
    isLoading: boolean

    // Role checks (use thresholds from API)
    isAdmin: boolean
    isSuperAdmin: boolean
    isSalesManagerOrAbove: boolean
    isSalesRepOrAbove: boolean
    isFulfillmentCoordinatorOrAbove: boolean
    isCustomer: boolean

    // Permission checks (database-driven)
    hasPermission: (resource: Resource, action: Action, context?: Context) => boolean
    hasAnyPermission: (checks: PermissionCheck[]) => boolean
    hasAllPermissions: (checks: PermissionCheck[]) => boolean

    // Role level checks
    hasMinimumRole: (minimumLevel: number) => boolean

    // Utilities
    permissions: Set<Permission>
    refreshPermissions: () => Promise<void>
}

/**
 * Hook for checking user permissions and roles.
 *
 * ARCHITECTURE: Permissions are fetched from API, not hardcoded.
 * Role checks use thresholds from configuration.
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
 */
export function usePermissions(): UsePermissionsReturn {
    const user = useAuthStore((state) => state.user)

    // Get role level from user (backend sends roleLevel as integer)
    const roleLevel = useMemo(() => {
        if (!user) return undefined
        // Support both old 'role' and new 'roleLevel' field names
        // Type assertion needed for transition period - user type will be updated
        const userWithRole = user as { roleLevel?: number; role?: number }
        const level = userWithRole.roleLevel ?? userWithRole.role
        return typeof level === 'number' ? level : undefined
    }, [user])

    // Fetch thresholds from API
    const { data: thresholdsData } = useFetchWithCache(
        'rbac-thresholds',
        () => API.RBAC.getThresholds(),
        {
            staleTime: 60 * 60 * 1000, // 1 hour - thresholds rarely change
            revalidateOnFocus: false,
            componentName: 'usePermissions',
        }
    )

    // Default thresholds (fallback if API hasn't loaded yet)
    // DRY: Uses centralized constants from @_shared/constants/rbac-defaults
    const thresholds = thresholdsData ?? DEFAULT_ROLE_THRESHOLDS

    // Fetch permissions from API
    const {
        data: permissionsData,
        isLoading,
        refetch,
    } = useFetchWithCache(
        user ? `rbac-permissions-${user.id}` : '',
        () => API.RBAC.getMyPermissions(),
        {
            enabled: !!user,
            staleTime: 5 * 60 * 1000, // 5 minutes
            revalidateOnFocus: true,
            componentName: 'usePermissions',
            onError: (error) => {
                logger.error('Failed to fetch permissions', {
                    component: 'usePermissions',
                    action: 'fetchPermissions',
                    error: error.message,
                })
            },
        }
    )

    // Get permissions array from API response
    const apiPermissions = useMemo(
        () => permissionsData?.permissions ?? [],
        [permissionsData]
    )

    // Build permissions set
    const permissions = useMemo(() => {
        const perms = new Set<Permission>()
        apiPermissions.forEach((p) => perms.add(p as Permission))
        return perms
    }, [apiPermissions])

    // Role checks using thresholds
    const isSuperAdmin = useMemo(
        () => roleLevel !== undefined && roleLevel >= thresholds.superAdminThreshold,
        [roleLevel, thresholds.superAdminThreshold]
    )

    const isAdmin = useMemo(
        () => roleLevel !== undefined && roleLevel >= thresholds.adminThreshold,
        [roleLevel, thresholds.adminThreshold]
    )

    // ALL role checks now use API thresholds (100% white-label ready)
    const isSalesManagerOrAbove = useMemo(
        () => roleLevel !== undefined && roleLevel >= thresholds.salesManagerThreshold,
        [roleLevel, thresholds.salesManagerThreshold]
    )

    const isSalesRepOrAbove = useMemo(
        () => roleLevel !== undefined && roleLevel >= thresholds.salesRepThreshold,
        [roleLevel, thresholds.salesRepThreshold]
    )

    const isFulfillmentCoordinatorOrAbove = useMemo(
        () => roleLevel !== undefined && roleLevel >= thresholds.fulfillmentCoordinatorThreshold,
        [roleLevel, thresholds.fulfillmentCoordinatorThreshold]
    )

    const isCustomer = useMemo(
        () => roleLevel === thresholds.customerLevel,
        [roleLevel, thresholds.customerLevel]
    )

    // Permission check function
    const hasPermission = useCallback(
        (resource: Resource, action: Action, context?: Context): boolean => {
            if (!user) return false

            // Admin/SuperAdmin bypasses all checks
            if (isAdmin || isSuperAdmin) return true

            // Check exact permission with context
            if (context) {
                const exactPerm = buildPermission(resource, action, context)
                if (permissions.has(exactPerm)) return true
            }

            // Check permission without context (wildcard)
            const wildcardPerm = buildPermission(resource, action)
            if (permissions.has(wildcardPerm)) return true

            // Check "all" context permission
            const allPerm = buildPermission(resource, action, Contexts.All)
            if (permissions.has(allPerm)) return true

            return false
        },
        [user, isAdmin, isSuperAdmin, permissions]
    )

    const hasAnyPermission = useCallback(
        (checks: PermissionCheck[]): boolean => {
            return checks.some((check) =>
                hasPermission(check.resource, check.action, check.context)
            )
        },
        [hasPermission]
    )

    const hasAllPermissions = useCallback(
        (checks: PermissionCheck[]): boolean => {
            return checks.every((check) =>
                hasPermission(check.resource, check.action, check.context)
            )
        },
        [hasPermission]
    )

    const hasMinimumRole = useCallback(
        (minimumLevel: number): boolean => {
            if (roleLevel === undefined) return false
            return roleLevel >= minimumLevel
        },
        [roleLevel]
    )

    const refreshPermissions = useCallback(async () => {
        await refetch()
    }, [refetch])

    return {
        user,
        roleLevel,
        roleName: permissionsData?.roleName ?? 'Unknown',
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        isSuperAdmin,
        isSalesManagerOrAbove,
        isSalesRepOrAbove,
        isFulfillmentCoordinatorOrAbove,
        isCustomer,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasMinimumRole,
        permissions,
        refreshPermissions,
    }
}

export default usePermissions
