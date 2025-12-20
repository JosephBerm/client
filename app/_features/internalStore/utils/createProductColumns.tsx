/**
 * createProductColumns Utility
 * 
 * Factory function for creating TanStack Table column definitions.
 * Follows the same pattern as createProviderColumns and createCustomerColumns.
 * 
 * **Features:**
 * - Type-safe column definitions
 * - Dynamic action buttons based on permissions
 * - Responsive cell rendering
 * - Stock status badges
 * - Category badges
 * - Cost column (only visible to SalesRep or above)
 * 
 * @see prd_products.md - Role-Based Requirements
 * @module internalStore/utils
 */

'use client'

import Link from 'next/link'

import { Archive, Eye, RotateCcw, Trash2 } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { formatCurrency } from '@_shared'

import type { Product } from '@_classes/Product'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'

import type { ProductColumnsConfig } from '../types'
import { getStockStatusConfig } from '../constants'

import type { ColumnDef } from '@tanstack/react-table'

/**
 * Creates column definitions for the product data grid.
 * 
 * **Role-Based Columns:**
 * - Cost column only shown when `showCost` is true (SalesRep+ per PRD)
 * 
 * @param config - Configuration including permissions and callbacks
 * @returns Array of TanStack Table column definitions
 * 
 * @example
 * ```tsx
 * const columns = createProductColumns({
 *   canDelete: isAdmin,
 *   showCost: isSalesRepOrAbove,  // Only show cost to staff
 *   onDelete: openDeleteModal,
 *   onArchive: openArchiveModal,
 *   onRestore: handleRestore,
 * })
 * 
 * return <ServerDataGrid columns={columns} ... />
 * ```
 */
export function createProductColumns(
	config: ProductColumnsConfig
): ColumnDef<Product>[] {
	const { canDelete, showCost = false, onDelete, onArchive, onRestore } = config

	const columns: ColumnDef<Product>[] = [
		// Product Name
		{
			accessorKey: 'name',
			header: 'Product',
			cell: ({ row }) => (
				<div className="min-w-[150px]">
					<Link
						href={Routes.InternalStore.detail(row.original.id)}
						className="font-medium text-primary hover:text-primary-focus hover:underline"
					>
						{row.original.name}
					</Link>
					{row.original.sku && (
						<p className="mt-0.5 text-xs text-base-content/50">
							SKU: {row.original.sku}
						</p>
					)}
				</div>
			),
		},

		// Description (hidden on mobile)
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => (
				<div className="hidden md:block max-w-[250px]">
					<p className="line-clamp-2 text-sm text-base-content/70">
						{row.original.description || 'No description'}
					</p>
				</div>
			),
		},

		// Price (customer-facing display price)
		{
			accessorKey: 'price',
			header: 'Price',
			cell: ({ row }) => (
				<span className="font-medium tabular-nums">
					{formatCurrency(row.original.price || 0)}
				</span>
			),
		},
	]

	// Cost column - only shown to SalesRep or above (per PRD)
	if (showCost) {
		columns.push({
			accessorKey: 'cost',
			header: 'Cost',
			cell: ({ row }) => {
				const cost = row.original.cost
				if (cost == null) {
					return <span className="text-base-content/40">—</span>
				}
				return (
					<span className="font-medium tabular-nums text-base-content/70">
						{formatCurrency(cost)}
					</span>
				)
			},
		})
	}

	// Add remaining columns
	columns.push(
		// Stock
		{
			accessorKey: 'stock',
			header: 'Stock',
			cell: ({ row }) => {
				const stock = row.original.stock || 0
				const statusConfig = getStockStatusConfig(stock)

				return (
					<div className="flex items-center gap-2">
						<Badge variant={statusConfig.variant} size="sm">
							{stock}
						</Badge>
						<span className="hidden lg:inline text-xs text-base-content/50">
							{statusConfig.label}
						</span>
					</div>
				)
			},
		},

		// Categories (hidden on small screens)
		{
			accessorKey: 'categories',
			header: 'Categories',
			cell: ({ row }) => {
				const categories = row.original.categories || []
				
				if (categories.length === 0) {
					return (
						<span className="text-sm text-base-content/50">
							Uncategorized
						</span>
					)
				}

				return (
					<div className="hidden sm:flex flex-wrap gap-1">
						{categories.slice(0, 2).map((category) => (
							<Badge
								key={category.id}
								variant="info"
								size="sm"
							>
								{category.name}
							</Badge>
						))}
						{categories.length > 2 && (
							<Badge variant="neutral" size="sm">
								+{categories.length - 2}
							</Badge>
						)}
					</div>
				)
			},
		},

		// Actions
		{
			id: 'actions',
			header: '',
			cell: ({ row }) => {
				const product = row.original
				const isArchived = product.isArchived || false

				return (
					<div className="flex items-center justify-end gap-1">
						{/* View - Using Link directly for proper accessibility */}
						<Link
							href={Routes.InternalStore.detail(product.id)}
							className="btn btn-ghost btn-sm btn-square"
							aria-label={`View ${product.name}`}
						>
							<Eye className="h-4 w-4" />
						</Link>

						{/* Archive/Restore */}
						{canDelete && (
							<>
								{isArchived ? (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onRestore(product)}
										aria-label={`Restore ${product.name}`}
										className="btn-square text-success hover:text-success"
									>
										<RotateCcw className="h-4 w-4" />
									</Button>
								) : (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onArchive(product)}
										aria-label={`Archive ${product.name}`}
										className="btn-square text-warning hover:text-warning"
									>
										<Archive className="h-4 w-4" />
									</Button>
								)}

								{/* Delete (only show for archived products or always for admin) */}
								{isArchived && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDelete(product)}
										aria-label={`Delete ${product.name}`}
										className="btn-square text-error hover:text-error"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</>
						)}
					</div>
				)
			},
		}
	)

	return columns
}

export default createProductColumns

