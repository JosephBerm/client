'use client'

import Link from 'next/link'
import { Calendar, Clock, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react'
import StatusDot from '@_components/ui/StatusDot'
import { useScrollReveal } from '@_shared/hooks'
import { useMemo } from 'react'
import { isBusinessOpen, getGroupedBusinessHours } from '@_shared/utils/businessHours'
import { CONTACT_INFO } from './contact.constants'
import classNames from 'classnames'

/**
 * ContactInfo Component
 * 
 * Displays business hours and response time information.
 * Includes scroll-triggered reveal animation.
 * 
 * **Features:**
 * - Scroll-triggered reveal animation
 * - Real-time business status indicator
 * - Business hours display with timezone
 * - Response time information
 * - FAQ link
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliant
 * 
 * @module contact/ContactInfo
 */
export default function ContactInfo() {
	const isOpen = useMemo(() => isBusinessOpen(), [])
	const businessHours = useMemo(() => getGroupedBusinessHours(), [])

	const infoReveal = useScrollReveal({
		threshold: 0.1,
		rootMargin: '0px 0px -100px 0px',
		index: 3,
		staggerDelay: 100,
	})

	return (
		<div
			ref={infoReveal.ref}
			className={classNames(
				'transition-all duration-700 delay-200',
				{
					'opacity-0 translate-y-6': !infoReveal.hasAnimated,
					'opacity-100 translate-y-0': infoReveal.hasAnimated,
				}
			)}
		>
			<div className="mx-auto max-w-2xl rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl md:p-8">
				<div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
					{/* Business Hours */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Calendar className="h-5 w-5 text-info" aria-hidden="true" />
							<h3 className="text-sm font-semibold uppercase tracking-wider text-base-content">Business Hours</h3>
							{isOpen && (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
									<StatusDot variant="success" size="xs" animated />
									Open Now
								</span>
							)}
						</div>
						<address className="not-italic space-y-4 text-sm text-base-content/70" itemProp="openingHours">
							{businessHours.map((schedule, index) => (
								<div key={index} className="flex items-center justify-between gap-6">
									<span className="font-medium text-base-content/90 min-w-[140px]">{schedule.days}</span>
									{'closed' in schedule ? (
										<span className="text-base-content/50 text-right">Closed</span>
									) : (
										<span className="text-right">{schedule.open} - {schedule.close} {schedule.timezone}</span>
									)}
								</div>
							))}
						</address>
					</div>

					{/* Visual Divider - Hidden on mobile, visible on desktop */}
					<div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-base-300 -translate-x-1/2" aria-hidden="true" />

					{/* Response Times */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5 text-success" aria-hidden="true" />
							<h3 className="text-sm font-semibold uppercase tracking-wider text-base-content">Response Times</h3>
						</div>
						<ul className="space-y-2.5 text-sm text-base-content/70" role="list">
							<li className="flex items-start gap-3">
								<CheckCircle className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
								<span>
									Average response: <span className="font-medium text-primary">{CONTACT_INFO.responseTime}</span> during business hours
								</span>
							</li>
							<li className="flex items-start gap-3">
								<CheckCircle className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
								<span>
									Emergency support available <span className="font-medium text-primary">{CONTACT_INFO.emergencySupport}</span>
								</span>
							</li>
							<li className="flex items-start gap-3">
								<CheckCircle className="h-4 w-4 shrink-0 text-success mt-0.5" aria-hidden="true" />
								<span>Dedicated account managers for enterprise clients</span>
							</li>
						</ul>

						{/* FAQ Link */}
						<div className="pt-4">
							<Link
								href="/#faq"
								className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
							>
								<HelpCircle className="h-4 w-4" aria-hidden="true" />
								View Frequently Asked Questions
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

