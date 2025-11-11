import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import classNames from 'classnames'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error' | 'success'
	size?: 'xs' | 'sm' | 'md' | 'lg'
	fullWidth?: boolean
	loading?: boolean
	leftIcon?: ReactNode
	rightIcon?: ReactNode
}

/**
 * Button component with DaisyUI styles
 * Mobile-first, accessible, and theme-aware
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = 'primary',
			size = 'md',
			fullWidth = false,
			loading = false,
			leftIcon,
			rightIcon,
			children,
			className,
			disabled,
			...props
		},
		ref
	) => {
		return (
			<button
				ref={ref}
				className={classNames(
					'btn',
					`btn-${variant}`,
					`btn-${size}`,
					{
						'w-full sm:w-auto': fullWidth,
						'btn-disabled': disabled || loading,
					},
					className
				)}
				disabled={disabled || loading}
				{...props}
			>
				{loading && <span className="loading loading-spinner"></span>}
				{!loading && leftIcon && <span>{leftIcon}</span>}
				{children}
				{!loading && rightIcon && <span>{rightIcon}</span>}
			</button>
		)
	}
)

Button.displayName = 'Button'

export default Button


