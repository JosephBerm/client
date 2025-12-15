'use client'

/**
 * Permission Form Modal Component
 * 
 * Modal for creating and editing permissions.
 * 
 * @module RBAC PermissionFormModal
 */

import { useState, useEffect } from 'react'
import { Resources, Actions, Contexts } from '@_shared'
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@_shared/services/api'
import Modal from '@_components/ui/Modal'
import Select from '@_components/ui/Select'
import Textarea from '@_components/ui/Textarea'
import FormFooter from './FormFooter'

interface PermissionFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (request: CreatePermissionRequest | UpdatePermissionRequest) => Promise<void>
	permission?: Permission | null
	isSaving: boolean
}

interface PermissionFormData {
	resource: string
	action: string
	context: string
	description: string
}

const DEFAULT_PERMISSION_FORM_DATA: PermissionFormData = {
	resource: '',
	action: '',
	context: '',
	description: '',
}

export default function PermissionFormModal({
	isOpen,
	onClose,
	onSave,
	permission,
	isSaving,
}: PermissionFormModalProps) {
	const [formData, setFormData] = useState<PermissionFormData>(DEFAULT_PERMISSION_FORM_DATA)

	// Reset form when modal opens/closes or permission changes
	useEffect(() => {
		if (isOpen) {
			if (permission) {
				setFormData({
					resource: permission.resource,
					action: permission.action,
					context: permission.context || '',
					description: permission.description || '',
				})
			} else {
				setFormData(DEFAULT_PERMISSION_FORM_DATA)
			}
		}
	}, [isOpen, permission])

	const handleSave = async () => {
		if (!formData.resource || !formData.action) {
			return
		}

		const request: CreatePermissionRequest | UpdatePermissionRequest = {
			resource: formData.resource,
			action: formData.action,
			context: formData.context || undefined,
			description: formData.description || undefined,
		}

		await onSave(request)
	}

	const modalTitle = permission ? 'Edit Permission' : 'Create Permission'

	// React 19 Compiler handles memoization automatically
	const resources = Object.values(Resources)
	const actions = Object.values(Actions)
	const contexts = ['', ...Object.values(Contexts)]

	const resourceOptions = [
		{ value: '', label: 'Select resource...' },
		...resources.map((resource) => ({ value: resource, label: resource })),
	]

	const actionOptions = [
		{ value: '', label: 'Select action...' },
		...actions.map((action) => ({ value: action, label: action })),
	]

	const contextOptions = [
		{ value: '', label: 'No context' },
		...contexts.filter(c => c).map((context) => ({ value: context, label: context })),
	]

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={modalTitle}
		>
			<div className="space-y-4">
				<div>
					<label className="label">
						<span className="label-text">Resource</span>
					</label>
					<Select
						value={formData.resource}
						onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
						options={resourceOptions}
						required
					/>
				</div>
				<div>
					<label className="label">
						<span className="label-text">Action</span>
					</label>
					<Select
						value={formData.action}
						onChange={(e) => setFormData({ ...formData, action: e.target.value })}
						options={actionOptions}
						required
					/>
				</div>
				<div>
					<label className="label">
						<span className="label-text">Context (Optional)</span>
					</label>
					<Select
						value={formData.context}
						onChange={(e) => setFormData({ ...formData, context: e.target.value })}
						options={contextOptions}
					/>
				</div>
				<Textarea
					label="Description"
					value={formData.description}
					onChange={(e) => setFormData({ ...formData, description: e.target.value })}
					placeholder="Permission description..."
					rows={3}
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
