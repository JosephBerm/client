/**
 * CartSummary Component
 * 
 * Container for the quote request sidebar.
 * Combines QuoteSummaryCard and QuoteRequestForm.
 * 
 * @module components/cart/CartSummary
 */

import type { UseFormReturn } from 'react-hook-form'

import type { QuoteFormData } from '@_core'

import QuoteSummaryCard from './QuoteSummaryCard'
import QuoteRequestForm from './QuoteRequestForm'

export interface CartSummaryProps {
	/** Total number of items (sum of quantities) */
	totalItems: number
	/** Total number of unique products */
	totalProducts: number
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
 * CartSummary Component
 * 
 * Renders the quote request sidebar with summary and form.
 * 
 * @param props - Component props
 * @returns CartSummary component
 */
export default function CartSummary({
	totalItems,
	totalProducts,
	form,
	onSubmit,
	isLoading,
	isAuthenticated,
	onLoginClick,
}: CartSummaryProps) {
	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Quote Information Card */}
			<QuoteSummaryCard
				totalItems={totalItems}
				totalProducts={totalProducts}
			/>

			{/* Quote Request Form */}
			<QuoteRequestForm
				form={form}
				onSubmit={onSubmit}
				isLoading={isLoading}
				isAuthenticated={isAuthenticated}
				onLoginClick={onLoginClick}
			/>
		</div>
	)
}
