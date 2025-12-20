/**
 * useRolePermissions Hook
 *
 * Custom hook for managing role-permission assignments.
 * Handles fetching, assigning, and bulk updating role permissions.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * With React Compiler (`reactCompiler: true`):
 * - No useCallback needed - compiler auto-memoizes functions
 * - Async functions are written as plain arrow functions
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module RBAC useRolePermissions
 */

import { useState } from 'react'

import { logger } from '@_core'
import { API, notificationService } from '@_shared'

interface UseRolePermissionsOptions {
	componentName?: string
}

export function useRolePermissions(options: UseRolePermissionsOptions = {}) {
	const { componentName = 'useRolePermissions' } = options
	const [isLoading, setIsLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	// ---------------------------------------------------------------------------
	// OPERATIONS
	// React Compiler auto-memoizes these functions - no useCallback needed
	// ---------------------------------------------------------------------------

	const fetchRolePermissions = async (roleId: number) => {
		setIsLoading(true)
		try {
			const response = await API.RBAC.Roles.getPermissions(roleId)
			if (response.data.statusCode === 200 && response.data.payload) {
				return { success: true, data: response.data.payload }
			}
			return { success: false, data: [] }
		} catch (err) {
			logger.error('Failed to fetch role permissions', {
				component: componentName,
				action: 'fetchRolePermissions',
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error('Failed to load role permissions', {
				component: componentName,
				action: 'fetchRolePermissions',
			})
			return { success: false, data: [] }
		} finally {
			setIsLoading(false)
		}
	}

	const bulkAssignPermissions = async (roleId: number, permissionIds: number[]) => {
		setIsSaving(true)
		try {
			const response = await API.RBAC.Roles.bulkAssignPermissions(roleId, permissionIds)
			if (response.data.statusCode === 200) {
				logger.info('Role permissions updated successfully', {
					component: componentName,
					action: 'bulkAssignPermissions',
					roleId,
					permissionCount: permissionIds.length,
				})
				notificationService.success('Permissions updated successfully', {
					component: componentName,
					action: 'bulkAssignPermissions',
				})
				return { success: true }
			}
			return { success: false }
		} catch (err) {
			logger.error('Failed to update role permissions', {
				component: componentName,
				action: 'bulkAssignPermissions',
				roleId,
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error('Failed to update permissions', {
				component: componentName,
				action: 'bulkAssignPermissions',
			})
			return { success: false }
		} finally {
			setIsSaving(false)
		}
	}

	return {
		isLoading,
		isSaving,
		fetchRolePermissions,
		bulkAssignPermissions,
	}
}
