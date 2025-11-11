'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: FieldError
	helperText?: string
}

/**
 * Form input component for React Hook Form
 * DaisyUI-styled with error handling
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	({ label, error, helperText, className, ...props }, ref) => {
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

				<input
					ref={ref}
					className={classNames(
						'input input-bordered w-full',
						{
							'input-error': error,
						},
						className
					)}
					{...props}
				/>

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

FormInput.displayName = 'FormInput'

export default FormInput


