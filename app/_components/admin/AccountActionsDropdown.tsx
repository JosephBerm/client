/**
 * AccountActionsDropdown Component
 *
 * Admin-only dropdown menu for managing account status (Phase 1).
 * Context-aware actions based on current account status.
 * Uses shared Dropdown component with portal rendering.
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
 * @module AccountActionsDropdown
 */

'use client'

import { useState, useCallback } from 'react'
import { MoreVertical, CheckCircle, AlertTriangle, Archive, RotateCcw, Key, Unlock } from 'lucide-react'

import { AccountStatus } from '@_classes/Enums'

import { Dropdown } from '@_components/ui/Dropdown'
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
	variant: 'default' | 'success' | 'warning' | 'danger'
}

/**
 * AccountActionsDropdown Component
 *
 * Displays context menu with available admin actions for the account.
 * Actions vary based on current account status.
 */
export default function AccountActionsDropdown({
	account,
	onStatusChange,
}: AccountActionsDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [showSuspendModal, setShowSuspendModal] = useState(false)
	const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

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
						await API.Accounts.changeStatus(accountId, AccountStatus.Active)
						onStatusChange?.(accountId, AccountStatus.Active)
						notificationService.success('Account activated successfully')
						break

					case 'suspend':
						setShowSuspendModal(true)
						setIsLoading(false)
						setIsOpen(false)
						return

					case 'unlock':
						await API.Accounts.changeStatus(accountId, AccountStatus.Active)
						onStatusChange?.(accountId, AccountStatus.Active)
						notificationService.success('Account unlocked successfully')
						break

					case 'archive':
						setShowArchiveConfirm(true)
						setIsLoading(false)
						setIsOpen(false)
						return

					case 'restore':
						await API.Accounts.changeStatus(accountId, AccountStatus.Active)
						onStatusChange?.(accountId, AccountStatus.Active)
						notificationService.success('Account restored successfully')
						break

					case 'force_password':
						await API.Accounts.changeStatus(accountId, AccountStatus.ForcePasswordChange)
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

			await API.Accounts.changeStatus(accountId, AccountStatus.Suspended, reason)
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
			await API.Accounts.changeStatus(accountId, AccountStatus.Archived)
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
					variant: 'danger',
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
					variant: 'default',
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
					variant: 'default',
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
					variant: 'danger',
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

	const accountDisplayName =
		`${account.name?.first ?? ''} ${account.name?.last ?? ''}`.trim() || account.username

	return (
		<>
			<Dropdown open={isOpen} onOpenChange={setIsOpen}>
				<Dropdown.Trigger
					variant="ghost"
					showChevron={false}
					className="w-8 h-8 p-0 min-h-0 sm:min-h-0"
					disabled={isLoading}
					aria-label="Account actions"
				>
					{isLoading ? (
						<span className="loading loading-spinner loading-xs" />
					) : (
						<MoreVertical className="w-5 h-5" />
					)}
				</Dropdown.Trigger>

				<Dropdown.Content align="end" width={224}>
					<Dropdown.Section title="Account Actions">
						{availableActions.map((action) => {
							const Icon = action.icon
							return (
								<Dropdown.Item
									key={action.key}
									icon={<Icon className="w-4 h-4" />}
									variant={action.variant}
									onClick={() => handleAction(action.key)}
								>
									{action.label}
								</Dropdown.Item>
							)
						})}
					</Dropdown.Section>
				</Dropdown.Content>
			</Dropdown>

			{/* Suspend Modal */}
			<SuspendAccountModal
				isOpen={showSuspendModal}
				onClose={() => setShowSuspendModal(false)}
				onConfirm={handleSuspendConfirm}
				accountName={accountDisplayName}
			/>

			{/* Archive Confirmation Modal (uses existing ConfirmationModal - DRY) */}
			<ConfirmationModal
				isOpen={showArchiveConfirm}
				onClose={() => setShowArchiveConfirm(false)}
				onConfirm={handleArchiveConfirm}
				title="Archive Account"
				message={`Are you sure you want to archive the account for ${accountDisplayName}?`}
				variant="danger"
				confirmText="Archive Account"
				cancelText="Cancel"
				isLoading={isLoading}
				details="This will prevent the user from logging in. You can restore the account later."
			/>
		</>
	)
}
