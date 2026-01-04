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
 * **React 19 / Next.js 16 Optimizations:**
 * - No useCallback needed (React Compiler auto-memoizes)
 * - useMemo only for expensive computations
 * 
 * **Business Flow:**
 * - Admin-only page for product catalog management
 * - Products are the foundation of the quote-based ordering system
 * - Supports soft delete (archive) and hard delete
 * 
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module internalStore/hooks
 */

'use client'

import { useState } from 'react'

import { useAuthStore } from '@_features/auth'

import { logger } from '@_core'

import { notificationService, API } from '@_shared'

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
	// Auth state for RBAC
	const user = useAuthStore((state) => state.user)
	
	// RBAC checks - simple comparisons, no memoization needed
	// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
	const userRole = user?.roleLevel ?? AccountRole.Customer
	// Use >= for admin check to include SuperAdmin (9999) and Admin (5000)
	const isAdmin = userRole >= AccountRole.Admin

	// Modal state
	const [deleteModal, setDeleteModal] = useState<ProductModalState>({
		isOpen: false,
		product: null,
		mode: 'archive',
	})

	// UI state
	// Note: Category filtering is now handled via RichDataGrid's built-in column filters
	const [refreshKey, setRefreshKey] = useState(0)
	const [showArchived, setShowArchived] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)

	// Stats
	const { stats, isLoading: statsLoading, refetch: refetchStats } = useProductStats()

	// ========================
	// Modal Actions - React 19: No useCallback needed
	// ========================

	const openDeleteModal = (product: Product) => {
		setDeleteModal({ isOpen: true, product, mode: 'delete' })
	}

	const openArchiveModal = (product: Product) => {
		setDeleteModal({ isOpen: true, product, mode: 'archive' })
	}

	const closeModal = () => {
		if (!isDeleting && !isArchiving) {
			setDeleteModal({ isOpen: false, product: null, mode: 'archive' })
		}
	}

	// ========================
	// Table Actions
	// ========================

	const refreshTable = () => {
		setRefreshKey((prev) => prev + 1)
	}

	// ========================
	// CRUD Operations
	// ========================

	/**
	 * Permanently delete a product.
	 * This is a hard delete - product is removed from database.
	 */
	const handleDelete = async () => {
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
	}

	/**
	 * Archive a product (soft delete).
	 * Product is hidden from public store but can be restored.
	 */
	const handleArchive = async () => {
		if (!deleteModal.product) {
			return
		}

		setIsArchiving(true)
		try {
			// Use the dedicated archive endpoint
			const { data } = await API.Store.Products.archive(deleteModal.product.id)

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
	}

	/**
	 * Restore an archived product.
	 */
	const handleRestore = async (product: Product) => {
		try {
			const { data } = await API.Store.Products.restore(product.id)
			
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
	}

	// ========================
	// Toggle Actions
	// ========================

	const toggleShowArchived = () => {
		setShowArchived((prev) => !prev)
	}

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
		handleDelete: () => void handleDelete(),
		handleArchive: () => void handleArchive(),
		handleRestore: (product: Product) => void handleRestore(product),
		toggleShowArchived,
		refreshTable,
	}
}

export default useInternalStorePage

