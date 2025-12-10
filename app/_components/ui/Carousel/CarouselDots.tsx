'use client'

import { memo, useCallback } from 'react'

import type { EmblaCarouselType } from 'embla-carousel'

interface CarouselDotsProps {
	emblaApi: EmblaCarouselType | undefined
	selectedIndex: number
	scrollSnaps: number[]
	showDots?: boolean
}

/**
 * Carousel dot pagination indicators
 * Memoized for performance
 */
const CarouselDots = memo(function CarouselDots({
	emblaApi,
	selectedIndex,
	scrollSnaps,
	showDots = true,
}: CarouselDotsProps) {
	const scrollTo = useCallback(
		(index: number) => {
			if (emblaApi) {
				emblaApi.scrollTo(index)
			}
		},
		[emblaApi]
	)

	if (!showDots || scrollSnaps.length <= 1) {return null}

	return (
		<div className='flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 py-2' role='tablist' aria-label='Carousel pagination'>
			{scrollSnaps.map((_, index) => {
				const isSelected = index === selectedIndex
				
				return (
					<button
						key={index}
						onClick={() => scrollTo(index)}
						className={`
							transition-all duration-300 ease-in-out
							cursor-pointer
							rounded-full
							min-h-[8px] min-w-[8px]
							focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
							${isSelected
								? 'w-8 sm:w-9 md:w-10 h-2 sm:h-2 md:h-2.5 bg-primary'
								: 'w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-2.5 md:h-2.5 bg-base-content/30 hover:bg-base-content/50 active:bg-base-content/60 hover:scale-110 active:scale-95'
							}
						`.trim().replace(/\s+/g, ' ')}
						aria-label={`Go to slide ${index + 1}`}
						aria-selected={isSelected}
						role='tab'
						type='button'
					/>
				)
			})}
		</div>
	)
})

CarouselDots.displayName = 'CarouselDots'

export default CarouselDots

