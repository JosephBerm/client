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
 * - Visual hierarchy: Image → Name (clickable) → Availability → Manufacturer/SKU → Categories → Add to Cart
 * - Only product name is clickable (navigates to detail page)
 * - Category tags are clickable buttons for filtering
 * - Add to cart button with quantity controls
 * - Availability status appropriate for dropshipping model
 * - Manufacturer displayed above SKU in metadata section
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

import { Building2, CheckCircle2, Package } from 'lucide-react'

import { ImagePreloadService } from '@_features/images'
import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { serializeProduct, type SerializedProduct } from '@_lib/serializers/productSerializer'

import { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

import AddToCartButton from '@_components/store/AddToCartButton'
import ProductImage from '@_components/store/ProductImage'
import { useCategoryNavigation } from '@_components/store/useCategoryNavigation'
import Button from '@_components/ui/Button'

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
	priority = false,
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

	return (
		<div
			data-testid='product-card'
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={`group relative ${STYLES.CONTAINER} ${STYLES.CONTAINER_HOVER} ${className}`}>
			{/* Image Container - Fixed aspect ratio */}
			<div className={STYLES.IMAGE_CONTAINER}>
				{/*
				 * ProductImage Component - RESTORED
				 *
				 * FIX APPLIED: The root cause of the Next.js 15 "async Client Component" error
				 * was in ImagePlaceholder.tsx where getIcon() was incorrectly marked as async.
				 * This made it return a Promise instead of a ReactNode, triggering the error.
				 *
				 * Now ProductImage → OptimizedImage → ImagePlaceholder all work correctly.
				 */}
				<ProductImage
					product={serializedProduct}
					priority={priority}
					showStockBadge={false}
					size='md'
					hover={true}
					className='h-full w-full'
				/>
			</div>

			{/* Content Container - Grows to fill space */}
			<div className={STYLES.CONTENT_CONTAINER}>
				{/* Product Name - Fixed 2 lines, clickable link to details */}
				<Link
					href={Routes.Store.product(product.id)}
					onClick={handleCardClick}
					prefetch={true}
					className='block'>
					<h3
						className={`${STYLES.PRODUCT_NAME} cursor-pointer`}
						style={DIMENSIONS.PRODUCT_NAME}>
						{product.name ?? 'Unnamed product'}
					</h3>
				</Link>

				{/* Availability Status - For dropshipping model, show status not exact count */}
				<div className={`${SPACING.METADATA_MARGIN} flex items-center gap-2`}>
					{isAvailable ? (
						<div className='flex items-center gap-1.5 text-sm'>
							<CheckCircle2
								className='h-4 w-4 text-success shrink-0'
								strokeWidth={2}
							/>
							<span className='text-success font-medium'>Available</span>
						</div>
					) : (
						<div className='flex items-center gap-1.5 text-sm'>
							<Package
								className='h-4 w-4 text-base-content/50 shrink-0'
								strokeWidth={2}
							/>
							<span className='text-base-content/60'>Check Availability</span>
						</div>
					)}
				</div>

				{/* Metadata - Manufacturer and SKU (essential for B2B) */}
				{(hasManufacturerInfo || product.sku) && (
					<div
						className={`${SPACING.METADATA_MARGIN} ${STYLES.METADATA_CONTAINER}`}
						style={{ minHeight: DIMENSIONS.METADATA.minHeight }}>
						{/* Manufacturer - Display above SKU */}
						{hasManufacturerInfo && (
							<div className={STYLES.METADATA_ITEM}>
								<Building2
									className={`${STYLES.ICON} shrink-0`}
									strokeWidth={2}
								/>
								<span className='font-medium'>Manufacturer:</span>
								<span className='truncate'>{manufacturerOrProvider}</span>
							</div>
						)}

						{/* SKU - Display below manufacturer */}
						{product.sku && (
							<div className={STYLES.METADATA_ITEM}>
								<Package
									className={`${STYLES.ICON} shrink-0`}
									strokeWidth={2}
								/>
								<span className='font-medium'>SKU:</span>
								<span className='truncate font-mono text-xs'>{product.sku}</span>
							</div>
						)}
					</div>
				)}

				{/* Categories - Elegant hashtag-style tags (single line, no wrap) - Clickable for filtering */}
				{product.categories.length > 0 && (
					<div
						className={`${SPACING.CATEGORY_MARGIN} ${STYLES.CATEGORY_CONTAINER}`}
						style={DIMENSIONS.CATEGORY}>
						<div className={STYLES.CATEGORY_TAGS}>
							{product.categories.slice(0, 2).map((cat) => (
								<Button
									key={cat.id}
									type='button'
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										handleCategoryClick(cat)
									}}
									variant='outline'
									size='xs'
									className={`${STYLES.CATEGORY_BADGE} cursor-pointer hover:badge-primary transition-colors p-0 h-auto`}
									title={`Filter by ${cat.name}`}
									aria-label={`Filter products by ${cat.name} category`}
									contentDrivenHeight>
									<span className={STYLES.CATEGORY_BADGE_ICON}>#</span>
									<span className={STYLES.CATEGORY_BADGE_TEXT}>{cat.name}</span>
								</Button>
							))}
							{product.categories.length > 2 && (
								<span className={STYLES.CATEGORY_COUNT_BADGE}>+{product.categories.length - 2}</span>
							)}
						</div>
					</div>
				)}

				{/* Spacer - Pushes button to bottom */}
				<div
					className={STYLES.SPACER}
					style={DIMENSIONS.SPACER}
				/>

				{/* Call to Action - Add to Cart with quantity selection */}
				<div className={`${SPACING.BUTTON_MARGIN} ${STYLES.BUTTON_CONTAINER}`}>
					<AddToCartButton
						product={product}
						defaultQuantity={1}
						size='md'
						className='w-full'
					/>
				</div>
			</div>
		</div>
	)
}
