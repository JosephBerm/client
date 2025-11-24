/**
 * ImageGallery Component - Multiple Product Images with Thumbnails
 * 
 * Industry-standard image gallery component for displaying multiple product images.
 * Features thumbnail navigation, smooth transitions, and touch/swipe support.
 * 
 * **Features:**
 * - Multiple image support
 * - Thumbnail strip navigation
 * - Smooth transitions
 * - Touch/swipe gestures (mobile) - 50px threshold, velocity-based
 * - Keyboard navigation (arrow keys)
 * - Click to zoom (lightbox integration)
 * - Accessible (ARIA labels, keyboard support)
 * - Responsive design
 * 
 * **Use Cases:**
 * - Product detail pages
 * - Image carousels
 * - Product galleries
 * - Multi-image displays
 * 
 * @example
 * ```tsx
 * import ImageGallery from '@_components/store/ImageGallery';
 * 
 * const images = [
 *   { src: '/image1.jpg', alt: 'Product front view' },
 *   { src: '/image2.jpg', alt: 'Product side view' },
 *   { src: '/image3.jpg', alt: 'Product detail' },
 * ];
 * 
 * <ImageGallery 
 *   images={images}
 *   initialIndex={0}
 *   showThumbnails={true}
 * />
 * ```
 * 
 * @module ImageGallery
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { OptimizedImage } from '@_components/images'
import Button from '@_components/ui/Button'

/**
 * Image data structure for gallery.
 */
export interface GalleryImage {
	/** Image source URL */
	src: string | null
	/** Accessibility alt text */
	alt: string
}

/**
 * ImageGallery component props interface.
 */
export interface ImageGalleryProps {
	/** Array of images to display */
	images: GalleryImage[]
	
	/** 
	 * Initial image index.
	 * @default 0
	 */
	initialIndex?: number
	
	/** 
	 * Callback when image changes.
	 */
	onImageChange?: (index: number) => void
	
	/** 
	 * Gallery variant.
	 * @default 'full'
	 */
	variant?: 'full' | 'compact'
	
	/** 
	 * Show thumbnail strip.
	 * @default true
	 */
	showThumbnails?: boolean
	
	/** 
	 * Show navigation arrows.
	 * @default true
	 */
	showArrows?: boolean
	
	/** Additional CSS classes */
	className?: string
	
	/** 
	 * Callback when main image is clicked.
	 */
	onImageClick?: (index: number) => void
}

/**
 * ImageGallery Component
 * 
 * Professional image gallery with thumbnail navigation.
 * Follows e-commerce best practices (Amazon, Shopify patterns).
 * 
 * **Navigation:**
 * - Arrow keys for keyboard navigation
 * - Click thumbnails to jump to image
 * - Previous/Next buttons (hover to reveal)
 * - Touch swipe gestures (mobile) - Swipe left/right to navigate
 * - Click main image to open lightbox (if onImageClick provided)
 * 
 * **Accessibility:**
 * - ARIA labels
 * - Keyboard navigation
 * - Screen reader support
 * 
 * @param props - ImageGallery configuration props
 * @returns ImageGallery component
 */
export default function ImageGallery({
	images,
	initialIndex = 0,
	onImageChange,
	variant = 'full',
	showThumbnails = true,
	showArrows = true,
	className,
	onImageClick,
}: ImageGalleryProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	
	// Touch gesture state
	const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
	const touchMoveRef = useRef<{ x: number; y: number } | null>(null)
	const imageContainerRef = useRef<HTMLDivElement>(null)
	
	// Swipe threshold (50px - Amazon/Shopify standard)
	const SWIPE_THRESHOLD = 50
	// Minimum swipe velocity (pixels per millisecond)
	const MIN_SWIPE_VELOCITY = 0.1

	// Calculate if we have multiple images (needed for touch handlers)
	const hasMultipleImages = images && images.length > 1

	// Update current index when initialIndex changes
	useEffect(() => {
		setCurrentIndex(initialIndex)
	}, [initialIndex])

	// Clamp current index to valid range (use safe defaults)
	const validIndex = images && images.length > 0 
		? Math.max(0, Math.min(currentIndex, images.length - 1))
		: 0
	const currentImage = images && images.length > 0 ? images[validIndex] : null

	// Navigate to previous image
	const goToPrevious = useCallback(() => {
		if (!images || images.length === 0) {return}
		const newIndex = validIndex === 0 ? images.length - 1 : validIndex - 1
		setCurrentIndex(newIndex)
		onImageChange?.(newIndex)
	}, [validIndex, images, onImageChange])

	// Navigate to next image
	const goToNext = useCallback(() => {
		if (!images || images.length === 0) {return}
		const newIndex = validIndex === images.length - 1 ? 0 : validIndex + 1
		setCurrentIndex(newIndex)
		onImageChange?.(newIndex)
	}, [validIndex, images, onImageChange])

	// Navigate to specific image
	const goToImage = useCallback(
		(index: number) => {
			if (!images || images.length === 0) {return}
			if (index >= 0 && index < images.length) {
				setCurrentIndex(index)
				onImageChange?.(index)
			}
		},
		[images, onImageChange]
	)

	// Touch gesture handlers
	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		if (!hasMultipleImages) {return}
		
		const touch = e.touches[0]
		touchStartRef.current = {
			x: touch.clientX,
			y: touch.clientY,
			time: Date.now(),
		}
		touchMoveRef.current = null
	}, [hasMultipleImages])

	const handleTouchMove = useCallback((e: React.TouchEvent) => {
		if (!hasMultipleImages || !touchStartRef.current) {return}
		
		const touch = e.touches[0]
		touchMoveRef.current = {
			x: touch.clientX,
			y: touch.clientY,
		}
		
		// Prevent vertical scroll if horizontal swipe is detected
		if (touchStartRef.current && touchMoveRef.current) {
			const deltaX = Math.abs(touchMoveRef.current.x - touchStartRef.current.x)
			const deltaY = Math.abs(touchMoveRef.current.y - touchStartRef.current.y)
			
			// If horizontal movement is greater than vertical, prevent scroll
			if (deltaX > deltaY && deltaX > 10) {
				e.preventDefault()
			}
		}
	}, [hasMultipleImages])

	const handleTouchEnd = useCallback((e: React.TouchEvent) => {
		if (!hasMultipleImages || !touchStartRef.current || !touchMoveRef.current) {
			touchStartRef.current = null
			touchMoveRef.current = null
			return
		}
		
		const touch = e.changedTouches[0]
		const deltaX = touch.clientX - touchStartRef.current.x
		const deltaY = touch.clientY - touchStartRef.current.y
		const deltaTime = Date.now() - touchStartRef.current.time
		
		// Calculate swipe distance and velocity
		const absDeltaX = Math.abs(deltaX)
		const absDeltaY = Math.abs(deltaY)
		const velocity = absDeltaX / deltaTime
		
		// Determine if this is a horizontal swipe
		// Horizontal swipe: deltaX > deltaY AND deltaX > threshold
		const isHorizontalSwipe = absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD
		
		// Check velocity for quick swipes
		const isQuickSwipe = velocity > MIN_SWIPE_VELOCITY && absDeltaX > 30
		
		if (isHorizontalSwipe || isQuickSwipe) {
			// Swipe left (next image)
			if (deltaX < 0) {
				goToNext()
			}
			// Swipe right (previous image)
			else if (deltaX > 0) {
				goToPrevious()
			}
		}
		
		// Reset touch state
		touchStartRef.current = null
		touchMoveRef.current = null
	}, [hasMultipleImages, goToNext, goToPrevious])

	// Keyboard navigation
	useEffect(() => {
		if (!images || images.length === 0) {return}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				goToPrevious()
			} else if (e.key === 'ArrowRight') {
				e.preventDefault()
				goToNext()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [goToPrevious, goToNext, images])

	// Validate images array (after hooks)
	if (!images || images.length === 0 || !currentImage) {
		return null
	}

	return (
		<div className={`flex flex-col gap-4 ${className || ''}`}>
			{/* Main Image Container */}
			<div 
				ref={imageContainerRef}
				className={`relative group ${onImageClick ? 'cursor-pointer' : ''} touch-pan-y`}
				onClick={() => onImageClick?.(validIndex)}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				role={onImageClick ? 'button' : undefined}
				tabIndex={onImageClick ? 0 : undefined}
				onKeyDown={
					onImageClick
						? (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault()
									onImageClick(validIndex)
								}
						  }
						: undefined
				}
			>
				<OptimizedImage
					src={currentImage.src}
					alt={currentImage.alt}
					variant="gallery"
					size={variant === 'compact' ? 'md' : 'lg'}
					priority={validIndex === 0}
					className="rounded-lg"
				/>

				{/* Navigation Arrows */}
				{hasMultipleImages && showArrows && (
					<>
						<Button
							variant="ghost"
							size="sm"
							onClick={goToPrevious}
							className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-base-100/90 backdrop-blur-sm"
							aria-label="Previous image"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={goToNext}
							className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-base-100/90 backdrop-blur-sm"
							aria-label="Next image"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</>
				)}

				{/* Image Counter */}
				{hasMultipleImages && (
					<div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
						{validIndex + 1} / {images.length}
					</div>
				)}
			</div>

			{/* Thumbnail Strip */}
			{hasMultipleImages && showThumbnails && (
				<div className="flex gap-2 overflow-x-auto pb-2">
					{images.map((image, index) => (
						<button
							key={index}
							onClick={() => goToImage(index)}
							className={`relative shrink-0 overflow-hidden rounded-md border-2 transition-all ${
								index === validIndex
									? 'border-primary shadow-md'
									: 'border-base-300 hover:border-primary/50'
							}`}
							aria-label={`View image ${index + 1}: ${image.alt}`}
							aria-current={index === validIndex ? 'true' : undefined}
						>
							<OptimizedImage
								src={image.src}
								alt={image.alt}
								variant="thumbnail"
								size="sm"
								className="h-20 w-20"
							/>
							{index === validIndex && (
								<div className="absolute inset-0 bg-primary/20" aria-hidden="true" />
							)}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

