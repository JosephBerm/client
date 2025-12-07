/**
 * QuoteInfoCard Component
 * 
 * Informational card explaining the quote-based pricing model.
 * Presentational component with static content.
 * 
 * @module components/cart/QuoteInfoCard
 */

import { Info } from 'lucide-react'

export interface QuoteInfoCardProps {
	/** Optional custom title */
	title?: string
	/** Optional custom message */
	message?: string
}

/**
 * QuoteInfoCard Component
 * 
 * Displays informational message about the quote-based pricing process.
 * 
 * @param props - Component props
 * @returns QuoteInfoCard component
 */
export default function QuoteInfoCard({
	title = 'Quote-Based Pricing',
	message = 'Our team will review your request and provide personalized pricing within 24-48 hours. This allows us to offer competitive rates tailored to your needs and order volume.',
}: QuoteInfoCardProps) {
	return (
		<div className="card bg-info/10 border border-info/20 shadow-sm">
			<div className="card-body p-4 sm:p-6">
				<div className="flex gap-3 sm:gap-4">
					<Info className="w-5 h-5 sm:w-6 sm:h-6 text-info shrink-0 mt-0.5" />
					<div className="flex-1">
						<h3 className="font-semibold text-base sm:text-lg text-info mb-1">
							{title}
						</h3>
						<p className="text-sm sm:text-base text-base-content/80">
							{message}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
