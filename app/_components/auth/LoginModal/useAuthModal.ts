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
 * - Navigation after auth
 * 
 * @module LoginModal/useAuthModal
 */

'use client'

import { useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { login, signup, useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import type { LoginFormData, SignupFormData } from '@_core'
import { loginSchema, signupSchema, logger } from '@_core'

import { useZodForm, notificationService } from '@_shared'

import Name from '@_classes/common/Name'
import { RegisterModel } from '@_classes/User'

import {
	COMPONENT_NAME,
	SUCCESS_MESSAGES,
	ERROR_MESSAGES,
	INFO_MESSAGES,
} from './LoginModal.constants'

import type {
	AuthModalView,
	SocialProvider,
	UseAuthModalReturn,
} from './LoginModal.types'

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

	// Login form with Zod validation
	const loginForm = useZodForm(loginSchema, {
		defaultValues: {
			identifier: '',
			password: '',
			rememberMe: false,
		},
	})

	// Signup form with Zod validation
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
	 * Updates store, shows notification, and navigates.
	 */
	const handleAuthSuccess = useCallback(async (
		user: Parameters<typeof loginUser>[0] | undefined,
		token: string | undefined,
		identifier: string
	) => {
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

		onClose()
		onLoginSuccess?.()

		// Redirect to dashboard or previous page
		const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
		router.push(redirectTo ?? Routes.Dashboard.location)

		return true
	}, [loginUser, onClose, onLoginSuccess, router])

	/**
	 * Handle email/password form submission.
	 */
	const handleLoginSubmit = useCallback(async (values: LoginFormData) => {
		setIsLoading(true)

		try {
			const result = await login({
				username: values.identifier,
				password: values.password,
				rememberUser: values.rememberMe,
			})

			if (result.success) {
				await handleAuthSuccess(result.user, result.token, values.identifier)
			} else {
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
	}, [handleAuthSuccess])

	/**
	 * Handle signup form submission.
	 * Creates account then auto-logs in the user.
	 */
	const handleSignupSubmit = useCallback(async (values: SignupFormData) => {
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
					await handleAuthSuccess(loginResult.user, loginResult.token, values.username)
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
	}, [handleAuthSuccess, loginForm])

	/**
	 * Handle login form continue/submit.
	 */
	const handleLoginFormSubmit = useCallback((e: React.FormEvent) => {
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
	}, [showEmailForm, loginForm, handleLoginSubmit])

	/**
	 * Handle signup form submission.
	 */
	const handleSignupFormSubmit = useCallback((e: React.FormEvent) => {
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
	}, [signupForm, handleSignupSubmit])

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
	 * Reset and close modal.
	 */
	const handleClose = useCallback(() => {
		setShowEmailForm(false)
		setCurrentView('login')
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
	}
}

