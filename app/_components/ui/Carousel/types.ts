/**
 * Carousel component type definitions
 */

import type { CarouselOverlay } from '@_classes/CarouselTypes'

export type CarouselSlideType = 'image' | 'video' | 'text'

export interface CarouselSlide {
	/** Unique identifier for the slide */
	id: string
	/** Type of media: image, video, or text */
	type: CarouselSlideType
	/** Source URL for the media (not required for text type) */
	src?: string
	/** Alt text for images (accessibility) */
	alt?: string
	/** Title or caption for the slide */
	title?: string
	/** Thumbnail URL for videos (optional) */
	thumbnail?: string
	/** Overlay content (text, buttons, etc.) */
	overlay?: CarouselOverlay
	/** Text content for text-type slides */
	text?: string
	/** Additional data for the slide */
	[key: string]: unknown
}

export interface CarouselProps {
	/** Array of slides to display */
	slides: CarouselSlide[]
	/** Whether to auto-play the carousel */
	autoPlay?: boolean
	/** Auto-play interval in milliseconds */
	autoPlayInterval?: number
	/** Whether to loop infinitely */
	loop?: boolean
	/** Whether to show navigation arrows */
	showArrows?: boolean
	/** Whether to show dot indicators */
	showDots?: boolean
	/** Whether to show slide numbers (like 06, 07, 08) */
	showSlideNumbers?: boolean
	/** Whether to show gradient overlay at bottom for better text readability */
	showGradientOverlay?: boolean
	/** Additional CSS classes */
	className?: string
	/** Callback when slide changes */
	onSlideChange?: (index: number) => void
}

