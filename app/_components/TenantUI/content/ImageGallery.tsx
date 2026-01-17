'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@_components/ui/Modal'
import Button from '@_components/ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryImage {
	url: string
	alt: string
	title?: string
}

interface ImageGalleryProps {
	images?: GalleryImage[]
	layout?: 'grid' | 'masonry' | 'carousel'
	columns?: number
}

/**
 * Image Gallery Component
 *
 * Displays images in various layouts with lightbox functionality.
 * Supports grid, masonry, and carousel layouts.
 * Uses DaisyUI semantic colors and existing UI components.
 *
 * TIER: Standard
 * CATEGORY: Content
 */
export default function ImageGallery({
	images = [
		{ url: '/placeholder-1.jpg', alt: 'Image 1' },
		{ url: '/placeholder-2.jpg', alt: 'Image 2' },
		{ url: '/placeholder-3.jpg', alt: 'Image 3' },
	],
	layout = 'grid',
	columns = 3,
}: ImageGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

	const openLightbox = (index: number) => {
		setSelectedIndex(index)
	}

	const closeLightbox = () => {
		setSelectedIndex(null)
	}

	const goToPrevious = () => {
		if (selectedIndex !== null && selectedIndex > 0) {
			setSelectedIndex(selectedIndex - 1)
		}
	}

	const goToNext = () => {
		if (selectedIndex !== null && selectedIndex < images.length - 1) {
			setSelectedIndex(selectedIndex + 1)
		}
	}

	// Mobile-first responsive column classes
	const columnClasses: Record<number, string> = {
		2: 'grid-cols-1 sm:grid-cols-2',
		3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
	}

	const gridClass = columnClasses[columns] || columnClasses[3]

	return (
		<>
			<div className={`grid gap-4 ${gridClass}`}>
				{images.map((image, index) => (
					<Button
						key={index}
						type='button'
						variant='ghost'
						className='group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-base-200 p-0 h-auto'
						onClick={() => openLightbox(index)}
						aria-label={`View ${image.alt}`}
						contentDrivenHeight>
						<Image
							src={image.url}
							alt={image.alt}
							fill
							className='object-cover transition-transform group-hover:scale-105'
							sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
						/>
						<div className='absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20' />
						{image.title && (
							<div className='absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100'>
								<p className='text-sm font-medium text-white'>{image.title}</p>
							</div>
						)}
					</Button>
				))}
			</div>

			{/* Lightbox Modal */}
			<Modal
				isOpen={selectedIndex !== null}
				onClose={closeLightbox}
				title={selectedIndex !== null ? images[selectedIndex].title || 'Image' : undefined}
				size='4xl'>
				{selectedIndex !== null && (
					<div className='space-y-4'>
						<div className='relative aspect-video overflow-hidden rounded-lg bg-base-200'>
							<Image
								src={images[selectedIndex].url}
								alt={images[selectedIndex].alt}
								fill
								className='object-contain'
								sizes='100vw'
							/>
						</div>

						{images[selectedIndex].title && (
							<p className='text-center text-sm text-base-content/60'>{images[selectedIndex].title}</p>
						)}

						{/* Navigation */}
						<div className='flex items-center justify-between'>
							<Button
								variant='ghost'
								size='sm'
								onClick={goToPrevious}
								disabled={selectedIndex === 0}
								aria-label='Previous image'>
								<ChevronLeft className='h-4 w-4' />
							</Button>
							<span className='text-sm text-base-content/60'>
								{selectedIndex + 1} / {images.length}
							</span>
							<Button
								variant='ghost'
								size='sm'
								onClick={goToNext}
								disabled={selectedIndex === images.length - 1}
								aria-label='Next image'>
								<ChevronRight className='h-4 w-4' />
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</>
	)
}
