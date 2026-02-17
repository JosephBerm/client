/**
 * CustomerOverviewCard Component
 *
 * Displays customer profile overview including name, status, badges,
 * contact information, and sales rep assignment.
 *
 * **Sections:**
 * - Header: Icon, name, status badge
 * - Badges: Business type, tax ID
 * - Contact: Email, phone links
 * - Sales Rep: Current assignment with reassign action
 *
 * **RBAC:**
 * - SalesManager+: Can see reassign button
 * - All: Can view profile (backend enforces access)
 *
 * @see prd_customers.md - Customer Profile Display
 * @module customers/components
 */

'use client'

import { Building2, Mail, Phone, UserCheck, UserPlus } from 'lucide-react'

import { BusinessTypeBadge, CustomerStatusBadge } from '@_features/customers'

import Company from '@_classes/Company'
import { CustomerStatus, TypeOfBusiness } from '@_classes/Enums'

import { useAdminView } from '@_shared'

import Button from '@_components/ui/Button'

/** Component props */
interface CustomerOverviewCardProps {
	/** Customer entity to display */
	customer: Company
	/** Whether user can assign sales rep */
	canAssignSalesRep: boolean
	/** Callback when assign button clicked */
	onAssignSalesRep: () => void
}

/**
 * CustomerOverviewCard - Displays customer profile overview.
 * Pure presentational component - receives all data via props.
 */
export function CustomerOverviewCard({ customer, canAssignSalesRep, onAssignSalesRep }: CustomerOverviewCardProps) {
	const { isAdminViewActive } = useAdminView()

	return (
		<div className='card bg-base-100 border border-base-300 shadow-sm'>
			<div className='card-body p-4 sm:p-6'>
				{/* Header with badges */}
				<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
					{/* Left: Icon and basic info */}
					<div className='flex items-start gap-4'>
						{/* Company Icon */}
						<div className='hidden sm:flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary'>
							<Building2 size={32} />
						</div>

						{/* Name and badges */}
						<div className='flex flex-col gap-1'>
							<div className='flex flex-wrap items-center gap-2'>
								<h2 className='text-xl font-bold text-base-content'>{customer.name}</h2>
								<CustomerStatusBadge
									status={customer.status ?? CustomerStatus.Active}
									size='sm'
								/>
							</div>
							<div className='flex flex-wrap items-center gap-2 text-sm text-base-content/70'>
								<BusinessTypeBadge
									type={customer.typeOfBusiness ?? TypeOfBusiness.Other}
									size='sm'
								/>
								{isAdminViewActive && customer.taxId && (
									<span className='badge badge-outline badge-sm'>Tax ID: {customer.taxId}</span>
								)}
							</div>
						</div>
					</div>

					{/* Right: Contact Info */}
					<CustomerContactInfo
						email={customer.email}
						phone={customer.phone}
					/>
				</div>

				{/* Sales Rep Section */}
				<CustomerSalesRepSection
					salesRep={customer.primarySalesRep}
					salesRepName={customer.salesRepName}
					canAssign={canAssignSalesRep}
					onAssign={onAssignSalesRep}
				/>
			</div>
		</div>
	)
}

/**
 * CustomerContactInfo - Contact details with clickable links.
 * Extracted for readability and potential reuse.
 */
interface CustomerContactInfoProps {
	email?: string | null
	phone?: string | null
}

function CustomerContactInfo({ email, phone }: CustomerContactInfoProps) {
	if (!email && !phone) {
		return null
	}

	return (
		<div className='flex flex-col gap-1 text-sm'>
			{email && (
				<a
					href={`mailto:${email}`}
					className='flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors'>
					<Mail size={14} />
					{email}
				</a>
			)}
			{phone && (
				<a
					href={`tel:${phone}`}
					className='flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors'>
					<Phone size={14} />
					{phone}
				</a>
			)}
		</div>
	)
}

/**
 * CustomerSalesRepSection - Sales rep display with assignment action.
 * Extracted for separation of concerns.
 */
interface CustomerSalesRepSectionProps {
	salesRep?: { username?: string } | null
	salesRepName?: string | null
	canAssign: boolean
	onAssign: () => void
}

function CustomerSalesRepSection({ salesRep, salesRepName, canAssign, onAssign }: CustomerSalesRepSectionProps) {
	const hasAssignment = !!salesRep
	const displayName = salesRepName ?? salesRep?.username

	return (
		<div className='mt-4 pt-4 border-t border-base-300'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2 text-sm'>
					<UserCheck
						size={16}
						className={hasAssignment ? 'text-success' : 'text-base-content/40'}
					/>
					<span className='text-base-content/70'>Primary Sales Rep:</span>
					{hasAssignment ? (
						<span className='font-medium'>{displayName}</span>
					) : (
						<span className='text-base-content/40 italic'>Unassigned</span>
					)}
				</div>
				{canAssign && (
					<Button
						variant='ghost'
						size='sm'
						onClick={onAssign}
						leftIcon={<UserPlus size={14} />}>
						{hasAssignment ? 'Reassign' : 'Assign'}
					</Button>
				)}
			</div>
		</div>
	)
}

export default CustomerOverviewCard
