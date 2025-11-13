'use client'

import Image from 'next/image'
import Link from 'next/link'

import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'

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
		<section id="featured-products" className="bg-base-200 py-20 lg:py-28">
			<PageContainer className="space-y-12">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl space-y-3 text-left">
						<h2 className="text-3xl font-semibold leading-tight text-base-content md:text-4xl lg:text-5xl">
							Featured inventory ready to ship.
						</h2>
						<p className="text-base text-base-content/70 md:text-lg">
							Premium supplies sourced from trusted manufacturers, staged in regional warehouses for fast delivery
							across acute, ambulatory, and specialty care settings.
						</p>
					</div>
					<Link href="/store" className="inline-flex shrink-0">
						<Button variant="outline" size="md" fullWidth className="sm:w-auto">
						View full catalog
						</Button>
					</Link>
					</div>

				{/* Mobile horizontal scroll */}
				<div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 md:hidden">
					{FEATURED_PRODUCTS.map((product) => (
						<ProductCard key={product.name} product={product} className="min-w-[18rem] shrink-0" />
					))}
				</div>

			{/* Desktop marquee */}
			<div className="marquee-container hidden rounded-[32px] border border-base-300/40 bg-base-100/80 py-12 pl-12 pr-20 shadow-[0_24px_48px_rgba(58,71,52,0.15)] md:block">
					<div className="marquee-track gap-10">
						{MARQUEE_PRODUCTS.map((product, index) => (
							<ProductCard key={`${product.name}-${index}`} product={product} className="w-[260px]" />
						))}
					</div>
				</div>
			</PageContainer>
		</section>
	)
}

type ProductCardProps = {
	product: (typeof FEATURED_PRODUCTS)[number]
	className?: string
}

function ProductCard({ product, className }: ProductCardProps) {
	const { name, description, priceNote, image } = product
	return (
		<article
			className={`card group relative flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 px-6 py-6 text-left shadow-sm transition-all duration-300 hover:shadow-xl ${className ?? ''}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-2">
					<h3 className="text-lg font-semibold text-base-content">{name}</h3>
					<p className="text-sm text-base-content/70">{description}</p>
				</div>
				<span className="badge badge-secondary shrink-0 px-3 py-3 text-xs font-medium uppercase tracking-[0.3em]">
					{priceNote}
				</span>
			</div>
		<div className="relative mt-2 overflow-hidden rounded-2xl bg-base-200/60">
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

