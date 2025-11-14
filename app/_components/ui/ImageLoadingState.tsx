/**
 * ImageLoadingState UI Component - Loading States for Images
 * 
 * Professional loading state component for images with skeleton variants.
 * Follows industry best practices from Material-UI, Ant Design, and modern design systems.
 * 
 * **Features:**
 * - Multiple skeleton variants (product, thumbnail, gallery, hero)
 * - Smooth shimmer animations
 * - Theme-aware styling
 * - Accessible (reduces motion for users who prefer it)
 * - Performance-optimized animations
 * 
 * **Variants:**
 * - **product**: Product card skeleton
 * - **thumbnail**: Thumbnail skeleton
 * - **gallery**: Gallery image skeleton
 * - **hero**: Hero/banner skeleton
 * 
 * **Use Cases:**
 * - Image loading states
 * - Placeholder during image fetch
 * - Progressive loading indicators
 * 
 * @example
 * ```tsx
 * import ImageLoadingState from '@_components/ui/ImageLoadingState';
 * 
 * // Product skeleton
 * <ImageLoadingState variant="product" size="md" />
 * 
 * // Gallery skeleton
 * <ImageLoadingState variant="gallery" size="lg" />
 * ```
 * 
 * @module ImageLoadingState
 */

import { ReactNode } from 'react'
import classNames from 'classnames'

/**
 * ImageLoadingState component props interface.
 */
export interface ImageLoadingStateProps {
	/** 
	 * Loading state variant.
	 * @default 'product'
	 */
	variant?: 'product' | 'thumbnail' | 'gallery' | 'hero'
	
	/** 
	 * Size preset.
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg' | 'xl'
	
	/** 
	 * Show shimmer animation.
	 * @default true
	 */
	showShimmer?: boolean
	
	/** 
	 * Additional CSS classes.
	 */
	className?: string
	
	/** 
	 * Custom loading content.
	 * If provided, replaces default skeleton.
	 */
	children?: ReactNode
}

/**
 * Variant configurations for aspect ratios and styling.
 */
const variantConfig = {
	product: {
		aspectRatio: 'aspect-square',
		rounded: 'rounded-xl',
	},
	thumbnail: {
		aspectRatio: 'aspect-square',
		rounded: 'rounded-md',
	},
	gallery: {
		aspectRatio: 'aspect-square',
		rounded: 'rounded-lg',
	},
	hero: {
		aspectRatio: 'aspect-video',
		rounded: 'rounded-lg',
	},
} as const

/**
 * ImageLoadingState Component
 * 
 * Professional skeleton loader for images with shimmer effect.
 * Matches the design of ProductCardSkeleton for consistency.
 * 
 * **Animation:**
 * - Uses CSS gradient animation (GPU-accelerated)
 * - Shimmer effect moves left to right
 * - Smooth easing function
 * - Respects prefers-reduced-motion
 * 
 * **Accessibility:**
 * - Proper ARIA attributes
 * - Screen reader announcements
 * - Respects motion preferences
 * 
 * @param props - ImageLoadingState configuration props
 * @returns ImageLoadingState component
 */
export default function ImageLoadingState({
	variant = 'product',
	size = 'md',
	showShimmer = true,
	className,
	children,
}: ImageLoadingStateProps) {
	const config = variantConfig[variant]

	// Custom content takes precedence
	if (children) {
		return (
			<div
				className={classNames(
					'relative overflow-hidden bg-base-200',
					config.aspectRatio,
					config.rounded,
					className
				)}
				role="status"
				aria-label="Loading image"
			>
				{children}
				<span className="sr-only">Loading image...</span>
			</div>
		)
	}

	return (
		<div
			className={classNames(
				'relative overflow-hidden bg-base-200',
				config.aspectRatio,
				config.rounded,
				{
					'skeleton-shimmer': showShimmer,
				},
				className
			)}
			role="status"
			aria-label="Loading image"
		>
			<span className="sr-only">Loading image...</span>
		</div>
	)
}

