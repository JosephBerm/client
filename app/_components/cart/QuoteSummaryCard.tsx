/**
 * QuoteSummaryCard Component
 * 
 * Summary card showing cart statistics (item count, product count).
 * Presentational component for the quote request sidebar.
 * 
 * @module components/cart/QuoteSummaryCard
 */

import { FileText, Clock } from 'lucide-react'

import Badge from '@_components/ui/Badge'

export interface QuoteSummaryCardProps {
	/** Total number of items (sum of quantities) */
	totalItems: number
	/** Total number of unique products */
	totalProducts: number
}

/**
 * QuoteSummaryCard Component
 * 
 * Displays cart summary statistics with badges and info message.
 * 
 * @param props - Component props
 * @returns QuoteSummaryCard component
 */
export default function QuoteSummaryCard({
	totalItems,
	totalProducts,
}: QuoteSummaryCardProps) {
	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body p-4 sm:p-6">
				<div className="flex items-center gap-2 mb-4">
					<FileText className="w-5 h-5 text-primary" />
					<h2 className="card-title text-lg sm:text-xl">Quote Request</h2>
				</div>
				
				<div className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span className="text-base-content/70">Items in Cart</span>
						<Badge variant="primary" tone="subtle">
							{totalItems} {totalItems === 1 ? 'item' : 'items'}
						</Badge>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-base-content/70">Products</span>
						<Badge variant="info" tone="subtle">
							{totalProducts} {totalProducts === 1 ? 'product' : 'products'}
						</Badge>
					</div>
					<div className="divider my-2"></div>
					<div className="flex items-start gap-2 text-xs sm:text-sm text-base-content/70">
						<Clock className="w-4 h-4 shrink-0 mt-0.5" />
						<p>
							You&apos;ll receive a personalized quote within 24-48 hours. 
							Our team reviews each request to ensure competitive pricing.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
