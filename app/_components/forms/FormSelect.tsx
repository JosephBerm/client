'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string
	error?: FieldError
	helperText?: string
	options: Array<{ value: string | number; label: string }>
	placeholder?: string
}

/**
 * Form select component for React Hook Form
 * DaisyUI-styled with error handling
 */
const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
	({ label, error, helperText, options, placeholder, className, ...props }, ref) => {
		return (
			<div className="form-control w-full">
				{label && (
					<label className="label">
						<span className="label-text font-semibold">
							{label}
							{props.required && <span className="text-error ml-1">*</span>}
						</span>
					</label>
				)}

				<select
					ref={ref}
					className={classNames(
						'select select-bordered w-full',
						{
							'select-error': error,
						},
						className
					)}
					{...props}
				>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>

				{(error || helperText) && (
					<label className="label">
						{error && (
							<span className="label-text-alt text-error">{error.message}</span>
						)}
						{!error && helperText && (
							<span className="label-text-alt">{helperText}</span>
						)}
					</label>
				)}
			</div>
		)
	}
)

FormSelect.displayName = 'FormSelect'

export default FormSelect


