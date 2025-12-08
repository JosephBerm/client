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
import { forwardRef, isValidElement, useMemo, Fragment } from 'react'

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
	
	/** 
	 * Allow button height to be determined by content (e.g., large avatars, icons).
	 * Overrides DaisyUI's fixed height constraint (height: var(--size)).
	 * Use for icon-only buttons with avatars or large icons that exceed standard button heights.
	 * @default false
	 */
	contentDrivenHeight?: boolean
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
		'btn btn-ghost bg-transparent hover:bg-base-200 focus-visible:ring-base-content/20',
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
			contentDrivenHeight = false,
			children,
			className,
			disabled,
			...props
		},
		ref
	) => {
		const isDisabled = Boolean(disabled) || loading

		const { style, ...restProps } = props

		/**
		 * Determines if children are visible and should be rendered.
		 * Handles edge cases: numbers (including 0), arrays, fragments, hidden elements.
		 * 
		 * MAANG Best Practice: Memoized computation to prevent unnecessary recalculations.
		 */
		const hasVisibleChildren = useMemo(() => {
			// Handle null/undefined
			if (children == null) {
				return false
			}

			// Handle numbers (0 is a valid React child)
			if (typeof children === 'number') {
				return true
			}

			// Handle booleans (React filters these out, but we check for completeness)
			if (typeof children === 'boolean') {
				return false
			}

			// Handle strings (including empty strings)
			if (typeof children === 'string') {
				return children.trim().length > 0
			}

			// Handle arrays (React.Children.map pattern)
			if (Array.isArray(children)) {
				// Filter out falsy values and check if any remain
				const validChildren = children.filter(
					(child) => child != null && child !== false && child !== true
				)
				return validChildren.length > 0
			}

			// Handle React elements
			if (isValidElement(children)) {
				// Check for Fragment (React.Fragment or <></>)
				if (children.type === Fragment) {
					// Fragments can have children, check them recursively
					const fragmentChildren = (children.props as { children?: ReactNode })?.children
					if (fragmentChildren == null) {
						return false
					}
					// Recursively check fragment children (simplified - assumes array/string)
					if (Array.isArray(fragmentChildren)) {
						return fragmentChildren.some(
							(child) => child != null && child !== false && child !== true
						)
					}
					return fragmentChildren != null
				}

				// Check if element is hidden via className
				const elementProps = children.props as { className?: string | string[] | Record<string, boolean> }
				const elementClassName = elementProps?.className
				if (elementClassName) {
					// Handle className as string, array, or object (classNames format)
					let classNameString = ''
					if (typeof elementClassName === 'string') {
						classNameString = elementClassName
					} else if (Array.isArray(elementClassName)) {
						classNameString = elementClassName.join(' ')
					} else if (typeof elementClassName === 'object' && elementClassName !== null && !Array.isArray(elementClassName)) {
						// Handle className as Record<string, boolean> (classNames object format)
						classNameString = Object.entries(elementClassName)
							.filter(([, value]) => typeof value === 'boolean' && value)
							.map(([key]) => key)
							.join(' ')
					}

					// Check for hidden classes (Tailwind: hidden, sm:hidden, etc.)
					if (classNameString.includes('hidden')) {
						return false
					}
				}

				// For other React elements, assume they're visible
				return true
			}

			// Fallback: assume visible if we can't determine
			return true
		}, [children])
		
		/**
		 * Determines if button is icon-only (no visible text content).
		 * Icon-only when: not loading, no visible children, and exactly one icon (left XOR right).
		 * 
		 * MAANG Best Practice: Memoized derived state.
		 */
		const isIconOnly = useMemo(
			() => !loading && !hasVisibleChildren && ((leftIcon && !rightIcon) || (!leftIcon && rightIcon)),
			[loading, hasVisibleChildren, leftIcon, rightIcon]
		)

		return (
			// eslint-disable-next-line no-restricted-syntax
			<button
				ref={ref}
				className={classNames(
					baseClasses,
					variantClasses[variant],
					sizeClasses[size],
					{
						'w-full sm:w-auto': fullWidth,
						'cursor-not-allowed opacity-60 hover:shadow-none': isDisabled,
						'h-auto min-h-fit': contentDrivenHeight, // Override DaisyUI's height: var(--size)
						'gap-0': isIconOnly, // Remove gap for icon-only buttons
						'leading-none': isIconOnly, // Remove line-height for perfect icon centering
					},
					className
				)}
				style={
					contentDrivenHeight
						? { height: 'auto', minHeight: 'fit-content', ...style }
						: style
				}
				disabled={isDisabled}
				aria-busy={loading ? true : undefined}
				{...restProps}
			>
				{loading && (
					<span 
						className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current animate-fade-in flex items-center justify-center" 
						aria-hidden 
					/>
				)}

				{!loading && leftIcon && (
					<span className="flex items-center justify-center shrink-0">
						{leftIcon}
					</span>
				)}

				{hasVisibleChildren && (
					<span className="whitespace-nowrap">{children}</span>
				)}

				{!loading && rightIcon && (
					<span className="flex items-center justify-center shrink-0">
						{rightIcon}
					</span>
				)}
			</button>
		)
	}
)

// Set display name for debugging and dev tools
Button.displayName = 'Button'

export default Button


