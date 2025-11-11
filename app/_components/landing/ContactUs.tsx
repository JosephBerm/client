import Link from 'next/link'

import PageContainer from '@_components/layouts/PageContainer'

/**
 * Contact Section
 *
 * Call-to-action encouraging visitors to reach out or schedule a consultation.
 */
export default function ContactUs() {
	return (
		<section id="contact" className="bg-primary py-16 text-primary-content lg:py-24">
			<PageContainer className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
				<div className="space-y-4">
					<h2 className="text-3xl font-semibold md:text-4xl">
						Need a sourcing partner you can rely on?
					</h2>
					<p className="text-base md:text-lg text-primary-content/90">
						Our consultants are ready to help you solve procurement challenges, reduce costs, and maintain
						supply continuity.
					</p>
				</div>
				<div className="flex flex-col gap-4 sm:flex-row">
					<Link href="/contact" className="btn btn-secondary btn-lg w-full sm:w-auto">
						Request a consultation
					</Link>
					<a href="tel:+17865782145" className="btn btn-ghost btn-lg w-full border border-primary-content sm:w-auto">
						Call (786) 578-2145
					</a>
				</div>
			</PageContainer>
		</section>
	)
}

