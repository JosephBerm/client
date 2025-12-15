/**
 * Permission Item Component
 * 
 * Displays a single permission with edit/delete actions.
 * 
 * @module RBAC PermissionItem
 */

import { Edit, Trash2 } from 'lucide-react'
import type { Permission } from '@_shared/services/api'
import Button from '@_components/ui/Button'
import { formatPermissionString } from '../_utils'

interface PermissionItemProps {
	permission: Permission
	onEdit: (permission: Permission) => void
	onDelete: (permission: Permission) => void
}

export default function PermissionItem({
	permission,
	onEdit,
	onDelete,
}: PermissionItemProps) {
	const permString = formatPermissionString(permission)

	return (
		<div className="flex items-center justify-between p-3 rounded bg-base-200 hover:bg-base-300 transition-colors">
			<div className="flex-1">
				<div className="flex items-center gap-2">
					<span className="font-mono text-sm text-primary">{permString}</span>
					{permission.description && (
						<span className="text-sm text-base-content/60">- {permission.description}</span>
					)}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					leftIcon={<Edit className="w-4 h-4" />}
					onClick={() => onEdit(permission)}
				>
					Edit
				</Button>
				<Button
					variant="ghost"
					size="sm"
					leftIcon={<Trash2 className="w-4 h-4" />}
					onClick={() => onDelete(permission)}
					className="text-error hover:text-error"
				>
					Delete
				</Button>
			</div>
		</div>
	)
}
