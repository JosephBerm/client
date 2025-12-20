/**
 * Generic CRUD Entity Hook
 *
 * Feature-specific hook for managing CRUD operations WITH entity list state.
 * Eliminates duplication between useRoles and usePermissionsData.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * With React Compiler (`reactCompiler: true` in next.config.mjs):
 * - Manual useCallback is NOT required - compiler auto-memoizes
 * - We keep useEffect for side effects (data fetching on mount)
 * - Functions are written as plain arrow functions for cleaner code
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE NOTE: useCRUDEntity vs useCRUDSubmit
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This hook (useCRUDEntity) and the shared useCRUDSubmit hook serve DIFFERENT purposes:
 *
 * | Feature              | useCRUDSubmit (shared)     | useCRUDEntity (this hook)  |
 * |----------------------|----------------------------|----------------------------|
 * | Entity list state    | ❌ No - stateless          | ✅ Yes - manages `entities`|
 * | Auto-fetch on mount  | ❌ No                      | ✅ Yes - `autoFetch` option|
 * | Refresh after CRUD   | ❌ No - manual refresh     | ✅ Yes - auto-refetches    |
 * | Uses useFormSubmit   | ✅ Yes - composes it       | ❌ No - direct impl        |
 * | Logging              | Via useFormSubmit          | Direct logger calls        |
 * | Use case             | Form submissions           | Entity list management     |
 *
 * WHEN TO USE EACH:
 *
 * - **useCRUDSubmit** (@_shared/hooks):
 *   Use for simple form submissions where you DON'T need to manage a list of entities.
 *   Example: Single entity edit forms, one-off create operations.
 *
 * - **useCRUDEntity** (this hook):
 *   Use when you need to manage a LIST of entities with auto-fetch and auto-refresh.
 *   Example: Admin panels with entity tables (roles, permissions, users).
 *
 * @example
 * ```typescript
 * // With React Compiler, no useMemo needed for apiService
 * const apiService = {
 *   getAll: () => API.RBAC.Roles.getAll(),
 *   create: (req) => API.RBAC.Roles.create(req),
 *   update: (id, req) => API.RBAC.Roles.update(id, req),
 *   delete: (id) => API.RBAC.Roles.delete(id),
 * }
 *
 * const { entities, isLoading, createEntity, updateEntity, deleteEntity } =
 *   useCRUDEntity(apiService, { entityName: 'Role', autoFetch: true })
 * ```
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @see useCRUDSubmit - For stateless form submissions
 * @see useRoles - Example usage of this hook
 * @module RBAC useCRUDEntity
 */

import { useState, useEffect } from 'react'

import { logger } from '@_core'
import { notificationService } from '@_shared'

interface CRUDApiService<TEntity, TCreateRequest, TUpdateRequest> {
	getAll: () => Promise<{ data: { statusCode: number; payload?: TEntity[] | null } }>
	create: (request: TCreateRequest) => Promise<{ data: { statusCode: number; payload?: TEntity | null } }>
	update: (id: number, request: TUpdateRequest) => Promise<{ data: { statusCode: number; payload?: TEntity | null } }>
	delete: (id: number) => Promise<{ data: { statusCode: number } }>
}

interface UseCRUDEntityOptions {
	componentName?: string
	autoFetch?: boolean
	entityName?: string
}

export function useCRUDEntity<TEntity, TCreateRequest, TUpdateRequest>(
	apiService: CRUDApiService<TEntity, TCreateRequest, TUpdateRequest>,
	options: UseCRUDEntityOptions = {}
) {
	const { componentName = 'useCRUDEntity', autoFetch = true, entityName = 'Item' } = options
	const [entities, setEntities] = useState<TEntity[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	// ---------------------------------------------------------------------------
	// CRUD OPERATIONS
	// React Compiler auto-memoizes these functions - no useCallback needed
	// ---------------------------------------------------------------------------

	const fetchEntities = async () => {
		setIsLoading(true)
		try {
			const response = await apiService.getAll()
			if (response.data.statusCode === 200 && response.data.payload) {
				setEntities(response.data.payload)
			}
		} catch (err) {
			logger.error(`Failed to fetch ${entityName.toLowerCase()}s`, {
				component: componentName,
				action: 'fetchEntities',
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error(`Failed to load ${entityName.toLowerCase()}s`, {
				component: componentName,
				action: 'fetchEntities',
			})
		} finally {
			setIsLoading(false)
		}
	}

	const createEntity = async (request: TCreateRequest) => {
		setIsSaving(true)
		try {
			const response = await apiService.create(request)
			if (response.data.statusCode === 201) {
				logger.info(`${entityName} created successfully`, {
					component: componentName,
					action: 'createEntity',
				})
				notificationService.success(`${entityName} created successfully`, {
					component: componentName,
					action: 'createEntity',
				})
				await fetchEntities()
				return { success: true, data: response.data.payload }
			}
			return { success: false }
		} catch (err) {
			logger.error(`Failed to create ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'createEntity',
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error(`Failed to create ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'createEntity',
			})
			return { success: false }
		} finally {
			setIsSaving(false)
		}
	}

	const updateEntity = async (id: number, request: TUpdateRequest) => {
		setIsSaving(true)
		try {
			const response = await apiService.update(id, request)
			if (response.data.statusCode === 200) {
				logger.info(`${entityName} updated successfully`, {
					component: componentName,
					action: 'updateEntity',
					entityId: id,
				})
				notificationService.success(`${entityName} updated successfully`, {
					component: componentName,
					action: 'updateEntity',
				})
				await fetchEntities()
				return { success: true, data: response.data.payload }
			}
			return { success: false }
		} catch (err) {
			logger.error(`Failed to update ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'updateEntity',
				entityId: id,
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error(`Failed to update ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'updateEntity',
			})
			return { success: false }
		} finally {
			setIsSaving(false)
		}
	}

	const deleteEntity = async (id: number) => {
		try {
			const response = await apiService.delete(id)
			if (response.data.statusCode === 200) {
				logger.info(`${entityName} deleted successfully`, {
					component: componentName,
					action: 'deleteEntity',
					entityId: id,
				})
				notificationService.success(`${entityName} deleted successfully`, {
					component: componentName,
					action: 'deleteEntity',
				})
				await fetchEntities()
				return { success: true }
			}
			return { success: false }
		} catch (err) {
			logger.error(`Failed to delete ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'deleteEntity',
				entityId: id,
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			notificationService.error(`Failed to delete ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'deleteEntity',
			})
			return { success: false }
		}
	}

	// ---------------------------------------------------------------------------
	// SIDE EFFECTS
	// ---------------------------------------------------------------------------

	// Auto-fetch on mount if enabled
	// Note: We use an empty dependency array because:
	// 1. This should only run once on mount
	// 2. React Compiler handles function stability
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (autoFetch) {
			void fetchEntities()
		}
	}, [])

	return {
		entities,
		isLoading,
		isSaving,
		fetchEntities,
		createEntity,
		updateEntity,
		deleteEntity,
	}
}
