/**
 * ProgressiveProductCard Component
 * 
 * MAANG-level product card that renders immediately with skeleton state
 * and progressively fills in content as data becomes available.
 * 
 * **Key Behavior (Solves Fast-Scroll Rendering Gap):**
 * 1. Card structure renders IMMEDIATELY (no animation delays)
 * 2. Image shows shimmer until loaded
 * 3. Text content fills in progressively
 * 4. No blocking - cards below don't wait for cards above
 * 
 * **Industry Patterns (Instagram/Pinterest/Amazon):**
 * - Skeleton-first rendering for instant visual feedback
 * - Progressive enhancement as data arrives
 * - Image placeholder with shimmer effect
 * - Stable layout dimensions prevent CLS
 * 
 * **When to Use:**
 * - VirtualizedProductGrid for instant skeleton rendering
 * - Fast scroll scenarios where immediate feedback matters
 * - Large product lists where blocking is unacceptable
 * 
 * @module components/store/ProgressiveProductCard
 */

'use client'

import { useMemo, useEffect } from 'react'

import Link from 'next/link'

import { Building2, CheckCircle2, Package } from 'lucide-react'

import { Routes } from '@_features/navigation'
import { ProductCache, PRIORITY_IMAGE_COUNT } from '@_features/store'

import { serializeProduct, type SerializedProduct } from '@_lib/serializers/productSerializer'

import { Product } from '@_classes/Product'
import type ProductsCategory from '@_classes/ProductsCategory'

import AddToCartButton from '@_components/store/AddToCartButton'
import ProductImage from '@_components/store/ProductImage'
import { useCategoryNavigation } from '@_components/store/useCategoryNavigation'
import Button from '@_components/ui/Button'

import { PRODUCT_CARD_CONSTANTS } from './ProductCard.constants'

export interface ProgressiveProductCardProps {
	/** Product data to display */
	product: Product
	
	/** Index in the list (for priority loading) */
	index: number
	
	/** Number of images to load with priority */
	priorityImageCount?: number
	
	/** Handler for category filter */
	onCategoryFilter?: (category: ProductsCategory) => void
	
	/** Optional: Additional CSS classes */
	className?: string
}

/**
 * ProgressiveProductCard Component
 * 
 * Renders immediately with stable layout, progressively fills content.
 * No animation delays that block rendering of subsequent cards.
 */
export default function ProgressiveProductCard({
	product,
	index,
	priorityImageCount = PRIORITY_IMAGE_COUNT,
	onCategoryFilter,
	className = '',
}: ProgressiveProductCardProps) {
	// Category navigation hook
	const handleCategoryClick = useCategoryNavigation({
		onCategoryFilter,
	})
	
	// Cache product for fast lookup on re-scroll
	// Using useEffect for side effect (caching) - not useMemo
	useEffect(() => {
		ProductCache.setProduct(product)
	}, [product])
	
	// Serialize product for child components
	const serializedProduct = useMemo(() => {
		if (!(product instanceof Product)) {
			return product as SerializedProduct
		}
		return serializeProduct(product)
	}, [product])
	
	const { DIMENSIONS, STYLES, SPACING } = PRODUCT_CARD_CONSTANTS
	
	// Determine display values
	const manufacturerOrProvider = product.manufacturer ?? product.provider?.name ?? null
	const hasManufacturerInfo = Boolean(manufacturerOrProvider)
	const isAvailable = product.stock !== undefined && product.stock > 0
	const isPriority = index < priorityImageCount
	
	return (
		<div
			data-testid="product-card"
			className={`${STYLES.CONTAINER} ${STYLES.CONTAINER_HOVER} ${className}`}
		>
			{/* Image Container - ProductImage handles its own loading states */}
			<div className={STYLES.IMAGE_CONTAINER}>
				<ProductImage
					product={serializedProduct}
					priority={isPriority}
					showStockBadge={false}
					size="md"
					hover={true}
					className="h-full w-full"
				/>
			</div>

			{/* Content Container */}
			<div className={STYLES.CONTENT_CONTAINER}>
				{/* Product Name - Always visible, no skeleton */}
				<Link
					href={Routes.Store.product(product.id)}
					prefetch={true}
					className="block"
				>
					<h3
						className={`${STYLES.PRODUCT_NAME} cursor-pointer`}
						style={DIMENSIONS.PRODUCT_NAME}
					>
						{product.name ?? 'Unnamed product'}
					</h3>
				</Link>

				{/* Availability Status */}
				<div className={`${SPACING.METADATA_MARGIN} flex items-center gap-2`}>
					{isAvailable ? (
						<div className="flex items-center gap-1.5 text-sm">
							<CheckCircle2
								className="h-4 w-4 text-success shrink-0"
								strokeWidth={2}
							/>
							<span className="text-success font-medium">Available</span>
						</div>
					) : (
						<div className="flex items-center gap-1.5 text-sm">
							<Package
								className="h-4 w-4 text-base-content/50 shrink-0"
								strokeWidth={2}
							/>
							<span className="text-base-content/60">Check Availability</span>
						</div>
					)}
				</div>

				{/* Metadata - Manufacturer and SKU */}
				{(hasManufacturerInfo || product.sku) && (
					<div
						className={`${SPACING.METADATA_MARGIN} ${STYLES.METADATA_CONTAINER}`}
						style={{ minHeight: DIMENSIONS.METADATA.minHeight }}
					>
						{hasManufacturerInfo && (
							<div className={STYLES.METADATA_ITEM}>
								<Building2
									className={`${STYLES.ICON} shrink-0`}
									strokeWidth={2}
								/>
								<span className="font-medium">Manufacturer:</span>
								<span className="truncate">{manufacturerOrProvider}</span>
							</div>
						)}

						{product.sku && (
							<div className={STYLES.METADATA_ITEM}>
								<Package
									className={`${STYLES.ICON} shrink-0`}
									strokeWidth={2}
								/>
								<span className="font-medium">SKU:</span>
								<span className="truncate font-mono text-xs">{product.sku}</span>
							</div>
						)}
					</div>
				)}

				{/* Categories */}
				{product.categories.length > 0 && (
					<div
						className={`${SPACING.CATEGORY_MARGIN} ${STYLES.CATEGORY_CONTAINER}`}
						style={DIMENSIONS.CATEGORY}
					>
						<div className={STYLES.CATEGORY_TAGS}>
							{product.categories.slice(0, 2).map((cat) => (
								<Button
									key={cat.id}
									type="button"
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										handleCategoryClick(cat)
									}}
									variant="outline"
									size="xs"
									className={`${STYLES.CATEGORY_BADGE} cursor-pointer hover:badge-primary transition-colors p-0 h-auto`}
									title={`Filter by ${cat.name}`}
									aria-label={`Filter products by ${cat.name} category`}
									contentDrivenHeight
								>
									<span className={STYLES.CATEGORY_BADGE_ICON}>#</span>
									<span className={STYLES.CATEGORY_BADGE_TEXT}>{cat.name}</span>
								</Button>
							))}
							{product.categories.length > 2 && (
								<span className={STYLES.CATEGORY_COUNT_BADGE}>
									+{product.categories.length - 2}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Spacer */}
				<div className={STYLES.SPACER} style={DIMENSIONS.SPACER} />

				{/* Add to Cart Button */}
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
