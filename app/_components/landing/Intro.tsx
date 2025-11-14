import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import DoctorsImage from '@/public/LandingImage1.png'
import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'

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
				className="absolute inset-x-0 top-0 hidden h-[420px] -translate-y-1/2 bg-gradient-to-b from-base-content/5 via-transparent to-transparent blur-3xl md:block"
			/>

			<PageContainer className="relative grid gap-16 py-20 lg:grid-cols-[1fr_1fr] lg:items-start xl:gap-24">
				<div className="flex flex-col items-start gap-8">
					<span className="badge badge-neutral gap-2 px-4 py-3 text-xs font-medium uppercase tracking-[0.3em] shadow-sm">
						<span className="h-2 w-2 animate-pulse rounded-full bg-success" />
						Medical supply specialists
					</span>

					<header className="space-y-4 text-left">
						<h1 className="text-4xl font-extrabold leading-[1.05] text-base-content sm:text-5xl lg:text-6xl">
							Source smarter. Deliver better.
							<span className="mt-3 block text-2xl font-semibold text-base-content/70 sm:text-3xl">
								Everything your practice needs—in one place.
							</span>
						</h1>
					<p className="max-w-xl text-base text-base-content/70 sm:text-lg">
							MedSource Pro connects care teams with vetted suppliers, curated product catalogs, and
							time-critical logistics so you never compromise on patient outcomes.
						</p>
					</header>

					<div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
						<Link href="/store" className="inline-flex">
							<Button
								variant="primary"
								size="lg"
								rightIcon={<ArrowUpRight className="h-5 w-5" />}
								fullWidth
								className="sm:w-auto"
						>
							Browse catalog
							</Button>
						</Link>
						<Link href="/contact" className="inline-flex">
							<Button
								variant="outline"
								size="lg"
								fullWidth
								className="sm:w-auto"
						>
							Talk to an expert
							</Button>
						</Link>
					</div>

				<ul className="grid w-full grid-cols-2 gap-6 text-left text-sm font-semibold uppercase tracking-[0.12em] sm:flex sm:flex-wrap sm:gap-10">
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-base-content/80">350+</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-base-content/50">Suppliers</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-base-content/80">1.5k</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-base-content/50">
								Healthcare partners
							</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-base-content/80">99.2%</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-base-content/50">
								On-time deliveries
							</span>
						</li>
						<li className="flex flex-col gap-1">
							<span className="text-2xl font-bold text-base-content/80">4.9/5</span>
							<span className="text-xs font-medium uppercase tracking-[0.3em] text-base-content/50">
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

						<div className="badge badge-neutral absolute bottom-6 left-6 gap-3 px-6 py-4 text-xs font-semibold uppercase tracking-[0.35em] shadow-lg">
							<span className="h-2 w-2 animate-pulse rounded-full bg-success" />
							On-time inventory
						</div>
					</div>
				</div>
			</PageContainer>
		</section>
	)
}
