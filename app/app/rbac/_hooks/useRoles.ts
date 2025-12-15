/**
 * useRoles Hook
 * 
 * Custom hook for managing roles data and operations.
 * Built on top of useCRUDEntity for DRY compliance.
 * 
 * @module RBAC useRoles
 */

import { useMemo } from 'react'
import { useCRUDEntity } from './useCRUDEntity'
import { API, notificationService } from '@_shared'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@_shared/services/api'

interface UseRolesOptions {
	componentName?: string
	autoFetch?: boolean
}

export function useRoles(options: UseRolesOptions = {}) {
	const { componentName = 'useRoles', autoFetch = true } = options

	// Stabilize API service object to prevent unnecessary re-renders
	const apiService = useMemo(
		() => ({
			getAll: () => API.RBAC.Roles.getAll(),
			create: (request: CreateRoleRequest) => API.RBAC.Roles.create(request),
			update: (id: number, request: UpdateRoleRequest) => API.RBAC.Roles.update(id, request),
			delete: (id: number) => API.RBAC.Roles.delete(id),
		}),
		[]
	)

	const crud = useCRUDEntity<Role, CreateRoleRequest, UpdateRoleRequest>(
		apiService,
		{
			componentName,
			autoFetch,
			entityName: 'Role',
		}
	)

	// Wrapper for deleteRole that checks system role
	const deleteRole = async (role: Role) => {
		if (role.isSystemRole) {
			notificationService.error('Cannot delete system roles', {
				component: componentName,
				action: 'deleteRole',
			})
			return { success: false }
		}
		return crud.deleteEntity(role.id)
	}

	return {
		roles: crud.entities,
		isLoading: crud.isLoading,
		isSaving: crud.isSaving,
		fetchRoles: crud.fetchEntities,
		createRole: crud.createEntity,
		updateRole: crud.updateEntity,
		deleteRole,
	}
}
