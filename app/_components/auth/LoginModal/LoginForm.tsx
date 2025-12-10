/**
 * LoginForm Component
 * 
 * Email/password login form with progressive disclosure.
 * First shows email input, then reveals password field.
 * 
 * **Features:**
 * - Two-step form (email → password)
 * - Smooth animated transitions
 * - Form validation via react-hook-form
 * - Accessible with proper labels
 * 
 * @module LoginModal/LoginForm
 */

'use client'

import FormInput from '@_components/forms/FormInput'
import Button from '@_components/ui/Button'

import {
	BUTTON_LABELS,
	FIELD_LABELS,
	FIELD_PLACEHOLDERS,
	LAYOUT_CLASSES,
	ANIMATION_CLASSES,
	ARIA_LABELS,
} from './LoginModal.constants'

import type { LoginFormProps } from './LoginModal.types'

/**
 * LoginForm Component
 * 
 * Renders the login form with email/username and password inputs.
 * Uses progressive disclosure - password field appears after email entry.
 * 
 * @param props - Component props
 * @returns Login form section
 */
export default function LoginForm({
	form,
	isLoading,
	showPasswordField,
	onSubmit,
	onSwitchToSignup,
}: LoginFormProps) {
	return (
		<form onSubmit={onSubmit} className={LAYOUT_CLASSES.FORM_SPACING}>
			{/* Email/Username Input */}
			<div className='transition-all duration-300 ease-out'>
				<FormInput
					label={showPasswordField ? FIELD_LABELS.EMAIL_OR_USERNAME : undefined}
					type='text'
					placeholder={showPasswordField ? undefined : FIELD_PLACEHOLDERS.EMAIL_ADDRESS}
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={!showPasswordField}
					{...form.register('identifier')}
					error={form.formState.errors.identifier}
				/>
			</div>

			{/* Password Input - revealed after email entry */}
			<div
				className={`${ANIMATION_CLASSES.TRANSITION} ${
					showPasswordField
						? 'max-h-40 opacity-100 translate-y-0'
						: 'max-h-0 opacity-0 -translate-y-2'
				}`}
			>
				<FormInput
					label={FIELD_LABELS.PASSWORD}
					type='password'
					placeholder={FIELD_PLACEHOLDERS.PASSWORD}
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus={showPasswordField}
					{...form.register('password')}
					error={form.formState.errors.password}
				/>
			</div>

			{/* Action Buttons */}
			<div className={LAYOUT_CLASSES.BUTTON_CONTAINER}>
				{/* Continue / Sign In Button */}
				<Button
					type='submit'
					variant='primary'
					size='md'
					loading={isLoading}
					disabled={isLoading}
					className={LAYOUT_CLASSES.PRIMARY_BUTTON}
				>
					<span className='transition-opacity duration-300'>
						{showPasswordField ? BUTTON_LABELS.SIGN_IN : BUTTON_LABELS.CONTINUE}
					</span>
				</Button>

				{/* Sign up link */}
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={onSwitchToSignup}
					className={LAYOUT_CLASSES.LINK_BUTTON}
					aria-label={ARIA_LABELS.CREATE_ACCOUNT}
				>
					{BUTTON_LABELS.SIGN_UP}
				</Button>
			</div>
		</form>
	)
}

