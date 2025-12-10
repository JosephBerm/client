/**
 * FormSelect Component
 *
 * React Hook Form-integrated select dropdown with DaisyUI styling.
 * Provides automatic error display, required indicators, and helper text.
 * Designed for use with react-hook-form's register() or Controller.
 *
 * **Features:**
 * - React Hook Form integration via forwardRef
 * - DaisyUI select styling
 * - Automatic error state styling
 * - Required field indicator (red asterisk)
 * - Helper text support
 * - Validation error display
 * - Placeholder option support
 * - Dynamic options from array
 * - Optional label (can be used without label)
 *
 * **Use Cases:**
 * - Dropdown selections (country, state, category, etc.)
 * - Status selection (order status, user role, etc.)
 * - Enum-based selections
 * - Fixed option lists
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import FormSelect from '@_components/forms/FormSelect';
 *
 * // Basic select with label
 * const { register, formState: { errors } } = useForm();
 *
 * <FormSelect
 *   label="Country"
 *   {...register('country', { required: 'Country is required' })}
 *   error={errors.country}
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'ca', label: 'Canada' },
 *     { value: 'mx', label: 'Mexico' }
 *   ]}
 *   placeholder="Select a country"
 *   required
 * />
 *
 * // With helper text
 * <FormSelect
 *   label="Order Status"
 *   {...register('status')}
 *   options={[
 *     { value: 100, label: 'Pending' },
 *     { value: 300, label: 'Placed' },
 *     { value: 500, label: 'Shipped' },
 *     { value: 600, label: 'Delivered' }
 *   ]}
 *   helperText="Select the current order status"
 * />
 *
 * // Without label (inline)
 * <FormSelect
 *   {...register('pageSize')}
 *   options={[
 *     { value: 10, label: 'Show 10' },
 *     { value: 20, label: 'Show 20' },
 *     { value: 50, label: 'Show 50' }
 *   ]}
 * />
 *
 * // With Zod validation
 * const schema = z.object({
 *   role: z.enum(['customer', 'admin'], {
 *     required_error: 'Please select a role'
 *   })
 * });
 *
 * const { register, formState: { errors } } = useZodForm({ schema });
 *
 * <FormSelect
 *   label="User Role"
 *   {...register('role')}
 *   error={errors.role}
 *   options={[
 *     { value: 'customer', label: 'Customer' },
 *     { value: 'admin', label: 'Administrator' }
 *   ]}
 *   placeholder="Select a role"
 *   required
 * />
 *
 * // Dynamic options from enum
 * const statusOptions = Object.entries(OrderStatusName).map(([value, label]) => ({
 *   value: parseInt(value),
 *   label
 * }));
 *
 * <FormSelect
 *   label="Filter by Status"
 *   {...register('filterStatus')}
 *   options={statusOptions}
 * />
 * ```
 *
 * @module FormSelect
 */

'use client'

import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react'

import classNames from 'classnames'
import { ChevronDown } from 'lucide-react'

import { baseFieldClass, errorClass, errorFieldClass, fieldWrapperClass, helperClass, labelClass } from './fieldStyles'

import type { FieldError } from 'react-hook-form'


/**
 * FormSelect component props interface.
 * Extends standard HTML select attributes.
 */
interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	/**
	 * Label text displayed above the select.
	 * Optional - can be omitted for inline selects.
	 * Shows required indicator if select is required.
	 */
	label?: string

	/**
	 * React Hook Form field error object.
	 * If present, displays error message and applies error styling.
	 */
	error?: FieldError

	/**
	 * Helper text displayed below the select.
	 * Only shown when there's no error.
	 */
	helperText?: string

	/**
	 * Array of select options.
	 * Each option has a value (string or number) and display label.
	 */
	options: Array<{ value: string | number; label: string }>

	/**
	 * Placeholder text for the default disabled option.
	 * If provided, creates a disabled first option with this text.
	 */
	placeholder?: string
}

/**
 * FormSelect Component
 *
 * Select dropdown integrated with React Hook Form and styled with DaisyUI.
 * Handles error states, required indicators, and helper text automatically.
 *
 * **Structure:**
 * - Wrapper div with form-control class
 * - Optional label above select
 * - Select element with dynamically generated options
 * - Optional placeholder as first disabled option
 * - Conditional error/helper text below
 *
 * **Styling:**
 * - DaisyUI select classes (select, select-bordered, select-error)
 * - Full width by default (w-full)
 * - Error state changes border color to red
 * - Required indicator as red asterisk
 *
 * **Accessibility:**
 * - Proper label association for screen readers
 * - Disabled placeholder option prevents accidental submission of empty value
 * - Error messages linked to select via aria-invalid
 *
 * @param props - Component props including label, options, error, helperText, and standard select attributes
 * @param ref - Forwarded ref for React Hook Form registration
 * @returns FormSelect component
 */
const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
	({ label, error, helperText, options, placeholder, className, ...props }, ref) => {
		const showMessaging = error || helperText

		return (
			<div className={fieldWrapperClass}>
				{label && (
					<label
						htmlFor={props.id ?? props.name}
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

				<div className='relative'>
					<select
						ref={ref}
						className={classNames(
							baseFieldClass,
							'appearance-none pr-12 bg-white',
							{ [errorFieldClass]: Boolean(error) },
							className
						)}
						{...props}>
						{placeholder && (
							<option
								value=''
								disabled>
								{placeholder}
							</option>
						)}
						{options.map((option) => (
							<option
								key={option.value}
								value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<ChevronDown className='pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary' />
				</div>

				{showMessaging && (
					<p className={error ? errorClass : helperClass}>{error ? error.message : helperText}</p>
				)}
			</div>
		)
	}
)

FormSelect.displayName = 'FormSelect'

export default FormSelect
