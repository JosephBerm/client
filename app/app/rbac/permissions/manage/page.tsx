'use client'

/**
 * RBAC Permission Management Page
 * 
 * Full CRUD interface for managing permissions.
 * Uses extracted components and hooks for clean separation of concerns.
 * 
 * @module RBAC Permission Management
 */

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared'
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@_shared/services/api'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import { InternalPageHeader } from '../../../_components'

// RBAC Components (using barrel exports)
import { AccessDenied, LoadingState, PermissionItem, PermissionFormModal } from '../../_components'

// RBAC Hooks (using barrel exports)
import { usePermissionsData } from '../../_hooks'

// RBAC Utils (using barrel exports)
import { groupPermissionsByResource, confirmDelete } from '../../_utils'

export default function RBACPermissionManagementPage() {
	const { isAdmin } = usePermissions()
	const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
	const [showCreateModal, setShowCreateModal] = useState(false)

	// Data hooks
	const { permissions, isLoading, isSaving, createPermission, updatePermission, deletePermission } = usePermissionsData({
		componentName: 'RBACPermissionManagementPage',
	})

	const groupedPermissions = groupPermissionsByResource(permissions)

	const handleCreate = () => {
		setEditingPermission(null)
		setShowCreateModal(true)
	}

	const handleEdit = (permission: Permission) => {
		setEditingPermission(permission)
		setShowCreateModal(true)
	}

	const handleSave = async (request: CreatePermissionRequest | UpdatePermissionRequest) => {
		if (editingPermission) {
			await updatePermission(editingPermission.id, request as UpdatePermissionRequest)
		} else {
			await createPermission(request as CreatePermissionRequest)
		}
		setShowCreateModal(false)
		setEditingPermission(null)
	}

	const handleDelete = async (permission: Permission) => {
		const permString = `${permission.resource}:${permission.action}`
		const confirmed = await confirmDelete('permission', permString)
		if (!confirmed) return
		await deletePermission(permission)
	}

	if (!isAdmin) {
		return <AccessDenied />
	}

	return (
		<>
			<InternalPageHeader
				title="Permission Management"
				description="Create, edit, and manage system permissions"
				actions={
					<div className="flex items-center gap-2">
						<Link href={Routes.RBAC.permissions}>
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
							Create Permission
						</Button>
					</div>
				}
			/>

			{isLoading ? (
				<LoadingState message="Loading permissions..." />
			) : (
				<div className="space-y-6">
					{Object.entries(groupedPermissions).map(([resource, perms]) => (
						<Card key={resource} className="p-6">
							<h3 className="text-lg font-semibold mb-4 capitalize">{resource}</h3>
							<div className="space-y-2">
								{perms.map((perm) => (
									<PermissionItem
										key={perm.id}
										permission={perm}
										onEdit={handleEdit}
										onDelete={handleDelete}
									/>
								))}
							</div>
						</Card>
					))}
				</div>
			)}

			<PermissionFormModal
				isOpen={showCreateModal}
				onClose={() => {
					setShowCreateModal(false)
					setEditingPermission(null)
				}}
				onSave={handleSave}
				permission={editingPermission}
				isSaving={isSaving}
			/>
		</>
	)
}
