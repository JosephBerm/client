/**
 * Radio UI Component
 *
 * DaisyUI radio button component wrapper.
 * Provides consistent API for radio buttons throughout the application.
 *
 * @module Radio
 */

'use client'

import type { InputHTMLAttributes } from 'react'
import React, { forwardRef } from 'react'
import classNames from 'classnames'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
	/** Size variant */
	size?: 'sm' | 'md' | 'lg'
	/** Color variant */
	variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
	/** Custom className */
	className?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
	({ size = 'md', variant = 'primary', className, ...props }, ref) => {
		const sizeClass = size === 'sm' ? 'radio-sm' : size === 'lg' ? 'radio-lg' : ''
		const variantClass = `radio-${variant}`

		return (
			<input
				ref={ref}
				type='radio'
				className={classNames('radio', variantClass, sizeClass, className)}
				{...props}
			/>
		)
	}
)

Radio.displayName = 'Radio'

export default Radio
