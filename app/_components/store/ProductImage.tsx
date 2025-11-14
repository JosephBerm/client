/**
 * ProductImage Component - Specialized Product Image Display
 * 
 * Specialized component for displaying product images with product-specific features.
 * Integrates seamlessly with Product class and provides enhanced functionality.
 * 
 * **Features:**
 * - Automatic integration with Product class
 * - Stock status overlay support
 * - Hover effects
 * - Click handlers
 * - Multiple image support (ready for gallery)
 * - Error handling with fallback
 * - Priority loading support
 * 
 * **Use Cases:**
 * - ProductCard images
 * - Product detail page images
 * - Product listings
 * - Product search results
 * 
 * @example
 * ```tsx
 * import ProductImage from '@_components/store/ProductImage';
 * 
 * // Basic usage
 * <ProductImage product={product} />
 * 
 * // With stock badge
 * <ProductImage 
 *   product={product} 
 *   showStockBadge={true}
 *   priority={true}
 * />
 * 
 * // With click handler
 * <ProductImage 
 *   product={product}
 *   onImageClick={() => router.push(`/product/${product.id}`)}
 * />
 * ```
 * 
 * @module ProductImage
 */

'use client'

import { useState, useEffect } from 'react'
import { Product } from '@_classes/Product'
import { OptimizedImage, ImagePlaceholder, getProductImageUrl, useImageError, useImageAnalytics } from '@_features/images'
import Badge from '@_components/ui/Badge'
import { getStockStatus } from '@_features/products'
import { logger } from '@_core'

/**
 * ProductImage component props interface.
 */
export interface ProductImageProps {
	/** Product data */
	product: Product
	
	/** 
	 * Priority loading for above-the-fold images.
	 * @default false
	 */
	priority?: boolean
	
	/** 
	 * Show stock status badge overlay.
	 * @default false
	 */
	showStockBadge?: boolean
	
	/** 
	 * Callback when image is clicked.
	 */
	onImageClick?: () => void
	
	/** 
	 * Image size preset.
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg' | 'xl'
	
	/** Additional CSS classes */
	className?: string
	
	/** 
	 * Enable hover effects.
	 * @default true
	 */
	hover?: boolean
}

/**
 * ProductImage Component
 * 
 * Specialized component for product images with product-specific features.
 * Automatically handles image URL construction, error states, and fallbacks.
 * 
 * **Integration:**
 * - Works seamlessly with Product class
 * - Uses OptimizedImage for rendering
 * - Uses ImagePlaceholder for fallbacks
 * 
 * **Features:**
 * - Automatic image URL construction
 * - Stock status overlay
 * - Hover effects
 * - Click handlers
 * - Error recovery
 * 
 * @param props - ProductImage configuration props
 * @returns ProductImage component
 */
export default function ProductImage({
	product,
	priority = false,
	showStockBadge = false,
	onImageClick,
	size = 'md',
	className,
	hover = true,
}: ProductImageProps) {
	// Check if product has image
	const hasImage = product.hasImage() && product.files.length > 0

	// Get initial image URL
	const initialImageUrl = hasImage && product.files[0]?.name
		? getProductImageUrl(product.id, product.files[0].name)
		: null

	// Advanced error recovery (FAANG best practice: retry with exponential backoff)
	// For product images, use 'placeholder' strategy - show placeholder after retries fail
	const {
		currentUrl,
		hasError,
	} = useImageError(initialImageUrl, {
		strategy: 'placeholder',
		maxRetries: 2, // Fewer retries for product images to avoid delays
		retryDelay: 500,
		logErrors: process.env.NODE_ENV === 'development',
	})

	// Performance analytics tracking (FAANG best practice: track product image performance)
	const { trackLoadStart, trackLoad, trackError, trackInteraction } = useImageAnalytics({
		enabled: true,
		logMetrics: process.env.NODE_ENV === 'development',
		sampleRate: 0.1, // Sample 10% of product images to reduce overhead
	})

	// Track load start when URL changes
	useEffect(() => {
		if (currentUrl) {
			trackLoadStart(currentUrl)
		}
	}, [currentUrl, trackLoadStart])

	// Get stock status
	const stockStatus = product.stock !== undefined ? getStockStatus(product.stock) : null

	// Handle image error with analytics
	const handleError = () => {
		if (currentUrl) {
			trackError(currentUrl, new Error('Product image load failed'))
		}
		if (process.env.NODE_ENV === 'development') {
			logger.error('ProductImage: Image load error', {
				productId: product.id,
				productName: product.name,
				imageUrl: currentUrl,
			})
		}
	}

	// Handle image load with analytics
	const handleLoad = () => {
		if (currentUrl) {
			trackLoad(currentUrl, true)
		}
		if (process.env.NODE_ENV === 'development') {
			logger.debug('ProductImage: Image loaded', {
				productId: product.id,
				productName: product.name,
			})
		}
	}

	// Track click interactions (FAANG best practice: track user engagement)
	const handleImageClickWithTracking = () => {
		if (currentUrl) {
			trackInteraction('click', currentUrl, {
				productId: product.id,
				productName: product.name,
			})
		}
		onImageClick?.()
	}

	return (
		<div
			className={`relative ${className || ''}`}
			onClick={handleImageClickWithTracking}
			role={onImageClick ? 'button' : undefined}
			tabIndex={onImageClick ? 0 : undefined}
			onKeyDown={
				onImageClick
					? (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								handleImageClickWithTracking()
							}
					  }
					: undefined
			}
		>
			{currentUrl && !hasError ? (
				<OptimizedImage
					src={currentUrl}
					alt={product.name || 'Product image'}
					variant="product"
					size={size}
					priority={priority}
					onLoad={handleLoad}
					onError={handleError}
					className={hover ? 'transition-transform duration-300 group-hover:scale-105' : ''}
				/>
			) : (
				<ImagePlaceholder
					variant="product"
					alt={product.name || 'Product image placeholder'}
					iconSize={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
				/>
			)}

			{/* Stock Status Badge Overlay */}
			{showStockBadge && stockStatus && (
				<div className="absolute top-3 right-3 shadow-md">
					<Badge
						variant={stockStatus.variant}
						tone={stockStatus.tone}
						size={stockStatus.size}
						className="shadow-sm"
					>
						{stockStatus.label}
					</Badge>
				</div>
			)}
		</div>
	)
}


