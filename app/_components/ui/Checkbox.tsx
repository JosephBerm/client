/**
 * Checkbox UI Component
 * 
 * Checkbox component following DaisyUI patterns.
 * 
 * @module Checkbox
 */

'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import React, { forwardRef } from 'react'
import classNames from 'classnames'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	/** Label text */
	label?: string
	/** Helper text */
	helperText?: string
	/** Error state */
	error?: boolean
	/** Error message */
	errorMessage?: string
	/** Custom className */
	className?: string
	/** Custom className for wrapper */
	wrapperClassName?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	(
		{
			label,
			helperText,
			error = false,
			errorMessage,
			className,
			wrapperClassName,
			id,
			checked,
			onChange,
			disabled,
			...props
		},
		ref
	) => {
		const hasHelperText = Boolean(helperText || errorMessage)
		const helperId = id ? `${id}-helper` : undefined
		const errorId = id ? `${id}-error` : undefined

		return (
			<div className={classNames('form-control', wrapperClassName)}>
				<label className="label cursor-pointer justify-start gap-2">
					<input
						ref={ref}
						type="checkbox"
						id={id}
						checked={checked}
						onChange={onChange}
						disabled={disabled}
						className={classNames(
							'checkbox',
							error && 'checkbox-error',
							className
						)}
						aria-invalid={error}
						aria-describedby={hasHelperText ? (error ? errorId : helperId) : undefined}
						{...props}
					/>
					{label && (
						<span className="label-text">{label}</span>
					)}
				</label>
				{hasHelperText && (
					<div className="mt-1">
						{error && errorMessage ? (
							<p
								id={errorId}
								className="text-xs text-error"
								role="alert"
							>
								{errorMessage}
							</p>
						) : helperText ? (
							<p
								id={helperId}
								className="text-xs text-base-content/60"
							>
								{helperText}
							</p>
						) : null}
					</div>
				)}
			</div>
		)
	}
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
