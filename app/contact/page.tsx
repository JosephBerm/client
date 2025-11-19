'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Mail, Phone, Clock, Calendar, HelpCircle, ArrowRight, Shield, Headphones } from 'lucide-react'
import { useZodForm } from '@_shared'
import { contactSchema, type ContactFormData } from '@_core'
import { logger } from '@_core'
import { useAuthStore } from '@_features/auth'
import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import Button from '@_components/ui/Button'
import PageContainer from '@_components/layouts/PageContainer'
import Card from '@_components/ui/Card'
import ContactMethodCard from '@_components/ui/ContactMethodCard'
import MembersOnlyChatCard from '@_components/ui/MembersOnlyChatCard'
import Pill from '@_components/ui/Pill'
import StatusDot from '@_components/ui/StatusDot'
import { useScrollReveal } from '@_shared/hooks'
import { API } from '@_shared'
import ContactRequest from '@_classes/ContactRequest'
import Name from '@_classes/common/Name'
import { isBusinessOpen, getGroupedBusinessHours } from '@_shared/utils/businessHours'
import classNames from 'classnames'

/**
 * Contact information configuration
 */
const CONTACT_INFO = {
	phone: {
		display: '(786) 578-2145',
		href: 'tel:+17865782145',
	},
	email: {
		display: 'support@medsourcepro.com',
		href: 'mailto:support@medsourcepro.com',
	},
	responseTime: '2 hours',
	emergencySupport: '24/7',
} as const

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
 */
export default function ContactPage() {
	const router = useRouter()
	const [submitted, setSubmitted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

	// Calculate business status (memoized for performance)
	const isOpen = useMemo(() => isBusinessOpen(), [])
	const businessHours = useMemo(() => getGroupedBusinessHours(), [])

	// Scroll reveal animations
	const headerReveal = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -50px 0px', index: 0 })
	const formReveal = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -100px 0px', index: 1, staggerDelay: 100 })
	const contactMethodsReveal = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -100px 0px', index: 2, staggerDelay: 100 })
	const infoReveal = useScrollReveal({ threshold: 0.1, rootMargin: '0px 0px -100px 0px', index: 3, staggerDelay: 100 })

	const form = useZodForm(contactSchema, {
		defaultValues: {
			name: '',
			email: '',
			subject: '',
			message: '',
		},
	})

	const handleSubmit = async (values: ContactFormData) => {
		setIsLoading(true)

		try {
			// Construct a proper ContactRequest object
			const contactRequest = new ContactRequest({
				name: new Name({
					first: values.name.split(' ')[0] || '',
					middle: '',
					last: values.name.split(' ').slice(1).join(' ') || '',
				}),
				emailAddress: values.email,
				phoneNumber: '', // Optional
				companyName: '', // Optional
				message: `${values.subject}\n\n${values.message}`,
			})

			const response = await API.Public.sendContactRequest(contactRequest)
			
			if (response.data.statusCode === 200) {
				setSubmitted(true)
			} else {
				logger.error('Contact request failed', {
					statusCode: response.data.statusCode,
					message: response.data.message,
					component: 'ContactPage',
				})
			}
		} catch (error) {
			logger.error('Error sending contact request', {
				error,
				component: 'ContactPage',
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Success state with enhanced design
	if (submitted) {
		return (
			<PageContainer className="max-w-3xl py-12 md:py-16">
				<Card
					variant="elevated"
					className="text-center"
					bodyClassName="py-12 md:py-16"
				>
					<div className="flex flex-col items-center space-y-6">
						{/* Success Icon */}
						<div className="relative">
							<div className="absolute inset-0 rounded-full bg-success/20 blur-2xl animate-pulse" aria-hidden="true" />
							<CheckCircle className="relative w-20 h-20 md:w-24 md:h-24 text-success" aria-hidden="true" />
						</div>
						
						{/* Success Message */}
						<div className="space-y-4">
							<h2 className="text-3xl md:text-4xl font-semibold text-base-content">
								Contact Request Sent!
							</h2>
							
							<p className="text-base md:text-lg text-base-content/70 max-w-xl mx-auto">
								Thank you for reaching out to us. A staff member will contact you within{' '}
								<span className="font-semibold text-primary">{CONTACT_INFO.responseTime}</span> during business hours.
							</p>
						</div>

						{/* Additional Actions */}
						{!isAuthenticated && (
							<div className="pt-6 space-y-4 w-full max-w-md">
								<div className="divider" />
								
								<div className="space-y-4">
									<p className="text-lg font-semibold text-base-content">
										Become a valued member and get a direct line to our team!
									</p>
									
									<Button
										variant="primary"
										fullWidth
										onClick={() => router.push('/signup')}
										rightIcon={<ArrowRight className="w-5 h-5" />}
									>
										Create Account
									</Button>
								</div>
							</div>
						)}

						{/* Quick Links */}
						<div className="pt-6 w-full max-w-md">
							<div className="divider" />
							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<a href={CONTACT_INFO.phone.href} className="inline-flex">
									<Button variant="outline" fullWidth leftIcon={<Phone className="w-4 h-4" />}>
										Call Us
									</Button>
								</a>
								<a href={CONTACT_INFO.email.href} className="inline-flex">
									<Button variant="outline" fullWidth leftIcon={<Mail className="w-4 h-4" />}>
										Email Us
									</Button>
								</a>
							</div>
						</div>
					</div>
				</Card>
			</PageContainer>
		)
	}

	return (
		<div className="min-h-screen bg-base-100">
			{/* Subtle background gradient */}
			<div
				aria-hidden="true"
				className="absolute inset-x-0 top-0 hidden h-[420px] -translate-y-1/2 bg-gradient-to-b from-base-content/5 via-transparent to-transparent blur-3xl md:block"
			/>

			<PageContainer className="relative max-w-7xl py-8 md:py-12 lg:py-16">
				{/* Header Section with Scroll Reveal */}
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

				{/* Main Content Grid - Mobile-first responsive */}
				<div className="grid gap-8 lg:gap-12 lg:grid-cols-[1fr_1.2fr] mb-12 md:mb-16">
					{/* Left Column: Contact Methods */}
					<div>
						{/* Contact Methods Cards - Scroll Reveal */}
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

					{/* Right Column: Contact Form - Scroll Reveal */}
					<div
						ref={formReveal.ref}
						className={classNames(
							'transition-all duration-700 delay-150',
							{
								'opacity-0 translate-y-6': !formReveal.hasAnimated,
								'opacity-100 translate-y-0': formReveal.hasAnimated,
							}
						)}
					>
						<Card variant="elevated" className="sticky top-[calc(var(--nav-height)+2rem)]">
							<div className="space-y-6">
								<div>
									<h2 className="text-2xl md:text-3xl font-semibold text-base-content mb-2">
										Send Us a Message
									</h2>
									<p className="text-sm md:text-base text-base-content/70">
										Complete the form below and a staff member will contact you within{' '}
										<span className="font-medium text-primary">{CONTACT_INFO.responseTime}</span> during business hours.
									</p>
								</div>

								<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
									<FormInput
										label="Your Name"
										type="text"
										placeholder="John Doe"
										required
										{...form.register('name')}
										error={form.formState.errors.name}
									/>

									<FormInput
										label="Email Address"
										type="email"
										placeholder="your.email@example.com"
										required
										{...form.register('email')}
										error={form.formState.errors.email}
									/>

									<FormInput
										label="Subject"
										type="text"
										placeholder="What is this regarding?"
										required
										{...form.register('subject')}
										error={form.formState.errors.subject}
									/>

									<FormTextArea
										label="Your Message"
										placeholder="Tell us how we can help you..."
										rows={6}
										required
										{...form.register('message')}
										error={form.formState.errors.message}
									/>

									<Button
										type="submit"
										variant="primary"
										fullWidth
										loading={isLoading}
										disabled={isLoading || !form.formState.isValid}
										className="mt-2"
										rightIcon={!isLoading && <Mail className="w-5 h-5" />}
									>
										{isLoading ? 'Sending...' : 'Send Message'}
									</Button>
								</form>
							</div>
						</Card>
					</div>
				</div>

				{/* Business Hours & Response Info - Scroll Reveal - Horizontal Layout - Below All Content */}
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
			</PageContainer>
		</div>
	)
}

