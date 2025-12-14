/**
 * Shared Constants Barrel Export
 * 
 * Centralized exports for all application constants.
 * Import from '@_shared' or '@_shared/constants'.
 * 
 * @module shared/constants
 */

// Role constants and helpers
export {
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
} from './roles'

