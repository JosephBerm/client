/**
 * ProductCardSkeleton Component - Industry-Standard Loading State
 * 
 * Professional skeleton loader with gradient shimmer effect.
 * Follows best practices from leading design systems (Material-UI, Ant Design, Chakra UI).
 * 
 * **Features:**
 * - Gradient shimmer animation (1.5s smooth loop)
 * - Matches ProductCard layout exactly
 * - Theme-aware (works in light/dark modes)
 * - Accessible (reduces motion for users who prefer it)
 * - Performance-optimized animations
 * 
 * **Animation Strategy:**
 * - Uses CSS gradient animation (more performant than JavaScript)
 * - Shimmer effect moves left to right
 * - Smooth easing function for natural movement
 * - GPU-accelerated with transform
 * 
 * @module ProductCardSkeleton
 */

'use client'

export interface ProductCardSkeletonProps {
	/** Number of skeleton cards to render */
	count?: number
	
	/** Optional: Additional CSS classes */
	className?: string
}

/**
 * Single ProductCard Skeleton with Shimmer Effect
 * 
 * Implements industry-standard skeleton loading pattern with gradient shimmer.
 * Animation is GPU-accelerated for smooth performance.
 */
function SingleProductCardSkeleton({ className = '' }: { className?: string }) {
	return (
		<div 
			className={`flex flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm ${className}`}
			role="status"
			aria-label="Loading product"
		>
			{/* Image Skeleton with Shimmer - Fixed aspect ratio */}
			<div className="relative aspect-square w-full shrink-0 bg-base-200 skeleton-shimmer" />
			
			{/* Content Skeleton - Grows to fill space */}
			<div className="flex flex-1 flex-col p-4 sm:p-5">
				{/* Title Skeleton - Fixed 2 lines, matches ProductCard */}
				<div className="space-y-1.5" style={{ minHeight: '2.25rem' }}>
					<div className="h-4 w-full rounded skeleton-shimmer" />
					<div className="h-4 w-2/3 rounded skeleton-shimmer" />
				</div>
				
				{/* Manufacturer Skeleton - Fixed 1 line */}
				<div className="mt-2 h-4 w-1/2 rounded skeleton-shimmer" style={{ minHeight: '1.25rem' }} />
				
				{/* Price Skeleton - Fixed height */}
				<div className="mt-3 h-9 w-2/5 rounded skeleton-shimmer" style={{ minHeight: '2.25rem' }} />
				
				{/* Metadata Skeleton - Icons + Text, fixed height */}
				<div className="mt-3 flex gap-3" style={{ minHeight: '1.25rem' }}>
					<div className="flex items-center gap-1">
						<div className="h-4 w-4 shrink-0 rounded skeleton-shimmer" />
						<div className="h-3.5 w-16 rounded skeleton-shimmer" />
					</div>
					<div className="flex items-center gap-1">
						<div className="h-4 w-4 shrink-0 rounded skeleton-shimmer" />
						<div className="h-3.5 w-14 rounded skeleton-shimmer" />
					</div>
				</div>
				
				{/* Categories Skeleton - Hashtag-style tags */}
				<div className="mt-3 flex gap-2" style={{ minHeight: '1.5rem' }}>
					<div className="h-6 w-24 max-w-32 rounded-md skeleton-shimmer" />
					<div className="h-6 w-28 max-w-32 rounded-md skeleton-shimmer" />
				</div>
				
				{/* Spacer - Pushes button to bottom */}
				<div className="flex-1" style={{ minHeight: '0.5rem' }} />
				
				{/* Button Skeleton - Always at bottom, matches ProductCard button */}
				<div className="mt-4 h-10 w-full rounded-lg skeleton-shimmer" />
			</div>
			
			{/* Screen reader announcement */}
			<span className="sr-only">Loading product information...</span>
		</div>
	)
}

/**
 * ProductCardSkeleton Component
 * 
 * Renders multiple skeleton loaders for product cards.
 * Used during initial load or when fetching new products.
 */
export default function ProductCardSkeleton({ count = 8, className = '' }: ProductCardSkeletonProps) {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<SingleProductCardSkeleton key={index} className={className} />
			))}
		</>
	)
}

