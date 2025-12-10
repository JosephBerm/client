/**
 * CartSuccessState Component
 * 
 * Success state displayed after successful quote submission.
 * Shows confirmation message and action buttons.
 * 
 * @module components/cart/CartSuccessState
 */

import { CheckCircle } from 'lucide-react'

import Button from '@_components/ui/Button'

export interface CartSuccessStateProps {
	/** Callback when user clicks to continue shopping */
	onContinueShopping: () => void
	/** Callback when user clicks to view quotes */
	onViewQuotes: () => void
	/** Whether to show the "View My Quotes" button */
	showViewQuotes: boolean
}

/**
 * CartSuccessState Component
 * 
 * Displays success confirmation after quote submission with action buttons.
 * 
 * @param props - Component props
 * @returns CartSuccessState component
 */
export default function CartSuccessState({
	onContinueShopping,
	onViewQuotes,
	showViewQuotes,
}: CartSuccessStateProps) {
	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body items-center text-center py-12">
				<CheckCircle className="w-20 h-20 text-success mb-4" />
				
				<h2 className="card-title text-3xl mb-2">Quote Request Submitted!</h2>
				
				<p className="text-base-content/70 mb-6">
					Thank you for your quote request. Our team will review it and get back to you within 24-48 hours with personalized pricing.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
					<Button variant="primary" onClick={onContinueShopping}>
						Continue Shopping
					</Button>
					{showViewQuotes && (
						<Button variant="outline" onClick={onViewQuotes}>
							View My Quotes
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
