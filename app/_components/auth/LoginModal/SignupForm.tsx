/**
 * SignupForm Component
 * 
 * User registration form with all required fields.
 * Collects username, email, password, and name information.
 * 
 * **Features:**
 * - Two-column responsive layout
 * - Form validation via react-hook-form
 * - Password confirmation
 * - Accessible with proper labels
 * 
 * @module LoginModal/SignupForm
 */

'use client'

import FormInput from '@_components/forms/FormInput'
import Button from '@_components/ui/Button'

import {
	BUTTON_LABELS,
	FIELD_LABELS,
	FIELD_PLACEHOLDERS,
	LINK_TEXT,
	LAYOUT_CLASSES,
} from './LoginModal.constants'

import type { SignupFormProps } from './LoginModal.types'

/**
 * SignupForm Component
 * 
 * Renders the signup form with all registration fields.
 * Uses responsive two-column grid for larger screens.
 * 
 * @param props - Component props
 * @returns Signup form section
 */
export default function SignupForm({
	form,
	isLoading,
	onSubmit,
	onSwitchToLogin,
}: SignupFormProps) {
	return (
		<form onSubmit={onSubmit} className={LAYOUT_CLASSES.SIGNUP_FORM}>
			{/* Name fields - side by side for natural grouping */}
			<div className={LAYOUT_CLASSES.TWO_COLUMN_GRID}>
				<FormInput
					label={FIELD_LABELS.FIRST_NAME}
					type='text'
					placeholder={FIELD_PLACEHOLDERS.FIRST_NAME}
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					{...form.register('name.first')}
					error={form.formState.errors.name?.first}
				/>
				<FormInput
					label={FIELD_LABELS.LAST_NAME}
					type='text'
					placeholder={FIELD_PLACEHOLDERS.LAST_NAME}
					{...form.register('name.last')}
					error={form.formState.errors.name?.last}
				/>
			</div>

			{/* Account credentials - stacked for clarity */}
			<FormInput
				label={FIELD_LABELS.EMAIL}
				type='email'
				placeholder={FIELD_PLACEHOLDERS.EMAIL}
				{...form.register('email')}
				error={form.formState.errors.email}
			/>

			<FormInput
				label={FIELD_LABELS.USERNAME}
				type='text'
				placeholder={FIELD_PLACEHOLDERS.USERNAME}
				{...form.register('username')}
				error={form.formState.errors.username}
			/>

			{/* Password fields - stacked to avoid awkward label wrapping */}
			<FormInput
				label={FIELD_LABELS.PASSWORD}
				type='password'
				placeholder={FIELD_PLACEHOLDERS.CREATE_PASSWORD}
				{...form.register('password')}
				error={form.formState.errors.password}
			/>

			<FormInput
				label={FIELD_LABELS.CONFIRM_PASSWORD}
				type='password'
				placeholder={FIELD_PLACEHOLDERS.CONFIRM_PASSWORD}
				{...form.register('confirmPassword')}
				error={form.formState.errors.confirmPassword}
			/>

			{/* Action Buttons */}
			<div className={LAYOUT_CLASSES.BUTTON_CONTAINER}>
				<Button
					type='submit'
					variant='primary'
					size='md'
					loading={isLoading}
					disabled={isLoading}
					className={LAYOUT_CLASSES.PRIMARY_BUTTON}
				>
					{BUTTON_LABELS.CREATE_ACCOUNT}
				</Button>

				<p className='text-sm text-base-content/60'>
					{LINK_TEXT.ALREADY_HAVE_ACCOUNT}{' '}
					<Button
						type='button'
						variant='ghost'
						size='sm'
						onClick={onSwitchToLogin}
						className={LAYOUT_CLASSES.INLINE_LINK}
					>
						{BUTTON_LABELS.LOGIN}
					</Button>
				</p>
			</div>
		</form>
	)
}

