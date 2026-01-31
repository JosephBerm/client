/**
 * Force Password Change Page
 *
 * Standalone page for forced password changes (Phase 1: Account Status System).
 * Displayed when admin sets forcePasswordChange flag on user account.
 *
 * **Business Logic:**
 * - User has successfully authenticated
 * - Admin requires password change before continuing
 * - Cannot skip or navigate away (required=true)
 * - Redirects to dashboard after successful change
 *
 * **Flow:**
 * 1. User logs in with force password change status
 * 2. Login hook redirects to this page with ?required=true
 * 3. User must change password (cannot skip)
 * 4. After success, redirects to dashboard
 *
 * **UX Pattern:**
 * - Clear explanation of requirement
 * - Password strength requirements visible
 * - Cannot navigate away if required
 * - Success confirmation before redirect
 *
 * **MAANG Principle:**
 * - Security without friction
 * - Clear requirements upfront
 * - Immediate feedback on validation
 * - Success state before redirect
 *
 * @module ForcePasswordChangePage
 */

'use client'

import { useCallback, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { KeyRound } from 'lucide-react'

import { useAuthStore, useAuthRedirect } from '@_features/auth'

import { changePasswordSchema, logger } from '@_core'
import type { ChangePasswordFormData } from '@_core'

import { API, notificationService, useFormSubmit, useZodForm } from '@_shared'

import FormInput from '@_components/forms/FormInput'
import Button from '@_components/ui/Button'
import Surface from '@_components/ui/Surface'

/**
 * ForcePasswordChangePage Component
 *
 * Full-page password change form for admin-required password changes.
 * Different from profile password change - no old password required.
 *
 * **Features:**
 * - No old password required (admin override)
 * - Password strength validation
 * - Cannot skip if required=true
 * - Redirects to dashboard on success
 * - Loading states
 * - Error handling
 *
 * **Query Parameters:**
 * - required=true: User cannot skip, must change password
 *
 * @returns Force password change page
 */
export default function ForcePasswordChangePage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const isRequired = searchParams.get('required') === 'true'

	const user = useAuthStore((state) => state.user)
	const { executePostAuthRedirect } = useAuthRedirect()

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!user) {
			logger.warn('Force password change page accessed without authentication', {
				component: 'ForcePasswordChangePage',
			})
			notificationService.info('Please log in to continue')
			router.push('/') // Redirects to home, which will show login modal
		}
	}, [user, router])

	// Form with Zod validation (includes old password for security)
	const form = useZodForm(changePasswordSchema, {
		defaultValues: {
			oldPassword: '',
			newPassword: '',
			confirmNewPassword: '',
		},
	})

	/**
	 * Submit password change to backend
	 */
	const { submit, isSubmitting } = useFormSubmit(
		async (data: ChangePasswordFormData) => {
			if (!user?.id) {
				throw new Error('User not authenticated')
			}

			logger.info('Force password change submitted', {
				component: 'ForcePasswordChangePage',
				userId: user.id,
			})

			// Use the regular password change endpoint with old password verification
			// Even for admin-forced changes, we require old password for security
			return API.Accounts.changePasswordById(user.id, data.oldPassword, data.newPassword)
		},
		{
			successMessage: 'Password changed successfully! Redirecting...',
			errorMessage: 'Failed to change password. Please try again.',
			componentName: 'ForcePasswordChangePage',
			actionName: 'changePassword',
			onSuccess: () => {
				logger.info('Password change successful, redirecting', {
					component: 'ForcePasswordChangePage',
					userId: user?.id ?? undefined,
				})

				// Reset form
				form.reset()

				// Redirect using centralized AuthRedirectService
				// Priority: Intent → Return URL → Dashboard (default)
				setTimeout(() => {
					executePostAuthRedirect({
						onRedirect: (result) => {
							logger.info('Post-password-change redirect executed', {
								component: 'ForcePasswordChangePage',
								redirectType: result.type,
								url: result.url,
							})
						},
					})
				}, 1500)
			},
		},
	)

	/**
	 * Handle form submission
	 */
	const handleSubmit = useCallback(
		(data: ChangePasswordFormData): void => {
			void submit(data).catch((error) => {
				logger.error('Unhandled form submission error', {
					error,
					component: 'ForcePasswordChangePage',
					action: 'handleSubmit',
				})
			})
		},
		[submit],
	)

	/**
	 * Form onSubmit handler
	 */
	const onFormSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			const submitHandler = form.handleSubmit(handleSubmit)
			const result = submitHandler(e)
			if (result instanceof Promise) {
				void result.catch((error) => {
					logger.error('Unhandled form submission error', {
						error,
						component: 'ForcePasswordChangePage',
						action: 'onFormSubmit',
					})
				})
			}
		},
		[form, handleSubmit],
	)

	// Don't render if not authenticated
	if (!user) {
		return null
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-base-200 px-4'>
			<div className='card w-full max-w-md bg-base-100 shadow-xl'>
				<div className='card-body'>
					{/* Header with Icon */}
					<div className='text-center mb-6'>
						<div className='mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4'>
							<KeyRound
								className='w-8 h-8 text-warning'
								aria-hidden='true'
							/>
						</div>
						<h1 className='text-2xl font-bold text-base-content'>
							{isRequired ? 'Password Change Required' : 'Change Password'}
						</h1>
						{isRequired && (
							<p className='text-base-content/70 mt-2'>
								An administrator has required you to change your password for security reasons.
							</p>
						)}
					</div>

					{/* Form */}
					<form
						onSubmit={onFormSubmit}
						className='space-y-4'>
						{/* Current Password */}
						<FormInput
							label='Current Password'
							type='password'
							placeholder='Enter current password'
							{...form.register('oldPassword')}
							error={form.formState.errors.oldPassword}
							disabled={isSubmitting}
							autoComplete='current-password'
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
						/>

						{/* New Password */}
						<FormInput
							label='New Password'
							type='password'
							placeholder='Enter new password'
							{...form.register('newPassword')}
							error={form.formState.errors.newPassword}
							disabled={isSubmitting}
							autoComplete='new-password'
						/>

						{/* Confirm Password */}
						<FormInput
							label='Confirm New Password'
							type='password'
							placeholder='Confirm new password'
							{...form.register('confirmNewPassword')}
							error={form.formState.errors.confirmNewPassword}
							disabled={isSubmitting}
							autoComplete='new-password'
						/>

						{/* Password Requirements */}
						<Surface
							variant='inset'
							padding='md'>
							<p className='text-sm font-semibold mb-2'>Password Requirements:</p>
							<ul className='text-xs text-base-content/70 space-y-1'>
								<li>• At least 8 characters</li>
								<li>• One uppercase letter (A-Z)</li>
								<li>• One lowercase letter (a-z)</li>
								<li>• One number (0-9)</li>
								<li>• One special character (!@#$%^&*)</li>
							</ul>
						</Surface>

						{/* Submit Button */}
						<Button
							type='submit'
							variant='primary'
							className='w-full'
							loading={isSubmitting}
							disabled={isSubmitting}>
							{isSubmitting ? 'Changing Password...' : 'Change Password'}
						</Button>
					</form>

					{/* Cannot Skip Notice */}
					{isRequired && (
						<p className='text-xs text-center text-base-content/50 mt-4'>
							You cannot skip this step. Your password must be changed to continue.
						</p>
					)}

					{/* Optional Skip (if not required) */}
					{!isRequired && (
						<Button
							type='button'
							onClick={() => executePostAuthRedirect()}
							variant='ghost'
							size='sm'
							className='text-sm text-center text-base-content/60 hover:text-base-content mt-2 h-auto p-0'
							contentDrivenHeight>
							Skip for now
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
