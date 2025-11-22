/**
 * ProductImageGallery Component - Product Image Display with Gallery and Lightbox
 * 
 * Client-side component for displaying product images with gallery navigation and lightbox zoom.
 * Handles both single and multiple product images with industry-standard UX patterns.
 * 
 * **Features:**
 * - Automatic gallery for multiple images
 * - Single image display with click-to-zoom
 * - Lightbox integration for full-screen viewing
 * - Thumbnail navigation
 * - Touch/swipe support
 * - Keyboard navigation
 * - Accessible
 * 
 * **Use Cases:**
 * - Product detail pages
 * - Product image displays
 * - Product galleries
 * 
 * @example
 * ```tsx
 * import ProductImageGallery from '@_components/store/ProductImageGallery';
 * 
 * <ProductImageGallery 
 *   product={product}
 *   priority={true}
 * />
 * ```
 * 
 * @module ProductImageGallery
 */

'use client'

import { useState, useMemo } from 'react'
import { SerializedProduct, productHasImage } from '@_lib/serializers/productSerializer'
import ProductImage from '@_components/store/ProductImage'
import ImageGallery, { GalleryImage } from '@_components/store/ImageGallery'
import { ImageLightbox, getProductImageUrl } from '@_features/images'

/**
 * ProductImageGallery component props interface.
 */
export interface ProductImageGalleryProps {
	/** Product data (serialized from Server Component) */
	product: SerializedProduct
	
	/** 
	 * Priority loading for above-the-fold images.
	 * @default true
	 */
	priority?: boolean
	
	/** 
	 * Show thumbnail strip (only for multiple images).
	 * @default true
	 */
	showThumbnails?: boolean
	
	/** Additional CSS classes */
	className?: string
}

/**
 * ProductImageGallery Component
 * 
 * Intelligent product image display component that automatically handles:
 * - Single image: Shows ProductImage with click-to-zoom
 * - Multiple images: Shows ImageGallery with thumbnails and lightbox
 * 
 * **Behavior:**
 * - Single image: Click to open lightbox
 * - Multiple images: Gallery with thumbnails, click main image to open lightbox
 * - Lightbox: Full-screen viewing with zoom and navigation
 * 
 * **Industry Standards:**
 * - Amazon: Gallery with thumbnails, click to zoom
 * - Shopify: Similar pattern with lightbox
 * - Best Buy: Gallery navigation with zoom
 * 
 * @param props - ProductImageGallery configuration props
 * @returns ProductImageGallery component
 */
export default function ProductImageGallery({
	product,
	priority = true,
	showThumbnails = true,
	className,
}: ProductImageGalleryProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [lightboxIndex, setLightboxIndex] = useState(0)

	// Convert product files to gallery images
	const galleryImages: GalleryImage[] = useMemo(() => {
		if (!productHasImage(product) || product.files.length === 0) {
			return []
		}

		return product.files
			.filter((file) => file.name !== null)
			.map((file, index) => ({
				src: getProductImageUrl(product.id, file.name!),
				alt: `${product.name || 'Product'} - Image ${index + 1}`,
			}))
	}, [product])

	// Check if we have images
	const hasImages = galleryImages.length > 0
	const hasMultipleImages = galleryImages.length > 1

	// Handle image click to open lightbox
	const handleImageClick = () => {
		if (hasImages) {
			setLightboxIndex(0)
			setLightboxOpen(true)
		}
	}

	// Handle gallery image change
	const handleGalleryImageChange = (index: number) => {
		setLightboxIndex(index)
	}

	// Handle lightbox image change
	const handleLightboxImageChange = (index: number) => {
		setLightboxIndex(index)
	}

	// If no images, show placeholder
	if (!hasImages) {
		return (
			<div className={`relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-base-200 bg-base-200/60 ${className || ''}`}>
				<ProductImage
					product={product}
					priority={priority}
					size="lg"
					hover={false}
					className="h-full w-full"
				/>
			</div>
		)
	}

	// Single image: Use ProductImage with click handler
	if (!hasMultipleImages) {
		return (
			<>
				<div className={`relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-base-200 bg-base-200/60 ${className || ''}`}>
					<ProductImage
						product={product}
						priority={priority}
						size="lg"
						hover={true}
						onImageClick={handleImageClick}
						className="h-full w-full cursor-pointer"
					/>
				</div>

				{/* Lightbox for single image */}
				<ImageLightbox
					isOpen={lightboxOpen}
					onClose={() => setLightboxOpen(false)}
					images={galleryImages}
					initialIndex={lightboxIndex}
					enableZoom={true}
					onImageChange={handleLightboxImageChange}
				/>
			</>
		)
	}

	// Multiple images: Use ImageGallery with lightbox
	return (
		<>
			<div className={className || ''}>
				<ImageGallery
					images={galleryImages}
					initialIndex={0}
					onImageChange={handleGalleryImageChange}
					onImageClick={(index) => {
						setLightboxIndex(index)
						setLightboxOpen(true)
					}}
					variant="full"
					showThumbnails={showThumbnails}
					showArrows={true}
				/>
			</div>

			{/* Lightbox for multiple images */}
			<ImageLightbox
				isOpen={lightboxOpen}
				onClose={() => setLightboxOpen(false)}
				images={galleryImages}
				initialIndex={lightboxIndex}
				enableZoom={true}
				onImageChange={handleLightboxImageChange}
			/>
		</>
	)
}

