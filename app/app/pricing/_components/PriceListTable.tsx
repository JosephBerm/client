/**
 * PriceListTable Component
 *
 * DataGrid displaying all price lists using RichDataGrid.
 * Admin can create, edit, delete. SalesRep+ can view.
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 5.2 Components
 *
 * **DRY Compliance:** Uses standardized RichDataGrid component
 * following existing patterns in QuotesDataGrid, AccountsDataGrid, etc.
 *
 * @module app/pricing/_components/PriceListTable
 */

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

import { Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Calendar, Download } from 'lucide-react'

import { logger } from '@_core'

import { Routes } from '@_features/navigation'
import { usePermissions } from '@_shared/hooks/usePermissions'
import { RoleLevels } from '@_types/rbac'
import { formatDate, API, notificationService } from '@_shared'

import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	BulkActionVariant,
	type BulkAction,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult, RichColumnDef } from '@_components/tables/RichDataGrid'
import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import ConfirmationModal from '@_components/ui/ConfirmationModal'

import { useDeletePriceList } from '@_features/pricing'
// Use regular import (not import type) because we need to instantiate the class
import { PriceList } from '@_classes/Pricing'

// =========================================================================
// TYPES
// =========================================================================

/**
 * Delete modal state interface
 */
interface DeleteModalState {
	isOpen: boolean
	priceList: PriceList | null
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * DataGrid component for displaying and managing price lists.
 *
 * **Features (using RichDataGrid):**
 * - Server-side pagination, sorting, filtering
 * - Global search on name/description
 * - Status badge indicators
 * - Validity date display
 * - RBAC-based actions (Edit/Delete for Admin)
 * - Bulk export functionality
 *
 * @returns PriceListTable component
 */
export default function PriceListTable() {
	// ---------------------------------------------------------------------------
	// STATE & HOOKS
	// ---------------------------------------------------------------------------

	const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
		isOpen: false,
		priceList: null,
	})
	const [refreshKey, setRefreshKey] = useState(0)
	const [isDeleting, setIsDeleting] = useState(false)

	const { hasMinimumRole } = usePermissions()
	const isAdmin = hasMinimumRole(RoleLevels.Admin)

	const deleteMutation = useDeletePriceList()

	// ---------------------------------------------------------------------------
	// HANDLERS (React Compiler auto-memoizes)
	// ---------------------------------------------------------------------------

	const openDeleteModal = (priceList: PriceList) => {
		setDeleteModal({ isOpen: true, priceList })
	}

	const closeDeleteModal = () => {
		setDeleteModal({ isOpen: false, priceList: null })
	}

	const handleDeleteAsync = async (): Promise<void> => {
		if (!deleteModal.priceList?.id) return

		setIsDeleting(true)

		try {
			await deleteMutation.mutateAsync(deleteModal.priceList.id)

			notificationService.success('Price list deleted successfully', {
				metadata: { priceListId: deleteModal.priceList.id },
				component: 'PriceListTable',
				action: 'deletePriceList',
			})
			closeDeleteModal()
			setRefreshKey((prev) => prev + 1)
		} catch (error) {
			notificationService.error('Failed to delete price list', {
				metadata: { error, priceListId: deleteModal.priceList?.id },
				component: 'PriceListTable',
				action: 'deletePriceList',
			})
		} finally {
			setIsDeleting(false)
		}
	}

	const handleDelete = () => {
		void handleDeleteAsync().catch((error) => {
			logger.error('Unhandled delete error', {
				error,
				component: 'PriceListTable',
				action: 'handleDelete',
			})
		})
	}

	// ---------------------------------------------------------------------------
	// FETCHER (React Compiler auto-memoizes)
	// ---------------------------------------------------------------------------

	const fetcher = useCallback(
		async (filter: RichSearchFilter): Promise<RichPagedResult<PriceList>> => {
			// The current API only supports page/pageSize
			// TODO: Extend backend to support sorting/filtering for RichDataGrid
			const response = await API.Pricing.getPriceLists(filter.page, filter.pageSize)

			if (response.data?.payload) {
				// Map API response to RichPagedResult format
				const payload = response.data.payload
				return {
					data: payload.data.map((item) => new PriceList(item)),
					page: payload.page,
					pageSize: payload.pageSize,
					total: payload.total,
					totalPages: payload.totalPages,
					hasNext: payload.hasNext,
					hasPrevious: payload.hasPrevious,
				}
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
		},
		[]
	)

	// ---------------------------------------------------------------------------
	// COLUMN DEFINITIONS (React Compiler auto-memoizes)
	// ---------------------------------------------------------------------------

	const columnHelper = createRichColumnHelper<PriceList>()

	const columns: RichColumnDef<PriceList, unknown>[] = [
		// Name - Text filter, searchable
		columnHelper.accessor('name', {
			header: 'Name',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<div className="flex flex-col">
					<Link
						href={Routes.Pricing.priceListDetail(row.original.id)}
						className="font-medium text-base-content hover:text-primary transition-colors"
					>
						{row.original.name}
					</Link>
					{row.original.description && (
						<span className="text-xs text-base-content/60 truncate max-w-xs">
							{row.original.description}
						</span>
					)}
				</div>
			),
		}),

		// Priority - Number filter
		columnHelper.accessor('priority', {
			header: 'Priority',
			filterType: FilterType.Number,
			cell: ({ row }) => (
				<Badge variant="neutral" size="sm">
					{row.original.priority}
				</Badge>
			),
		}),

		// Status - Select filter, faceted
		columnHelper.accessor('isActive', {
			header: 'Status',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => (
				row.original.isActive ? (
					<Badge variant="success" size="sm">
						<CheckCircle className="h-3 w-3 mr-1" />
						Active
					</Badge>
				) : (
					<Badge variant="error" size="sm">
						<XCircle className="h-3 w-3 mr-1" />
						Inactive
					</Badge>
				)
			),
		}),

		// Validity - Date display
		columnHelper.display({
			id: 'validity',
			header: 'Validity',
			cell: ({ row }) => {
				const { validFrom, validUntil, isActive } = row.original
				const isCurrentlyValid = row.original.isCurrentlyValid()
				const hasValidityDates = validFrom || validUntil

				if (!hasValidityDates) {
					return <span className="text-xs text-base-content/40">No dates</span>
				}

				return (
					<div className="flex flex-col items-center gap-0.5">
						{validFrom && (
							<span className="text-xs text-base-content/60">
								From: {formatDate(validFrom, 'short')}
							</span>
						)}
						{validUntil && (
							<span className="text-xs text-base-content/60">
								Until: {formatDate(validUntil, 'short')}
							</span>
						)}
						{!isCurrentlyValid && isActive && (
							<Badge variant="warning" size="sm">
								<Calendar className="h-3 w-3 mr-1" />
								Outside Range
							</Badge>
						)}
					</div>
				)
			},
		}),

		// Item Count - Number display
		columnHelper.accessor('itemCount', {
			header: 'Items',
			filterType: FilterType.Number,
			cell: ({ row }) => (
				<span className="font-medium text-base-content">{row.original.itemCount}</span>
			),
		}),

		// Customer Count - Number display
		columnHelper.accessor('customerCount', {
			header: 'Customers',
			filterType: FilterType.Number,
			cell: ({ row }) => (
				<span className="font-medium text-base-content">{row.original.customerCount}</span>
			),
		}),

		// Created At - Date filter
		columnHelper.accessor('createdAt', {
			header: 'Created',
			filterType: FilterType.Date,
			cell: ({ row }) => formatDate(row.original.createdAt),
		}),

		// Actions - Display only
		columnHelper.display({
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<div className="flex gap-1">
					<Link href={Routes.Pricing.priceListDetail(row.original.id)}>
						<Button variant="ghost" size="sm" aria-label="View price list details">
							<Eye className="w-4 h-4" />
						</Button>
					</Link>
					{isAdmin && (
						<>
							<Link href={Routes.Pricing.priceListDetail(row.original.id)}>
								<Button variant="ghost" size="sm" aria-label="Edit price list">
									<Edit className="w-4 h-4" />
								</Button>
							</Link>
							<Button
								variant="ghost"
								size="sm"
								className="text-error hover:text-error"
								onClick={() => openDeleteModal(row.original)}
								aria-label="Delete price list"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</>
					)}
				</div>
			),
		}),
	]

	// ---------------------------------------------------------------------------
	// BULK ACTIONS
	// ---------------------------------------------------------------------------

	const bulkActions: BulkAction<PriceList>[] = [
		{
			id: 'export-csv',
			label: 'Export CSV',
			icon: <Download className="w-4 h-4" />,
			variant: BulkActionVariant.Default,
			onAction: async (rows: PriceList[]) => {
				const headers = 'ID,Name,Priority,Status,Items,Customers,Valid From,Valid Until,Created\n'
				const csv = rows.map(r =>
					`"${r.id}","${r.name}",${r.priority},${r.isActive ? 'Active' : 'Inactive'},${r.itemCount},${r.customerCount},"${r.validFrom ? formatDate(r.validFrom, 'short') : ''}","${r.validUntil ? formatDate(r.validUntil, 'short') : ''}","${formatDate(r.createdAt)}"`
				).join('\n')
				const blob = new Blob([headers + csv], { type: 'text/csv' })
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `price-lists-export-${new Date().toISOString().split('T')[0]}.csv`
				a.click()
				URL.revokeObjectURL(url)
				notificationService.success(`Exported ${rows.length} price lists`)
			},
		},
	]

	// Add delete bulk action for admin only
	if (isAdmin) {
		bulkActions.push({
			id: 'delete-selected',
			label: 'Delete Selected',
			icon: <Trash2 className="w-4 h-4" />,
			variant: BulkActionVariant.Danger,
			confirmMessage: (count) => `Are you sure you want to delete ${count} price list(s)? This action cannot be undone.`,
			onAction: async (rows: PriceList[]) => {
				const promises = rows.map(r => deleteMutation.mutateAsync(r.id))
				await Promise.all(promises)
				notificationService.success(`Deleted ${rows.length} price lists`)
				setRefreshKey(prev => prev + 1)
			},
		})
	}

	// ---------------------------------------------------------------------------
	// RENDER
	// ---------------------------------------------------------------------------

	return (
		<>
			<RichDataGrid<PriceList>
				columns={columns}
				fetcher={fetcher}
				filterKey={String(refreshKey)}
				defaultPageSize={10}
				defaultSorting={[{ columnId: createColumnId('priority'), direction: SortDirection.Ascending }]}
				enableGlobalSearch
				enableColumnFilters
				enableRowSelection
				enableColumnResizing
				bulkActions={bulkActions}
				searchPlaceholder="Search price lists by name or description..."
				persistStateKey="pricing-price-lists-grid"
				emptyState={
					<div className="flex flex-col items-center gap-3 py-12">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<Plus className="h-8 w-8 text-primary" />
						</div>
						<h3 className="text-lg font-semibold text-base-content">No Price Lists Yet</h3>
						<p className="text-base-content/60 max-w-md text-center">
							Price lists allow you to define contract pricing for customers.
							Create your first price list to get started.
						</p>
						{isAdmin && (
							<Link href={Routes.Pricing.priceListCreate}>
								<Button variant="primary">
									<Plus className="h-4 w-4 mr-2" />
									Create Price List
								</Button>
							</Link>
						)}
					</div>
				}
				ariaLabel="Price lists table"
			/>

			<ConfirmationModal
				isOpen={deleteModal.isOpen}
				onClose={closeDeleteModal}
				onConfirm={handleDelete}
				title="Delete Price List"
				message={`Are you sure you want to delete the price list "${deleteModal.priceList?.name}"?`}
				details="This action cannot be undone. All pricing rules and customer assignments in this list will be permanently removed."
				variant="danger"
				confirmText="Delete Price List"
				cancelText="Cancel"
				isLoading={isDeleting}
			/>
		</>
	)
}
