/**
 * useRolePermissions Hook
 * 
 * Custom hook for managing role-permission assignments.
 * Provides operations for assigning/unassigning permissions to roles.
 */

'use client'

import { useState, useCallback } from 'react'
import API from '@_shared/services/api'
import type { Permission, BulkAssignPermissionsRequest } from '../_types'

interface UseRolePermissionsReturn {
  rolePermissions: Permission[]
  loading: boolean
  error: string | null
  fetchRolePermissions: (roleId: number) => Promise<void>
  assignPermission: (roleId: number, permissionId: number) => Promise<boolean>
  removePermission: (roleId: number, permissionId: number) => Promise<boolean>
  bulkAssignPermissions: (roleId: number, permissionIds: number[]) => Promise<boolean>
}

export function useRolePermissions(): UseRolePermissionsReturn {
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRolePermissions = useCallback(async (roleId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.getRolePermissions(roleId)
      const payload = response.data.payload
      if (payload) {
        setRolePermissions(payload)
      } else {
        setError(response.data.message || 'Failed to fetch role permissions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch role permissions')
    } finally {
      setLoading(false)
    }
  }, [])

  const assignPermission = useCallback(async (roleId: number, permissionId: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.assignPermissionToRole(roleId, permissionId)
      if (response.data.statusCode >= 200 && response.data.statusCode < 300) {
        await fetchRolePermissions(roleId) // Refresh list
        return true
      } else {
        setError(response.data.message || 'Failed to assign permission')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign permission')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRolePermissions])

  const removePermission = useCallback(async (roleId: number, permissionId: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.removePermissionFromRole(roleId, permissionId)
      if (response.data.statusCode >= 200 && response.data.statusCode < 300) {
        await fetchRolePermissions(roleId) // Refresh list
        return true
      } else {
        setError(response.data.message || 'Failed to remove permission')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove permission')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRolePermissions])

  const bulkAssignPermissions = useCallback(async (roleId: number, permissionIds: number[]): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const request: BulkAssignPermissionsRequest = { permissionIds }
      const response = await API.RBAC.bulkAssignPermissions(roleId, request)
      if (response.data.statusCode >= 200 && response.data.statusCode < 300) {
        await fetchRolePermissions(roleId) // Refresh list
        return true
      } else {
        setError(response.data.message || 'Failed to bulk assign permissions')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk assign permissions')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRolePermissions])

  return {
    rolePermissions,
    loading,
    error,
    fetchRolePermissions,
    assignPermission,
    removePermission,
    bulkAssignPermissions,
  }
}
