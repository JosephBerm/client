/**
 * Permission Item Component
 *
 * Displays a single permission with edit/delete actions.
 * Mobile-optimized with responsive layout and 44px touch targets.
 *
 * @see PLAN_PERMISSIONS_MANAGEMENT_PAGE.md Phase 3
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
		<div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg
		               bg-base-200/50 hover:bg-base-200 transition-all duration-200">
			{/* Permission Info - stacks on mobile */}
			<div className="flex-1 min-w-0">
				<code className="font-mono text-sm text-primary font-medium break-all">
					{permString}
				</code>
				{permission.description && (
					<p className="text-sm text-base-content/60 mt-1 line-clamp-1">
						{permission.description}
					</p>
				)}
			</div>

			{/* Action Buttons - More visible with hover states */}
			<div className="flex items-center gap-1 self-end sm:self-auto opacity-70 group-hover:opacity-100 transition-opacity">
				<Button
					variant="ghost"
					size="sm"
					leftIcon={<Edit className="w-4 h-4" />}
					onClick={() => onEdit(permission)}
					className="min-h-[40px] min-w-[40px] sm:min-w-0 hover:bg-base-300 text-base-content/80 hover:text-primary"
					aria-label={`Edit ${permString}`}
				>
					<span className="hidden sm:inline ml-1">Edit</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					leftIcon={<Trash2 className="w-4 h-4" />}
					onClick={() => onDelete(permission)}
					className="min-h-[40px] min-w-[40px] sm:min-w-0 hover:bg-error/10 text-base-content/80 hover:text-error"
					aria-label={`Delete ${permString}`}
				>
					<span className="hidden sm:inline ml-1">Delete</span>
				</Button>
			</div>
		</div>
	)
}
