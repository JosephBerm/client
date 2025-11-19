import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import DoctorsImage from '@/public/LandingImage1.png'
import PageContainer from '@_components/layouts/PageContainer'
import Button from '@_components/ui/Button'
import Pill from '@_components/ui/Pill'
import StatusDot from '@_components/ui/StatusDot'
import { Reveal, Stagger, StaggerItem, ANIMATION_DURATION, ANIMATION_DELAY, STAGGER_DELAY, ANIMATION_DISTANCE } from '@_components/common/animations'

/**
 * Intro Section
 *
 * Hero section with modern MedSource branding, value proposition, and hero image.
 * Features responsive layout, scroll animations, and persistent gradient backdrop.
 * 
 * **FAANG-level Improvements:**
 * - Gradient outside transform context for consistent rendering
 * - Proper z-index stacking (gradient: -10, content: 0, pill: 10)
 * - Accessibility-first animations (respects reduced motion)
 * - Mobile-first responsive design
 * - Performance-optimized with GPU-accelerated transforms
 * 
 * **Gradient Fix:**
 * The gradient div is positioned outside the Reveal component to avoid
 * Framer Motion's transform context, which can cause blur effects to disappear.
 * Uses `isolate` to create proper stacking context without affecting parent.
 */
export default function Intro() {
	return (
		<section id="hero" className="relative overflow-hidden bg-base-100">
			{/* Decorative gradient - no animation needed for background blur */}
				<div
					aria-hidden="true"
					className="absolute inset-x-0 top-0 hidden h-[420px] -translate-y-1/2 bg-gradient-to-b from-base-content/5 via-transparent to-transparent blur-3xl md:block"
				/>

			<PageContainer className="relative grid gap-16 py-20 lg:grid-cols-[1fr_1fr] lg:items-start xl:gap-24">
				<Stagger className="flex flex-col items-start gap-8" staggerDelay={STAGGER_DELAY.standard} delay={ANIMATION_DELAY.quick}>
					<StaggerItem>
						<Pill
							tone="neutral"
							size="md"
							shadow="sm"
							fontWeight="medium"
							icon={<StatusDot variant="success" size="sm" animated />}
						>
							Medical supply specialists
						</Pill>
					</StaggerItem>

					<StaggerItem>
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
					</StaggerItem>

					<StaggerItem width="100%">
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
					</StaggerItem>

					<StaggerItem width="100%">
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
					</StaggerItem>
				</Stagger>

				{/* 
				  Hero Image with Persistent Gradient
				  
				  ARCHITECTURE NOTE: Gradient positioning
				  - Container: isolate + relative (creates stacking context without affecting parent)
				  - Gradient: absolute positioning with -inset-10 (extends beyond container)
				  - Gradient: -z-10 to sit behind image
				  - Image container: z-0 (default, sits above gradient)
				  - Pill: z-10 (explicitly above everything)
				  
				  WHY THIS WORKS:
				  1. `isolate` creates a new stacking context, preventing z-index issues
				  2. Gradient is OUTSIDE the Reveal component (avoids transform context)
				  3. blur-3xl renders correctly without transform interference
				  4. Proper z-index hierarchy ensures layering
				  
				  TIMING STRATEGY:
				  - Image scale: 0.3s delay + 0.7s duration = completes at 1.0s
				  - Pill overlay: 1.1s delay (appears after image settles)
				*/}
				<div className="isolate relative mx-auto max-w-md md:max-w-lg">
					{/* Persistent gradient backdrop - ALWAYS visible */}
						<div
							aria-hidden="true"
						className="pointer-events-none absolute -inset-10 -z-10 rounded-[38px] bg-gradient-to-br from-primary/25 via-accent/10 to-transparent blur-3xl"
						/>
					
					{/* Animated image container */}
					<Reveal variant="scale" delay={ANIMATION_DELAY.standard} duration={ANIMATION_DURATION.standard} width="100%">
						<div className="relative z-0 overflow-hidden rounded-[32px] border border-base-300 bg-base-200 shadow-2xl">
							<Image
								src={DoctorsImage}
								alt="Clinical staff reviewing medical supplies together"
								className="h-auto w-full object-cover"
								priority
							/>

							{/* Status pill overlay - appears after image animation completes */}
							<div className="absolute bottom-6 left-6 z-10">
								<Reveal 
									variant="fade" 
									delay={ANIMATION_DELAY.standard + ANIMATION_DURATION.standard + ANIMATION_DELAY.quick} 
									direction="up" 
									distance={ANIMATION_DISTANCE.sm / 2}
								>
									<Pill
										tone="neutral"
										size="lg"
										shadow="lg"
										fontWeight="semibold"
										icon={<StatusDot variant="success" size="sm" animated />}
									>
										On-time inventory
									</Pill>
								</Reveal>
							</div>
						</div>
					</Reveal>
					</div>
			</PageContainer>
		</section>
	)
}
