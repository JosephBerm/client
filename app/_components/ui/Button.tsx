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

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
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
 * Reusable button component with DaisyUI styling and multiple customization options.
 * Supports loading states, icons, variants, and sizes. Fully accessible.
 * 
 * **Accessibility:**
 * - Proper disabled state handling
 * - Keyboard navigation support
 * - ARIA attributes via native button element
 * - Screen reader friendly
 * 
 * **Mobile-First:**
 * - Responsive sizing
 * - Touch-friendly tap targets
 * - Optional full width on mobile
 * 
 * @param props - Button props including variant, size, loading state, etc.
 * @param ref - Forwarded ref to the underlying button element
 * @returns Button component
 */
const baseClasses =
	'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.12em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
	primary:
		'btn btn-primary shadow-lg hover:-translate-y-0.5',
	secondary:
		'btn btn-secondary shadow-md hover:-translate-y-0.5',
	accent:
		'btn btn-accent shadow-lg hover:-translate-y-0.5',
	ghost:
		'btn btn-ghost hover:-translate-y-0.5',
	outline:
		'btn btn-outline hover:-translate-y-0.5',
	error:
		'btn btn-error shadow-lg hover:-translate-y-0.5',
	success:
		'btn btn-success shadow-lg hover:-translate-y-0.5',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
	xs: 'px-4 py-2 text-[0.6rem] uppercase',
	sm: 'px-5 py-2.5 text-xs uppercase',
	md: 'px-6 py-3 text-sm uppercase',
	lg: 'px-8 py-4 text-base uppercase',
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
						'cursor-not-allowed opacity-60': isDisabled,
					},
					className
				)}
				disabled={isDisabled}
				{...props}
			>
				{loading && (
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
				)}

				{!loading && leftIcon && <span className="flex items-center">{leftIcon}</span>}

				<span className="whitespace-nowrap">{children}</span>

				{!loading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
			</button>
		)
	}
)

// Set display name for debugging and dev tools
Button.displayName = 'Button'

export default Button


