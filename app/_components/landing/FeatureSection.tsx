/**
 * FeatureSection Component
 *
 * Reusable feature section component with alternating image/text layout.
 * Designed for showcasing features, values, or benefits with visual content.
 *
 * **Features:**
 * - Alternating left/right layout for image and text
 * - Icon support with color variants
 * - Hover effects on images
 * - Mobile-first responsive design
 * - Accessibility-first (semantic HTML, ARIA labels)
 * - Reduced motion support via shared animation system
 *
 * **Use Cases:**
 * - Feature showcases on about pages
 * - Value proposition sections
 * - Service highlights
 * - Product benefits
 *
 * @example
 * ```tsx
 * import FeatureSection from '@_components/landing/FeatureSection';
 * import { Shield } from 'lucide-react';
 * import FeatureImage from '@/public/feature.jpg';
 *
 * <FeatureSection
 *   title="Quality Assurance"
 *   description="We partner exclusively with vetted manufacturers..."
 *   image={FeatureImage}
 *   icon={Shield}
 *   iconColor="text-emerald-500"
 *   iconBg="bg-emerald-50"
 *   layout="left"
 *   index={0}
 *   id="feature-1"
 * />
 * ```
 *
 * @module components/landing/FeatureSection
 */

'use client'

import { useEffect, useRef } from 'react'

import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

import { type LucideIcon, ArrowRight } from 'lucide-react'

import { getBlurDataUrl } from '@_features/images'

import { logger } from '@_core'

import {
	Reveal,
	ANIMATION_DURATION,
	ANIMATION_DELAY,
	ANIMATION_DISTANCE,
} from '@_components/common/animations'
import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'

export interface FeatureSectionProps {
	/** Feature title */
	title: string
	/** Feature description */
	description: string
	/** Feature image */
	image: StaticImageData
	/** Icon component from lucide-react */
	icon: LucideIcon
	/** Icon text color class */
	iconColor: string
	/** Icon background color class */
	iconBg: string
	/** Layout direction ('left' = image left, 'right' = image right) */
	layout: 'left' | 'right'
	/** Index for alternating background colors */
	index: number
	/** Section ID */
	id?: string
	/** Optional "Learn more" link */
	learnMoreHref?: string
	/** Additional CSS classes */
	className?: string
}

/**
 * FeatureSection Component
 *
 * Displays a feature with alternating image/text layout.
 */
export default function FeatureSection({
	title,
	description,
	image,
	icon: Icon,
	iconColor,
	iconBg,
	layout,
	index,
	id,
	learnMoreHref,
	className,
}: FeatureSectionProps) {
	const isEven = index % 2 === 0
	const bgClass = isEven ? 'bg-base-100' : 'bg-base-200/50'
	const isImageLeft = layout === 'left'
	const hasLoggedMountRef = useRef(false)

	// Component lifecycle logging (FAANG best practice)
	useEffect(() => {
		if (!hasLoggedMountRef.current) {
			logger.debug('FeatureSection mounted', {
				component: 'FeatureSection',
				id: id || `feature-${index}`,
				index,
				layout,
				hasLearnMore: !!learnMoreHref,
				priority: index === 0,
			})
			hasLoggedMountRef.current = true
		}

		return () => {
			logger.debug('FeatureSection unmounting', {
				component: 'FeatureSection',
				id: id || `feature-${index}`,
				index,
			})
		}
	}, [id, index, layout, learnMoreHref])

	// Image error handler (FAANG best practice: track image load failures)
	const handleImageError = () => {
		logger.error('FeatureSection - Feature image failed to load', {
			component: 'FeatureSection',
			id: id || `feature-${index}`,
			index,
			title,
			imageSrc: image?.src || 'unknown',
		})
	}

	// Image load success handler (FAANG best practice: track performance)
	const handleImageLoad = () => {
		logger.debug('FeatureSection - Feature image loaded successfully', {
			component: 'FeatureSection',
			id: id || `feature-${index}`,
			index,
			title,
			priority: index === 0,
		})
	}

	return (
		<section
			id={id}
			className={`py-16 sm:py-20 md:py-28 lg:py-32 overflow-hidden ${bgClass} ${className || ''}`}
			aria-labelledby={id ? `${id}-title` : undefined}
		>
			<PageContainer>
				<div
					className={`flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-24 ${
						isImageLeft ? '' : 'lg:flex-row-reverse'
					}`}
				>
					{/* Text Content */}
					<Reveal
						variant="slide"
						direction={isImageLeft ? 'right' : 'left'}
						distance={ANIMATION_DISTANCE.feature}
						duration={ANIMATION_DURATION.slow}
						easing="easeOut"
						className="flex-1 space-y-6 w-full"
					>
						<div
							className={`inline-flex items-center justify-center p-3 rounded-2xl ${iconBg} ${iconColor} mb-4`}
							aria-hidden="true"
						>
							<Icon className="w-7 h-7 sm:w-8 sm:h-8" />
						</div>
						<h2
							id={id ? `${id}-title` : undefined}
							className="text-3xl sm:text-4xl lg:text-5xl font-bold text-base-content leading-tight"
						>
							{title}
						</h2>
						<p className="text-base sm:text-lg text-base-content/70 leading-relaxed">{description}</p>
						{learnMoreHref && (
							<div className="pt-4">
								{learnMoreHref ? (
									<Link href={learnMoreHref} className="inline-flex">
										<Button
											variant="ghost"
											size="md"
											rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
											className="pl-0 text-primary group"
										>
											Learn more
										</Button>
									</Link>
								) : (
									<Button
										variant="ghost"
										size="md"
										rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
										className="pl-0 text-primary group"
									>
										Learn more
									</Button>
								)}
							</div>
						)}
					</Reveal>

					{/* Image Content */}
					<Reveal
						variant="scale"
						duration={ANIMATION_DURATION.slow}
						delay={ANIMATION_DELAY.long}
						className="flex-1 w-full"
					>
						<div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-base-content/5 group">
							<div
								className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
								aria-hidden="true"
							/>
							<Image
								src={image}
								alt={`${title} - ${description}`}
								fill
								className="object-cover transition-transform duration-700 group-hover:scale-105"
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
								loading={index === 0 ? 'eager' : 'lazy'}
								priority={index === 0}
								placeholder="blur"
								blurDataURL={getBlurDataUrl()}
								quality={85}
								onError={handleImageError}
								onLoad={handleImageLoad}
							/>
						</div>
					</Reveal>
				</div>
			</PageContainer>
		</section>
	)
}

