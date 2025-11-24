/**
 * Products Feature - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Product management infrastructure.
 * Services and utilities for product operations.
 * 
 * @example
 * ```typescript
 * import { ProductService, getStockStatus } from '@_features/products'
 * 
 * const product = await ProductService.get(productId)
 * const status = getStockStatus(product.stock)
 * ```
 * 
 * @module products
 */

// ============================================================================
// SERVICES
// ============================================================================

export { ProductService } from './services/ProductService'

// ============================================================================
// UTILITIES (Server + Client Safe)
// ============================================================================

export {
	getStockStatus,
	type StockStatusConfig,
} from './utils/productUtils'

