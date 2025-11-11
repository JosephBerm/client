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
		<section id="why-medsource" className="bg-base-100 py-16 lg:py-24">
			<PageContainer>
				<div className="mx-auto flex max-w-5xl flex-col items-center gap-12 text-center">
					<div className="space-y-4">
						<h2 className="text-3xl font-semibold text-base-content md:text-4xl">
							Focused on quality, driven by outcomes.
						</h2>
						<p className="text-base text-base-content/70 md:text-lg">
							From sourcing to delivery, every part of our process is engineered to serve healthcare
							professionals with reliability, transparency, and speed.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						{VALUE_PROPS.map(({ title, description, icon: Icon }) => (
							<div key={title} className="rounded-3xl border border-base-200 bg-base-100/80 p-6 text-left shadow-lg">
								<div className="flex items-start gap-4">
									<span className="rounded-full bg-primary/10 p-3 text-primary">
										<Icon className="h-6 w-6" strokeWidth={1.5} />
									</span>
									<div className="space-y-2">
										<h3 className="text-xl font-semibold text-base-content">{title}</h3>
										<p className="text-base text-base-content/70">{description}</p>
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

