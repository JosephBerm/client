/**
 * LoadingSpinner Component
 *
 * Reusable loading spinner with DaisyUI styling.
 * Can be used inline within components or as a full-screen overlay.
 * Provides customizable size, color, and optional loading text.
 *
 * **Features:**
 * - Multiple size options (xs, sm, md, lg)
 * - Color variants (primary, secondary, accent, neutral)
 * - Optional loading text below spinner
 * - Full-screen overlay mode with backdrop blur
 * - DaisyUI loading spinner classes
 * - Centered layout
 *
 * **Use Cases:**
 * - Page loading states
 * - Button loading indicators
 * - Table data fetching
 * - Form submission feedback
 * - Full-screen loading overlays
 *
 * @example
 * ```tsx
 * import LoadingSpinner from '@_components/common/LoadingSpinner';
 *
 * // Inline spinner (default)
 * <LoadingSpinner />
 *
 * // Small spinner with custom color
 * <LoadingSpinner size="sm" color="accent" />
 *
 * // With loading text
 * <LoadingSpinner text="Loading products..." />
 *
 * // Full-screen overlay
 * <LoadingSpinner fullScreen text="Please wait..." />
 *
 * // Conditional rendering
 * {isLoading && <LoadingSpinner size="lg" color="primary" text="Fetching data..." />}
 *
 * // In a table cell
 * <td className="text-center">
 *   <LoadingSpinner size="xs" />
 * </td>
 * ```
 *
 * @module LoadingSpinner
 */

import classNames from 'classnames'

/**
 * LoadingSpinner component props interface.
 */
interface LoadingSpinnerProps {
	/**
	 * Spinner size.
	 * @default 'md'
	 */
	size?: 'xs' | 'sm' | 'md' | 'lg'

	/**
	 * Spinner color variant.
	 * @default 'primary'
	 */
	color?: 'primary' | 'secondary' | 'accent' | 'neutral'

	/**
	 * Optional text to display below the spinner.
	 */
	text?: string

	/**
	 * Whether to render as a full-screen overlay.
	 * When true, spinner is centered with backdrop blur.
	 * @default false
	 */
	fullScreen?: boolean
}

/**
 * LoadingSpinner Component
 *
 * Flexible loading indicator with inline and full-screen modes.
 * Uses DaisyUI loading spinner classes for consistent theming.
 *
 * **Size Classes:**
 * - xs: Extra small (12px)
 * - sm: Small (16px)
 * - md: Medium (24px) - default
 * - lg: Large (36px)
 *
 * **Full-Screen Mode:**
 * - Fixed positioning covering entire viewport
 * - Semi-transparent backdrop with blur effect
 * - High z-index (50) to appear above other content
 * - Centered spinner and text
 *
 * @param props - Component props including size, color, text, and fullScreen
 * @returns LoadingSpinner component
 */
export default function LoadingSpinner({
	size = 'md',
	color = 'primary',
	text,
	fullScreen = false,
}: LoadingSpinnerProps) {
	const spinner = (
		<div className="flex flex-col items-center justify-center gap-4">
			<span className={classNames('loading loading-spinner', `loading-${size}`, `text-${color}`)} />
			{text && <p className="text-sm text-base-content/70">{text}</p>}
		</div>
	)

	if (fullScreen) {
		return (
			<div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
				{spinner}
			</div>
		)
	}

	return spinner
}
