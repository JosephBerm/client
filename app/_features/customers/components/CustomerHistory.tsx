/**
 * CustomerHistory Component
 * 
 * Displays a combined view of customer order and quote history.
 * Shows recent activity in a unified timeline format.
 * 
 * **Features:**
 * - Tab navigation between Orders and Quotes
 * - Paginated data display
 * - Status badges for each item
 * - Quick actions (view details)
 * - Loading states
 * - Empty states
 * 
 * **RBAC:**
 * - Customer: Can view their own history
 * - SalesRep: Can view assigned customers' history
 * - SalesManager+: Can view all customers' history
 * 
 * @see prd_customers.md - US-CUST-001, US-CUST-002
 * @module customers/components
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'

import { Eye, FileText, Package, RefreshCw } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { formatDate } from '@_lib/dates'
import { formatCurrency } from '@_lib/formatters/currency'

import { notificationService, API } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type { OrderStatus, QuoteStatus } from '@_classes/Enums'
import OrderStatusHelper from '@_classes/Helpers/OrderStatusHelper'
import QuoteStatusHelper from '@_classes/Helpers/QuoteStatusHelper'
import type Order from '@_classes/Order'
import type Quote from '@_classes/Quote'

import OrderStatusBadge from '@_components/common/OrderStatusBadge'
import QuoteStatusBadge from '@_components/common/QuoteStatusBadge'
import Button from '@_components/ui/Button'
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

/**
 * CustomerHistory props interface.
 */
interface CustomerHistoryProps {
	/** Customer ID to fetch history for */
	customerId: number
	/** Initial tab to show */
	initialTab?: 'orders' | 'quotes'
	/** Maximum items to show per page */
	pageSize?: number
	/** Additional CSS classes */
	className?: string
}

type TabType = 'orders' | 'quotes'

/**
 * CustomerHistory Component
 * 
 * Displays order and quote history for a customer in a tabbed interface.
 */
export default function CustomerHistory({
	customerId,
	initialTab = 'orders',
	pageSize = 5,
	className = '',
}: CustomerHistoryProps) {
	// State
	const [activeTab, setActiveTab] = useState<TabType>(initialTab)
	const [ordersTotal, setOrdersTotal] = useState(0)
	const [quotesTotal, setQuotesTotal] = useState(0)

	// Fetch totals for badge display
	useEffect(() => {
		const fetchTotals = async () => {
			try {
				// Fetch orders total
				const ordersFilter = new GenericSearchFilter()
				ordersFilter.add('CustomerId', String(customerId))
				ordersFilter.page = 1
				ordersFilter.pageSize = 1
				const { data: ordersData } = await API.Orders.search(ordersFilter)
				setOrdersTotal(ordersData.payload?.total ?? 0)

				// Fetch quotes total
				const quotesFilter = new GenericSearchFilter()
				quotesFilter.add('CustomerId', String(customerId))
				quotesFilter.page = 1
				quotesFilter.pageSize = 1
				const { data: quotesData } = await API.Quotes.search(quotesFilter)
				setQuotesTotal(quotesData.payload?.total ?? 0)
			} catch (error) {
				notificationService.error('Failed to load history totals', {
					metadata: { error, customerId },
					component: 'CustomerHistory',
					action: 'fetchTotals',
				})
			}
		}
		void fetchTotals()
	}, [customerId])

	return (
		<div className={`card bg-base-100 border border-base-300 shadow-sm ${className}`}>
			<div className="card-body p-4 sm:p-6">
				{/* Header with tabs */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
					<h3 className="text-lg font-semibold">Customer History</h3>
				</div>

				{/* Tabs */}
				<div className="tabs tabs-boxed bg-base-200 mb-4">
					<Button
						variant="ghost"
						className={`tab gap-2 ${activeTab === 'orders' ? 'tab-active' : ''}`}
						onClick={() => setActiveTab('orders')}
					>
						<Package size={16} />
						Orders
						<span className="badge badge-sm">{ordersTotal}</span>
					</Button>
					<Button
						variant="ghost"
						className={`tab gap-2 ${activeTab === 'quotes' ? 'tab-active' : ''}`}
						onClick={() => setActiveTab('quotes')}
					>
						<FileText size={16} />
						Quotes
						<span className="badge badge-sm">{quotesTotal}</span>
					</Button>
				</div>

			{/* Content */}
			{activeTab === 'orders' ? (
				<OrdersTab customerId={customerId} pageSize={pageSize} />
			) : (
				<QuotesTab customerId={customerId} pageSize={pageSize} />
			)}
			</div>
		</div>
	)
}

/**
 * Orders tab content.
 * Uses RichDataGrid for consistent table display (DRY principle).
 */
interface OrdersTabProps {
	customerId: number
	pageSize: number
}

function OrdersTab({ customerId, pageSize }: OrdersTabProps) {
	const columnHelper = createRichColumnHelper<Order>()

	const columns: RichColumnDef<Order, unknown>[] = [
		columnHelper.accessor('id', {
			header: 'Order #',
			filterType: FilterType.Number,
			cell: ({ row }) => (
				<span className="font-medium">#{row.original.id}</span>
			),
		}),
		columnHelper.accessor('createdAt', {
			header: 'Date',
			filterType: FilterType.Date,
			cell: ({ row }) => (
				<span className="text-base-content/70">{formatDate(row.original.createdAt, 'short')}</span>
			),
		}),
		columnHelper.accessor('status', {
			header: 'Status',
			filterType: FilterType.Select,
			cell: ({ row }) => (
				<OrderStatusBadge 
					status={(row.original.status ?? 100) as OrderStatus} 
					className="badge-sm"
				/>
			),
		}),
		columnHelper.accessor('total', {
			header: 'Total',
			filterType: FilterType.Number,
			cell: ({ row }) => (
				<span className="font-medium">{formatCurrency(row.original.total ?? 0)}</span>
			),
		}),
		columnHelper.display({
			id: 'actions',
			header: '',
			cell: ({ row }) => (
				<Link href={Routes.Orders.detail(row.original.id ?? 0)}>
					<Button variant="ghost" size="sm">
						<Eye size={14} />
					</Button>
				</Link>
			),
		}),
	]

	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<Order>> => {
		const searchFilter = new GenericSearchFilter()
		searchFilter.add('CustomerId', String(customerId))
		searchFilter.page = filter.page
		searchFilter.pageSize = filter.pageSize
		searchFilter.sortBy = 'CreatedAt'
		searchFilter.sortOrder = 'desc'

		const { data } = await API.Orders.search(searchFilter)
		
		if (data.payload) {
			return {
				data: data.payload.data ?? [],
				page: filter.page,
				pageSize: filter.pageSize,
				total: data.payload.total ?? 0,
				totalPages: data.payload.totalPages ?? 0,
				hasNext: (data.payload.totalPages ?? 0) > filter.page,
				hasPrevious: filter.page > 1,
			}
		}

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

	return (
		<RichDataGrid<Order>
			columns={columns}
			fetcher={fetcher}
			filterKey="customer-orders"
			defaultPageSize={pageSize}
			defaultSorting={[
				{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending },
			]}
			enableGlobalSearch={false}
			enableColumnFilters={false}
			enableRowSelection={false}
			showToolbar={false}
			ariaLabel="Customer orders"
			emptyState={
				<div className="flex flex-col items-center justify-center py-8 text-base-content/60">
					<Package size={32} className="mb-2" />
					<p>No orders found</p>
				</div>
			}
		/>
	)
}

/**
 * Quotes tab content.
 * Uses RichDataGrid for consistent table display (DRY principle).
 */
interface QuotesTabProps {
	customerId: number
	pageSize: number
}

function QuotesTab({ customerId, pageSize }: QuotesTabProps) {
	const columnHelper = createRichColumnHelper<Quote>()

	const columns: RichColumnDef<Quote, unknown>[] = [
		columnHelper.accessor('id', {
			header: 'Quote',
			filterType: FilterType.Text,
			cell: ({ row }) => (
				<span className="font-medium truncate max-w-[150px]">
					{row.original.id?.substring(0, 8) ?? '—'}
				</span>
			),
		}),
		columnHelper.accessor('createdAt', {
			header: 'Date',
			filterType: FilterType.Date,
			cell: ({ row }) => (
				<span className="text-base-content/70">{formatDate(row.original.createdAt, 'short')}</span>
			),
		}),
		columnHelper.accessor('status', {
			header: 'Status',
			filterType: FilterType.Select,
			cell: ({ row }) => (
				<QuoteStatusBadge 
					status={(row.original.status ?? 0) as QuoteStatus} 
					className="badge-sm"
				/>
			),
		}),
		columnHelper.display({
			id: 'items',
			header: 'Items',
			cell: ({ row }) => (
				<span className="text-center">{row.original.products?.length ?? 0}</span>
			),
		}),
		columnHelper.display({
			id: 'actions',
			header: '',
			cell: ({ row }) => (
				<Link href={Routes.Quotes.detail(row.original.id ?? '')}>
					<Button variant="ghost" size="sm">
						<Eye size={14} />
					</Button>
				</Link>
			),
		}),
	]

	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<Quote>> => {
		const searchFilter = new GenericSearchFilter()
		searchFilter.add('CustomerId', String(customerId))
		searchFilter.page = filter.page
		searchFilter.pageSize = filter.pageSize
		searchFilter.sortBy = 'CreatedAt'
		searchFilter.sortOrder = 'desc'

		const { data } = await API.Quotes.search(searchFilter)
		
		if (data.payload) {
			return {
				data: data.payload.data ?? [],
				page: filter.page,
				pageSize: filter.pageSize,
				total: data.payload.total ?? 0,
				totalPages: data.payload.totalPages ?? 0,
				hasNext: (data.payload.totalPages ?? 0) > filter.page,
				hasPrevious: filter.page > 1,
			}
		}

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

	return (
		<RichDataGrid<Quote>
			columns={columns}
			fetcher={fetcher}
			filterKey="customer-quotes"
			defaultPageSize={pageSize}
			defaultSorting={[
				{ columnId: createColumnId('createdAt'), direction: SortDirection.Descending },
			]}
			enableGlobalSearch={false}
			enableColumnFilters={false}
			enableRowSelection={false}
			showToolbar={false}
			ariaLabel="Customer quotes"
			emptyState={
				<div className="flex flex-col items-center justify-center py-8 text-base-content/60">
					<FileText size={32} className="mb-2" />
					<p>No quotes found</p>
				</div>
			}
		/>
	)
}

