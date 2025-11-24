'use client'

import { memo, useCallback } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { EmblaCarouselType } from 'embla-carousel'

interface CarouselControlsProps {
	emblaApi: EmblaCarouselType | undefined
	canScrollPrev: boolean
	canScrollNext: boolean
	showArrows?: boolean
}

/**
 * Carousel navigation arrow controls
 * Memoized for performance
 */
const CarouselControls = memo(function CarouselControls({
	emblaApi,
	canScrollPrev,
	canScrollNext,
	showArrows = true,
}: CarouselControlsProps) {
	const scrollPrev = useCallback(() => {
		if (emblaApi) {
			emblaApi.scrollPrev()
		}
	}, [emblaApi])

	const scrollNext = useCallback(() => {
		if (emblaApi) {
			emblaApi.scrollNext()
		}
	}, [emblaApi])

	if (!showArrows) {return null}

	return (
		<>
			{/* Previous Button - Mobile-first sizing and positioning */}
			<button
				onClick={scrollPrev}
				disabled={!canScrollPrev}
				className={`absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm sm:btn-sm md:btn-md min-h-[44px] min-w-[44px] bg-base-100/90 hover:bg-base-100 active:bg-base-200 border border-base-300/60 text-base-content shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${
					!canScrollPrev ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110 active:scale-95'
				}`}
				aria-label='Previous slide'
				type='button'>
				<ChevronLeft size={18} className='sm:w-5 sm:h-5 md:w-6 md:h-6' />
			</button>

			{/* Next Button - Mobile-first sizing and positioning */}
			<button
				onClick={scrollNext}
				disabled={!canScrollNext}
				className={`absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm sm:btn-sm md:btn-md min-h-[44px] min-w-[44px] bg-base-100/90 hover:bg-base-100 active:bg-base-200 border border-base-300/60 text-base-content shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${
					!canScrollNext ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110 active:scale-95'
				}`}
				aria-label='Next slide'
				type='button'>
				<ChevronRight size={18} className='sm:w-5 sm:h-5 md:w-6 md:h-6' />
			</button>
		</>
	)
})

CarouselControls.displayName = 'CarouselControls'

export default CarouselControls

