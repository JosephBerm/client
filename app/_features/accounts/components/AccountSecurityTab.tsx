/**
 * AccountSecurityTab Component
 * 
 * Security tab content for the account detail page.
 * Contains password management and security settings.
 * 
 * **Features:**
 * - Password change form (with old password)
 * - Admin password reset (without old password) 
 * - Security information display
 * - Last login tracking
 * - Account status display
 * - Future: 2FA settings
 * - Future: Active sessions management
 * 
 * **MAANG-Level Improvements:**
 * - Uses accountStatus prop instead of hardcoded value
 * - Shows last login timestamp
 * - Admin can reset password without knowing old password
 * - Send password reset email option
 * - Force logout option
 * 
 * @module features/accounts/components/AccountSecurityTab
 */

'use client'

import { useState } from 'react'

import { Shield, Key, AlertCircle, Mail, LogOut, RefreshCw, KeyRound } from 'lucide-react'

import type { AccountInfo } from '@_types'
import { toAccountInfo } from '@_types'

import { logger } from '@_core'

import { notificationService, API } from '@_shared'

import { AccountStatus } from '@_classes/Enums'
import type User from '@_classes/User'

import AccountStatusBadge from '@_components/common/AccountStatusBadge'
import ChangePasswordForm from '@_components/forms/ChangePasswordForm'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import PasswordResetModal from './PasswordResetModal'

// ============================================================================
// TYPES
// ============================================================================

export interface AccountSecurityTabProps {
	/** Account being viewed/edited */
	account: User
	/** Whether current user is admin */
	isCurrentUserAdmin: boolean
	/** Whether current user can change password for this account */
	canChangePassword: boolean
	/** Current account status */
	accountStatus?: AccountStatus
	/** Handler for sending password reset email */
	onSendPasswordReset?: () => Promise<void>
	/** Handler for forcing logout */
	onForceLogout?: () => Promise<void>
	/** Whether password reset is in progress */
	isSendingReset?: boolean
	/** Callback after admin password reset (to refresh data) */
	onPasswordResetSuccess?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Get status display configuration
 */
function getStatusDisplay(status: AccountStatus) {
	switch (status) {
		case AccountStatus.Active:
			return { label: 'Active', color: 'text-success', bg: 'bg-success' }
		case AccountStatus.Suspended:
			return { label: 'Suspended', color: 'text-error', bg: 'bg-error' }
		case AccountStatus.Locked:
			return { label: 'Locked', color: 'text-error', bg: 'bg-error' }
		case AccountStatus.ForcePasswordChange:
			return { label: 'Password Required', color: 'text-warning', bg: 'bg-warning' }
		case AccountStatus.PendingVerification:
			return { label: 'Pending', color: 'text-info', bg: 'bg-info' }
		case AccountStatus.Archived:
			return { label: 'Archived', color: 'text-neutral', bg: 'bg-neutral' }
		default:
			return { label: 'Unknown', color: 'text-base-content/50', bg: 'bg-base-300' }
	}
}

/**
 * AccountSecurityTab Component
 * 
 * Renders the security section of the account detail page.
 * Provides password management and security overview.
 */
export default function AccountSecurityTab({
	account,
	isCurrentUserAdmin,
	canChangePassword,
	accountStatus = AccountStatus.Active,
	onSendPasswordReset,
	onForceLogout,
	isSendingReset = false,
	onPasswordResetSuccess,
}: AccountSecurityTabProps) {
	const statusDisplay = getStatusDisplay(accountStatus)
	
	// Admin password reset modal state
	const [isResetModalOpen, setIsResetModalOpen] = useState(false)
	
	// Convert User to AccountInfo for the modal
	const accountInfo = toAccountInfo(account)
	
	// Handle admin password reset success
	const handleResetSuccess = () => {
		setIsResetModalOpen(false)
		onPasswordResetSuccess?.()
	}

	return (
		<>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				{/* Main Content - Password Change */}
				<div className="space-y-6">
					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-6">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Key className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-base-content">Change Password</h2>
								<p className="text-sm text-base-content/60">
									Update the password for this account
								</p>
							</div>
						</div>

						{canChangePassword ? (
							<ChangePasswordForm user={account} />
						) : (
							<div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
								<AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-warning">
										Password Change Not Available
									</p>
									<p className="text-sm text-base-content/70 mt-1">
										{isCurrentUserAdmin
											? 'Use the "Reset Password" button below to set a new password without the old one.'
											: 'You do not have permission to change this password.'}
									</p>
								</div>
							</div>
						)}
					</Card>

					{/* Admin Security Actions */}
					{isCurrentUserAdmin && (
						<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
							<div className="flex items-center gap-3 mb-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
									<RefreshCw className="h-5 w-5 text-warning" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-base-content">Admin Actions</h2>
									<p className="text-sm text-base-content/60">
										Administrative security actions for this account
									</p>
								</div>
							</div>

							<div className="space-y-3">
								{/* Admin Password Reset - Always show for admins viewing other accounts */}
								<Button
									variant="primary"
									size="sm"
									onClick={() => setIsResetModalOpen(true)}
									leftIcon={<KeyRound className="h-4 w-4" />}
									className="w-full justify-start"
								>
									Reset Password
								</Button>
								
								{onSendPasswordReset && (
									<Button
										variant="secondary"
										size="sm"
										onClick={() => void onSendPasswordReset()}
										loading={isSendingReset}
										disabled={isSendingReset}
										leftIcon={<Mail className="h-4 w-4" />}
										className="w-full justify-start"
									>
										Send Password Reset Email
									</Button>
								)}
								
								{onForceLogout && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => void onForceLogout()}
										leftIcon={<LogOut className="h-4 w-4" />}
										className="w-full justify-start text-error hover:bg-error/10"
									>
										Force Logout All Sessions
									</Button>
								)}
							</div>
						</Card>
					)}
				</div>

			{/* Sidebar - Security Info */}
			<div className="space-y-4">
				{/* Security Overview Card */}
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="flex items-center gap-3 mb-4">
						<Shield className="h-5 w-5 text-success" />
						<h2 className="text-lg font-semibold text-base-content">Security Status</h2>
					</div>
					<div className="space-y-4">
						{/* Password Status */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-base-content/70">Password</span>
							<span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
								<span className="h-2 w-2 rounded-full bg-success" />
								Set
							</span>
						</div>
						
						{/* 2FA Status (Coming Soon) */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-base-content/70">Two-Factor Auth</span>
							<span className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/50">
								<span className="h-2 w-2 rounded-full bg-base-300" />
								Coming Soon
							</span>
						</div>
						
						{/* Account Status - Now using prop */}
						<div className="flex items-center justify-between">
							<span className="text-sm text-base-content/70">Account Status</span>
							<AccountStatusBadge status={accountStatus} size="sm" />
						</div>
					</div>
				</Card>

				{/* Last Activity Card - Phase 1 Enhanced */}
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-base-content mb-4">Recent Activity</h2>
					<div className="space-y-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-base-content/70">Account Created</span>
							<span className="text-base-content font-medium">
								{account.createdAt 
									? new Date(account.createdAt).toLocaleDateString()
									: 'Unknown'}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-base-content/70">Last Login</span>
							<span className="text-base-content font-medium">
								{account.lastLoginAt
									? new Date(account.lastLoginAt).toLocaleString()
									: 'Never'}
							</span>
						</div>
						{account.lastLoginIP && (
							<div className="flex items-center justify-between">
								<span className="text-base-content/70">Last Login IP</span>
								<span className="text-base-content/50 text-xs font-mono">
									{account.lastLoginIP}
								</span>
							</div>
						)}
						{account.failedLoginAttempts > 0 && (
							<div className="flex items-center justify-between">
								<span className="text-base-content/70">Failed Attempts</span>
								<span className="text-warning font-medium">
									{account.failedLoginAttempts} / 5
								</span>
							</div>
						)}
						{account.lockedUntil && new Date(account.lockedUntil) > new Date() && (
							<div className="flex flex-col gap-1">
								<span className="text-base-content/70">Locked Until</span>
								<span className="text-error text-xs font-medium">
									{new Date(account.lockedUntil).toLocaleString()}
								</span>
							</div>
						)}
					</div>
				</Card>

				{/* Security Tips Card */}
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-base-content mb-4">Security Tips</h2>
					<ul className="space-y-3 text-sm text-base-content/70">
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Use a strong, unique password with at least 8 characters</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Include uppercase, lowercase, numbers, and special characters</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Never share your password with others</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-primary mt-1">•</span>
							<span>Change your password regularly (every 90 days recommended)</span>
						</li>
					</ul>
				</Card>
			</div>
		</div>
		
		{/* Admin Password Reset Modal */}
		{isCurrentUserAdmin && accountInfo && (
			<PasswordResetModal
				isOpen={isResetModalOpen}
				account={accountInfo}
				onClose={() => setIsResetModalOpen(false)}
				onSuccess={handleResetSuccess}
			/>
		)}
		</>
	)
}
