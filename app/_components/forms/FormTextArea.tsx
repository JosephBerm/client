'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'

interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: FieldError
	helperText?: string
}

/**
 * Form textarea component for React Hook Form
 * DaisyUI-styled with error handling
 */
const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
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

				<textarea
					ref={ref}
					className={classNames(
						'textarea textarea-bordered w-full',
						{
							'textarea-error': error,
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

FormTextArea.displayName = 'FormTextArea'

export default FormTextArea


