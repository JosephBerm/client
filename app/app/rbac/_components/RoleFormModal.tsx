'use client'

/**
 * Role Form Modal Component
 *
 * Modal for creating and editing roles.
 *
 * System Role Handling (AWS/Google IAM Pattern):
 * - When CREATING: "System Role" option is hidden (system roles are platform-seeded)
 * - When EDITING a SYSTEM role: Shows read-only "System Role" badge, fields are locked
 * - When EDITING a NON-system role: Normal editing, no system role option
 *
 * Industry References:
 * - AWS IAM: "AWS managed" roles cannot be modified by customers
 * - Google Cloud IAM: Predefined roles are read-only
 * - Microsoft Entra ID: Built-in roles show "Built-in" badge and are non-editable
 *
 * @module RBAC RoleFormModal
 */

import { useState, useEffect } from 'react'
import { Shield, Lock, AlertTriangle } from 'lucide-react'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@_shared/services/api'
import Modal from '@_components/ui/Modal'
import Input from '@_components/ui/Input'
import Textarea from '@_components/ui/Textarea'
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
}

const DEFAULT_ROLE_FORM_DATA: RoleFormData = {
	name: '',
	displayName: '',
	level: 0,
	description: '',
}

export default function RoleFormModal({
	isOpen,
	onClose,
	onSave,
	role,
	isSaving,
}: RoleFormModalProps) {
	const [formData, setFormData] = useState<RoleFormData>(DEFAULT_ROLE_FORM_DATA)

	// Determine if this is a system role (read-only mode)
	const isSystemRole = role?.isSystemRole ?? false
	const isEditing = !!role

	// Reset form when modal opens/closes or role changes
	useEffect(() => {
		if (isOpen) {
			if (role) {
				setFormData({
					name: role.name,
					displayName: role.displayName,
					level: role.level,
					description: role.description || '',
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

		// System roles preserve their isSystemRole status
		// New roles are always non-system (isSystemRole: false)
		const request: CreateRoleRequest | UpdateRoleRequest = {
			name: formData.name,
			displayName: formData.displayName,
			level: formData.level,
			description: formData.description || undefined,
			isSystemRole: isEditing ? role!.isSystemRole : false,
		}

		await onSave(request)
	}

	const modalTitle = isEditing ? 'Edit Role' : 'Create Role'

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={modalTitle}
		>
			<div className="space-y-4">
				{/* System Role Banner - Read-only warning */}
				{isSystemRole && (
					<div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
						<div className="flex items-start gap-3">
							<Shield className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
							<div>
								<div className="flex items-center gap-2 mb-1">
									<span className="font-semibold text-warning">System Role</span>
									<span className="px-2 py-0.5 rounded text-xs bg-warning/20 text-warning">
										Protected
									</span>
								</div>
								<p className="text-sm text-warning/80">
									This is a platform-managed role. Only the display name and description can be modified.
									The role name and level are locked for system stability.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Name Field */}
				<div>
					<label className="label">
						<span className="label-text flex items-center gap-2">
							Name
							{isSystemRole && <Lock className="h-3 w-3 text-base-content/40" />}
						</span>
					</label>
					<Input
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						placeholder="customer"
						required
						disabled={isSystemRole}
						className={isSystemRole ? 'opacity-60 cursor-not-allowed' : ''}
					/>
					{!isEditing && (
						<p className="text-xs text-base-content/50 mt-1">
							Internal identifier (lowercase, no spaces). Cannot be changed after creation.
						</p>
					)}
				</div>

				{/* Display Name Field */}
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
					<p className="text-xs text-base-content/50 mt-1">
						Human-readable name shown in the UI.
					</p>
				</div>

				{/* Level Field */}
				<div>
					<label className="label">
						<span className="label-text flex items-center gap-2">
							Level
							{isSystemRole && <Lock className="h-3 w-3 text-base-content/40" />}
						</span>
					</label>
					<Input
						type="number"
						value={formData.level}
						onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
						placeholder="1000"
						required
						disabled={isSystemRole}
						className={isSystemRole ? 'opacity-60 cursor-not-allowed' : ''}
					/>
					<p className="text-xs text-base-content/50 mt-1">
						Higher levels have more access. Common levels: 1000 (Customer), 3000 (Sales), 5000 (Admin).
					</p>
				</div>

				{/* Description Field */}
				<Textarea
					label="Description"
					value={formData.description}
					onChange={(e) => setFormData({ ...formData, description: e.target.value })}
					placeholder="Role description..."
					rows={3}
				/>

				{/* Level Warning for New Roles */}
				{!isEditing && formData.level >= 5000 && (
					<div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
						<div className="flex items-start gap-2">
							<AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
							<p className="text-sm text-warning/80">
								Level 5000+ grants administrative access. Ensure this is intended.
							</p>
						</div>
					</div>
				)}

				<FormFooter
					onCancel={onClose}
					onSave={handleSave}
					isSaving={isSaving}
				/>
			</div>
		</Modal>
	)
}
