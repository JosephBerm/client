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
					<span className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-brand-color)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-3 shadow-sm">
						<span className="h-2 w-2 rounded-full bg-brand-1" />
						FAQ
					</span>
					<h2 className="mt-6 text-3xl font-semibold text-brand-4 md:text-4xl lg:text-[3rem]">
						Your questions, answered.
					</h2>
					<p className="mt-4 text-base text-black/70 md:text-lg">
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
								className="group rounded-3xl border border-brand-1/10 bg-white/90 shadow-[0_20px_36px_rgba(41,66,4,0.12)] transition"
							>
								<button
									type="button"
									onClick={() => setOpenIndex(isOpen ? null : index)}
									className="flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left"
									aria-expanded={isOpen}
								>
									<span className="text-lg font-semibold text-brand-4">{item.question}</span>
									<span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-1/20 bg-white text-brand-4 transition group-hover:bg-brand-4 group-hover:text-white">
										{isOpen ? '–' : '+'}
									</span>
								</button>
								<div
									className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
										isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
									}`}
								>
									<div className="px-6 pb-6 text-base leading-relaxed text-black/70">
										<p>{item.answer}</p>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</PageContainer>
		</section>
	)
}

