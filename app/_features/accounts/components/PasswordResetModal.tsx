'use client'

/**
 * PasswordResetModal Component
 * 
 * Admin-only modal for resetting user passwords without requiring old password.
 * Includes password strength validation and confirmation.
 * 
 * **Security:**
 * - Admin-only access (enforced by parent component)
 * - Password strength requirements (min 8 chars, upper, lower, number, special)
 * - Password confirmation must match
 * - No old password required (admin privilege)
 * 
 * **Used by:**
 * - AccountsDataGrid (accounts table)
 * - AccountSecurityTab (account detail page)
 * 
 * @module features/accounts/components/PasswordResetModal
 */

import { useState, useEffect } from 'react'

import { Eye, EyeOff, AlertTriangle, Key, Check, X } from 'lucide-react'

import { logger } from '@_core'

import { notificationService, API } from '@_shared'

import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'
import Modal from '@_components/ui/Modal'

import type { AccountInfo } from '@_types'

import UserInfoDisplay from './UserInfoDisplay'

// ============================================================================
// TYPES
// ============================================================================

export interface PasswordResetModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Account to reset password for (null when closed) */
	account: AccountInfo | null
	/** Close the modal */
	onClose: () => void
	/** Callback after successful password reset */
	onSuccess?: () => void
}

interface PasswordRequirement {
	label: string
	test: (password: string) => boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
	{ label: 'At least 8 characters', test: (p) => p.length >= 8 },
	{ label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
	{ label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
	{ label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
	{ label: 'One special character (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=[\]{}|;':",.<>/?`~]/.test(p) },
]

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Password requirement indicator
 */
function RequirementIndicator({ label, met }: { label: string; met: boolean }) {
	return (
		<div className="flex items-center gap-2 text-sm">
			{met ? (
				<Check className="w-4 h-4 text-success" />
			) : (
				<X className="w-4 h-4 text-base-content/30" />
			)}
			<span className={met ? 'text-success' : 'text-base-content/50'}>
				{label}
			</span>
		</div>
	)
}

/**
 * Password visibility toggle button
 */
function PasswordToggle({ 
	show, 
	onToggle 
}: { 
	show: boolean
	onToggle: () => void 
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={onToggle}
			className="h-8 w-8 p-0"
			aria-label={show ? 'Hide password' : 'Show password'}
		>
			{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
		</Button>
	)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * PasswordResetModal Component
 * 
 * Two-field form for admin password reset with validation feedback.
 */
export default function PasswordResetModal({
	isOpen,
	account,
	onClose,
	onSuccess,
}: PasswordResetModalProps) {
	// Form state
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setNewPassword('')
			setConfirmPassword('')
			setShowPassword(false)
			setShowConfirmPassword(false)
		}
	}, [isOpen])

	// Validation
	const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
	const allRequirementsMet = PASSWORD_REQUIREMENTS.every((req) => req.test(newPassword))
	const isFormValid = allRequirementsMet && passwordsMatch

	// Handle form submission
	const handleSubmit = async () => {
		if (!account || !isFormValid) {
			return
		}

		setIsSubmitting(true)
		try {
			const { data } = await API.Accounts.adminResetPassword(account.id, newPassword)

			if (data.statusCode === 200) {
				const successName = account.username !== account.email ? account.username : account.email
				notificationService.success(`Password reset for ${successName}`, {
					metadata: { accountId: account.id },
					component: 'PasswordResetModal',
					action: 'adminResetPassword',
				})
				onSuccess?.()
				onClose()
			} else {
				notificationService.error(data.message ?? 'Failed to reset password', {
					metadata: { accountId: account.id },
					component: 'PasswordResetModal',
					action: 'adminResetPassword',
				})
			}
		} catch (error) {
			logger.error('Admin password reset error', { error })
			notificationService.error('An error occurred while resetting the password', {
				metadata: { error, accountId: account?.id },
				component: 'PasswordResetModal',
				action: 'adminResetPassword',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!account) {
		return null
	}

	// Smart display name: use username if different from email, otherwise just email
	const displayName = account.username !== account.email 
		? account.username 
		: account.email

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Reset User Password"
			size="md"
		>
			<div className="space-y-4">
				{/* Warning Banner */}
				<div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
					<AlertTriangle className="w-5 h-5 text-warning shrink-0" />
					<p className="text-sm text-base-content/80">
						You are resetting the password for <strong>{displayName}</strong>.
						They will need to use this new password to log in.
					</p>
				</div>

				{/* User Info */}
				<UserInfoDisplay 
					account={account} 
					icon={<Key className="w-5 h-5 text-primary" />}
				/>

				{/* New Password Field */}
				<div>
					<label htmlFor="newPassword" className="block text-sm font-medium mb-1">
						New Password
					</label>
					<Input
						id="newPassword"
						type={showPassword ? 'text' : 'password'}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder="Enter new password"
						autoComplete="new-password"
						rightElement={
							<PasswordToggle 
								show={showPassword} 
								onToggle={() => setShowPassword(!showPassword)} 
							/>
						}
					/>
				</div>

				{/* Password Requirements */}
				<div className="p-3 rounded-lg bg-base-200 space-y-1.5">
					<p className="text-xs font-medium text-base-content/70 uppercase tracking-wide mb-2">
						Password Requirements
					</p>
					{PASSWORD_REQUIREMENTS.map((req) => (
						<RequirementIndicator
							key={req.label}
							label={req.label}
							met={req.test(newPassword)}
						/>
					))}
				</div>

				{/* Confirm Password Field */}
				<div>
					<label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
						Confirm Password
					</label>
					<Input
						id="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm new password"
						autoComplete="new-password"
						error={confirmPassword.length > 0 && !passwordsMatch}
						errorMessage="Passwords do not match"
						rightElement={
							<PasswordToggle 
								show={showConfirmPassword} 
								onToggle={() => setShowConfirmPassword(!showConfirmPassword)} 
							/>
						}
					/>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end gap-3 pt-2">
					<Button
						variant="ghost"
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={() => void handleSubmit()}
						loading={isSubmitting}
						disabled={!isFormValid}
					>
						Reset Password
					</Button>
				</div>
			</div>
		</Modal>
	)
}
