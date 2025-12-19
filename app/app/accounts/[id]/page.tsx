/**
 * Account Detail Page
 * 
 * Admin page for viewing and managing individual user accounts.
 * Provides tabbed interface with Profile, Security, and Activity sections.
 * 
 * **Features:**
 * - Tabbed navigation (Profile, Security, Activity)
 * - Profile: View and edit account information, role management
 * - Security: Password change, security status
 * - Activity: Recent orders and quotes
 * - Create mode for new accounts (redirects to signup)
 * 
 * **Phase 2 Improvements:**
 * - Tabbed interface for better organization
 * - Dedicated Security tab with password management
 * - Activity tab with orders/quotes tables
 * - Better component separation
 * 
 * @module app/accounts/[id]
 */

'use client'

import Link from 'next/link'

import { User, Shield, Activity } from 'lucide-react'

import {
	useAccountDetailLogic,
	AccountProfileTab,
	AccountSecurityTab,
	AccountActivityTab,
	AccountDetailSkeleton,
} from '@_features/accounts'
import { Routes } from '@_features/navigation'

import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import { Tabs, TabsList, Tab, TabPanel } from '@_components/ui/Tabs'

import { InternalPageHeader } from '../../_components'

// ============================================================================
// PAGE COMPONENT
// ============================================================================

const Page = () => {
	const {
		// Core State
		account,
		isLoading,
		isCreateMode,
		
		// Tab State
		activeTab,
		setActiveTab,
		
		// Auth State
		isCurrentUserAdmin,
		
		// Derived State
		accountName,
		memberSince,
		hasCustomerAssociation,
		pageTitle,
		pageDescription,
		
		// Customer/Company Association
		customerCompany,
		
		// Account Status
		accountStatus,
		isStatusUpdating,
		canChangeStatus,
		handleStatusChange,
		
		// Activity Summary (counts)
		activitySummary,
		
		// Activity Data (lists)
		activityData,
		
		// Role Management
		isRoleUpdating,
		canChangeRole,
		handleRoleChange,
		
		// Confirmation State
		pendingRoleChange,
		pendingStatusChange,
		setPendingRoleChange,
		setPendingStatusChange,
		confirmRoleChange,
		confirmStatusChange,
		
		// Security
		canChangePassword,
		handleSendPasswordReset,
		handleForceLogout,
		isSendingPasswordReset,
		
		// Account Actions
		handleAccountUpdate,
		handleRefreshAccount,
		
		// Navigation Handlers
		handleBack,
		handleViewCustomer,
		handleViewOrders,
		handleViewQuotes,
		handleManageAccounts,
	} = useAccountDetailLogic()

	// ============================================================================
	// RENDER: CREATE MODE
	// ============================================================================

	if (isCreateMode) {
		return (
			<>
				<InternalPageHeader
					title={pageTitle}
					description={pageDescription}
					loading={isLoading}
					actions={
						<Button variant="ghost" onClick={handleBack}>
							Back
						</Button>
					}
				/>

				<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
					<div className="space-y-4">
						<p className="text-base text-base-content/70">
							New MedSource Pro accounts are provisioned through the public signup flow. Share the signup link with
							the user or register on their behalf, then assign the appropriate customer organization.
						</p>
						<div className="flex flex-wrap gap-3">
							<Link href={Routes.openLoginModal()} className="btn btn-primary">
								Open Signup
							</Link>
							<Link href={Routes.Accounts.location} className="btn btn-ghost">
								View Accounts
							</Link>
						</div>
					</div>
				</Card>
			</>
		)
	}

	// ============================================================================
	// RENDER: LOADING STATE
	// ============================================================================

	if (isLoading && !account) {
		return (
			<>
				<InternalPageHeader
					title="Loading Account..."
					description="Please wait while we fetch the account details."
					loading={true}
					actions={
						<Button variant="ghost" onClick={handleBack}>
							Back
						</Button>
					}
				/>
				<AccountDetailSkeleton />
			</>
		)
	}

	// ============================================================================
	// RENDER: ACCOUNT NOT FOUND
	// ============================================================================

	if (!account && !isLoading) {
		return (
			<>
				<InternalPageHeader
					title="Account Not Found"
					description="The requested account could not be loaded."
					actions={
						<Button variant="ghost" onClick={handleBack}>
							Back
						</Button>
					}
				/>

				<Card className="border border-error/30 bg-error/5 p-6 shadow-sm">
					<h3 className="text-lg font-semibold text-error">User not found</h3>
					<p className="mt-2 text-sm text-base-content/70">
						The account you are looking for could not be located. Please return to the accounts list and try again.
					</p>
					<div className="mt-4">
						<Button variant="primary" onClick={handleManageAccounts}>
							Go to Accounts
						</Button>
					</div>
				</Card>
			</>
		)
	}

	// ============================================================================
	// RENDER: ACCOUNT DETAIL WITH TABS
	// ============================================================================

	return (
		<>
			<InternalPageHeader
				title={pageTitle}
				description={pageDescription}
				loading={isLoading}
				actions={
					<Button variant="ghost" onClick={handleBack}>
						Back
					</Button>
				}
			/>

			{account && (
				<Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as typeof activeTab)} variant="bordered">
					<TabsList className="mb-6">
						<Tab value="profile" icon={<User className="h-4 w-4" />}>
							Profile
						</Tab>
						<Tab value="security" icon={<Shield className="h-4 w-4" />}>
							Security
						</Tab>
						<Tab 
							value="activity" 
							icon={<Activity className="h-4 w-4" />}
							badge={
								activitySummary.isLoading 
									? undefined 
									: (activitySummary.orderCount + activitySummary.quoteCount) > 0 
										? activitySummary.orderCount + activitySummary.quoteCount 
										: undefined
							}
						>
							Activity
						</Tab>
					</TabsList>

					{/* Profile Tab */}
					<TabPanel value="profile">
						<AccountProfileTab
							account={account}
							accountName={accountName}
							memberSince={memberSince}
							isCurrentUserAdmin={isCurrentUserAdmin}
							canChangeRole={canChangeRole}
							isRoleUpdating={isRoleUpdating}
							hasCustomerAssociation={hasCustomerAssociation}
							activitySummary={activitySummary}
							customerCompany={customerCompany}
							accountStatus={accountStatus}
							isStatusUpdating={isStatusUpdating}
							canChangeStatus={canChangeStatus}
							onAccountUpdate={handleAccountUpdate}
							onRoleChange={handleRoleChange}
							onStatusChange={handleStatusChange}
							onViewCustomer={handleViewCustomer}
							onViewOrders={handleViewOrders}
							onViewQuotes={handleViewQuotes}
							onManageAccounts={handleManageAccounts}
							onRefresh={handleRefreshAccount}
							isLoading={isLoading}
							pendingRoleChange={pendingRoleChange}
							pendingStatusChange={pendingStatusChange}
							onSetPendingRoleChange={setPendingRoleChange}
							onSetPendingStatusChange={setPendingStatusChange}
							onConfirmRoleChange={confirmRoleChange}
							onConfirmStatusChange={confirmStatusChange}
						/>
					</TabPanel>

					{/* Security Tab */}
					<TabPanel value="security">
						<AccountSecurityTab
							account={account}
							isCurrentUserAdmin={isCurrentUserAdmin}
							canChangePassword={canChangePassword}
							accountStatus={accountStatus}
							onSendPasswordReset={handleSendPasswordReset}
							onForceLogout={handleForceLogout}
							isSendingReset={isSendingPasswordReset}
						/>
					</TabPanel>

					{/* Activity Tab */}
					<TabPanel value="activity">
						<AccountActivityTab
							orders={activityData.orders}
							quotes={activityData.quotes}
							isLoadingOrders={activityData.isLoadingOrders}
							isLoadingQuotes={activityData.isLoadingQuotes}
							hasCustomerAssociation={hasCustomerAssociation}
						/>
					</TabPanel>
				</Tabs>
			)}
		</>
	)
}

export default Page
