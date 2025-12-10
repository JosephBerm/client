'use client'

import { useEffect, useRef } from 'react'

import { logger } from '@_core'

import AboutUsMain from '@/public/aboutus-main.png'
import Aboutus11 from '@/public/aboutus11.png'
import Aboutus22 from '@/public/aboutus22.png'
import Aboutus33 from '@/public/aboutus33.png'
import Aboutus44 from '@/public/aboutus44.png'
import Aboutus55 from '@/public/aboutus55.png'

import About from '@_classes/About'

import CTASection from '@_components/landing/CTASection'
import FeatureSection from '@_components/landing/FeatureSection'
import HeroSection from '@_components/landing/HeroSection'
import StatsBanner from '@_components/landing/StatsBanner'


/**
 * About Page Client Component
 *
 * Main client component for the about page.
 * Uses centralized content from About.ts class and reusable landing components.
 *
 * **Structure:**
 * - Hero section with background image
 * - Stats banner with trust metrics
 * - Alternating feature sections
 * - Call-to-action section
 *
 * **Content Management:**
 * - All text content comes from About.ts class
 * - Images are imported locally (Next.js Image optimization)
 * - Easy to update content without touching JSX
 */
export default function AboutPageClient() {
	// Map feature images to features (images are imported locally for Next.js optimization)
	const featureImages = [Aboutus11, Aboutus22, Aboutus33, Aboutus44, Aboutus55]

	return (
		<main className="flex flex-col w-full overflow-x-hidden bg-base-100">
			{/* Hero Section */}
			<HeroSection
				id="about-hero"
				badge={About.HeroSection.badge}
				title={About.HeroSection.title}
				titleHighlight={About.HeroSection.titleHighlight}
				subtitle={About.HeroSection.subtitle}
				backgroundImage={AboutUsMain}
				backgroundImageAlt={About.HeroSection.backgroundImageAlt}
				primaryCTA={About.HeroSection.primaryCTA}
				secondaryCTA={About.HeroSection.secondaryCTA}
				showScrollIndicator
			/>

			{/* Stats/Trust Banner */}
			<StatsBanner id="about-stats" stats={About.Stats} variant="neutral" />

			{/* Alternating Features Sections */}
			<div className="flex flex-col">
				{About.Features.map((feature, idx) => {
					const isEven = idx % 2 === 0
					const sectionId = `about-feature-${idx + 1}`
					return (
						<FeatureSection
							key={idx}
							id={sectionId}
							title={feature.title}
							description={feature.description}
							image={featureImages[idx]}
							icon={feature.icon}
							iconColor={feature.color}
							iconBg={feature.bg}
							layout={isEven ? 'left' : 'right'}
							index={idx}
						/>
					)
				})}
			</div>

			{/* CTA Section */}
			<CTASection
				id="about-cta"
				title={About.CTA.title}
				description={About.CTA.description}
				primaryCTA={About.CTA.primaryCTA}
				secondaryCTA={About.CTA.secondaryCTA}
				variant="pattern"
			/>
		</main>
	)
}

