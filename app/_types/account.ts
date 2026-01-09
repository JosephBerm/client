/**
 * Account Types - Shared Type Definitions
 * 
 * Centralized type definitions for account-related components.
 * Follows MAANG-level DRY principle - single source of truth for types.
 * 
 * These minimal interfaces allow components to work with both:
 * - Full User objects from API
 * - Partial account data from tables
 * 
 * @module types/account
 */

import type { AccountStatus } from '@_classes/Enums'

// ============================================================================
// MINIMAL ACCOUNT INFO (for modals, displays, etc.)
// ============================================================================

/**
 * Minimal account information for UI components.
 * This interface is satisfied by both User class and table row data.
 * 
 * **Use Cases:**
 * - Password reset modal
 * - Role change modal
 * - User info displays
 * - Table row actions
 * 
 * **Phase 1 Enhancement**: Added status field for account status system
 */
export interface AccountInfo {
	/** Unique identifier */
	id: string
	/** Username for login */
	username: string
	/** Email address */
	email: string
	/** Current role level */
	roleLevel: number
	/** Account creation timestamp (optional for backward compatibility) */
	createdAt?: Date | string
	/** Account status (Phase 1 - optional for backward compatibility) */
	status?: AccountStatus
}

/**
 * Convert any user-like object to AccountInfo.
 * Handles null IDs gracefully for defensive programming.
 * 
 * **Phase 1 Enhancement**: Includes status field
 * 
 * @param user - Any object with id, username, email, role properties
 * @returns AccountInfo or null if invalid
 */
export function toAccountInfo(user: {
	id?: string | number | null
	username?: string
	email?: string
	roleLevel?: number | null
	createdAt?: Date | string
	status?: AccountStatus
} | null | undefined): AccountInfo | null {
	if (!user?.id) {
		return null
	}
	
	return {
		id: String(user.id),
		username: user.username ?? '',
		email: user.email ?? '',
		roleLevel: user.roleLevel ?? 0,
		createdAt: user.createdAt,
		status: user.status,
	}
}

/**
 * Get display name for an account.
 * Prefers username if different from email, otherwise uses email.
 * 
 * @param account - Account info object
 * @returns Display-friendly name
 */
export function getAccountDisplayName(account: AccountInfo | null | undefined): string {
	if (!account) {
		return 'Unknown'
	}
	return account.username !== account.email ? account.username : account.email
}

