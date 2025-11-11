import Image from 'next/image'
import Link from 'next/link'

import DoctorsImage from '@/public/LandingImage1.png'
import PageContainer from '@_components/layouts/PageContainer'

/**
 * Intro Section
 *
 * Hero section for the landing page highlighting the core MedSource value
 * proposition with a prominent call-to-action and supporting imagery.
 */
export default function Intro() {
	return (
		<section id="hero" className="relative bg-base-100">
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/10 via-transparent to-transparent" />

			<PageContainer className="relative flex flex-col-reverse items-center gap-12 py-16 md:flex-row md:gap-16 lg:py-24">
				<div className="w-full md:w-1/2">
					<span className="badge badge-primary mb-4">Medical Supply Specialists</span>
					<h1 className="text-4xl font-bold leading-tight text-base-content md:text-5xl lg:text-6xl">
						Your trusted partner for medical supplies and equipment.
					</h1>
					<p className="mt-6 text-lg text-base-content/80 md:text-xl">
						MedSource Pro connects healthcare professionals with curated, reliable, and affordable
						medical supplies—delivered when you need them most.
					</p>

					<div className="mt-8 flex flex-col gap-4 sm:flex-row">
						<Link href="/store" className="btn btn-primary btn-lg w-full sm:w-auto">
							Browse Catalog
						</Link>
						<Link href="/contact" className="btn btn-secondary btn-lg w-full sm:w-auto">
							Talk to an expert
						</Link>
					</div>

					<dl className="mt-10 grid grid-cols-2 gap-6 sm:gap-8">
						<div>
							<dt className="text-sm uppercase text-base-content/70">Suppliers</dt>
							<dd className="text-3xl font-semibold text-base-content">350+</dd>
						</div>
						<div>
							<dt className="text-sm uppercase text-base-content/70">Healthcare partners</dt>
							<dd className="text-3xl font-semibold text-base-content">1.5k</dd>
						</div>
						<div>
							<dt className="text-sm uppercase text-base-content/70">On-time deliveries</dt>
							<dd className="text-3xl font-semibold text-base-content">99.2%</dd>
						</div>
						<div>
							<dt className="text-sm uppercase text-base-content/70">Customer satisfaction</dt>
							<dd className="text-3xl font-semibold text-base-content">4.9/5</dd>
						</div>
					</dl>
				</div>

				<div className="w-full md:w-1/2">
					<div className="relative rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 shadow-2xl">
						<div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-2xl" />
						<Image
							src={DoctorsImage}
							alt="Medical professionals reviewing supplies"
							className="h-auto w-full rounded-2xl object-cover shadow-lg"
							priority
						/>
					</div>
				</div>
			</PageContainer>
		</section>
	)
}

