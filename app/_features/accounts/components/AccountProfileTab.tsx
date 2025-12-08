/**
 * AccountProfileTab Component
 * 
 * Profile tab content for the account detail page.
 * Contains the profile form, account details, role/status management, and customer info.
 * 
 * **Features:**
 * - Profile update form
 * - Account details display (email, username, phone, member since)
 * - Account status management for admins
 * - Role management for admins
 * - Customer/Company association display
 * - Activity summary with order/quote counts
 * - Quick actions panel
 * 
 * **Phase 3 Improvements:**
 * - AccountStatusBadge for consistent status display
 * - Status management section for admins
 * - Customer association section with company details
 * 
 * @module features/accounts/components/AccountProfileTab
 */

'use client'

import { useState, useCallback } from 'react'

import { Building2, ExternalLink, Copy, Check, Mail, RefreshCw } from 'lucide-react'

import type Company from '@_classes/Company'
import { AccountRole, AccountStatus } from '@_classes/Enums'
import type User from '@_classes/User'

import AccountStatusBadge from '@_components/common/AccountStatusBadge'
import RoleBadge from '@_components/common/RoleBadge'
import UpdateAccountForm from '@_components/forms/UpdateAccountForm'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import ConfirmationModal from '@_components/ui/ConfirmationModal'
import Select, { type SelectOption } from '@_components/ui/Select'

import type { AccountActivitySummary } from '../hooks/useAccountDetailLogic'

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * CopyableField - Field with copy to clipboard functionality
 */
function CopyableField({ label, value }: { label: string; value: string | undefined }) {
	const [copied, setCopied] = useState(false)
	
	const handleCopy = useCallback(async () => {
		if (!value) return
		try {
			await navigator.clipboard.writeText(value)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			// Clipboard API not available
		}
	}, [value])
	
	return (
		<div className="flex items-center justify-between group">
			<strong className="text-base-content">{label}:</strong>
			<div className="flex items-center gap-2">
				<span className="truncate ml-2 max-w-[180px]">{value || 'Not provided'}</span>
				{value && (
					<button
						type="button"
						onClick={() => void handleCopy()}
						className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-base-200"
						title={`Copy ${label.toLowerCase()}`}
					>
						{copied ? (
							<Check className="h-3.5 w-3.5 text-success" />
						) : (
							<Copy className="h-3.5 w-3.5 text-base-content/50" />
						)}
					</button>
				)}
			</div>
		</div>
	)
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Role options for the dropdown */
const ROLE_OPTIONS: SelectOption<number>[] = [
	{ value: AccountRole.Customer, label: 'Customer' },
	{ value: AccountRole.Admin, label: 'Administrator' },
]

/** Status options for the dropdown */
const STATUS_OPTIONS: SelectOption<number>[] = [
	{ value: AccountStatus.Active, label: 'Active' },
	{ value: AccountStatus.Suspended, label: 'Suspended' },
	{ value: AccountStatus.Deactivated, label: 'Deactivated' },
	{ value: AccountStatus.PendingVerification, label: 'Pending Verification' },
]

// ============================================================================
// TYPES
// ============================================================================

export interface AccountProfileTabProps {
	/** Account being viewed/edited */
	account: User
	/** Member since formatted date */
	memberSince: string
	/** Whether current user is admin */
	isCurrentUserAdmin: boolean
	/** Whether role can be changed */
	canChangeRole: boolean
	/** Whether role update is in progress */
	isRoleUpdating: boolean
	/** Whether account has customer association */
	hasCustomerAssociation: boolean
	/** Activity summary data */
	activitySummary: AccountActivitySummary
	/** Customer/Company association (null if none) */
	customerCompany: Company | null
	/** Current account status */
	accountStatus: AccountStatus
	/** Whether status update is in progress */
	isStatusUpdating: boolean
	/** Whether status can be changed */
	canChangeStatus: boolean
	/** Handler for account updates from form */
	onAccountUpdate: (user: User) => void
	/** Handler for role changes */
	onRoleChange: (role: AccountRole) => Promise<void>
	/** Handler for status changes */
	onStatusChange: (status: AccountStatus) => Promise<void>
	/** Handler for view customer navigation */
	onViewCustomer: () => void
	/** Handler for view orders navigation */
	onViewOrders: () => void
	/** Handler for view quotes navigation */
	onViewQuotes: () => void
	/** Handler for manage accounts navigation */
	onManageAccounts: () => void
	/** Handler for refreshing account data */
	onRefresh?: () => Promise<void>
	/** Whether data is currently loading/refreshing */
	isLoading?: boolean
	/** Pending role change awaiting confirmation */
	pendingRoleChange?: AccountRole | null
	/** Pending status change awaiting confirmation */
	pendingStatusChange?: AccountStatus | null
	/** Set pending role change (triggers confirmation modal) */
	onSetPendingRoleChange?: (role: AccountRole | null) => void
	/** Set pending status change (triggers confirmation modal) */
	onSetPendingStatusChange?: (status: AccountStatus | null) => void
	/** Confirm role change */
	onConfirmRoleChange?: () => Promise<void>
	/** Confirm status change */
	onConfirmStatusChange?: () => Promise<void>
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AccountProfileTab Component
 * 
 * Renders the profile section of the account detail page.
 * Organized with main content on left and sidebar on right.
 */
export default function AccountProfileTab({
	account,
	memberSince,
	isCurrentUserAdmin,
	canChangeRole,
	isRoleUpdating,
	hasCustomerAssociation,
	activitySummary,
	customerCompany,
	accountStatus,
	isStatusUpdating,
	canChangeStatus,
	onAccountUpdate,
	onRoleChange,
	onStatusChange,
	onViewCustomer,
	onViewOrders,
	onViewQuotes,
	onManageAccounts,
	onRefresh,
	isLoading = false,
	pendingRoleChange,
	pendingStatusChange,
	onSetPendingRoleChange,
	onSetPendingStatusChange,
	onConfirmRoleChange,
	onConfirmStatusChange,
}: AccountProfileTabProps) {
	// Determine if we should use confirmation flow
	const useConfirmation = Boolean(onSetPendingRoleChange && onConfirmRoleChange)
	
	// Get labels for pending changes
	const pendingRoleLabel = pendingRoleChange === AccountRole.Admin ? 'Administrator' : 'Customer'
	const pendingStatusLabel = STATUS_OPTIONS.find(s => s.value === pendingStatusChange)?.label ?? ''
	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
			{/* Main Content - Profile Form */}
			<div className="space-y-6">
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					{/* Account Header with Role, Status & ID */}
					<div className="mb-6 flex flex-wrap items-center gap-3">
						<RoleBadge role={account.role ?? 0} />
						<AccountStatusBadge status={accountStatus} showIcon />
						<span className="text-xs uppercase tracking-wide text-base-content/60">
							Account {account.id ? `#${account.id}` : 'pending'}
						</span>
					</div>

					{/* Profile Update Form */}
					<UpdateAccountForm 
						user={account} 
						onUserUpdate={onAccountUpdate} 
					/>
				</Card>

				{/* Customer Association Card */}
				{hasCustomerAssociation && customerCompany && (
					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
								<Building2 className="h-5 w-5 text-info" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-base-content">Company Association</h2>
								<p className="text-sm text-base-content/60">
									This account is linked to an organization
								</p>
							</div>
						</div>

						<div className="space-y-3 text-sm">
							<div className="flex items-center justify-between py-2 border-b border-base-200">
								<span className="text-base-content/70">Company Name</span>
								<span className="font-medium text-base-content">{customerCompany.name || 'N/A'}</span>
							</div>
							<div className="flex items-center justify-between py-2 border-b border-base-200">
								<span className="text-base-content/70">Company Email</span>
								<span className="font-medium text-base-content">{customerCompany.email || 'N/A'}</span>
							</div>
							<div className="flex items-center justify-between py-2 border-b border-base-200">
								<span className="text-base-content/70">Phone</span>
								<span className="font-medium text-base-content">{customerCompany.phone || 'N/A'}</span>
							</div>
							{customerCompany.city && (
								<div className="flex items-center justify-between py-2 border-b border-base-200">
									<span className="text-base-content/70">Location</span>
									<span className="font-medium text-base-content">
										{[customerCompany.city, customerCompany.state, customerCompany.country]
											.filter(Boolean)
											.join(', ')}
									</span>
								</div>
							)}
							{customerCompany.taxId && (
								<div className="flex items-center justify-between py-2 border-b border-base-200">
									<span className="text-base-content/70">Tax ID</span>
									<span className="font-mono font-medium text-base-content">{customerCompany.taxId}</span>
								</div>
							)}
						</div>

						<div className="mt-4">
							<Button
								variant="secondary"
								size="sm"
								onClick={onViewCustomer}
								rightIcon={<ExternalLink className="h-4 w-4" />}
							>
								View Full Customer Profile
							</Button>
						</div>
					</Card>
				)}
			</div>

			{/* Sidebar - Details & Actions */}
			<div className="space-y-4">
				{/* Account Details Card */}
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-base-content">Account Details</h2>
						{onRefresh && (
							<button
								type="button"
								onClick={() => void onRefresh()}
								disabled={isLoading}
								className="p-1.5 rounded-lg hover:bg-base-200 transition-colors disabled:opacity-50"
								title="Refresh account data"
							>
								<RefreshCw className={`h-4 w-4 text-base-content/60 ${isLoading ? 'animate-spin' : ''}`} />
							</button>
						)}
					</div>
					<div className="space-y-3 text-sm text-base-content/70">
						<CopyableField label="Email" value={account.email} />
						<CopyableField label="Username" value={account.username} />
						<CopyableField label="Phone" value={account.phone || account.mobile} />
						{memberSince && (
							<div className="flex items-center justify-between">
								<strong className="text-base-content">Member since:</strong>
								<span className="truncate ml-2">{memberSince}</span>
							</div>
						)}
					</div>
					
					{/* Quick Email Action */}
					{account.email && (
						<div className="mt-4 pt-4 border-t border-base-200">
							<a
								href={`mailto:${account.email}`}
								className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
							>
								<Mail className="h-4 w-4" />
								Send Email
							</a>
						</div>
					)}
				</Card>

				{/* Account Status Management (Admin Only) */}
				{isCurrentUserAdmin && (
					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-base-content">Account Status</h2>
						<p className="mt-1 text-xs text-base-content/60">
							{canChangeStatus
								? 'Manage the operational status of this account.'
								: 'You cannot modify your own account status.'}
						</p>
						<div className="mt-4">
							<label className="block text-sm font-medium text-base-content mb-2">
								Status
							</label>
							<Select
								value={accountStatus}
								onChange={(e) => {
									const newStatus = Number(e.target.value) as AccountStatus
									if (onSetPendingStatusChange) {
										onSetPendingStatusChange(newStatus)
									} else {
										void onStatusChange(newStatus)
									}
								}}
								options={STATUS_OPTIONS}
								size="sm"
								width="full"
								disabled={!canChangeStatus || isStatusUpdating}
								loading={isStatusUpdating}
								aria-label="Select account status"
							/>
						</div>
					</Card>
				)}

				{/* Role Management Card (Admin Only) */}
				{isCurrentUserAdmin && (
					<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-base-content">Role Management</h2>
						<p className="mt-1 text-xs text-base-content/60">
							{canChangeRole 
								? 'Change the access level for this account.'
								: 'You cannot modify your own role.'}
						</p>
						<div className="mt-4">
							<label className="block text-sm font-medium text-base-content mb-2">
								Account Role
							</label>
							<Select
								value={account.role ?? AccountRole.Customer}
								onChange={(e) => {
									const newRole = Number(e.target.value) as AccountRole
									if (onSetPendingRoleChange && useConfirmation) {
										onSetPendingRoleChange(newRole)
									} else {
										void onRoleChange(newRole)
									}
								}}
								options={ROLE_OPTIONS}
								size="sm"
								width="full"
								disabled={!canChangeRole || isRoleUpdating}
								loading={isRoleUpdating}
								aria-label="Select account role"
							/>
						</div>
					</Card>
				)}

				{/* Activity Summary Card */}
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-base-content">Activity Summary</h2>
					<div className="mt-4 grid grid-cols-2 gap-4">
						{/* Orders Count */}
						<button
							type="button"
							onClick={onViewOrders}
							className="group flex flex-col items-center rounded-lg border border-base-300 bg-base-200/50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
						>
							<span className="text-2xl font-bold text-base-content group-hover:text-primary">
								{activitySummary.isLoading ? '...' : activitySummary.orderCount}
							</span>
							<span className="text-xs text-base-content/60 group-hover:text-primary/80">
								Orders
							</span>
						</button>

						{/* Quotes Count */}
						<button
							type="button"
							onClick={onViewQuotes}
							className="group flex flex-col items-center rounded-lg border border-base-300 bg-base-200/50 p-4 transition-all hover:border-secondary/30 hover:bg-secondary/5"
						>
							<span className="text-2xl font-bold text-base-content group-hover:text-secondary">
								{activitySummary.isLoading ? '...' : activitySummary.quoteCount}
							</span>
							<span className="text-xs text-base-content/60 group-hover:text-secondary/80">
								Quotes
							</span>
						</button>
					</div>
				</Card>

				{/* Quick Actions Card */}
				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-base-content">Quick Actions</h2>
					<div className="mt-4 flex flex-col gap-3">
						<Button
							variant="secondary"
							onClick={onViewCustomer}
							disabled={!hasCustomerAssociation}
						>
							View Customer
						</Button>
						<Button
							variant="ghost"
							onClick={onManageAccounts}
						>
							All Accounts
						</Button>
					</div>
				</Card>
			</div>

			{/* Role Change Confirmation Modal */}
			{onConfirmRoleChange && onSetPendingRoleChange && (
				<ConfirmationModal
					isOpen={pendingRoleChange !== null}
					onClose={() => onSetPendingRoleChange(null)}
					onConfirm={onConfirmRoleChange}
					title="Change Account Role"
					message={`Are you sure you want to change this account's role to ${pendingRoleLabel}? This will affect what features and data the user can access.`}
					variant={pendingRoleChange === AccountRole.Admin ? 'warning' : 'info'}
					confirmText={`Change to ${pendingRoleLabel}`}
					cancelText="Keep Current Role"
					isLoading={isRoleUpdating}
					details={
						pendingRoleChange === AccountRole.Admin
							? 'Administrator accounts have full access to all system features including user management.'
							: 'Customer accounts can only view and manage their own orders and quotes.'
					}
				/>
			)}

			{/* Status Change Confirmation Modal */}
			{onConfirmStatusChange && onSetPendingStatusChange && (
				<ConfirmationModal
					isOpen={pendingStatusChange !== null}
					onClose={() => onSetPendingStatusChange(null)}
					onConfirm={onConfirmStatusChange}
					title="Change Account Status"
					message={`Are you sure you want to change this account's status to ${pendingStatusLabel}?`}
					variant={
						pendingStatusChange === AccountStatus.Deactivated || 
						pendingStatusChange === AccountStatus.Suspended 
							? 'danger' 
							: 'warning'
					}
					confirmText={`Set to ${pendingStatusLabel}`}
					cancelText="Keep Current Status"
					isLoading={isStatusUpdating}
					details={
						pendingStatusChange === AccountStatus.Suspended
							? 'Suspended accounts cannot access the system until reactivated by an administrator.'
							: pendingStatusChange === AccountStatus.Deactivated
								? 'Deactivated accounts are permanently disabled and may require manual reactivation.'
								: pendingStatusChange === AccountStatus.PendingVerification
									? 'Pending accounts require email verification before gaining full access.'
									: 'Active accounts have full access to the system based on their role.'
					}
				/>
			)}
		</div>
	)
}
