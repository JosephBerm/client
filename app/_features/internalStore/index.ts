/**
 * Internal Store Feature Module
 * 
 * Product catalog management for administrators.
 * Provides components, hooks, utilities, and types for the internal store page.
 * 
 * **Features:**
 * - Product CRUD operations
 * - Archive/restore functionality
 * - Product statistics dashboard
 * - RBAC-compliant access control
 * 
 * **Business Flow:**
 * - Admin maintains product catalog
 * - Products available in public store for browsing
 * - Customers add products to cart for quote requests
 * - Sales reps use product info for pricing quotes
 * 
 * @module internalStore
 * 
 * @example
 * ```tsx
 * import {
 *   useInternalStorePage,
 *   useProductStats,
 *   ProductStatsGrid,
 *   ProductDeleteModal,
 *   createProductColumns,
 * } from '@_features/internalStore'
 * 
 * function InternalStorePage() {
 *   const {
 *     deleteModal,
 *     stats,
 *     statsLoading,
 *     canDelete,
 *     handleDelete,
 *     handleArchive,
 *   } = useInternalStorePage()
 *   
 *   const columns = createProductColumns({
 *     canDelete,
 *     onDelete: openDeleteModal,
 *     onArchive: openArchiveModal,
 *     onRestore: handleRestore,
 *   })
 *   
 *   return (
 *     <>
 *       <ProductStatsGrid stats={stats} isLoading={statsLoading} />
 *       <ServerDataGrid columns={columns} ... />
 *       <ProductDeleteModal ... />
 *     </>
 *   )
 * }
 * ```
 */

// ============================================================================
// COMPONENTS
// ============================================================================

export { ProductDeleteModal, ProductStatsGrid } from './components'

// ============================================================================
// HOOKS
// ============================================================================

export { useInternalStorePage, useProductStats } from './hooks'

// ============================================================================
// UTILITIES
// ============================================================================

export { createProductColumns } from './utils'

// ============================================================================
// CONSTANTS
// ============================================================================

export {
	DEFAULT_PAGE_SIZE,
	getStockStatusConfig,
	LOW_STOCK_THRESHOLD,
	PRODUCT_API_INCLUDES,
	PRODUCT_SORT_OPTIONS,
	STOCK_STATUS_CONFIG,
} from './constants'

// ============================================================================
// TYPES
// ============================================================================

export type {
	ProductColumnsConfig,
	ProductDeleteModalProps,
	ProductFilterOptions,
	ProductModalState,
	ProductStats,
	ProductStatsGridProps,
	StockStatusConfig,
	UseInternalStorePageReturn,
} from './types'

