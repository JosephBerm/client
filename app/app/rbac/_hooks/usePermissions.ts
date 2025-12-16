/**
 * usePermissions Hook
 * 
 * Custom hook for managing permissions in the RBAC system.
 * Provides CRUD operations and state management for permissions.
 */

'use client'

import { useState, useCallback } from 'react'
import API from '@_shared/services/api'
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../_types'

interface UsePermissionsReturn {
  permissions: Permission[]
  loading: boolean
  error: string | null
  fetchPermissions: () => Promise<void>
  createPermission: (request: CreatePermissionRequest) => Promise<Permission | null>
  updatePermission: (id: number, request: UpdatePermissionRequest) => Promise<Permission | null>
  deletePermission: (id: number) => Promise<boolean>
  getPermission: (id: number) => Promise<Permission | null>
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.getAllPermissions()
      const payload = response.data.payload
      if (payload) {
        setPermissions(payload)
      } else {
        setError(response.data.message || 'Failed to fetch permissions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPermission = useCallback(async (request: CreatePermissionRequest): Promise<Permission | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.createPermission(request)
      const payload = response.data.payload
      if (payload) {
        await fetchPermissions() // Refresh list
        return payload
      } else {
        setError(response.data.message || 'Failed to create permission')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create permission')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchPermissions])

  const updatePermission = useCallback(async (id: number, request: UpdatePermissionRequest): Promise<Permission | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.updatePermission(id, request)
      const payload = response.data.payload
      if (payload) {
        await fetchPermissions() // Refresh list
        return payload
      } else {
        setError(response.data.message || 'Failed to update permission')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permission')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchPermissions])

  const deletePermission = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.deletePermission(id)
      if (response.data.statusCode >= 200 && response.data.statusCode < 300) {
        await fetchPermissions() // Refresh list
        return true
      } else {
        setError(response.data.message || 'Failed to delete permission')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete permission')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchPermissions])

  const getPermission = useCallback(async (id: number): Promise<Permission | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.getPermission(id)
      const payload = response.data.payload
      if (payload) {
        return payload
      } else {
        setError(response.data.message || 'Failed to fetch permission')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permission')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getPermission,
  }
}
