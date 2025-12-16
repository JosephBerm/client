/**
 * QuoteProducts Component
 * 
 * **Story:** Lists all products requested in the quote with quantities.
 * All roles can see this (read-only for customers).
 * 
 * **Reuses:**
 * - DataGrid from @_components/tables (existing component - no need to create new table)
 * - Card from @_components/ui
 * - ColumnDef type (re-exported from tables barrel)
 * 
 * **Features:**
 * - Product name, SKU, quantity columns
 * - Sorting enabled
 * - Empty state message
 * - Responsive design
 * 
 * @module app/quotes/[id]/_components/QuoteProducts
 */

'use client'

import { PackageSearch } from 'lucide-react'

import type { CartProduct } from '@_classes/Product'

import { DataGrid, type ColumnDef } from '@_components/tables'
import Card from '@_components/ui/Card'

import type { QuoteComponentProps } from './types'

/**
 * QuoteProducts Component Props
 */
export interface QuoteProductsProps extends QuoteComponentProps {
	/** Products array (can be passed directly or extracted from quote) */
	products?: CartProduct[]
}

/**
 * QuoteProducts Component
 * 
 * Displays the products requested in the quote using the existing DataGrid component.
 * Reuses DataGrid to avoid creating duplicate table logic.
 * 
 * @param props - Component props
 * @returns QuoteProducts component
 */
export default function QuoteProducts({ quote, products }: QuoteProductsProps) {
	// Use products prop if provided, otherwise fall back to quote.products
	const displayProducts = products ?? quote?.products ?? []

	// Column definitions (React Compiler auto-memoizes)
	const columns: ColumnDef<CartProduct>[] = [
		{
			accessorKey: 'product.name',
			header: 'Product',
			cell: ({ row }) => {
				const { product } = row.original
				return (
					<div className="flex flex-col">
						<span className="font-semibold text-base-content">
							{product?.name || 'Product pending'}
						</span>
						{product?.sku && (
							<span className="text-xs text-base-content/60 mt-0.5">SKU: {product.sku}</span>
						)}
					</div>
				)
			},
		},
		{
			accessorKey: 'quantity',
			header: 'Quantity',
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<span className="inline-flex items-center justify-center min-w-10 h-8 px-2 rounded-md bg-primary/10 text-sm font-semibold text-primary">
						{row.original.quantity ?? 0}
					</span>
				</div>
			),
		},
	]

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm animate-elegant-reveal">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<PackageSearch className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-base-content">Requested Products</h3>
						<p className="text-sm text-base-content/60 mt-0.5">
							{displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'}
						</p>
					</div>
				</div>
			</div>

			{/* Reuse existing DataGrid - no need to create new table component */}
			<div className="overflow-hidden rounded-lg border border-base-200">
				<DataGrid
					columns={columns}
					data={displayProducts}
					ariaLabel="Quote requested products"
					enableSorting={true}
					enableFiltering={false}
					enablePagination={false}
					enablePageSize={false}
					emptyMessage="No products were included in this quote request."
				/>
			</div>
		</Card>
	)
}

