import PageContainer from '@_components/layouts/PageContainer'
import Card from '@_components/ui/Card'

const PRODUCT_CATEGORIES = [
	{
		name: 'Acute Care',
		description: 'Infusion therapy, respiratory care, and monitoring devices ready for critical environments.',
		items: '480+ SKUs',
	},
	{
		name: 'Laboratory & Diagnostics',
		description: 'Point-of-care diagnostics, specimen collection, PPE, and consumables for high-throughput labs.',
		items: '320+ SKUs',
	},
	{
		name: 'Surgical & Sterile',
		description: 'Sterile packs, surgical instruments, and draping solutions with full traceability.',
		items: '260+ SKUs',
	},
	{
		name: 'Facility Essentials',
		description: 'Environmental services, office supplies, and patient-care basics in consolidated shipments.',
		items: '150+ SKUs',
	},
]

/**
 * Products Section
 *
 * Highlights major product categories available through MedSource Pro.
 */
export default function Products() {
	return (
		<section id="categories" className="bg-base-200 py-16 lg:py-24">
			<PageContainer>
				<div className="space-y-12">
					<div className="text-center">
						<h2 className="text-3xl font-semibold text-base-content md:text-4xl">Built for every care setting</h2>
						<p className="mt-4 text-base text-base-content/70 md:text-lg">
							Strategically curated medical supplies spanning acute, ambulatory, and home health settings with
							dedicated sourcing support.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{PRODUCT_CATEGORIES.map((category) => (
							<Card
								key={category.name}
								title={category.name}
								subtitle={category.items}
								className="h-full border border-base-200 bg-base-100"
								shadow={false}
							>
								<p className="text-base text-base-content/70">{category.description}</p>
							</Card>
						))}
					</div>
				</div>
			</PageContainer>
		</section>
	)
}

