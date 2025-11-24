/**
 * Button UI Component
 * 
 * DaisyUI-styled button component with loading states, icons, and multiple variants.
 * Provides consistent button styling across the application with mobile-first design.
 * Fully accessible with proper ARIA attributes and keyboard navigation.
 * 
 * **Features:**
 * - Multiple variants (primary, secondary, accent, ghost, outline, error, success)
 * - Multiple sizes (xs, sm, md, lg)
 * - Loading state with spinner
 * - Left and right icon support
 * - Full width option
 * - Disabled state handling
 * - Theme-aware (respects DaisyUI theme)
 * - Forward ref support for form libraries
 * 
 * **Variants:**
 * - **primary**: Main call-to-action buttons
 * - **secondary**: Secondary actions
 * - **accent**: Highlighted actions
 * - **ghost**: Minimal styling, transparent background
 * - **outline**: Outlined buttons with transparent background
 * - **error**: Destructive actions (delete, cancel)
 * - **success**: Confirmation actions (save, submit)
 * 
 * @example
 * ```tsx
 * import Button from '@_components/ui/Button';
 * import { Save, Trash } from 'lucide-react';
 * 
 * // Primary button with loading state
 * <Button
 *   variant="primary"
 *   loading={isSubmitting}
 *   onClick={handleSubmit}
 * >
 *   Submit
 * </Button>
 * 
 * // Button with left icon
 * <Button
 *   variant="success"
 *   leftIcon={<Save className="w-4 h-4" />}
 *   onClick={handleSave}
 * >
 *   Save Changes
 * </Button>
 * 
 * // Destructive action button
 * <Button
 *   variant="error"
 *   size="sm"
 *   leftIcon={<Trash className="w-4 h-4" />}
 *   onClick={handleDelete}
 * >
 *   Delete
 * </Button>
 * 
 * // Full width mobile button
 * <Button fullWidth variant="primary">
 *   Continue
 * </Button>
 * ```
 * 
 * @module Button
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react'

import classNames from 'classnames'

/**
 * Button component props interface.
 * Extends native HTML button attributes with custom styling options.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** 
	 * Button visual style variant.
	 * @default 'primary'
	 */
	variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'error' | 'success'
	
	/** 
	 * Button size (affects padding and font size).
	 * @default 'md'
	 */
	size?: 'xs' | 'sm' | 'md' | 'lg'
	
	/** 
	 * Makes button full width on mobile, auto width on desktop.
	 * @default false
	 */
	fullWidth?: boolean
	
	/** 
	 * Shows loading spinner and disables interaction.
	 * @default false
	 */
	loading?: boolean
	
	/** 
	 * Icon to display on the left side of the button text.
	 * Typically a Lucide icon component.
	 */
	leftIcon?: ReactNode
	
	/** 
	 * Icon to display on the right side of the button text.
	 * Typically a Lucide icon component.
	 */
	rightIcon?: ReactNode
}

/**
 * Button Component
 * 
 * Modern, elegant button component with subtle interactions and smooth animations.
 * Matches the refined feel of Select and Input components.
 * 
 * **Accessibility:**
 * - Proper disabled state handling
 * - Keyboard navigation support
 * - ARIA attributes via native button element
 * - Screen reader friendly
 * 
 * **Mobile-First:**
 * - Responsive sizing
 * - Touch-friendly tap targets (min 44px)
 * - Optional full width on mobile
 * 
 * **Design Philosophy:**
 * - Subtle hover effects (no vertical translation)
 * - Smooth 300ms transitions
 * - Elegant shadows and borders
 * - Clean, modern aesthetics
 * 
 * @param props - Button props including variant, size, loading state, etc.
 * @param ref - Forwarded ref to the underlying button element
 * @returns Button component
 */
const baseClasses =
	'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
	primary:
		'btn btn-primary shadow-sm hover:shadow-md focus-visible:shadow-lg focus-visible:ring-primary/30',
	secondary:
		'btn btn-secondary shadow-sm hover:shadow-md focus-visible:shadow-lg focus-visible:ring-secondary/30',
	accent:
		'btn btn-accent shadow-sm hover:shadow-md focus-visible:shadow-lg focus-visible:ring-accent/30',
	ghost:
		'btn btn-ghost hover:bg-base-200 focus-visible:ring-base-content/20',
	outline:
		'btn btn-outline hover:shadow-sm focus-visible:ring-primary/30',
	error:
		'btn btn-error shadow-sm hover:shadow-md focus-visible:shadow-lg focus-visible:ring-error/30',
	success:
		'btn btn-success shadow-sm hover:shadow-md focus-visible:shadow-lg focus-visible:ring-success/30',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
	xs: 'btn-xs px-3 py-1.5 text-xs',
	sm: 'btn-sm px-4 py-2 text-sm',
	md: 'btn-md px-5 py-2.5 text-base',
	lg: 'btn-lg px-6 py-3 text-lg',
}

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
		const isDisabled = disabled || loading

		return (
			<button
				ref={ref}
				className={classNames(
					baseClasses,
					variantClasses[variant],
					sizeClasses[size],
					{
						'w-full sm:w-auto': fullWidth,
						'cursor-not-allowed opacity-60 hover:shadow-none': isDisabled,
					},
					className
				)}
				disabled={isDisabled}
				{...props}
			>
				{loading && (
					<span 
						className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current animate-fade-in" 
						aria-hidden 
					/>
				)}

				{!loading && leftIcon && <span className="flex items-center shrink-0">{leftIcon}</span>}

				<span className="whitespace-nowrap">{children}</span>

				{!loading && rightIcon && <span className="flex items-center shrink-0">{rightIcon}</span>}
			</button>
		)
	}
)

// Set display name for debugging and dev tools
Button.displayName = 'Button'

export default Button


