/**
 * Internal App Utilities - Barrel Export (Optimized for Tree-Shaking)
 * 
 * Utility functions and helpers for the /app internal application.
 * Route metadata, page configuration, and access control.
 * 
 * @example
 * ```typescript
 * import { getPageMetadata, canAccessRoute } from '@/app/app/_lib'
 * ```
 * 
 * @module app/lib
 */

// Internal Routes
export {
	INTERNAL_ROUTE_METADATA,
	getPageMetadata,
	getPageTitle,
	getPageDescription,
	canAccessRoute,
	type InternalPageMetadata,
} from './internalRoutes'

