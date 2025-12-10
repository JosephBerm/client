/**
 * Product Pricing Card Component
 * 
 * Displays pricing information and quote request CTA.
 * Server component - no client-side interactivity needed.
 * 
 * @module ProductDetail/ProductPricingCard
 */

import Link from 'next/link'

import { ArrowLeft, Info, CheckCircle2 } from 'lucide-react'

import { Routes } from '@_features/navigation'

import { Product } from '@_classes/Product'

import { ANIMATION_DELAYS, PRICING_LABELS, SECTION_LABELS } from './ProductDetail.constants'

export interface ProductPricingCardProps {
	/** Product instance */
	product: Product
}

/**
 * Product Pricing Card
 * 
 * Renders pricing card with quote-based pricing info and CTA button.
 */
export default function ProductPricingCard({ product }: ProductPricingCardProps) {
	return (
		<div
			className="animate-elegant-reveal overflow-hidden rounded-3xl border border-base-200 bg-base-100 p-8 shadow-xl shadow-base-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-base-200/70"
			style={{ animationDelay: ANIMATION_DELAYS.PRICING }}
		>
			<div className="mb-8">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium uppercase tracking-wider text-base-content/40">
							{SECTION_LABELS.PRICING}
						</p>
						<div className="mt-1 flex items-center gap-3">
							<span className="text-3xl font-bold text-base-content">
								{PRICING_LABELS.QUOTE_BASED}
							</span>
						</div>
					</div>
					<div className="rounded-full bg-base-200/50 p-2 backdrop-blur-sm">
						<Info className="h-5 w-5 text-base-content/40" />
					</div>
				</div>
				<p className="mt-4 text-sm leading-relaxed text-base-content/60">
					{PRICING_LABELS.DESCRIPTION}
				</p>
			</div>

			<div className="space-y-4">
				<Link
					href={Routes.Contact.withProduct(product.id)}
					className="btn btn-primary btn-lg w-full gap-3 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30"
				>
					{PRICING_LABELS.REQUEST_QUOTE}
					<ArrowLeft className="h-5 w-5 rotate-180" />
				</Link>
				<div className="flex items-center justify-center gap-2 text-xs text-base-content/40">
					<CheckCircle2 className="h-3.5 w-3.5" />
					<span>{PRICING_LABELS.NO_COMMITMENT}</span>
				</div>
			</div>
		</div>
	)
}

