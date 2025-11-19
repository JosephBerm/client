'use client'

import ContactMethodCard from '@_components/ui/ContactMethodCard'
import MembersOnlyChatCard from '@_components/ui/MembersOnlyChatCard'
import { useScrollReveal } from '@_shared/hooks'
import { CONTACT_INFO } from './contact.constants'
import classNames from 'classnames'

/**
 * ContactMethods Component
 * 
 * Displays quick contact options (phone, email, live chat).
 * Includes scroll-triggered reveal animation.
 * 
 * **Features:**
 * - Scroll-triggered reveal animation
 * - Multiple contact methods (phone, email, live chat)
 * - Mobile-first responsive grid layout
 * - WCAG 2.1 AA accessibility compliant
 * 
 * @module contact/ContactMethods
 */
export default function ContactMethods() {
	const contactMethodsReveal = useScrollReveal({
		threshold: 0.1,
		rootMargin: '0px 0px -100px 0px',
		index: 2,
		staggerDelay: 100,
	})

	return (
		<div>
			<div
				ref={contactMethodsReveal.ref}
				className={classNames(
					'space-y-6 transition-all duration-700 delay-100',
					{
						'opacity-0 translate-y-6': !contactMethodsReveal.hasAnimated,
						'opacity-100 translate-y-0': contactMethodsReveal.hasAnimated,
					}
				)}
			>
				<h2 className="text-2xl md:text-3xl font-semibold text-base-content">
					Quick Contact Options
				</h2>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
					{/* Phone */}
					<ContactMethodCard
						type="phone"
						title="Call Us"
						mainText={CONTACT_INFO.phone.display}
						description="Speak directly with a sourcing specialist in real time."
						href={CONTACT_INFO.phone.href}
						trackingLocation="contact_page_card"
					/>

					{/* Email */}
					<ContactMethodCard
						type="email"
						title="Email Support"
						mainText={CONTACT_INFO.email.display}
						description="Share requirements or RFQs and receive a tailored response."
						href={CONTACT_INFO.email.href}
						trackingLocation="contact_page_card"
					/>

					{/* Members Only Live Chat - Full width on mobile, spans both columns on tablet+ */}
					<div className={classNames('sm:col-span-2 lg:col-span-1')}>
						<MembersOnlyChatCard trackingLocation="contact_page_card" />
					</div>
				</div>
			</div>
		</div>
	)
}

