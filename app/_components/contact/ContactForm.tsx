'use client'

import { useState } from 'react'

import classNames from 'classnames'
import { Mail } from 'lucide-react'

import { contactSchema, type ContactFormData } from '@_core'
import { logger } from '@_core'

import { useZodForm, API } from '@_shared'

import { useScrollReveal } from '@_shared/hooks'

import Name from '@_classes/common/Name'
import ContactRequest from '@_classes/ContactRequest'

import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { COMPANY_CONTACT } from '@_lib'

export interface ContactFormProps {
	onSubmitSuccess: () => void
}

/**
 * ContactForm Component
 *
 * Contact form for submitting inquiries to MedSource Pro.
 * Includes scroll-triggered reveal animation.
 *
 * **Features:**
 * - Scroll-triggered reveal animation
 * - Form validation with Zod schema
 * - Loading states during submission
 * - Error handling with logging
 * - Mobile-first responsive design
 * - WCAG 2.1 AA accessibility compliant
 *
 * @module contact/ContactForm
 */
export default function ContactForm({ onSubmitSuccess }: ContactFormProps) {
	const [isLoading, setIsLoading] = useState(false)

	const formReveal = useScrollReveal({
		threshold: 0.1,
		rootMargin: '0px 0px -100px 0px',
		index: 1,
		staggerDelay: 100,
	})

	const form = useZodForm(contactSchema, {
		defaultValues: {
			name: '',
			email: '',
			subject: '',
			message: '',
		},
	})

	/**
	 * Async form submission handler.
	 * Note: React Compiler handles memoization automatically (Next.js 16)
	 */
	const handleSubmitAsync = async (values: ContactFormData) => {
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
				onSubmitSuccess()
			} else {
				logger.error('Contact request failed', {
					statusCode: response.data.statusCode,
					message: response.data.message,
					component: 'ContactForm',
				})
			}
		} catch (error) {
			logger.error('Error sending contact request', {
				error,
				component: 'ContactForm',
			})
		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Form submission handler for React Hook Form.
	 * Wraps async handler to satisfy ESLint's no-misused-promises rule.
	 * React Hook Form supports async handlers, but we need to handle the Promise explicitly.
	 * Note: React Compiler handles memoization automatically (Next.js 16)
	 */
	const handleSubmit = (values: ContactFormData): void => {
		void handleSubmitAsync(values).catch((error) => {
			// Error already handled in handleSubmitAsync, but catch any unhandled rejections
			logger.error('Unhandled form submission error', {
				error,
				component: 'ContactForm',
				action: 'handleSubmit',
			})
		})
	}

	/**
	 * Form onSubmit handler that properly handles React Hook Form's Promise return.
	 * Extracted from JSX for clean code and separation of concerns.
	 * Note: React Compiler handles memoization automatically (Next.js 16)
	 */
	const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		const submitHandler = form.handleSubmit(handleSubmit)
		const result = submitHandler(e)
		// React Hook Form's handleSubmit may return a Promise if handler is async
		// Handle it explicitly to satisfy ESLint's no-misused-promises rule
		if (result instanceof Promise) {
			void result.catch((error) => {
				logger.error('Unhandled form submission error', {
					error,
					component: 'ContactForm',
					action: 'onFormSubmit',
				})
			})
		}
	}

	return (
		<div
			ref={formReveal.ref}
			className={classNames('transition-all duration-700 delay-150', {
				'opacity-0 translate-y-6': !formReveal.hasAnimated,
				'opacity-100 translate-y-0': formReveal.hasAnimated,
			})}>
			<Card
				variant='elevated'
				className='sticky top-[calc(var(--nav-height)+2rem)]'>
				<div className='space-y-6'>
					<div>
						<h2 className='text-2xl md:text-3xl font-semibold text-base-content mb-2'>Send Us a Message</h2>
						<p className='text-sm md:text-base text-base-content/70'>
							Complete the form below and a staff member will contact you within{' '}
							<span className='font-medium text-primary'>{COMPANY_CONTACT.responseTime.standard}</span>{' '}
							during business hours.
						</p>
					</div>

					<form
						onSubmit={onFormSubmit}
						className='space-y-5'>
						<FormInput
							label='Your Name'
							type='text'
							placeholder='John Doe'
							required
							{...form.register('name')}
							error={form.formState.errors.name}
						/>

						<FormInput
							label='Email Address'
							type='email'
							placeholder='your.email@example.com'
							required
							{...form.register('email')}
							error={form.formState.errors.email}
						/>

						<FormInput
							label='Subject'
							type='text'
							placeholder='What is this regarding?'
							required
							{...form.register('subject')}
							error={form.formState.errors.subject}
						/>

						<FormTextArea
							label='Your Message'
							placeholder='Tell us how we can help you...'
							rows={6}
							required
							{...form.register('message')}
							error={form.formState.errors.message}
						/>

						<Button
							type='submit'
							variant='primary'
							fullWidth
							loading={isLoading}
							disabled={isLoading || !form.formState.isValid}
							className='mt-2'
							rightIcon={!isLoading && <Mail className='w-5 h-5' />}>
							{isLoading ? 'Sending...' : 'Send Message'}
						</Button>
					</form>
				</div>
			</Card>
		</div>
	)
}
