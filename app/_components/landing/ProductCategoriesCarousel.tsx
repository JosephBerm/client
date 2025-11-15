'use client'

import { useMemo } from 'react'
import PageContainer from '@_components/layouts/PageContainer'
import { Carousel } from '@_components/ui/Carousel'
import type { CarouselSlide } from '@_components/ui/Carousel'
import Home from '@_classes/Home'

/**
 * Product Categories Carousel
 * 
 * Displays product category names in a carousel format underneath the hero section.
 * Uses text-only slides for a clean, elegant presentation of product categories.
 * 
 * **Features:**
 * - Auto-playing carousel with smooth transitions
 * - Text-only slides for product category names
 * - Mobile-first responsive design
 * - Accessible navigation (keyboard, touch, arrows)
 * 
 * **Design:**
 * - Clean, minimal text presentation
 * - Subtle background styling
 * - Smooth animations
 * - Touch-friendly on mobile
 */
export default function ProductCategoriesCarousel() {
	// Convert product names to carousel slides
	const slides: CarouselSlide[] = useMemo(() => {
		return Home.CarouselProducts.map((productName, index) => ({
			id: `product-category-${index}`,
			type: 'text' as const,
			text: productName,
			title: productName,
		}))
	}, [])

	// Don't render if no products
	if (slides.length === 0) {
		return null
	}

	return (
		<section id="product-categories" className="bg-base-100 py-8 md:py-12 w-full">
			<PageContainer className="max-w-7xl">
				<Carousel
					slides={slides}
					mode="banner"
					bannerSpeed={40}
					bannerGap="gap-8 sm:gap-12 md:gap-16 lg:gap-20"
					showGradientOverlay={false}
					className="rounded-2xl border border-base-300/40 bg-base-100 shadow-sm overflow-hidden w-full"
				/>
			</PageContainer>
		</section>
	)
}

