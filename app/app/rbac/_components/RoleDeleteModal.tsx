'use client'

/**
 * RoleDeleteModal Component
 *
 * Modal for deleting roles with user migration support.
 * Follows AWS IAM DeleteConflict pattern - if users are assigned,
 * deletion is blocked and user must migrate users first.
 *
 * State Machine:
 * - 'idle': Initial state
 * - 'checking': Attempting delete to check for users
 * - 'migrate': Users found, show migration UI
 * - 'migrating': Migrating users to new role
 * - 'deleting': Retrying delete after migration
 * - 'success': Role deleted successfully
 *
 * @see https://docs.aws.amazon.com/IAM/latest/APIReference/API_DeleteRole.html
 * @see PLAN_ROLE_DELETE_WITH_MIGRATION.md
 * @module app/rbac/_components/RoleDeleteModal
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	AlertTriangle,
	Trash2,
	Users,
	ArrowRight,
	Check,
	Loader2,
	X,
	Shield,
} from 'lucide-react'

import type { Role, RoleDeleteResult } from '@_shared/services/api'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

// =========================================================================
// TYPES
// =========================================================================

type DeleteModalState = 'idle' | 'checking' | 'migrate' | 'migrating' | 'deleting' | 'success'

interface RoleDeleteModalProps {
	isOpen: boolean
	onClose: () => void
	role: Role | null
	roles: Role[]
	onDelete: (roleId: number) => Promise<RoleDeleteResult | null>
	onMigrateUsers: (fromRoleLevel: number, toRoleLevel: number) => Promise<boolean>
}

// =========================================================================
// COMPONENT
// =========================================================================

export function RoleDeleteModal({
	isOpen,
	onClose,
	role,
	roles,
	onDelete,
	onMigrateUsers,
}: RoleDeleteModalProps) {
	const [state, setState] = useState<DeleteModalState>('idle')
	const [deleteResult, setDeleteResult] = useState<RoleDeleteResult | null>(null)
	const [targetRoleLevel, setTargetRoleLevel] = useState<number | null>(null)
	const [error, setError] = useState<string | null>(null)

	// Available target roles (excluding the role being deleted and system roles)
	const availableTargetRoles = roles.filter(
		(r) => role && r.id !== role.id && r.level !== role.level
	)

	// Reset state when modal opens/closes or role changes
	useEffect(() => {
		if (isOpen && role) {
			setState('idle')
			setDeleteResult(null)
			setTargetRoleLevel(null)
			setError(null)
		}
	}, [isOpen, role])

	// Auto-close after success
	useEffect(() => {
		if (state === 'success') {
			const timer = setTimeout(() => {
				onClose()
			}, 2000)
			return () => clearTimeout(timer)
		}
	}, [state, onClose])

	// Handle initial delete attempt
	const handleDelete = async () => {
		if (!role) return

		setState('checking')
		setError(null)

		const result = await onDelete(role.id)

		if (!result) {
			setError('Failed to delete role. Please try again.')
			setState('idle')
			return
		}

		setDeleteResult(result)

		if (result.deleted) {
			setState('success')
		} else if (result.blockedByUsers) {
			setState('migrate')
		} else {
			setError(result.message || 'Failed to delete role')
			setState('idle')
		}
	}

	// Handle user migration then delete
	const handleMigrateAndDelete = async () => {
		if (!role || targetRoleLevel === null) return

		setState('migrating')
		setError(null)

		const migrationSuccess = await onMigrateUsers(role.level, targetRoleLevel)

		if (!migrationSuccess) {
			setError('Failed to migrate users. Please try again.')
			setState('migrate')
			return
		}

		// Now retry delete
		setState('deleting')

		const result = await onDelete(role.id)

		if (!result) {
			setError('Failed to delete role after migration. Please try again.')
			setState('migrate')
			return
		}

		if (result.deleted) {
			setDeleteResult(result)
			setState('success')
		} else {
			setError(result.message || 'Failed to delete role after migration')
			setState('migrate')
		}
	}

	// Handle close
	const handleClose = () => {
		if (state !== 'checking' && state !== 'migrating' && state !== 'deleting') {
			onClose()
		}
	}

	if (!role) return null

	const isProcessing = state === 'checking' || state === 'migrating' || state === 'deleting'

	return (
		<Modal isOpen={isOpen} onClose={handleClose}>
			<div className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
							state === 'success' ? 'bg-success/10' : 'bg-error/10'
						}`}>
							{state === 'success' ? (
								<Check className="h-5 w-5 text-success" />
							) : (
								<Trash2 className="h-5 w-5 text-error" />
							)}
						</div>
						<div>
							<h2 className="text-lg font-semibold text-base-content">
								{state === 'success' ? 'Role Deleted' : 'Delete Role'}
							</h2>
							<p className="text-sm text-base-content/60">{role.displayName}</p>
						</div>
					</div>
					{!isProcessing && state !== 'success' && (
						<button
							onClick={handleClose}
							className="rounded-lg p-2 hover:bg-base-200 transition-colors"
						>
							<X className="h-5 w-5 text-base-content/60" />
						</button>
					)}
				</div>

				{/* Content based on state */}
				<AnimatePresence mode="wait">
					{/* Idle / Checking State - Initial confirmation */}
					{(state === 'idle' || state === 'checking') && (
						<motion.div
							key="idle"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
						>
							<div className="mb-6 rounded-lg bg-warning/10 p-4">
								<div className="flex items-start gap-3">
									<AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning" />
									<div>
										<p className="font-medium text-warning">Are you sure?</p>
										<p className="text-sm text-warning/80">
											This will permanently delete the role &quot;{role.displayName}&quot;.
											This action cannot be undone.
										</p>
									</div>
								</div>
							</div>

							{error && (
								<div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
									{error}
								</div>
							)}

							<div className="flex justify-end gap-3">
								<Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
									Cancel
								</Button>
								<Button
									variant="error"
									onClick={handleDelete}
									disabled={isProcessing}
								>
									{state === 'checking' ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Checking...
										</>
									) : (
										<>
											<Trash2 className="h-4 w-4" />
											Delete Role
										</>
									)}
								</Button>
							</div>
						</motion.div>
					)}

					{/* Migrate State - Users need to be migrated */}
					{(state === 'migrate' || state === 'migrating' || state === 'deleting') && deleteResult?.blockedByUsers && (
						<motion.div
							key="migrate"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
						>
							{/* Warning banner */}
							<div className="mb-4 rounded-lg bg-warning/10 p-4">
								<div className="flex items-start gap-3">
									<Users className="h-5 w-5 flex-shrink-0 text-warning" />
									<div>
										<p className="font-medium text-warning">
											{deleteResult.assignedUserCount} user{deleteResult.assignedUserCount !== 1 ? 's' : ''} assigned
										</p>
										<p className="text-sm text-warning/80">
											You must migrate these users to another role before deleting.
										</p>
									</div>
								</div>
							</div>

							{/* Target role selection */}
							<div className="mb-4">
								<label className="mb-2 block text-sm font-medium text-base-content">
									Migrate users to:
								</label>
								<div className="grid gap-2">
									{availableTargetRoles.length === 0 ? (
										<p className="text-sm text-base-content/60">
											No other roles available. Create a new role first.
										</p>
									) : (
										availableTargetRoles.map((targetRole) => (
											<button
												key={targetRole.id}
												onClick={() => setTargetRoleLevel(targetRole.level)}
												disabled={isProcessing}
												className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
													targetRoleLevel === targetRole.level
														? 'border-primary bg-primary/5'
														: 'border-base-300 hover:border-base-content/30'
												} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
											>
												<Shield
													className={`h-4 w-4 ${
														targetRoleLevel === targetRole.level
															? 'text-primary'
															: 'text-base-content/40'
													}`}
												/>
												<div className="flex-1">
													<span className="text-sm font-medium">{targetRole.displayName}</span>
													<span className="ml-2 text-xs text-base-content/50">
														Level {targetRole.level}
													</span>
												</div>
												{targetRoleLevel === targetRole.level && (
													<Check className="h-4 w-4 text-primary" />
												)}
											</button>
										))
									)}
								</div>
							</div>

							{/* Migration info */}
							{targetRoleLevel !== null && (
								<div className="mb-4 flex items-center gap-2 text-sm text-base-content/60">
									<span>{deleteResult.assignedUserCount} users</span>
									<ArrowRight className="h-4 w-4" />
									<span className="font-medium text-base-content">
										{availableTargetRoles.find((r) => r.level === targetRoleLevel)?.displayName}
									</span>
								</div>
							)}

							{error && (
								<div className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
									{error}
								</div>
							)}

							<div className="flex justify-end gap-3">
								<Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
									Cancel
								</Button>
								<Button
									variant="error"
									onClick={handleMigrateAndDelete}
									disabled={targetRoleLevel === null || isProcessing || availableTargetRoles.length === 0}
								>
									{state === 'migrating' ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Migrating...
										</>
									) : state === 'deleting' ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Deleting...
										</>
									) : (
										<>
											<ArrowRight className="h-4 w-4" />
											Migrate &amp; Delete
										</>
									)}
								</Button>
							</div>
						</motion.div>
					)}

					{/* Success State */}
					{state === 'success' && (
						<motion.div
							key="success"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
							className="text-center py-4"
						>
							<div className="mb-4 flex justify-center">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
									<Check className="h-8 w-8 text-success" />
								</div>
							</div>
							<p className="text-lg font-medium text-base-content">
								Role deleted successfully
							</p>
							<p className="text-sm text-base-content/60">
								Closing automatically...
							</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</Modal>
	)
}

export default RoleDeleteModal
