/**
 * LoginModal Component
 *
 * ChatGPT-style login modal with social authentication options and email/password login.
 * Mobile-first responsive design following MedSource Pro design system.
 *
 * **Features:**
 * - Social login buttons (Google, Apple, Microsoft, Phone)
 * - Email/password authentication
 * - Accessible and keyboard-friendly
 * - Mobile-responsive
 * - Integrated with existing auth system
 *
 * **Accessibility:**
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - Focus management
 * - Screen reader announcements
 *
 * @module LoginModal
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'
import { useZodForm } from '@_shared'
import { loginSchema, type LoginFormData } from '@_core'
import { logger } from '@_core'
import { login, useAuthStore } from '@_features/auth'
import Modal from '@_components/ui/Modal'
import FormInput from '@_components/forms/FormInput'
import Button from '@_components/ui/Button'

/**
 * LoginModal component props interface.
 */
interface LoginModalProps {
	/** Whether the modal is currently open */
	isOpen: boolean

	/** Callback function called when modal should close */
	onClose: () => void

	/** Optional callback when login is successful */
	onLoginSuccess?: () => void
}

/**
 * Social login provider type.
 */
type SocialProvider = 'google' | 'apple' | 'microsoft' | 'phone'

/**
 * LoginModal Component
 *
 * Modern login modal with social authentication and email/password options.
 * Follows ChatGPT-style design patterns while maintaining MedSource Pro branding.
 *
 * @param props - Component props
 * @returns LoginModal component
 */
export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [showEmailForm, setShowEmailForm] = useState(false)
	const loginUser = useAuthStore((state) => state.login)

	const form = useZodForm(loginSchema, {
		defaultValues: {
			identifier: '',
			password: '',
			rememberMe: false,
		},
	})

	/**
	 * Handle social login button click.
	 * Placeholder for future OAuth integration.
	 */
	const handleSocialLogin = async (provider: SocialProvider) => {
		logger.info('Social login attempted', { provider, component: 'LoginModal' })

		// TODO: Implement OAuth flow for each provider
		toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`)
	}

	/**
	 * Handle email/password form submission.
	 */
	const handleSubmit = async (values: LoginFormData) => {
		setIsLoading(true)

		try {
			const result = await login({
				username: values.identifier, // Backend expects username field
				password: values.password,
				rememberUser: values.rememberMe,
			})

			if (result.success && result.user) {
				// Update auth store
				loginUser(result.user)

				logger.info('User logged in successfully', {
					userId: result.user.id ?? undefined,
					username: result.user.username,
					component: 'LoginModal',
				})

				toast.success('Logged in successfully!')

				// Close modal
				onClose()

				// Call success callback if provided
				if (onLoginSuccess) {
					onLoginSuccess()
				}

				// Redirect to dashboard or previous page
				const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
				router.push(redirectTo ?? '/medsource-app')
			} else {
				logger.warn('Login failed', {
					identifier: values.identifier,
					message: result.message,
					component: 'LoginModal',
				})
				toast.error(result.message || 'Login failed. Please check your credentials.')
			}
		} catch (error) {
			logger.error('Login modal submission failed', {
				error,
				component: 'LoginModal',
			})
			toast.error('An error occurred during login. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Handle email input continue button.
	 * Shows password field when identifier is entered.
	 */
	const handleEmailContinue = () => {
		const identifier = form.getValues('identifier')
		if (identifier && identifier.trim().length > 0) {
			setShowEmailForm(true)
		}
	}

	/**
	 * Reset form when modal closes.
	 */
	const handleClose = () => {
		setShowEmailForm(false)
		form.reset()
		onClose()
	}

	// DRY: Shared social login button classes
	// Mobile-first: Base styles for mobile, enhanced for larger screens
	// Touch-friendly: min-height 44px (py-3 = 12px top + 12px bottom + content)
	const socialButtonClasses =
		'w-full flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 min-h-[44px] rounded-lg border border-base-300 bg-base-100 hover:bg-base-200 active:bg-base-300 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size='sm'
			closeOnOverlayClick={true}
			closeOnEscape={true}>
			{/* Modal content container - mobile-first responsive */}
			<div className='flex flex-col w-full max-w-sm sm:max-w-md mx-auto'>
				{/* Header with close button */}
				<div className='flex items-center justify-between mb-3 sm:mb-4 md:mb-6'>
					<h2 className='text-lg sm:text-xl md:text-2xl font-semibold text-base-content'>
						Log in
					</h2>
					<button
						onClick={handleClose}
						className='btn btn-ghost btn-sm btn-circle min-h-[44px] min-w-[44px] focus:outline-2 focus:outline-offset-2 focus:outline-primary'
						aria-label='Close modal'>
						<X
							size={20}
							aria-hidden='true'
						/>
					</button>
				</div>

				{/* Subtitle - centered, mobile-first typography */}
				<p className='text-xs sm:text-sm md:text-base text-base-content/70 mb-3 sm:mb-4 md:mb-6 text-center leading-relaxed'>
					Access your account to manage orders, quotes, and more.
				</p>

				{/* Social Login Buttons - mobile-first spacing */}
				{!showEmailForm && (
					<div className='space-y-2 sm:space-y-3 mb-3 sm:mb-4 md:mb-6'>
						{/* Google */}
						<button
							type='button'
							onClick={() => handleSocialLogin('google')}
							className={socialButtonClasses}
							aria-label='Continue with Google'>
							<svg
								className='w-5 h-5 shrink-0'
								viewBox='0 0 24 24'
								aria-hidden='true'
								focusable='false'>
								<path
									fill='#4285F4'
									d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
								/>
								<path
									fill='#34A853'
									d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
								/>
								<path
									fill='#FBBC05'
									d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
								/>
								<path
									fill='#EA4335'
									d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
								/>
							</svg>
							<span className='text-sm sm:text-base font-medium text-base-content'>
								Continue with Google
							</span>
						</button>

						{/* Apple */}
						<button
							type='button'
							onClick={() => handleSocialLogin('apple')}
							className={socialButtonClasses}
							aria-label='Continue with Apple'>
							<svg
								className='w-5 h-5 shrink-0'
								viewBox='0 0 24 24'
								fill='currentColor'
								aria-hidden='true'
								focusable='false'>
								<path d='M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 4.96 6.62 9.38 6.4c1.35-.07 2.34.93 3.08.93.74 0 2.03-.93 3.43-.84.58.03 2.17.23 3.2 1.79-2.59 1.5-2.21 4.78-1.05 6.13-2.98 1.74-3.85 4.09-3.99 5.87zm-3.03-17.5c-.27-.32-.71-.53-1.15-.53-.55 0-1.07.33-1.41.75-.27.32-.51.85-.45 1.34.6.04 1.2-.24 1.46-.56.28-.33.51-.86.55-1.1z' />
							</svg>
							<span className='text-sm sm:text-base font-medium text-base-content'>
								Continue with Apple
							</span>
						</button>

						{/* Microsoft */}
						<button
							type='button'
							onClick={() => handleSocialLogin('microsoft')}
							className={socialButtonClasses}
							aria-label='Continue with Microsoft'>
							<svg
								className='w-5 h-5 shrink-0'
								viewBox='0 0 24 24'
								aria-hidden='true'
								focusable='false'>
								<path
									fill='#F25022'
									d='M1 1h10v10H1z'
								/>
								<path
									fill='#00A4EF'
									d='M13 1h10v10H13z'
								/>
								<path
									fill='#7FBA00'
									d='M1 13h10v10H1z'
								/>
								<path
									fill='#FFB900'
									d='M13 13h10v10H13z'
								/>
							</svg>
							<span className='text-sm sm:text-base font-medium text-base-content'>
								Continue with Microsoft
							</span>
						</button>

						{/* Phone */}
						<button
							type='button'
							onClick={() => handleSocialLogin('phone')}
							className={socialButtonClasses}
							aria-label='Continue with phone'>
							<svg
								className='w-5 h-5 shrink-0'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								aria-hidden='true'
								focusable='false'>
								<path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
							</svg>
							<span className='text-sm sm:text-base font-medium text-base-content'>
								Continue with phone
							</span>
						</button>
					</div>
				)}

				{/* Divider - centered, mobile-first spacing */}
				{!showEmailForm && (
					<div className='flex items-center gap-2 sm:gap-3 md:gap-4 my-3 sm:my-4 md:my-6'>
						<div className='flex-1 h-px bg-base-300' />
						<span className='text-xs sm:text-sm text-base-content/60 uppercase font-medium'>OR</span>
						<div className='flex-1 h-px bg-base-300' />
					</div>
				)}

				{/* Email/Password Form - mobile-first spacing */}
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className='space-y-3 sm:space-y-4'>
					{/* Email/Username Input */}
					<FormInput
						label={showEmailForm ? 'Email or Username' : undefined}
						type='text'
						placeholder='Email address'
						autoFocus={!showEmailForm}
						{...form.register('identifier')}
						error={form.formState.errors.identifier}
					/>

					{/* Password Input (shown after email or when form is submitted) */}
					{showEmailForm && (
						<FormInput
							label='Password'
							type='password'
							placeholder='Enter your password'
							autoFocus
							{...form.register('password')}
							error={form.formState.errors.password}
						/>
					)}

					{/* Continue/Submit Button - centered, touch-friendly */}
					<div className='flex justify-center mt-3 sm:mt-4'>
						<Button
							type={showEmailForm ? 'submit' : 'button'}
							variant='primary'
							size='md'
							loading={isLoading}
							disabled={isLoading || (showEmailForm && !form.formState.isValid)}
							onClick={!showEmailForm ? handleEmailContinue : undefined}
							className='min-h-[44px] w-full'>
							{showEmailForm ? 'Sign In' : 'Continue'}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	)
}
