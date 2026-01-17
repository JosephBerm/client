/**
 * Approval Queue Page
 *
 * Dedicated page for Sales Managers to review and approve quotes.
 * Displays quotes that need approval (status: Read).
 *
 * **Features:**
 * - Filtered quote queue (Read status - ready for approval)
 * - Quick actions (Approve, Reject, Request Changes)
 * - Quote detail panel with pricing information
 * - Margin impact calculations
 * - Audit trail display
 *
 * **Role Access:**
 * - SalesManager (Level 4000): Full access
 * - Admin+ (Level 5000+): Full access
 * - Others: Redirected or access denied
 *
 * **Next.js 16 Optimization:**
 * - Client Component for interactivity
 * - Uses RichDataGrid for server-side pagination
 * - React Compiler auto-memoizes callbacks
 *
 * **Route**: /app/approvals
 *
 * @module app/approvals/page
 */

'use client'

import Link from 'next/link'

import { CheckCircle2, Eye, XCircle } from 'lucide-react'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { formatDate, formatCurrency, API, notificationService, usePermissions, RoleLevels } from '@_shared'

import { QuoteStatus } from '@_classes/Enums'
import type Quote from '@_classes/Quote'

import Badge from '@_components/ui/Badge'
import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	type RichSearchFilter,
	type RichPagedResult,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { InternalPageHeader } from '../_components'

/**
 * Quote interface for RichDataGrid display
 */
interface QuoteRow {
	id?: string
	companyName?: string
	emailAddress?: string
	phoneNumber?: string
	total?: number
	status: number
	createdAt: string | Date
	assignedSalesRepId?: string
	assignedSalesRepName?: string
}

export default function ApprovalQueuePage() {
	const user = useAuthStore((state) => state.user)

	// RBAC: Only SalesManager+ can access
	const { isSalesManagerOrAbove } = usePermissions()

	// Access denied for non-manager roles
	if (!isSalesManagerOrAbove) {
		return (
			<>
				<InternalPageHeader
					title='Access Denied'
					description='You do not have permission to access the approval queue.'
				/>
				<Card className='border border-base-300 bg-base-100 p-6 shadow-sm'>
					<p className='text-base-content/70'>Only Sales Managers and Administrators can access this page.</p>
				</Card>
			</>
		)
	}

	/**
	 * Fetcher for RichDataGrid - Filters quotes by approval-ready status
	 * React Compiler auto-memoizes this function.
	 */
	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<QuoteRow>> => {
		// Add status filter to only show quotes ready for approval
		// Status: Read (1) - quotes that have been reviewed and need approval
		const approvalStatus = QuoteStatus.Read

		// Add status filter to the request
		const enrichedFilter = {
			...filter,
			columnFilters: [
				...(filter.columnFilters || []),
				{
					columnId: createColumnId('status'),
					filterType: FilterType.Select,
					operator: 'eq',
					value: approvalStatus,
				},
			],
		}

		const response = await API.Quotes.richSearch(enrichedFilter)

		if (response.data?.payload) {
			return response.data.payload as unknown as RichPagedResult<QuoteRow>
		}

		// Return empty result on error
		return {
			data: [],
			page: 1,
			pageSize: filter.pageSize,
			total: 0,
			totalPages: 0,
			hasNext: false,
			hasPrevious: false,
		}
	}

	// Column helper for type-safe column definitions
	const columnHelper = createRichColumnHelper<QuoteRow>()

	/**
	 * Column definitions optimized for approval workflow.
	 * React Compiler auto-memoizes based on dependency tracking.
	 */
	const columns: RichColumnDef<QuoteRow, unknown>[] = [
		// Quote ID - Link to detail
		columnHelper.accessor('id', {
			header: 'Quote #',
			filterType: FilterType.Text,
			cell: ({ row }) => (
				<Link
					href={Routes.Quotes.detail(row.original.id ?? '')}
					className='link link-primary font-semibold'
					data-testid='quote-link'>
					{row.original.id ? row.original.id.substring(0, 8) : 'N/A'}
				</Link>
			),
		}),

		// Company name column
		columnHelper.accessor('companyName', {
			header: 'Company',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className='flex flex-col'>
					<span className='font-medium'>{row.original.companyName ?? 'N/A'}</span>
					{row.original.emailAddress && (
						<span className='text-xs text-base-content/60'>{row.original.emailAddress}</span>
					)}
				</div>
			),
		}),

		// Sales Rep column
		columnHelper.accessor('assignedSalesRepName', {
			header: 'Sales Rep',
			filterType: FilterType.Text,
			cell: ({ row }) => (
				<span className='text-sm text-base-content/80'>
					{row.original.assignedSalesRepName ?? 'Unassigned'}
				</span>
			),
		}),

		// Total column
		columnHelper.accessor('total', {
			header: 'Total',
			filterType: FilterType.Number,
			cell: ({ row }) => <span className='font-semibold'>{formatCurrency(row.original.total ?? 0)}</span>,
		}),

		// Status column - Select filter
		columnHelper.accessor('status', {
			header: 'Status',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => {
				const status = row.original.status
				const variant = status === QuoteStatus.Read ? 'warning' : 'success'
				return <Badge variant={variant}>{QuoteStatus[row.original.status] ?? 'Unknown'}</Badge>
			},
		}),

		// Created date column
		columnHelper.accessor('createdAt', {
			header: 'Requested',
			filterType: FilterType.Date,
			cell: ({ row }) => (
				<span className='text-sm text-base-content/70'>{formatDate(row.original.createdAt)}</span>
			),
		}),

		// Actions column
		columnHelper.display({
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<div className='flex items-center gap-1'>
					<Link href={Routes.Quotes.detail(row.original.id ?? '')}>
						<Button
							variant='ghost'
							size='sm'
							title='Review Quote'
							data-testid='review-quote-btn'>
							<Eye className='w-4 h-4' />
						</Button>
					</Link>
				</div>
			),
		}),
	]

	return (
		<>
			<InternalPageHeader
				title='Approval Queue'
				description='Review and approve quotes that have been reviewed by sales reps and are ready for approval.'
			/>

			{/* Approval Queue Grid */}
			<Card>
				<div className='card-body p-3 sm:p-6'>
					<div data-testid='approval-queue'>
						<RichDataGrid<QuoteRow>
							columns={columns}
							fetcher={fetcher}
							filterKey='approval-queue'
							defaultPageSize={25}
							defaultSorting={[
								{ columnId: createColumnId('createdAt'), direction: SortDirection.Ascending },
							]}
							enableGlobalSearch
							enableColumnFilters
							enableRowSelection={false}
							enableColumnResizing
							searchPlaceholder='Search quotes by company name or email...'
							persistStateKey='approval-queue-grid'
							emptyState={
								<div className='flex flex-col items-center gap-3 py-12'>
									<CheckCircle2 className='w-12 h-12 text-base-content/40' />
									<p className='text-base-content/60 font-medium'>No quotes pending approval</p>
									<p className='text-sm text-base-content/40'>
										Quotes will appear here when sales reps mark them as ready for approval.
									</p>
								</div>
							}
							ariaLabel='Approval queue'
						/>
					</div>
				</div>
			</Card>
		</>
	)
}
