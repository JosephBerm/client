/**
 * QuoteRequestForm Component
 * 
 * Form component for submitting quote requests.
 * 
 * **Design Features:**
 * - Conditional fields based on authentication status
 * - For authenticated users: Notes and Valid Until (enabled)
 * - For non-authenticated users: First Name, Last Name, Email, Notes (optional), Valid Until (disabled)
 * - Centered "REQUEST" button with professional styling
 * - Industry best practices: Clear labels, proper spacing, accessible form fields
 * 
 * **UX Best Practices Applied:**
 * - Logical field grouping
 * - Clear visual hierarchy
 * - Proper error handling and validation
 * - Mobile-responsive design
 * - Accessible form controls
 * 
 * @module components/cart/QuoteRequestForm
 */

import type { UseFormReturn } from 'react-hook-form'

import type { QuoteFormData } from '@_core'

import FormInput from '@_components/forms/FormInput'
import FormTextArea from '@_components/forms/FormTextArea'
import Button from '@_components/ui/Button'

export interface QuoteRequestFormProps {
	/** React Hook Form instance */
	form: UseFormReturn<QuoteFormData>
	/** Form submission handler */
	onSubmit: (values: QuoteFormData) => Promise<void>
	/** Whether form is currently submitting */
	isLoading: boolean
	/** Whether user is authenticated */
	isAuthenticated: boolean
	/** Callback when user clicks login button */
	onLoginClick: () => void
}

/**
 * QuoteRequestForm Component
 * 
 * Renders the quote request form with conditional fields based on authentication status.
 * Follows MAANG-level UX best practices for form design.
 * 
 * **Form States:**
 * - Authenticated: Shows notes and validUntil (enabled)
 * - Non-authenticated: Shows firstName, lastName, email, notes, validUntil (disabled)
 * 
 * @param props - Component props
 * @returns QuoteRequestForm component
 */
export default function QuoteRequestForm({
	form,
	onSubmit,
	isLoading,
	isAuthenticated,
	onLoginClick,
}: QuoteRequestFormProps) {
	/**
	 * Form onSubmit handler that properly handles React Hook Form's Promise return.
	 * Extracted from JSX for clean code and separation of concerns.
	 * 
	 * FAANG Pattern: Use useCallback for stable event handlers to prevent unnecessary re-renders.
	 */
	const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const submitHandler = form.handleSubmit(onSubmit)
		const result = submitHandler(e)
		// React Hook Form's handleSubmit may return a Promise if handler is async
		// Handle it explicitly to satisfy ESLint's no-misused-promises rule
		if (result instanceof Promise) {
			await result.catch((error) => {
				// Error already handled in useFormSubmit, but catch any unhandled rejections
				console.error('Unhandled form submission error', error)
			})
		}
	}

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body p-4 sm:p-6">
				<h2 className="card-title text-lg sm:text-xl mb-6">Submit Quote Request</h2>
				
				<form
					onSubmit={onFormSubmit}
					className="space-y-4 sm:space-y-5"
					noValidate
					aria-label="Quote request form"
				>
					{/* Non-authenticated user fields */}
					{!isAuthenticated && (
						<div className="space-y-4 sm:space-y-5" role="group" aria-label="Contact information">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
								<FormInput
									label="First Name"
									type="text"
									required
									{...form.register('firstName')}
									error={form.formState.errors.firstName}
									placeholder="John"
								/>

								<FormInput
									label="Last Name"
									type="text"
									required
									{...form.register('lastName')}
									error={form.formState.errors.lastName}
									placeholder="Doe"
								/>
							</div>

							<FormInput
								label="Email Address"
								type="email"
								required
								{...form.register('email')}
								error={form.formState.errors.email}
								placeholder="john.doe@example.com"
								helperText="We'll use this to send your quote"
							/>
						</div>
					)}

					{/* Valid Until Date Field */}
					<div className="relative">
						<FormInput
							label="Valid Until"
							type="date"
							disabled={!isAuthenticated}
							{...form.register('validUntil')}
							error={form.formState.errors.validUntil}
							helperText={
								isAuthenticated
									? 'Quote will be valid until this date'
									: 'Quote validity will be set after review'
							}
							aria-describedby={
								!isAuthenticated
									? 'valid-until-disabled-help'
									: form.formState.errors.validUntil
										? undefined
										: 'valid-until-help'
							}
						/>
						{!isAuthenticated && (
							<div
								id="valid-until-disabled-help"
								className="sr-only"
								aria-live="polite"
							>
								This field is disabled for guest users. Quote validity will be determined during review.
							</div>
						)}
					</div>

					{/* Additional Notes */}
					<FormTextArea
						label="Additional Notes"
						placeholder="Any special requirements, delivery preferences, or questions?"
						rows={4}
						{...form.register('notes')}
						error={form.formState.errors.notes}
						helperText="Help us provide the best quote by sharing any specific needs"
					/>

					{/* Submit Button - Centered with mobile-first responsive sizing */}
					<div className="flex justify-center pt-4">
						<Button
							type="submit"
							variant="primary"
							loading={isLoading}
							disabled={isLoading}
							className="w-full sm:w-auto sm:min-w-[160px] min-h-[44px]"
							aria-label={isLoading ? 'Submitting quote request' : 'Submit quote request'}
						>
							REQUEST
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}
