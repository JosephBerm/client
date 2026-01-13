'use client'

/**
 * Customer Pricing Card Component
 *
 * Enhanced pricing card that shows customer-specific pricing from the Advanced Pricing Engine.
 * Displays:
 * - Customer's negotiated price (contract pricing)
 * - Discount badge when special pricing applies
 * - Volume tier table with savings indicators
 * - "Request Quote" CTA
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 3 (Customer View)
 * > "Product cards show customer's price (not base price)"
 * > "Volume tier table visible on product detail page"
 *
 * **Features:**
 * - Auto-fetches customer pricing from auth context
 * - Shows discount percentage when contract pricing applies
 * - Displays volume tiers with "next tier" savings
 * - Graceful fallback to quote-based messaging when no special pricing
 *
 * @module ProductDetail/CustomerPricingCard
 */

import { useState } from 'react'
import Link from 'next/link'
import {
	ArrowLeft,
	Info,
	CheckCircle2,
	Sparkles,
	Tag,
	TrendingUp,
	ChevronDown,
	ChevronUp,
} from 'lucide-react'

import { formatCurrency } from '@_lib/formatters'

import { Routes } from '@_features/navigation'
import { useCustomerPricing } from '@_features/pricing'
import { useAuthStore } from '@_features/auth'

import Badge from '@_components/ui/Badge'
import Card from '@_components/ui/Card'

import VolumeTierTable from './VolumeTierTable'
import { ANIMATION_DELAYS, PRICING_LABELS, SECTION_LABELS } from './ProductDetail.constants'

// =========================================================================
// TYPES
// =========================================================================

export interface CustomerPricingCardProps {
	/** Product ID */
	productId: string
	/** Product name (for display) */
	productName?: string
	/** Base price (MSRP) */
	basePrice: number
	/** Current selected quantity */
	quantity?: number
	/** Callback when quantity changes */
	onQuantityChange?: (quantity: number) => void
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Customer Pricing Card Component
 *
 * Renders personalized pricing for authenticated customers.
 * Shows contract pricing, volume discounts, and savings indicators.
 */
export default function CustomerPricingCard({
	productId,
	productName,
	basePrice,
	quantity = 1,
	onQuantityChange,
}: CustomerPricingCardProps) {
	const [showVolumeTiers, setShowVolumeTiers] = useState(false)

	// Get auth state
	const user = useAuthStore((state) => state.user)
	const isAuthenticated = !!user

	// Fetch customer-specific pricing
	const { pricing, volumeSavings, isLoading } = useCustomerPricing(
		productId,
		quantity,
		isAuthenticated
	)

	// Determine display values
	const hasSpecialPricing = pricing?.hasSpecialPricing ?? false
	const finalPrice = pricing?.finalPrice ?? basePrice
	const discountPercent = pricing?.discountPercent ?? 0
	const priceListName = pricing?.priceListName

	// Has volume tiers?
	const hasVolumeTiers = volumeSavings !== null

	return (
		<Card
			className="animate-elegant-reveal overflow-hidden border border-base-200 bg-base-100 shadow-xl shadow-base-200/50 transition-all duration-300 hover:shadow-2xl hover:shadow-base-200/70"
			style={{ animationDelay: ANIMATION_DELAYS.PRICING }}
		>
			{/* Main Pricing Section */}
			<div className="p-6 sm:p-8">
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium uppercase tracking-wider text-base-content/40">
								{SECTION_LABELS.PRICING}
							</p>

							{/* Price Display */}
							<div className="mt-2 flex items-baseline gap-3 flex-wrap">
								{isLoading ? (
									<div className="h-10 w-32 animate-pulse rounded bg-base-200" />
								) : hasSpecialPricing ? (
									<>
										<span className="text-3xl font-bold text-primary">
											{formatCurrency(finalPrice)}
										</span>
										{discountPercent > 0 && (
											<span className="text-lg text-base-content/40 line-through">
												{formatCurrency(basePrice)}
											</span>
										)}
									</>
								) : (
									<span className="text-3xl font-bold text-base-content">
										{PRICING_LABELS.QUOTE_BASED}
									</span>
								)}
							</div>

							{/* Contract Pricing Badge */}
							{hasSpecialPricing && priceListName && (
								<div className="mt-3 flex items-center gap-2">
									<Badge variant="success" size="sm">
										<Sparkles className="mr-1 h-3 w-3" />
										Contract Pricing
									</Badge>
									<span className="text-xs text-base-content/50">{priceListName}</span>
								</div>
							)}

							{/* Discount Badge */}
							{hasSpecialPricing && discountPercent > 0 && (
								<Badge variant="info" size="md" className="mt-2">
									<Tag className="mr-1 h-4 w-4" />
									{discountPercent.toFixed(0)}% OFF
								</Badge>
							)}
						</div>

						{/* Info Icon */}
						<div className="rounded-full bg-base-200/50 p-2 backdrop-blur-sm">
							<Info className="h-5 w-5 text-base-content/40" />
						</div>
					</div>

					{/* Description */}
					{!hasSpecialPricing && (
						<p className="mt-4 text-sm leading-relaxed text-base-content/60">
							{PRICING_LABELS.DESCRIPTION}
						</p>
					)}

					{/* Per-unit for quantities > 1 */}
					{hasSpecialPricing && quantity > 1 && (
						<p className="mt-2 text-sm text-base-content/60">
							{formatCurrency(finalPrice)} × {quantity} = {' '}
							<span className="font-semibold text-base-content">
								{formatCurrency(finalPrice * quantity)}
							</span>
						</p>
					)}
				</div>

				{/* Volume Tier Toggle */}
				{hasVolumeTiers && (
					<button
						type="button"
						onClick={() => setShowVolumeTiers(!showVolumeTiers)}
						className="mb-4 flex w-full items-center justify-between rounded-lg bg-success/5 p-3 text-left transition-colors hover:bg-success/10"
					>
						<div className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-success" />
							<span className="text-sm font-medium text-base-content">
								Volume Discounts Available
							</span>
						</div>
						{showVolumeTiers ? (
							<ChevronUp className="h-4 w-4 text-base-content/60" />
						) : (
							<ChevronDown className="h-4 w-4 text-base-content/60" />
						)}
					</button>
				)}

				{/* Volume Tier Table (Collapsible) */}
				{showVolumeTiers && hasVolumeTiers && (
					<div className="mb-4">
						<VolumeTierTable
							productId={productId}
							basePrice={basePrice}
							currentQuantity={quantity}
							onQuantitySuggestion={onQuantityChange}
						/>
					</div>
				)}

				{/* Next Tier Savings Message */}
				{volumeSavings?.savingsMessage && !showVolumeTiers && (
					<div className="mb-4 flex items-center gap-2 rounded-lg bg-info/10 p-3 text-sm">
						<Tag className="h-4 w-4 text-info" />
						<span className="text-base-content/80">{volumeSavings.savingsMessage}</span>
					</div>
				)}

				{/* CTA Buttons */}
				<div className="space-y-4">
					<Link
						href={Routes.Contact.withProduct(productId)}
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
		</Card>
	)
}
