/**
 * OrderLineItems Component
 * 
 * Displays order products in a data grid with pricing columns.
 * Shows staff-only cost column when applicable.
 * Focused on product line items for high-density workflows.
 * 
 * **Features:**
 * - Product details with SKU
 * - Quantity, unit price, line total
 * - Staff-only cost column (conditional)
 * - Tracking number display
 * 
 * **Performance (Next.js 16 / React 19 Best Practices):**
 * - React.memo: YES - Renders DataGrid with many rows, expensive re-renders
 * - useMemo for columns: YES - Array creation with conditional logic
 * 
 * @see prd_orders.md - Order Management PRD
 * @see https://nextjs.org/docs/app/getting-started/server-and-client-components
 * @module app/orders/[id]/_components/OrderLineItems
 */

'use client'

import { memo, useMemo } from 'react'

import { formatCurrency } from '@_shared'

import type Order from '@_classes/Order'
import type { OrderItem } from '@_classes/Order'

import { DataGrid, type ColumnDef } from '@_components/tables'
import Card from '@_components/ui/Card'

export interface OrderLineItemsProps {
	/** The order containing line items */
	order: Order
	/** Whether to show staff-only columns (cost, margin) */
	showStaffColumns?: boolean
}

/**
 * Order line items table.
 * 
 * Memoized because:
 * - DataGrid renders potentially many rows
 * - Column definitions are expensive to recreate
 * - Parent re-renders shouldn't cause full table re-render
 * 
 * @example
 * ```tsx
 * <OrderLineItems order={order} showStaffColumns={isStaff} />
 * ```
 */
export const OrderLineItems = memo(function OrderLineItems({ 
	order, 
	showStaffColumns = false 
}: OrderLineItemsProps) {
	const products = order.products ?? []

	// ─────────────────────────────────────────────────────────────────────────
	// MEMOIZED: Totals calculation (Array.reduce on products)
	// ─────────────────────────────────────────────────────────────────────────
	// ─────────────────────────────────────────────────────────────────────────
	// MEMOIZED: Column definitions (conditional array construction)
	// ─────────────────────────────────────────────────────────────────────────
	const columns = useMemo<ColumnDef<OrderItem>[]>(() => {
		const baseColumns: ColumnDef<OrderItem>[] = [
			{
				accessorKey: 'product.name',
				header: 'Product',
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-semibold text-base-content">
							{row.original.product?.name ?? 'Product unavailable'}
						</span>
						<span className="text-xs text-base-content/60">
							SKU: {row.original.product?.sku ?? row.original.productId ?? 'N/A'}
						</span>
					</div>
				),
			},
			{
				accessorKey: 'quantity',
				header: 'Qty',
				cell: ({ row }) => (
					<span className="text-base-content/80">{row.original.quantity ?? 0}</span>
				),
			},
			{
				accessorKey: 'sellPrice',
				header: 'Unit Price',
				cell: ({ row }) => (
					<span className="text-base-content/80">{formatCurrency(row.original.sellPrice ?? 0)}</span>
				),
			},
		]

		// Staff-only cost column
		if (showStaffColumns) {
			baseColumns.push({
				accessorKey: 'buyPrice',
				header: 'Cost',
				cell: ({ getValue }) => {
					const buyPrice = getValue() as number | undefined
					return (
						<span className="text-base-content/60">
							{buyPrice ? formatCurrency(buyPrice) : '-'}
						</span>
					)
				},
			})
		}

		// Line total and tracking columns
		baseColumns.push(
			{
				accessorKey: 'total',
				header: 'Line Total',
				cell: ({ row }) => (
					<span className="font-semibold text-base-content">
						{formatCurrency(row.original.total ?? 0)}
					</span>
				),
			},
			{
				accessorKey: 'trackingNumber',
				header: 'Tracking',
				cell: ({ row }) => (
					<span className="text-sm text-base-content/60 font-mono">
						{row.original.trackingNumber ?? '—'}
					</span>
				),
			}
		)

		return baseColumns
	}, [showStaffColumns])

	// ─────────────────────────────────────────────────────────────────────────
	// RENDER
	// ─────────────────────────────────────────────────────────────────────────
	return (
		<Card className="border border-base-200 bg-base-100 p-6 shadow-sm">
			<h3 className="text-lg font-semibold text-base-content mb-6">
				Products ({products.length} items)
			</h3>

			<DataGrid
				columns={columns}
				data={products}
				ariaLabel="Order line items"
				enableSorting={true}
				enableFiltering={false}
				enablePagination={false}
				enablePageSize={false}
				emptyMessage="No products are associated with this order."
			/>

		</Card>
	)
})

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL SUB-COMPONENTS (not exported)
// ─────────────────────────────────────────────────────────────────────────────

export default OrderLineItems
