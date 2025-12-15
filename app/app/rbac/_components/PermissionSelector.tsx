'use client'

/**
 * Permission Selector Component
 * 
 * Component for selecting multiple permissions, grouped by resource.
 * Used in role permission assignment.
 * 
 * @module RBAC PermissionSelector
 */

import { useMemo } from 'react'
import type { Permission } from '@_shared/services/api'
import { groupPermissionsByResource, formatPermissionDisplay } from '../_utils'

interface PermissionSelectorProps {
	permissions: Permission[]
	selectedPermissionIds: number[]
	onToggle: (permissionId: number) => void
}

export default function PermissionSelector({
	permissions,
	selectedPermissionIds,
	onToggle,
}: PermissionSelectorProps) {
	// Memoize expensive grouping operation
	const groupedPermissions = useMemo(() => groupPermissionsByResource(permissions), [permissions])

	return (
		<div className="space-y-4 max-h-[60vh] overflow-y-auto">
			{Object.entries(groupedPermissions).map(([resource, perms]) => (
				<div key={resource} className="border-b border-base-300 pb-4">
					<h4 className="font-semibold mb-2 capitalize">{resource}</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
						{perms.map((perm) => {
							const isSelected = selectedPermissionIds.includes(perm.id)
							const permString = formatPermissionDisplay(perm)
							return (
								<label
									key={perm.id}
									className="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer"
								>
									<input
										type="checkbox"
										checked={isSelected}
										onChange={() => onToggle(perm.id)}
										className="checkbox checkbox-sm"
									/>
									<span className="text-sm">
										<span className="font-mono text-xs text-primary">{permString}</span>
										{perm.description && (
											<span className="text-base-content/60 ml-2">{perm.description}</span>
										)}
									</span>
								</label>
							)
						})}
					</div>
				</div>
			))}
		</div>
	)
}
