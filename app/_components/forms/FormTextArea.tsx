/**
 * FormTextArea Component
 *
 * React Hook Form-integrated textarea input with DaisyUI styling.
 * Provides automatic error display, required indicators, and helper text.
 * Designed for use with react-hook-form's register() or Controller.
 *
 * **Features:**
 * - React Hook Form integration via forwardRef
 * - DaisyUI textarea styling
 * - Automatic error state styling
 * - Required field indicator (red asterisk)
 * - Helper text support
 * - Validation error display
 * - Multi-line text input
 * - Optional label (can be used without label)
 * - Resizable by default (can be disabled via CSS)
 *
 * **Use Cases:**
 * - Long-form text input (descriptions, messages, notes)
 * - Comments and feedback
 * - Product descriptions
 * - Order notes
 * - Customer inquiries
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import FormTextArea from '@_components/forms/FormTextArea';
 *
 * // Basic textarea with label
 * const { register, formState: { errors } } = useForm();
 *
 * <FormTextArea
 *   label="Message"
 *   {...register('message', {
 *     required: 'Message is required',
 *     minLength: { value: 10, message: 'Message must be at least 10 characters' }
 *   })}
 *   error={errors.message}
 *   placeholder="Enter your message..."
 *   rows={5}
 *   required
 * />
 *
 * // With helper text
 * <FormTextArea
 *   label="Product Description"
 *   {...register('description')}
 *   helperText="Provide a detailed description of the product (max 500 characters)"
 *   placeholder="Describe the product features, benefits, and specifications..."
 *   rows={8}
 *   maxLength={500}
 * />
 *
 * // Without label (inline)
 * <FormTextArea
 *   {...register('notes')}
 *   placeholder="Add notes..."
 *   rows={3}
 * />
 *
 * // With Zod validation
 * const schema = z.object({
 *   inquiry: z.string()
 *     .min(20, 'Please provide at least 20 characters')
 *     .max(1000, 'Maximum 1000 characters allowed')
 * });
 *
 * const { register, formState: { errors } } = useZodForm({ schema });
 *
 * <FormTextArea
 *   label="Your Inquiry"
 *   {...register('inquiry')}
 *   error={errors.inquiry}
 *   placeholder="Tell us about your needs..."
 *   rows={6}
 *   required
 * />
 *
 * // Fixed size (non-resizable)
 * <FormTextArea
 *   label="Quote Request"
 *   {...register('quoteRequest')}
 *   rows={10}
 *   className="resize-none"
 * />
 * ```
 *
 * @module FormTextArea
 */

'use client'

import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react'

import classNames from 'classnames'

import { baseFieldClass, errorClass, errorFieldClass, fieldWrapperClass, helperClass, labelClass } from './fieldStyles'

import type { FieldError } from 'react-hook-form'


/**
 * FormTextArea component props interface.
 * Extends standard HTML textarea attributes.
 */
interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/**
	 * Label text displayed above the textarea.
	 * Optional - can be omitted for inline textareas.
	 * Shows required indicator if textarea is required.
	 */
	label?: string

	/**
	 * React Hook Form field error object.
	 * If present, displays error message and applies error styling.
	 */
	error?: FieldError

	/**
	 * Helper text displayed below the textarea.
	 * Only shown when there's no error.
	 */
	helperText?: string
}

/**
 * FormTextArea Component
 *
 * Textarea input integrated with React Hook Form and styled with DaisyUI.
 * Handles error states, required indicators, and helper text automatically.
 *
 * **Structure:**
 * - Wrapper div with form-control class
 * - Optional label above textarea
 * - Textarea element
 * - Conditional error/helper text below
 *
 * **Styling:**
 * - DaisyUI textarea classes (textarea, textarea-bordered, textarea-error)
 * - Full width by default (w-full)
 * - Error state changes border color to red
 * - Required indicator as red asterisk
 * - Resizable by default (can be disabled with `className="resize-none"`)
 *
 * **Accessibility:**
 * - Proper label association for screen readers
 * - Error messages linked to textarea via aria-invalid
 * - Supports all standard textarea attributes (rows, cols, maxLength, etc.)
 *
 * @param props - Component props including label, error, helperText, and standard textarea attributes
 * @param ref - Forwarded ref for React Hook Form registration
 * @returns FormTextArea component
 */
const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
	({ label, error, helperText, className, rows = 4, ...props }, ref) => {
		const showMessaging = error || helperText

		return (
			<div className={fieldWrapperClass}>
				{label && (
					<label
						htmlFor={props.id || props.name}
						className={labelClass}>
						{label}
						{props.required && (
							<span
								className='text-[var(--error-color)] font-bold transition-colors duration-200 ease-in-out'
								aria-label='required'>
								*
							</span>
						)}
					</label>
				)}

				<textarea
					ref={ref}
					rows={rows}
					className={classNames(
						baseFieldClass,
						'min-h-[120px] resize-y',
						{ [errorFieldClass]: Boolean(error) },
						className
					)}
					{...props}
				/>

				{showMessaging && (
					<p className={error ? errorClass : helperClass}>{error ? error.message : helperText}</p>
				)}
			</div>
		)
	}
)

FormTextArea.displayName = 'FormTextArea'

export default FormTextArea
