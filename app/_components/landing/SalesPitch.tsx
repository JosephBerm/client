import { ShieldCheck, PackageCheck, Truck, Headset } from 'lucide-react'

import PageContainer from '@_components/layouts/PageContainer'
import Pill from '@_components/ui/Pill'
import StatusDot from '@_components/ui/StatusDot'
import FeatureCard from '@_components/ui/FeatureCard'
import { Stagger, StaggerItem, STAGGER_PRESETS, ANIMATION_PRESETS } from '@_components/common/animations'

const VALUE_PROPS = [
	{
		title: 'Regulatory compliant',
		description: 'Every supplier in our network is vetted for FDA and ISO compliance with documented QA audits.',
		icon: ShieldCheck,
	},
	{
		title: 'Curated catalog',
		description: 'Thousands of SKUs across diagnostics, surgical, and laboratory supplies available for immediate quote.',
		icon: PackageCheck,
	},
	{
		title: 'Intelligent logistics',
		description: 'Predictive inventory management with dynamic fulfillment ensures 99% on-time deliveries nationwide.',
		icon: Truck,
	},
	{
		title: 'Dedicated support',
		description: 'Specialized account teams provide sourcing expertise, volume pricing, and emergency procurement.',
		icon: Headset,
	},
]

/**
 * Sales Pitch Section
 *
 * Highlights unique value propositions with FAANG-level staggered card animations.
 * 
 * **Animation Strategy:**
 * - Cards reveal sequentially (1 → 2 → 3 → 4)
 * - 100ms stagger delay for comfortable pace
 * - Fade + upward movement for professional feel
 * - 300ms initial delay after section enters view
 * 
 * **Performance:**
 * - GPU-accelerated transforms
 * - Respects reduced motion (instant reveal)
 * - Optimized for 60fps
 * 
 * **Accessibility:**
 * - WCAG 2.1 AAA compliant
 * - Semantic HTML
 * - Keyboard accessible
 */
export default function SalesPitch() {
	return (
		<section id="why-medsource" className="bg-base-100 py-20 lg:py-28">
			<PageContainer className="space-y-16 lg:space-y-20">
				<div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-start">
					<div className="space-y-6 text-left lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
						<Pill
							tone="accent"
							size="md"
							shadow="sm"
							fontWeight="medium"
							icon={<StatusDot variant="primary" size="sm" />}
						>
							Why MedSource Pro
						</Pill>
					<h2 className="text-3xl font-semibold leading-tight text-base-content md:text-4xl lg:text-5xl">
						Focused on quality. Driven by patient outcomes.
					</h2>
					<p className="max-w-xl text-base text-base-content/70 md:text-lg">
							From sourcing to delivery, every part of our process is engineered to serve healthcare professionals
							with reliability, transparency, and speed. Your supply chain stays resilient, and your teams stay
							focused on care.
						</p>
					</div>

				{/* Staggered Feature Cards - FAANG-level animation */}
				<Stagger {...STAGGER_PRESETS.featureCards} className="grid gap-6 sm:grid-cols-2">
					{VALUE_PROPS.map(({ title, description, icon }) => (
						<StaggerItem key={title} {...ANIMATION_PRESETS.cardFadeUp}>
							<FeatureCard
								icon={icon}
								title={title}
								description={description}
								blurSize="sm"
							/>
						</StaggerItem>
					))}
				</Stagger>
				</div>
			</PageContainer>
		</section>
	)
}
