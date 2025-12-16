/**
 * RBAC Permissions Page
 * 
 * Main page for viewing and managing permissions.
 * ADMIN ONLY: Requires administrative privileges.
 */

'use client'

import { useEffect } from 'react'
import { usePermissions } from '../_hooks'

export default function PermissionsPage() {
  const { permissions, loading, error, fetchPermissions } = usePermissions()

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  if (loading) {
    return <div className="p-8">Loading permissions...</div>
  }

  if (error) {
    return <div className="p-8 text-error">Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Permissions Management</h1>
      <div className="space-y-4">
        {permissions.map((permission) => (
          <div key={permission.id} className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title">
                {permission.resource}:{permission.action}
                {permission.context && `:${permission.context}`}
              </h2>
              {permission.description && <p className="text-sm">{permission.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
