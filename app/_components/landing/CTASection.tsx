/**
 * CTASection Component
 *
 * Reusable call-to-action section component with pattern background.
 * Designed for conversion-focused sections at the end of pages.
 *
 * **Features:**
 * - Pattern background variants (pattern, gradient, solid)
 * - Centered content with CTAs
 * - Mobile-first responsive design
 * - Accessibility-first (semantic HTML, ARIA labels)
 * - Reduced motion support via shared animation system
 *
 * **Use Cases:**
 * - End-of-page conversion sections
 * - Newsletter signup prompts
 * - Contact prompts
 * - Product trial prompts
 *
 * @example
 * ```tsx
 * import CTASection from '@_components/landing/CTASection';
 *
 * <CTASection
 *   title="Ready to Transform Your Healthcare Supply Chain?"
 *   description="Join thousands of healthcare providers..."
 *   primaryCTA={{ label: 'Partner With Us', href: '/contact' }}
 *   secondaryCTA={{ label: 'Explore Products', href: '/store' }}
 *   variant="pattern"
 *   id="cta"
 * />
 * ```
 *
 * @module components/landing/CTASection
 */

'use client'

import { useEffect, useRef } from 'react'

import Link from 'next/link'

import { logger } from '@_core'

import { Reveal, ANIMATION_PRESETS } from '@_components/common/animations'
import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'

export interface CTASectionCTA {
	label: string
	href: string
}

export interface CTASectionProps {
	/** CTA section title */
	title: string
	/** CTA section description */
	description: string
	/** Primary call-to-action button */
	primaryCTA: CTASectionCTA
	/** Optional secondary call-to-action button */
	secondaryCTA?: CTASectionCTA
	/** Background variant */
	variant?: 'pattern' | 'gradient' | 'solid'
	/** Section ID */
	id?: string
	/** Additional CSS classes */
	className?: string
}

/**
 * CTASection Component
 *
 * Displays a call-to-action section with pattern background and CTAs.
 */
export default function CTASection({
	title,
	description,
	primaryCTA,
	secondaryCTA,
	variant = 'pattern',
	id = 'cta',
	className,
}: CTASectionProps) {
	const bgClass =
		variant === 'pattern' || variant === 'solid'
			? 'bg-neutral text-neutral-content'
			: 'bg-gradient-to-br from-primary to-accent text-primary-content'

	return (
		<section
			id={id}
			className={`relative py-16 sm:py-20 md:py-24 overflow-hidden ${bgClass} ${className || ''}`}
			aria-labelledby={`${id}-title`}
		>
			{/* Pattern Background */}
			{variant === 'pattern' && (
				<div className="absolute inset-0" aria-hidden="true">
					<div
						className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] opacity-20"
						aria-hidden="true"
					/>
				</div>
			)}

			<PageContainer className="relative z-10 text-center">
				<Reveal {...ANIMATION_PRESETS.ctaSlideUp} className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
					<h2
						id={`${id}-title`}
						className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 ${
							variant === 'gradient' ? 'text-primary-content' : 'text-neutral-content'
						}`}
					>
						{title}
					</h2>
					<p
						className={`text-lg sm:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 ${
							variant === 'gradient' ? 'text-primary-content/80' : 'text-neutral-content/80'
						}`}
					>
						{description}
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href={primaryCTA.href} className="inline-flex">
							<Button
								variant="primary"
								size="lg"
								className="shadow-lg shadow-primary/25 border-0"
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
									className={
										variant === 'gradient'
											? 'text-primary-content hover:bg-primary-content/10 hover:border-primary-content border-primary-content/30'
											: 'text-neutral-content hover:bg-neutral-content/10 hover:border-neutral-content border-neutral-content/30'
									}
									fullWidth
								>
									{secondaryCTA.label}
								</Button>
							</Link>
						)}
					</div>
				</Reveal>
			</PageContainer>
		</section>
	)
}

