/**
 * ProductCard Component - Enhanced B2B Medical Supply Product Card
 * 
 * Industry-leading product card design inspired by Apple, Microsoft, and modern e-commerce best practices.
 * Optimized for B2B medical supply catalogs with professional styling and comprehensive information display.
 * 
 * **Key Features:**
 * - Product image with placeholder support
 * - Stock status badges (Out of Stock, Low Stock, In Stock)
 * - Prominent price display
 * - Organized metadata with icons
 * - Category chips (limited display)
 * - Smooth hover effects and transitions
 * - Accessible and semantic HTML
 * - Responsive design
 * 
 * **Design Principles:**
 * - Visual hierarchy: Image → Name → Price → Metadata
 * - Clear stock status indication
 * - Professional, clean aesthetics
 * - Smooth micro-interactions
 * - Mobile-friendly touch targets
 * 
 * @module ProductCard
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Package, Warehouse, Heart, Eye } from 'lucide-react'
import { Product } from '@_classes/Product'
import Button from '@_components/ui/Button'
import ProductImage from '@_components/store/ProductImage'
import { Routes } from '@_features/navigation'
import { ImagePreloadService } from '@_features/images'
import { logger } from '@_core'
import { PRODUCT_CARD_CONSTANTS } from './ProductCard.constants'

export interface ProductCardProps {
	/** Product data to display */
	product: Product
	
	/** Optional: Show wishlist button */
	showWishlist?: boolean
	
	/** Optional: Show quick view button */
	showQuickView?: boolean
	
	/** Optional: Custom onClick handler */
	onClick?: (product: Product) => void
	
	/** Optional: Additional CSS classes */
	className?: string
	
	/** Optional: Priority loading for above-the-fold images */
	priority?: boolean
}

/**
 * Format currency value to USD
 */
const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 2,
	}).format(Number.isFinite(value) ? value : 0)

/**
 * ProductCard Component
 * 
 * Enhanced product card with industry-leading design patterns.
 * Displays product information in a visually appealing, accessible format.
 */

export default function ProductCard({
	product,
	showWishlist = false,
	showQuickView = false,
	onClick,
	className = '',
	priority = false,
}: ProductCardProps) {
	const [isWishlisted, setIsWishlisted] = useState(false)
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const hasPreloadedRef = useRef(false)

	const handleWishlistToggle = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsWishlisted(!isWishlisted)
		// TODO: Implement wishlist API call
	}

	const handleQuickView = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		// TODO: Implement quick view modal
	}

	const handleCardClick = () => {
		if (onClick) {
			onClick(product)
		}
	}

	// Navigation preloading - preload product images before navigation (Shopify/Amazon pattern)
	// This combines hover preloading with navigation preloading for optimal UX
	const handleMouseEnter = useCallback(() => {
		// Only preload if product has images and hasn't been preloaded yet
		if (!product.hasImage() || product.files.length === 0 || hasPreloadedRef.current) {
			return
		}

		// Debounce preloading (200ms delay - industry standard)
		// Prevents excessive preloading on quick mouse movements
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current)
		}

		hoverTimeoutRef.current = setTimeout(() => {
			// Preload product images with 'navigation' strategy and 'high' priority
			// This preloads images before user clicks, making navigation instant
			ImagePreloadService.preloadProduct(product.id, product.files, {
				strategy: 'navigation',
				priority: 'high',
				delay: 0, // No additional delay after hover
			}).catch((error) => {
				// Silent failure - preloading is a performance optimization, not critical
				logger.debug('Image preload failed', {
					error,
					productId: product.id,
					component: 'ProductCard',
					context: 'navigation_preload',
				})
			})

			hasPreloadedRef.current = true
		}, 200) // 200ms debounce - Amazon/Shopify standard
	}, [product])

	// Cleanup timeout on mouse leave
	const handleMouseLeave = useCallback(() => {
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current)
			hoverTimeoutRef.current = null
		}
	}, [])

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current)
			}
		}
	}, [])

	const { DIMENSIONS, STYLES, SPACING } = PRODUCT_CARD_CONSTANTS

	return (
		<Link
			href={`${Routes.Store.location}/product/${product.id}`}
			onClick={handleCardClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			prefetch={true}
			className={`group relative ${STYLES.CONTAINER} ${STYLES.CONTAINER_HOVER} ${className}`}
		>
			{/* Image Container - Fixed aspect ratio */}
			<div className={STYLES.IMAGE_CONTAINER}>
				{/* Product Image with stock badge overlay */}
				<ProductImage
					product={product}
					priority={priority}
					showStockBadge={product.stock !== undefined}
					size="md"
					hover={true}
					className="h-full w-full"
				/>

				{/* Quick Actions Overlay (appears on hover) */}
				<div className="absolute inset-x-0 bottom-0 flex gap-2 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					{showWishlist && (
						<button
							onClick={handleWishlistToggle}
							className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
								isWishlisted
									? 'bg-primary text-primary-content'
									: 'bg-base-100/90 text-base-content hover:bg-primary hover:text-primary-content'
							}`}
							aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
						>
							<Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
						</button>
					)}
					{showQuickView && (
						<button
							onClick={handleQuickView}
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-100/90 text-base-content backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-content"
							aria-label="Quick view"
						>
							<Eye className="h-5 w-5" />
						</button>
					)}
				</div>
			</div>

			{/* Content Container - Grows to fill space */}
			<div className={STYLES.CONTENT_CONTAINER}>
				{/* Product Name - Fixed 2 lines */}
				<h3 className={STYLES.PRODUCT_NAME} style={DIMENSIONS.PRODUCT_NAME}>
					{product.name || 'Unnamed product'}
				</h3>

				{/* Manufacturer - Fixed 1 line */}
				<p className={`${SPACING.MANUFACTURER_MARGIN} ${STYLES.MANUFACTURER}`} style={DIMENSIONS.MANUFACTURER}>
					{product.manufacturer || 'Manufacturer pending'}
				</p>

				{/* Price - Prominent, fixed height */}
				<div className={`${SPACING.PRICE_MARGIN} ${STYLES.PRICE_CONTAINER}`} style={{ minHeight: DIMENSIONS.PRICE.minHeight }}>
					<span className={STYLES.PRICE} style={{ fontSize: DIMENSIONS.PRICE.fontSize, lineHeight: DIMENSIONS.PRICE.lineHeight }}>
						{formatCurrency(product.price)}
					</span>
				</div>

				{/* Metadata - Organized with Icons, fixed height */}
				<div className={`${SPACING.METADATA_MARGIN} ${STYLES.METADATA_CONTAINER}`} style={{ minHeight: DIMENSIONS.METADATA.minHeight }}>
					<div className={STYLES.METADATA_ITEM}>
						<Package className={`${STYLES.ICON} shrink-0`} strokeWidth={2} />
						<span className="font-medium">SKU:</span>
						<span className="truncate">{product.sku || 'N/A'}</span>
					</div>
					<div className={STYLES.METADATA_ITEM}>
						<Warehouse className={`${STYLES.ICON} shrink-0`} strokeWidth={2} />
						<span className="font-medium">Stock:</span>
						<span className={product.stock === 0 ? 'text-error' : product.stock && product.stock < 10 ? 'text-warning' : ''}>
							{product.stock ?? 0}
						</span>
					</div>
				</div>

				{/* Categories - Elegant hashtag-style tags (single line, no wrap) */}
				{/* Industry best practice: Tags expand fully without truncation, excess tags go to +1 count */}
				{/* Container uses overflow-hidden to prevent tags from going outside card bounds */}
				<div className={`${SPACING.CATEGORY_MARGIN} ${STYLES.CATEGORY_CONTAINER}`} style={DIMENSIONS.CATEGORY}>
					{product.categories.length > 0 ? (
						<div className={STYLES.CATEGORY_TAGS}>
							{product.categories.slice(0, 2).map((cat) => (
								<span
									key={cat.id}
									className={STYLES.CATEGORY_BADGE}
									title={cat.name}
								>
									<span className={STYLES.CATEGORY_BADGE_ICON}>#</span>
									<span className={STYLES.CATEGORY_BADGE_TEXT}>{cat.name}</span>
								</span>
							))}
							{product.categories.length > 2 && (
								<span className={STYLES.CATEGORY_COUNT_BADGE}>
									+{product.categories.length - 2}
								</span>
							)}
						</div>
					) : (
						<span style={{ fontSize: '0.75rem' }} className={STYLES.CATEGORY_EMPTY}>No categories</span>
					)}
				</div>

				{/* Spacer - Pushes button to bottom */}
				<div className={STYLES.SPACER} style={DIMENSIONS.SPACER} />

				{/* Call to Action - Centered, elegant button */}
				<div className={`${SPACING.BUTTON_MARGIN} ${STYLES.BUTTON_CONTAINER}`}>
					<Button
						variant="primary"
						size="md"
						className={STYLES.BUTTON}
						style={DIMENSIONS.BUTTON}
					>
						View Details
					</Button>
				</div>
			</div>
		</Link>
	)
}

