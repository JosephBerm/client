import { ShieldCheck, PackageCheck, Truck, Headset } from 'lucide-react'

import PageContainer from '@_components/layouts/PageContainer'

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
 * Sales Pitch
 *
 * Highlights the unique value propositions of MedSource Pro with supporting icons.
 */
export default function SalesPitch() {
	return (
		<section id="why-medsource" className="bg-base-100 py-20 lg:py-28">
			<PageContainer className="space-y-16 lg:space-y-20">
				<div className="grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-start">
					<div className="space-y-6 text-left lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
						<span className="badge badge-accent gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.3em] shadow-sm">
							<span className="h-2 w-2 rounded-full bg-accent-content" />
						Why MedSource Pro
					</span>
					<h2 className="text-3xl font-semibold leading-tight text-base-content md:text-4xl lg:text-5xl">
						Focused on quality. Driven by patient outcomes.
					</h2>
					<p className="max-w-xl text-base text-base-content/70 md:text-lg">
							From sourcing to delivery, every part of our process is engineered to serve healthcare professionals
							with reliability, transparency, and speed. Your supply chain stays resilient, and your teams stay
							focused on care.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						{VALUE_PROPS.map(({ title, description, icon: Icon }) => (
							<div
								key={title}
								className="card group relative overflow-hidden rounded-2xl border border-base-300 bg-base-200 px-8 py-10 shadow-sm transition-all duration-300 hover:shadow-xl"
						>
								<div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-base-content/5 blur-2xl transition duration-300 group-hover:bg-base-content/10" />
							<div className="relative flex flex-col gap-4">
								<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-base-300 bg-base-100 text-base-content shadow-sm transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content group-hover:shadow-md">
									<Icon className="h-6 w-6" strokeWidth={1.5} />
								</span>
								<div className="space-y-3">
									<h3 className="text-xl font-semibold text-base-content">{title}</h3>
									<p className="text-base leading-relaxed text-base-content/70">{description}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</PageContainer>
		</section>
	)
}

