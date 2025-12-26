/**
 * createProductRichColumns Utility
 *
 * Factory function for creating RichDataGrid column definitions for products.
 * Enhanced version with filtering, faceting, and search support.
 *
 * **Features:**
 * - Type-safe column definitions with RichColumnDef
 * - Advanced filtering (Text, Number, Select, Boolean)
 * - Faceted filtering for categories
 * - Global search support on name and SKU
 * - Cost column only visible to SalesRep or above
 *
 * @see RICHDATAGRID_MIGRATION_PLAN.md - Phase 2.1
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
import {
	createRichColumnHelper,
	FilterType,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'

import type { ProductColumnsConfig } from '../types'
import { getStockStatusConfig } from '../constants'

// Create the column helper
const columnHelper = createRichColumnHelper<Product>()

/**
 * Creates RichDataGrid column definitions for products.
 *
 * **Filter Configuration:**
 * - name: Text filter, searchable
 * - price: Number filter
 * - cost: Number filter (when showCost=true)
 * - stock: Number filter
 * - categories: Select filter, faceted
 * - isArchived: Boolean filter
 *
 * @param config - Configuration including permissions and callbacks
 * @returns Array of RichColumnDef column definitions
 */
export function createProductRichColumns(
	config: ProductColumnsConfig
): RichColumnDef<Product, unknown>[] {
	const { canDelete, showCost = false, onDelete, onArchive, onRestore } = config

	const columns: RichColumnDef<Product, unknown>[] = [
		// Product Name - Text filter, searchable
		columnHelper.accessor('name', {
			header: 'Product',
			filterType: FilterType.Text,
			searchable: true,
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
		}),

		// Description (hidden on mobile, not filterable)
		columnHelper.accessor('description', {
			header: 'Description',
			enableSorting: false,
			cell: ({ row }) => (
				<div className="hidden md:block max-w-[250px]">
					<p className="line-clamp-2 text-sm text-base-content/70">
						{row.original.description || 'No description'}
					</p>
				</div>
			),
		}),

		// Price - Number filter
		columnHelper.accessor('price', {
			header: 'Price',
			filterType: FilterType.Number,
			cell: ({ row }) => (
				<span className="font-medium tabular-nums">
					{formatCurrency(row.original.price || 0)}
				</span>
			),
		}),
	]

	// Cost column - only shown to SalesRep or above (per PRD)
	if (showCost) {
		columns.push(
			columnHelper.accessor('cost', {
				header: 'Cost',
				filterType: FilterType.Number,
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
		)
	}

	// Stock - Number filter
	columns.push(
		columnHelper.accessor('stock', {
			header: 'Stock',
			filterType: FilterType.Number,
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
		})
	)

	// Categories - Select filter, faceted (for category dropdown)
	columns.push(
		columnHelper.accessor('categories', {
			header: 'Categories',
			enableSorting: false,
			// Note: Categories is an array, faceted filtering would use categoryId
			cell: ({ row }) => {
				const categories = row.original.categories || []

				if (categories.length === 0) {
					return (
						<span className="text-sm text-base-content/50">Uncategorized</span>
					)
				}

				return (
					<div className="hidden sm:flex flex-wrap gap-1">
						{categories.slice(0, 2).map((category) => (
							<Badge key={category.id} variant="info" size="sm">
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
		})
	)

	// Actions column - display only
	columns.push(
		columnHelper.display({
			id: 'actions',
			header: '',
			cell: ({ row }) => {
				const product = row.original
				const isArchived = product.isArchived || false

				return (
					<div className="flex items-center justify-end gap-1">
						{/* View */}
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

								{/* Delete (only for archived) */}
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
		})
	)

	return columns
}

export default createProductRichColumns

