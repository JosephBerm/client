/**
 * Textarea UI Component
 * 
 * Textarea component following the same patterns as Input component.
 * 
 * @module Textarea
 */

'use client'

import type { TextareaHTMLAttributes, ReactNode } from 'react'
import React, { forwardRef } from 'react'
import classNames from 'classnames'

import {
	formFieldBaseClasses,
	formFieldHoverClasses,
	formFieldFocusClasses,
	formFieldErrorClasses,
	formFieldDisabledClasses,
	formFieldTextClasses,
} from './formFieldStyles'

export type TextareaSize = 'xs' | 'sm' | 'base' | 'lg'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Size variant (default: 'base') */
	size?: TextareaSize
	/** Error state */
	error?: boolean
	/** Error message text */
	errorMessage?: string
	/** Helper text displayed below textarea */
	helperText?: string
	/** Label text */
	label?: string
	/** Custom className */
	className?: string
	/** Custom className for wrapper */
	wrapperClassName?: string
}

const sizeClasses: Record<TextareaSize, string> = {
	xs: 'textarea-xs text-xs min-h-[4rem]',
	sm: 'textarea-sm text-sm min-h-[5rem]',
	base: 'text-base min-h-[6rem]',
	lg: 'textarea-lg text-lg min-h-[8rem]',
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			size = 'base',
			error = false,
			errorMessage,
			helperText,
			label,
			className,
			wrapperClassName,
			disabled,
			id,
			'aria-label': ariaLabel,
			'aria-describedby': ariaDescribedBy,
			...props
		},
		ref
	) => {
		const hasHelperText = Boolean(helperText || errorMessage)
		const isDisabled = Boolean(disabled)

		const helperId = id ? `${id}-helper` : undefined
		const errorId = id ? `${id}-error` : undefined
		const describedBy = [
			ariaDescribedBy,
			error && errorId,
			!error && helperText && helperId,
		]
			.filter(Boolean)
			.join(' ') || undefined

		const textareaClasses = classNames(
			'textarea',
			'textarea-bordered',
			sizeClasses[size],
			formFieldBaseClasses,
			formFieldHoverClasses(isDisabled),
			formFieldFocusClasses,
			formFieldErrorClasses(error),
			formFieldDisabledClasses(isDisabled),
			formFieldTextClasses,
			className
		)

		return (
			<div className={classNames('w-full', wrapperClassName)}>
				{label && (
					<label htmlFor={id} className="label">
						<span className="label-text">{label}</span>
					</label>
				)}
				<textarea
					ref={ref}
					id={id}
					{...props}
					disabled={isDisabled}
					aria-label={ariaLabel}
					aria-describedby={describedBy}
					aria-invalid={error}
					className={textareaClasses}
				/>
				{hasHelperText && (
					<div className="mt-1.5">
						{error && errorMessage ? (
							<p
								id={errorId}
								className="text-xs text-error"
								role="alert"
								aria-live="polite"
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

Textarea.displayName = 'Textarea'

export default Textarea
