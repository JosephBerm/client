/**
 * AccountStatusHelper - FAANG-Level Enum Helper
 *
 * Centralized metadata and helper functions for AccountStatus enum.
 * Used for managing user account lifecycle states.
 *
 * **Pattern:** Exhaustive metadata mapping (Google/Netflix/Stripe standard)
 *
 * **Features:**
 * - Display names for UI
 * - Badge variants for status indicators
 * - Descriptions for tooltips
 * - Icon names for visual feedback
 * - Login eligibility checks
 *
 * @example
 * ```typescript
 * import AccountStatusHelper from '@_classes/Helpers/AccountStatusHelper'
 * import { AccountStatus } from '@_classes/Enums'
 *
 * // Get display name
 * const name = AccountStatusHelper.getDisplay(AccountStatus.Active)
 * // → "Active"
 *
 * // Render status badge
 * <StatusBadge
 *   variant={AccountStatusHelper.getVariant(account.status)}
 *   label={AccountStatusHelper.getDisplay(account.status)}
 * />
 *
 * // Check login eligibility
 * if (!AccountStatusHelper.canLogin(account.status)) {
 *   // Show appropriate error message
 * }
 * ```
 *
 * @module Helpers/AccountStatusHelper
 */

import { AccountStatus } from '../Enums'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Badge variant for status indicators
 * Maps to DaisyUI badge variants
 */
export type AccountStatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

/**
 * Complete metadata for an AccountStatus enum value
 */
export interface AccountStatusMetadata {
	/** Enum value */
	value: AccountStatus
	/** Human-readable display name */
	display: string
	/** Badge variant for UI */
	variant: AccountStatusVariant
	/** Detailed description */
	description: string
	/** Icon name for visual feedback (lucide-react) */
	iconName: string
	/** Whether this status allows login */
	canLogin: boolean
	/** Whether this status requires user action */
	requiresAction: boolean
}

// ============================================================================
// METADATA MAP
// ============================================================================

/**
 * Exhaustive metadata map for AccountStatus enum
 *
 * TypeScript enforces: If you add a new AccountStatus, you MUST add metadata here.
 */
const ACCOUNT_STATUS_METADATA_MAP: Record<AccountStatus, AccountStatusMetadata> = {
	[AccountStatus.PendingVerification]: {
		value: AccountStatus.PendingVerification,
		display: 'Pending Verification',
		variant: 'info',
		description: 'Email verification required before login is allowed',
		iconName: 'Clock',
		canLogin: false,
		requiresAction: true,
	},
	[AccountStatus.Active]: {
		value: AccountStatus.Active,
		display: 'Active',
		variant: 'success',
		description: 'Account is fully operational with all features enabled',
		iconName: 'CheckCircle2',
		canLogin: true,
		requiresAction: false,
	},
	[AccountStatus.ForcePasswordChange]: {
		value: AccountStatus.ForcePasswordChange,
		display: 'Password Required',
		variant: 'warning',
		description: 'Password change required on next login',
		iconName: 'Key',
		canLogin: true, // Can login but must change password
		requiresAction: true,
	},
	[AccountStatus.Suspended]: {
		value: AccountStatus.Suspended,
		display: 'Suspended',
		variant: 'error',
		description: 'Account has been suspended by an administrator',
		iconName: 'AlertTriangle',
		canLogin: false,
		requiresAction: false, // Admin action needed
	},
	[AccountStatus.Locked]: {
		value: AccountStatus.Locked,
		display: 'Locked',
		variant: 'error',
		description: 'Account temporarily locked after 5 failed login attempts',
		iconName: 'Lock',
		canLogin: false,
		requiresAction: true, // Wait for lockout to expire
	},
	[AccountStatus.Archived]: {
		value: AccountStatus.Archived,
		display: 'Archived',
		variant: 'neutral',
		description: 'Account has been archived and is no longer active',
		iconName: 'Archive',
		canLogin: false,
		requiresAction: false,
	},
}

// ============================================================================
// HELPER CLASS
// ============================================================================

/**
 * AccountStatusHelper - Static helper class
 *
 * Provides type-safe access to AccountStatus metadata.
 */
export default class AccountStatusHelper {
	/**
	 * Array of all AccountStatus metadata
	 *
	 * @example
	 * ```typescript
	 * // Populate status filter
	 * <FormSelect
	 *   options={AccountStatusHelper.toList.map(meta => ({
	 *     value: meta.value,
	 *     label: meta.display,
	 *   }))}
	 * />
	 * ```
	 */
	static readonly toList: AccountStatusMetadata[] = Object.values(ACCOUNT_STATUS_METADATA_MAP)

	/**
	 * Get display name for a status
	 *
	 * @param status - AccountStatus enum value
	 * @returns Display name string
	 *
	 * @example
	 * ```typescript
	 * AccountStatusHelper.getDisplay(AccountStatus.Active)
	 * // → "Active"
	 * ```
	 */
	static getDisplay(status: AccountStatus): string {
		return ACCOUNT_STATUS_METADATA_MAP[status]?.display ?? 'Unknown'
	}

	/**
	 * Get badge variant for UI styling
	 *
	 * @param status - AccountStatus enum value
	 * @returns Variant string
	 *
	 * @example
	 * ```typescript
	 * <Badge variant={AccountStatusHelper.getVariant(account.status)}>
	 *   {AccountStatusHelper.getDisplay(account.status)}
	 * </Badge>
	 * ```
	 */
	static getVariant(status: AccountStatus): AccountStatusVariant {
		return ACCOUNT_STATUS_METADATA_MAP[status]?.variant ?? 'neutral'
	}

	/**
	 * Get description for a status
	 *
	 * @param status - AccountStatus enum value
	 * @returns Description string
	 *
	 * @example
	 * ```typescript
	 * const desc = AccountStatusHelper.getDescription(AccountStatus.Locked)
	 * // → "Account temporarily locked after 5 failed login attempts"
	 * ```
	 */
	static getDescription(status: AccountStatus): string {
		return ACCOUNT_STATUS_METADATA_MAP[status]?.description ?? 'No description available'
	}

	/**
	 * Get full metadata for a status
	 *
	 * @param status - AccountStatus enum value
	 * @returns Complete metadata object
	 *
	 * @example
	 * ```typescript
	 * const meta = AccountStatusHelper.getMetadata(AccountStatus.Active)
	 * console.log(meta.iconName)     // "CheckCircle2"
	 * console.log(meta.canLogin)     // true
	 * ```
	 */
	static getMetadata(status: AccountStatus): AccountStatusMetadata {
		return ACCOUNT_STATUS_METADATA_MAP[status]
	}

	/**
	 * Get icon name for a status (lucide-react icon names)
	 *
	 * @param status - AccountStatus enum value
	 * @returns Icon name string
	 *
	 * @example
	 * ```typescript
	 * const iconName = AccountStatusHelper.getIconName(AccountStatus.Locked)
	 * // → "Lock"
	 * ```
	 */
	static getIconName(status: AccountStatus): string {
		return ACCOUNT_STATUS_METADATA_MAP[status]?.iconName ?? 'User'
	}

	/**
	 * Check if status allows login
	 *
	 * @param status - AccountStatus enum value
	 * @returns True if user can login with this status
	 *
	 * @example
	 * ```typescript
	 * if (!AccountStatusHelper.canLogin(account.status)) {
	 *   showLoginBlockedError(account.status)
	 * }
	 * ```
	 */
	static canLogin(status: AccountStatus): boolean {
		return ACCOUNT_STATUS_METADATA_MAP[status]?.canLogin ?? false
	}

	/**
	 * Check if status requires user action
	 *
	 * @param status - AccountStatus enum value
	 * @returns True if user needs to take action
	 *
	 * @example
	 * ```typescript
	 * if (AccountStatusHelper.requiresAction(account.status)) {
	 *   showActionRequiredBanner()
	 * }
	 * ```
	 */
	static requiresAction(status: AccountStatus): boolean {
		return ACCOUNT_STATUS_METADATA_MAP[status]?.requiresAction ?? false
	}

	/**
	 * Get all statuses that allow login
	 *
	 * @returns Array of AccountStatus values that allow login
	 *
	 * @example
	 * ```typescript
	 * const loginableStatuses = AccountStatusHelper.getLoginableStatuses()
	 * // → [AccountStatus.Active, AccountStatus.ForcePasswordChange]
	 * ```
	 */
	static getLoginableStatuses(): AccountStatus[] {
		return this.toList.filter((meta) => meta.canLogin).map((meta) => meta.value)
	}

	/**
	 * Get all statuses that require user action
	 *
	 * @returns Array of AccountStatus values requiring action
	 */
	static getStatusesRequiringAction(): AccountStatus[] {
		return this.toList.filter((meta) => meta.requiresAction).map((meta) => meta.value)
	}

	/**
	 * Check if a value is a valid AccountStatus enum value
	 *
	 * @param value - Value to check
	 * @returns True if valid AccountStatus
	 *
	 * @example
	 * ```typescript
	 * const status = getStatusFromAPI()
	 *
	 * if (AccountStatusHelper.isValid(status)) {
	 *   // TypeScript now knows status is AccountStatus
	 *   const display = AccountStatusHelper.getDisplay(status)
	 * }
	 * ```
	 */
	static isValid(value: unknown): value is AccountStatus {
		if (typeof value !== 'number') {
			return false
		}
		return Object.values(AccountStatus).includes(value as AccountStatus)
	}
}
