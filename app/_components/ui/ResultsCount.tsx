'use client'

/**
 * ResultsCount Component
 *
 * Reusable component for displaying results summary.
 * Used across search, filters, and pagination interfaces.
 *
 * **Industry Best Practices:**
 * - Amazon: Shows "1-24 of 1,000+ results"
 * - Google: Shows "About 1,234 results"
 * - Apple: Shows "24 products"
 *
 * **Features:**
 * - Responsive text sizing
 * - Optional "products" label
 * - Loading state support
 * - Mobile-first design
 *
 * @example
 * ```tsx
 * <ResultsCount displayed={20} total={447} />
 * <ResultsCount displayed={20} total={447} showLabel={false} />
 * <ResultsCount displayed={20} total={447} isLoading />
 * ```
 */

export interface ResultsCountProps {
	/** Number of items currently displayed */
	displayed: number
	/** Total number of items available */
	total: number
	/** Show "products" label (default: true on sm+) */
	showLabel?: boolean
	/** Loading state */
	isLoading?: boolean
	/** Custom className */
	className?: string
	/** Separator style: 'slash' | 'of' | 'dash' */
	separator?: 'slash' | 'of' | 'dash'
	/** Text size: 'sm' | 'base' | 'lg' */
	size?: 'sm' | 'base' | 'lg'
}

/**
 * ResultsCount Component
 *
 * Displays a formatted count of displayed vs total items.
 *
 * @param props - Component props
 * @returns ResultsCount component
 */
export default function ResultsCount({
	displayed,
	total,
	showLabel = true,
	isLoading = false,
	className = '',
	separator = 'of',
	size = 'sm',
}: ResultsCountProps) {
	// Size mappings
	const sizeClasses = {
		sm: 'text-sm md:text-base',
		base: 'text-base',
		lg: 'text-base md:text-lg',
	}

	const fontSizes = {
		sm: '0.875rem',
		base: '1rem',
		lg: '1.125rem',
	}

	// Separator symbols
	const separators = {
		slash: '/',
		of: 'of',
		dash: '–',
	}

	if (isLoading) {
		return (
			<div
				className={`font-medium text-base-content/80 ${sizeClasses[size]} ${className}`}
				style={{ fontSize: fontSizes[size], minWidth: '5rem' }}
				role="status"
				aria-live="polite"
			>
				<span className="inline-block animate-pulse">Loading...</span>
			</div>
		)
	}

	return (
		<div
			className={`font-medium text-base-content/80 ${sizeClasses[size]} ${className}`}
			style={{ fontSize: fontSizes[size], minWidth: '5rem' }}
			role="status"
			aria-live="polite"
			aria-label={`Showing ${displayed} of ${total} products`}
		>
			<span className="font-bold text-base-content">{displayed.toLocaleString()}</span>
			<span className="mx-1 text-base-content/50">{separators[separator]}</span>
			<span className="font-bold text-base-content">{total.toLocaleString()}</span>
			{showLabel && (
				<span className="ml-1 hidden text-base-content/70 sm:inline">products</span>
			)}
		</div>
	)
}

