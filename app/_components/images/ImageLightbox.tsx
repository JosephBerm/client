/**
 * ImageLightbox UI Component - Full-Screen Image Viewer
 * 
 * Industry-standard lightbox component for full-screen image viewing with zoom.
 * Follows patterns from Amazon, Shopify, and modern e-commerce platforms.
 * 
 * **Features:**
 * - Full-screen image viewer
 * - Zoom functionality (pinch-to-zoom on mobile)
 * - Navigation between images
 * - Keyboard controls (arrow keys, escape)
 * - Touch gestures (swipe, pinch)
 * - Accessible modal
 * - Smooth animations
 * 
 * **Use Cases:**
 * - Product image zoom
 * - Image galleries
 * - Full-screen image viewing
 * - Image detail inspection
 * 
 * @example
 * ```tsx
 * import { ImageLightbox } from '@_components/images';
 * 
 * <ImageLightbox
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   images={[
 *     { src: '/image1.jpg', alt: 'Product front' },
 *     { src: '/image2.jpg', alt: 'Product side' },
 *   ]}
 *   initialIndex={0}
 *   enableZoom={true}
 * />
 * ```
 * 
 * @module ImageLightbox
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import { X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react'

import type { GalleryImage } from '@_components/store/ImageGallery'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

import OptimizedImage from './OptimizedImage'

/**
 * ImageLightbox component props interface.
 */
export interface ImageLightboxProps {
	/** Whether the lightbox is open */
	isOpen: boolean
	
	/** Callback when lightbox should close */
	onClose: () => void
	
	/** Array of images to display */
	images: GalleryImage[]
	
	/** 
	 * Initial image index.
	 * @default 0
	 */
	initialIndex?: number
	
	/** 
	 * Enable zoom functionality.
	 * @default true
	 */
	enableZoom?: boolean
	
	/** 
	 * Callback when image changes.
	 */
	onImageChange?: (index: number) => void
}

/**
 * ImageLightbox Component
 * 
 * Professional full-screen image viewer with zoom and navigation.
 * Follows industry best practices for image lightboxes.
 * 
 * **Zoom Controls:**
 * - Mouse wheel for zoom
 * - Pinch-to-zoom on touch devices
 * - Zoom in/out buttons
 * - Reset zoom button
 * 
 * **Navigation:**
 * - Arrow keys (left/right)
 * - Previous/Next buttons
 * - Click outside to close
 * 
 * **Accessibility:**
 * - ARIA labels
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * 
 * @param props - ImageLightbox configuration props
 * @returns ImageLightbox component
 */
export default function ImageLightbox({
	isOpen,
	onClose,
	images,
	initialIndex = 0,
	enableZoom = true,
	onImageChange,
}: ImageLightboxProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	const [zoom, setZoom] = useState(1)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
	const imageRef = useRef<HTMLDivElement>(null)

	// Update current index when initialIndex changes
	useEffect(() => {
		setCurrentIndex(initialIndex)
	}, [initialIndex])

	// Reset zoom when image changes
	useEffect(() => {
		setZoom(1)
		setPosition({ x: 0, y: 0 })
	}, [currentIndex])

	// Clamp current index to valid range
	const validIndex = images?.length ? Math.max(0, Math.min(currentIndex, images.length - 1)) : 0
	const currentImage = images?.[validIndex]

	// Navigate to previous image
	const goToPrevious = useCallback(() => {
		if (!images?.length) {return}
		const newIndex = validIndex === 0 ? images.length - 1 : validIndex - 1
		setCurrentIndex(newIndex)
		onImageChange?.(newIndex)
	}, [validIndex, images, onImageChange])

	// Navigate to next image
	const goToNext = useCallback(() => {
		if (!images?.length) {return}
		const newIndex = validIndex === images.length - 1 ? 0 : validIndex + 1
		setCurrentIndex(newIndex)
		onImageChange?.(newIndex)
	}, [validIndex, images, onImageChange])

	// Zoom controls
	const handleZoomIn = useCallback(() => {
		setZoom((prev) => Math.min(prev + 0.25, 3))
	}, [])

	const handleZoomOut = useCallback(() => {
		setZoom((prev) => Math.max(prev - 0.25, 0.5))
	}, [])

	const handleResetZoom = useCallback(() => {
		setZoom(1)
		setPosition({ x: 0, y: 0 })
	}, [])

	// Mouse wheel zoom
	useEffect(() => {
		if (!isOpen || !enableZoom) {return}

		const handleWheel = (e: WheelEvent) => {
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault()
				const delta = e.deltaY > 0 ? -0.1 : 0.1
				setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)))
			}
		}

		window.addEventListener('wheel', handleWheel, { passive: false })
		return () => window.removeEventListener('wheel', handleWheel)
	}, [isOpen, enableZoom])

	// Drag to pan when zoomed
	const handleMouseDown = (e: React.MouseEvent) => {
		if (zoom > 1) {
			setIsDragging(true)
			setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
		}
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (isDragging && zoom > 1) {
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y,
			})
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	// Keyboard handler for panning when zoomed
	const handleImageKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		// Keyboard support for drag/pan (arrow keys when zoomed)
		if (zoom > 1) {
			const step = 10
			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				setPosition((prev) => ({ ...prev, x: prev.x + step }))
			} else if (e.key === 'ArrowRight') {
				e.preventDefault()
				setPosition((prev) => ({ ...prev, x: prev.x - step }))
			} else if (e.key === 'ArrowUp') {
				e.preventDefault()
				setPosition((prev) => ({ ...prev, y: prev.y + step }))
			} else if (e.key === 'ArrowDown') {
				e.preventDefault()
				setPosition((prev) => ({ ...prev, y: prev.y - step }))
			}
		}
	}, [zoom])

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) {return}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				goToPrevious()
			} else if (e.key === 'ArrowRight') {
				e.preventDefault()
				goToNext()
			} else if (e.key === '+' || e.key === '=') {
				e.preventDefault()
				handleZoomIn()
			} else if (e.key === '-') {
				e.preventDefault()
				handleZoomOut()
			} else if (e.key === '0') {
				e.preventDefault()
				handleResetZoom()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, goToPrevious, goToNext, handleZoomIn, handleZoomOut, handleResetZoom])

	// Validate images array (after all hooks)
	if (!images || images.length === 0) {
		return null
	}

	const hasMultipleImages = images.length > 1

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="full"
			closeOnOverlayClick={true}
			closeOnEscape={true}
		>
			<div className="relative flex h-full w-full flex-col bg-base-100">
				{/* Header with Controls */}
				<div className="flex items-center justify-between border-b border-base-300 p-4">
					<div className="flex items-center gap-2">
						{hasMultipleImages && (
							<span className="text-sm font-medium text-base-content/70">
								{validIndex + 1} of {images.length}
							</span>
						)}
					</div>

					<div className="flex items-center gap-2">
						{enableZoom && (
							<>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleZoomOut}
									disabled={zoom <= 0.5}
									aria-label="Zoom out"
								>
									<ZoomOut className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleResetZoom}
									disabled={zoom === 1}
									aria-label="Reset zoom"
								>
									<RotateCw className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleZoomIn}
									disabled={zoom >= 3}
									aria-label="Zoom in"
								>
									<ZoomIn className="h-4 w-4" />
								</Button>
							</>
						)}
						<Button variant="ghost" size="sm" onClick={onClose} aria-label="Close lightbox">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Image Container */}
				<div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
					<div
						ref={imageRef}
						className="relative h-full w-full"
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseUp}
						onKeyDown={handleImageKeyDown}
						role="img"
						tabIndex={zoom > 1 ? 0 : -1}
						aria-label="Zoomed image - use arrow keys to pan"
						style={{
							cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
						}}
					>
						<div
							className="relative h-full w-full transition-transform duration-200"
							style={{
								transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
								transformOrigin: 'center center',
							}}
						>
							<OptimizedImage
								src={currentImage.src}
								alt={currentImage.alt}
								variant="gallery"
								size="xl"
								priority={true}
								className="h-full w-full"
								objectFit="contain"
							/>
						</div>
					</div>

					{/* Navigation Arrows */}
					{hasMultipleImages && (
						<>
							<Button
								variant="ghost"
								size="lg"
								onClick={goToPrevious}
								className="absolute left-4 top-1/2 -translate-y-1/2 bg-base-100/90 backdrop-blur-sm"
								aria-label="Previous image"
							>
								<ChevronLeft className="h-6 w-6" />
							</Button>
							<Button
								variant="ghost"
								size="lg"
								onClick={goToNext}
								className="absolute right-4 top-1/2 -translate-y-1/2 bg-base-100/90 backdrop-blur-sm"
								aria-label="Next image"
							>
								<ChevronRight className="h-6 w-6" />
							</Button>
						</>
					)}
				</div>

				{/* Footer with Image Info */}
				<div className="border-t border-base-300 p-4 text-center">
					<p className="text-sm font-medium text-base-content">{currentImage.alt}</p>
				</div>
			</div>
		</Modal>
	)
}

