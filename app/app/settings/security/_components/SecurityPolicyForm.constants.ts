/**
 * Security Policy Form Constants
 *
 * Centralized constants for the security policy management UI.
 * Eliminates magic strings and ensures consistency.
 *
 * @module SecurityPolicyForm.constants
 */

// =========================================================================
// MFA REQUIREMENT OPTIONS
// =========================================================================

export const MFA_REQUIREMENT_OPTIONS = [
	{ value: 'Disabled', label: 'Disabled', description: 'MFA is not available' },
	{ value: 'Optional', label: 'Optional', description: 'Users can choose to enable MFA' },
	{ value: 'Required', label: 'Required for All', description: 'All users must enable MFA' },
	{ value: 'AdminRequired', label: 'Required for Admins', description: 'Only admins must enable MFA' },
	{ value: 'RoleSpecific', label: 'Role-Specific', description: 'Specific roles must enable MFA' },
] as const

// =========================================================================
// ROLE OPTIONS (for RoleSpecific MFA)
// =========================================================================

export const ROLE_OPTIONS = [
	{ value: 'Admin', label: 'Admin' },
	{ value: 'SalesManager', label: 'Sales Manager' },
	{ value: 'SalesRep', label: 'Sales Rep' },
	{ value: 'FulfillmentCoordinator', label: 'Fulfillment Coordinator' },
	{ value: 'Customer', label: 'Customer' },
] as const

// =========================================================================
// SENSITIVE ACTION OPTIONS (for Step-Up)
// =========================================================================

export const SENSITIVE_ACTION_OPTIONS = [
	// Account Security
	{ value: 'CHANGE_PASSWORD', label: 'Change Password', category: 'Account Security' },
	{ value: 'CHANGE_EMAIL', label: 'Change Email', category: 'Account Security' },
	{ value: 'DISABLE_MFA', label: 'Disable MFA', category: 'Account Security' },
	{ value: 'REGENERATE_BACKUP_CODES', label: 'Regenerate Backup Codes', category: 'Account Security' },
	{ value: 'REVOKE_ALL_SESSIONS', label: 'Revoke All Sessions', category: 'Account Security' },
	{ value: 'REVOKE_ALL_TRUSTED_DEVICES', label: 'Revoke All Trusted Devices', category: 'Account Security' },
	{ value: 'DELETE_ACCOUNT', label: 'Delete Account', category: 'Account Security' },

	// Administrative
	{ value: 'MODIFY_USER_ROLES', label: 'Modify User Roles', category: 'Administrative' },
	{ value: 'MODIFY_USER_PERMISSIONS', label: 'Modify User Permissions', category: 'Administrative' },
	{ value: 'IMPERSONATE_USER', label: 'Impersonate User', category: 'Administrative' },
	{ value: 'MODIFY_SECURITY_POLICY', label: 'Modify Security Policy', category: 'Administrative' },
	{ value: 'VIEW_AUDIT_LOGS', label: 'View Audit Logs', category: 'Administrative' },
	{ value: 'EXPORT_USER_DATA', label: 'Export User Data', category: 'Administrative' },

	// Financial
	{ value: 'MODIFY_PAYMENT_METHOD', label: 'Modify Payment Method', category: 'Financial' },
	{ value: 'PROCESS_REFUND', label: 'Process Refund', category: 'Financial' },
	{ value: 'EXPORT_FINANCIAL_DATA', label: 'Export Financial Data', category: 'Financial' },
	{ value: 'MODIFY_PRICING_RULES', label: 'Modify Pricing Rules', category: 'Financial' },

	// Integration
	{ value: 'MANAGE_ERP_CONNECTION', label: 'Manage ERP Connection', category: 'Integration' },
	{ value: 'VIEW_INTEGRATION_SECRETS', label: 'View Integration Secrets', category: 'Integration' },
] as const

// =========================================================================
// FORM LABELS
// =========================================================================

export const FORM_LABELS = {
	// MFA Section
	MFA_REQUIREMENT: 'MFA Requirement',
	MFA_REQUIRED_ROLES: 'Roles Requiring MFA',
	ALLOW_TRUSTED_DEVICES: 'Allow Trusted Devices',
	TRUSTED_DEVICE_MAX_DAYS: 'Trusted Device Duration (days)',
	MAX_TRUSTED_DEVICES: 'Max Trusted Devices Per User',

	// Session Section
	IDLE_TIMEOUT: 'Idle Timeout (minutes)',
	MAX_SESSION_AGE: 'Max Session Age (hours)',
	MAX_CONCURRENT_SESSIONS: 'Max Concurrent Sessions',

	// Step-Up Section
	STEP_UP_FRESHNESS: 'MFA Freshness for Step-Up (minutes)',
	STEP_UP_ACTIONS: 'Actions Requiring Step-Up',

	// Remember Me Section
	ALLOW_REMEMBER_ME: 'Allow "Keep Me Logged In"',
	REMEMBER_ME_MAX_DAYS: 'Remember Me Duration (days)',
} as const

// =========================================================================
// HELP TEXT
// =========================================================================

export const HELP_TEXT = {
	MFA_REQUIREMENT: 'Controls who is required to enable two-factor authentication',
	MFA_REQUIRED_ROLES: 'Select which roles must enable MFA when using Role-Specific requirement',
	ALLOW_TRUSTED_DEVICES: 'Allow users to mark devices as trusted to skip MFA on subsequent logins',
	TRUSTED_DEVICE_MAX_DAYS: 'How long a device remains trusted before requiring MFA again',
	MAX_TRUSTED_DEVICES: 'Maximum number of devices a user can mark as trusted',

	IDLE_TIMEOUT: 'Time of inactivity before the session is terminated',
	MAX_SESSION_AGE: 'Maximum time a session can remain active regardless of activity',
	MAX_CONCURRENT_SESSIONS: 'Maximum active sessions per user (0 = unlimited)',

	STEP_UP_FRESHNESS: 'Time after MFA verification that counts as "fresh" for sensitive actions',
	STEP_UP_ACTIONS: 'Actions that require recent MFA verification',

	ALLOW_REMEMBER_ME: 'Allow users to stay logged in across browser sessions',
	REMEMBER_ME_MAX_DAYS: 'Maximum duration for "Keep Me Logged In" sessions',
} as const

// =========================================================================
// VALIDATION LIMITS (match backend SecurityPolicyConstants.cs)
// =========================================================================

export const VALIDATION_LIMITS = {
	// Idle timeout: 5 minutes - 480 minutes (8 hours)
	MIN_IDLE_TIMEOUT: 5,
	MAX_IDLE_TIMEOUT: 480,

	// Max session age: 1 hour - 720 hours (30 days)
	MIN_SESSION_AGE: 1,
	MAX_SESSION_AGE: 720,

	// Step-up freshness: 1 minute - 1440 minutes (24 hours)
	MIN_STEP_UP_FRESHNESS: 1,
	MAX_STEP_UP_FRESHNESS: 1440,

	// Trusted device: 1 day - 90 days
	MIN_TRUSTED_DEVICE_DAYS: 1,
	MAX_TRUSTED_DEVICE_DAYS: 90,

	// Max trusted devices: 1-20
	MIN_TRUSTED_DEVICES: 1,
	MAX_TRUSTED_DEVICES: 20,

	// Remember me: 1 day - 90 days
	MIN_REMEMBER_ME_DAYS: 1,
	MAX_REMEMBER_ME_DAYS: 90,

	// Concurrent sessions: 0-50 (0 = unlimited)
	MIN_CONCURRENT_SESSIONS: 0,
	MAX_CONCURRENT_SESSIONS: 50,
} as const

// =========================================================================
// TEMPLATE INFO
// =========================================================================

export const TEMPLATE_INFO = {
	relaxed: {
		icon: '🟢',
		description: 'Minimal security for trusted environments. MFA optional, longer sessions.',
	},
	balanced: {
		icon: '🟡',
		description: 'Recommended for most organizations. MFA required for admins, moderate timeouts.',
	},
	strict: {
		icon: '🔴',
		description: 'Maximum security for regulated industries. MFA required, short sessions, step-up for all sensitive actions.',
	},
} as const
