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

import { AccountRole } from '@_classes/Enums'

import { RoleBadge } from '@_components/common'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

import type { AccountInfo } from '@_types'

import { UserInfoDisplay } from '@_features/accounts'

import { ROLE_OPTIONS } from '@_shared'

import RoleSelector from './RoleSelector'

// ============================================================================
// TYPES (Re-export for backwards compatibility)
// ============================================================================

/** @deprecated Use AccountInfo from @_types instead */
export type Account = AccountInfo

export interface RoleChangeModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Account to change role for (null when closed) */
	account: Account | null
	/** Currently selected role */
	selectedRole: AccountRole | null
	/** Whether role update is in progress */
	isLoading: boolean
	/** Close the modal */
	onClose: () => void
	/** Update the selected role */
	onSelectRole: (role: AccountRole | null) => void
	/** Confirm the role change */
	onConfirm: () => void
}

/**
 * Warning message based on role change type
 */
function RoleChangeWarning({ 
	account, 
	selectedRole 
}: { 
	account: Account
	selectedRole: AccountRole 
}) {
	const isUpgrade = selectedRole > account.role
	const isAdmin = selectedRole === AccountRole.Admin

	const message = isAdmin
		? 'You are granting full system access to this user.'
		: isUpgrade
			? 'This user will gain additional permissions.'
			: 'This user will lose some permissions.'

	return (
		<div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
			<AlertTriangle className="w-5 h-5 text-warning shrink-0" />
			<p className="text-sm text-base-content/80">{message}</p>
		</div>
	)
}

/**
 * Side-by-side role comparison
 */
function RoleComparison({ 
	currentRole, 
	newRole 
}: { 
	currentRole: number
	newRole: number 
}) {
	return (
		<div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-base-200">
			<div>
				<span className="text-xs text-base-content/50 uppercase tracking-wide">
					Current Role
				</span>
				<div className="mt-1">
					<RoleBadge role={currentRole} />
				</div>
			</div>
			<div>
				<span className="text-xs text-base-content/50 uppercase tracking-wide">
					New Role
				</span>
				<div className="mt-1">
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
	const isConfirmStep = selectedRole !== null && selectedRole !== account?.role

	// Get the confirm button text
	const confirmButtonText = selectedRole === AccountRole.Admin 
		? 'Grant Admin Access' 
		: 'Confirm Change'

	// Get the role label for messages
	const getRoleLabel = (role: AccountRole) => 
		ROLE_OPTIONS.find(r => r.value === role)?.label ?? 'Unknown'

	if (!account) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isConfirmStep ? 'Confirm Role Change' : 'Change User Role'}
			size="md"
		>
			{isConfirmStep ? (
				// STEP 2: Confirmation
				<div className="space-y-4">
					<RoleChangeWarning account={account} selectedRole={selectedRole} />
					
					<RoleComparison 
						currentRole={account.role} 
						newRole={selectedRole} 
					/>

					<p className="text-sm text-base-content/70">
						User <strong>{account.username}</strong> ({account.email}) will be 
						updated to <strong>{getRoleLabel(selectedRole)}</strong>.
						This change takes effect immediately.
					</p>

					<div className="flex justify-end gap-3 pt-2">
						<Button 
							variant="ghost" 
							onClick={() => onSelectRole(null)}
							disabled={isLoading}
						>
							Back
						</Button>
						<Button 
							variant={selectedRole === AccountRole.Admin ? 'error' : 'primary'} 
							onClick={onConfirm}
							loading={isLoading}
						>
							{confirmButtonText}
						</Button>
					</div>
				</div>
			) : (
				// STEP 1: Role Selection
				<div className="space-y-4">
					<UserInfoDisplay account={account} headerText="Changing role for:" />

					<RoleSelector
						currentRole={account.role}
						selectedRole={selectedRole}
						onSelect={onSelectRole}
					/>

					<div className="flex justify-end gap-3 pt-2">
						<Button variant="ghost" onClick={onClose}>
							Cancel
						</Button>
					</div>
				</div>
			)}
		</Modal>
	)
}

