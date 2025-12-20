/**
 * RBAC Constants - Single Source of Truth
 *
 * Centralizes all RBAC-related constants, configurations, and mappings.
 * Ensures consistency across the RBAC management feature.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Centralized Constants Pattern
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Benefits:
 * - Single source of truth for RBAC values
 * - Easy to modify across all components
 * - Type-safe with TypeScript enums/constants
 * - Enables tree-shaking of unused exports
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @module RBAC Constants
 */

import { RoleLevels, type RoleLevel } from '@_types/rbac'

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
// ROLE CONFIGURATION
// =========================================================================

/**
 * Role hierarchy configuration.
 * Higher level = more authority.
 */
export const ROLE_HIERARCHY: Record<RoleLevel, { label: string; description: string; color: string }> = {
	[RoleLevels.Customer]: {
		label: 'Customer',
		description: 'Basic access to own data and orders',
		color: 'bg-base-200 text-base-content',
	},
	[RoleLevels.SalesRep]: {
		label: 'Sales Representative',
		description: 'Manage assigned customers and quotes',
		color: 'bg-blue-100 text-blue-800',
	},
	[RoleLevels.FulfillmentCoordinator]: {
		label: 'Fulfillment Coordinator',
		description: 'Manage orders and vendor coordination',
		color: 'bg-amber-100 text-amber-800',
	},
	[RoleLevels.SalesManager]: {
		label: 'Sales Manager',
		description: 'Oversee team and view analytics',
		color: 'bg-purple-100 text-purple-800',
	},
	[RoleLevels.Admin]: {
		label: 'Administrator',
		description: 'Full system access and configuration',
		color: 'bg-rose-100 text-rose-800',
	},
}

/**
 * Get role configuration by level.
 */
export function getRoleConfig(level: RoleLevel) {
	return ROLE_HIERARCHY[level] ?? ROLE_HIERARCHY[RoleLevels.Customer]
}

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
// ACCESS REQUIREMENTS
// =========================================================================

/**
 * Minimum role requirements for RBAC features.
 */
export const ACCESS_REQUIREMENTS = {
	/** View RBAC overview and matrix */
	VIEW: RoleLevels.SalesManager,
	/** Edit roles and permissions */
	EDIT: RoleLevels.Admin,
	/** View audit logs */
	AUDIT_LOG: RoleLevels.Admin,
	/** Bulk update roles */
	BULK_UPDATE: RoleLevels.Admin,
} as const

