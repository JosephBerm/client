'use client'

/**
 * Volume Tier Table Component
 *
 * Displays volume pricing tiers for a product on the product detail page.
 * Shows quantity ranges and corresponding prices/discounts.
 *
 * **PRD Reference:** prd_pricing_engine.md - US-PRICE-008
 * > "As a Customer, I want to see volume pricing tiers so I know how much I'll save"
 *
 * **Features:**
 * - Quantity range display (e.g., "1-9 units", "50+ units")
 * - Price per unit at each tier
 * - Savings percentage compared to base price
 * - Active tier highlighting based on current quantity
 * - "Order X more for $Y savings" indicator
 *
 * @module ProductDetail/VolumeTierTable
 */

import { useMemo } from 'react'
import { TrendingUp, Tag, Sparkles } from 'lucide-react'

import { formatCurrency } from '@_lib/formatters'
import { useVolumeTiers } from '@_features/pricing'
import Badge from '@_components/ui/Badge'
import Card from '@_components/ui/Card'

// =========================================================================
// TYPES
// =========================================================================

export interface VolumeTierTableProps {
	/** Product ID to fetch volume tiers for */
	productId: string
	/** Base price of the product (for calculating savings) */
	basePrice: number
	/** Current selected quantity (for highlighting active tier) */
	currentQuantity?: number
	/** Callback when quantity is suggested to change */
	onQuantitySuggestion?: (quantity: number) => void
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Volume Tier Table Component
 *
 * Renders a table of volume pricing tiers with savings indicators.
 * Highlights the currently active tier and shows "next tier" suggestions.
 */
export default function VolumeTierTable({
	productId,
	basePrice,
	currentQuantity = 1,
	onQuantitySuggestion,
}: VolumeTierTableProps) {
	// Fetch volume tiers
	const { data: volumeData, isLoading, error } = useVolumeTiers(productId)

	// Process tiers for display
	const processedTiers = useMemo(() => {
		const tiers = volumeData?.tiers
		if (!tiers || tiers.length === 0) return []

		// Sort by minQuantity
		return [...tiers]
			.sort((a, b) => a.minQuantity - b.minQuantity)
			.map((tier) => {
				const unitPrice = tier.calculatedPrice ?? tier.unitPrice ?? basePrice
				const savings = basePrice - unitPrice
				const savingsPercent = basePrice > 0 ? (savings / basePrice) * 100 : 0

				// Determine if this tier is active
				const isActive =
					currentQuantity >= tier.minQuantity &&
					(tier.maxQuantity === null || currentQuantity <= tier.maxQuantity)

				// Format quantity range
				const quantityRange =
					tier.maxQuantity === null
						? `${tier.minQuantity}+ units`
						: tier.minQuantity === tier.maxQuantity
							? `${tier.minQuantity} unit${tier.minQuantity > 1 ? 's' : ''}`
							: `${tier.minQuantity}-${tier.maxQuantity} units`

				return {
					...tier,
					unitPrice,
					savings,
					savingsPercent,
					isActive,
					quantityRange,
				}
			})
	}, [volumeData, basePrice, currentQuantity])

	// Calculate next tier suggestion
	const nextTierSuggestion = useMemo(() => {
		if (processedTiers.length === 0) return null

		const nextTier = processedTiers.find((tier) => tier.minQuantity > currentQuantity)
		if (!nextTier) return null

		const unitsNeeded = nextTier.minQuantity - currentQuantity
		const currentTier = processedTiers.find((tier) => tier.isActive)
		const currentUnitPrice = currentTier?.unitPrice ?? basePrice
		const savingsPerUnit = currentUnitPrice - nextTier.unitPrice

		if (savingsPerUnit <= 0) return null

		return {
			unitsNeeded,
			targetQuantity: nextTier.minQuantity,
			savingsPerUnit,
			totalSavings: savingsPerUnit * nextTier.minQuantity,
		}
	}, [processedTiers, currentQuantity, basePrice])

	// Don't render if no tiers or loading
	if (isLoading) {
		return (
			<Card className="animate-pulse border border-base-200 bg-base-100 p-4">
				<div className="h-6 w-32 rounded bg-base-200" />
				<div className="mt-4 space-y-2">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-10 rounded bg-base-200" />
					))}
				</div>
			</Card>
		)
	}

	if (error || processedTiers.length === 0) {
		return null // Don't show anything if no volume tiers
	}

	return (
		<Card className="border border-base-200 bg-base-100 shadow-sm overflow-hidden">
			{/* Header */}
			<div className="flex items-center gap-3 border-b border-base-200 bg-gradient-to-r from-success/5 to-transparent p-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
					<TrendingUp className="h-5 w-5 text-success" />
				</div>
				<div>
					<h3 className="font-semibold text-base-content">Volume Pricing</h3>
					<p className="text-sm text-base-content/60">Save more when you order more</p>
				</div>
			</div>

			{/* Tier Table */}
			<div className="overflow-x-auto">
				<table className="table table-sm w-full">
					<thead className="bg-base-200/50">
						<tr>
							<th className="text-left">Quantity</th>
							<th className="text-right">Unit Price</th>
							<th className="text-right">Savings</th>
						</tr>
					</thead>
					<tbody>
						{processedTiers.map((tier, index) => (
							<tr
								key={tier.id || index}
								className={
									tier.isActive
										? 'bg-success/10 font-medium'
										: 'hover:bg-base-200/30 transition-colors'
								}
							>
								{/* Quantity Range */}
								<td className="text-left">
									<div className="flex items-center gap-2">
										<span className={tier.isActive ? 'text-success' : 'text-base-content'}>
											{tier.quantityRange}
										</span>
										{tier.isActive && (
											<Badge variant="success" size="sm">
												<Sparkles className="mr-1 h-3 w-3" />
												Current
											</Badge>
										)}
									</div>
								</td>

								{/* Unit Price */}
								<td className="text-right">
									<span className={tier.isActive ? 'text-success font-bold' : 'text-base-content'}>
										{formatCurrency(tier.unitPrice)}
									</span>
								</td>

								{/* Savings */}
								<td className="text-right">
									{tier.savings > 0 ? (
										<div className="flex flex-col items-end">
											<span className="text-success font-medium">
												Save {formatCurrency(tier.savings)}
											</span>
											<span className="text-xs text-base-content/60">
												({tier.savingsPercent.toFixed(0)}% off)
											</span>
										</div>
									) : (
										<span className="text-base-content/40">—</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Next Tier Suggestion (US-PRICE-008) */}
			{nextTierSuggestion && (
				<div className="border-t border-base-200 bg-info/5 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Tag className="h-4 w-4 text-info" />
							<span className="text-sm text-base-content">
								Order{' '}
								<span className="font-bold text-info">{nextTierSuggestion.unitsNeeded} more</span>{' '}
								for{' '}
								<span className="font-bold text-success">
									{formatCurrency(nextTierSuggestion.totalSavings)} savings
								</span>
							</span>
						</div>
						{onQuantitySuggestion && (
							<button
								type="button"
								onClick={() => onQuantitySuggestion(nextTierSuggestion.targetQuantity)}
								className="btn btn-info btn-xs"
							>
								Update Quantity
							</button>
						)}
					</div>
				</div>
			)}
		</Card>
	)
}
