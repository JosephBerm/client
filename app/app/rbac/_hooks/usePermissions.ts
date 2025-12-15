/**
 * usePermissionsData Hook
 * 
 * Custom hook for managing permissions data and operations.
 * Built on top of useCRUDEntity for DRY compliance.
 * 
 * Note: Named usePermissionsData to avoid conflict with usePermissions from @_shared
 * 
 * @module RBAC usePermissionsData
 */

import { useMemo } from 'react'
import { useCRUDEntity } from './useCRUDEntity'
import { API } from '@_shared'
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@_shared/services/api'

interface UsePermissionsDataOptions {
	componentName?: string
	autoFetch?: boolean
}

export function usePermissionsData(options: UsePermissionsDataOptions = {}) {
	const { componentName = 'usePermissionsData', autoFetch = true } = options

	// Stabilize API service object to prevent unnecessary re-renders
	const apiService = useMemo(
		() => ({
			getAll: () => API.RBAC.Permissions.getAll(),
			create: (request: CreatePermissionRequest) => API.RBAC.Permissions.create(request),
			update: (id: number, request: UpdatePermissionRequest) => API.RBAC.Permissions.update(id, request),
			delete: (id: number) => API.RBAC.Permissions.delete(id),
		}),
		[]
	)

	const crud = useCRUDEntity<Permission, CreatePermissionRequest, UpdatePermissionRequest>(
		apiService,
		{
			componentName,
			autoFetch,
			entityName: 'Permission',
		}
	)

	return {
		permissions: crud.entities,
		isLoading: crud.isLoading,
		isSaving: crud.isSaving,
		fetchPermissions: crud.fetchEntities,
		createPermission: crud.createEntity,
		updatePermission: crud.updateEntity,
		deletePermission: async (permission: Permission) => crud.deleteEntity(permission.id),
	}
}
