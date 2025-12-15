/**
 * Generic CRUD Entity Hook
 * 
 * Base hook for managing CRUD operations on any entity type.
 * Eliminates duplication between useRoles and usePermissionsData.
 * 
 * @module RBAC useCRUDEntity
 */

import { useState, useEffect, useCallback } from 'react'
import { API, notificationService } from '@_shared'

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

	const fetchEntities = useCallback(async () => {
		setIsLoading(true)
		try {
			const response = await apiService.getAll()
			if (response.data.statusCode === 200 && response.data.payload) {
				setEntities(response.data.payload)
			}
		} catch (err) {
			notificationService.error(`Failed to load ${entityName.toLowerCase()}s`, {
				component: componentName,
				action: 'fetchEntities',
			})
		} finally {
			setIsLoading(false)
		}
	}, [apiService, componentName, entityName])

	const createEntity = useCallback(async (request: TCreateRequest) => {
		setIsSaving(true)
		try {
			const response = await apiService.create(request)
			if (response.data.statusCode === 201) {
				notificationService.success(`${entityName} created successfully`, {
					component: componentName,
					action: 'createEntity',
				})
				await fetchEntities()
				return { success: true, data: response.data.payload }
			}
			return { success: false }
		} catch (err) {
			notificationService.error(`Failed to create ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'createEntity',
			})
			return { success: false }
		} finally {
			setIsSaving(false)
		}
	}, [apiService, componentName, entityName, fetchEntities])

	const updateEntity = useCallback(async (id: number, request: TUpdateRequest) => {
		setIsSaving(true)
		try {
			const response = await apiService.update(id, request)
			if (response.data.statusCode === 200) {
				notificationService.success(`${entityName} updated successfully`, {
					component: componentName,
					action: 'updateEntity',
				})
				await fetchEntities()
				return { success: true, data: response.data.payload }
			}
			return { success: false }
		} catch (err) {
			notificationService.error(`Failed to update ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'updateEntity',
			})
			return { success: false }
		} finally {
			setIsSaving(false)
		}
	}, [apiService, componentName, entityName, fetchEntities])

	const deleteEntity = useCallback(async (id: number) => {
		try {
			const response = await apiService.delete(id)
			if (response.data.statusCode === 200) {
				notificationService.success(`${entityName} deleted successfully`, {
					component: componentName,
					action: 'deleteEntity',
				})
				await fetchEntities()
				return { success: true }
			}
			return { success: false }
		} catch (err) {
			notificationService.error(`Failed to delete ${entityName.toLowerCase()}`, {
				component: componentName,
				action: 'deleteEntity',
			})
			return { success: false }
		}
	}, [apiService, componentName, entityName, fetchEntities])

	useEffect(() => {
		if (autoFetch) {
			void fetchEntities()
		}
	}, [autoFetch, fetchEntities])

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
