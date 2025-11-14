'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { useZodForm } from '@_shared'
import { contactSchema, type ContactFormData } from '@_core'
import { useAuthStore } from '@_features/auth'
import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import Button from '@_components/ui/Button'
import PageContainer from '@_components/layouts/PageContainer'
import { API } from '@_shared'
import ContactRequest from '@_classes/ContactRequest'
import Name from '@_classes/common/Name'

export default function ContactPage() {
	const router = useRouter()
	const [submitted, setSubmitted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

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
				console.error('Contact request failed:', response.data.message)
			}
		} catch (error) {
			console.error('Error sending contact request:', error)
		} finally {
			setIsLoading(false)
		}
	}

	if (submitted) {
		return (
			<PageContainer className="max-w-2xl">
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body items-center text-center py-12">
						<CheckCircle className="w-20 h-20 text-success mb-4" />
						
						<h2 className="card-title text-3xl mb-2">Contact Request Sent!</h2>
						
						<p className="text-base-content/70 mb-6">
							Thank you for reaching out to us. A staff member will contact you within 24 hours.
						</p>

						{!isAuthenticated && (
							<>
								<div className="divider"></div>
								
								<p className="text-lg font-semibold mb-4">
									Become a valued member and get a direct line to our team!
								</p>
								
								<Button
									variant="primary"
									onClick={() => router.push('/signup')}
								>
									Create Account
								</Button>
							</>
						)}
					</div>
				</div>
			</PageContainer>
		)
	}

	return (
		<PageContainer className="max-w-4xl py-8 md:py-12">
			{/* Header */}
			<div className="text-center mb-8 md:mb-12">
				<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-base-content mb-4">
					Have Questions Or Need Assistance?
				</h1>
				
				{isAuthenticated ? (
					<p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto">
						Check out the{' '}
						<Link href="/#faq" className="link link-primary">
							FAQs
						</Link>
						!
						<br />
						Need to speak with a representative? As a valued member, you have access to a
						direct line to a MedSource Pro representative at any time.
					</p>
				) : (
					<p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto">
						Check out the{' '}
						<Link href="/#faq" className="link link-primary">
							FAQs
						</Link>
						!
						<br />
						Connect with a MedSource Pro Representative At Any Time By Becoming a Valued Member!
					</p>
				)}
			</div>

			{/* Contact Form */}
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<h2 className="card-title text-2xl mb-2">Contact Us</h2>
					<p className="text-sm text-base-content/70 mb-6">
						Complete the form below and a staff member will contact you within 24 hours.
					</p>

					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
							className="mt-6"
						>
							Send Message
						</Button>
					</form>
				</div>
			</div>

			{/* Direct Contact Buttons for authenticated users */}
			{isAuthenticated && (
				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
					<a href="tel:+1234567890" className="inline-flex">
						<Button 
							variant="outline" 
							fullWidth
							leftIcon={
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
								</svg>
							}
						>
							Call Us
						</Button>
					</a>
					<a href="mailto:support@medsourcepro.com" className="inline-flex">
						<Button 
							variant="outline" 
							fullWidth
							leftIcon={
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							}
						>
							Email Us
						</Button>
					</a>
					<a href="/medsource-app/support" className="inline-flex">
						<Button 
							variant="outline" 
							fullWidth
							leftIcon={
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
								</svg>
							}
						>
							Live Chat
						</Button>
					</a>
				</div>
			)}
		</PageContainer>
	)
}

