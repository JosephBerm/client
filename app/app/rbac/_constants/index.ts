/**
 * RBAC Constants - Single Source of Truth
 *
 * Centralizes all RBAC-related constants, configurations, and mappings.
 * Ensures consistency across the RBAC management feature.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Database-Driven RBAC
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Role levels are NOT hardcoded. All role data comes from the database.
 * This file only contains UI configuration like cache keys, colors, etc.
 *
 * Benefits:
 * - White-label deployments can customize roles without code changes
 * - Role levels are fetched from API at runtime
 * - UI styling is based on role name, not level
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module RBAC Constants
 */

// =========================================================================
// CACHE KEYS
// =========================================================================

/**
 * Cache keys for RBAC data fetching.
 * Used with useFetchWithCache for request deduplication.
 */
export const CACHE_KEYS = {
	OVERVIEW: 'rbac:overview',
	MATRIX: 'rbac:matrix',
	AUDIT_LOG: (page: number, pageSize: number) => `rbac:audit:${page}:${pageSize}`,
	USERS: (page: number, pageSize: number) => `rbac:users:${page}:${pageSize}`,
	ROLES: 'rbac:roles',
	PERMISSIONS: 'rbac:permissions',
	ROLE_PERMISSIONS: (roleId: number) => `rbac:role-permissions:${roleId}`,
} as const

// =========================================================================
// CACHE CONFIGURATION
// =========================================================================

/**
 * Cache timing configuration (in milliseconds).
 */
export const CACHE_CONFIG = {
	/** Time before data is considered stale (5 minutes) */
	STALE_TIME: 5 * 60 * 1000,
	/** Time to keep data in cache (30 minutes) */
	CACHE_TIME: 30 * 60 * 1000,
	/** Polling interval for real-time updates (0 = disabled) */
	POLL_INTERVAL: 0,
} as const

// =========================================================================
// PAGINATION DEFAULTS
// =========================================================================

/**
 * Default pagination configuration.
 */
export const PAGINATION = {
	DEFAULT_PAGE: 1,
	DEFAULT_PAGE_SIZE: 20,
	PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const

// =========================================================================
// ROLE HIERARCHY CONFIGURATION (by role name - white-label friendly)
// =========================================================================

/**
 * Complete role configuration for UI components.
 * Maps role NAME (from database) to UI properties.
 *
 * ARCHITECTURE: Single source of truth for role UI styling.
 * All components should use getRoleConfig() to access these values.
 *
 * Properties:
 * - abbreviation: Short label for compact views (headers, mobile)
 * - label: Full display name (fallback if DB displayName not available)
 * - description: Brief description of role's purpose
 * - headerColor: Background color for matrix header badges
 * - bgColor: Background color for cards/indicators (with border)
 * - gradient: Gradient for icon backgrounds
 * - badgeColor: Color for badge/pill components
 */
export interface RoleConfig {
	abbreviation: string
	label: string
	description: string
	headerColor: string
	bgColor: string
	gradient: string
	badgeColor: string
}

export const ROLE_HIERARCHY: Record<string, RoleConfig> = {
	super_admin: {
		abbreviation: 'Super',
		label: 'Super Administrator',
		description: 'Highest authority with all system access',
		headerColor: 'bg-amber-500',
		bgColor: 'bg-amber-500/10 border-amber-500/30',
		gradient: 'from-amber-500 to-orange-600',
		badgeColor: 'bg-amber-100 text-amber-800',
	},
	admin: {
		abbreviation: 'Admin',
		label: 'Administrator',
		description: 'Full system access and configuration',
		headerColor: 'bg-rose-500',
		bgColor: 'bg-rose-500/10 border-rose-500/30',
		gradient: 'from-rose-500 to-rose-600',
		badgeColor: 'bg-rose-100 text-rose-800',
	},
	sales_manager: {
		abbreviation: 'Mgr',
		label: 'Sales Manager',
		description: 'Oversee team and view analytics',
		headerColor: 'bg-purple-500',
		bgColor: 'bg-purple-500/10 border-purple-500/30',
		gradient: 'from-purple-500 to-purple-600',
		badgeColor: 'bg-purple-100 text-purple-800',
	},
	sales_rep: {
		abbreviation: 'Rep',
		label: 'Sales Representative',
		description: 'Manage assigned customers and quotes',
		headerColor: 'bg-blue-500',
		bgColor: 'bg-blue-500/10 border-blue-500/30',
		gradient: 'from-blue-500 to-blue-600',
		badgeColor: 'bg-blue-100 text-blue-800',
	},
	fulfillment_coordinator: {
		abbreviation: 'Fulfill',
		label: 'Fulfillment Coordinator',
		description: 'Manage orders and vendor coordination',
		headerColor: 'bg-cyan-500',
		bgColor: 'bg-cyan-500/10 border-cyan-500/30',
		gradient: 'from-cyan-500 to-cyan-600',
		badgeColor: 'bg-cyan-100 text-cyan-800',
	},
	customer: {
		abbreviation: 'Cust',
		label: 'Customer',
		description: 'Basic access to own data and orders',
		headerColor: 'bg-slate-500',
		bgColor: 'bg-slate-500/10 border-slate-500/30',
		gradient: 'from-slate-500 to-slate-600',
		badgeColor: 'bg-base-200 text-base-content',
	},
}

const DEFAULT_ROLE_CONFIG: RoleConfig = {
	abbreviation: 'Role',
	label: 'Unknown Role',
	description: 'Role not configured',
	headerColor: 'bg-gray-500',
	bgColor: 'bg-gray-500/10 border-gray-500/30',
	gradient: 'from-gray-500 to-gray-600',
	badgeColor: 'bg-gray-100 text-gray-800',
}

/**
 * Get complete role configuration by name.
 * Falls back to default if role name is not found.
 *
 * @param roleName - Role name from database (e.g., "sales_manager")
 * @returns Complete role configuration for UI rendering
 */
export function getRoleConfig(roleName: string): RoleConfig {
	return ROLE_HIERARCHY[roleName] ?? DEFAULT_ROLE_CONFIG
}

// Legacy exports for backwards compatibility
export const ROLE_STYLES = ROLE_HIERARCHY
export const getRoleStyle = getRoleConfig

// =========================================================================
// ANIMATION CONFIGURATION
// =========================================================================

/**
 * Framer Motion animation variants for RBAC components.
 */
export const ANIMATIONS = {
	/** Staggered card entrance */
	staggerContainer: {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	},
	/** Single card animation */
	card: {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	},
	/** Fade in/out */
	fade: {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
		exit: { opacity: 0 },
	},
	/** Slide in from right */
	slideIn: {
		hidden: { opacity: 0, x: 20 },
		visible: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: -20 },
	},
} as const

// =========================================================================
// STAT CARD CONFIGURATION
// =========================================================================

/**
 * Configuration for stats cards on the overview page.
 */
export const STAT_CARDS = {
	roles: {
		title: 'Roles Defined',
		icon: 'Shield',
		gradient: 'from-purple-500 to-purple-600',
	},
	permissions: {
		title: 'Permissions',
		icon: 'Lock',
		gradient: 'from-blue-500 to-blue-600',
	},
	users: {
		title: 'Total Users',
		icon: 'Users',
		gradient: 'from-amber-500 to-amber-600',
	},
	staff: {
		title: 'Staff Accounts',
		icon: 'UserCog',
		gradient: 'from-rose-500 to-rose-600',
	},
} as const

// =========================================================================
// ERROR MESSAGES
// =========================================================================

/**
 * User-friendly error messages for RBAC operations.
 */
export const ERROR_MESSAGES = {
	FETCH_OVERVIEW: 'Failed to load RBAC overview. Please try again.',
	FETCH_MATRIX: 'Failed to load permission matrix. Please try again.',
	FETCH_AUDIT_LOG: 'Failed to load audit log. Please try again.',
	FETCH_USERS: 'Failed to load users. Please try again.',
	UPDATE_ROLE: 'Failed to update role. Please try again.',
	DELETE_ROLE: 'Cannot delete system roles.',
	PERMISSION_DENIED: 'You do not have permission to perform this action.',
	BULK_UPDATE_PARTIAL: (updated: number, failed: number) =>
		`Updated ${updated} user(s), failed to update ${failed} user(s).`,
} as const

// =========================================================================
// ACCESS REQUIREMENTS (use usePermissions hook for runtime checks)
// =========================================================================

/**
 * Access requirements for RBAC features.
 *
 * NOTE: These are descriptive only. Actual access control is handled by:
 * - usePermissions() hook for frontend checks
 * - IRoleService for backend API authorization
 *
 * The values here match role NAMES (not levels) for documentation purposes.
 */
export const ACCESS_REQUIREMENTS = {
	/** View RBAC overview and matrix - requires Sales Manager or above */
	VIEW: 'sales_manager',
	/** Edit roles and permissions - requires Admin or above */
	EDIT: 'admin',
	/** View audit logs - requires Admin or above */
	AUDIT_LOG: 'admin',
	/** Bulk update roles - requires Admin or above */
	BULK_UPDATE: 'admin',
} as const

