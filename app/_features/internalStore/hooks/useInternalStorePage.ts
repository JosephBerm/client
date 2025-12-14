/**
 * useInternalStorePage Hook
 * 
 * Encapsulates all business logic for the Internal Store page.
 * Follows the same pattern as useProvidersPage and useCustomersPage.
 * 
 * **Features:**
 * - Delete/Archive modal management
 * - Product stats fetching
 * - RBAC permission checks
 * - Archive toggle state
 * - Refresh key for table re-fetching
 * 
 * **Business Flow:**
 * - Admin-only page for product catalog management
 * - Products are the foundation of the quote-based ordering system
 * - Supports soft delete (archive) and hard delete
 * 
 * @module internalStore/hooks
 */

'use client'

import { useCallback, useState } from 'react'

import { useAuthStore } from '@_features/auth'

import { logger } from '@_core'

import { notificationService, API, HttpService } from '@_shared'

import { AccountRole } from '@_classes/Enums'
import type { Product } from '@_classes/Product'

import type { ProductModalState, UseInternalStorePageReturn } from '../types'
import { useProductStats } from './useProductStats'

/**
 * Hook for managing internal store page state and actions.
 * 
 * @example
 * ```tsx
 * const {
 *   deleteModal,
 *   stats,
 *   statsLoading,
 *   isAdmin,
 *   canDelete,
 *   handleDelete,
 *   handleArchive,
 *   handleRestore,
 *   toggleShowArchived,
 * } = useInternalStorePage()
 * ```
 */
export function useInternalStorePage(): UseInternalStorePageReturn {
	// Auth state
	const { user } = useAuthStore()
	const isAdmin = user?.role === AccountRole.Admin

	// Modal state
	const [deleteModal, setDeleteModal] = useState<ProductModalState>({
		isOpen: false,
		product: null,
		mode: 'archive',
	})

	// UI state
	const [refreshKey, setRefreshKey] = useState(0)
	const [showArchived, setShowArchived] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)

	// Stats
	const { stats, isLoading: statsLoading, refetch: refetchStats } = useProductStats()

	// ========================
	// Modal Actions
	// ========================

	const openDeleteModal = useCallback((product: Product) => {
		setDeleteModal({ isOpen: true, product, mode: 'delete' })
	}, [])

	const openArchiveModal = useCallback((product: Product) => {
		setDeleteModal({ isOpen: true, product, mode: 'archive' })
	}, [])

	const closeModal = useCallback(() => {
		setDeleteModal({ isOpen: false, product: null, mode: 'archive' })
	}, [])

	// ========================
	// Table Actions
	// ========================

	const refreshTable = useCallback(() => {
		setRefreshKey((prev) => prev + 1)
	}, [])

	// ========================
	// CRUD Operations
	// ========================

	/**
	 * Permanently delete a product.
	 * This is a hard delete - product is removed from database.
	 */
	const handleDeleteAsync = useCallback(async () => {
		if (!deleteModal.product) {
			return
		}

		setIsDeleting(true)
		try {
			const { data } = await API.Store.Products.delete(deleteModal.product.id)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to delete product', {
					metadata: { productId: deleteModal.product.id },
					component: 'InternalStorePage',
					action: 'deleteProduct',
				})
				return
			}

			notificationService.success(data.message ?? 'Product deleted successfully', {
				metadata: { productId: deleteModal.product.id },
				component: 'InternalStorePage',
				action: 'deleteProduct',
			})
			closeModal()
			refreshTable()
			void refetchStats()
		} catch (error) {
			notificationService.error('An error occurred while deleting the product', {
				metadata: { error, productId: deleteModal.product.id },
				component: 'InternalStorePage',
				action: 'deleteProduct',
			})
		} finally {
			setIsDeleting(false)
		}
	}, [deleteModal.product, closeModal, refreshTable, refetchStats])

	/**
	 * Archive a product (soft delete).
	 * Product is hidden from public store but can be restored.
	 */
	const handleArchiveAsync = useCallback(async () => {
		if (!deleteModal.product) {
			return
		}

		setIsArchiving(true)
		try {
			// Use the same delete endpoint as it performs archive (soft delete)
			const { data } = await API.Store.Products.delete(deleteModal.product.id)

			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to archive product', {
					metadata: { productId: deleteModal.product.id },
					component: 'InternalStorePage',
					action: 'archiveProduct',
				})
				return
			}

			notificationService.success('Product archived successfully', {
				metadata: { productId: deleteModal.product.id },
				component: 'InternalStorePage',
				action: 'archiveProduct',
			})
			closeModal()
			refreshTable()
			void refetchStats()
		} catch (error) {
			notificationService.error('An error occurred while archiving the product', {
				metadata: { error, productId: deleteModal.product.id },
				component: 'InternalStorePage',
				action: 'archiveProduct',
			})
		} finally {
			setIsArchiving(false)
		}
	}, [deleteModal.product, closeModal, refreshTable, refetchStats])

	/**
	 * Restore an archived product.
	 */
	const handleRestoreAsync = useCallback(async (product: Product) => {
		try {
			const { data } = await HttpService.put<boolean>(`/products/${product.id}/restore`, {})
			
			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to restore product', {
					metadata: { productId: product.id },
					component: 'InternalStorePage',
					action: 'restoreProduct',
				})
				return
			}
			
			notificationService.success('Product restored successfully', {
				metadata: { productId: product.id },
				component: 'InternalStorePage',
				action: 'restoreProduct',
			})
			refreshTable()
			void refetchStats()
		} catch (error) {
			notificationService.error('An error occurred while restoring the product')
			logger.error('Restore product error', { error, productId: product.id })
		}
	}, [refreshTable, refetchStats])

	// ========================
	// Wrapper Functions for Async Handlers
	// ========================

	const handleDelete = useCallback(() => {
		void handleDeleteAsync().catch((error) => {
			logger.error('Unhandled delete error', {
				error,
				component: 'InternalStorePage',
				action: 'handleDelete',
			})
		})
	}, [handleDeleteAsync])

	const handleArchive = useCallback(() => {
		void handleArchiveAsync().catch((error) => {
			logger.error('Unhandled archive error', {
				error,
				component: 'InternalStorePage',
				action: 'handleArchive',
			})
		})
	}, [handleArchiveAsync])

	const handleRestore = useCallback((product: Product) => {
		void handleRestoreAsync(product).catch((error) => {
			logger.error('Unhandled restore error', {
				error,
				component: 'InternalStorePage',
				action: 'handleRestore',
			})
		})
	}, [handleRestoreAsync])

	// ========================
	// Toggle Actions
	// ========================

	const toggleShowArchived = useCallback(() => {
		setShowArchived((prev) => !prev)
	}, [])

	// ========================
	// Return
	// ========================

	return {
		// State
		deleteModal,
		refreshKey,
		showArchived,
		isDeleting,
		isArchiving,
		// Stats
		stats,
		statsLoading,
		// RBAC - All product management is admin-only per RBAC_ARCHITECTURE.md
		isAdmin,
		canCreate: isAdmin,
		canUpdate: isAdmin,
		canDelete: isAdmin,
		canViewArchived: isAdmin,
		// Actions
		openDeleteModal,
		openArchiveModal,
		closeModal,
		handleDelete,
		handleArchive,
		handleRestore,
		toggleShowArchived,
		refreshTable,
	}
}

export default useInternalStorePage

