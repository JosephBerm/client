'use client'

import { useState } from 'react'

import PageContainer from '@_components/layouts/PageContainer'

const FAQ_ITEMS = [
	{
		question: 'How quickly can MedSource fulfill urgent orders?',
		answer:
			'Most stocked items ship within 24 hours. For critical shortages, our sourcing team coordinates expedited fulfillment with partner distributors nationwide and provides live status updates.',
	},
	{
		question: 'Do you support contract pricing or bulk purchasing?',
		answer:
			'Absolutely. We negotiate national and regional GPO agreements, volume-based discounts, and custom formularies to align with your purchasing policies and budget objectives.',
	},
	{
		question: 'Can MedSource integrate with our procurement systems?',
		answer:
			'Yes. Our catalog and ordering APIs integrate with leading ERP and procurement platforms, and we deliver curated punchout experiences tailored to department-level workflows.',
	},
	{
		question: 'What certifications do your suppliers hold?',
		answer:
			'Every supplier in our network maintains relevant FDA registrations, ISO certifications, and product-specific regulatory clearances verified through documented audits.',
	},
]

/**
 * FAQ Section
 *
 * Provides answers to common questions about MedSource Pro.
 */
export default function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(0)

	return (
		<section id="faq" className="bg-base-100 py-20 lg:py-28">
			<PageContainer className="max-w-5xl space-y-12">
				<div className="text-center">
					<span className="badge badge-warning gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.3em] shadow-sm">
						<span className="h-2 w-2 rounded-full bg-warning-content" />
						FAQ
					</span>
					<h2 className="mt-6 text-3xl font-semibold text-base-content md:text-4xl lg:text-5xl">
						Your questions, answered.
					</h2>
					<p className="mt-4 text-base text-base-content/70 md:text-lg">
						Everything you need to know about partnering with MedSource Pro—from sourcing timelines to regulatory
						due diligence.
					</p>
				</div>

				<div className="space-y-4">
					{FAQ_ITEMS.map((item, index) => {
						const isOpen = openIndex === index

						return (
							<div
								key={item.question}
								className="collapse collapse-plus rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-shadow duration-300 hover:shadow-md"
							>
								<input 
									type="checkbox" 
									checked={isOpen} 
									onChange={() => setOpenIndex(isOpen ? null : index)}
								/>
								<div className="collapse-title text-lg font-semibold text-base-content">
									{item.question}
								</div>
								<div className="collapse-content">
									<p className="text-base leading-relaxed text-base-content/70">{item.answer}</p>
								</div>
							</div>
						)
					})}
				</div>
			</PageContainer>
		</section>
	)
}

