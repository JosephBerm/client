/**
 * Navigation Feature - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Application navigation, routing, and navigation services.
 * 
 * **Architecture:**
 * - NavigationService: Route configuration and queries
 * - BreadcrumbService: Breadcrumb generation logic
 * - Routes: Type-safe route constants
 * 
 * @example
 * ```typescript
 * import { NavigationService, BreadcrumbService, Routes } from '@_features/navigation'
 * 
 * // Get routes for user role
 * const routes = NavigationService.getNavigationForRole(userRole)
 * 
 * // Generate breadcrumbs
 * const breadcrumbs = BreadcrumbService.generateBreadcrumbs(pathname, userRole)
 * 
 * // Use route constants
 * router.push(Routes.Store.location)
 * ```
 * 
 * @module navigation
 */

// ============================================================================
// NAVIGATION SERVICES (Server + Client Safe)
// ============================================================================

// NavigationService
export { NavigationService } from './services/NavigationService'

// BreadcrumbService
export { BreadcrumbService, type BreadcrumbItem } from './services/breadcrumbService'

// Routes
export { default as Routes } from './services/routes'

