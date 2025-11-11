import PageContainer from '@_components/layouts/PageContainer'
import Card from '@_components/ui/Card'

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

/**
 * Products Carousel
 *
 * Displays a horizontal list of featured product categories using the Card component.
 * Uses native horizontal scrolling for mobile accessibility.
 */
export default function ProductsCarousel() {
	return (
		<section id="featured-products" className="bg-base-200 py-16 lg:py-24">
			<PageContainer>
				<div className="flex flex-col gap-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div>
							<h2 className="text-3xl font-semibold text-base-content md:text-4xl">Featured Products</h2>
							<p className="mt-2 max-w-2xl text-base text-base-content/70">
								Premium supplies sourced from trusted manufacturers. Ready for rapid deployment in hospitals,
								clinics, and specialized care facilities.
							</p>
						</div>
						<a href="/store" className="link link-primary text-lg font-medium md:text-base">
							View full catalog →
						</a>
					</div>

					<div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:overflow-visible">
						{FEATURED_PRODUCTS.map((product) => (
							<Card
								key={product.name}
								title={product.name}
								subtitle={product.priceNote}
								image={product.image}
								imageAlt={product.name}
								className="min-w-[18rem] shrink-0 lg:min-w-0"
							>
								<p className="text-base text-base-content/80">{product.description}</p>
							</Card>
						))}
					</div>
				</div>
			</PageContainer>
		</section>
	)
}

