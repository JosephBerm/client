/**
 * User Utilities and Helpers
 * 
 * Utility functions for filtering, sorting, and transforming user data.
 * Provides reusable functions for common user operations across the application.
 * 
 * **Features:**
 * - Role-based filtering (SalesRep+, Admin, etc.)
 * - User sorting (by role, name, email)
 * - User transformation (to select options, display names)
 * - Type-safe with full TypeScript support
 * 
 * **Separation of Concerns:**
 * - Pure functions (no side effects)
 * - Reusable across components
 * - Single responsibility per function
 * 
 * @example
 * ```typescript
 * import { filterUsersByRole, sortUsersByRoleAndName, transformUsersToSelectOptions } from '@_shared/utils/userHelpers';
 * 
 * // Filter to sales reps
 * const salesReps = filterUsersByRole(users, AccountRole.SalesRep);
 * 
 * // Sort by role then name
 * const sorted = sortUsersByRoleAndName(salesReps);
 * 
 * // Transform to select options
 * const options = transformUsersToSelectOptions(sorted);
 * ```
 * 
 * @module userHelpers
 */

import { AccountRole, type AccountRoleType } from '@_classes/Enums'
import AccountRoleHelper from '@_classes/Helpers/AccountRoleHelper'

import type User from '@_classes/User'
import type { SelectOption } from '@_components/ui/Select'

/**
 * Filters users by minimum role level.
 * 
 * Returns all users with role >= minimumRole.
 * 
 * @param users - Array of users to filter
 * @param minimumRole - Minimum role level (e.g., AccountRole.SalesRep = 100)
 * @returns Filtered array of users
 * 
 * @example
 * ```typescript
 * const salesReps = filterUsersByRole(allUsers, AccountRole.SalesRep);
 * // Returns: SalesRep (100), SalesManager (200), FulfillmentCoordinator (300), Admin (9999999)
 * ```
 */
export function filterUsersByRole(users: User[], minimumRole: AccountRoleType): User[] {
	return users.filter((user) => {
		const roleValue = user.role ?? 0
		return roleValue >= minimumRole
	})
}

/**
 * Sorts users by role level (descending), then by name (ascending).
 * 
 * Higher roles appear first. Within the same role, users are sorted alphabetically.
 * 
 * @param users - Array of users to sort
 * @returns Sorted array of users
 * 
 * @example
 * ```typescript
 * const sorted = sortUsersByRoleAndName(users);
 * // Admin first, then SalesManager, then SalesRep, sorted by name within each role
 * ```
 */
export function sortUsersByRoleAndName(users: User[]): User[] {
	return [...users].sort((a, b) => {
		// Sort by role level (higher first)
		const aRole = a.role ?? 0
		const bRole = b.role ?? 0
		if (aRole !== bRole) {
			return bRole - aRole
		}
		
		// Sort by name (alphabetical)
		const aName = a.name?.getFormattedName() ?? a.email ?? ''
		const bName = b.name?.getFormattedName() ?? b.email ?? ''
		return aName.localeCompare(bName)
	})
}

/**
 * Transforms users to select options with role labels.
 * 
 * Creates SelectOption array with format: "Display Name (Role Label)".
 * Uses AccountRoleHelper for consistent role labels.
 * 
 * @param users - Array of users to transform
 * @param includeEmptyOption - Whether to include empty "Select..." option (default: false)
 * @returns Array of SelectOption objects
 * 
 * @example
 * ```typescript
 * const options = transformUsersToSelectOptions(users, true);
 * // [
 * //   { value: '', label: 'Select a sales rep...' },
 * //   { value: '123', label: 'John Doe (Sales Rep)' },
 * //   { value: '456', label: 'Jane Smith (Sales Manager)' }
 * // ]
 * ```
 */
export function transformUsersToSelectOptions(
	users: User[],
	includeEmptyOption = false
): SelectOption<string>[] {
	const options: SelectOption<string>[] = []
	
	if (includeEmptyOption) {
		// Empty option is a placeholder, not a valid selection - disable it
		options.push({
			value: '',
			label: 'Select a sales rep...',
			disabled: true,
		})
	}
	
	users.forEach((user) => {
		const displayName = user.name?.getFormattedName() ?? user.email ?? user.id ?? 'Unknown'
		const roleLabel = user.role !== null && user.role !== undefined && AccountRoleHelper.isValid(user.role)
			? AccountRoleHelper.getShortLabel(user.role)
			: 'Unknown Role'
		
		options.push({
			value: user.id ?? '',
			label: `${displayName} (${roleLabel})`,
		})
	})
	
	return options
}

/**
 * Gets display name for a user.
 * 
 * Priority: formatted name > email > id > 'Unknown'
 * 
 * @param user - User object
 * @returns Display name string
 * 
 * @example
 * ```typescript
 * const name = getUserDisplayName(user);
 * // "John Doe" or "john@example.com" or "123" or "Unknown"
 * ```
 */
export function getUserDisplayName(user: User | null): string {
	if (!user) {
		return 'Unknown'
	}
	return user.name?.getFormattedName() ?? user.email ?? user.id ?? 'Unknown'
}

