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

export type CarouselMode = 'carousel' | 'banner'

export interface CarouselProps {
	/** Array of slides to display */
	slides: CarouselSlide[]
	/** Display mode: 'carousel' for discrete slides, 'banner' for continuous scrolling */
	mode?: CarouselMode
	/** Whether to auto-play the carousel (only applies to carousel mode) */
	autoPlay?: boolean
	/** Auto-play interval in milliseconds (only applies to carousel mode) */
	autoPlayInterval?: number
	/** Whether to loop infinitely */
	loop?: boolean
	/** Whether to show navigation arrows (only applies to carousel mode) */
	showArrows?: boolean
	/** Whether to show dot indicators (only applies to carousel mode) */
	showDots?: boolean
	/** Whether to show slide numbers (like 06, 07, 08) (only applies to carousel mode) */
	showSlideNumbers?: boolean
	/** Whether to show gradient overlay at bottom for better text readability */
	showGradientOverlay?: boolean
	/** Animation duration for banner mode in seconds (default: 30s) */
	bannerSpeed?: number
	/** Gap between items in banner mode (default: 'gap-8') */
	bannerGap?: string
	/** Additional CSS classes */
	className?: string
	/** Callback when slide changes (only applies to carousel mode) */
	onSlideChange?: (index: number) => void
}

