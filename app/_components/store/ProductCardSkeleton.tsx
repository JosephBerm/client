/**
 * ProductCardSkeleton Component - FAANG-Standard Loading State
 * 
 * Professional skeleton loader with triple-layer animation system.
 * Follows best practices from leading tech companies (Meta, Google, LinkedIn, Microsoft).
 * 
 * **Features:**
 * - **Triple Animation System**: Pulse + Shimmer + Glow for premium, visible effect
 * - **Pulse Animation**: Pronounced opacity breathing (0.5 ↔ 1.0) - LinkedIn/Facebook pattern
 * - **Shimmer Animation**: Enhanced gradient wave sweep - Google Material Design
 * - **Glow Animation**: Subtle brightness shift (1.0 ↔ 1.05) - Premium feel
 * - Matches ProductCard layout exactly
 * - Theme-aware (works in light/dark modes with adjusted gradients)
 * - Accessible (respects prefers-reduced-motion)
 * - Performance-optimized (GPU-accelerated, 60fps)
 * 
 * **Animation Strategy:**
 * - GPU-accelerated properties only (opacity, transform, filter)
 * - 2s duration with cubic-bezier easing for natural movement
 * - Enhanced shimmer gradient (30% peak opacity) for visibility
 * - All three animations synchronized for cohesive effect
 * - Automatically simplified for users who prefer reduced motion
 * 
 * **Performance:**
 * - Zero JavaScript - pure CSS animations
 * - will-change hints for optimal GPU layer management
 * - No layout thrashing or reflows
 * - Separate dark mode gradients for optimal contrast
 * 
 * **Global Application:**
 * - Uses `.skeleton-shimmer` class - works anywhere in the app
 * - Consistent across ProductCard, ImageLoadingState, and all loaders
 * 
 * @see app/globals.css - Global skeleton animation definitions
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
 * Single ProductCard Skeleton with Triple-Layer Animation
 * 
 * Implements FAANG-standard skeleton loading pattern with:
 * 1. Pulse animation - pronounced opacity breathing (0.5 ↔ 1.0) - LinkedIn/Facebook
 * 2. Shimmer animation - enhanced gradient wave sweep - Google Material Design
 * 3. Glow animation - subtle brightness shift - Premium enhancement
 * 
 * All three animations are GPU-accelerated for buttery-smooth 60fps performance.
 * The combined effect is highly visible and elegant.
 * 
 * **Size Matching Strategy:**
 * - Exact dimensions from ProductCard component for pixel-perfect alignment
 * - Shared style objects for consistency between skeleton and actual card
 * - Color variations to indicate different content types (heading vs text)
 */
function SingleProductCardSkeleton({ className = '' }: { className?: string }) {
	// Shared style constants - matches ProductCard exactly (FAANG: DRY principle)
	const PRODUCT_NAME_HEIGHT = '2.25rem'      // fontSize: 1.125rem, 2 lines
	const MANUFACTURER_HEIGHT = '1.25rem'      // fontSize: 0.875rem, 1 line
	const PRICE_HEIGHT = '2.25rem'             // fontSize: 1.875rem
	const METADATA_HEIGHT = '1.25rem'          // fontSize: 0.875rem
	const CATEGORY_HEIGHT = '1.5rem'           // Badge height
	const BUTTON_HEIGHT = '2.5rem'             // Button minHeight
	
	return (
		<div 
			className={`flex flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm ${className}`}
			role="status"
			aria-label="Loading product"
		>
			{/* Image Skeleton - Fixed aspect ratio, matches ProductCard image */}
			<div className="relative aspect-square w-full shrink-0 bg-base-200 skeleton-shimmer" />
			
			{/* Content Container - Matches ProductCard padding exactly */}
			<div className="flex flex-1 flex-col p-4 sm:p-5">
				{/* Product Name Skeleton - 2 lines, matches fontSize: 1.125rem (18px) */}
				<div className="space-y-1.5" style={{ minHeight: PRODUCT_NAME_HEIGHT }}>
					<div 
						className="rounded skeleton-shimmer" 
						style={{ height: '1.125rem', width: '100%' }}
					/>
					<div 
						className="rounded skeleton-shimmer" 
						style={{ height: '1.125rem', width: '70%' }}
					/>
				</div>
				
				{/* Manufacturer Skeleton - 1 line, matches fontSize: 0.875rem (14px) */}
				<div 
					className="mt-2 rounded skeleton-shimmer" 
					style={{ height: '0.875rem', width: '45%', minHeight: MANUFACTURER_HEIGHT }}
				/>
				
				{/* Price Skeleton - Prominent, matches fontSize: 1.875rem (30px) */}
				<div 
					className="mt-3 rounded-lg skeleton-shimmer" 
					style={{ height: '1.875rem', width: '40%', minHeight: PRICE_HEIGHT }}
				/>
				
				{/* Metadata Skeleton - Icons + Text, matches fontSize: 0.875rem (14px) */}
				<div className="mt-3 flex gap-3" style={{ minHeight: METADATA_HEIGHT }}>
					{/* SKU metadata */}
					<div className="flex items-center gap-1">
						{/* Icon skeleton */}
						<div 
							className="shrink-0 rounded skeleton-shimmer" 
							style={{ height: '1rem', width: '1rem' }}
						/>
						{/* Text skeleton: "SKU: XXXX" */}
						<div 
							className="rounded skeleton-shimmer" 
							style={{ height: '0.875rem', width: '4rem' }}
						/>
					</div>
					
					{/* Stock metadata */}
					<div className="flex items-center gap-1">
						{/* Icon skeleton */}
						<div 
							className="shrink-0 rounded skeleton-shimmer" 
							style={{ height: '1rem', width: '1rem' }}
						/>
						{/* Text skeleton: "Stock: XX" */}
						<div 
							className="rounded skeleton-shimmer" 
							style={{ height: '0.875rem', width: '3.5rem' }}
						/>
					</div>
				</div>
				
				{/* Categories Skeleton - Badge-style tags, matches badge height */}
				<div className="mt-3 flex gap-2" style={{ minHeight: CATEGORY_HEIGHT }}>
					{/* First category badge */}
					<div 
						className="rounded-md skeleton-shimmer" 
						style={{ height: '1.5rem', width: '6rem', maxWidth: '8rem' }}
					/>
					{/* Second category badge */}
					<div 
						className="rounded-md skeleton-shimmer" 
						style={{ height: '1.5rem', width: '7rem', maxWidth: '8rem' }}
					/>
				</div>
				
				{/* Spacer - Pushes button to bottom (matches ProductCard) */}
				<div className="flex-1" style={{ minHeight: '0.5rem' }} />
				
				{/* Button Skeleton - Matches exact button dimensions */}
				<div className="mt-4 flex justify-center">
					<div 
						className="w-full rounded-lg skeleton-shimmer" 
						style={{ height: BUTTON_HEIGHT }}
					/>
				</div>
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

