import Image from 'next/image'

import PageLayout from '@_components/layouts/PageLayout'
import Card from '@_components/ui/Card'

import Aboutus11 from '@/public/aboutus11.png'
import Aboutus22 from '@/public/aboutus22.png'
import Aboutus33 from '@/public/aboutus33.png'
import Aboutus44 from '@/public/aboutus44.png'
import Aboutus55 from '@/public/aboutus55.png'

const bullets = [
	{
		title: 'Our Mission',
		description:
			'Our mission at MedSource Pro is to connect healthcare providers with trusted medical supplies and services that improve patient care. By doing so, we help build healthier communities and a more resilient healthcare system.',
		image: Aboutus11,
	},
	{
		title: 'Our Commitment to Quality',
		description:
			'We partner exclusively with vetted manufacturers that meet stringent regulatory standards. Every item in our catalog is evaluated for safety, efficacy, and reliability before it reaches your facility.',
		image: Aboutus22,
	},
	{
		title: 'Personalized Customer Service',
		description:
			'MedSource Pro is built on relationships. Our customer success team supports you from product discovery through post-delivery follow-up, ensuring every interaction feels tailored to your needs.',
		image: Aboutus33,
	},
	{
		title: 'Community Impact',
		description:
			'We invest in community health initiatives and collaborate with nonprofit partners to increase access to essential medical supplies in underserved regions.',
		image: Aboutus44,
	},
	{
		title: 'Join Our Journey',
		description:
			'Whether you run a clinic, manage a hospital, or coordinate care networks, MedSource Pro is here to help you deliver better outcomes. Let’s build the future of healthcare together.',
		image: Aboutus55,
	},
]

export default function AboutPage() {
	return (
		<PageLayout
			title="About MedSource Pro"
			description="Delivering reliable medical supply solutions, exceptional service, and measurable impact for the healthcare organizations we serve."
			maxWidth="xl"
		>
			<section className="rounded-3xl bg-primary/10 p-8 text-center shadow-sm md:p-12">
				<h2 className="text-3xl font-semibold text-primary md:text-4xl">
					Trusted medical supply partners for providers nationwide.
				</h2>
				<p className="mt-4 text-base text-base-content/70 md:text-lg">
					Since our founding, we have focused on harmonizing dependable logistics, curated product sourcing, and
					relationship-driven service to give clinicians the confidence to focus on patient care.
				</p>
			</section>

			<section className="mt-12 grid gap-6 md:grid-cols-2">
				{bullets.map((section) => (
					<Card key={section.title} className="h-full border border-base-200 bg-base-100 shadow-sm" compact={false}>
						<div className="flex flex-col gap-4 lg:flex-row">
							<div className="overflow-hidden rounded-2xl bg-base-200/60 lg:w-1/3">
								<Image src={section.image} alt={section.title} className="h-full w-full object-cover" />
							</div>
							<div className="flex-1 space-y-3">
								<h3 className="text-xl font-semibold text-base-content">{section.title}</h3>
								<p className="text-base text-base-content/70">{section.description}</p>
							</div>
						</div>
					</Card>
				))}
			</section>
		</PageLayout>
	)
}
