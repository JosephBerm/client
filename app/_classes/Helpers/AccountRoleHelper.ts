/**
 * RoleLevelHelper - Role Level Utilities (White-Label Ready)
 * 
 * @deprecated For React components, prefer usePermissions() hook.
 * This helper is for non-React contexts (utilities, tests, etc.)
 * 
 * DRY: Uses centralized constants from @_shared/constants/rbac-defaults
 * 
 * @module Helpers/RoleLevelHelper
 */

import {
	DEFAULT_ROLE_THRESHOLDS,
	DEFAULT_ROLE_METADATA,
	getRoleDisplayName,
	getRoleBadgeVariant,
	type RoleBadgeVariant,
	type RoleMetadataEntry,
} from '@_shared/constants'

// Re-export types for backward compatibility
export type RoleLevelVariant = RoleBadgeVariant
export type AccountRoleVariant = RoleBadgeVariant
export type RoleLevelMetadata = RoleMetadataEntry
export type AccountRoleMetadata = RoleMetadataEntry

/**
 * RoleLevelHelper - Static utility class for role level operations
 * 
 * @deprecated For React components, use usePermissions() hook instead.
 * This class is provided for backward compatibility and non-React contexts.
 */
class RoleLevelHelper {
	/** Default thresholds - use for non-React contexts only */
	static readonly defaultThresholds = DEFAULT_ROLE_THRESHOLDS

	/** List of all default role metadata */
	static readonly toList = Object.values(DEFAULT_ROLE_METADATA)

	/** Get display name for a role level */
	static getDisplay(roleLevel: number): string {
		return getRoleDisplayName(roleLevel)
	}

	/** Get short label for compact UIs */
	static getShortLabel(roleLevel: number): string {
		const metadata = DEFAULT_ROLE_METADATA[roleLevel as keyof typeof DEFAULT_ROLE_METADATA]
		return metadata?.shortLabel ?? getRoleDisplayName(roleLevel)
	}

	/** Get badge variant for UI styling */
	static getVariant(roleLevel: number): RoleBadgeVariant {
		return getRoleBadgeVariant(roleLevel)
	}

	/** Check if role level is Admin or higher */
	static isAdmin(roleLevel: number, threshold = DEFAULT_ROLE_THRESHOLDS.adminThreshold): boolean {
		return roleLevel >= threshold
	}

	/** Check if role level is SuperAdmin */
	static isSuperAdmin(roleLevel: number, threshold = DEFAULT_ROLE_THRESHOLDS.superAdminThreshold): boolean {
		return roleLevel >= threshold
	}

	/** Check if role level is exactly Customer level */
	static isCustomer(roleLevel: number, customerLevel = DEFAULT_ROLE_THRESHOLDS.customerLevel): boolean {
		return roleLevel === customerLevel
	}

	/** Check if role level meets minimum required level */
	static hasMinimumLevel(roleLevel: number, requiredLevel: number): boolean {
		return roleLevel >= requiredLevel
	}

	/** Check if a value is a valid role level (positive number) */
	static isValid(value: unknown): value is number {
		return typeof value === 'number' && value > 0
	}
}

// Default export
export default RoleLevelHelper

// Legacy alias for backward compatibility
export { RoleLevelHelper as AccountRoleHelper }
