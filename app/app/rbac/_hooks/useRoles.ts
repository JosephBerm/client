/**
 * useRoles Hook
 *
 * Custom hook for managing roles data and operations.
 * Built on top of useCRUDEntity for DRY compliance.
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
 * @module RBAC useRoles
 */

import { logger } from '@_core'
import { API, notificationService } from '@_shared'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@_shared/services/api'

import { useCRUDEntity } from './useCRUDEntity'

/**
 * API service definition for roles.
 * Wrapped in a function to ensure React Compiler can optimize properly.
 */
const createRolesApiService = () => ({
	getAll: () => API.RBAC.Roles.getAll(),
	create: (request: CreateRoleRequest) => API.RBAC.Roles.create(request),
	update: (id: number, request: UpdateRoleRequest) => API.RBAC.Roles.update(id, request),
	delete: (id: number) => API.RBAC.Roles.delete(id),
})

interface UseRolesOptions {
	componentName?: string
	autoFetch?: boolean
}

export function useRoles(options: UseRolesOptions = {}) {
	const { componentName = 'useRoles', autoFetch = true } = options

	// Use a stable reference - React Compiler will optimize this
	const apiService = createRolesApiService()

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
			logger.warn('Attempted to delete system role', {
				component: componentName,
				action: 'deleteRole',
				roleId: role.id,
				roleName: role.name,
			})
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
