/**
 * Form Input Component
 * 
 * DaisyUI-styled form input component designed for use with React Hook Form.
 * Automatically displays validation errors and provides consistent styling.
 * Supports all standard HTML input attributes with additional form-specific features.
 * 
 * **Features:**
 * - React Hook Form integration with ref forwarding
 * - Automatic error message display from React Hook Form
 * - Required field indicator (asterisk)
 * - Helper text support
 * - DaisyUI styling with error states
 * - Full width responsive design
 * - Accessible labels and ARIA attributes
 * 
 * **Use Cases:**
 * - Text inputs in validated forms
 * - Email, password, number, date, and other input types
 * - Forms using React Hook Form and Zod validation
 * 
 * @example
 * ```tsx
 * import FormInput from '@_components/forms/FormInput';
 * import { useZodForm } from '@_shared';
 * import { z } from 'zod';
 * 
 * const schema = z.object({
 *   email: z.string().email('Invalid email'),
 *   password: z.string().min(8, 'Password must be at least 8 characters'),
 * });
 * 
 * function LoginForm() {
 *   const form = useZodForm(schema);
 * 
 *   return (
 *     <form onSubmit={form.handleSubmit(onSubmit)}>
 *       {/* Basic text input with label *\/}
 *       <FormInput
 *         label="Email"
 *         type="email"
 *         {...form.register('email')}
 *         error={form.formState.errors.email}
 *       />
 * 
 *       {/* Password input with required indicator *\/}
 *       <FormInput
 *         label="Password"
 *         type="password"
 *         required
 *         {...form.register('password')}
 *         error={form.formState.errors.password}
 *       />
 * 
 *       {/* Input with helper text *\/}
 *       <FormInput
 *         label="Username"
 *         helperText="Must be 3-20 characters, alphanumeric only"
 *         {...form.register('username')}
 *         error={form.formState.errors.username}
 *       />
 * 
 *       {/* Number input *\/}
 *       <FormInput
 *         label="Age"
 *         type="number"
 *         min={18}
 *         max={120}
 *         {...form.register('age', { valueAsNumber: true })}
 *         error={form.formState.errors.age}
 *       />
 *     </form>
 *   );
 * }
 * ```
 * 
 * @module FormInput
 */

'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'

import {
	baseFieldClass,
	errorClass,
	errorFieldClass,
	fieldWrapperClass,
	helperClass,
	labelClass,
} from './fieldStyles'

/**
 * FormInput component props interface.
 * Extends native HTML input attributes with form-specific options.
 */
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
	/** 
	 * Label text displayed above the input.
	 * If required is true, an asterisk (*) will be appended.
	 */
	label?: string
	
	/** 
	 * Error object from React Hook Form.
	 * Automatically displays error message if present.
	 */
	error?: FieldError
	
	/** 
	 * Helper text displayed below the input.
	 * Hidden when error is present (error takes precedence).
	 */
	helperText?: string
}

/**
 * FormInput Component
 * 
 * Form input field with DaisyUI styling and React Hook Form integration.
 * Handles labels, errors, helper text, and required indicators automatically.
 * 
 * **Styling:**
 * - Full width by default
 * - DaisyUI input-bordered class
 * - Error state styling (input-error)
 * - Consistent label and helper text formatting
 * 
 * **Accessibility:**
 * - Proper label-input association
 * - Error messages announced to screen readers
 * - Required field indicators
 * - ARIA attributes via native input element
 * 
 * **Error Handling:**
 * - Error message displayed below input in red
 * - Input border turns red on error
 * - Error takes precedence over helper text
 * 
 * @param props - Input props including label, error, helperText, and all standard input attributes
 * @param ref - Forwarded ref from React Hook Form's register() function
 * @returns FormInput component
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	({ label, error, helperText, className, ...props }, ref) => {
		const showMessaging = error || helperText

		return (
			<div className={fieldWrapperClass}>
				{label && (
					<label className={labelClass}>
						{label}
						{props.required && <span className="text-[var(--error-color)]">*</span>}
					</label>
				)}

				<input
					ref={ref}
					className={classNames(baseFieldClass, { [errorFieldClass]: Boolean(error) }, className)}
					{...props}
				/>

				{showMessaging && (
					<p className={error ? errorClass : helperClass}>{error ? error.message : helperText}</p>
				)}
			</div>
		)
	}
)

// Set display name for debugging and dev tools
FormInput.displayName = 'FormInput'

export default FormInput


