'use client'

import Link from 'next/link'
import { Activity, TestTube2, Stethoscope, Building2 } from 'lucide-react'

import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'
import Pill from '@_components/ui/Pill'
import StatusDot from '@_components/ui/StatusDot'
import FeatureCard from '@_components/ui/FeatureCard'
import { Stagger, StaggerItem, Reveal, STAGGER_PRESETS, ANIMATION_PRESETS } from '@_components/common/animations'

const PRODUCT_CATEGORIES = [
	{
		name: 'Acute Care',
		description: 'Infusion therapy, respiratory care, and monitoring devices staged for critical environments.',
		items: '480+ SKUs',
		icon: Activity,
	},
	{
		name: 'Laboratory & Diagnostics',
		description: 'Point-of-care diagnostics, specimen collection, PPE, and consumables for high-throughput labs.',
		items: '320+ SKUs',
		icon: TestTube2,
	},
	{
		name: 'Surgical & Sterile',
		description: 'Sterile packs, surgical instruments, and draping solutions with full traceability.',
		items: '260+ SKUs',
		icon: Stethoscope,
	},
	{
		name: 'Facility Essentials',
		description: 'Environmental services, office supplies, and patient-care basics in consolidated shipments.',
		items: '150+ SKUs',
		icon: Building2,
	},
]

/**
 * Products Section
 *
 * Highlights major product categories with FAANG-level staggered animations.
 * 
 * **Animation Strategy:**
 * - Category cards pop in with scale effect
 * - 80ms stagger delay for efficient reveal
 * - CTA banner appears after cards (guided flow)
 * - 200ms delay after section enters view
 * 
 * **Performance:**
 * - GPU-accelerated scale transforms
 * - Respects reduced motion (instant reveal)
 * - Optimized for 60fps
 * 
 * **Accessibility:**
 * - WCAG 2.1 AAA compliant
 * - Semantic HTML
 * - Keyboard accessible
 */
export default function Products() {
	return (
		<section id="categories" className="bg-base-100 py-20 lg:py-28">
			<PageContainer className="space-y-16">
				<div className="space-y-6 text-center lg:text-left">
					<Pill
						tone="info"
						size="md"
						shadow="sm"
						fontWeight="medium"
						icon={<StatusDot variant="info" size="sm" />}
						className="inline-flex"
					>
						Product catalog
					</Pill>
				<div className="lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-10">
					<h2 className="text-3xl font-semibold leading-tight text-base-content md:text-4xl lg:text-5xl">
						Built for every care setting across your network.
					</h2>
					<p className="mt-4 text-base text-base-content/70 md:text-lg lg:mt-0">
							Curated assortments for acute care, ambulatory surgery, physician groups, and post-acute markets.
							Consolidated pricing, predictable fulfillment, and SKU rationalization keep teams supplied without
							excess inventory.
						</p>
					</div>
					</div>

			{/* Staggered Category Cards - FAANG-level scale animation */}
			<Stagger {...STAGGER_PRESETS.productCards} className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
				{PRODUCT_CATEGORIES.map(({ name, description, items, icon }) => (
					<StaggerItem key={name} {...ANIMATION_PRESETS.cardScale}>
						<FeatureCard
							icon={icon}
							title={name}
							subtitle={items}
							description={description}
							padding="sm"
							blurSize="md"
							className="flex h-full flex-col"
							footer={
								<Link
									href="/store"
									className="link link-primary relative inline-flex items-center gap-2 self-start text-sm font-semibold uppercase tracking-[0.25em]"
								>
									Explore
									<span className="h-1 w-16 bg-primary transition-all duration-300" />
								</Link>
							}
						/>
					</StaggerItem>
				))}
			</Stagger>

		{/* CTA Banner - Appears after cards for guided flow */}
		<Reveal {...ANIMATION_PRESETS.cardFadeUp} delay={0.5}>
				<div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-primary/20 bg-base-200 px-6 py-10 text-center lg:flex-row lg:gap-8 lg:px-12">
					<p className="max-w-3xl text-base text-base-content lg:text-left">
						Need a tailored formulary or bulk purchasing strategy? Our sourcing specialists consolidate vendors,
						lock in volume pricing, and align logistics to your care settings.
					</p>
						<Link href="/contact" className="inline-flex shrink-0">
							<Button variant="primary" size="lg">
						Schedule a consultation
							</Button>
					</Link>
				</div>
			</Reveal>
			</PageContainer>
		</section>
	)
}
