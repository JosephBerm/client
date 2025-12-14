/**
 * @fileoverview Store Page Header Component
 * 
 * Enhanced header component for the store catalog page.
 * Displays title, description, quote-based pricing info, and quick quote guarantee.
 * 
 * **Business Flow Compliance (Sections 1 & 4):**
 * - Clearly communicates quote-based pricing model
 * - Shows Quick Quote Guarantee (24-48hr turnaround)
 * - Informs customers that prices are provided upon request
 * - Sets expectations for the ordering process
 * - Highlights dedicated sales rep differentiator
 * 
 * **FAANG Best Practice:**
 * - Single responsibility (displays header only)
 * - No state or side effects
 * - Fully reusable and testable
 * - Mobile-first responsive design
 * 
 * @see business_flow.md Section 1 - DISCOVERY & BROWSING
 * @see business_flow.md Section 4 - Competitive Advantages
 * @module components/store/StoreHeader
 * @category Components
 */

'use client'

import { memo } from 'react'

import { 
	FileText, 
	Clock, 
	UserCheck,
	Zap,
} from 'lucide-react'

export interface StoreHeaderProps {
	/** Page title */
	title?: string
	/** Page description */
	description?: string
	/** Whether to show quote info badges */
	showQuoteInfo?: boolean
	/** Whether to show the quick quote guarantee badge */
	showQuickQuoteGuarantee?: boolean
}

/**
 * Store catalog page header
 * 
 * Includes quote-based pricing messaging and competitive advantage
 * highlights per business_flow.md requirements.
 * 
 * @component
 */
function StoreHeader({
	title = 'Medical Supply Store',
	description = 'Browse our catalog of quality medical supplies. Add products to your cart and request a personalized quote.',
	showQuoteInfo = true,
	showQuickQuoteGuarantee = true,
}: StoreHeaderProps) {
	return (
		<div className="border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30">
			<div className="container mx-auto px-4 py-6 md:px-8 md:py-10 max-w-screen-2xl">
				{/* Title and Description */}
				<div className="max-w-3xl">
					<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-3">
						{title}
					</h1>
					<p className="text-sm md:text-base text-base-content/70 leading-relaxed">
						{description}
					</p>
				</div>
				
				{/* Quick Quote Guarantee Banner - Business Flow Section 4.1.1 */}
				{showQuickQuoteGuarantee && (
					<div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
						<div className="flex flex-col sm:flex-row sm:items-center gap-4">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-primary/10 rounded-full">
									<Zap className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-sm md:text-base font-semibold text-primary">
										Quick Quote Guarantee
									</h2>
									<p className="text-xs md:text-sm text-base-content/70">
										Receive your personalized quote within 24-48 hours
									</p>
								</div>
							</div>
							<div className="hidden sm:block h-10 w-px bg-primary/20" />
							<div className="flex items-center gap-2 text-xs md:text-sm text-base-content/70">
								<UserCheck className="w-4 h-4 text-success" />
								<span>Every customer gets a <strong className="text-base-content">dedicated sales rep</strong></span>
							</div>
						</div>
					</div>
				)}
				
				{/* Quote-Based Pricing Info Badges */}
				{showQuoteInfo && (
					<div className="flex flex-wrap gap-3 mt-5">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-200 text-base-content text-xs md:text-sm font-medium">
							<FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
							<span>Quote-based pricing</span>
						</div>
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-200 text-base-content text-xs md:text-sm font-medium">
							<Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-success" />
							<span>Quotes valid 30 days</span>
						</div>
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-200 text-base-content text-xs md:text-sm font-medium">
							<UserCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-info" />
							<span>Dedicated support</span>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default memo(StoreHeader)

