import Image from 'next/image'
import Link from 'next/link'

import PageContainer from '@_components/layouts/PageContainer'

const FEATURED_PRODUCTS = [
	{
		name: 'Surgical Masks',
		description: 'ASTM Level 3 protection with breathable, hypoallergenic fabric for clinical environments.',
		priceNote: 'Box of 50',
		image: '/product-sample.png',
	},
	{
		name: 'Nitrile Examination Gloves',
		description: 'Powder-free gloves with textured fingertips for superior grip and tactile sensitivity.',
		priceNote: 'Case of 10 boxes',
		image: '/product-sample.png',
	},
	{
		name: 'Digital Vital Signs Monitor',
		description: 'Multi-parameter monitor with SpO2, NIBP, ECG, and temperature modules included.',
		priceNote: 'Lead time 3-5 days',
		image: '/product-sample.png',
	},
	{
		name: 'Infusion Pump Set',
		description: 'Precision flow control with built-in safety alarms, ideal for acute care settings.',
		priceNote: 'Manufacturer warranty',
		image: '/product-sample.png',
	},
]

const MARQUEE_PRODUCTS = [...FEATURED_PRODUCTS, ...FEATURED_PRODUCTS]

/**
 * Products Carousel
 *
 * Displays featured product spotlights with a desktop marquee animation inspired by the legacy landing page.
 */
export default function ProductsCarousel() {
	return (
		<section id="featured-products" className="bg-[var(--light-gray)] py-20 lg:py-28">
			<PageContainer className="space-y-12">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl space-y-3 text-left">
						<h2 className="text-3xl font-semibold leading-tight text-brand-4 md:text-4xl lg:text-[3rem]">
							Featured inventory ready to ship.
						</h2>
						<p className="text-base text-brand-4/70 md:text-lg">
							Premium supplies sourced from trusted manufacturers, staged in regional warehouses for fast delivery
							across acute, ambulatory, and specialty care settings.
							</p>
						</div>
					<Link
						href="/store"
						className="inline-flex items-center justify-center rounded-full border border-brand-1/30 bg-white px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-brand-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-3 hover:text-brand-3"
					>
						View full catalog
					</Link>
					</div>

				{/* Mobile horizontal scroll */}
				<div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 md:hidden">
						{FEATURED_PRODUCTS.map((product) => (
						<ProductCard key={product.name} {...product} className="min-w-[18rem] shrink-0" />
					))}
				</div>

				{/* Desktop marquee */}
				<div className="marquee-container hidden rounded-[32px] border border-white/40 bg-white/80 py-12 pl-12 pr-20 shadow-[0_24px_48px_rgba(58,71,52,0.15)] md:block">
					<div className="marquee-track gap-10">
						{MARQUEE_PRODUCTS.map((product, index) => (
							<ProductCard key={`${product.name}-${index}`} {...product} className="w-[260px]" />
						))}
					</div>
				</div>
			</PageContainer>
		</section>
	)
}

type ProductCardProps = (typeof FEATURED_PRODUCTS)[number] & { className?: string }

function ProductCard({ name, description, priceNote, image, className }: ProductCardProps) {
	return (
		<article
			className={`group relative flex flex-col gap-4 rounded-3xl border border-brand-1/15 bg-white/95 px-6 py-6 text-left shadow-[0_18px_32px_rgba(41,66,4,0.12)] transition hover:-translate-y-1 hover:shadow-[0_26px_40px_rgba(41,66,4,0.18)] ${className ?? ''}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold text-brand-4">{name}</h3>
					<p className="text-sm text-brand-4/70">{description}</p>
				</div>
				<span className="inline-flex rounded-full bg-[var(--soft-brand-color)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-3">
					{priceNote}
				</span>
			</div>
			<div className="relative mt-2 overflow-hidden rounded-2xl bg-[var(--soft-brand-color)]/60">
				<Image
					src={image}
					alt={name}
					width={320}
					height={200}
					className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
				/>
			</div>
		</article>
	)
}

