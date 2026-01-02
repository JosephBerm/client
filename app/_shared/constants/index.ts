/**
 * Shared Constants Barrel Export
 * 
 * Centralized exports for all application constants.
 * Import from '@_shared' or '@_shared/constants'.
 * 
 * @module shared/constants
 */

// RBAC Default Constants (Single Source of Truth for Role Levels)
export {
	// Core constants
	DEFAULT_ROLE_THRESHOLDS,
	DEFAULT_ROLE_METADATA,
	// Cache configuration (centralized keys and TTL values)
	RBAC_QUERY_KEYS,
	RBAC_CACHE_CONFIG,
	// Display helpers
	getRoleDisplayName,
	getRoleBadgeVariant,
	// Types
	type RoleThresholds,
	type RoleMetadataEntry,
	type RoleBadgeVariant,
	// Legacy compatibility (deprecated)
	ROLE_OPTIONS,
	getRoleOption,
	getRoleLabel,
	getRoleColor,
	roleRequiresConfirmation,
	getRolesByLevelDescending,
	getRolesByLevelAscending,
	getStaffRoles,
	isStaffRole,
	getRoleSelectOptions,
	type RoleOption,
} from './rbac-defaults'

