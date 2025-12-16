/**
 * useRoles Hook
 * 
 * Custom hook for managing roles in the RBAC system.
 * Provides CRUD operations and state management for roles.
 */

'use client'

import { useState, useCallback } from 'react'
import API from '@_shared/services/api'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../_types'

interface UseRolesReturn {
  roles: Role[]
  loading: boolean
  error: string | null
  fetchRoles: () => Promise<void>
  createRole: (request: CreateRoleRequest) => Promise<Role | null>
  updateRole: (id: number, request: UpdateRoleRequest) => Promise<Role | null>
  deleteRole: (id: number) => Promise<boolean>
  getRole: (id: number) => Promise<Role | null>
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.getAllRoles()
      const payload = response.data.payload
      if (payload) {
        setRoles(payload)
      } else {
        setError(response.data.message || 'Failed to fetch roles')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }, [])

  const createRole = useCallback(async (request: CreateRoleRequest): Promise<Role | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.createRole(request)
      const payload = response.data.payload
      if (payload) {
        await fetchRoles() // Refresh list
        return payload
      } else {
        setError(response.data.message || 'Failed to create role')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  const updateRole = useCallback(async (id: number, request: UpdateRoleRequest): Promise<Role | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.updateRole(id, request)
      const payload = response.data.payload
      if (payload) {
        await fetchRoles() // Refresh list
        return payload
      } else {
        setError(response.data.message || 'Failed to update role')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  const deleteRole = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.deleteRole(id)
      if (response.data.statusCode >= 200 && response.data.statusCode < 300) {
        await fetchRoles() // Refresh list
        return true
      } else {
        setError(response.data.message || 'Failed to delete role')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRoles])

  const getRole = useCallback(async (id: number): Promise<Role | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await API.RBAC.getRole(id)
      const payload = response.data.payload
      if (payload) {
        return payload
      } else {
        setError(response.data.message || 'Failed to fetch role')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch role')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRole,
  }
}
