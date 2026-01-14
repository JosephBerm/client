/**
 * StepUpModal Constants
 *
 * Centralized constants for the step-up authentication modal.
 * Eliminates magic strings and ensures consistency.
 *
 * @module StepUpModal.constants
 */

// =========================================================================
// UI TEXT CONSTANTS
// =========================================================================

export const STEP_UP_MODAL_TEXT = {
	/** Modal title */
	TITLE: 'Verify Your Identity',

	/** Default description when no specific action message is available */
	DEFAULT_DESCRIPTION: 'Please verify your identity to continue with this action.',

	/** Label for the TOTP code input field */
	CODE_LABEL: 'Authentication Code',

	/** Placeholder text for code input */
	CODE_PLACEHOLDER: 'Enter 6-digit code',

	/** Help text below the code input */
	CODE_HELP_TEXT: 'Enter the code from your authenticator app',

	/** Verify button label */
	VERIFY_BUTTON: 'Verify',

	/** Cancel button label */
	CANCEL_BUTTON: 'Cancel',

	/** Loading button label */
	VERIFYING_BUTTON: 'Verifying...',
} as const

// =========================================================================
// ERROR MESSAGES
// =========================================================================

export const STEP_UP_ERRORS = {
	/** Code validation errors */
	CODE_REQUIRED: 'Please enter your authentication code',
	CODE_INVALID: 'Invalid code. Please try again.',
	CODE_EXPIRED: 'Code has expired. Please try again with a new code.',

	/** Server/network errors */
	VERIFICATION_FAILED: 'Verification failed. Please try again.',
	NETWORK_ERROR: 'Network error. Please check your connection.',
	TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again later.',

	/** Generic error */
	UNKNOWN_ERROR: 'An error occurred. Please try again.',
} as const

// =========================================================================
// API ENDPOINTS
// =========================================================================

export const STEP_UP_API = {
	/** Endpoint for step-up MFA verification */
	VERIFY: '/auth/mfa/step-up-verify',
} as const

// =========================================================================
// LAYOUT CLASSES (DRY with MfaChallengeForm)
// =========================================================================

export const STEP_UP_LAYOUT = {
	/** Form spacing */
	FORM_SPACING: 'space-y-6',

	/** Description text styling */
	DESCRIPTION: 'text-base-content/70 text-center',

	/** Error message styling */
	ERROR_MESSAGE: 'text-error text-sm text-center',

	/** Button container styling */
	BUTTON_CONTAINER: 'flex flex-col gap-3',

	/** Primary button width */
	PRIMARY_BUTTON: 'w-full',
} as const

// =========================================================================
// ANIMATION CONFIG
// =========================================================================

export const STEP_UP_ANIMATION = {
	/** Delay before clearing error message (ms) */
	ERROR_CLEAR_DELAY: 3000,

	/** Code input length */
	CODE_LENGTH: 6,
} as const
