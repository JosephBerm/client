/**
 * AccountRoleHelper - FAANG-Level Enum Helper
 * 
 * Centralized metadata and helper functions for AccountRole enum.
 * Used for role-based access control (RBAC) and user permissions.
 * 
 * **Pattern:** Exhaustive metadata mapping (Google/Netflix/Stripe standard)
 * 
 * **Features:**
 * - Display names for UI
 * - Badge variants for role indicators
 * - Permission levels for access control
 * - Descriptions for onboarding/help
 * - Priority/hierarchy for sorting
 * 
 * @example
 * ```typescript
 * import AccountRoleHelper from '@_classes/Helpers/AccountRoleHelper'
 * import { AccountRole } from '@_classes/Enums'
 * 
 * // Get display name
 * const name = AccountRoleHelper.getDisplay(AccountRole.Admin)
 * // → "Administrator"
 * 
 * // Check if role has admin privileges
 * const isAdmin = AccountRoleHelper.isAdmin(user.role)
 * // → true
 * 
 * // Render role badge
 * <Badge variant={AccountRoleHelper.getVariant(user.role)}>
 *   {AccountRoleHelper.getDisplay(user.role)}
 * </Badge>
 * 
 * // Check permission level
 * if (AccountRoleHelper.getLevel(user.role) >= AccountRoleHelper.getLevel(AccountRole.Admin)) {
 *   // Allow admin action
 * }
 * ```
 * 
 * @module Helpers/AccountRoleHelper
 */

import { AccountRole } from '../Enums'

/**
 * Badge variant for role indicators
 */
export type AccountRoleVariant = 'primary' | 'secondary' | 'info'

/**
 * Complete metadata for an AccountRole enum value
 */
export interface AccountRoleMetadata {
	/** Enum value */
	value: AccountRole
	/** Human-readable display name */
	display: string
	/** Badge variant for UI */
	variant: AccountRoleVariant
	/** Detailed description */
	description: string
	/** Permission level (higher = more permissions) */
	level: number
	/** Short label for compact UIs */
	shortLabel: string
}

/**
 * Exhaustive metadata map for AccountRole enum
 * 
 * TypeScript enforces: If you add a new AccountRole, you MUST add metadata here.
 */
const ACCOUNT_ROLE_METADATA_MAP: Record<AccountRole, AccountRoleMetadata> = {
	[AccountRole.Customer]: {
		value: AccountRole.Customer,
		display: 'Customer',
		variant: 'info',
		description: 'Regular customer user who can browse products, place orders, and request quotes',
		level: 0, // Matches enum value
		shortLabel: 'Customer',
	},
	[AccountRole.Admin]: {
		value: AccountRole.Admin,
		display: 'Administrator',
		variant: 'primary',
		description:
			'Administrator with full system access, can manage users, orders, quotes, products, and all entities',
		level: 9999999, // Matches enum value
		shortLabel: 'Admin',
	},
}

/**
 * AccountRoleHelper - Static helper class
 * 
 * Provides type-safe access to AccountRole metadata and RBAC utilities.
 */
export default class AccountRoleHelper {
	/**
	 * Array of all AccountRole metadata
	 * 
	 * @example
	 * ```typescript
	 * // Populate role selector
	 * <FormSelect
	 *   options={AccountRoleHelper.toList.map(meta => ({
	 *     value: meta.value,
	 *     label: meta.display,
	 *   }))}
	 * />
	 * ```
	 */
	static readonly toList: AccountRoleMetadata[] = Object.values(ACCOUNT_ROLE_METADATA_MAP)

	/**
	 * Get display name for a role
	 * 
	 * @param role - AccountRole enum value
	 * @returns Display name string
	 * 
	 * @example
	 * ```typescript
	 * AccountRoleHelper.getDisplay(AccountRole.Admin)
	 * // → "Administrator"
	 * ```
	 */
	static getDisplay(role: AccountRole): string {
		return ACCOUNT_ROLE_METADATA_MAP[role]?.display || 'Unknown'
	}

	/**
	 * Get short label for a role (compact UIs)
	 * 
	 * @param role - AccountRole enum value
	 * @returns Short label string
	 * 
	 * @example
	 * ```typescript
	 * AccountRoleHelper.getShortLabel(AccountRole.Admin)
	 * // → "Admin"
	 * ```
	 */
	static getShortLabel(role: AccountRole): string {
		return ACCOUNT_ROLE_METADATA_MAP[role]?.shortLabel || 'Unknown'
	}

	/**
	 * Get badge variant for UI styling
	 * 
	 * @param role - AccountRole enum value
	 * @returns Variant string
	 * 
	 * @example
	 * ```typescript
	 * <Badge variant={AccountRoleHelper.getVariant(user.role)}>
	 *   {AccountRoleHelper.getDisplay(user.role)}
	 * </Badge>
	 * ```
	 */
	static getVariant(role: AccountRole): AccountRoleVariant {
		return ACCOUNT_ROLE_METADATA_MAP[role]?.variant || 'info'
	}

	/**
	 * Get description for a role
	 * 
	 * @param role - AccountRole enum value
	 * @returns Description string
	 * 
	 * @example
	 * ```typescript
	 * const desc = AccountRoleHelper.getDescription(AccountRole.Customer)
	 * // → "Regular customer user who can browse products..."
	 * ```
	 */
	static getDescription(role: AccountRole): string {
		return ACCOUNT_ROLE_METADATA_MAP[role]?.description || 'No description available'
	}

	/**
	 * Get full metadata for a role
	 * 
	 * @param role - AccountRole enum value
	 * @returns Complete metadata object
	 * 
	 * @example
	 * ```typescript
	 * const meta = AccountRoleHelper.getMetadata(AccountRole.Admin)
	 * console.log(meta.level)      // 9999999
	 * console.log(meta.shortLabel) // "Admin"
	 * ```
	 */
	static getMetadata(role: AccountRole): AccountRoleMetadata {
		return ACCOUNT_ROLE_METADATA_MAP[role]
	}

	/**
	 * Get permission level for a role
	 * 
	 * @param role - AccountRole enum value
	 * @returns Permission level (higher = more permissions)
	 * 
	 * @example
	 * ```typescript
	 * AccountRoleHelper.getLevel(AccountRole.Admin)    // 9999999
	 * AccountRoleHelper.getLevel(AccountRole.Customer) // 0
	 * ```
	 */
	static getLevel(role: AccountRole): number {
		return ACCOUNT_ROLE_METADATA_MAP[role]?.level || 0
	}

	/**
	 * Check if role is Admin
	 * 
	 * @param role - AccountRole enum value
	 * @returns True if Admin role
	 * 
	 * @example
	 * ```typescript
	 * if (AccountRoleHelper.isAdmin(user.role)) {
	 *   // Show admin features
	 * }
	 * ```
	 */
	static isAdmin(role: AccountRole): boolean {
		return role === AccountRole.Admin
	}

	/**
	 * Check if role is Customer
	 * 
	 * @param role - AccountRole enum value
	 * @returns True if Customer role
	 * 
	 * @example
	 * ```typescript
	 * if (AccountRoleHelper.isCustomer(user.role)) {
	 *   // Show customer-specific UI
	 * }
	 * ```
	 */
	static isCustomer(role: AccountRole): boolean {
		return role === AccountRole.Customer
	}

	/**
	 * Check if one role has higher permissions than another
	 * 
	 * @param role - Role to check
	 * @param thanRole - Role to compare against
	 * @returns True if role has higher permissions
	 * 
	 * @example
	 * ```typescript
	 * AccountRoleHelper.hasHigherPermissionsThan(AccountRole.Admin, AccountRole.Customer)
	 * // → true
	 * ```
	 */
	static hasHigherPermissionsThan(role: AccountRole, thanRole: AccountRole): boolean {
		return this.getLevel(role) > this.getLevel(thanRole)
	}

	/**
	 * Check if one role has same or higher permissions than another
	 * 
	 * @param role - Role to check
	 * @param thanRole - Role to compare against
	 * @returns True if role has same or higher permissions
	 * 
	 * @example
	 * ```typescript
	 * // Check if user can perform action requiring Admin
	 * if (AccountRoleHelper.hasPermissionLevel(user.role, AccountRole.Admin)) {
	 *   // Allow admin action
	 * }
	 * ```
	 */
	static hasPermissionLevel(role: AccountRole, requiredRole: AccountRole): boolean {
		return this.getLevel(role) >= this.getLevel(requiredRole)
	}

	/**
	 * Sort roles by permission level (high to low)
	 * 
	 * @param roles - Array of AccountRole values
	 * @returns Sorted array (admins first, then customers)
	 * 
	 * @example
	 * ```typescript
	 * const roles = [AccountRole.Customer, AccountRole.Admin]
	 * const sorted = AccountRoleHelper.sortByLevel(roles)
	 * // → [AccountRole.Admin, AccountRole.Customer]
	 * ```
	 */
	static sortByLevel(roles: AccountRole[]): AccountRole[] {
		return [...roles].sort((a, b) => {
			const levelA = this.getLevel(a)
			const levelB = this.getLevel(b)
			return levelB - levelA // High to low
		})
	}

	/**
	 * Check if a value is a valid AccountRole enum value
	 * 
	 * @param value - Value to check
	 * @returns True if valid AccountRole
	 * 
	 * @example
	 * ```typescript
	 * const role = getRoleFromAPI()
	 * 
	 * if (AccountRoleHelper.isValid(role)) {
	 *   // TypeScript now knows role is AccountRole
	 *   const display = AccountRoleHelper.getDisplay(role)
	 * }
	 * ```
	 */
	static isValid(value: unknown): value is AccountRole {
		if (typeof value !== 'number') return false
		return Object.values(AccountRole).includes(value as AccountRole)
	}
}

