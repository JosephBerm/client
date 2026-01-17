/**
 * BulkRoleModal Component
 *
 * Modal for bulk updating user roles.
 * Allows admin to select multiple users and assign them a new role.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * With React Compiler (`reactCompiler: true`):
 * - No useCallback needed - compiler auto-memoizes event handlers
 * - Event handlers written as plain functions for cleaner code
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @see prd_rbac_management.md - US-RBAC-004
 * @module app/rbac/_components/BulkRoleModal
 */

'use client'

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Shield, Search, Check, AlertTriangle, Loader2 } from 'lucide-react'

import type { PagedResult } from '@_classes/Base/PagedResult'
import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'
import Modal from '@_components/ui/Modal'
import { getRoleSelectOptions } from '@_shared'
import type { UserWithRole, BulkRoleUpdateResult } from '@_types/rbac-management'

// =========================================================================
// TYPES
// =========================================================================

interface BulkRoleModalProps {
	isOpen: boolean
	onClose: () => void
	users: PagedResult<UserWithRole> | null
	isLoadingUsers: boolean
	onBulkUpdate: (userIds: number[], newRole: number, reason?: string) => Promise<BulkRoleUpdateResult | null>
	onLoadUsers: () => void
}

// =========================================================================
// ROLE OPTIONS
// DRY: Uses centralized getRoleSelectOptions() from @_shared
// =========================================================================

const ROLE_OPTIONS = getRoleSelectOptions()

// =========================================================================
// COMPONENT
// =========================================================================

export function BulkRoleModal({
	isOpen,
	onClose,
	users,
	isLoadingUsers,
	onBulkUpdate,
	onLoadUsers,
}: BulkRoleModalProps) {
	const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
	const [newRole, setNewRole] = useState<number | null>(null)
	const [reason, setReason] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [result, setResult] = useState<BulkRoleUpdateResult | null>(null)

	// ---------------------------------------------------------------------------
	// DERIVED STATE
	// React Compiler optimizes these - no useMemo needed for simple filtering
	// ---------------------------------------------------------------------------

	// Filter users by search term
	const filteredUsers = (users?.data || []).filter((user) => {
		if (!searchTerm) return true
		const term = searchTerm.toLowerCase()
		return (
			user.fullName.toLowerCase().includes(term) ||
			user.email.toLowerCase().includes(term) ||
			user.username.toLowerCase().includes(term)
		)
	})

	// ---------------------------------------------------------------------------
	// EVENT HANDLERS
	// React Compiler auto-memoizes these - no useCallback needed
	// ---------------------------------------------------------------------------

	// Toggle user selection
	const toggleUser = (userId: number) => {
		setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
	}

	// Select all visible users
	const selectAll = () => {
		const visibleIds = filteredUsers.map((u) => u.id)
		setSelectedUserIds((prev) => {
			const allSelected = visibleIds.every((id) => prev.includes(id))
			if (allSelected) {
				return prev.filter((id) => !visibleIds.includes(id))
			}
			return Array.from(new Set([...prev, ...visibleIds]))
		})
	}

	// Handle submit
	const handleSubmit = async () => {
		if (selectedUserIds.length === 0 || newRole === null) return

		setIsSubmitting(true)
		setResult(null)

		const updateResult = await onBulkUpdate(selectedUserIds, newRole, reason || undefined)

		setIsSubmitting(false)
		setResult(updateResult)

		if (updateResult && updateResult.failedCount === 0) {
			// Reset selection on success
			setSelectedUserIds([])
			setNewRole(null)
			setReason('')
		}
	}

	// Reset state on close
	const handleClose = () => {
		setSelectedUserIds([])
		setNewRole(null)
		setReason('')
		setSearchTerm('')
		setResult(null)
		onClose()
	}

	// Load users when modal opens
	useEffect(() => {
		if (isOpen && !users?.data?.length) {
			onLoadUsers()
		}
	}, [isOpen, users?.data?.length, onLoadUsers])

	// Check if all visible users are selected
	const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id))

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}>
			<div className='w-full max-w-3xl rounded-2xl bg-base-100 p-6 shadow-2xl'>
				{/* Header */}
				<div className='mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
							<Users className='h-5 w-5 text-primary' />
						</div>
						<div>
							<h2 className='text-lg font-semibold text-base-content'>Bulk Role Update</h2>
							<p className='text-sm text-base-content/60'>Select users and assign a new role</p>
						</div>
					</div>
					<Button
						onClick={handleClose}
						variant='ghost'
						size='sm'
						className='rounded-lg p-2 hover:bg-base-200 transition-colors h-auto'
						leftIcon={<X className='h-5 w-5 text-base-content/60' />}
						contentDrivenHeight
					/>
				</div>

				{/* Search */}
				<div className='relative mb-4'>
					<Input
						type='text'
						size='sm'
						placeholder='Search users...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						leftIcon={<Search className='h-4 w-4' />}
					/>
				</div>

				{/* Select all / Selection count */}
				<div className='mb-4 flex items-center justify-between'>
					<Button
						onClick={selectAll}
						variant='ghost'
						size='xs'
						className='text-sm text-primary hover:underline h-auto p-0'>
						{allVisibleSelected ? 'Deselect all' : 'Select all'}
					</Button>
					<span className='text-sm text-base-content/60'>
						{selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
					</span>
				</div>

				{/* User list */}
				<div className='mb-6 max-h-[300px] overflow-y-auto rounded-lg border border-base-300'>
					{isLoadingUsers ? (
						<div className='flex items-center justify-center py-12'>
							<Loader2 className='h-8 w-8 animate-spin text-primary' />
						</div>
					) : filteredUsers.length === 0 ? (
						<div className='py-12 text-center text-base-content/60'>
							{searchTerm ? 'No users match your search' : 'No users found'}
						</div>
					) : (
						<div className='divide-y divide-base-200'>
							{filteredUsers.map((user) => {
								const isSelected = selectedUserIds.includes(user.id)

								return (
									<motion.div
										key={user.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
											isSelected ? 'bg-primary/5' : 'hover:bg-base-200/50'
										}`}
										onClick={() => toggleUser(user.id)}>
										{/* Checkbox */}
										<div
											className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
												isSelected ? 'border-primary bg-primary text-white' : 'border-base-300'
											}`}>
											{isSelected && <Check className='h-3 w-3' />}
										</div>

										{/* User info */}
										<div className='flex-1'>
											<p className='font-medium text-base-content'>{user.fullName}</p>
											<p className='text-sm text-base-content/60'>{user.email}</p>
										</div>

										{/* Current role */}
										<span className='rounded-full bg-base-200 px-3 py-1 text-xs text-base-content/70'>
											{user.roleDisplayName}
										</span>
									</motion.div>
								)
							})}
						</div>
					)}
				</div>

				{/* Role selection */}
				<div className='mb-4'>
					<label className='mb-2 block text-sm font-medium text-base-content'>New Role</label>
					<div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
						{ROLE_OPTIONS.map((option) => (
							<Button
								key={option.value}
								onClick={() => setNewRole(option.value)}
								variant={newRole === option.value ? 'primary' : 'outline'}
								size='sm'
								className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all h-auto ${
									newRole === option.value
										? 'border-primary bg-primary/5'
										: 'border-base-300 hover:border-base-content/30'
								}`}
								leftIcon={
									<Shield
										className={`h-4 w-4 ${
											newRole === option.value ? 'text-primary' : 'text-base-content/40'
										}`}
									/>
								}
								contentDrivenHeight>
								<span className='text-sm font-medium'>{option.label}</span>
							</Button>
						))}
					</div>
				</div>

				{/* Reason */}
				<div className='mb-6'>
					<label className='mb-2 block text-sm font-medium text-base-content'>Reason (optional)</label>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder='Provide a reason for the role change...'
						rows={2}
						className='w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
					/>
				</div>

				{/* Result message */}
				<AnimatePresence>
					{result && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							className={`mb-4 rounded-lg p-4 ${
								result.failedCount > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
							}`}>
							<div className='flex items-start gap-3'>
								{result.failedCount > 0 ? (
									<AlertTriangle className='h-5 w-5 flex-shrink-0' />
								) : (
									<Check className='h-5 w-5 flex-shrink-0' />
								)}
								<div>
									<p className='font-medium'>
										{result.updatedCount > 0
											? `Updated ${result.updatedCount} user${result.updatedCount > 1 ? 's' : ''}`
											: 'No users were updated'}
									</p>
									{result.failedCount > 0 && (
										<>
											<p className='text-sm'>
												Failed to update {result.failedCount} user
												{result.failedCount > 1 ? 's' : ''}
											</p>
											{result.failures.length > 0 && (
												<ul className='mt-2 text-sm'>
													{result.failures.map((failure) => (
														<li key={failure.userId}>
															User #{failure.userId}: {failure.reason}
														</li>
													))}
												</ul>
											)}
										</>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Actions */}
				<div className='flex justify-end gap-3'>
					<Button
						variant='ghost'
						onClick={handleClose}>
						Cancel
					</Button>
					<Button
						variant='primary'
						onClick={handleSubmit}
						disabled={selectedUserIds.length === 0 || newRole === null || isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className='h-4 w-4 animate-spin' />
								Updating...
							</>
						) : (
							<>
								<Shield className='h-4 w-4' />
								Update {selectedUserIds.length} User{selectedUserIds.length !== 1 ? 's' : ''}
							</>
						)}
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default BulkRoleModal
