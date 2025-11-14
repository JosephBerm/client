/**
 * Products Feature - Main Barrel Export
 * 
 * Complete product management infrastructure.
 * Provides services, utilities, and business logic for product operations.
 * 
 * **Architecture:**
 * ```
 * products/
 * ├── services/    → Business logic layer (ProductService)
 * └── utils/       → Utility functions (getStockStatus, etc.)
 * ```
 * 
 * **Usage:**
 * ```typescript
 * // Import everything from one place
 * import {
 *   // Services
 *   ProductService,
 *   
 *   // Utils
 *   getStockStatus,
 *   type StockStatusConfig
 * } from '@_features/products'
 * 
 * // Get a product
 * const product = await ProductService.get(productId);
 * 
 * // Get stock status
 * const status = getStockStatus(product.stock);
 * ```
 * 
 * **Benefits:**
 * - ✅ Single import path
 * - ✅ Clear module boundaries
 * - ✅ Better tree-shaking
 * - ✅ Easier maintenance
 * - ✅ Feature isolation
 * 
 * @module products
 */

// Services
export * from './services'

// Utils
export * from './utils'

