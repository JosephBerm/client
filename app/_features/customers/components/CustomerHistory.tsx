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
import PaginationControls from '@_components/store/PaginationControls'
import Button from '@_components/ui/Button'

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
	const [orders, setOrders] = useState<Order[]>([])
	const [quotes, setQuotes] = useState<Quote[]>([])
	const [ordersTotal, setOrdersTotal] = useState(0)
	const [quotesTotal, setQuotesTotal] = useState(0)
	const [ordersPage, setOrdersPage] = useState(1)
	const [quotesPage, setQuotesPage] = useState(1)
	const [isLoadingOrders, setIsLoadingOrders] = useState(false)
	const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)

	// Fetch orders
	const fetchOrders = useCallback(async (page: number) => {
		setIsLoadingOrders(true)
		try {
			const filter = new GenericSearchFilter()
			filter.add('CustomerId', String(customerId))
			filter.page = page
			filter.pageSize = pageSize
			filter.sortBy = 'CreatedAt'
			filter.sortOrder = 'desc'

			const { data } = await API.Orders.search(filter)
			
			if (data.payload) {
				setOrders(data.payload.data ?? [])
				setOrdersTotal(data.payload.total ?? 0)
			}
		} catch (error) {
			notificationService.error('Failed to load orders', {
				metadata: { error, customerId },
				component: 'CustomerHistory',
				action: 'fetchOrders',
			})
		} finally {
			setIsLoadingOrders(false)
		}
	}, [customerId, pageSize])

	// Fetch quotes
	const fetchQuotes = useCallback(async (page: number) => {
		setIsLoadingQuotes(true)
		try {
			const filter = new GenericSearchFilter()
			filter.add('CustomerId', String(customerId))
			filter.page = page
			filter.pageSize = pageSize
			filter.sortBy = 'CreatedAt'
			filter.sortOrder = 'desc'

			const { data } = await API.Quotes.search(filter)
			
			if (data.payload) {
				setQuotes(data.payload.data ?? [])
				setQuotesTotal(data.payload.total ?? 0)
			}
		} catch (error) {
			notificationService.error('Failed to load quotes', {
				metadata: { error, customerId },
				component: 'CustomerHistory',
				action: 'fetchQuotes',
			})
		} finally {
			setIsLoadingQuotes(false)
		}
	}, [customerId, pageSize])

	// Fetch data on mount and tab change
	useEffect(() => {
		if (activeTab === 'orders') {
			void fetchOrders(ordersPage)
		} else {
			void fetchQuotes(quotesPage)
		}
	}, [activeTab, ordersPage, quotesPage, fetchOrders, fetchQuotes])

	// Handle pagination
	const handleOrdersPageChange = (newPage: number) => {
		setOrdersPage(newPage)
	}

	const handleQuotesPageChange = (newPage: number) => {
		setQuotesPage(newPage)
	}

	// Refresh current tab
	const handleRefresh = () => {
		if (activeTab === 'orders') {
			void fetchOrders(ordersPage)
		} else {
			void fetchQuotes(quotesPage)
		}
	}

	// Calculate total pages
	const ordersTotalPages = Math.ceil(ordersTotal / pageSize)
	const quotesTotalPages = Math.ceil(quotesTotal / pageSize)

	return (
		<div className={`card bg-base-100 border border-base-300 shadow-sm ${className}`}>
			<div className="card-body p-4 sm:p-6">
				{/* Header with tabs */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
					<h3 className="text-lg font-semibold">Customer History</h3>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleRefresh}
							leftIcon={<RefreshCw size={14} />}
						>
							Refresh
						</Button>
					</div>
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
				<OrdersTab
					orders={orders}
					isLoading={isLoadingOrders}
					currentPage={ordersPage}
					totalPages={ordersTotalPages}
					totalItems={ordersTotal}
					pageSize={pageSize}
					onPageChange={handleOrdersPageChange}
				/>
			) : (
				<QuotesTab
					quotes={quotes}
					isLoading={isLoadingQuotes}
					currentPage={quotesPage}
					totalPages={quotesTotalPages}
					totalItems={quotesTotal}
					pageSize={pageSize}
					onPageChange={handleQuotesPageChange}
				/>
			)}
			</div>
		</div>
	)
}

/**
 * Orders tab content.
 * Uses existing OrderStatusBadge and PaginationControls components (DRY principle).
 */
interface OrdersTabProps {
	orders: Order[]
	isLoading: boolean
	currentPage: number
	totalPages: number
	totalItems: number
	pageSize: number
	onPageChange: (page: number) => void
}

function OrdersTab({
	orders,
	isLoading,
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
}: OrdersTabProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<span className="loading loading-spinner loading-md" />
			</div>
		)
	}

	if (orders.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-base-content/60">
				<Package size={32} className="mb-2" />
				<p>No orders found</p>
			</div>
		)
	}

	return (
		<>
			<div className="overflow-x-auto">
				{/* eslint-disable-next-line no-restricted-syntax -- Semantic HTML table for tabular order data */}
				<table className="table table-sm">
					<thead>
						<tr>
							<th>Order #</th>
							<th>Date</th>
							<th>Status</th>
							<th>Total</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id}>
								<td className="font-medium">
									#{order.id}
								</td>
								<td className="text-base-content/70">
									{formatDate(order.createdAt, 'short')}
								</td>
								<td>
									<OrderStatusBadge 
										status={(order.status ?? 100) as OrderStatus} 
										className="badge-sm"
									/>
								</td>
								<td className="font-medium">
									{formatCurrency(order.total ?? 0)}
								</td>
								<td>
									<Link href={Routes.Orders.detail(order.id ?? 0)}>
										<Button variant="ghost" size="sm">
											<Eye size={14} />
										</Button>
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination - Using enterprise PaginationControls component */}
			{totalPages > 1 && (
				<div className="mt-4">
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						displayedItems={orders.length}
						onPageChange={onPageChange}
						pageRange={1}
					/>
				</div>
			)}
		</>
	)
}

/**
 * Quotes tab content.
 * Uses existing QuoteStatusBadge and PaginationControls components (DRY principle).
 */
interface QuotesTabProps {
	quotes: Quote[]
	isLoading: boolean
	currentPage: number
	totalPages: number
	totalItems: number
	pageSize: number
	onPageChange: (page: number) => void
}

function QuotesTab({
	quotes,
	isLoading,
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
}: QuotesTabProps) {
	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<span className="loading loading-spinner loading-md" />
			</div>
		)
	}

	if (quotes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-base-content/60">
				<FileText size={32} className="mb-2" />
				<p>No quotes found</p>
			</div>
		)
	}

	return (
		<>
			<div className="overflow-x-auto">
				{/* eslint-disable-next-line no-restricted-syntax -- Semantic HTML table for tabular quote data */}
				<table className="table table-sm">
					<thead>
						<tr>
							<th>Quote</th>
							<th>Date</th>
							<th>Status</th>
							<th>Items</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{quotes.map((quote) => (
							<tr key={quote.id}>
								<td className="font-medium truncate max-w-[150px]">
									{quote.id?.substring(0, 8) ?? '—'}
								</td>
								<td className="text-base-content/70">
									{formatDate(quote.createdAt, 'short')}
								</td>
								<td>
									<QuoteStatusBadge 
										status={(quote.status ?? 0) as QuoteStatus} 
										className="badge-sm"
									/>
								</td>
								<td className="text-center">
									{quote.products?.length ?? 0}
								</td>
								<td>
									<Link href={Routes.Quotes.detail(quote.id ?? '')}>
										<Button variant="ghost" size="sm">
											<Eye size={14} />
										</Button>
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination - Using enterprise PaginationControls component */}
			{totalPages > 1 && (
				<div className="mt-4">
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						displayedItems={quotes.length}
						onPageChange={onPageChange}
						pageRange={1}
					/>
				</div>
			)}
		</>
	)
}

