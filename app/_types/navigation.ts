/**
 * Navigation Type Definitions
 * 
 * Provides type-safe interfaces and types for the navigation system.
 * These types define the structure of navigation routes, sections, and
 * configuration, enabling type safety throughout the navigation system.
 * 
 * **Architecture:**
 * - Icon type for consistent icon usage
 * - Route interface for individual navigation items
 * - Section interface for grouping routes
 * - Role-based access control types
 * 
 * **Role Management:**
 * - Imports AccountRole from central enum definition
 * - Re-exports for navigation convenience
 * - Single source of truth for role values
 * 
 * @module NavigationTypes
 */

/**
 * Breadcrumb item interface.
 * Represents a single breadcrumb in the navigation trail.
 * 
 * **Usage:**
 * - BreadcrumbService (generates breadcrumbs)
 * - Breadcrumb UI component (renders breadcrumbs)
 * - useBreadcrumbs hook (auto-generation)
 * - Manual breadcrumb definitions
 * 
 * **Architecture:**
 * Lives in types layer (not UI or service layer) to avoid circular dependencies.
 * Follows Dependency Inversion Principle - lower layers depend on abstractions.
 */
export interface BreadcrumbItem {
	/** Display label for the breadcrumb */
	label: string
	/** URL path for navigation */
	href: string
	/** Whether this is the current/active page */
	isCurrent?: boolean
	/** Icon identifier (optional, matches NavigationIconType) */
	icon?: string
}

/**
 * Icon identifier type for navigation items.
 * Maps string identifiers to Lucide React icon components.
 */
export type NavigationIconType =
	| 'dashboard'
	| 'package'
	| 'clipboard-list'
	| 'receipt'
	| 'users'
	| 'hospital'
	| 'factory'
	| 'bar-chart'
	| 'user'
	| 'settings'
	| 'store'
	| 'bell'

/**
 * Navigation route item interface.
 * 
 * Represents a single navigation item (link) in the navigation system.
 * Routes appear in the sidebar navigation.
 * 
 * @interface NavigationRoute
 */
export interface NavigationRoute {
	/** Unique identifier for the route */
	id: string
	/** Display label shown to users */
	label: string
	/** Optional subtitle or description shown below the label */
	description?: string
	/** URL path for navigation */
	href: string
	/** Icon identifier for visual representation */
	icon: NavigationIconType
	/** Whether this route opens in a new tab/window */
	isExternal?: boolean
	/** Whether this route requires specific role */
	roles?: number[]
	/** Optional badge or notification count */
	badge?: number | string
}

/**
 * Navigation section interface.
 * 
 * Represents a group of related navigation routes displayed together.
 * Sections appear in the sidebar navigation and can be collapsible.
 * 
 * @interface NavigationSection
 */
export interface NavigationSection {
	/** Unique identifier for the section */
	id: string
	/** Display title for the section */
	title: string
	/** Array of navigation routes in this section */
	routes: NavigationRoute[]
	/** Whether this section can be collapsed/expanded */
	collapsible?: boolean
	/** Whether this section starts collapsed */
	defaultCollapsed?: boolean
	/** Role restrictions for entire section */
	roles?: number[]
}

/**
 * Role Type Definitions
 * 
 * **SINGLE SOURCE OF TRUTH**: AccountRole from @_classes/Enums
 * 
 * This ensures consistency across:
 * - Navigation system
 * - API requests
 * - Role-based access control
 * - UI components
 * 
 * **Usage:**
 * ```typescript
 * import { AccountRole } from '@_classes/Enums'
 * 
 * // Check if user is admin
 * if (user.role === AccountRole.Admin) {
 *   // Admin-only logic
 * }
 * ```
 */
// Re-export AccountRole for convenience (imported directly in re-export)
export { AccountRole } from '@_classes/Enums'

