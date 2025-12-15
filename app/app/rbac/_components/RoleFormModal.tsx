'use client'

/**
 * Role Form Modal Component
 * 
 * Modal for creating and editing roles.
 * 
 * @module RBAC RoleFormModal
 */

import { useState, useEffect } from 'react'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@_shared/services/api'
import Modal from '@_components/ui/Modal'
import Input from '@_components/ui/Input'
import Textarea from '@_components/ui/Textarea'
import Checkbox from '@_components/ui/Checkbox'
import FormFooter from './FormFooter'

interface RoleFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (request: CreateRoleRequest | UpdateRoleRequest) => Promise<void>
	role?: Role | null
	isSaving: boolean
}

interface RoleFormData {
	name: string
	displayName: string
	level: number
	description: string
	isSystemRole: boolean
}

const DEFAULT_ROLE_FORM_DATA: RoleFormData = {
	name: '',
	displayName: '',
	level: 0,
	description: '',
	isSystemRole: false,
}

export default function RoleFormModal({
	isOpen,
	onClose,
	onSave,
	role,
	isSaving,
}: RoleFormModalProps) {
	const [formData, setFormData] = useState<RoleFormData>(DEFAULT_ROLE_FORM_DATA)

	// Reset form when modal opens/closes or role changes
	useEffect(() => {
		if (isOpen) {
			if (role) {
				setFormData({
					name: role.name,
					displayName: role.displayName,
					level: role.level,
					description: role.description || '',
					isSystemRole: role.isSystemRole,
				})
			} else {
				setFormData(DEFAULT_ROLE_FORM_DATA)
			}
		}
	}, [isOpen, role])

	// React 19 Compiler handles memoization automatically
	const handleSave = async () => {
		if (!formData.name || !formData.displayName) {
			return
		}

		const request: CreateRoleRequest | UpdateRoleRequest = {
			name: formData.name,
			displayName: formData.displayName,
			level: formData.level,
			description: formData.description || undefined,
			isSystemRole: formData.isSystemRole,
		}

		await onSave(request)
	}

	const modalTitle = role ? 'Edit Role' : 'Create Role'

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={modalTitle}
		>
		<div className="space-y-4">
			<div>
				<label className="label">
					<span className="label-text">Name</span>
				</label>
				<Input
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					placeholder="customer"
					required
				/>
			</div>
			<div>
				<label className="label">
					<span className="label-text">Display Name</span>
				</label>
				<Input
					value={formData.displayName}
					onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
					placeholder="Customer"
					required
				/>
			</div>
			<div>
				<label className="label">
					<span className="label-text">Level</span>
				</label>
				<Input
					type="number"
					value={formData.level}
					onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
					placeholder="0"
					required
				/>
			</div>
				<Textarea
					label="Description"
					value={formData.description}
					onChange={(e) => setFormData({ ...formData, description: e.target.value })}
					placeholder="Role description..."
					rows={3}
				/>
				<Checkbox
					label="System Role"
					checked={formData.isSystemRole}
					onChange={(e) => setFormData({ ...formData, isSystemRole: e.target.checked })}
				/>
				<FormFooter
					onCancel={onClose}
					onSave={handleSave}
					isSaving={isSaving}
				/>
			</div>
		</Modal>
	)
}
