import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import DoctorsImage from '@/public/LandingImage1.png'
import PageContainer from '@_components/layouts/PageContainer'

/**
 * Intro Section
 *
 * Restores the legacy MedSource hero layout with modern Tailwind utilities.
 * Pairs bold typography, brand-aligned CTAs, and complementary hero imagery.
 */
export default function Intro() {
	return (
		<section id="hero" className="relative overflow-hidden bg-base-100">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 hidden h-[420px] -translate-y-1/2 bg-gradient-to-b from-primary/15 via-transparent to-transparent blur-3xl md:block"
			/>

			<PageContainer className="relative grid gap-16 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start xl:gap-24">
				<div className="flex flex-col items-start gap-8">
				<span className="badge badge-lg badge-primary gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] shadow-sm">
					<span className="h-2 w-2 rounded-full bg-primary-content" />
						Medical supply specialists
					</span>

					<header className="space-y-4 text-left">
					<h1 className="text-4xl font-extrabold leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
							Source smarter. Deliver better.
						<span className="mt-3 block text-2xl font-semibold text-primary sm:text-3xl">
								Everything your practice needs—in one place.
							</span>
						</h1>
					<p className="max-w-xl text-base text-base-content/70 sm:text-lg">
							MedSource Pro connects care teams with vetted suppliers, curated product catalogs, and
							time-critical logistics so you never compromise on patient outcomes.
						</p>
					</header>

					<div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
						<Link
							href="/store"
						className="btn btn-primary px-10 py-3 text-base shadow-xl transition-transform hover:-translate-y-0.5"
						>
							Browse catalog
							<ArrowUpRight className="ml-2 h-5 w-5" />
						</Link>
						<Link
							href="/contact"
						className="btn btn-outline btn-primary px-10 py-3 text-base"
						>
							Talk to an expert
						</Link>
					</div>

				<ul className="grid w-full grid-cols-2 gap-6 text-left text-sm font-semibold uppercase tracking-[0.12em] text-base-content sm:flex sm:flex-wrap sm:gap-10">
						<li className="flex flex-col gap-1">
						<span className="text-2xl font-bold text-primary">350+</span>
						<span className="text-xs font-medium uppercase tracking-[0.3em] text-primary/70">Suppliers</span>
						</li>
						<li className="flex flex-col gap-1">
						<span className="text-2xl font-bold text-primary">1.5k</span>
						<span className="text-xs font-medium uppercase tracking-[0.3em] text-primary/70">
								Healthcare partners
							</span>
						</li>
						<li className="flex flex-col gap-1">
						<span className="text-2xl font-bold text-primary">99.2%</span>
						<span className="text-xs font-medium uppercase tracking-[0.3em] text-primary/70">
								On-time deliveries
							</span>
						</li>
						<li className="flex flex-col gap-1">
						<span className="text-2xl font-bold text-primary">4.9/5</span>
						<span className="text-xs font-medium uppercase tracking-[0.3em] text-primary/70">
								Satisfaction score
							</span>
						</li>
					</ul>
				</div>

				<div className="relative mx-auto w-full max-w-md md:max-w-lg">
					<div
						aria-hidden="true"
					className="absolute -inset-10 -z-10 rounded-[38px] bg-gradient-to-br from-primary/25 via-accent/10 to-transparent blur-3xl"
					/>
				<div className="relative overflow-hidden rounded-[32px] border border-base-300 bg-base-200 shadow-2xl">
						<Image
							src={DoctorsImage}
							alt="Clinical staff reviewing medical supplies together"
							className="h-auto w-full object-cover"
							priority
						/>

					<div className="badge badge-primary absolute bottom-6 left-6 flex items-center gap-3 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] shadow-lg backdrop-blur">
						<span className="h-2 w-2 rounded-full bg-primary-content" />
							On-time inventory
						</div>
					</div>
				</div>
			</PageContainer>
		</section>
	)
}
