/**
 * LoginModal Types
 * 
 * Type definitions for the LoginModal component family.
 * Following FAANG-level type safety and separation of concerns.
 * 
 * @module LoginModal/types
 */

import type { UseFormReturn } from 'react-hook-form'

import type { LoginFormData, SignupFormData } from '@_core'

// ============================================================================
// MODAL TYPES
// ============================================================================

/**
 * Modal view state type.
 * Controls which form is displayed in the modal.
 */
export type AuthModalView = 'login' | 'signup'

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

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useAuthModal hook.
 * Contains all state and handlers for the auth modal.
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
}

