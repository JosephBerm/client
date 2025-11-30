/**
 * ProductCard Component - B2B Medical Supply Product Card (Quote-Based Model)
 * 
 * Industry-leading product card design optimized for quote-based B2B e-commerce.
 * Follows best practices from Alibaba B2B, Amazon Business, and modern B2B platforms.
 * 
 * **Key Features:**
 * - Product image with availability indicator
 * - Quote-based model (no prices displayed)
 * - Manufacturer/provider information (when available)
 * - SKU tracking for B2B customers
 * - Clickable category tags for filtering (navigates to /store if not on store page)
 * - Add to cart with quantity selection
 * - Product name links to detail page (only name is clickable, not entire card)
 * - Clean, professional B2B aesthetic
 * - Smooth hover effects and transitions
 * - Accessible and semantic HTML
 * - Responsive design
 * 
 * **Design Principles:**
 * - Visual hierarchy: Image → Name (clickable) → Manufacturer → Metadata → Add to Cart
 * - Only product name is clickable (navigates to detail page)
 * - Category tags are clickable buttons for filtering
 * - Add to cart button with quantity controls
 * - Availability status appropriate for dropshipping model
 * - Professional, clean aesthetics for B2B buyers
 * - Smooth micro-interactions
 * - Mobile-friendly touch targets
 * 
 * **Business Model Alignment:**
 * - Quote-based pricing (no fixed prices)
 * - Dropshipping model (stock may not be real-time)
 * - Availability shown as status, not exact counts
 * - Manufacturer/provider info prioritized
 * 
 * @module ProductCard
 */

'use client'

import { useCallback, useRef, useEffect, useMemo } from 'react'

import Link from 'next/link'

import { Package, Building2, CheckCircle2 } from 'lucide-react'

import { ImagePreloadService, getProductImageUrl } from '@_features/images'
import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { serializeProduct, type SerializedProduct } from '@_lib/serializers/productSerializer'

import { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

import AddToCartButton from '@_components/store/AddToCartButton'
// import ProductImage from '@_components/store/ProductImage' // TEMP: Commented out due to Next.js 15 async Client Component error
import { useCategoryNavigation } from '@_components/store/useCategoryNavigation'



import { PRODUCT_CARD_CONSTANTS } from './ProductCard.constants'


export interface ProductCardProps {
	/** Product data to display */
	product: Product
	
	/** Optional: Custom onClick handler */
	onClick?: (product: Product) => void
	
	/** Optional: Additional CSS classes */
	className?: string
	
	/** Optional: Priority loading for above-the-fold images */
	priority?: boolean
	
	/** Optional: Handler for category filter (used when on /store route) */
	onCategoryFilter?: (category: ProductsCategory) => void
}

/**
 * ProductCard Component
 * 
 * Enhanced product card with industry-leading design patterns.
 * Displays product information in a visually appealing, accessible format.
 * Optimized for quote-based B2B e-commerce model.
 */

export default function ProductCard({
	product,
	onClick,
	className = '',
	priority: _priority = false, // TEMP: Not used in workaround, will be used when ProductImage is restored
	onCategoryFilter,
}: ProductCardProps) {
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const hasPreloadedRef = useRef(false)

	// Category navigation hook
	const handleCategoryClick = useCategoryNavigation({
		onCategoryFilter,
	})

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
	
	// Serialize product for passing to child components (handles both Product class and plain objects)
	const serializedProduct = useMemo(() => {
		// If product is already a plain object (not a class instance), use it directly
		if (!(product instanceof Product)) {
			return product as SerializedProduct
		}
		// Otherwise serialize the Product class instance
		return serializeProduct(product)
	}, [product])

	const { DIMENSIONS, STYLES, SPACING } = PRODUCT_CARD_CONSTANTS

	// Determine manufacturer/provider display (prioritize manufacturer, fallback to provider)
	const manufacturerOrProvider = product.manufacturer ?? product.provider?.name ?? null
	const hasManufacturerInfo = Boolean(manufacturerOrProvider)

	// Determine availability status for dropshipping model
	// In dropshipping, stock counts may not be real-time, so we show availability status
	const isAvailable = product.stock !== undefined && product.stock > 0

	// TEMP FIX: Use simple img tag instead of ProductImage/OptimizedImage
	// TODO: Fix Next.js 15 async Client Component error with OptimizedImage
	// Issue: Next.js Image component with fill prop causes "async Client Component" error in lists
	// Workaround: Use native img tag until OptimizedImage is fixed for Next.js 15
	const imageUrl = serializedProduct.files[0]?.name
		? getProductImageUrl(serializedProduct.id, serializedProduct.files[0].name)
		: null

	return (
		<div
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={`group relative ${STYLES.CONTAINER} ${STYLES.CONTAINER_HOVER} ${className}`}
		>
			{/* Image Container - Fixed aspect ratio */}
			<div className={STYLES.IMAGE_CONTAINER}>
				{/* Product Image - TEMP: Using native img tag due to Next.js 15 async Client Component error */}
				{/* TODO: Restore ProductImage component once OptimizedImage is fixed for Next.js 15 */}
				{/* 
				<ProductImage
					product={serializedProduct}
					priority={priority}
					showStockBadge={false}
					size="md"
					hover={true}
					className="h-full w-full"
				/>
				*/}
				
				{/* TEMP: Native img tag workaround - Next.js Image causes async Client Component error */}
				{imageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={imageUrl}
						alt={product.name || 'Product image'}
						className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-base-200">
						<Package className="h-12 w-12 text-base-content/20" strokeWidth={1.5} aria-hidden="true" />
						<span className="sr-only">{product.name || 'Product image placeholder'}</span>
					</div>
				)}
			</div>

			{/* Content Container - Grows to fill space */}
			<div className={STYLES.CONTENT_CONTAINER}>
				{/* Product Name - Fixed 2 lines, clickable link to details */}
				<Link
					href={Routes.Store.product(product.id)}
					onClick={handleCardClick}
					prefetch={true}
					className="block"
				>
					<h3 className={`${STYLES.PRODUCT_NAME} cursor-pointer`} style={DIMENSIONS.PRODUCT_NAME}>
						{product.name ?? 'Unnamed product'}
					</h3>
				</Link>

				{/* Manufacturer/Provider - Only show if available */}
				{hasManufacturerInfo && (
					<div className={`${SPACING.MANUFACTURER_MARGIN} flex items-center gap-1.5`} style={DIMENSIONS.MANUFACTURER}>
						<Building2 className="h-3.5 w-3.5 shrink-0 text-base-content/50" strokeWidth={2} />
						<p className={`${STYLES.MANUFACTURER} truncate`} title={manufacturerOrProvider ?? undefined}>
							{manufacturerOrProvider}
						</p>
					</div>
				)}

				{/* Availability Status - For dropshipping model, show status not exact count */}
				<div className={`${SPACING.METADATA_MARGIN} flex items-center gap-2`}>
					{isAvailable ? (
						<div className="flex items-center gap-1.5 text-sm">
							<CheckCircle2 className="h-4 w-4 text-success shrink-0" strokeWidth={2} />
							<span className="text-success font-medium">Available</span>
						</div>
					) : (
						<div className="flex items-center gap-1.5 text-sm">
							<Package className="h-4 w-4 text-base-content/50 shrink-0" strokeWidth={2} />
							<span className="text-base-content/60">Check Availability</span>
						</div>
					)}
				</div>

				{/* Metadata - SKU only (essential for B2B) */}
				{product.sku && (
					<div className={`${SPACING.METADATA_MARGIN} ${STYLES.METADATA_CONTAINER}`} style={{ minHeight: DIMENSIONS.METADATA.minHeight }}>
						<div className={STYLES.METADATA_ITEM}>
							<Package className={`${STYLES.ICON} shrink-0`} strokeWidth={2} />
							<span className="font-medium">SKU:</span>
							<span className="truncate font-mono text-xs">{product.sku}</span>
						</div>
					</div>
				)}

				{/* Categories - Elegant hashtag-style tags (single line, no wrap) - Clickable for filtering */}
				{product.categories.length > 0 && (
					<div className={`${SPACING.CATEGORY_MARGIN} ${STYLES.CATEGORY_CONTAINER}`} style={DIMENSIONS.CATEGORY}>
						<div className={STYLES.CATEGORY_TAGS}>
							{product.categories.slice(0, 2).map((cat) => (
								// eslint-disable-next-line no-restricted-syntax
								<button
									key={cat.id}
									type="button"
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										handleCategoryClick(cat)
									}}
									className={`${STYLES.CATEGORY_BADGE} cursor-pointer hover:badge-primary transition-colors`}
									title={`Filter by ${cat.name}`}
									aria-label={`Filter products by ${cat.name} category`}
								>
									<span className={STYLES.CATEGORY_BADGE_ICON}>#</span>
									<span className={STYLES.CATEGORY_BADGE_TEXT}>{cat.name}</span>
								</button>
							))}
							{product.categories.length > 2 && (
								<span className={STYLES.CATEGORY_COUNT_BADGE}>
									+{product.categories.length - 2}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Spacer - Pushes button to bottom */}
				<div className={STYLES.SPACER} style={DIMENSIONS.SPACER} />

				{/* Call to Action - Add to Cart with quantity selection */}
				<div className={`${SPACING.BUTTON_MARGIN} ${STYLES.BUTTON_CONTAINER}`}>
					<AddToCartButton
						product={product}
						defaultQuantity={1}
						size="md"
						className="w-full"
					/>
				</div>
			</div>
		</div>
	)
}

