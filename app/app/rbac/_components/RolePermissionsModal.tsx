'use client'

/**
 * Role Permissions Modal Component
 * 
 * Modal for managing role-permission assignments.
 * 
 * @module RBAC RolePermissionsModal
 */

import { useState, useEffect } from 'react'
import type { Role, Permission } from '@_shared/services/api'
import Modal from '@_components/ui/Modal'
import PermissionSelector from './PermissionSelector'
import FormFooter from './FormFooter'
import { toggleArrayItem } from '../_utils'

interface RolePermissionsModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (roleId: number, permissionIds: number[]) => Promise<void>
	role: Role | null
	permissions: Permission[]
	initialPermissionIds: number[]
	isSaving: boolean
}

export default function RolePermissionsModal({
	isOpen,
	onClose,
	onSave,
	role,
	permissions,
	initialPermissionIds,
	isSaving,
}: RolePermissionsModalProps) {
	const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

	// Reset selections when modal opens or role changes
	useEffect(() => {
		if (isOpen && role) {
			setSelectedPermissionIds(initialPermissionIds)
		}
	}, [isOpen, role, initialPermissionIds])

	// React 19 Compiler handles memoization automatically
	const handleToggle = (permissionId: number) => {
		setSelectedPermissionIds(prev => toggleArrayItem(prev, permissionId))
	}

	const handleSave = async () => {
		if (!role) return
		await onSave(role.id, selectedPermissionIds)
	}

	const modalTitle = role ? `Manage Permissions - ${role.displayName}` : 'Manage Permissions'

	if (!role) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={modalTitle}
			size="lg"
		>
			<PermissionSelector
				permissions={permissions}
				selectedPermissionIds={selectedPermissionIds}
				onToggle={handleToggle}
				initialPermissionIds={initialPermissionIds}
			/>
			<div className="pt-4 border-t border-base-300 mt-4">
				<FormFooter
					onCancel={onClose}
					onSave={handleSave}
					isSaving={isSaving}
					saveLabel="Save Permissions"
				/>
			</div>
		</Modal>
	)
}
