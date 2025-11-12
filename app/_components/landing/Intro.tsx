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
				className="absolute inset-x-0 top-0 hidden h-[420px] -translate-y-1/2 bg-gradient-to-b from-brand-1/15 via-transparent to-transparent blur-3xl md:block"
			/>

			<PageContainer className="relative grid gap-16 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start xl:gap-24">
				<div className="flex flex-col items-start gap-8">
					<span className="inline-flex items-center gap-2 rounded-full bg-[var(--soft-brand-color)] px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-brand-4 shadow-sm">
						<span className="h-2 w-2 rounded-full bg-brand-1" />
						Medical supply specialists
					</span>

					<header className="space-y-4 text-left">
						<h1 className="text-4xl font-extrabold leading-[1.05] text-brand-1 sm:text-5xl lg:text-[3.75rem]">
							Source smarter. Deliver better.
							<span className="mt-3 block text-2xl font-semibold text-brand-3 sm:text-3xl">
								Everything your practice needs—in one place.
							</span>
						</h1>
						<p className="max-w-xl text-base text-black/70 sm:text-lg">
							MedSource Pro connects care teams with vetted suppliers, curated product catalogs, and
							time-critical logistics so you never compromise on patient outcomes.
						</p>
					</header>

					<div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
						<Link
							href="/store"
							className="inline-flex items-center justify-center rounded-full bg-brand-4 px-10 py-3 text-base font-semibold text-white shadow-xl transition-transform hover:-translate-y-0.5 hover:bg-brand-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-3"
						>
							Browse catalog
							<ArrowUpRight className="ml-2 h-5 w-5" />
						</Link>
						<Link
							href="/contact"
							className="inline-flex items-center justify-center rounded-full border border-brand-1/20 bg-white/90 px-10 py-3 text-base font-semibold text-brand-1 shadow-sm transition-colors hover:bg-[var(--soft-brand-color)] hover:text-brand-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-3"
						>
							Talk to an expert
						</Link>
					</div>

					<ul className="grid w-full grid-cols-2 gap-6 text-left text-sm font-semibold uppercase tracking-[0.12em] text-brand-4 sm:flex sm:flex-wrap sm:gap-10">
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-brand-1">350+</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-brand-3">Suppliers</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-brand-1">1.5k</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-brand-3">
								Healthcare partners
							</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-brand-1">99.2%</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-brand-3">
								On-time deliveries
							</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-brand-1">4.9/5</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-brand-3">
								Satisfaction score
							</span>
						</li>
					</ul>
				</div>

				<div className="relative mx-auto w-full max-w-md md:max-w-lg">
					<div
						aria-hidden="true"
						className="absolute -inset-10 -z-10 rounded-[38px] bg-gradient-to-br from-brand-1/25 via-teal/10 to-transparent blur-3xl"
					/>
					<div className="relative overflow-hidden rounded-[32px] border border-brand-1/20 bg-[var(--soft-brand-color)] shadow-2xl">
						<Image
							src={DoctorsImage}
							alt="Clinical staff reviewing medical supplies together"
							className="h-auto w-full object-cover"
							priority
						/>

						<div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-full bg-white/90 px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-4 shadow-lg backdrop-blur">
							<span className="h-2 w-2 rounded-full bg-brand-1" />
							On-time inventory
						</div>
					</div>
				</div>
			</PageContainer>
		</section>
	)
}
