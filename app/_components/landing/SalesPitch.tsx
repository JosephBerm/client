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
						<span className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-brand-color)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-3 shadow-sm shadow-brand-5/10">
							<span className="h-2 w-2 rounded-full bg-brand-1" />
							Why MedSource Pro
						</span>
						<h2 className="text-3xl font-semibold leading-tight text-brand-4 md:text-4xl lg:text-[3rem]">
							Focused on quality. Driven by patient outcomes.
						</h2>
						<p className="max-w-xl text-base text-black/70 md:text-lg">
							From sourcing to delivery, every part of our process is engineered to serve healthcare professionals
							with reliability, transparency, and speed. Your supply chain stays resilient, and your teams stay
							focused on care.
						</p>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						{VALUE_PROPS.map(({ title, description, icon: Icon }) => (
							<div
								key={title}
								className="group relative overflow-hidden rounded-3xl border border-brand-1/10 bg-[var(--soft-brand-color)] px-8 py-10 shadow-[0_18px_40px_rgba(65,103,6,0.12)] transition hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(41,66,4,0.22)]"
							>
								<div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-1/10 blur-2xl transition group-hover:bg-brand-1/20" />
								<div className="relative flex flex-col gap-4">
									<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-4 shadow shadow-brand-4/10">
										<Icon className="h-6 w-6" strokeWidth={1.5} />
									</span>
									<div className="space-y-3">
										<h3 className="text-xl font-semibold text-brand-4">{title}</h3>
										<p className="text-base leading-relaxed text-black/70">{description}</p>
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

