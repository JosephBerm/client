'use client'

/**
 * RBAC Permission Management Page
 *
 * Full CRUD interface for managing permissions with:
 * - Global search with debounce (P0)
 * - Bulk selection and delete (P1)
 * - Stats summary cards (P1)
 * - Empty state handling (P2)
 *
 * Uses extracted components and hooks for clean separation of concerns.
 *
 * @see PLAN_PERMISSIONS_MANAGEMENT_PAGE.md
 * @module RBAC Permission Management
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'

import { ChevronLeft, Plus, Search, Lock, Layers } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { usePermissions, useDebounce } from '@_shared'
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@_shared/services/api'

import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'
import StatCard from '@_components/ui/StatCard'
import EmptyState from '@_components/common/EmptyState'
import { InternalPageHeader } from '../../../_components'

// RBAC Components (using barrel exports)
import {
	AccessDenied,
	LoadingState,
	PermissionFormModal,
	PermissionGroup,
	PermissionBulkBar,
} from '../../_components'

// RBAC Hooks (using barrel exports)
import { usePermissionsData } from '../../_hooks'

// RBAC Utils (using barrel exports)
import { groupPermissionsByResource, confirmDelete, toggleArrayItem } from '../../_utils'

export default function RBACPermissionManagementPage() {
	const { isAdmin } = usePermissions()

	// Search state with debounce (P0)
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearch = useDebounce(searchTerm, 300)

	// Selection state (P1)
	const [selectedIds, setSelectedIds] = useState<number[]>([])

	// Modal state
	const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
	const [showCreateModal, setShowCreateModal] = useState(false)

	// Data hooks
	const { permissions, isLoading, isSaving, createPermission, updatePermission, deletePermission } =
		usePermissionsData({
			componentName: 'RBACPermissionManagementPage',
		})

	// Filter permissions by search term (useMemo justified - creates derived array)
	const filteredPermissions = useMemo(() => {
		if (!debouncedSearch) return permissions
		const term = debouncedSearch.toLowerCase()
		return permissions.filter(
			(p) =>
				p.resource.toLowerCase().includes(term) ||
				p.action.toLowerCase().includes(term) ||
				p.context?.toLowerCase().includes(term) ||
				p.description?.toLowerCase().includes(term)
		)
	}, [permissions, debouncedSearch])

	// Group permissions by resource
	const groupedPermissions = groupPermissionsByResource(filteredPermissions)
	const allGroupedPermissions = groupPermissionsByResource(permissions)
	const resourceCount = Object.keys(allGroupedPermissions).length

	// Selection handlers
	const toggleSelection = (id: number) => {
		setSelectedIds((prev) => toggleArrayItem(prev, id))
	}

	const clearSelection = () => setSelectedIds([])

	const handleBulkDelete = async () => {
		const confirmed = await confirmDelete(
			'permissions',
			`${selectedIds.length} selected permissions`
		)
		if (!confirmed) return

		// Delete each selected permission
		for (const id of selectedIds) {
			const perm = permissions.find((p) => p.id === id)
			if (perm) {
				await deletePermission(perm)
			}
		}
		clearSelection()
	}

	// CRUD handlers
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

			{/* Stats Row (P1) */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
				<StatCard
					label="Total Permissions"
					value={permissions.length}
					icon={<Lock className="w-6 h-6" />}
					colorClass="text-primary"
					isLoading={isLoading}
				/>
				<StatCard
					label="Resource Types"
					value={resourceCount}
					icon={<Layers className="w-6 h-6" />}
					colorClass="text-secondary"
					isLoading={isLoading}
				/>
			</div>

			{/* Search Bar (P0) - Using DRY Input component */}
			<div className="mb-6">
				<Input
					type="text"
					placeholder="Search by resource, action, context, or description..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					leftIcon={<Search />}
					helperText={searchTerm ? `${filteredPermissions.length} of ${permissions.length} permissions` : undefined}
					data-testid="search-input"
					aria-label="Search permissions"
				/>
			</div>

			{/* Bulk Action Bar (P1) */}
			{selectedIds.length > 0 && (
				<PermissionBulkBar
					selectedCount={selectedIds.length}
					onDelete={handleBulkDelete}
					onClearSelection={clearSelection}
				/>
			)}

			{/* Content */}
			{isLoading ? (
				<LoadingState message="Loading permissions..." />
			) : Object.keys(groupedPermissions).length === 0 ? (
				<EmptyState
					icon={<Lock className="w-16 h-16" />}
					title={searchTerm ? 'No permissions found' : 'No permissions yet'}
					description={
						searchTerm
							? `No permissions match "${searchTerm}". Try a different search term.`
							: 'Create your first permission to get started with RBAC configuration.'
					}
					action={
						searchTerm
							? {
									label: 'Clear search',
									onClick: () => setSearchTerm(''),
								}
							: {
									label: 'Create Permission',
									onClick: handleCreate,
								}
					}
				/>
			) : (
				<div className="space-y-6">
					{Object.entries(groupedPermissions).map(([resource, perms]) => (
						<PermissionGroup
							key={resource}
							resource={resource}
							permissions={perms}
							selectedIds={selectedIds}
							onToggleSelection={toggleSelection}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			{/* Modal */}
			<PermissionFormModal
				isOpen={showCreateModal}
				onClose={() => {
					setShowCreateModal(false)
					setEditingPermission(null)
				}}
				onSave={handleSave}
				permission={editingPermission}
				isSaving={isSaving}
				existingPermissions={permissions}
			/>
		</>
	)
}
