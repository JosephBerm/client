/**
 * PricingStatsCards Component
 *
 * Displays pricing overview statistics in card format.
 * Used on the Pricing Dashboard for quick insights.
 *
 * **PRD Reference:** prd_pricing_engine.md - Admin View UI Elements
 *
 * @module app/pricing/_components/PricingStatsCards
 */

'use client'

import { DollarSign, List, Users, TrendingUp, Activity } from 'lucide-react'

import Card from '@_components/ui/Card'

import type { PricingStats } from './hooks/usePricingOverview'

// =========================================================================
// TYPES
// =========================================================================

interface PricingStatsCardsProps {
	/** Pricing statistics data */
	stats: PricingStats | null
	/** Loading state */
	isLoading?: boolean
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * Displays pricing overview statistics in a grid of cards.
 *
 * @param props - Component props
 * @returns PricingStatsCards component
 */
export default function PricingStatsCards({ stats, isLoading = false }: PricingStatsCardsProps) {
	// Skeleton loading state
	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-4 mb-8">
				{[...Array(4)].map((_, i) => (
					<Card key={i} className="border border-base-300 bg-base-100 p-4 shadow-sm animate-pulse">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-base-300 rounded-lg" />
							<div className="flex-1">
								<div className="h-3 w-20 bg-base-300 rounded mb-2" />
								<div className="h-6 w-10 bg-base-200 rounded" />
							</div>
						</div>
					</Card>
				))}
			</div>
		)
	}

	// No data state
	if (!stats) {
		return null
	}

	const statItems = [
		{
			label: 'Total Price Lists',
			value: stats.totalPriceLists,
			icon: List,
			color: 'primary',
			bgColor: 'bg-primary/10',
		},
		{
			label: 'Active Price Lists',
			value: stats.activePriceLists,
			icon: Activity,
			color: 'success',
			bgColor: 'bg-success/10',
		},
		{
			label: 'Customers with Pricing',
			value: stats.customersWithPricing,
			icon: Users,
			color: 'info',
			bgColor: 'bg-info/10',
		},
		{
			label: 'Products with Volume Tiers',
			value: stats.productsWithVolumeTiers,
			icon: TrendingUp,
			color: 'warning',
			bgColor: 'bg-warning/10',
		},
	]

	return (
		<div className="grid gap-4 md:grid-cols-4 mb-8">
			{statItems.map((item) => (
				<Card key={item.label} className="border border-base-300 bg-base-100 p-4 shadow-sm">
					<div className="flex items-center gap-3">
						<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}>
							<item.icon className={`h-5 w-5 text-${item.color}`} />
						</div>
						<div>
							<p className="text-sm text-base-content/60">{item.label}</p>
							<p className="text-2xl font-bold text-base-content">{item.value}</p>
						</div>
					</div>
				</Card>
			))}
		</div>
	)
}
