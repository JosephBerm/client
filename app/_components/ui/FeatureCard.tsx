/**
 * FeatureCard UI Component
 * 
 * Specialized card component for displaying feature/value proposition cards with icons,
 * decorative blur backgrounds, and hover effects. Optimized for landing page sections
 * like value propositions, product categories, and feature highlights.
 * 
 * **Features:**
 * - Icon support with hover animations
 * - Decorative blur background effect
 * - Title and description support
 * - Optional subtitle/metadata
 * - Optional footer link/action
 * - Mobile-first responsive design
 * - Theme-aware styling (DaisyUI)
 * - Smooth hover transitions
 * - Accessible semantic HTML
 * 
 * **Use Cases:**
 * - Value proposition cards (SalesPitch)
 * - Product category cards (Products)
 * - Feature highlight sections
 * - Service showcase cards
 * 
 * @example
 * ```tsx
 * import FeatureCard from '@_components/ui/FeatureCard';
 * import { ShieldCheck } from 'lucide-react';
 * 
 * // Basic feature card
 * <FeatureCard
 *   icon={ShieldCheck}
 *   title="Regulatory compliant"
 *   description="Every supplier in our network is vetted for FDA and ISO compliance."
 * />
 * 
 * // With subtitle and footer link
 * <FeatureCard
 *   icon={PackageCheck}
 *   title="Acute Care"
 *   subtitle="480+ SKUs"
 *   description="Infusion therapy, respiratory care, and monitoring devices."
 *   footer={
 *     <Link href="/store" className="link link-primary">
 *       Explore
 *     </Link>
 *   }
 * />
 * ```
 * 
 * @module FeatureCard
 */

import type { HTMLAttributes, ReactNode } from 'react'

import classNames from 'classnames'

import type { LucideIcon } from 'lucide-react'

/**
 * FeatureCard component props interface.
 */
export interface FeatureCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
	/** 
	 * Icon component from lucide-react.
	 * Rendered in a styled container with hover effects.
	 */
	icon: LucideIcon
	
	/** 
	 * Card title (required).
	 * Rendered as h3 for semantic HTML.
	 */
	title: string
	
	/** 
	 * Card description text (required).
	 * Main content explaining the feature.
	 */
	description: string
	
	/** 
	 * Optional subtitle/metadata.
	 * Typically used for counts, labels, or secondary info.
	 * Rendered above description in smaller, uppercase text.
	 */
	subtitle?: string
	
	/** 
	 * Optional footer content.
	 * Typically a link or button for actions.
	 * Rendered at the bottom of the card.
	 */
	footer?: ReactNode
	
	/** 
	 * Padding variant.
	 * Controls vertical padding of the card.
	 * @default 'md'
	 */
	padding?: 'sm' | 'md'
	
	/** 
	 * Blur background size.
	 * Controls the decorative blur element size.
	 * @default 'md'
	 */
	blurSize?: 'sm' | 'md'
	
	/** 
	 * Additional CSS classes for the card container.
	 */
	className?: string
	
	/** 
	 * Additional CSS classes for the content wrapper.
	 */
	contentClassName?: string
}

/**
 * Padding configurations for different variants.
 */
const paddingClasses = {
	sm: 'px-8 py-9',
	md: 'px-8 py-10',
} as const

/**
 * Blur background size configurations.
 */
const blurSizes = {
	sm: {
		size: 'h-24 w-24',
		position: '-right-10 -top-10',
		blur: 'blur-2xl',
	},
	md: {
		size: 'h-28 w-28',
		position: '-right-7 -top-10',
		blur: 'blur-3xl',
	},
} as const

/**
 * FeatureCard Component
 * 
 * Specialized card for feature/value proposition display with icon,
 * decorative blur background, and optional footer actions.
 * 
 * **Design Pattern:**
 * - Mobile-first responsive layout
 * - Decorative blur background for visual interest
 * - Icon container with hover state transitions
 * - Semantic HTML structure (h3 for title)
 * - Theme-aware colors using DaisyUI tokens
 * 
 * @param props - FeatureCard configuration props
 * @returns FeatureCard component
 */
export default function FeatureCard({
	icon: Icon,
	title,
	description,
	subtitle,
	footer,
	padding = 'md',
	blurSize = 'md',
	className,
	contentClassName,
	...props
}: FeatureCardProps) {
	const paddingClass = paddingClasses[padding]
	const blurConfig = blurSizes[blurSize]
	
	return (
		<div
			className={classNames(
				'card group relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm transition-all duration-300 hover:shadow-xl',
				paddingClass,
				className
			)}
			{...props}
		>
			{/* Decorative blur background */}
			<div
				className={classNames(
					'absolute rounded-full bg-base-content/5 transition duration-300 group-hover:bg-base-content/10',
					blurConfig.size,
					blurConfig.position,
					blurConfig.blur
				)}
				aria-hidden="true"
			/>
			
			{/* Content wrapper */}
			<div className={classNames('relative flex flex-col', footer ? 'h-full justify-between' : 'gap-4', contentClassName)}>
				<div className="flex flex-col gap-4">
					{/* Icon container */}
					<span
						className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-sm transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content group-hover:shadow-md"
						aria-hidden="true"
					>
						<Icon className="h-6 w-6" strokeWidth={1.5} />
					</span>
					
					{/* Text content */}
					<div className={classNames('space-y-3', subtitle && 'space-y-2')}>
						<div className={subtitle ? 'space-y-2' : undefined}>
							<h3 className="text-xl font-semibold text-base-content">{title}</h3>
							{subtitle && (
								<p className="text-sm font-semibold uppercase tracking-[0.3em] text-base-content/60">
									{subtitle}
								</p>
							)}
						</div>
						<p className="text-base leading-relaxed text-base-content/70">{description}</p>
					</div>
				</div>
				
				{/* Optional footer */}
				{footer && <div className="mt-6">{footer}</div>}
			</div>
		</div>
	)
}

