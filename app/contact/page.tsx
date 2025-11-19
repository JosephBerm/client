'use client'

import { useState } from 'react'
import PageContainer from '@_components/layouts/PageContainer'
import { ContactHeader, ContactForm, ContactMethods, ContactInfo, ContactSuccess } from '@_components/contact'

/**
 * Contact Page
 *
 * Enhanced contact page with elegant design, multiple contact methods,
 * and improved user experience following FAANG-level best practices.
 *
 * **Features:**
 * - Multiple contact methods (phone, email, live chat, form)
 * - Real-time business hours and availability indicators
 * - Scroll-triggered reveal animations
 * - Mobile-first responsive design
 * - Clear visual hierarchy and CTAs
 * - WCAG 2.1 AA accessibility compliant
 * - Analytics-ready architecture
 *
 * **Component Structure:**
 * - ContactHeader: Page header with title and trust indicators
 * - ContactMethods: Quick contact options (phone, email, chat)
 * - ContactForm: Contact form for submitting inquiries
 * - ContactInfo: Business hours and response time information
 * - ContactSuccess: Success state after form submission
 *
 * @module contact/page
 */
export default function ContactPage() {
	const [submitted, setSubmitted] = useState(false)

	// Success state with enhanced design
	if (submitted) {
		return <ContactSuccess />
	}

	return (
		<div className='min-h-screen bg-base-100'>
			<div
				aria-hidden='true'
				className='absolute inset-x-0 top-0 hidden h-[420px] -translate-y-1/2 bg-gradient-to-b from-base-content/5 via-transparent to-transparent blur-3xl md:block'
			/>

			<PageContainer className='relative max-w-7xl py-8 md:py-12 lg:py-16'>
				<ContactHeader />

				<div className='grid gap-8 lg:gap-12 lg:grid-cols-[1fr_1.2fr] mb-12 md:mb-16'>
					<ContactMethods />

					<ContactForm onSubmitSuccess={() => setSubmitted(true)} />
				</div>

				<ContactInfo />
			</PageContainer>
		</div>
	)
}
