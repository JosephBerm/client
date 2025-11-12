import Link from 'next/link'
import { Activity, TestTube2, Scalpel, Building2 } from 'lucide-react'

import PageContainer from '@_components/layouts/PageContainer'

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
		icon: Scalpel,
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
 * Highlights major product categories available through MedSource Pro.
 */
export default function Products() {
	return (
		<section id="categories" className="bg-base-100 py-20 lg:py-28">
			<PageContainer className="space-y-16">
				<div className="space-y-6 text-center lg:text-left">
					<span className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-brand-color)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-3 shadow-sm shadow-brand-4/5">
						<span className="h-2 w-2 rounded-full bg-brand-1" />
						Product catalog
					</span>
					<div className="lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-10">
						<h2 className="text-3xl font-semibold leading-tight text-brand-4 md:text-4xl lg:text-[3rem]">
							Built for every care setting across your network.
						</h2>
						<p className="mt-4 text-base text-black/70 md:text-lg lg:mt-0">
							Curated assortments for acute care, ambulatory surgery, physician groups, and post-acute markets.
							Consolidated pricing, predictable fulfillment, and SKU rationalization keep teams supplied without
							excess inventory.
						</p>
					</div>
					</div>

				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
					{PRODUCT_CATEGORIES.map(({ name, description, items, icon: Icon }) => (
						<div
							key={name}
							className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-brand-1/10 bg-[var(--soft-brand-color)] px-8 py-9 shadow-[0_18px_38px_rgba(65,103,6,0.10)] transition hover:-translate-y-1 hover:shadow-[0_26px_48px_rgba(41,66,4,0.18)]"
						>
							<div className="absolute -right-7 -top-10 h-28 w-28 rounded-full bg-white/35 blur-3xl transition group-hover:bg-white/50" />
							<div className="relative space-y-4">
								<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-4 shadow shadow-brand-4/10">
									<Icon className="h-6 w-6" strokeWidth={1.5} />
								</span>
								<div className="space-y-2">
									<h3 className="text-xl font-semibold text-brand-4">{name}</h3>
									<p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-3">{items}</p>
								</div>
								<p className="text-base leading-relaxed text-black/70">{description}</p>
							</div>
							<Link
								href="/store"
								className="relative mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold uppercase tracking-[0.25em] text-brand-4 transition group-hover:text-brand-2"
							>
								Explore
								<span className="h-1 w-16 bg-brand-4/30 transition group-hover:bg-brand-4" />
							</Link>
						</div>
						))}
					</div>

				<div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-brand-1/20 bg-[var(--soft-brand-color)]/50 px-6 py-10 text-center lg:flex-row lg:gap-8 lg:px-12">
					<p className="max-w-3xl text-base text-brand-4/80 lg:text-left">
						Need a tailored formulary or bulk purchasing strategy? Our sourcing specialists consolidate vendors,
						lock in volume pricing, and align logistics to your care settings.
					</p>
					<Link
						href="/contact"
						className="inline-flex items-center justify-center rounded-full bg-brand-4 px-8 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-md shadow-brand-5/20 transition hover:-translate-y-0.5 hover:bg-brand-5"
					>
						Schedule a consultation
					</Link>
				</div>
			</PageContainer>
		</section>
	)
}

