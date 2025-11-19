import ContactUs from '@_components/landing/ContactUs'
import FAQ from '@_components/landing/FAQ'
import Intro from '@_components/landing/Intro'
import Products from '@_components/landing/Products'
import ProductCategoriesCarousel from '@_components/landing/ProductCategoriesCarousel'
import ProductsCarousel from '@_components/landing/ProductsCarousel'
import SalesPitch from '@_components/landing/SalesPitch'
import ScrollIntoViewComponent from '@_components/landing/ScrollIntoViewComponent'
import { Reveal, ANIMATION_PRESETS, ANIMATION_DURATION, ANIMATION_DELAY, ANIMATION_DISTANCE } from '@_components/common/animations'

/**
 * Home Page
 * 
 * Landing page with optimized FAANG-level scroll animations.
 * Uses new Reveal/Stagger components with proper variants, delays, and timing.
 * 
 * **Animation Strategy:**
 * - Hero (Intro): Immediate impact with staggered content
 * - Sections: Progressive reveals as user scrolls
 * - Optimized timing: 0.6s duration for professional feel
 * - Staggered delays: 0.1-0.2s between sections
 * - Proper variants: fade, slide, scale based on content type
 * 
 * **Performance:**
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
export default function Home() {
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
		<Reveal {...ANIMATION_PRESETS.sectionSlideUp} delay={ANIMATION_DELAY.quick}>
			<ProductsCarousel />
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
