'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaCarouselType } from 'embla-carousel'
import type { CarouselProps } from './types'
import CarouselSlide from './CarouselSlide'
import CarouselControls from './CarouselControls'
import CarouselDots from './CarouselDots'

/**
 * Carousel component with drag/swipe, arrow navigation, and dot indicators.
 * 
 * A feature-rich carousel component built on Embla Carousel that supports
 * images, videos, text slides, overlays, and various navigation methods. Designed for
 * hero sections, galleries, product categories, and content showcases.
 * 
 * **Navigation Methods:**
 * - **Arrow Buttons**: Left/right arrow buttons for navigation
 * - **Drag/Swipe**: Click and drag on desktop, swipe on mobile (via Embla)
 * - **Dot Indicators**: Clickable dots for direct slide access
 * - **Keyboard**: Arrow keys for navigation (when focused)
 * 
 * **Media Support:**
 * - **Images**: Standard image slides with alt text
 * - **Videos**: Video slides with autoplay, mute, and controls
 * - **Text**: Text-only slides for product categories, labels, etc.
 * - **Overlays**: Text, headings, and CTAs on slides
 * 
 * **Features:**
 * - Auto-play with configurable interval
 * - Loop mode (wraps around to first slide)
 * - Gradient overlay for better text readability
 * - Video controls (mute/unmute, play/pause)
 * - Full accessibility support (ARIA, keyboard navigation)
 * - Responsive design (mobile-first)
 * - Smooth animations and transitions
 * 
 * **Accessibility:**
 * - ARIA labels and roles
 * - Keyboard navigation (arrow keys)
 * - Focus management
 * - Screen reader announcements
 * 
 * **Performance:**
 * - Uses Embla Carousel (lightweight, dependency-free)
 * - Optimized rendering with React hooks
 * - Lazy loading support (via Next.js Image)
 * 
 * @component
 * @param {CarouselProps} props - Carousel component props
 * @returns {JSX.Element} Carousel component with slides and controls
 * 
 * @example
 * ```tsx
 * // Basic carousel with images
 * <Carousel
 *   slides={[
 *     { id: '1', type: 'image', src: '/image.jpg', alt: 'Image' },
 *     { id: '2', type: 'image', src: '/image2.jpg', alt: 'Image 2' }
 *   ]}
 *   loop={true}
 *   showArrows={true}
 *   showDots={true}
 * />
 * 
 * // Carousel with text slides for product categories
 * <Carousel
 *   slides={[
 *     { id: '1', type: 'text', text: 'Medical Tent' },
 *     { id: '2', type: 'text', text: 'Regulators' }
 *   ]}
 *   loop={true}
 *   autoPlay={true}
 * />
 * 
 * // Carousel with videos and overlays
 * <Carousel
 *   slides={[
 *     {
 *       id: '1',
 *       type: 'video',
 *       src: '/video.mp4',
 *       overlay: {
 *         heading: 'Welcome',
 *         ctas: [{ label: 'Get Started', href: '/start' }]
 *       }
 *     }
 *   ]}
 *   showGradientOverlay={true}
 *   autoPlay={false}
 * />
 * ```
 * 
 * @see {@link CarouselSlide} - Individual slide component
 * @see {@link CarouselControls} - Arrow navigation controls
 * @see {@link CarouselDots} - Dot pagination indicators
 */
export default function Carousel({
	slides,
	autoPlay = false,
	autoPlayInterval = 3000,
	loop = true,
	showArrows = true,
	showDots = true,
	showSlideNumbers = false,
	showGradientOverlay = false,
	className = '',
	onSlideChange,
}: CarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop,
			align: 'start', // Changed from 'center' to 'start' to prevent width calculation issues
			dragFree: false,
			duration: 25,
			watchDrag: true,
		},
		[]
	)

	const [selectedIndex, setSelectedIndex] = useState(0)
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
	const [canScrollPrev, setCanScrollPrev] = useState(false)
	const [canScrollNext, setCanScrollNext] = useState(false)

	// Update selected index and scroll state
	const onSelect = useCallback(
		(emblaApi: EmblaCarouselType) => {
			const newIndex = emblaApi.selectedScrollSnap()
			setSelectedIndex(newIndex)
			setCanScrollPrev(emblaApi.canScrollPrev())
			setCanScrollNext(emblaApi.canScrollNext())

			// Call external callback if provided
			if (onSlideChange) {
				onSlideChange(newIndex)
			}
		},
		[onSlideChange]
	)

	// Initialize scroll snaps and set up event listeners
	useEffect(() => {
		if (!emblaApi) return

		// Set initial scroll snaps
		setScrollSnaps(emblaApi.scrollSnapList())
		onSelect(emblaApi)

		// Listen for scroll events
		emblaApi.on('select', onSelect)
		emblaApi.on('reInit', onSelect)

		// Update scroll snaps on resize
		const updateScrollSnaps = () => {
			setScrollSnaps(emblaApi.scrollSnapList())
		}
		emblaApi.on('reInit', updateScrollSnaps)

		return () => {
			emblaApi.off('select', onSelect)
			emblaApi.off('reInit', onSelect)
			emblaApi.off('reInit', updateScrollSnaps)
		}
	}, [emblaApi, onSelect])

	// Auto-play functionality
	useEffect(() => {
		if (!autoPlay || !emblaApi) return

		const interval = setInterval(() => {
			if (emblaApi.canScrollNext()) {
				emblaApi.scrollNext()
			} else if (loop) {
				emblaApi.scrollTo(0)
			}
		}, autoPlayInterval)

		return () => clearInterval(interval)
	}, [autoPlay, autoPlayInterval, emblaApi, loop])

	// Keyboard navigation
	useEffect(() => {
		if (!emblaApi) return

		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case 'ArrowLeft':
					event.preventDefault()
					emblaApi.scrollPrev()
					break
				case 'ArrowRight':
					event.preventDefault()
					emblaApi.scrollNext()
					break
				case 'Home':
					event.preventDefault()
					emblaApi.scrollTo(0)
					break
				case 'End':
					event.preventDefault()
					emblaApi.scrollTo(scrollSnaps.length - 1)
					break
			}
		}

		// Only add keyboard listener when carousel is focused
		const carouselElement = emblaApi.containerNode()
		carouselElement.addEventListener('keydown', handleKeyDown)

		return () => {
			carouselElement.removeEventListener('keydown', handleKeyDown)
		}
		}, [emblaApi, scrollSnaps.length])

	// Memoize slide numbers display
	const slideNumbers = useMemo(() => {
		if (!showSlideNumbers || slides.length === 0) return null

		const current = selectedIndex + 1
		const total = slides.length
		// Calculate previous slide number (wrap around if at start)
		const prev = selectedIndex === 0 ? total : selectedIndex
		// Calculate next slide number (wrap around if at end)
		const next = selectedIndex === total - 1 ? 1 : selectedIndex + 2

		return { prev, current, next }
	}, [showSlideNumbers, selectedIndex, slides.length])

	// Validate slides
	if (!slides || slides.length === 0) {
		return (
			<div className={`flex items-center justify-center p-4 md:p-8 bg-base-200 rounded-lg ${className}`}>
				<p className='text-sm md:text-base text-base-content/70'>No slides to display</p>
			</div>
		)
	}

	return (
		<div
			className={`relative w-full max-w-full overflow-hidden ${className} *:rounded-none`}
			role='region'
			aria-label='Carousel'
			tabIndex={0}>
			{/* Slide Numbers Display (optional) */}
			{showSlideNumbers && slideNumbers && (
				<>
					<div className='absolute left-0 top-1/2 -translate-y-1/2 z-20 text-white text-6xl md:text-8xl font-bold opacity-30 pointer-events-none'>
						{String(slideNumbers.prev).padStart(2, '0')}
					</div>
					<div className='absolute right-0 top-1/2 -translate-y-1/2 z-20 text-white text-6xl md:text-8xl font-bold opacity-30 pointer-events-none'>
						{String(slideNumbers.next).padStart(2, '0')}
					</div>
					<div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-white text-7xl md:text-9xl font-bold opacity-50 pointer-events-none'>
						{String(slideNumbers.current).padStart(2, '0')}
					</div>
				</>
			)}

			{/* Embla Carousel Viewport - Constrained to prevent overflow */}
			<div 
				className='overflow-hidden w-full max-w-full' 
				ref={emblaRef}>
				<div className='flex min-w-0'>
					{slides.map((slide, index) => (
						<CarouselSlide
							key={slide.id}
							slide={slide}
							isActive={index === selectedIndex}
							showGradientOverlay={showGradientOverlay}
							className='flex-[0_0_100%] min-w-0 max-w-full'
							// For text slides, pass control props to render controls inside slide
							emblaApi={slide.type === 'text' ? emblaApi : undefined}
							canScrollPrev={slide.type === 'text' ? canScrollPrev : undefined}
							canScrollNext={slide.type === 'text' ? canScrollNext : undefined}
							showArrows={slide.type === 'text' ? showArrows : undefined}
						/>
					))}
				</div>
			</div>

			{/* Navigation Controls - Only for image/video slides (text slides render controls inside) */}
			{slides.length > 0 && slides[selectedIndex]?.type !== 'text' && (
				<CarouselControls
					emblaApi={emblaApi}
					canScrollPrev={canScrollPrev}
					canScrollNext={canScrollNext}
					showArrows={showArrows}
				/>
			)}

			{/* Dot Indicators - Positioned below carousel */}
			{showDots && (
				<div className='relative mt-4 md:mt-6'>
					<CarouselDots
						emblaApi={emblaApi}
						selectedIndex={selectedIndex}
						scrollSnaps={scrollSnaps}
						showDots={showDots}
					/>
				</div>
			)}
		</div>
	)
}

