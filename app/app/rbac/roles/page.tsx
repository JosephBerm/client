/**
 * RBAC Roles Page
 * 
 * Main page for viewing and managing roles.
 * ADMIN ONLY: Requires administrative privileges.
 */

'use client'

import { useEffect } from 'react'
import { useRoles } from '../_hooks'

export default function RolesPage() {
  const { roles, loading, error, fetchRoles } = useRoles()

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  if (loading) {
    return <div className="p-8">Loading roles...</div>
  }

  if (error) {
    return <div className="p-8 text-error">Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Roles Management</h1>
      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title">{role.displayName}</h2>
              <p className="text-sm text-base-content/60">{role.name}</p>
              <p className="text-xs">Level: {role.level}</p>
              {role.description && <p className="text-sm">{role.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
