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
					'btn', // Base DaisyUI button class
					`btn-${variant}`, // Variant class (btn-primary, btn-secondary, etc.)
					`btn-${size}`, // Size class (btn-xs, btn-sm, etc.)
					{
						'w-full sm:w-auto': fullWidth, // Full width on mobile, auto on desktop
						'btn-disabled': disabled || loading, // Disabled styling
					},
					className // Additional custom classes
				)}
				disabled={disabled || loading} // Disable interaction when loading or disabled
				{...props} // Pass through all other HTML button attributes
			>
				{/* Show spinner when loading */}
				{loading && <span className="loading loading-spinner"></span>}
				
				{/* Show left icon when not loading */}
				{!loading && leftIcon && <span>{leftIcon}</span>}
				
				{/* Button text content */}
				{children}
				
				{/* Show right icon when not loading */}
				{!loading && rightIcon && <span>{rightIcon}</span>}
			</button>
		)
	}
)

// Set display name for debugging and dev tools
Button.displayName = 'Button'

export default Button


