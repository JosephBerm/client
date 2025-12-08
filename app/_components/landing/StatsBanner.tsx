/**
 * StatsBanner Component
 *
 * Reusable statistics/trust banner component for displaying key metrics.
 * Features staggered animations and responsive grid layout.
 *
 * **Features:**
 * - Responsive grid layout (2 columns mobile, 4 columns desktop)
 * - Staggered entrance animations
 * - Mobile-first design
 * - Accessibility-first (semantic HTML, ARIA labels)
 * - Reduced motion support via shared animation system
 *
 * **Use Cases:**
 * - Trust metrics on landing pages
 * - Company statistics on about pages
 * - Achievement highlights
 * - Performance metrics
 *
 * @example
 * ```tsx
 * import StatsBanner from '@_components/landing/StatsBanner';
 *
 * <StatsBanner
 *   stats={[
 *     { label: 'Years Experience', value: '15+' },
 *     { label: 'Products Available', value: '50k+' },
 *     { label: 'Happy Clients', value: '2,000+' },
 *     { label: 'Delivery Accuracy', value: '99.9%' },
 *   ]}
 *   id="stats"
 * />
 * ```
 *
 * @module components/landing/StatsBanner
 */

'use client'

import { useEffect, useRef } from 'react'

import { logger } from '@_core'

import { Reveal, ANIMATION_DELAY, ANIMATION_DISTANCE } from '@_components/common/animations'
import PageContainer from '@_components/layouts/PageContainer'

export interface Stat {
	label: string
	value: string
}

export interface StatsBannerProps {
	/** Array of statistics to display */
	stats: Stat[]
	/** Section ID for navigation */
	id?: string
	/** Additional CSS classes */
	className?: string
	/** Background variant */
	variant?: 'neutral' | 'base'
}

/**
 * StatsBanner Component
 *
 * Displays statistics in a responsive grid with staggered animations.
 */
export default function StatsBanner({
	stats,
	id = 'stats',
	className,
	variant = 'neutral',
}: StatsBannerProps) {
	const bgClass = variant === 'neutral' ? 'bg-neutral text-neutral-content' : 'bg-base-100 text-base-content'
	const borderClass = variant === 'neutral' ? 'border-base-content/5' : 'border-base-300'

	return (
		<section
			id={id}
			className={`py-12 ${bgClass} border-y ${borderClass} ${className || ''}`}
			aria-label="Statistics and trust metrics"
		>
			<PageContainer>
				<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
					{stats.map((stat, idx) => (
						<Reveal
							key={idx}
							variant="fade"
							direction="up"
							distance={ANIMATION_DISTANCE.sm}
							delay={idx * ANIMATION_DELAY.quick}
							className="space-y-2"
						>
							<h3 className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</h3>
							<p className="text-xs sm:text-sm md:text-base text-primary-content dark:text-neutral-content/70 uppercase tracking-wide">
								{stat.label}
							</p>
						</Reveal>
					))}
				</div>
			</PageContainer>
		</section>
	)
}

