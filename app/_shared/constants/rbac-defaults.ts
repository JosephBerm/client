/**
 * RBAC Default Constants - Single Source of Truth (Frontend)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DRY COMPLIANCE: All frontend files MUST import from here.
 * DO NOT duplicate these values elsewhere.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * These are FALLBACK defaults used before API response loads.
 * MUST match: server/appsettings.json RBAC:Thresholds section
 *
 * WHITE-LABEL: Actual values come from GET /rbac/roles/thresholds API.
 * These defaults ensure the app works before the API call completes.
 */

// ============================================================================
// CORE VALUES - Single source of truth
// ============================================================================
const CUSTOMER_LEVEL = 1000
const FULFILLMENT_COORDINATOR_LEVEL = 2000
const SALES_REP_LEVEL = 3000
const SALES_MANAGER_LEVEL = 4000
const ADMIN_LEVEL = 5000
const SUPER_ADMIN_LEVEL = 9999

/**
 * Role level constants for type-safe role comparisons.
 *
 * ARCHITECTURE: These are FALLBACK values before API loads.
 * Actual role levels come from GET /rbac/roles/thresholds API.
 *
 * @example
 * ```typescript
 * import { RoleLevels } from '@_shared/constants'
 *
 * if (userRole >= RoleLevels.Admin) {
 *   // Show admin panel
 * }
 * ```
 *
 * @remarks
 * SYNC REQUIRED: Values MUST match server/appsettings.json RBAC:Thresholds
 */
export const RoleLevels = {
	Customer: CUSTOMER_LEVEL,
	FulfillmentCoordinator: FULFILLMENT_COORDINATOR_LEVEL,
	SalesRep: SALES_REP_LEVEL,
	SalesManager: SALES_MANAGER_LEVEL,
	Admin: ADMIN_LEVEL,
	SuperAdmin: SUPER_ADMIN_LEVEL,
} as const

/** Type for role level keys */
export type RoleLevelKey = keyof typeof RoleLevels

/** Type for role level values */
export type RoleLevelValue = (typeof RoleLevels)[RoleLevelKey]

/**
 * Default role level thresholds (API response format).
 * Used by usePermissions hook.
 *
 * @remarks
 * SYNC REQUIRED: If you change these, also update server/appsettings.json
 */
export const DEFAULT_ROLE_THRESHOLDS = {
	customerLevel: CUSTOMER_LEVEL,
	fulfillmentCoordinatorThreshold: FULFILLMENT_COORDINATOR_LEVEL,
	salesRepThreshold: SALES_REP_LEVEL,
	salesManagerThreshold: SALES_MANAGER_LEVEL,
	adminThreshold: ADMIN_LEVEL,
	superAdminThreshold: SUPER_ADMIN_LEVEL,
} as const

// REMOVED: LEGACY_ROLE_LEVELS
// Migration: Use DEFAULT_ROLE_THRESHOLDS or usePermissions() hook instead

// Note: RoleThresholds interface is defined in @_types/rbac as the canonical source.
// This constant provides default values matching that interface.

// ============================================================================
// CACHE CONFIGURATION - Centralized cache keys and TTL values
// ============================================================================

/**
 * RBAC Query Keys for React Query / TanStack Query
 * Centralized to prevent magic string duplication
 */
export const RBAC_QUERY_KEYS = {
	/** Role thresholds query key */
	thresholds: 'rbac-thresholds',
	/** User permissions query key factory */
	permissions: (userId: number | string) => `rbac-permissions-${userId}`,
	/** User role query key factory */
	userRole: (userId: number | string) => `rbac-user-role-${userId}`,
} as const

/**
 * RBAC Cache Configuration
 * Centralized TTL values for consistent caching behavior
 *
 * @remarks
 * - thresholdsStaleTime: Long TTL - role thresholds rarely change
 * - permissionsStaleTime: Short TTL - permissions may change more frequently
 * - userRoleStaleTime: Short TTL - user role may be updated by admin
 */
export const RBAC_CACHE_CONFIG = {
	/** Role thresholds stale time: 1 hour (rarely change) */
	thresholdsStaleTime: 60 * 60 * 1000, // 1 hour
	/** User permissions stale time: 5 minutes (may change) */
	permissionsStaleTime: 5 * 60 * 1000, // 5 minutes
	/** User role stale time: 5 minutes (may be updated) */
	userRoleStaleTime: 5 * 60 * 1000, // 5 minutes
} as const

/**
 * Default role metadata for UI display.
 * Maps role levels to display information.
 */
export const DEFAULT_ROLE_METADATA = {
	[CUSTOMER_LEVEL]: {
		level: CUSTOMER_LEVEL,
		name: 'customer',
		display: 'Customer',
		shortLabel: 'Customer',
		variant: 'info' as const,
	},
	[FULFILLMENT_COORDINATOR_LEVEL]: {
		level: FULFILLMENT_COORDINATOR_LEVEL,
		name: 'fulfillment_coordinator',
		display: 'Fulfillment Coordinator',
		shortLabel: 'Fulfillment',
		variant: 'secondary' as const,
	},
	[SALES_REP_LEVEL]: {
		level: SALES_REP_LEVEL,
		name: 'sales_rep',
		display: 'Sales Representative',
		shortLabel: 'Sales Rep',
		variant: 'secondary' as const,
	},
	[SALES_MANAGER_LEVEL]: {
		level: SALES_MANAGER_LEVEL,
		name: 'sales_manager',
		display: 'Sales Manager',
		shortLabel: 'Sales Mgr',
		variant: 'secondary' as const,
	},
	[ADMIN_LEVEL]: {
		level: ADMIN_LEVEL,
		name: 'admin',
		display: 'Administrator',
		shortLabel: 'Admin',
		variant: 'primary' as const,
	},
	[SUPER_ADMIN_LEVEL]: {
		level: SUPER_ADMIN_LEVEL,
		name: 'super_admin',
		display: 'Super Administrator',
		shortLabel: 'Super Admin',
		variant: 'warning' as const,
	},
} as const

/** Type for role metadata entry */
export type RoleMetadataEntry = (typeof DEFAULT_ROLE_METADATA)[keyof typeof DEFAULT_ROLE_METADATA]

/** Badge variant type */
export type RoleBadgeVariant = RoleMetadataEntry['variant']

/**
 * Check if a value is a valid role level (positive number).
 *
 * @param value - Value to check
 * @returns True if valid role level
 */
export function isValidRoleLevel(value: unknown): value is number {
	return typeof value === 'number' && value > 0
}

/**
 * Get display name for a role level.
 *
 * @param roleLevel - Numeric role level (or undefined)
 * @returns Display name or fallback string
 */
export function getRoleDisplayName(roleLevel: number | undefined): string {
	if (roleLevel === undefined) {
		return 'Unknown'
	}
	const metadata = DEFAULT_ROLE_METADATA[roleLevel as keyof typeof DEFAULT_ROLE_METADATA]
	return metadata?.display ?? `Role ${roleLevel}`
}

/**
 * Get short label for a role level (for compact UIs).
 *
 * @param roleLevel - Numeric role level
 * @returns Short label string
 */
export function getRoleShortLabel(roleLevel: number): string {
	const metadata = DEFAULT_ROLE_METADATA[roleLevel as keyof typeof DEFAULT_ROLE_METADATA]
	return metadata?.shortLabel ?? getRoleDisplayName(roleLevel)
}

/**
 * Get badge variant for a role level.
 *
 * @param roleLevel - Numeric role level
 * @returns Badge variant for UI styling
 */
export function getRoleBadgeVariant(roleLevel: number): RoleBadgeVariant {
	const metadata = DEFAULT_ROLE_METADATA[roleLevel as keyof typeof DEFAULT_ROLE_METADATA]
	if (metadata) return metadata.variant

	// Fallback based on level
	if (roleLevel >= DEFAULT_ROLE_THRESHOLDS.superAdminThreshold) return 'warning'
	if (roleLevel >= DEFAULT_ROLE_THRESHOLDS.adminThreshold) return 'primary'
	if (roleLevel >= DEFAULT_ROLE_THRESHOLDS.salesRepThreshold) return 'secondary'
	return 'info'
}

/** Role select option type for dropdowns */
export interface RoleSelectOption {
	value: number
	label: string
}

/**
 * Get role options for Select/dropdown components.
 * Returns array of { value, label } for all defined roles.
 *
 * @returns Array of role options for dropdowns
 *
 * @example
 * ```tsx
 * <Select options={getRoleSelectOptions()} />
 * ```
 */
export function getRoleSelectOptions(): RoleSelectOption[] {
	return Object.values(DEFAULT_ROLE_METADATA).map((r) => ({
		value: r.level,
		label: r.display,
	}))
}
