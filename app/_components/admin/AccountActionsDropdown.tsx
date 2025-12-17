/**
 * AccountActionsDropdown Component
 * 
 * Admin-only dropdown menu for managing account status (Phase 1).
 * Context-aware actions based on current account status.
 * 
 * **Business Logic:**
 * - Shows relevant actions for current status
 * - Active → Suspend, Force Password Change, Archive
 * - Suspended → Activate, Archive
 * - Locked → Unlock, Activate
 * - Archived → Restore
 * - PendingVerification → Manually Verify
 * - ForcePasswordChange → Remove Requirement, Suspend
 * 
 * **UX Pattern:**
 * - Context menu with status-based actions
 * - Loading states during API calls
 * - Confirmation for destructive actions
 * - Success feedback via toasts
 * - Optimistic UI updates via callback
 * 
 * **MAANG Principle:**
 * - Context-aware actions (Google)
 * - Optimistic updates (Facebook)
 * - Clear feedback (Stripe)
 * - Confirmation for dangerous actions (GitHub)
 * 
 * @example
 * ```tsx
 * <AccountActionsDropdown
 *   account={user}
 *   onStatusChange={(accountId, newStatus) => {
 *     // Update local state optimistically
 *     setAccounts(prev =>
 *       prev.map(a => a.id === accountId ? { ...a, status: newStatus } : a)
 *     );
 *   }}
 * />
 * ```
 * 
 * @module AccountActionsDropdown
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { MoreVertical, CheckCircle, AlertTriangle, Archive, RotateCcw, Key, Unlock } from 'lucide-react'

import { AccountStatus } from '@_classes/Enums'

import Button from '@_components/ui/Button'
import ConfirmationModal from '@_components/ui/ConfirmationModal'
import SuspendAccountModal from '@_components/modals/SuspendAccountModal'

import type { AccountInfo } from '@_types'

import { API, notificationService } from '@_shared'
import { logger } from '@_core'

/**
 * Account with name support (for display purposes)
 */
interface AccountWithName extends AccountInfo {
	/** Optional name object for display */
	name?: {
		first?: string
		last?: string
	}
}

/**
 * Props for AccountActionsDropdown component
 */
interface AccountActionsDropdownProps {
	/** Account to perform actions on */
	account: AccountWithName
	/** Callback when account status changes (for optimistic UI updates) */
	onStatusChange?: (accountId: string, newStatus: AccountStatus) => void
}

/**
 * Action item configuration
 */
interface ActionItem {
	key: string
	label: string
	icon: typeof CheckCircle
	variant: 'default' | 'success' | 'warning' | 'error' | 'neutral'
	confirmMessage?: string
}

/**
 * AccountActionsDropdown Component
 * 
 * Displays context menu with available admin actions for the account.
 * Actions vary based on current account status.
 * 
 * **Features:**
 * - Status-aware action list
 * - Loading states
 * - Confirmation modals for dangerous actions
 * - Success/error notifications
 * - Optimistic UI updates
 * - Accessibility (keyboard navigation)
 * 
 * **Security:**
 * - Admin-only (parent should check permissions)
 * - API calls authenticated via backend
 * - Confirmation for destructive actions
 */
export default function AccountActionsDropdown({
	account,
	onStatusChange,
}: AccountActionsDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [showSuspendModal, setShowSuspendModal] = useState(false)
	const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	/**
	 * Close dropdown when clicking outside
	 */
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	/**
	 * Execute account action
	 */
	const handleAction = useCallback(
		async (action: string) => {
			if (!account.id) {
				notificationService.error('Account ID is required')
				return
			}

			const accountId = account.id

			setIsLoading(true)
			try {
				switch (action) {
					case 'activate':
						await API.Accounts.activate(accountId)
						onStatusChange?.(accountId, AccountStatus.Active)
						notificationService.success('Account activated successfully')
						break

					case 'suspend':
						// Show modal instead of executing directly
						setShowSuspendModal(true)
						setIsLoading(false)
						return

					case 'unlock':
						await API.Accounts.unlock(accountId)
						onStatusChange?.(accountId, AccountStatus.Active)
						notificationService.success('Account unlocked successfully')
						break

				case 'archive':
					// Show confirmation modal for archive action
					setShowArchiveConfirm(true)
					setIsLoading(false)
					setIsOpen(false)
					return

					case 'restore':
						await API.Accounts.restore(accountId)
						onStatusChange?.(accountId, AccountStatus.Active)
						notificationService.success('Account restored successfully')
						break

					case 'force_password':
						await API.Accounts.forcePasswordChange(accountId)
						// Status doesn't necessarily change to ForcePasswordChange (just sets flag)
						// But we can notify the parent if needed
						notificationService.success(
							'User will be required to change password on next login'
						)
						break

					default:
						logger.warn('Unknown action', { action, component: 'AccountActionsDropdown' })
				}

				logger.info('Account action executed', {
					component: 'AccountActionsDropdown',
					accountId,
					action,
				})
			} catch (error) {
				logger.error('Account action failed', {
					error,
					component: 'AccountActionsDropdown',
					accountId,
					action,
				})
				notificationService.error('Action failed. Please try again.')
			} finally {
				setIsLoading(false)
				setIsOpen(false)
			}
		},
		[account, onStatusChange]
	)

	/**
	 * Handle suspend confirmation from modal
	 */
	const handleSuspendConfirm = useCallback(
		async (reason: string) => {
			if (!account.id) return

			const accountId = account.id

			await API.Accounts.suspend(accountId, reason)
			onStatusChange?.(accountId, AccountStatus.Suspended)
			notificationService.success('Account suspended successfully')

			logger.info('Account suspended', {
				component: 'AccountActionsDropdown',
				accountId,
				reasonLength: reason.length,
			})
		},
		[account.id, onStatusChange]
	)

	/**
	 * Handle archive confirmation from modal
	 */
	const handleArchiveConfirm = useCallback(async () => {
		if (!account.id) return

		const accountId = account.id

		setIsLoading(true)
		try {
			await API.Accounts.archive(accountId)
			onStatusChange?.(accountId, AccountStatus.Archived)
			notificationService.success('Account archived successfully')

			logger.info('Account archived', {
				component: 'AccountActionsDropdown',
				accountId,
			})
		} catch (error) {
			logger.error('Archive failed', {
				error,
				component: 'AccountActionsDropdown',
				accountId,
			})
			notificationService.error('Failed to archive account. Please try again.')
		} finally {
			setIsLoading(false)
			setShowArchiveConfirm(false)
		}
	}, [account.id, onStatusChange])

	/**
	 * Get available actions based on current account status
	 */
	const getAvailableActions = useCallback((): ActionItem[] => {
		const actions: ActionItem[] = []

		switch (account.status) {
			case AccountStatus.Active:
				actions.push({
					key: 'suspend',
					label: 'Suspend Account',
					icon: AlertTriangle,
					variant: 'error',
				})
				actions.push({
					key: 'force_password',
					label: 'Force Password Change',
					icon: Key,
					variant: 'warning',
				})
				actions.push({
					key: 'archive',
					label: 'Archive Account',
					icon: Archive,
					variant: 'neutral',
				})
				break

			case AccountStatus.Suspended:
				actions.push({
					key: 'activate',
					label: 'Activate Account',
					icon: CheckCircle,
					variant: 'success',
				})
				actions.push({
					key: 'archive',
					label: 'Archive Account',
					icon: Archive,
					variant: 'neutral',
				})
				break

			case AccountStatus.Locked:
				actions.push({
					key: 'unlock',
					label: 'Unlock Account',
					icon: Unlock,
					variant: 'success',
				})
				actions.push({
					key: 'activate',
					label: 'Activate Account',
					icon: CheckCircle,
					variant: 'success',
				})
				break

			case AccountStatus.Archived:
				actions.push({
					key: 'restore',
					label: 'Restore Account',
					icon: RotateCcw,
					variant: 'success',
				})
				break

			case AccountStatus.PendingVerification:
				actions.push({
					key: 'activate',
					label: 'Manually Verify',
					icon: CheckCircle,
					variant: 'success',
				})
				break

			case AccountStatus.ForcePasswordChange:
				actions.push({
					key: 'activate',
					label: 'Remove Password Requirement',
					icon: CheckCircle,
					variant: 'success',
				})
				actions.push({
					key: 'suspend',
					label: 'Suspend Account',
					icon: AlertTriangle,
					variant: 'error',
				})
				break
		}

		return actions
	}, [account.status])

	const availableActions = getAvailableActions()

	// Don't render if no actions available
	if (availableActions.length === 0) {
		return null
	}

	return (
		<>
			{/* Dropdown */}
			<div className="relative" ref={dropdownRef}>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsOpen(!isOpen)}
					disabled={isLoading}
					className="w-8 h-8 p-0"
					aria-label="Account actions"
				>
					{isLoading ? (
						<span className="loading loading-spinner loading-xs" />
					) : (
						<MoreVertical className="w-5 h-5" />
					)}
				</Button>

				{/* Dropdown Menu */}
				{isOpen && (
					<div className="absolute right-0 top-full mt-1 w-56 bg-base-100 rounded-box shadow-lg border border-base-300 z-50 overflow-hidden">
						<div className="p-2">
							<div className="text-xs font-semibold text-base-content/50 px-3 py-2">
								Account Actions
							</div>
							{availableActions.map((action) => {
								const Icon = action.icon
								return (
									<button
										key={action.key}
										onClick={() => handleAction(action.key)}
										className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 transition-colors text-left ${
											action.variant === 'error'
												? 'text-error hover:bg-error/10'
												: action.variant === 'warning'
													? 'text-warning hover:bg-warning/10'
													: action.variant === 'success'
														? 'text-success hover:bg-success/10'
														: 'text-base-content'
										}`}
									>
										<Icon className="w-4 h-4" />
										<span className="text-sm">{action.label}</span>
									</button>
								)
							})}
						</div>
					</div>
				)}
			</div>

			{/* Suspend Modal */}
			<SuspendAccountModal
				isOpen={showSuspendModal}
				onClose={() => setShowSuspendModal(false)}
				onConfirm={handleSuspendConfirm}
				accountName={`${account.name?.first ?? ''} ${account.name?.last ?? ''}`.trim() || account.username}
			/>

			{/* Archive Confirmation Modal (uses existing ConfirmationModal - DRY) */}
			<ConfirmationModal
				isOpen={showArchiveConfirm}
				onClose={() => setShowArchiveConfirm(false)}
				onConfirm={handleArchiveConfirm}
				title="Archive Account"
				message={`Are you sure you want to archive the account for ${`${account.name?.first ?? ''} ${account.name?.last ?? ''}`.trim() || account.username}?`}
				variant="danger"
				confirmText="Archive Account"
				cancelText="Cancel"
				isLoading={isLoading}
				details="This will prevent the user from logging in. You can restore the account later."
			/>
		</>
	)
}

