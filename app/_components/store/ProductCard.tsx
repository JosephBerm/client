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
import Routes from '@_services/routes'
import { ImagePreloadService } from '@_services/ImagePreloadService'

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
				if (process.env.NODE_ENV === 'development') {
					console.error('[ProductCard] Navigation preload failed', { productId: product.id, error })
				}
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

	return (
		<Link
			href={`${Routes.Store.location}/product/${product.id}`}
			onClick={handleCardClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			prefetch={true}
			className={`group relative flex flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl ${className}`}
		>
			{/* Image Container - Fixed aspect ratio */}
			<div className="relative aspect-square w-full shrink-0 overflow-hidden bg-base-200">
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
			<div className="flex flex-1 flex-col p-4 sm:p-5">
				{/* Product Name - Fixed 2 lines */}
				<h3 className="line-clamp-2 leading-tight transition-colors group-hover:text-primary" style={{ fontSize: '1.125rem', fontWeight: 600, minHeight: '2.25rem', lineHeight: 1.25 }}>
					{product.name || 'Unnamed product'}
				</h3>

				{/* Manufacturer - Fixed 1 line */}
				<p className="mt-2 line-clamp-1 text-base-content/70" style={{ fontSize: '0.875rem', minHeight: '1.25rem', lineHeight: 1.43 }}>
					{product.manufacturer || 'Manufacturer pending'}
				</p>

				{/* Price - Prominent, fixed height */}
				<div className="mt-3 flex items-baseline gap-2" style={{ minHeight: '2.25rem' }}>
					<span className="font-bold text-primary" style={{ fontSize: '1.875rem', lineHeight: 1.2 }}>
						{formatCurrency(product.price)}
					</span>
				</div>

				{/* Metadata - Organized with Icons, fixed height */}
				<div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-base-content/60" style={{ fontSize: '0.875rem', minHeight: '1.25rem' }}>
					<div className="flex items-center gap-1 whitespace-nowrap">
						<Package className="h-4 w-4 shrink-0" strokeWidth={2} />
						<span className="font-medium">SKU:</span>
						<span className="truncate">{product.sku || 'N/A'}</span>
					</div>
					<div className="flex items-center gap-1 whitespace-nowrap">
						<Warehouse className="h-4 w-4 shrink-0" strokeWidth={2} />
						<span className="font-medium">Stock:</span>
						<span className={product.stock === 0 ? 'text-error' : product.stock && product.stock < 10 ? 'text-warning' : ''}>
							{product.stock ?? 0}
						</span>
					</div>
				</div>

				{/* Categories - Elegant hashtag-style tags (single line, no wrap) */}
				{/* Industry best practice: Tags expand fully without truncation, excess tags go to +1 count */}
				{/* Container uses overflow-hidden to prevent tags from going outside card bounds */}
				<div className="mt-3 overflow-hidden" style={{ minHeight: '1.5rem' }}>
					{product.categories.length > 0 ? (
						<div className="flex items-center gap-2 min-w-0">
							{product.categories.slice(0, 2).map((cat) => (
								<span
									key={cat.id}
									className="badge badge-secondary badge-outline inline-flex items-center gap-1 whitespace-nowrap shrink min-w-0"
									title={cat.name}
								>
									<span className="text-[0.65rem] opacity-70 shrink-0">#</span>
									<span className="truncate">{cat.name}</span>
								</span>
							))}
							{product.categories.length > 2 && (
								<span className="badge badge-neutral badge-sm shrink-0">
									+{product.categories.length - 2}
								</span>
							)}
						</div>
					) : (
						<span style={{ fontSize: '0.75rem' }} className="text-base-content/40">No categories</span>
					)}
				</div>

				{/* Spacer - Pushes button to bottom */}
				<div className="flex-1" style={{ minHeight: '0.5rem' }} />

				{/* Call to Action - Centered, elegant button */}
				<div className="mt-4 flex justify-center">
					<Button
						variant="primary"
						size="md"
						className="w-full transition-transform group-hover:scale-[1.02]"
						style={{ fontSize: '0.875rem', padding: '0.625rem 1rem', minHeight: '2.5rem' }}
					>
						View Details
					</Button>
				</div>
			</div>
		</Link>
	)
}

