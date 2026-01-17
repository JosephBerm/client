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
import type { ColumnDef } from '@tanstack/react-table'

import { formatCurrency } from '@_lib/formatters'
import { useVolumeTiers } from '@_features/pricing'
import Badge from '@_components/ui/Badge'
import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import { DataGrid } from '@_components/tables'

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
			<Card className='animate-pulse border border-base-200 bg-base-100 p-4'>
				<div className='h-6 w-32 rounded bg-base-200' />
				<div className='mt-4 space-y-2'>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='h-10 rounded bg-base-200'
						/>
					))}
				</div>
			</Card>
		)
	}

	if (error || processedTiers.length === 0) {
		return null // Don't show anything if no volume tiers
	}

	return (
		<Card className='border border-base-200 bg-base-100 shadow-sm overflow-hidden'>
			{/* Header */}
			<div className='flex items-center gap-3 border-b border-base-200 bg-linear-to-r from-success/5 to-transparent p-4'>
				<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-success/10'>
					<TrendingUp className='h-5 w-5 text-success' />
				</div>
				<div>
					<h3 className='font-semibold text-base-content'>Volume Pricing</h3>
					<p className='text-sm text-base-content/60'>Save more when you order more</p>
				</div>
			</div>

			{/* Tier Table */}
			<div className='overflow-x-auto'>
				<VolumeTierDataGrid tiers={processedTiers} />
			</div>

			{/* Next Tier Suggestion (US-PRICE-008) */}
			{nextTierSuggestion && (
				<div className='border-t border-base-200 bg-info/5 p-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Tag className='h-4 w-4 text-info' />
							<span className='text-sm text-base-content'>
								Order <span className='font-bold text-info'>{nextTierSuggestion.unitsNeeded} more</span>{' '}
								for{' '}
								<span className='font-bold text-success'>
									{formatCurrency(nextTierSuggestion.totalSavings)} savings
								</span>
							</span>
						</div>
						{onQuantitySuggestion && (
							<Button
								type='button'
								onClick={() => onQuantitySuggestion(nextTierSuggestion.targetQuantity)}
								variant='primary'
								size='xs'>
								Update Quantity
							</Button>
						)}
					</div>
				</div>
			)}
		</Card>
	)
}

// =========================================================================
// DATA GRID COMPONENT
// =========================================================================

interface ProcessedTier {
	id?: string | number
	quantityRange: string
	unitPrice: number
	savings: number
	savingsPercent: number
	isActive: boolean
}

interface VolumeTierDataGridProps {
	tiers: ProcessedTier[]
}

/**
 * DataGrid component for displaying volume tiers - mobile-first responsive
 */
function VolumeTierDataGrid({ tiers }: VolumeTierDataGridProps) {
	const columns = useMemo<ColumnDef<ProcessedTier>[]>(
		() => [
			{
				accessorKey: 'quantityRange',
				header: 'Quantity',
				cell: ({ row }) => {
					const tier = row.original
					return (
						<div className='flex items-center gap-1.5 sm:gap-2 flex-wrap'>
							<span className={`text-xs sm:text-sm ${tier.isActive ? 'text-success font-medium' : 'text-base-content'}`}>
								{tier.quantityRange}
							</span>
							{tier.isActive && (
								<Badge
									variant='success'
									size='sm'
									className='text-[10px] sm:text-xs'>
									<Sparkles className='mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3' />
									<span className='hidden sm:inline'>Current</span>
									<span className='sm:hidden'>✓</span>
								</Badge>
							)}
						</div>
					)
				},
				size: 130,
			},
			{
				accessorKey: 'unitPrice',
				header: 'Price',
				cell: ({ row }) => {
					const tier = row.original
					return (
						<span className={`text-xs sm:text-sm text-right block ${tier.isActive ? 'text-success font-bold' : 'text-base-content'}`}>
							{formatCurrency(tier.unitPrice)}
						</span>
					)
				},
				size: 80,
			},
			{
				accessorKey: 'savings',
				header: 'Savings',
				cell: ({ row }) => {
					const tier = row.original
					return tier.savings > 0 ? (
						<div className='flex flex-col items-end text-right'>
							<span className='text-xs sm:text-sm text-success font-medium'>
								{formatCurrency(tier.savings)}
							</span>
							<span className='text-[10px] sm:text-xs text-base-content/60'>
								({tier.savingsPercent.toFixed(0)}% off)
							</span>
						</div>
					) : (
						<span className='text-base-content/40 text-xs sm:text-sm text-right block'>—</span>
					)
				},
				size: 90,
			},
		],
		[]
	)

	return (
		<div className='min-w-[280px]'>
			<DataGrid
				columns={columns}
				data={tiers}
				ariaLabel='Volume pricing tiers'
			/>
		</div>
	)
}
