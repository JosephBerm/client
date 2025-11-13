import Link from 'next/link'

import PageContainer from '@_components/layouts/PageContainer'

/**
 * Contact Section
 *
 * Call-to-action encouraging visitors to reach out or schedule a consultation.
 */
export default function ContactUs() {
	return (
		<section id="contact" className="relative overflow-hidden bg-primary text-primary-content py-20 lg:py-28">
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%)]"
			/>
			<PageContainer className="relative flex flex-col gap-10 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
				<div className="space-y-6">
					<span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white">
						<span className="h-2 w-2 rounded-full bg-white" />
						Let’s collaborate
					</span>
					<h2 className="text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
						Need a sourcing partner you can rely on?
					</h2>
					<p className="max-w-2xl text-base text-white/80 md:text-lg">
						Our consultants help you solve procurement challenges, reduce total cost of ownership, and maintain
						supply continuity across every care setting.
					</p>
				</div>

				<div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur md:flex-row md:justify-center md:gap-6 md:p-8 lg:w-auto">
				<Link
					href="/contact"
					className="btn btn-secondary shadow-lg transition hover:-translate-y-0.5 text-sm uppercase tracking-[0.3em] md:w-auto"
				>
					Request a consultation
				</Link>
				<a
					href="tel:+17865782145"
					className="btn btn-outline btn-primary-content transition hover:-translate-y-0.5 text-sm uppercase tracking-[0.3em] md:w-auto"
				>
					Call (786) 578-2145
				</a>
				</div>
			</PageContainer>
		</section>
	)
}

