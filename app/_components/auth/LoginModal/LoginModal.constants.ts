/**
 * LoginModal Constants
 *
 * Centralized constants for LoginModal components.
 * Eliminates magic strings and ensures consistency.
 *
 * Following the ProductDetail.constants.ts pattern.
 *
 * @module LoginModal/constants
 */

/* eslint-disable @typescript-eslint/naming-convention */

import type { SocialProvider } from './LoginModal.types'

// ============================================================================
// TEXT LABELS
// ============================================================================

/**
 * Modal title labels by view
 */
export const MODAL_TITLES = {
	login: 'Log in',
	signup: 'Sign up',
	mfa: 'Two-Factor Authentication',
	'mfa-recovery': 'Recovery Code',
	phone: 'Phone Login',
} as const

/**
 * Modal subtitle labels by view
 */
export const MODAL_SUBTITLES = {
	login: 'Access your account to manage orders, quotes, and more.',
	signup: 'Create an account to get started with MedSource Pro.',
	mfa: 'Enter the code from your authenticator app.',
	'mfa-recovery': 'Enter your recovery code.',
	phone: 'Sign in with your phone number.',
} as const

/**
 * Button labels
 */
export const BUTTON_LABELS = {
	CONTINUE: 'Continue',
	SIGN_IN: 'Sign In',
	SIGN_UP: 'Sign up',
	CREATE_ACCOUNT: 'Create Account',
	LOGIN: 'Login',
	VERIFY: 'Verify',
	CANCEL: 'Cancel',
	USE_RECOVERY_CODE: 'Use recovery code instead',
	USE_AUTHENTICATOR: 'Use authenticator code instead',
} as const

/**
 * Form field labels
 * Using sentence case for modern, approachable design
 */
export const FIELD_LABELS = {
	EMAIL_OR_USERNAME: 'Email or username',
	PASSWORD: 'Password',
	CONFIRM_PASSWORD: 'Confirm password',
	USERNAME: 'Username',
	EMAIL: 'Email',
	FIRST_NAME: 'First name',
	LAST_NAME: 'Last name',
	// Session labels
	REMEMBER_ME: 'Keep me signed in',
	// MFA labels
	MFA_CODE: 'Verification code',
	MFA_RECOVERY_CODE: 'Recovery code',
	MFA_REMEMBER_DEVICE: 'Remember this device for 30 days',
} as const

/**
 * Form field placeholders
 */
export const FIELD_PLACEHOLDERS = {
	EMAIL_ADDRESS: 'Email address',
	PASSWORD: 'Enter your password',
	CREATE_PASSWORD: 'Create a password',
	CONFIRM_PASSWORD: 'Confirm password',
	USERNAME: 'Choose a username',
	EMAIL: 'Enter your email',
	FIRST_NAME: 'Enter first name',
	LAST_NAME: 'Enter last name',
	// MFA placeholders
	MFA_CODE: '000000',
	MFA_RECOVERY_CODE: 'Enter recovery code',
} as const

/**
 * Accessibility labels
 */
export const ARIA_LABELS = {
	CLOSE_MODAL: 'Close modal',
	GO_BACK_LOGIN: 'Go back to login',
	CREATE_ACCOUNT: 'Create a new account',
	CONTINUE_WITH: (provider: string) => `Continue with ${provider}`,
	CANCEL: 'Cancel',
} as const

/**
 * Link text
 */
export const LINK_TEXT = {
	ALREADY_HAVE_ACCOUNT: 'Already have an account?',
	DIVIDER: 'OR',
} as const

// ============================================================================
// SOCIAL PROVIDERS
// ============================================================================

/**
 * Social provider display labels
 */
export const SOCIAL_LABELS: Record<SocialProvider, string> = {
	google: 'Google',
	apple: 'Apple',
	microsoft: 'Microsoft',
	phone: 'phone',
} as const

/**
 * Ordered list of social providers for rendering
 */
export const SOCIAL_PROVIDERS: readonly SocialProvider[] = ['google', 'apple', 'microsoft', 'phone'] as const

// ============================================================================
// ANIMATION CLASSES
// ============================================================================

/**
 * CSS classes for show/hide animations
 * Using Tailwind's transition utilities
 */
export const ANIMATION_CLASSES = {
	/** Visible state for collapsible sections */
	VISIBLE: 'max-h-[600px] opacity-100 translate-y-0',
	/** Hidden state for collapsible sections */
	HIDDEN: 'max-h-0 opacity-0 -translate-y-4',
	/** Base transition classes */
	TRANSITION: 'overflow-hidden transition-all duration-300 ease-out',
} as const

// ============================================================================
// LAYOUT CLASSES
// ============================================================================

/**
 * Shared CSS class strings for consistent styling
 * Mobile-first approach with responsive breakpoints
 *
 * Design Tokens Reference:
 * - min-h-[44px]: WCAG touch target minimum (44x44px)
 * - gap-3: Consistent icon-to-text spacing (12px)
 * - rounded-lg: Standard border radius (8px via globals.css)
 * - duration-300: Standard transition timing (matches globals.css --transition)
 */
export const LAYOUT_CLASSES = {
	/** Modal container */
	MODAL_CONTAINER: 'flex flex-col w-full max-w-sm sm:max-w-md mx-auto',
	/** Header row */
	HEADER_ROW: 'flex items-center justify-between mb-4 sm:mb-5 md:mb-6',
	/** Subtitle text */
	SUBTITLE: 'text-sm sm:text-base text-base-content/70 mb-5 sm:mb-6 md:mb-7 text-center leading-relaxed',
	/** Form spacing - standard vertical rhythm */
	FORM_SPACING: 'space-y-4 sm:space-y-5',
	/** Signup form - tighter spacing for more fields */
	SIGNUP_FORM: 'flex flex-col gap-4',
	/** Button container */
	BUTTON_CONTAINER: 'flex flex-col items-center gap-4 mt-5 sm:mt-6',
	/** Two-column grid for form fields */
	TWO_COLUMN_GRID: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
	/** Divider row */
	DIVIDER_ROW: 'flex items-center gap-2.5 sm:gap-3 md:gap-4',
	/** Icon button (circle) */
	ICON_BUTTON: 'btn-circle min-h-[44px] min-w-[44px]',
	/** Social buttons container - consistent vertical spacing */
	SOCIAL_BUTTONS: 'flex flex-col gap-3',
	/**
	 * Individual social login button
	 * - Full width for mobile-first
	 * - Proper icon-text gap alignment
	 * - Touch-friendly height (WCAG 44px minimum)
	 * - Theme-aware border using DaisyUI tokens
	 * - Subtle hover transition
	 */
	SOCIAL_BUTTON: [
		'w-full',
		'min-h-[48px]',
		'gap-3',
		'border-base-300',
		'hover:border-base-content/30',
		'hover:bg-base-200/50',
		'active:scale-[0.98]',
		'transition-all',
	].join(' '),
	/** Primary button */
	PRIMARY_BUTTON: 'min-h-[44px] w-full sm:w-auto sm:px-8 transition-all duration-300',
	/** Link button styling */
	LINK_BUTTON: 'text-base-content/70 hover:text-primary underline underline-offset-2 p-0 h-auto min-h-0',
	/** Inline link button */
	INLINE_LINK: 'text-primary hover:text-primary-focus underline underline-offset-2 p-0 h-auto min-h-0 inline',
} as const

// ============================================================================
// NOTIFICATION MESSAGES
// ============================================================================

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
	LOGIN: 'Logged in successfully!',
	SIGNUP: 'Account created successfully! Logging you in...',
	SIGNUP_MANUAL_LOGIN: 'Account created! Please log in with your credentials.',
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
	LOGIN_FAILED: 'Login failed. Please check your credentials.',
	SIGNUP_FAILED: 'Signup failed. Please try again.',
	GENERIC_ERROR: 'An error occurred. Please try again.',
	USER_DATA_LOAD_FAILED: 'Login successful but unable to load user data. Please refresh the page.',
	// MFA error messages (generic for security)
	MFA_INVALID_CODE: 'Invalid code. Please try again.',
	MFA_SESSION_EXPIRED: 'Session expired. Please try logging in again.',
	MFA_TOO_MANY_ATTEMPTS: 'Too many attempts. Please try again later.',
} as const

/**
 * Info messages
 */
export const INFO_MESSAGES = {
	SOCIAL_COMING_SOON: (provider: string) =>
		`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`,
} as const

// ============================================================================
// COMPONENT NAME (for logging)
// ============================================================================

/**
 * Component name for structured logging
 */
export const COMPONENT_NAME = 'LoginModal' as const
