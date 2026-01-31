/**
 * Inventory Management Page
 *
 * Centralized inventory management for all products.
 * Provides overview of stock levels, low stock alerts, and transaction history.
 *
 * **PRD Reference:** Features and Pages Missing - Item 4 (Inventory views)
 *
 * **Features:**
 * - Inventory overview with stats cards (reuses ProductStatsGrid)
 * - Product stock levels table (on-hand, reserved, available)
 * - Low stock alerts
 * - Inventory transaction history (placeholder)
 *
 * **DRY Compliance:**
 * - Uses existing useProductStats hook from @_features/internalStore
 * - Uses existing ProductStatsGrid component
 * - Uses RichDataGrid with same patterns as store page
 * - Uses existing Button, Card, Input components
 *
 * **RBAC:**
 * - View: Admin, SalesManager, FulfillmentCoordinator
 * - Adjust: Admin only
 *
 * @module app/inventory/page
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { Package, AlertTriangle, TrendingDown, History, RefreshCw } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { ProductStatsGrid, useProductStats, PRODUCT_API_INCLUDES } from '@_features/internalStore'
import { API } from '@_shared'
import type { StockStatusFilter, InventoryTabId } from '@_types/inventory.types'
import type { Product } from '@_classes/Product'

import { RichDataGrid, FilterType, SortDirection, createColumnId } from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult, RichColumnDef } from '@_components/tables/RichDataGrid'
import Card from '@_components/ui/Card'
import Surface from '@_components/ui/Surface'
import Button from '@_components/ui/Button'
import { Tabs, TabsList, Tab, TabPanel } from '@_components/ui/Tabs'

import { InternalPageHeader } from '../_components'

// =========================================================================
// CONSTANTS
// =========================================================================

/** Low stock threshold - products with stock <= this value are considered low */
const LOW_STOCK_THRESHOLD = 10

// =========================================================================
// COLUMN DEFINITIONS
// =========================================================================

/**
 * Creates inventory table columns following RichDataGrid patterns.
 * Follows same pattern as createProductRichColumns in store page.
 */
function createInventoryColumns(): RichColumnDef<Product>[] {
	return [
		{
			id: createColumnId('name'),
			header: 'Product',
			accessorKey: 'name',
			enableSorting: true,
			enableColumnFilter: true,
			cell: ({ row }) => (
				<div>
					<div className='font-medium'>{row.original.name}</div>
					{row.original.manufacturer && (
						<div className='text-sm text-base-content/60'>{row.original.manufacturer}</div>
					)}
				</div>
			),
		},
		{
			id: createColumnId('sku'),
			header: 'SKU',
			accessorKey: 'sku',
			enableSorting: true,
			cell: ({ row }) => <span className='font-mono text-sm'>{row.original.sku || '-'}</span>,
		},
		{
			id: createColumnId('category'),
			header: 'Category',
			accessorKey: 'category',
			enableSorting: true,
		},
		{
			id: createColumnId('stock'),
			header: 'On-Hand',
			accessorKey: 'stock',
			enableSorting: true,
			cell: ({ row }) => <span className='font-semibold text-right block'>{row.original.stock}</span>,
		},
		// Reserved column (calculated - placeholder for now)
		{
			id: createColumnId('reserved'),
			header: 'Reserved',
			accessorFn: () => 0, // TODO: Calculate from pending orders/quotes
			enableSorting: false,
			cell: () => <span className='text-base-content/60 text-right block'>0</span>,
		},
		// Available column (calculated)
		{
			id: createColumnId('available'),
			header: 'Available',
			accessorFn: (row: Product) => row.stock, // TODO: Subtract reserved
			enableSorting: true,
			cell: ({ row }) => <span className='font-semibold text-right block'>{row.original.stock}</span>,
		},
		// Status column with badge
		{
			id: createColumnId('status'),
			header: 'Status',
			accessorFn: (row: Product) => {
				if (row.stock === 0) return 'Out of Stock'
				if (row.stock <= LOW_STOCK_THRESHOLD) return 'Low Stock'
				return 'In Stock'
			},
			cell: ({ row }) => {
				const stock = row.original.stock
				if (stock === 0) {
					return <span className='badge badge-error badge-sm'>Out of Stock</span>
				}
				if (stock <= LOW_STOCK_THRESHOLD) {
					return <span className='badge badge-warning badge-sm'>Low Stock</span>
				}
				return <span className='badge badge-success badge-sm'>In Stock</span>
			},
		},
		// Actions column
		{
			id: createColumnId('actions'),
			header: 'Actions',
			enableSorting: false,
			cell: ({ row }) => (
				<Link href={Routes.InternalStore.detail(row.original.id)}>
					<Button
						variant='ghost'
						size='sm'>
						View
					</Button>
				</Link>
			),
		},
	]
}

// =========================================================================
// LOW STOCK ALERTS COMPONENT
// =========================================================================

interface LowStockAlertsProps {
	refreshKey: number
}

function LowStockAlerts({ refreshKey }: LowStockAlertsProps) {
	const [products, setProducts] = useState<Product[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Fetch low stock products
	useEffect(() => {
		const fetchLowStock = async () => {
			setIsLoading(true)
			try {
				const response = await API.Store.Products.richSearch({
					page: 1,
					pageSize: 50,
					sorting: [{ columnId: createColumnId('stock'), direction: SortDirection.Ascending }],
					columnFilters: [],
				})
				if (response.data?.payload?.data) {
					// Filter to low/out of stock only
					const filtered = response.data.payload.data.filter((p: Product) => p.stock <= LOW_STOCK_THRESHOLD)
					setProducts(filtered)
				}
			} catch {
				// Silent fail - non-critical
			} finally {
				setIsLoading(false)
			}
		}
		void fetchLowStock()
	}, [refreshKey])

	const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
	const outOfStockProducts = products.filter((p) => p.stock === 0)

	if (isLoading) {
		return (
			<div className='animate-pulse space-y-4'>
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className='h-20 bg-base-300 rounded'
					/>
				))}
			</div>
		)
	}

	if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
		return (
			<div className='text-center py-12'>
				<Package className='h-12 w-12 text-success mx-auto mb-4' />
				<p className='text-base-content/60'>All products are well-stocked!</p>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Out of Stock Section */}
			{outOfStockProducts.length > 0 && (
				<div>
					<h3 className='text-lg font-semibold text-error mb-3 flex items-center gap-2'>
						<AlertTriangle className='h-5 w-5' />
						Out of Stock ({outOfStockProducts.length})
					</h3>
					<div className='grid gap-3 sm:grid-cols-2'>
						{outOfStockProducts.map((product) => (
							<Card
								key={product.id}
								className='border border-error/30 bg-error/5 p-4'>
								<div className='flex items-center justify-between'>
									<div className='min-w-0 flex-1'>
										<p className='font-medium truncate'>{product.name}</p>
										<p className='text-sm text-base-content/60'>SKU: {product.sku || 'N/A'}</p>
									</div>
									<Link href={Routes.InternalStore.detail(product.id)}>
										<Button
											variant='ghost'
											size='sm'>
											Restock
										</Button>
									</Link>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Low Stock Section */}
			{lowStockProducts.length > 0 && (
				<div>
					<h3 className='text-lg font-semibold text-warning mb-3 flex items-center gap-2'>
						<TrendingDown className='h-5 w-5' />
						Low Stock ({lowStockProducts.length})
					</h3>
					<div className='grid gap-3 sm:grid-cols-2'>
						{lowStockProducts.map((product) => (
							<Card
								key={product.id}
								className='border border-warning/30 bg-warning/5 p-4'>
								<div className='flex items-center justify-between'>
									<div className='min-w-0 flex-1'>
										<p className='font-medium truncate'>{product.name}</p>
										<p className='text-sm text-base-content/60'>{product.stock} units remaining</p>
									</div>
									<Link href={Routes.InternalStore.detail(product.id)}>
										<Button
											variant='ghost'
											size='sm'>
											View
										</Button>
									</Link>
								</div>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================

export default function InventoryPage() {
	// ---------------------------------------------------------------------------
	// STATE & HOOKS
	// ---------------------------------------------------------------------------

	const [activeTab, setActiveTab] = useState<InventoryTabId>('overview')
	const [refreshKey, setRefreshKey] = useState(0)
	const [stockFilter, setStockFilter] = useState<StockStatusFilter>('all')

	// Reuse existing hook from internalStore
	const { stats, isLoading: statsLoading, refetch: refetchStats } = useProductStats()

	// Column definitions - React Compiler auto-memoizes
	const columns = createInventoryColumns()

	// ---------------------------------------------------------------------------
	// DATA FETCHER
	// ---------------------------------------------------------------------------

	/**
	 * Custom fetcher for RichDataGrid with inventory-specific filters.
	 */
	const fetcher = async (filter: RichSearchFilter): Promise<RichPagedResult<Product>> => {
		const enhancedFilter: RichSearchFilter = {
			...filter,
			includes: [...PRODUCT_API_INCLUDES],
		}

		// Add stock status filter
		if (stockFilter !== 'all') {
			const stockFilters = {
				'out-of-stock': { operator: 'Equals' as const, value: 0 },
				'low-stock': { operator: 'LessThanOrEquals' as const, value: LOW_STOCK_THRESHOLD },
				'in-stock': { operator: 'GreaterThan' as const, value: LOW_STOCK_THRESHOLD },
			}

			enhancedFilter.columnFilters = [
				...(filter.columnFilters || []),
				{
					columnId: 'stock',
					filterType: FilterType.Number,
					...stockFilters[stockFilter],
				},
			]
		}

		const response = await API.Store.Products.richSearch(enhancedFilter)

		if (response.data?.payload) {
			return response.data.payload
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

	// ---------------------------------------------------------------------------
	// HANDLERS
	// ---------------------------------------------------------------------------

	const handleRefresh = () => {
		setRefreshKey((prev) => prev + 1)
		void refetchStats()
	}

	// ---------------------------------------------------------------------------
	// RENDER
	// ---------------------------------------------------------------------------

	return (
		<>
			{/* Page Header */}
			<InternalPageHeader
				title='Inventory Management'
				description='Monitor stock levels, manage inventory, and track transactions'
				loading={statsLoading}
				actions={
					<Button
						variant='ghost'
						size='sm'
						onClick={handleRefresh}
						disabled={statsLoading}>
						<RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
						<span className='hidden sm:inline'>Refresh</span>
					</Button>
				}
			/>

			{/* Stats Overview - Reusing existing component */}
			<ProductStatsGrid
				stats={stats}
				isLoading={statsLoading}
			/>

			{/* Tabbed Content */}
			<Tabs
				value={activeTab}
				onValueChange={(v) => setActiveTab(v as InventoryTabId)}
				variant='bordered'>
				<TabsList className='mb-6'>
					<Tab
						value='overview'
						icon={<Package className='h-4 w-4' />}>
						Stock Levels
					</Tab>
					<Tab
						value='alerts'
						icon={<AlertTriangle className='h-4 w-4' />}>
						Alerts
						{stats.lowStockProducts + stats.outOfStockProducts > 0 && (
							<span className='badge badge-error badge-sm ml-2'>
								{stats.lowStockProducts + stats.outOfStockProducts}
							</span>
						)}
					</Tab>
					<Tab
						value='transactions'
						icon={<History className='h-4 w-4' />}>
						History
					</Tab>
				</TabsList>

				{/* Stock Levels Tab */}
				<TabPanel value='overview'>
					<Surface variant='subtle' padding='none'>
						{/* Filters */}
						<div className='p-4 border-b border-base-300'>
							<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
								<h3 className='font-semibold'>Stock Levels</h3>
								{/* Stock Filter */}
								<select
									className='select select-bordered select-sm w-full sm:w-auto'
									value={stockFilter}
									onChange={(e) => setStockFilter(e.target.value as StockStatusFilter)}>
									<option value='all'>All Stock</option>
									<option value='in-stock'>In Stock</option>
									<option value='low-stock'>Low Stock</option>
									<option value='out-of-stock'>Out of Stock</option>
								</select>
							</div>
						</div>
						{/* Data Grid */}
						<div className='p-4'>
							<RichDataGrid<Product>
								columns={columns}
								fetcher={fetcher}
								filterKey={`${refreshKey}-${stockFilter}`}
								defaultPageSize={10}
								defaultSorting={[
									{ columnId: createColumnId('stock'), direction: SortDirection.Ascending },
								]}
								enableGlobalSearch
								searchPlaceholder='Search products...'
								persistStateKey='inventory-grid'
								emptyState={
									<div className='text-center py-12'>
										<Package className='h-12 w-12 text-base-content/30 mx-auto mb-4' />
										<p className='text-base-content/60'>No products match your filters</p>
									</div>
								}
								ariaLabel='Inventory table'
							/>
						</div>
					</Surface>
				</TabPanel>

				{/* Alerts Tab */}
				<TabPanel value='alerts'>
					<Surface variant='subtle' padding='lg'>
						<LowStockAlerts refreshKey={refreshKey} />
					</Surface>
				</TabPanel>

				{/* Transaction History Tab */}
				<TabPanel value='transactions'>
					<Surface variant='inset' padding='lg'>
						<div className='text-center py-12'>
							<History className='h-12 w-12 text-base-content/30 mx-auto mb-4' />
							<h3 className='text-lg font-semibold text-base-content mb-2'>Transaction History</h3>
							<p className='text-base-content/60 mb-4'>
								Inventory transaction tracking will show stock movements, adjustments, and audit trail.
							</p>
							<p className='text-sm text-base-content/40'>
								Coming soon: Receipt, adjustment, reservation, and shipment tracking.
							</p>
						</div>
					</Surface>
				</TabPanel>
			</Tabs>
		</>
	)
}
