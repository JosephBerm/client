'use client'

/**
 * RBAC Role Management Page
 *
 * Full CRUD interface for managing roles and their permissions.
 * Uses extracted components and hooks for clean separation of concerns.
 *
 * Role Deletion: Uses RoleDeleteModal with AWS IAM pattern.
 * If users are assigned, requires migration before delete.
 *
 * @see PLAN_ROLE_DELETE_WITH_MIGRATION.md
 * @module RBAC Role Management
 */

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@_shared/services/api'

import Button from '@_components/ui/Button'
import { InternalPageHeader } from '../../../_components'

// RBAC Components (using barrel exports)
import { AccessDenied, LoadingState, RoleCard, RoleFormModal, RoleDeleteModal, RolePermissionsModal } from '../../_components'

// RBAC Hooks (using barrel exports)
import { useRoles, usePermissionsData, useRolePermissions } from '../../_hooks'

export default function RBACRoleManagementPage() {
	const { isAdmin } = usePermissions()
	const [editingRole, setEditingRole] = useState<Role | null>(null)
	const [deletingRole, setDeletingRole] = useState<Role | null>(null)
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [showPermissionsModal, setShowPermissionsModal] = useState(false)
	const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([])

	// Data hooks
	const { roles, isLoading, isSaving, createRole, updateRole, deleteRole, migrateUsers } = useRoles({
		componentName: 'RBACRoleManagementPage',
	})
	const { permissions } = usePermissionsData({
		componentName: 'RBACRoleManagementPage',
		autoFetch: true,
	})
	const { isSaving: isSavingPermissions, fetchRolePermissions, bulkAssignPermissions } = useRolePermissions({
		componentName: 'RBACRoleManagementPage',
	})

	const handleCreate = () => {
		setEditingRole(null)
		setShowCreateModal(true)
	}

	const handleEdit = (role: Role) => {
		setEditingRole(role)
		setShowCreateModal(true)
	}

	const handleSave = async (request: CreateRoleRequest | UpdateRoleRequest) => {
		let result: { success: boolean }
		if (editingRole) {
			result = await updateRole(editingRole.id, request as UpdateRoleRequest)
		} else {
			result = await createRole(request as CreateRoleRequest)
		}
		// Only close modal on success
		if (result.success) {
			setShowCreateModal(false)
			setEditingRole(null)
		}
	}

	// Open delete modal instead of immediate delete
	const handleDelete = (role: Role) => {
		setDeletingRole(role)
		setShowDeleteModal(true)
	}

	// Close delete modal
	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false)
		setDeletingRole(null)
	}

	const handleManagePermissions = async (role: Role) => {
		setEditingRole(role)
		const result = await fetchRolePermissions(role.id)
		if (result.success && result.data) {
			setSelectedRolePermissions(result.data.map(p => p.id))
			setShowPermissionsModal(true)
		}
	}

	const handleSavePermissions = async (roleId: number, permissionIds: number[]) => {
		const result = await bulkAssignPermissions(roleId, permissionIds)
		if (result.success) {
			setShowPermissionsModal(false)
			setEditingRole(null)
		}
	}

	if (!isAdmin) {
		return <AccessDenied />
	}

	return (
		<>
			<InternalPageHeader
				title="Role Management"
				description="Create, edit, and manage system roles and their permissions"
				actions={
					<div className="flex items-center gap-2">
						<Link href={Routes.RBAC.roles}>
							<Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="w-4 h-4" />}>
								Back
							</Button>
						</Link>
						<Button
							variant="primary"
							size="sm"
							leftIcon={<Plus className="w-4 h-4" />}
							onClick={handleCreate}
						>
							Create Role
						</Button>
					</div>
				}
			/>

			{isLoading ? (
				<LoadingState message="Loading roles..." />
			) : (
				<div className="space-y-4">
					{roles.map((role) => (
						<RoleCard
							key={role.id}
							role={role}
							onEdit={handleEdit}
							onDelete={handleDelete}
							onManagePermissions={handleManagePermissions}
						/>
					))}
				</div>
			)}

			<RoleFormModal
				isOpen={showCreateModal}
				onClose={() => {
					setShowCreateModal(false)
					setEditingRole(null)
				}}
				onSave={handleSave}
				role={editingRole}
				isSaving={isSaving}
				existingRoles={roles}
			/>

			<RoleDeleteModal
				isOpen={showDeleteModal}
				onClose={handleCloseDeleteModal}
				role={deletingRole}
				roles={roles}
				onDelete={deleteRole}
				onMigrateUsers={migrateUsers}
			/>

			<RolePermissionsModal
				isOpen={showPermissionsModal}
				onClose={() => {
					setShowPermissionsModal(false)
					setEditingRole(null)
				}}
				onSave={handleSavePermissions}
				role={editingRole}
				permissions={permissions}
				initialPermissionIds={selectedRolePermissions}
				isSaving={isSavingPermissions}
			/>
		</>
	)
}
