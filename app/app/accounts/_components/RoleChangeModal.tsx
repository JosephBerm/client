'use client'

/**
 * RoleChangeModal Component
 *
 * Two-step modal for changing user roles:
 * 1. Role selection with visual feedback
 * 2. Confirmation with warning messages
 *
 * Features:
 * - Visual role comparison
 * - Context-aware warning messages
 * - Admin grant warnings
 * - Loading states
 *
 * @module accounts/RoleChangeModal
 */

import { AlertTriangle } from 'lucide-react'

import { RoleBadge } from '@_components/common'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

import type { AccountInfo } from '@_types'

import { UserInfoDisplay } from '@_features/accounts'

import { getRoleDisplayName, RoleLevels } from '@_shared'

import RoleSelector from './RoleSelector'

// ============================================================================
// TYPES
// ============================================================================

export interface RoleChangeModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Account to change role for (null when closed) */
	account: AccountInfo | null
	/** Currently selected role */
	selectedRole: number | null
	/** Whether role update is in progress */
	isLoading: boolean
	/** Close the modal */
	onClose: () => void
	/** Update the selected role */
	onSelectRole: (role: number | null) => void
	/** Confirm the role change */
	onConfirm: () => void
}

/**
 * Warning message based on role change type
 */
function RoleChangeWarning({ account, selectedRole }: { account: AccountInfo; selectedRole: number }) {
	const isUpgrade = selectedRole > account.roleLevel
	const isAdmin = selectedRole === RoleLevels.Admin

	const message = isAdmin
		? 'You are granting full system access to this user.'
		: isUpgrade
		? 'This user will gain additional permissions.'
		: 'This user will lose some permissions.'

	return (
		<div className='flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20'>
			<AlertTriangle className='w-5 h-5 text-warning shrink-0' />
			<p className='text-sm text-base-content/80'>{message}</p>
		</div>
	)
}

/**
 * Side-by-side role comparison
 */
function RoleComparison({ currentRole, newRole }: { currentRole: number; newRole: number }) {
	return (
		<div className='grid grid-cols-2 gap-4 p-4 rounded-lg bg-base-200'>
			<div>
				<span className='text-xs text-base-content/50 uppercase tracking-wide'>Current Role</span>
				<div className='mt-1'>
					<RoleBadge role={currentRole} />
				</div>
			</div>
			<div>
				<span className='text-xs text-base-content/50 uppercase tracking-wide'>New Role</span>
				<div className='mt-1'>
					<RoleBadge role={newRole} />
				</div>
			</div>
		</div>
	)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * RoleChangeModal Component
 *
 * Handles the two-step role change flow:
 * - Step 1: Role selection
 * - Step 2: Confirmation with warnings
 */
export default function RoleChangeModal({
	isOpen,
	account,
	selectedRole,
	isLoading,
	onClose,
	onSelectRole,
	onConfirm,
}: RoleChangeModalProps) {
	// Determine if we're in confirmation step
	const isConfirmStep = selectedRole !== null && selectedRole !== account?.roleLevel

	// Get the confirm button text
	const confirmButtonText = selectedRole === RoleLevels.Admin ? 'Grant Admin Access' : 'Confirm Change'

	if (!account) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isConfirmStep ? 'Confirm Role Change' : 'Change User Role'}
			size='md'>
			{isConfirmStep ? (
				// STEP 2: Confirmation
				<div className='space-y-4'>
					<RoleChangeWarning
						account={account}
						selectedRole={selectedRole}
					/>

				<RoleComparison
					currentRole={account.roleLevel}
					newRole={selectedRole}
				/>

					<p className='text-sm text-base-content/70'>
						User <strong>{account.username}</strong> ({account.email}) will be updated to{' '}
						<strong>{getRoleDisplayName(selectedRole)}</strong>. This change takes effect immediately.
					</p>

					<div className='flex justify-end gap-3 pt-2'>
						<Button
							variant='ghost'
							onClick={() => onSelectRole(null)}
							disabled={isLoading}>
							Back
						</Button>
						<Button
							variant={selectedRole === RoleLevels.Admin ? 'error' : 'primary'}
							onClick={onConfirm}
							loading={isLoading}>
							{confirmButtonText}
						</Button>
					</div>
				</div>
			) : (
				// STEP 1: Role Selection
				<div className='space-y-4'>
					<UserInfoDisplay
						account={account}
						headerText='Changing role for:'
					/>

					<RoleSelector
						currentRole={account.roleLevel}
						selectedRole={selectedRole}
						onSelect={onSelectRole}
					/>

					<div className='flex justify-end gap-3 pt-2'>
						<Button
							variant='ghost'
							onClick={onClose}>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</Modal>
	)
}
