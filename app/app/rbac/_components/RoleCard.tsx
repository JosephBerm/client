/**
 * Role Card Component
 * 
 * Displays a single role with its details and action buttons.
 * 
 * @module RBAC RoleCard
 */

import { Key, Lock, Edit, Trash2 } from 'lucide-react'
import type { Role } from '@_shared/services/api'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

interface RoleCardProps {
	role: Role
	onEdit: (role: Role) => void
	onDelete: (role: Role) => void
	onManagePermissions: (role: Role) => void
}

export default function RoleCard({
	role,
	onEdit,
	onDelete,
	onManagePermissions,
}: RoleCardProps) {
	return (
		<Card className="p-6">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-3 mb-2">
						<Key className="w-5 h-5 text-primary" />
						<h3 className="text-lg font-semibold">{role.displayName}</h3>
						{role.isSystemRole && (
							<span className="px-2 py-0.5 rounded text-xs bg-warning/10 text-warning">
								System Role
							</span>
						)}
						<span className="px-2 py-0.5 rounded text-xs bg-base-200 text-base-content/60">
							Level {role.level}
						</span>
					</div>
					<p className="text-sm text-base-content/60 mb-2">
						{role.description || 'No description'}
					</p>
					<p className="text-xs font-mono text-base-content/40">{role.name}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						leftIcon={<Lock className="w-4 h-4" />}
						onClick={() => onManagePermissions(role)}
					>
						Permissions
					</Button>
					<Button
						variant="ghost"
						size="sm"
						leftIcon={<Edit className="w-4 h-4" />}
						onClick={() => onEdit(role)}
					>
						Edit
					</Button>
					{!role.isSystemRole && (
						<Button
							variant="ghost"
							size="sm"
							leftIcon={<Trash2 className="w-4 h-4" />}
							onClick={() => onDelete(role)}
							className="text-error hover:text-error"
						>
							Delete
						</Button>
					)}
				</div>
			</div>
		</Card>
	)
}
