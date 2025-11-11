'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'

interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label: string
	error?: FieldError
	helperText?: string
}

/**
 * Form checkbox component for React Hook Form
 * DaisyUI-styled with error handling
 */
const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
	({ label, error, helperText, className, ...props }, ref) => {
		return (
			<div className="form-control">
				<label className="label cursor-pointer justify-start gap-3">
					<input
						ref={ref}
						type="checkbox"
						className={classNames(
							'checkbox',
							{
								'checkbox-error': error,
							},
							className
						)}
						{...props}
					/>
					<span className="label-text">
						{label}
						{props.required && <span className="text-error ml-1">*</span>}
					</span>
				</label>

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

FormCheckbox.displayName = 'FormCheckbox'

export default FormCheckbox


