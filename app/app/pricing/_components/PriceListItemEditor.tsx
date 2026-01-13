/**
 * PriceListItemEditor Component
 *
 * Manages products within a price list using RichDataGrid.
 * Shows current items and allows adding/editing/removing.
 *
 * **PRD Reference:** prd_pricing_engine.md - US-PRICE-005
 *
 * **DRY Compliance:** Uses standardized RichDataGrid component
 * with client-side data (items from parent price list).
 *
 * **Pricing Methods (exactly one):**
 * - Fixed Price: Customer pays exact amount
 * - Percent Discount: X% off base price
 * - Fixed Discount: $X off base price
 *
 * @module app/pricing/_components/PriceListItemEditor
 */

'use client'

import { useState } from 'react'

import { Plus, Trash2, Edit, Package, DollarSign, Percent, Tag } from 'lucide-react'

import { logger } from '@_core'

import { formatCurrency, notificationService } from '@_shared'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import Badge from '@_components/ui/Badge'
import ConfirmationModal from '@_components/ui/ConfirmationModal'
import { RichDataGrid, createRichColumnHelper, FilterType, type RichColumnDef } from '@_components/tables/RichDataGrid'

import { usePriceList, useRemovePriceListItem } from '@_features/pricing'
// Use regular import (not import type) because we need PriceListItem methods
import { PriceListItem } from '@_classes/Pricing'

// =========================================================================
// TYPES
// =========================================================================

interface PriceListItemEditorProps {
	/** Price List ID */
	priceListId: string
	/** Whether user can edit (Admin only) */
	isAdmin: boolean
}

interface DeleteModalState {
	isOpen: boolean
	item: PriceListItem | null
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Editor for managing products in a price list using RichDataGrid.
 *
 * **Features:**
 * - Client-side data grid (items from price list)
 * - Pricing method badges
 * - Savings calculations
 * - Delete with confirmation
 * - Add product modal (placeholder)
 *
 * @param props - Component props
 * @returns PriceListItemEditor component
 */
export default function PriceListItemEditor({ priceListId, isAdmin }: PriceListItemEditorProps) {
	// ---------------------------------------------------------------------------
	// STATE
	// ---------------------------------------------------------------------------

	const [showAddModal, setShowAddModal] = useState(false)
	const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
		isOpen: false,
		item: null,
	})
	const [isDeleting, setIsDeleting] = useState(false)

	// ---------------------------------------------------------------------------
	// HOOKS
	// ---------------------------------------------------------------------------

	const { data: priceList, isLoading, refetch } = usePriceList(priceListId)
	const removeMutation = useRemovePriceListItem()

	const items = priceList?.items ?? []

	// ---------------------------------------------------------------------------
	// HANDLERS
	// ---------------------------------------------------------------------------

	const openDeleteModal = (item: PriceListItem) => {
		setDeleteModal({ isOpen: true, item })
	}

	const closeDeleteModal = () => {
		setDeleteModal({ isOpen: false, item: null })
	}

	const handleDeleteAsync = async (): Promise<void> => {
		if (!deleteModal.item?.id) return

		setIsDeleting(true)

		try {
			await removeMutation.mutateAsync({ itemId: deleteModal.item.id, priceListId })

			notificationService.success(`Removed "${deleteModal.item.productName}" from price list`, {
				metadata: { itemId: deleteModal.item.id, priceListId },
				component: 'PriceListItemEditor',
				action: 'removeItem',
			})
			closeDeleteModal()
			await refetch()
		} catch (error) {
			notificationService.error('Failed to remove product from price list', {
				metadata: { error, itemId: deleteModal.item?.id, priceListId },
				component: 'PriceListItemEditor',
				action: 'removeItem',
			})
		} finally {
			setIsDeleting(false)
		}
	}

	const handleDelete = () => {
		void handleDeleteAsync().catch((error) => {
			logger.error('Unhandled delete error', {
				error,
				component: 'PriceListItemEditor',
				action: 'handleDelete',
			})
		})
	}

	// ---------------------------------------------------------------------------
	// COLUMN DEFINITIONS
	// ---------------------------------------------------------------------------

	const columnHelper = createRichColumnHelper<PriceListItem>()

	const columns: RichColumnDef<PriceListItem, unknown>[] = [
		// Product Name/SKU
		columnHelper.accessor('productName', {
			header: 'Product',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className='flex flex-col'>
					<span className='font-medium text-base-content'>{row.original.productName}</span>
					<span className='text-xs text-base-content/60'>SKU: {row.original.productSku}</span>
				</div>
			),
		}),

		// Base Price
		columnHelper.accessor('basePrice', {
			header: 'Base Price',
			filterType: FilterType.Number,
			cell: ({ row }) => <span className='text-base-content/70'>{formatCurrency(row.original.basePrice)}</span>,
		}),

		// Pricing Method
		columnHelper.display({
			id: 'pricingMethod',
			header: 'Pricing Method',
			cell: ({ row }) => {
				const item = row.original
				const method = item.getPricingMethod()

				if (method === 'fixedPrice') {
					return (
						<Badge
							variant='primary'
							size='sm'>
							<DollarSign className='h-3 w-3 mr-1' />
							Fixed: {formatCurrency(item.fixedPrice!)}
						</Badge>
					)
				}

				if (method === 'percentDiscount') {
					return (
						<Badge
							variant='success'
							size='sm'>
							<Percent className='h-3 w-3 mr-1' />
							{item.percentDiscount}% Off
						</Badge>
					)
				}

				if (method === 'fixedDiscount') {
					return (
						<Badge
							variant='info'
							size='sm'>
							<Tag className='h-3 w-3 mr-1' />
							{formatCurrency(item.fixedDiscount!)} Off
						</Badge>
					)
				}

				return <span className='text-base-content/40'>-</span>
			},
		}),

		// Final Price with Savings
		columnHelper.accessor('calculatedPrice', {
			header: 'Final Price',
			filterType: FilterType.Number,
			cell: ({ row }) => {
				const item = row.original
				const savings = item.basePrice - item.calculatedPrice
				const savingsPercent = item.basePrice > 0 ? (savings / item.basePrice) * 100 : 0

				return (
					<div className='flex flex-col items-end'>
						<span className='font-medium text-base-content'>{formatCurrency(item.calculatedPrice)}</span>
						{savings > 0 && (
							<span className='text-xs text-success'>
								Save {formatCurrency(savings)} ({savingsPercent.toFixed(1)}%)
							</span>
						)}
					</div>
				)
			},
		}),

		// Actions (Admin only)
		...(isAdmin
			? [
					columnHelper.display({
						id: 'actions',
						header: 'Actions',
						cell: ({ row }) => (
							<div className='flex gap-1 justify-end'>
								<Button
									variant='ghost'
									size='sm'
									title='Edit'
									aria-label='Edit product pricing'>
									<Edit className='h-4 w-4' />
								</Button>
								<Button
									variant='ghost'
									size='sm'
									title='Remove'
									className='text-error hover:text-error'
									onClick={() => openDeleteModal(row.original)}
									aria-label='Remove product from price list'>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						),
					}),
			  ]
			: []),
	]

	// ---------------------------------------------------------------------------
	// RENDER: LOADING
	// ---------------------------------------------------------------------------

	if (isLoading) {
		return (
			<Card className='border border-base-300 bg-base-100 p-6 shadow-sm animate-pulse'>
				<div className='h-6 w-32 bg-base-300 rounded mb-4' />
				<div className='space-y-3'>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className='h-16 bg-base-200 rounded'
						/>
					))}
				</div>
			</Card>
		)
	}

	// ---------------------------------------------------------------------------
	// RENDER: GRID
	// ---------------------------------------------------------------------------

	return (
		<>
			<RichDataGrid<PriceListItem>
				columns={columns}
				data={items}
				defaultPageSize={10}
				enableGlobalSearch
				showToolbar
				searchPlaceholder='Search products in this price list...'
				persistStateKey={`pricing-items-${priceListId}`}
				emptyState={
					<div className='flex flex-col items-center gap-3 py-12'>
						<div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
							<Package className='h-8 w-8 text-primary' />
						</div>
						<h3 className='text-lg font-semibold text-base-content'>No Products Added</h3>
						<p className='text-base-content/60 max-w-md text-center'>
							Add products to this price list to define their contract pricing. Each product can have a
							fixed price, percent discount, or fixed discount.
						</p>
						{isAdmin && (
							<Button
								variant='primary'
								onClick={() => setShowAddModal(true)}>
								<Plus className='h-4 w-4 mr-2' />
								Add Product
							</Button>
						)}
					</div>
				}
				ariaLabel='Price list items table'
			/>

			{/* Add Product Button (outside grid when items exist) */}
			{items.length > 0 && isAdmin && (
				<div className='mt-4 flex justify-end'>
					<Button
						variant='primary'
						size='sm'
						onClick={() => setShowAddModal(true)}>
						<Plus className='h-4 w-4 mr-2' />
						Add Product
					</Button>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={closeDeleteModal}
				onConfirm={handleDelete}
				title='Remove Product'
				message={`Are you sure you want to remove "${deleteModal.item?.productName}" from this price list?`}
				details='The product will no longer have special pricing from this list. This action cannot be undone.'
				variant='danger'
				confirmText='Remove'
				cancelText='Cancel'
				isLoading={isDeleting}
			/>

			{/* TODO: Add Product Modal */}
			{/* Implement AddProductModal with product search and pricing configuration */}
		</>
	)
}
