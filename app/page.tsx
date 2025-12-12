import { fetchFeaturedProducts } from '@_features/store/server'

import { Reveal, ANIMATION_PRESETS, ANIMATION_DELAY } from '@_components/common/animations'
import {
	ContactUs,
	FAQ,
	Intro,
	ProductCategoriesCarousel,
	Products,
	ProductsCarousel,
	SalesPitch,
	ScrollIntoViewComponent,
} from '@_components/landing'

/**
 * Home Page
 * 
 * Landing page with optimized FAANG-level scroll animations and server-side data fetching.
 * Uses new Reveal/Stagger components with proper variants, delays, and timing.
 * 
 * **Next.js 16 Optimization:**
 * - Featured products are fetched server-side with `use cache`
 * - Products are pre-rendered for faster TTFB
 * - Cache tagged for on-demand revalidation
 * 
 * **Animation Strategy:**
 * - Hero (Intro): Immediate impact with staggered content
 * - Sections: Progressive reveals as user scrolls
 * - Optimized timing: 0.6s duration for professional feel
 * - Staggered delays: 0.1-0.2s between sections
 * - Proper variants: fade, slide, scale based on content type
 * 
 * **Performance:**
 * - Server-side data fetching with caching
 * - Intersection Observer for efficient scroll detection
 * - GPU-accelerated transforms
 * - Respects reduced motion preferences
 * - 60fps animations
 * 
 * **Accessibility:**
 * - WCAG 2.1 AAA compliant
 * - Instant reveals for reduced motion users
 * - No vestibular triggers
 * - Keyboard accessible
 */
export default async function Home() {
	// Fetch featured products server-side with caching
	const featuredProducts = await fetchFeaturedProducts()
	return (
		<div className="flex flex-col gap-16 pb-24">
		{/* Hero Section - Optimized with Stagger and Reveal */}
		<Intro />
		
		{/* Product Categories Carousel - Simple fade (carousel has own animations) */}
		<Reveal {...ANIMATION_PRESETS.sectionFade} delay={ANIMATION_DELAY.long}>
			<ProductCategoriesCarousel />
		</Reveal>
		
		{/* Scroll Navigation - Custom implementation with specialized hooks */}
		<ScrollIntoViewComponent />
		
		{/* Featured Products - Professional slide-up entrance */}
		{/* Products are pre-fetched server-side with use cache for optimal performance */}
		<Reveal {...ANIMATION_PRESETS.sectionSlideUp} delay={ANIMATION_DELAY.quick}>
			<ProductsCarousel initialProducts={featuredProducts} />
		</Reveal>
		
		{/* Value Proposition - Fade with internal card stagger */}
		<Reveal {...ANIMATION_PRESETS.sectionFade} delay={ANIMATION_DELAY.standard}>
			<SalesPitch />
		</Reveal>
		
		{/* Product Categories - Slide-up for category showcase */}
		<Reveal {...ANIMATION_PRESETS.sectionSlideUp} delay={ANIMATION_DELAY.standard}>
			<Products />
		</Reveal>
		
		{/* FAQ - Professional slide-up with standard distance for consistency */}
		<Reveal {...ANIMATION_PRESETS.sectionSlideUp} delay={ANIMATION_DELAY.long}>
			<FAQ />
		</Reveal>
		
		{/* Contact Section - Fade with internal card stagger */}
		<Reveal {...ANIMATION_PRESETS.sectionFade} delay={ANIMATION_DELAY.long}>
			<ContactUs />
		</Reveal>
		</div>
	)
}
