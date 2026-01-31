/**
 * CustomerDetailPage
 * 
 * Manages individual customer details with full CRUD operations.
 * Follows modular component architecture for separation of concerns.
 * 
 * **Page Flow:**
 * 1. Load customer data via useCustomerDetails hook
 * 2. Check permissions via useCustomerPermissions hook
 * 3. Render modular components based on mode (create/edit)
 * 
 * **Components Used:**
 * - CustomerOverviewCard: Profile display (edit mode)
 * - CustomerStatsCard: Statistics (edit mode)
 * - CustomerQuickActions: Navigation shortcuts (edit mode)
 * - CustomerFormSection: Create/edit form
 * - CustomerHistory: Order/quote history (edit mode)
 * - CustomerAccountsSection: Linked accounts (edit mode)
 * 
 * **RBAC:**
 * - All users: View assigned/own customers (backend filtered)
 * - SalesManager+: Assign sales reps
 * - Admin: Delete/archive
 * 
 * @see prd_customers.md - Customer Management PRD
 * @module app/customers/[id]
 */

'use client'

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import {
	AssignSalesRepModal,
	CustomerHistory,
	CustomerStatsCard,
} from '@_features/customers'
import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { useRouteParam } from '@_shared'

import Company from '@_classes/Company'

import Button from '@_components/ui/Button'

import { InternalPageHeader } from '../../_components'

import {
	CustomerAccountsSection,
	CustomerDetailSkeleton,
	CustomerFormSection,
	CustomerOverviewCard,
	CustomerQuickActions,
	useCustomerDetails,
	useCustomerPermissions,
} from './_components'

/**
 * CustomerDetailPage - Customer create/edit page.
 * 
 * Uses composition pattern with dedicated components for each section.
 * All data fetching is encapsulated in useCustomerDetails hook.
 * All RBAC logic is encapsulated in useCustomerPermissions hook.
 */
export default function CustomerDetailPage() {
	const router = useRouter()
	const customerId = useRouteParam('id')
	const isCreateMode = customerId === 'create'

	// Auth state (for logging context)
	const currentUser = useAuthStore((state) => state.user)

	// Data fetching hook - encapsulates all API calls
	const {
		customer,
		accounts,
		stats,
		loading,
		customerIdStr,
		setCustomer,
	} = useCustomerDetails({ customerId, isCreateMode })

	// Permissions hook - encapsulates RBAC logic
	const { canAssignSalesRep } = useCustomerPermissions()

	// Local UI state
	const [showAssignModal, setShowAssignModal] = useState(false)

	/**
	 * Handle customer form submission success.
	 * Redirects to detail page after creation.
	 */
	const handleCustomerUpdate = useCallback(
		(updatedCustomer: Company) => {
		logger.info('Customer updated successfully', {
			component: 'CustomerDetailPage',
			action: 'handleCustomerUpdate',
			customerId: updatedCustomer.id,
			customerName: updatedCustomer.name,
			isCreateMode,
			userId: currentUser?.id ?? undefined,
		})

			setCustomer(updatedCustomer)

			if (isCreateMode && updatedCustomer.id) {
				// Redirect to detail page after creation
				router.push(Routes.Customers.detail(updatedCustomer.id))
			}
		},
		[isCreateMode, router, setCustomer, currentUser?.id]
	)

	/**
	 * Handle sales rep assignment success.
	 */
	const handleSalesRepAssigned = useCallback(
		(updatedCustomer: Company) => {
		logger.info('Sales rep assigned to customer', {
			component: 'CustomerDetailPage',
			action: 'handleSalesRepAssigned',
			customerId: updatedCustomer.id,
			salesRepId: updatedCustomer.primarySalesRepId,
			userId: currentUser?.id ?? undefined,
		})

			setCustomer(new Company(updatedCustomer))
		},
		[setCustomer, currentUser?.id]
	)

	// Page metadata
	const pageTitle = isCreateMode
		? 'Create Customer'
		: customer.name || 'Customer'

	const pageDescription = isCreateMode
		? 'Register a new customer organization and configure their purchasing details.'
		: 'Review and manage customer details, associated accounts, and linked activity.'

	// Show skeleton while loading
	if (loading.customer && !isCreateMode) {
		return (
			<>
				<InternalPageHeader
					title="Loading..."
					description="Fetching customer details"
					loading={true}
				/>
				<CustomerDetailSkeleton />
			</>
		)
	}

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title={pageTitle}
				description={pageDescription}
				loading={loading.customer}
				actions={
					<Button
						variant="ghost"
						onClick={() => router.back()}
						leftIcon={<ArrowLeft size={16} />}
					>
						Back
					</Button>
				}
			/>

			{/* Page Content */}
			<div className="space-y-6">
				{/* === EDIT MODE SECTIONS === */}
				{!isCreateMode && (
					<>
						{/* Customer Profile Overview */}
						<CustomerOverviewCard
							customer={customer}
							canAssignSalesRep={canAssignSalesRep}
							onAssignSalesRep={() => setShowAssignModal(true)}
						/>

						{/* Customer Statistics */}
						{stats && (
							<CustomerStatsCard stats={stats} isLoading={loading.stats} />
						)}

						{/* Quick Action Buttons */}
						{customerIdStr && (
							<CustomerQuickActions customerId={customerIdStr} />
						)}
					</>
				)}

				{/* === SHARED SECTIONS === */}

				{/* Customer Form (Create or Edit) */}
				<CustomerFormSection
					customer={customer}
					isCreateMode={isCreateMode}
					onCustomerUpdate={handleCustomerUpdate}
				/>

				{/* === EDIT MODE SECTIONS (CONTINUED) === */}
				{!isCreateMode && customerIdStr && (
					<>
						{/* Order & Quote History */}
						<CustomerHistory customerId={customerIdStr} />

						{/* Linked User Accounts */}
						<CustomerAccountsSection
							customerId={customerIdStr}
							accounts={accounts}
							isLoading={loading.accounts}
						/>
					</>
				)}
			</div>

			{/* === MODALS === */}
			<AssignSalesRepModal
				isOpen={showAssignModal}
				customer={customer}
				onClose={() => setShowAssignModal(false)}
				onAssigned={handleSalesRepAssigned}
			/>
		</>
	)
}
