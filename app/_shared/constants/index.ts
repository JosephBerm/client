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
	// Role level constants (use for role comparisons)
	RoleLevels,
	// Core constants
	DEFAULT_ROLE_THRESHOLDS,
	DEFAULT_ROLE_METADATA,
	// Cache configuration (centralized keys and TTL values)
	RBAC_QUERY_KEYS,
	RBAC_CACHE_CONFIG,
	// Display helpers
	getRoleDisplayName,
	getRoleShortLabel,
	getRoleBadgeVariant,
	getRoleSelectOptions,
	// Validation helpers
	isValidRoleLevel,
	// Types
	type RoleLevelKey,
	type RoleLevelValue,
	type RoleThresholds,
	type RoleMetadataEntry,
	type RoleBadgeVariant,
	type RoleSelectOption,
} from './rbac-defaults'
