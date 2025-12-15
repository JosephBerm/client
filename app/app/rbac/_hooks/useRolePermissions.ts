/**
 * useRolePermissions Hook
 * 
 * Custom hook for managing role-permission assignments.
 * Handles fetching, assigning, and bulk updating role permissions.
 * 
 * @module RBAC useRolePermissions
 */

import { useState, useCallback } from 'react'
import { API, notificationService } from '@_shared'
import type { Permission } from '@_shared/services/api'

interface UseRolePermissionsOptions {
	componentName?: string
}

export function useRolePermissions(options: UseRolePermissionsOptions = {}) {
	const { componentName = 'useRolePermissions' } = options
	const [isLoading, setIsLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const fetchRolePermissions = useCallback(async (roleId: number) => {
		setIsLoading(true)
		try {
			const response = await API.RBAC.Roles.getPermissions(roleId)
			if (response.data.statusCode === 200 && response.data.payload) {
				return { success: true, data: response.data.payload }
			}
			return { success: false, data: [] }
		} catch (err) {
			notificationService.error('Failed to load role permissions', {
				component: componentName,
				action: 'fetchRolePermissions',
			})
			return { success: false, data: [] }
		} finally {
			setIsLoading(false)
		}
	}, [componentName])

	const bulkAssignPermissions = useCallback(async (roleId: number, permissionIds: number[]) => {
		setIsSaving(true)
		try {
			const response = await API.RBAC.Roles.bulkAssignPermissions(roleId, permissionIds)
			if (response.data.statusCode === 200) {
				notificationService.success('Permissions updated successfully', {
					component: componentName,
					action: 'bulkAssignPermissions',
				})
				return { success: true }
			}
			return { success: false }
		} catch (err) {
			notificationService.error('Failed to update permissions', {
				component: componentName,
				action: 'bulkAssignPermissions',
			})
			return { success: false }
		} finally {
			setIsSaving(false)
		}
	}, [componentName])

	return {
		isLoading,
		isSaving,
		fetchRolePermissions,
		bulkAssignPermissions,
	}
}
