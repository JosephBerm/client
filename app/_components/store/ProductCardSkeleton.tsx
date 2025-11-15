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

import { PRODUCT_CARD_CONSTANTS } from './ProductCard.constants'

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
 * - Uses shared constants from ProductCard.constants.ts for pixel-perfect alignment
 * - Single source of truth ensures skeleton always matches ProductCard layout
 * - Color variations to indicate different content types (heading vs text)
 */
function SingleProductCardSkeleton({ className = '' }: { className?: string }) {
	const { DIMENSIONS, STYLES, SPACING, SKELETON } = PRODUCT_CARD_CONSTANTS
	
	return (
		<div 
			className={`${STYLES.CONTAINER} ${className}`}
			role="status"
			aria-label="Loading product"
		>
			{/* Image Skeleton - Fixed aspect ratio, matches ProductCard image */}
			<div className={`${STYLES.IMAGE_CONTAINER} skeleton-shimmer`} />
			
			{/* Content Container - Matches ProductCard padding exactly */}
			<div className={STYLES.CONTENT_CONTAINER}>
				{/* Product Name Skeleton - 2 lines, matches fontSize: 1.125rem (18px) */}
				<div className={SPACING.PRODUCT_NAME_LINES} style={{ minHeight: DIMENSIONS.PRODUCT_NAME.minHeight }}>
					<div 
						className="rounded skeleton-shimmer" 
						style={{ height: SKELETON.PRODUCT_NAME.height, width: SKELETON.PRODUCT_NAME.width.first }}
					/>
					<div 
						className="rounded skeleton-shimmer" 
						style={{ height: SKELETON.PRODUCT_NAME.height, width: SKELETON.PRODUCT_NAME.width.second }}
					/>
				</div>
				
				{/* Manufacturer Skeleton - 1 line, matches fontSize: 0.875rem (14px) */}
				<div 
					className={`${SPACING.MANUFACTURER_MARGIN} rounded skeleton-shimmer`}
					style={{ 
						height: SKELETON.MANUFACTURER.height, 
						width: SKELETON.MANUFACTURER.width, 
						minHeight: DIMENSIONS.MANUFACTURER.minHeight 
					}}
				/>
				
				{/* Price Skeleton - Prominent, matches fontSize: 1.875rem (30px) */}
				<div 
					className={`${SPACING.PRICE_MARGIN} rounded-lg skeleton-shimmer`}
					style={{ 
						height: SKELETON.PRICE.height, 
						width: SKELETON.PRICE.width, 
						minHeight: DIMENSIONS.PRICE.minHeight 
					}}
				/>
				
				{/* Metadata Skeleton - Icons + Text, matches fontSize: 0.875rem (14px) */}
				<div className={`${SPACING.METADATA_MARGIN} ${STYLES.METADATA_CONTAINER}`} style={{ minHeight: DIMENSIONS.METADATA.minHeight }}>
					{/* SKU metadata */}
					<div className={STYLES.METADATA_ITEM}>
						{/* Icon skeleton */}
						<div 
							className="shrink-0 rounded skeleton-shimmer" 
							style={{ height: SKELETON.METADATA_ICON.height, width: SKELETON.METADATA_ICON.width }}
						/>
						{/* Text skeleton: "SKU: XXXX" */}
						<div 
							className="rounded skeleton-shimmer" 
							style={{ height: SKELETON.METADATA_TEXT.height, width: SKELETON.METADATA_TEXT.width.sku }}
						/>
					</div>
					
					{/* Stock metadata */}
					<div className={STYLES.METADATA_ITEM}>
						{/* Icon skeleton */}
						<div 
							className="shrink-0 rounded skeleton-shimmer" 
							style={{ height: SKELETON.METADATA_ICON.height, width: SKELETON.METADATA_ICON.width }}
						/>
						{/* Text skeleton: "Stock: XX" */}
						<div 
							className="rounded skeleton-shimmer" 
							style={{ height: SKELETON.METADATA_TEXT.height, width: SKELETON.METADATA_TEXT.width.stock }}
						/>
					</div>
				</div>
				
				{/* Categories Skeleton - Badge-style tags, matches badge height */}
				<div className={`${SPACING.CATEGORY_MARGIN} ${STYLES.CATEGORY_CONTAINER}`} style={{ minHeight: DIMENSIONS.CATEGORY.minHeight }}>
					<div className={STYLES.CATEGORY_TAGS}>
					{/* First category badge */}
					<div 
						className="rounded-md skeleton-shimmer" 
						style={{ 
							height: SKELETON.CATEGORY_BADGE.height, 
							width: SKELETON.CATEGORY_BADGE.width.first, 
							maxWidth: SKELETON.CATEGORY_BADGE.maxWidth 
						}}
					/>
					{/* Second category badge */}
					<div 
						className="rounded-md skeleton-shimmer" 
						style={{ 
							height: SKELETON.CATEGORY_BADGE.height, 
							width: SKELETON.CATEGORY_BADGE.width.second, 
							maxWidth: SKELETON.CATEGORY_BADGE.maxWidth 
						}}
					/>
					</div>
				</div>
				
				{/* Spacer - Pushes button to bottom (matches ProductCard) */}
				<div className={STYLES.SPACER} style={DIMENSIONS.SPACER} />
				
				{/* Button Skeleton - Matches exact button dimensions */}
				<div className={`${SPACING.BUTTON_MARGIN} ${STYLES.BUTTON_CONTAINER}`}>
					<div 
						className={`${STYLES.BUTTON} rounded-lg skeleton-shimmer`}
						style={{ height: SKELETON.BUTTON.height, width: SKELETON.BUTTON.width }}
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

