/**
 * useAuthModal Hook
 *
 * Custom hook that encapsulates all authentication modal logic.
 * Follows FAANG-level separation of concerns - UI components remain pure presentational.
 *
 * **Responsibilities:**
 * - Form state management (login & signup)
 * - Authentication API calls
 * - View switching (login ↔ signup)
 * - Success/error handling
 * - Navigation after auth (via centralized AuthRedirectService)
 *
 * **Post-Auth Redirect Logic (MAANG-Level):**
 * - Default: Always redirects to Dashboard
 * - Intent: If user clicked auth-required action (e.g., "Chat Now"), redirects to that context
 * - Return URL: If user was on protected page, redirects back there
 * - Uses AuthRedirectService for centralized, scalable redirect management
 *
 * @module LoginModal/useAuthModal
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { login, signup, verifyMfa, useAuthStore, useAuthRedirect } from '@_features/auth'
import { Routes } from '@_features/navigation'

import type { LoginFormData, SignupFormData } from '@_core'
import { loginSchema, signupSchema, logger } from '@_core'

import { useZodForm, notificationService } from '@_shared'

import Name from '@_classes/common/Name'
import { RegisterModel } from '@_classes/User'

import { COMPONENT_NAME, SUCCESS_MESSAGES, ERROR_MESSAGES, INFO_MESSAGES } from './LoginModal.constants'

import type { AuthModalView, SocialProvider, UseAuthModalReturn } from './LoginModal.types'

/**
 * Account status error messages from backend (Phase 1)
 * These match the backend AccountController error messages
 */
const ACCOUNT_STATUS_ERRORS = {
	LOCKED: 'account_locked',
	SUSPENDED: 'account_suspended',
	VERIFICATION_REQUIRED: 'email_verification_required',
	FORCE_PASSWORD_CHANGE: 'force_password_change',
} as const

/**
 * Props for useAuthModal hook
 */
interface UseAuthModalProps {
	/** Callback when modal should close */
	onClose: () => void
	/** Optional callback when login is successful */
	onLoginSuccess?: () => void
}

/**
 * Custom hook for authentication modal logic.
 *
 * Extracts all business logic from LoginModal component for:
 * - Better testability
 * - Cleaner separation of concerns
 * - Reusable auth flows
 *
 * **Post-Auth Redirect (MAANG-Level):**
 * - Uses centralized AuthRedirectService for all redirect logic
 * - Priority: Intent → Return URL → Dashboard (default)
 * - Intents: Captured actions like "Chat Now" that triggered login
 *
 * @param props - Hook configuration
 * @returns State and handlers for auth modal
 *
 * @example
 * ```tsx
 * const {
 *   currentView,
 *   isLoading,
 *   loginForm,
 *   handleLoginFormSubmit,
 *   handleSwitchToSignup,
 * } = useAuthModal({ onClose, onLoginSuccess });
 * ```
 */
export function useAuthModal({ onClose, onLoginSuccess }: UseAuthModalProps): UseAuthModalReturn {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [showEmailForm, setShowEmailForm] = useState(false)
	const [currentView, setCurrentView] = useState<AuthModalView>('login')
	const loginUser = useAuthStore((state) => state.login)

	// Phase 1: Account status modals (MAANG-level security UX)
	const [showLockedModal, setShowLockedModal] = useState(false)
	const [showSuspendedModal, setShowSuspendedModal] = useState(false)
	const [showVerificationModal, setShowVerificationModal] = useState(false)
	const [userEmail, setUserEmail] = useState<string | null>(null)

	// MFA state (PLAN_2FA.md)
	const [mfaChallengeState, setMfaChallengeState] = useState<{
		challengeId: string
		expiresAt: Date
	} | null>(null)
	const [mfaError, setMfaError] = useState<string | null>(null)

	// Centralized redirect management (MAANG-level pattern)
	const { executePostAuthRedirect } = useAuthRedirect()

	// Login form with Zod validation
	// Mode 'onBlur' validates fields when user leaves them for better UX
	const loginForm = useZodForm(loginSchema, {
		defaultValues: {
			identifier: '',
			password: '',
			rememberMe: false,
		},
		mode: 'onBlur',
	})

	// Signup form with Zod validation
	// Mode 'onBlur' validates fields when user leaves them for immediate feedback
	// This aligns with MAANG-level UX patterns for form validation
	const signupForm = useZodForm(signupSchema, {
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			name: {
				first: '',
				last: '',
			},
			acceptTerms: true,
		},
		mode: 'onBlur',
	})

	/**
	 * Handle social login button click.
	 * Placeholder for future OAuth integration.
	 */
	const handleSocialLogin = useCallback((provider: SocialProvider) => {
		logger.info('Social login attempted', { provider, component: COMPONENT_NAME })

		// TODO: Implement OAuth flow for each provider
		notificationService.info(INFO_MESSAGES.SOCIAL_COMING_SOON(provider), {
			component: COMPONENT_NAME,
			action: 'socialLogin',
			metadata: { provider },
		})
	}, [])

	/**
	 * Process successful authentication.
	 * Updates store, shows notification, and navigates using centralized redirect service.
	 *
	 * **Post-Auth Redirect Logic (MAANG-Level):**
	 * 1. Intent (highest priority): If user clicked "Chat Now" or similar, redirects to that context
	 * 2. Return URL: If user was trying to access a protected page, redirects there
	 * 3. Default: Redirects to Dashboard
	 *
	 * This ensures 100% of the time user goes to Dashboard UNLESS they triggered login
	 * from a specific action like "Chat Now".
	 */
	const handleAuthSuccess = useCallback(
		async (user: Parameters<typeof loginUser>[0] | undefined, token: string | undefined, identifier: string) => {
			if (user) {
				loginUser(user)
				logger.info('User logged in successfully', {
					userId: user.id ?? undefined,
					username: user.username,
					component: COMPONENT_NAME,
				})
			} else if (token) {
				// Fetch user data if not returned with login
				const { checkAuthStatus } = await import('@_features/auth')
				const fetchedUser = await checkAuthStatus()

				if (fetchedUser) {
					loginUser(fetchedUser)
					logger.info('User logged in successfully', {
						userId: fetchedUser.id ?? undefined,
						username: fetchedUser.username,
						component: COMPONENT_NAME,
					})
				} else {
					notificationService.warning(ERROR_MESSAGES.USER_DATA_LOAD_FAILED, {
						metadata: { identifier },
						component: COMPONENT_NAME,
						action: 'loadUser',
					})
					return false
				}
			}

			notificationService.success(SUCCESS_MESSAGES.LOGIN, {
				component: COMPONENT_NAME,
				action: 'login',
			})

			// Close modal first
			onClose()
			onLoginSuccess?.()

			// Execute post-auth redirect using centralized service
			// This handles: Intent → Return URL → Dashboard (default)
			const redirect = executePostAuthRedirect({
				onRedirect: (result) => {
					logger.info('Post-auth redirect executed', {
						component: COMPONENT_NAME,
						redirectType: result.type,
						url: result.url,
						intent: result.intent?.type,
					})
				},
			})

			logger.debug('Auth success completed', {
				component: COMPONENT_NAME,
				redirectUrl: redirect.url,
				redirectType: redirect.type,
			})

			return true
		},
		[loginUser, onClose, onLoginSuccess, executePostAuthRedirect]
	)

	/**
	 * Handle email/password form submission.
	 *
	 * **Phase 1 Enhancement**: Status-aware error handling
	 * - Detects account status errors from backend
	 * - Shows appropriate modal for each status
	 * - Provides clear resolution paths
	 */
	const handleLoginSubmit = useCallback(
		async (values: LoginFormData) => {
			setIsLoading(true)
			setUserEmail(values.identifier) // Store for modals

			try {
				const result = await login({
					username: values.identifier,
					password: values.password,
					rememberUser: values.rememberMe,
				})

				// Check if MFA is required (PLAN_2FA.md)
				if (result.mfaRequired && result.mfaChallengeId && result.mfaExpiresAt) {
					logger.info('MFA required for login', {
						identifier: values.identifier,
						challengeId: result.mfaChallengeId,
						component: COMPONENT_NAME,
					})
					setMfaChallengeState({
						challengeId: result.mfaChallengeId,
						expiresAt: new Date(result.mfaExpiresAt),
					})
					setMfaError(null)
					setCurrentView('mfa')
					setIsLoading(false)
					return
				}

				if (result.success) {
					await handleAuthSuccess(result.user, result.accessToken, values.identifier)
				} else {
					// Phase 1: Check for account status errors
					const errorMessage = result.message?.toLowerCase() ?? ''

					// Account locked (5 failed attempts)
					if (errorMessage.includes(ACCOUNT_STATUS_ERRORS.LOCKED)) {
						logger.warn('Login blocked: Account locked', {
							identifier: values.identifier,
							component: COMPONENT_NAME,
						})
						onClose() // Close login modal
						setShowLockedModal(true) // Show lockout modal
						return
					}

					// Account suspended by admin
					if (errorMessage.includes(ACCOUNT_STATUS_ERRORS.SUSPENDED)) {
						logger.warn('Login blocked: Account suspended', {
							identifier: values.identifier,
							component: COMPONENT_NAME,
						})
						onClose() // Close login modal
						setShowSuspendedModal(true) // Show suspension modal
						return
					}

					// Email verification required
					if (errorMessage.includes(ACCOUNT_STATUS_ERRORS.VERIFICATION_REQUIRED)) {
						logger.warn('Login blocked: Email verification required', {
							identifier: values.identifier,
							component: COMPONENT_NAME,
						})
						onClose() // Close login modal
						setShowVerificationModal(true) // Show verification modal
						return
					}

					// Force password change required
					if (errorMessage.includes(ACCOUNT_STATUS_ERRORS.FORCE_PASSWORD_CHANGE)) {
						logger.info('Login requires password change', {
							identifier: values.identifier,
							component: COMPONENT_NAME,
						})
						onClose() // Close login modal
						router.push(Routes.Auth.forcePasswordChange({ required: 'true' }))
						notificationService.warning('You must change your password before continuing', {
							component: COMPONENT_NAME,
							action: 'forcePasswordChange',
						})
						return
					}

					// Standard login failure (invalid credentials)
					notificationService.error(result.message ?? ERROR_MESSAGES.LOGIN_FAILED, {
						metadata: { identifier: values.identifier, message: result.message },
						component: COMPONENT_NAME,
						action: 'login',
					})
				}
			} catch (error) {
				notificationService.error(ERROR_MESSAGES.GENERIC_ERROR, {
					metadata: { error },
					component: COMPONENT_NAME,
					action: 'login',
				})
			} finally {
				setIsLoading(false)
			}
		},
		[handleAuthSuccess, onClose, router]
	)

	/**
	 * Handle signup form submission.
	 * Creates account then auto-logs in the user.
	 */
	const handleSignupSubmit = useCallback(
		async (values: SignupFormData) => {
			setIsLoading(true)

			try {
				const registerModel = new RegisterModel({
					username: values.username,
					email: values.email,
					password: values.password,
					confirmPassword: values.confirmPassword, // Backend requires this field
					name: new Name({
						first: values.name.first,
						last: values.name.last,
					}),
				})

				logger.info('Signup attempted', {
					username: values.username,
					email: values.email,
					component: COMPONENT_NAME,
				})

				const result = await signup(registerModel)

				if (result.success) {
					logger.info('Account created successfully', {
						username: values.username,
						component: COMPONENT_NAME,
					})

					notificationService.success(SUCCESS_MESSAGES.SIGNUP, {
						component: COMPONENT_NAME,
						action: 'signup',
					})

					// Auto-login after successful signup
					const loginResult = await login({
						username: values.username,
						password: values.password,
						rememberUser: true,
					})

					if (loginResult.success) {
						await handleAuthSuccess(loginResult.user, loginResult.accessToken, values.username)
					} else {
						// Account created but auto-login failed
						notificationService.info(SUCCESS_MESSAGES.SIGNUP_MANUAL_LOGIN, {
							component: COMPONENT_NAME,
							action: 'signup',
						})
						setCurrentView('login')
						loginForm.setValue('identifier', values.username)
					}
				} else {
					notificationService.error(result.message ?? ERROR_MESSAGES.SIGNUP_FAILED, {
						metadata: { username: values.username, message: result.message },
						component: COMPONENT_NAME,
						action: 'signup',
					})
				}
			} catch (error) {
				logger.error('Signup error', {
					error,
					component: COMPONENT_NAME,
					action: 'handleSignupSubmit',
				})
				notificationService.error(ERROR_MESSAGES.GENERIC_ERROR, {
					metadata: { error },
					component: COMPONENT_NAME,
					action: 'signup',
				})
			} finally {
				setIsLoading(false)
			}
		},
		[handleAuthSuccess, loginForm]
	)

	/**
	 * Handle login form continue/submit.
	 */
	const handleLoginFormSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()

			if (!showEmailForm) {
				// First step: Show password field
				const identifier = loginForm.getValues('identifier')
				if (identifier && identifier.trim().length > 0) {
					setShowEmailForm(true)
				}
			} else {
				// Second step: Submit form
				const submitResult = loginForm.handleSubmit(handleLoginSubmit)(e)
				if (submitResult instanceof Promise) {
					submitResult.catch((error) => {
						logger.error('Unhandled form submission error', {
							error,
							component: COMPONENT_NAME,
							action: 'handleLoginFormSubmit',
						})
					})
				}
			}
		},
		[showEmailForm, loginForm, handleLoginSubmit]
	)

	/**
	 * Handle signup form submission.
	 */
	const handleSignupFormSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault()
			const submitResult = signupForm.handleSubmit(handleSignupSubmit)(e)
			if (submitResult instanceof Promise) {
				submitResult.catch((error) => {
					logger.error('Unhandled signup form submission error', {
						error,
						component: COMPONENT_NAME,
						action: 'handleSignupFormSubmit',
					})
				})
			}
		},
		[signupForm, handleSignupSubmit]
	)

	/**
	 * Switch to signup view.
	 */
	const handleSwitchToSignup = useCallback(() => {
		setCurrentView('signup')
		signupForm.reset()
	}, [signupForm])

	/**
	 * Switch to login view.
	 */
	const handleSwitchToLogin = useCallback(() => {
		setCurrentView('login')
		setShowEmailForm(false)
		loginForm.reset()
	}, [loginForm])

	/**
	 * Handle MFA verification (PLAN_2FA.md)
	 */
	const handleMfaVerify = useCallback(
		async (code: string, rememberDevice: boolean, isRecoveryCode: boolean) => {
			if (!mfaChallengeState) {
				setMfaError('Session expired. Please try logging in again.')
				return
			}

			setIsLoading(true)
			setMfaError(null)

			try {
				const result = await verifyMfa(mfaChallengeState.challengeId, code, rememberDevice)

				if (result.success) {
					await handleAuthSuccess(result.user, result.accessToken, '')
					setMfaChallengeState(null)
					setMfaError(null)
				} else {
					setMfaError(result.message ?? 'Invalid code. Please try again.')
				}
			} catch (error) {
				logger.error('MFA verification error', {
					error,
					component: COMPONENT_NAME,
					action: 'handleMfaVerify',
				})
				setMfaError('An error occurred. Please try again.')
			} finally {
				setIsLoading(false)
			}
		},
		[mfaChallengeState, handleAuthSuccess]
	)

	/**
	 * Cancel MFA and return to login
	 */
	const handleMfaCancel = useCallback(() => {
		setMfaChallengeState(null)
		setMfaError(null)
		setCurrentView('login')
		setShowEmailForm(false)
		loginForm.reset()
	}, [loginForm])

	/**
	 * Reset and close modal.
	 */
	const handleClose = useCallback(() => {
		setShowEmailForm(false)
		setCurrentView('login')
		setMfaChallengeState(null)
		setMfaError(null)
		loginForm.reset()
		signupForm.reset()
		onClose()
	}, [loginForm, signupForm, onClose])

	return {
		currentView,
		isLoading,
		showEmailForm,
		loginForm,
		signupForm,
		handleSocialLogin,
		handleLoginFormSubmit,
		handleSignupFormSubmit,
		handleSwitchToSignup,
		handleSwitchToLogin,
		handleClose,
		// Phase 1: Account status modal states
		showLockedModal,
		setShowLockedModal,
		showSuspendedModal,
		setShowSuspendedModal,
		showVerificationModal,
		setShowVerificationModal,
		userEmail,
		// MFA state (PLAN_2FA.md)
		mfaChallengeState,
		mfaError,
		handleMfaVerify,
		handleMfaCancel,
	}
}
