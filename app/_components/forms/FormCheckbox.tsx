/**
 * FormCheckbox Component
 *
 * React Hook Form-integrated checkbox input with DaisyUI styling.
 * Provides automatic error display, required indicators, and helper text.
 * Designed for use with react-hook-form's register() or Controller.
 *
 * **Features:**
 * - React Hook Form integration via forwardRef
 * - DaisyUI checkbox styling
 * - Automatic error state styling
 * - Required field indicator (red asterisk)
 * - Helper text support
 * - Validation error display
 * - Accessible label association
 * - Cursor pointer on label for better UX
 *
 * **Use Cases:**
 * - Boolean form fields (agree to terms, enable feature, etc.)
 * - Multiple selection options
 * - Form toggles and switches
 * - Preference settings
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import FormCheckbox from '@_components/forms/FormCheckbox';
 *
 * // With react-hook-form
 * const { register, formState: { errors } } = useForm();
 *
 * <FormCheckbox
 *   label="I agree to the terms and conditions"
 *   {...register('agreeToTerms', {
 *     required: 'You must agree to the terms'
 *   })}
 *   error={errors.agreeToTerms}
 *   required
 * />
 *
 * // With helper text
 * <FormCheckbox
 *   label="Send me email notifications"
 *   {...register('emailNotifications')}
 *   helperText="You can unsubscribe at any time"
 * />
 *
 * // Multiple checkboxes in a group
 * <div>
 *   <h3>Select your interests:</h3>
 *   <FormCheckbox
 *     label="Medical Equipment"
 *     {...register('interests.equipment')}
 *   />
 *   <FormCheckbox
 *     label="Surgical Supplies"
 *     {...register('interests.supplies')}
 *   />
 *   <FormCheckbox
 *     label="PPE Products"
 *     {...register('interests.ppe')}
 *   />
 * </div>
 *
 * // With Zod validation
 * const schema = z.object({
 *   acceptTerms: z.boolean().refine((val) => val === true, {
 *     message: 'You must accept the terms to continue'
 *   })
 * });
 *
 * const { register, formState: { errors } } = useZodForm({ schema });
 *
 * <FormCheckbox
 *   label="I accept the terms and conditions"
 *   {...register('acceptTerms')}
 *   error={errors.acceptTerms}
 *   required
 * />
 * ```
 *
 * @module FormCheckbox
 */

'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'

import { errorClass, fieldWrapperClass, helperClass } from './fieldStyles'

/**
 * FormCheckbox component props interface.
 * Extends standard HTML input attributes (excluding type, since it's always "checkbox").
 */
interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	/**
	 * Label text displayed next to the checkbox.
	 * Shows required indicator if checkbox is required.
	 */
	label: string

	/**
	 * React Hook Form field error object.
	 * If present, displays error message and applies error styling.
	 */
	error?: FieldError

	/**
	 * Helper text displayed below the checkbox.
	 * Only shown when there's no error.
	 */
	helperText?: string
}

/**
 * FormCheckbox Component
 *
 * Checkbox input integrated with React Hook Form and styled with DaisyUI.
 * Handles error states, required indicators, and helper text automatically.
 *
 * **Structure:**
 * - Wrapper div with form-control class
 * - Label containing checkbox and label text
 * - Conditional error/helper text below
 *
 * **Styling:**
 * - DaisyUI checkbox classes (checkbox, checkbox-error)
 * - Cursor pointer on label for better UX
 * - Error state changes border color to red
 * - Required indicator as red asterisk
 *
 * **Accessibility:**
 * - Proper label association for screen readers
 * - Clickable label area includes text and checkbox
 * - Error messages linked to input via aria-invalid
 *
 * @param props - Component props including label, error, helperText, and standard input attributes
 * @param ref - Forwarded ref for React Hook Form registration
 * @returns FormCheckbox component
 */
const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
	({ label, error, helperText, className, ...props }, ref) => {
		const showMessaging = error || helperText

		return (
			<div className={classNames(fieldWrapperClass, 'gap-1')}>
			<label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-base-content">
				<input
					ref={ref}
					type="checkbox"
					className={classNames(
						'checkbox checkbox-primary h-5 w-5',
						{ 'checkbox-error': error },
						className
					)}
						{...props}
					/>
					<span>
						{label}
						{props.required && <span className="ml-1 text-[var(--error-color)]">*</span>}
					</span>
				</label>

				{showMessaging && (
					<p className={error ? errorClass : helperClass}>{error ? error.message : helperText}</p>
				)}
			</div>
		)
	}
)

FormCheckbox.displayName = 'FormCheckbox'

export default FormCheckbox



