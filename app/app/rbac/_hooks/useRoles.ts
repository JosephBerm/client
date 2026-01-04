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
import type { Role, CreateRoleRequest, UpdateRoleRequest, RoleDeleteResult } from '@_shared/services/api'

import { useCRUDEntity } from './useCRUDEntity'

/**
 * API service definition for roles.
 * Wrapped in a function to ensure React Compiler can optimize properly.
 *
 * NOTE: delete returns RoleDeleteResult, not boolean.
 * We handle this specially in deleteRole below.
 */
const createRolesApiService = () => ({
	getAll: () => API.RBAC.Roles.getAll(),
	create: (request: CreateRoleRequest) => API.RBAC.Roles.create(request),
	update: (id: number, request: UpdateRoleRequest) => API.RBAC.Roles.update(id, request),
	// Cast to satisfy useCRUDEntity interface - we bypass this for delete via deleteRole
	delete: (id: number) => API.RBAC.Roles.delete(id) as unknown as Promise<{ data: { statusCode: number; payload: unknown; message: string | null } }>,
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

	/**
	 * Attempts to delete a role.
	 * Returns RoleDeleteResult with deletion status.
	 *
	 * AWS IAM Pattern: If users are assigned, returns BlockedByUsers=true.
	 * Caller must migrate users via migrateUsers before retrying.
	 *
	 * @see https://docs.aws.amazon.com/IAM/latest/APIReference/API_DeleteRole.html
	 */
	const deleteRole = async (roleId: number): Promise<RoleDeleteResult | null> => {
		try {
			const response = await API.RBAC.Roles.delete(roleId)

			if (response.data.statusCode === 200 && response.data.payload) {
				const result = response.data.payload

				// Only show success notification and refetch if actually deleted
				if (result.deleted) {
					logger.info('Role deleted successfully', {
						component: componentName,
						action: 'deleteRole',
						roleId,
					})
					notificationService.success('Role deleted successfully', {
						component: componentName,
						action: 'deleteRole',
					})
					await crud.fetchEntities()
				}

				return result
			}

			return null
		} catch (err) {
			logger.error('Failed to delete role', {
				component: componentName,
				action: 'deleteRole',
				roleId,
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error('Failed to delete role', {
				component: componentName,
				action: 'deleteRole',
			})
			return null
		}
	}

	/**
	 * Migrates users from one role level to another.
	 * Used before retrying delete when users are blocked.
	 *
	 * @returns true if migration succeeded, false otherwise
	 */
	const migrateUsers = async (fromRoleLevel: number, toRoleLevel: number): Promise<boolean> => {
		try {
			// Get all users with the source role level
			// roleFilter accepts the level number directly (AccountRoleType)
			const usersResponse = await API.RBAC.getUsersWithRoles({
				roleFilter: fromRoleLevel as import('@_classes/Enums').AccountRoleType,
				pageSize: 1000,
			})

			if (usersResponse.data.statusCode !== 200 || !usersResponse.data.payload?.data) {
				logger.error('Failed to get users for migration', {
					component: componentName,
					action: 'migrateUsers',
					fromRoleLevel,
				})
				return false
			}

			const userIds = usersResponse.data.payload.data.map(u => u.id)

			if (userIds.length === 0) {
				// No users to migrate - this shouldn't happen but handle gracefully
				return true
			}

			// Bulk update users to new role
			// newRole accepts the level number directly (AccountRoleType)
			const updateResponse = await API.RBAC.bulkUpdateRoles({
				userIds,
				newRole: toRoleLevel as import('@_classes/Enums').AccountRoleType,
				reason: 'Role deletion - users migrated to new role',
			})

			if (updateResponse.data.statusCode === 200 && updateResponse.data.payload) {
				const result = updateResponse.data.payload

				if (result.failedCount === 0) {
					logger.info('Users migrated successfully', {
						component: componentName,
						action: 'migrateUsers',
						fromRoleLevel,
						toRoleLevel,
						userCount: result.updatedCount,
					})
					notificationService.success(`${result.updatedCount} user(s) migrated successfully`, {
						component: componentName,
						action: 'migrateUsers',
					})
					return true
				} else {
					logger.error('Some users failed to migrate', {
						component: componentName,
						action: 'migrateUsers',
						failedCount: result.failedCount,
						failures: result.failures,
					})
					notificationService.error(`Failed to migrate ${result.failedCount} user(s)`, {
						component: componentName,
						action: 'migrateUsers',
					})
					return false
				}
			}

			return false
		} catch (err) {
			logger.error('Failed to migrate users', {
				component: componentName,
				action: 'migrateUsers',
				fromRoleLevel,
				toRoleLevel,
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error('Failed to migrate users', {
				component: componentName,
				action: 'migrateUsers',
			})
			return false
		}
	}

	return {
		roles: crud.entities,
		isLoading: crud.isLoading,
		isSaving: crud.isSaving,
		fetchRoles: crud.fetchEntities,
		createRole: crud.createEntity,
		updateRole: crud.updateEntity,
		deleteRole,
		migrateUsers,
	}
}
