'use client'

import { useMemo } from 'react'

import classNames from 'classnames'
import { Clock, Shield, Headphones } from 'lucide-react'

import { useScrollReveal } from '@_shared/hooks'
import { isBusinessOpen } from '@_shared/utils/businessHours'

import Pill from '@_components/ui/Pill'
import StatusDot from '@_components/ui/StatusDot'

import { CONTACT_INFO } from './contact.constants'

/**
 * ContactHeader Component
 * 
 * Header section for the contact page with title, description, and trust indicators.
 * Includes scroll-triggered reveal animation.
 * 
 * **Features:**
 * - Scroll-triggered reveal animation
 * - Real-time business status indicator
 * - Trust indicators (response time, support availability, HIPAA compliance)
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliant
 * 
 * @module contact/ContactHeader
 */
export default function ContactHeader() {
	const isOpen = useMemo(() => isBusinessOpen(), [])

	const headerReveal = useScrollReveal({
		threshold: 0.1,
		rootMargin: '0px 0px -50px 0px',
		index: 0,
	})

	return (
		<header
			ref={headerReveal.ref}
			className={classNames(
				'text-center mb-12 md:mb-16 lg:mb-20 transition-all duration-700',
				{
					'opacity-0 translate-y-6': !headerReveal.hasAnimated,
					'opacity-100 translate-y-0': headerReveal.hasAnimated,
				}
			)}
		>
			<Pill
				tone="primary"
				size="md"
				shadow="sm"
				fontWeight="medium"
				icon={<StatusDot variant={isOpen ? 'success' : 'primary'} size="sm" animated={isOpen} />}
				className="inline-flex mb-6"
			>
				Get in Touch
			</Pill>

			<h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-base-content mb-4 md:mb-6">
				Questions? We&apos;re Here to Help
			</h1>

			<p className="text-base md:text-lg text-base-content/70 max-w-3xl mx-auto mb-8">
				Whether you need a product quote, have questions about our services, or want to discuss your requirements—our team is ready to assist you.
			</p>

			{/* Trust Indicators */}
			<div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-8">
				<div className="flex items-center gap-2 text-sm text-base-content/70">
					<Clock className="h-4 w-4 text-primary" aria-hidden="true" />
					<span className="font-medium">{CONTACT_INFO.responseTime} response time</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-base-content/70">
					<Headphones className="h-4 w-4 text-primary" aria-hidden="true" />
					<span className="font-medium">{CONTACT_INFO.emergencySupport} support available</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-base-content/70">
					<Shield className="h-4 w-4 text-primary" aria-hidden="true" />
					<span className="font-medium">HIPAA compliant</span>
				</div>
			</div>
		</header>
	)
}

