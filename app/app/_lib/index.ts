/**
 * Internal App Utilities - Barrel Export
 * 
 * Utility functions and helpers for the /app internal application.
 * Includes route configuration, breadcrumb generation, and internal app helpers.
 * 
 * **Contents:**
 * - Route metadata and page configuration
 * - Breadcrumb generation utilities
 * - Helper functions for internal app
 * 
 * **Usage:**
 * ```typescript
 * import { 
 *   generateBreadcrumbs, 
 *   getPageMetadata,
 *   INTERNAL_ROUTE_METADATA 
 * } from '@/app/app/_lib'
 * ```
 * 
 * @module app/lib
 */

// Route configuration and metadata
export * from './internalRoutes'

// Breadcrumb generation utilities
export * from './breadcrumbGenerator'

