/**
 * Carousel Type Definitions
 * 
 * Provides type-safe interfaces and types for carousel components and content.
 * These types define the structure of carousel slides, overlays, CTAs, and
 * configuration, enabling type safety throughout the carousel system.
 * 
 * **Architecture:**
 * - CTA interface for call-to-action buttons
 * - Overlay interface for slide overlays (text, buttons)
 * - Extended slide interface with overlay support
 * - Content response interface matching API structure
 * 
 * **Use Cases:**
 * - Hero carousel on landing page
 * - Product category carousels
 * - Event carousels
 * - Testimonial carousels
 * 
 * @module CarouselTypes
 * @see {@link CarouselService} - Service that provides carousel data
 * @see {@link Carousel} - Component that uses these types
 * @see {@link HeroCarousel} - Component that uses carousel with overlays
 */

import type { CarouselSlide } from '@_components/ui/Carousel/types'

/**
 * Call-to-action button configuration interface.
 * 
 * Defines a button that appears in carousel slide overlays.
 * Used to provide actionable links or buttons on carousel slides,
 * typically for navigation or engagement.
 * 
 * **Common Use Cases:**
 * - "Get Connected" button linking to groups page
 * - "Learn More" button linking to about page
 * - "Find a Location" button linking to visit page
 * 
 * @interface CarouselCTA
 */
export interface CarouselCTA {
	/** Button text/label displayed to users */
	label: string
	/** URL or path the button links to */
	href: string
	/** Optional button style variant */
	variant?: 'primary' | 'secondary' | 'outline' | 'link'
	/** Whether the link opens in a new tab or same window */
	target?: '_blank' | '_self'
	/** Optional click handler for custom behavior */
	onClick?: () => void
}

/**
 * Overlay content interface for carousel slides.
 * 
 * Defines text content, CTAs, and positioning for overlays displayed
 * on top of carousel slides (images or videos). Used primarily for
 * hero carousels to provide context and call-to-action buttons.
 * 
 * **Overlay Components:**
 * - Title: Optional introductory text (e.g., "Elevation Nights")
 * - Heading: Main heading text (e.g., "Welcome to Church of God")
 * - Subheading: Supporting text or description
 * - CTAs: Array of call-to-action buttons
 * - Custom Content: Fully custom React content
 * 
 * **Position Options:**
 * Overlays can be positioned at various locations on the slide:
 * - Top: top-left, top-center, top-right
 * - Center: center
 * - Bottom: bottom-left, bottom-center, bottom-right
 * 
 * @interface CarouselOverlay
 */
export interface CarouselOverlay {
	/** Main heading text (typically the largest text) */
	heading?: string
	/** Subheading or description text (typically smaller, supporting text) */
	subheading?: string
	/** Optional title text displayed at the top (e.g., "Elevation Nights") */
	title?: string
	/** Array of call-to-action buttons */
	ctas?: CarouselCTA[]
	/** Custom React content for complete control over overlay appearance */
	customContent?: React.ReactNode
	/** Position/alignment of the overlay on the slide */
	position?: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

/**
 * Extended carousel slide interface with overlay support.
 * 
 * Extends the base CarouselSlide interface to include optional overlay
 * content. This enables slides to display text, buttons, and custom
 * content on top of images or videos.
 * 
 * **Use Cases:**
 * - Hero carousel with welcome message and CTAs
 * - Event carousel with event details
 * - Sermon carousel with sermon information
 * 
 * @interface CarouselSlideWithOverlay
 * @extends {CarouselSlide}
 */
export interface CarouselSlideWithOverlay extends CarouselSlide {
	/** Optional overlay content (text, buttons, custom content) */
	overlay?: CarouselOverlay
}

/**
 * Carousel content response interface (API structure).
 * 
 * Defines the structure of carousel data returned from the API or
 * service layer. Matches the expected format for carousel content,
 * including slides and configuration.
 * 
 * **Structure:**
 * - `slides`: Array of carousel slides (with optional overlays)
 * - `config`: Optional configuration object for carousel behavior
 * 
 * **Configuration Options:**
 * - `autoPlay`: Whether carousel automatically advances
 * - `autoPlayInterval`: Time between auto-advances (milliseconds)
 * - `loop`: Whether carousel loops back to start after last slide
 * - `showArrows`: Whether navigation arrows are visible
 * - `showDots`: Whether pagination dots are visible
 * - `showSlideNumbers`: Whether slide numbers are displayed
 * - `showGradientOverlay`: Whether gradient overlay is shown at bottom
 * 
 * @interface CarouselContentResponse
 */
export interface CarouselContentResponse {
	/** Array of carousel slides (images, videos, with optional overlays) */
	slides: CarouselSlideWithOverlay[]
	/** Optional carousel behavior configuration */
	config?: {
		/** Whether carousel automatically advances to next slide */
		autoPlay?: boolean
		/** Time interval between auto-advances in milliseconds */
		autoPlayInterval?: number
		/** Whether carousel loops back to first slide after last */
		loop?: boolean
		/** Whether left/right navigation arrows are visible */
		showArrows?: boolean
		/** Whether pagination dots are visible */
		showDots?: boolean
		/** Whether slide numbers are displayed */
		showSlideNumbers?: boolean
		/** Whether gradient overlay is shown at bottom for better text readability */
		showGradientOverlay?: boolean
	}
}

