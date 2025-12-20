/**
 * usePermissionsData Hook
 *
 * Custom hook for managing permissions data and operations.
 * Built on top of useCRUDEntity for DRY compliance.
 *
 * Note: Named usePermissionsData to avoid conflict with usePermissions from @_shared
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * With React Compiler (`reactCompiler: true`):
 * - No useMemo needed for apiService - compiler auto-optimizes
 * - Object literals in render are safe - compiler handles stability
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module RBAC usePermissionsData
 */

import { API } from '@_shared'
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@_shared/services/api'

import { useCRUDEntity } from './useCRUDEntity'

/**
 * API service definition for permissions.
 * Wrapped in a function to ensure React Compiler can optimize properly.
 */
const createPermissionsApiService = () => ({
	getAll: () => API.RBAC.Permissions.getAll(),
	create: (request: CreatePermissionRequest) => API.RBAC.Permissions.create(request),
	update: (id: number, request: UpdatePermissionRequest) => API.RBAC.Permissions.update(id, request),
	delete: (id: number) => API.RBAC.Permissions.delete(id),
})

interface UsePermissionsDataOptions {
	componentName?: string
	autoFetch?: boolean
}

export function usePermissionsData(options: UsePermissionsDataOptions = {}) {
	const { componentName = 'usePermissionsData', autoFetch = true } = options

	// Use a stable reference - React Compiler will optimize this
	const apiService = createPermissionsApiService()

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
