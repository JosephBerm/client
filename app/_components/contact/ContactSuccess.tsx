'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, Mail, Phone, ArrowRight } from 'lucide-react'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'
import PageContainer from '@_components/layouts/PageContainer'
import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'
import { CONTACT_INFO } from './contact.constants'

export interface ContactSuccessProps {
	onReset?: () => void
}

/**
 * ContactSuccess Component
 * 
 * Success state displayed after successful contact form submission.
 * 
 * **Features:**
 * - Success message with icon
 * - Call-to-action for account creation (if not authenticated)
 * - Quick contact links (phone, email)
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliant
 * 
 * @module contact/ContactSuccess
 */
export default function ContactSuccess({ onReset }: ContactSuccessProps) {
	const router = useRouter()
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

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
									onClick={() => router.push(Routes.openLoginModal())}
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

