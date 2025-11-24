/**
 * HeroSection Component
 *
 * Reusable hero section with background image, gradient overlay, and animated content.
 * Designed for landing pages and marketing sections with full-viewport impact.
 *
 * **Features:**
 * - Full-viewport background image with gradient overlay
 * - Staggered content animations (badge, title, subtitle, CTAs)
 * - Optional scroll indicator
 * - Mobile-first responsive design
 * - Accessibility-first (semantic HTML, ARIA labels)
 * - Reduced motion support via shared animation system
 *
 * **Use Cases:**
 * - Landing page hero sections
 * - About page hero sections
 * - Marketing campaign pages
 * - Product launch pages
 *
 * @example
 * ```tsx
 * import HeroSection from '@_components/landing/HeroSection';
 * import HeroImage from '@/public/hero.jpg';
 *
 * <HeroSection
 *   badge="About MedSource Pro"
 *   title="Empowering Healthcare"
 *   titleHighlight="Through Innovation"
 *   subtitle="Delivering reliable medical supply solutions..."
 *   backgroundImage={HeroImage}
 *   primaryCTA={{ label: 'Get in Touch', href: '/contact' }}
 *   secondaryCTA={{ label: 'View Catalog', href: '/store' }}
 *   showScrollIndicator
 * />
 * ```
 *
 * @module components/landing/HeroSection
 */

'use client'

import { useEffect, useRef } from 'react'

import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

import { ArrowRight } from 'lucide-react'

import { getBlurDataUrl } from '@_features/images'

import { logger } from '@_core'

import {
	Reveal,
	Stagger,
	StaggerItem,
	ANIMATION_DURATION,
	ANIMATION_DELAY,
	STAGGER_DELAY,
	ANIMATION_DISTANCE,
} from '@_components/common/animations'
import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'
import Pill from '@_components/ui/Pill'
import StatusDot from '@_components/ui/StatusDot'


export interface HeroSectionCTA {
	label: string
	href: string
}

export interface HeroSectionProps {
	/** Optional badge/pill text displayed above title */
	badge?: string
	/** Main hero title */
	title: string
	/** Optional highlighted portion of title (styled differently) */
	titleHighlight?: string
	/** Subtitle/description text */
	subtitle: string
	/** Background image (StaticImageData from Next.js Image) */
	backgroundImage: StaticImageData
	/** Alt text for background image */
	backgroundImageAlt?: string
	/** Primary call-to-action button */
	primaryCTA: HeroSectionCTA
	/** Optional secondary call-to-action button */
	secondaryCTA?: HeroSectionCTA
	/** Show scroll down indicator */
	showScrollIndicator?: boolean
	/** Section ID for navigation */
	id?: string
	/** Additional CSS classes */
	className?: string
}

/**
 * HeroSection Component
 *
 * Full-viewport hero section with background image, gradient overlay,
 * and staggered content animations.
 */
export default function HeroSection({
	badge,
	title,
	titleHighlight,
	subtitle,
	backgroundImage,
	backgroundImageAlt = 'Hero background image',
	primaryCTA,
	secondaryCTA,
	showScrollIndicator = false,
	id = 'hero',
	className,
}: HeroSectionProps) {
	const hasLoggedMountRef = useRef(false)

	// Component lifecycle logging (FAANG best practice)
	useEffect(() => {
		if (!hasLoggedMountRef.current) {
			logger.debug('HeroSection mounted', {
				component: 'HeroSection',
				id,
				hasBadge: !!badge,
				hasTitleHighlight: !!titleHighlight,
				showScrollIndicator,
			})
			hasLoggedMountRef.current = true
		}

		return () => {
			logger.debug('HeroSection unmounting', {
				component: 'HeroSection',
				id,
			})
		}
	}, [id, badge, titleHighlight, showScrollIndicator])

	// Image error handler (FAANG best practice: track image load failures)
	const handleImageError = () => {
		logger.error('HeroSection - Background image failed to load', {
			component: 'HeroSection',
			id,
			imageSrc: backgroundImage?.src || 'unknown',
			imageAlt: backgroundImageAlt,
		})
	}

	// Image load success handler (FAANG best practice: track performance)
	const handleImageLoad = () => {
		logger.debug('HeroSection - Background image loaded successfully', {
			component: 'HeroSection',
			id,
			imageSrc: backgroundImage?.src || 'unknown',
		})
	}

	return (
		<section
			id={id}
			className={`relative w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden ${className || ''}`}
			aria-label="Hero section"
		>
			{/* Background Image with Overlay */}
			<div className="absolute inset-0 z-0" aria-hidden="true">
				<Image
					src={backgroundImage}
					alt={backgroundImageAlt}
					fill
					className="object-cover object-center"
					priority
					placeholder="blur"
					blurDataURL={getBlurDataUrl()}
					sizes="100vw"
					quality={90}
					onError={handleImageError}
					onLoad={handleImageLoad}
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/30" />
			</div>

			{/* Hero Content */}
			<PageContainer className="relative z-10">
				<Stagger
					className="max-w-3xl space-y-6"
					staggerDelay={STAGGER_DELAY.hero}
					delay={ANIMATION_DELAY.none}
				>
					{badge && (
						<StaggerItem
							variant="fade"
							distance={ANIMATION_DISTANCE.sm}
							duration={ANIMATION_DURATION.standard}
							easing="aboutHero"
						>
							<Pill
								tone="primary"
								size="md"
								shadow="sm"
								fontWeight="medium"
								icon={<StatusDot variant="primary" size="sm" />}
								className="backdrop-blur-sm"
							>
								{badge}
							</Pill>
						</StaggerItem>
					)}

					<StaggerItem
						variant="fade"
						distance={ANIMATION_DISTANCE.sm}
						duration={ANIMATION_DURATION.standard}
						easing="aboutHero"
					>
						<h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
							{title}
							{titleHighlight && (
								<>
									<br />
									<span className="text-primary">{titleHighlight}</span>
								</>
							)}
						</h1>
					</StaggerItem>

					<StaggerItem
						variant="fade"
						distance={ANIMATION_DISTANCE.sm}
						duration={ANIMATION_DURATION.standard}
						easing="aboutHero"
					>
						<p className="text-lg text-white/80 md:text-xl max-w-2xl leading-relaxed">{subtitle}</p>
					</StaggerItem>

					<StaggerItem
						width="100%"
						variant="fade"
						distance={ANIMATION_DISTANCE.sm}
						duration={ANIMATION_DURATION.standard}
						easing="aboutHero"
					>
						<div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
							<Link href={primaryCTA.href} className="inline-flex">
								<Button
									variant="primary"
									size="lg"
									rightIcon={<ArrowRight className="w-5 h-5" />}
									className="shadow-lg shadow-primary/25"
									fullWidth
								>
									{primaryCTA.label}
								</Button>
							</Link>
							{secondaryCTA && (
								<Link href={secondaryCTA.href} className="inline-flex">
									<Button
										variant="outline"
										size="lg"
										className="text-white hover:bg-white/10 hover:border-white border-white/30"
										fullWidth
									>
										{secondaryCTA.label}
									</Button>
								</Link>
							)}
						</div>
					</StaggerItem>
				</Stagger>
			</PageContainer>

			{/* Scroll Indicator */}
			{showScrollIndicator && (
				<Reveal
					variant="fade"
					delay={ANIMATION_DELAY.veryLong}
					duration={ANIMATION_DURATION.long}
				>
					<div
						className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 text-white/50"
						aria-label="Scroll down indicator"
						role="img"
					>
						<div className="w-6 h-10 sm:w-7 sm:h-12 border-2 border-white/30 rounded-full flex justify-center pt-2 animate-bounce">
							<div className="w-1 h-2 sm:w-1.5 sm:h-3 bg-white/50 rounded-full" />
						</div>
					</div>
				</Reveal>
			)}
		</section>
	)
}

