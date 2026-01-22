/**
 * LoginModal Types
 *
 * Type definitions for the LoginModal component family.
 * Following FAANG-level type safety and separation of concerns.
 *
 * @module LoginModal/types
 */

import type { LoginFormData, SignupFormData } from '@_core'

import type { UseFormReturn } from 'react-hook-form'

// ============================================================================
// MODAL TYPES
// ============================================================================

/**
 * Modal view state type.
 * Controls which form is displayed in the modal.
 */
export type AuthModalView = 'login' | 'signup' | 'mfa' | 'mfa-recovery' | 'phone'

/**
 * Social login provider type.
 * Supported OAuth providers for social authentication.
 */
export type SocialProvider = 'google' | 'apple' | 'microsoft' | 'phone'

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * LoginModal component props interface.
 */
export interface LoginModalProps {
	/** Whether the modal is currently open */
	isOpen: boolean

	/** Callback function called when modal should close */
	onClose: () => void

	/** Optional callback when login is successful */
	onLoginSuccess?: () => void
}

/**
 * AuthModalHeader component props.
 */
export interface AuthModalHeaderProps {
	/** Current view state */
	currentView: AuthModalView
	/** Handler to switch to login view */
	onSwitchToLogin: () => void
	/** Handler to close modal */
	onClose: () => void
}

/**
 * SocialLoginButtons component props.
 */
export interface SocialLoginButtonsProps {
	/** Whether to hide the buttons (during email form entry) */
	isHidden: boolean
	/** Handler for social login provider click */
	onSocialLogin: (provider: SocialProvider) => void
}

/**
 * LoginForm component props.
 */
export interface LoginFormProps {
	/** React Hook Form instance */
	form: UseFormReturn<LoginFormData>
	/** Whether form submission is in progress */
	isLoading: boolean
	/** Whether to show the password field */
	showPasswordField: boolean
	/** Form submission handler */
	onSubmit: (e: React.FormEvent) => void
	/** Handler to switch to signup view */
	onSwitchToSignup: () => void
}

/**
 * SignupForm component props.
 */
export interface SignupFormProps {
	/** React Hook Form instance */
	form: UseFormReturn<SignupFormData>
	/** Whether form submission is in progress */
	isLoading: boolean
	/** Form submission handler */
	onSubmit: (e: React.FormEvent) => void
	/** Handler to switch to login view */
	onSwitchToLogin: () => void
}

/**
 * MfaChallengeForm component props.
 */
export interface MfaChallengeFormProps {
	/** MFA challenge ID from backend */
	challengeId: string
	/** When the challenge expires */
	expiresAt: Date
	/** Handler for code verification */
	onVerify: (code: string, rememberDevice: boolean, isRecoveryCode: boolean) => Promise<void>
	/** Handler to cancel and go back */
	onCancel: () => void
	/** Whether form submission is in progress */
	isLoading: boolean
	/** Error message to display */
	error?: string | null
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useAuthModal hook.
 * Contains all state and handlers for the auth modal.
 *
 * **Phase 1 Enhancement**: Includes account status modal states
 */
export interface UseAuthModalReturn {
	/** Current view (login or signup) */
	currentView: AuthModalView
	/** Whether form submission is in progress */
	isLoading: boolean
	/** Whether to show password field in login form */
	showEmailForm: boolean
	/** Login form instance */
	loginForm: UseFormReturn<LoginFormData>
	/** Signup form instance */
	signupForm: UseFormReturn<SignupFormData>
	/** Handler for social login */
	handleSocialLogin: (provider: SocialProvider) => void
	/** Handler for login form submission */
	handleLoginFormSubmit: (e: React.FormEvent) => void
	/** Handler for signup form submission */
	handleSignupFormSubmit: (e: React.FormEvent) => void
	/** Handler to switch to signup view */
	handleSwitchToSignup: () => void
	/** Handler to switch to login view */
	handleSwitchToLogin: () => void
	/** Handler to close modal */
	handleClose: () => void

	// Phase 1: Account status modal states
	/** Whether account locked modal is shown */
	showLockedModal: boolean
	/** Set account locked modal state */
	setShowLockedModal: (show: boolean) => void
	/** Whether account suspended modal is shown */
	showSuspendedModal: boolean
	/** Set account suspended modal state */
	setShowSuspendedModal: (show: boolean) => void
	/** Whether email verification modal is shown */
	showVerificationModal: boolean
	/** Set email verification modal state */
	setShowVerificationModal: (show: boolean) => void
	/** User's email for modal display */
	userEmail: string | null

	// MFA state (PLAN_2FA.md)
	/** MFA challenge state */
	mfaChallengeState: { challengeId: string; expiresAt: Date } | null
	/** MFA error message */
	mfaError: string | null
	/** Handler for MFA verification */
	handleMfaVerify: (code: string, rememberDevice: boolean, isRecoveryCode: boolean) => Promise<void>
	/** Handler to cancel MFA and return to login */
	handleMfaCancel: () => void

	// Phone authentication state
	/** Phone number input value */
	phoneNumber: string
	/** Set phone number */
	setPhoneNumber: (value: string) => void
	/** Verification code input value */
	phoneCode: string
	/** Set verification code */
	setPhoneCode: (value: string) => void
	/** Whether verification code has been sent */
	phoneCodeSent: boolean
	/** Seconds until code expires (null if not sent) */
	phoneExpiresIn: number | null
	/** Handler to send verification code */
	handleSendPhoneCode: () => Promise<void>
	/** Handler to verify code and login */
	handleVerifyPhoneCode: () => Promise<void>
	/** Handler to cancel phone auth and return to login */
	handlePhoneCancel: () => void
}

/**
 * PhoneAuthForm component props.
 */
export interface PhoneAuthFormProps {
	/** Phone number input value */
	phoneNumber: string
	/** Set phone number */
	setPhoneNumber: (value: string) => void
	/** Verification code input value */
	phoneCode: string
	/** Set verification code */
	setPhoneCode: (value: string) => void
	/** Whether verification code has been sent */
	phoneCodeSent: boolean
	/** Seconds until code expires (null if not sent) */
	phoneExpiresIn: number | null
	/** Whether form submission is in progress */
	isLoading: boolean
	/** Handler to send verification code */
	onSendCode: () => Promise<void>
	/** Handler to verify code and login */
	onVerifyCode: () => Promise<void>
	/** Handler to cancel and go back */
	onCancel: () => void
}
