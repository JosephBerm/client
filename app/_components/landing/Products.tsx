'use client'

import Link from 'next/link'
import { Activity, TestTube2, Stethoscope, Building2 } from 'lucide-react'

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
 * Highlights major product categories available through MedSource Pro.
 */
export default function Products() {
	return (
		<section id="categories" className="bg-base-100 py-20 lg:py-28">
			<PageContainer className="space-y-16">
				<div className="space-y-6 text-center lg:text-left">
				<span className="badge badge-lg badge-primary gap-2 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] shadow-sm">
					<span className="h-2 w-2 rounded-full bg-primary-content" />
					Product catalog
				</span>
				<div className="lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-10">
					<h2 className="text-3xl font-semibold leading-tight text-base-content md:text-4xl lg:text-[3rem]">
						Built for every care setting across your network.
					</h2>
					<p className="mt-4 text-base text-base-content/70 md:text-lg lg:mt-0">
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
						className="card bg-base-200 group relative flex h-full flex-col justify-between overflow-hidden border border-base-300 px-8 py-9 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
					>
						<div className="absolute -right-7 -top-10 h-28 w-28 rounded-full bg-base-100/35 blur-3xl transition group-hover:bg-base-100/50" />
						<div className="relative space-y-4">
							<span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-base-100 text-primary shadow">
								<Icon className="h-6 w-6" strokeWidth={1.5} />
							</span>
							<div className="space-y-2">
								<h3 className="text-xl font-semibold text-base-content">{name}</h3>
								<p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{items}</p>
							</div>
							<p className="text-base leading-relaxed text-base-content/70">{description}</p>
						</div>
						<Link
							href="/store"
							className="relative mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold uppercase tracking-[0.25em] text-base-content transition group-hover:text-primary"
						>
							Explore
							<span className="h-1 w-16 bg-base-content/30 transition group-hover:bg-primary" />
						</Link>
						</div>
						))}
					</div>

			<div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-base-300 bg-base-200/50 px-6 py-10 text-center lg:flex-row lg:gap-8 lg:px-12">
				<p className="max-w-3xl text-base text-base-content/80 lg:text-left">
					Need a tailored formulary or bulk purchasing strategy? Our sourcing specialists consolidate vendors,
					lock in volume pricing, and align logistics to your care settings.
				</p>
				<Link
					href="/contact"
					className="btn btn-primary px-8 py-3 text-sm uppercase tracking-[0.25em] shadow-md transition hover:-translate-y-0.5"
				>
					Schedule a consultation
				</Link>
			</div>
			</PageContainer>
		</section>
	)
}

