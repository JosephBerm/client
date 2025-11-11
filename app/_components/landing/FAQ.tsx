import PageContainer from '@_components/layouts/PageContainer'

const FAQ_ITEMS = [
	{
		question: 'How quickly can MedSource fulfill urgent orders?',
		answer:
			'Most stocked items ship within 24 hours. For critical shortages, our sourcing team can coordinate expedited fulfillment with partner distributors nationwide.',
	},
	{
		question: 'Do you support contract pricing or bulk purchasing?',
		answer:
			'Yes. We negotiate volume pricing, national GPO contracts, and custom formulary management to meet organizational purchasing requirements.',
	},
	{
		question: 'Can MedSource integrate with our procurement systems?',
		answer:
			'Our catalog and ordering APIs integrate with leading ERP and procurement platforms. We also support curated punchout catalogs for specific departments.',
	},
	{
		question: 'What certifications do your suppliers hold?',
		answer:
			'Every supplier in our network maintains relevant FDA registrations, ISO certifications, and product-specific regulatory clearances verified through routine audits.',
	},
]

/**
 * FAQ Section
 *
 * Provides answers to common questions about MedSource Pro.
 */
export default function FAQ() {
	return (
		<section id="faq" className="bg-base-100 py-16 lg:py-24">
			<PageContainer className="max-w-4xl">
				<div className="space-y-10">
					<div className="text-center">
						<h2 className="text-3xl font-semibold text-base-content md:text-4xl">Frequently asked questions</h2>
						<p className="mt-4 text-base text-base-content/70 md:text-lg">
							Everything you need to know about partnering with MedSource Pro.
						</p>
					</div>

					<div className="space-y-4">
						{FAQ_ITEMS.map((item) => (
							<details
								key={item.question}
								className="group rounded-2xl border border-base-200 bg-base-100 p-6 shadow-sm transition"
							>
								<summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-lg font-semibold text-base-content transition group-open:text-primary">
									<span>{item.question}</span>
									<span className="text-primary group-open:rotate-45 transition-transform">+</span>
								</summary>
								<p className="mt-4 text-base text-base-content/70">{item.answer}</p>
							</details>
						))}
					</div>
				</div>
			</PageContainer>
		</section>
	)
}

