/**
 * Internal Store Feature Types
 * 
 * Type definitions for internal product management (admin).
 * Follows RBAC_ARCHITECTURE.md for permission-based access control.
 * 
 * @module internalStore/types
 */

import type { Product } from '@_classes/Product'

/**
 * Product statistics for dashboard display.
 */
export interface ProductStats {
	/** Total number of products in catalog */
	totalProducts: number
	/** Number of active (non-archived) products */
	activeProducts: number
	/** Number of archived products */
	archivedProducts: number
	/** Number of products with low stock (< 10) */
	lowStockProducts: number
	/** Number of out-of-stock products (stock === 0) */
	outOfStockProducts: number
	/** Total inventory value (sum of price * stock) */
	totalInventoryValue: number
	/** Number of product categories */
	categoryCount: number
}

/**
 * Delete/Archive modal state for product management.
 */
export interface ProductModalState {
	/** Whether the modal is open */
	isOpen: boolean
	/** The product being acted upon */
	product: Product | null
	/** The action mode: delete permanently or archive (soft delete) */
	mode: 'delete' | 'archive'
}

/**
 * Product filter options for search.
 */
export interface ProductFilterOptions {
	/** Filter by category ID */
	categoryId?: number
	/** Show archived products only */
	showArchived?: boolean
	/** Filter by low stock (stock < 10) */
	lowStockOnly?: boolean
	/** Filter by out of stock (stock === 0) */
	outOfStockOnly?: boolean
	/** Search term for name/SKU */
	search?: string
}

/**
 * Return type for useInternalStorePage hook.
 * Note: Category filtering is now handled via RichDataGrid's built-in column filters.
 */
export interface UseInternalStorePageReturn {
	// State
	deleteModal: ProductModalState
	refreshKey: number
	showArchived: boolean
	isDeleting: boolean
	isArchiving: boolean
	// Stats
	stats: ProductStats | null
	statsLoading: boolean
	// RBAC
	isAdmin: boolean
	canCreate: boolean
	canUpdate: boolean
	canDelete: boolean
	canViewArchived: boolean
	// Actions
	openDeleteModal: (product: Product) => void
	openArchiveModal: (product: Product) => void
	closeModal: () => void
	handleDelete: () => void
	handleArchive: () => void
	handleRestore: (product: Product) => void
	toggleShowArchived: () => void
	refreshTable: () => void
}

/**
 * Props for ProductDeleteModal component.
 */
export interface ProductDeleteModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** The name of the product (for display) */
	productName: string
	/** The action mode */
	mode: 'delete' | 'archive'
	/** Close modal callback */
	onClose: () => void
	/** Delete callback */
	onDelete: () => void
	/** Archive callback */
	onArchive: () => void
	/** Whether delete is in progress */
	isDeleting: boolean
	/** Whether archive is in progress */
	isArchiving: boolean
}

/**
 * Props for ProductStatsGrid component.
 */
export interface ProductStatsGridProps {
	/** Product statistics */
	stats: ProductStats | null
	/** Whether stats are loading */
	isLoading: boolean
	/** Whether showing archived products view */
	showArchived?: boolean
}

/**
 * Configuration for creating product columns.
 */
export interface ProductColumnsConfig {
	/** Whether user can delete products */
	canDelete: boolean
	/** Whether to show cost column (SalesRep+ only per PRD) */
	showCost?: boolean
	/** Callback when delete is clicked */
	onDelete: (product: Product) => void
	/** Callback when archive is clicked */
	onArchive: (product: Product) => void
	/** Callback when restore is clicked */
	onRestore: (product: Product) => void
}

/**
 * Stock status configuration for badges.
 */
export interface StockStatusConfig {
	/** Badge variant */
	variant: 'success' | 'warning' | 'error' | 'info'
	/** Display label */
	label: string
	/** Description for tooltips */
	description: string
}

