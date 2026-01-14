/**
 * Step-Up Handler Constants
 *
 * Centralized constants for step-up authentication handling.
 * Eliminates magic strings and ensures consistency across the codebase.
 *
 * @module stepUpHandler.constants
 */

// =========================================================================
// HTTP HEADERS (match backend StepUpHandler.cs)
// =========================================================================

/** Header indicating step-up authentication is required */
export const STEP_UP_REQUIRED_HEADER = 'X-StepUp-Required' as const

/** Header containing the sensitive action code */
export const STEP_UP_ACTION_HEADER = 'X-StepUp-Action' as const

/** Header containing the reason for step-up requirement */
export const STEP_UP_REASON_HEADER = 'X-StepUp-Reason' as const

// =========================================================================
// EVENT CONFIGURATION
// =========================================================================

/** Custom event name for step-up required notifications */
export const STEP_UP_EVENT = 'step-up-required' as const

// =========================================================================
// STEP-UP REASONS (match backend StepUpHandler.cs)
// =========================================================================

export const STEP_UP_REASONS = {
	/** MFA was never verified for this session */
	NO_MFA: 'no_mfa',
	/** MFA verification has expired */
	MFA_STALE: 'mfa_stale',
	/** Policy requires higher MFA assurance level */
	INSUFFICIENT_LEVEL: 'insufficient_level',
} as const

export type StepUpReason = (typeof STEP_UP_REASONS)[keyof typeof STEP_UP_REASONS]

// =========================================================================
// SENSITIVE ACTIONS (match backend SensitiveActions.cs)
// =========================================================================

export const SENSITIVE_ACTIONS = {
	// Account Security
	CHANGE_PASSWORD: 'CHANGE_PASSWORD',
	CHANGE_EMAIL: 'CHANGE_EMAIL',
	CHANGE_PHONE: 'CHANGE_PHONE',
	ENABLE_MFA: 'ENABLE_MFA',
	DISABLE_MFA: 'DISABLE_MFA',
	REGENERATE_BACKUP_CODES: 'REGENERATE_BACKUP_CODES',
	REVOKE_ALL_SESSIONS: 'REVOKE_ALL_SESSIONS',
	REVOKE_ALL_TRUSTED_DEVICES: 'REVOKE_ALL_TRUSTED_DEVICES',
	DELETE_ACCOUNT: 'DELETE_ACCOUNT',

	// Administrative
	MODIFY_USER_ROLES: 'MODIFY_USER_ROLES',
	MODIFY_USER_PERMISSIONS: 'MODIFY_USER_PERMISSIONS',
	IMPERSONATE_USER: 'IMPERSONATE_USER',
	MODIFY_TENANT_SETTINGS: 'MODIFY_TENANT_SETTINGS',
	MODIFY_SECURITY_POLICY: 'MODIFY_SECURITY_POLICY',
	MANAGE_API_KEYS: 'MANAGE_API_KEYS',
	VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
	EXPORT_USER_DATA: 'EXPORT_USER_DATA',

	// Financial
	MODIFY_PAYMENT_METHOD: 'MODIFY_PAYMENT_METHOD',
	PROCESS_REFUND: 'PROCESS_REFUND',
	BULK_ORDER_MODIFICATION: 'BULK_ORDER_MODIFICATION',
	APPROVE_PRICE_OVERRIDE: 'APPROVE_PRICE_OVERRIDE',
	EXPORT_FINANCIAL_DATA: 'EXPORT_FINANCIAL_DATA',
	MODIFY_PRICING_RULES: 'MODIFY_PRICING_RULES',

	// Integration
	MANAGE_ERP_CONNECTION: 'MANAGE_ERP_CONNECTION',
	FORCE_SYNC: 'FORCE_SYNC',
	VIEW_INTEGRATION_SECRETS: 'VIEW_INTEGRATION_SECRETS',
	MODIFY_WEBHOOK_CONFIG: 'MODIFY_WEBHOOK_CONFIG',
} as const

export type SensitiveAction = (typeof SENSITIVE_ACTIONS)[keyof typeof SENSITIVE_ACTIONS]

// =========================================================================
// USER-FACING MESSAGES (DRY: reusable in UI)
// =========================================================================

/**
 * User-friendly messages for each sensitive action.
 * Used by StepUpModal to explain why verification is needed.
 */
export const ACTION_MESSAGES: Record<string, string> = {
	// Account Security
	[SENSITIVE_ACTIONS.CHANGE_PASSWORD]: 'To change your password, please verify your identity.',
	[SENSITIVE_ACTIONS.CHANGE_EMAIL]: 'To change your email address, please verify your identity.',
	[SENSITIVE_ACTIONS.CHANGE_PHONE]: 'To change your phone number, please verify your identity.',
	[SENSITIVE_ACTIONS.ENABLE_MFA]: 'To enable two-factor authentication, please verify your identity.',
	[SENSITIVE_ACTIONS.DISABLE_MFA]: 'To disable two-factor authentication, please verify your identity.',
	[SENSITIVE_ACTIONS.REGENERATE_BACKUP_CODES]: 'To regenerate backup codes, please verify your identity.',
	[SENSITIVE_ACTIONS.REVOKE_ALL_SESSIONS]: 'To sign out all devices, please verify your identity.',
	[SENSITIVE_ACTIONS.REVOKE_ALL_TRUSTED_DEVICES]: 'To remove all trusted devices, please verify your identity.',
	[SENSITIVE_ACTIONS.DELETE_ACCOUNT]: 'To delete your account, please verify your identity.',

	// Administrative
	[SENSITIVE_ACTIONS.MODIFY_USER_ROLES]: 'To modify user roles, please verify your identity.',
	[SENSITIVE_ACTIONS.MODIFY_USER_PERMISSIONS]: 'To modify user permissions, please verify your identity.',
	[SENSITIVE_ACTIONS.IMPERSONATE_USER]: 'To impersonate a user, please verify your identity.',
	[SENSITIVE_ACTIONS.MODIFY_TENANT_SETTINGS]: 'To modify tenant settings, please verify your identity.',
	[SENSITIVE_ACTIONS.MODIFY_SECURITY_POLICY]: 'To modify security policy, please verify your identity.',
	[SENSITIVE_ACTIONS.MANAGE_API_KEYS]: 'To manage API keys, please verify your identity.',
	[SENSITIVE_ACTIONS.VIEW_AUDIT_LOGS]: 'To view audit logs, please verify your identity.',
	[SENSITIVE_ACTIONS.EXPORT_USER_DATA]: 'To export user data, please verify your identity.',

	// Financial
	[SENSITIVE_ACTIONS.MODIFY_PAYMENT_METHOD]: 'To modify payment methods, please verify your identity.',
	[SENSITIVE_ACTIONS.PROCESS_REFUND]: 'To process a refund, please verify your identity.',
	[SENSITIVE_ACTIONS.BULK_ORDER_MODIFICATION]: 'To modify multiple orders, please verify your identity.',
	[SENSITIVE_ACTIONS.APPROVE_PRICE_OVERRIDE]: 'To approve a price override, please verify your identity.',
	[SENSITIVE_ACTIONS.EXPORT_FINANCIAL_DATA]: 'To export financial data, please verify your identity.',
	[SENSITIVE_ACTIONS.MODIFY_PRICING_RULES]: 'To modify pricing rules, please verify your identity.',

	// Integration
	[SENSITIVE_ACTIONS.MANAGE_ERP_CONNECTION]: 'To manage ERP connection, please verify your identity.',
	[SENSITIVE_ACTIONS.FORCE_SYNC]: 'To force a sync, please verify your identity.',
	[SENSITIVE_ACTIONS.VIEW_INTEGRATION_SECRETS]: 'To view integration secrets, please verify your identity.',
	[SENSITIVE_ACTIONS.MODIFY_WEBHOOK_CONFIG]: 'To modify webhook configuration, please verify your identity.',
} as const

/** Default message when action is not in the map */
export const DEFAULT_ACTION_MESSAGE = 'Please verify your identity to continue with this action.'

/**
 * Gets the user-friendly message for a sensitive action.
 * @param action - The action code from the step-up header
 * @returns Human-readable message explaining why verification is needed
 */
export function getActionMessage(action: string): string {
	return ACTION_MESSAGES[action] ?? DEFAULT_ACTION_MESSAGE
}

// =========================================================================
// ERROR MESSAGES
// =========================================================================

export const STEP_UP_ERROR_MESSAGES = {
	VERIFICATION_FAILED: 'Verification failed. Please try again.',
	VERIFICATION_CANCELLED: 'Verification cancelled.',
	CODE_INVALID: 'Invalid code. Please try again.',
	CODE_EXPIRED: 'Code has expired. Please request a new one.',
	TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again later.',
	NETWORK_ERROR: 'Network error. Please check your connection.',
} as const
