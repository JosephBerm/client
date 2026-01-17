/**
 * Toggle UI Component
 *
 * DaisyUI toggle switch component wrapper.
 * Provides consistent API for toggle switches throughout the application.
 *
 * @module Toggle
 */

'use client'

import type { InputHTMLAttributes } from 'react'
import React, { forwardRef } from 'react'
import classNames from 'classnames'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
	/** Size variant */
	size?: 'sm' | 'md' | 'lg'
	/** Color variant */
	variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
	/** Custom className */
	className?: string
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
	({ size = 'md', variant = 'primary', className, ...props }, ref) => {
		const sizeClass = size === 'sm' ? 'toggle-sm' : size === 'lg' ? 'toggle-lg' : ''
		const variantClass = `toggle-${variant}`

		return (
			<input
				ref={ref}
				type='checkbox'
				className={classNames('toggle', variantClass, sizeClass, className)}
				{...props}
			/>
		)
	}
)

Toggle.displayName = 'Toggle'

export default Toggle
