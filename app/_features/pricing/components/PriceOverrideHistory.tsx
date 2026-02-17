'use client'

/**
 * Price Override History Component
 *
 * Displays the history of price overrides for a quote item.
 * Shows who made the override, when, and the business justification.
 *
 * **PRD Reference:** prd_pricing_engine.md - Section 4.2 (Sales Manager Stories)
 * > Audit trail requirement for all price overrides
 *
 * @module pricing/components/PriceOverrideHistory
 */

import { Clock, DollarSign, User, FileText, TrendingDown, TrendingUp } from 'lucide-react'

import { formatCurrency } from '@_lib/formatters'
import { formatDate } from '@_lib/dates'
import { useAdminView } from '@_shared'
import { usePriceOverrideHistory } from '../hooks/usePricing'

import Card from '@_components/ui/Card'
import Badge from '@_components/ui/Badge'

// =========================================================================
// TYPES
// =========================================================================

export interface PriceOverrideHistoryProps {
	/** Cart product ID to fetch history for */
	cartProductId: string
	/** Optional class name */
	className?: string
}

// =========================================================================
// COMPONENT
// =========================================================================

export default function PriceOverrideHistory({ cartProductId, className = '' }: PriceOverrideHistoryProps) {
	const { data: history, isLoading, error } = usePriceOverrideHistory(cartProductId)
	const { isAdminViewActive } = useAdminView()

	// Loading state
	if (isLoading) {
		return (
			<Card className={`border border-base-300 bg-base-100 p-4 shadow-sm animate-pulse ${className}`}>
				<div className='h-4 w-32 bg-base-300 rounded mb-4' />
				<div className='space-y-3'>
					{[...Array(2)].map((_, i) => (
						<div
							key={i}
							className='h-16 bg-base-200 rounded'
						/>
					))}
				</div>
			</Card>
		)
	}

	// Error state
	if (error) {
		return (
			<Card className={`border border-error/20 bg-error/5 p-4 ${className}`}>
				<p className='text-sm text-error'>Failed to load override history</p>
			</Card>
		)
	}

	// Empty state
	if (!history || history.length === 0) {
		return (
			<Card className={`border border-base-300 bg-base-100 p-4 shadow-sm ${className}`}>
				<div className='flex items-center gap-2 text-sm text-base-content/60'>
					<Clock className='h-4 w-4' />
					<span>No price overrides recorded</span>
				</div>
			</Card>
		)
	}

	return (
		<Card className={`border border-base-300 bg-base-100 shadow-sm overflow-hidden ${className}`}>
			{/* Header */}
			<div className='p-4 border-b border-base-200 bg-base-200/30'>
				<div className='flex items-center gap-2'>
					<Clock className='h-4 w-4 text-base-content/60' />
					<h4 className='font-medium text-sm text-base-content'>Override History</h4>
					<Badge
						variant='neutral'
						size='sm'>
						{history.length}
					</Badge>
				</div>
			</div>

			{/* History List */}
			<div className='divide-y divide-base-200'>
				{history.map((item) => {
					const difference = item.overriddenPrice - item.originalPrice
					const isIncrease = difference > 0

					return (
						<div
							key={item.id}
							className='p-4 hover:bg-base-50 transition-colors'>
							{/* Price Change */}
							<div className='flex items-center justify-between mb-2'>
								<div className='flex items-center gap-2'>
									<DollarSign className='h-4 w-4 text-base-content/60' />
									<span className='font-medium'>{formatCurrency(item.originalPrice)}</span>
									<span className='text-base-content/40'>→</span>
									<span className='font-bold text-base-content'>
										{formatCurrency(item.overriddenPrice)}
									</span>
								</div>
								<Badge
									variant={isIncrease ? 'error' : 'success'}
									size='sm'>
									{isIncrease ? (
										<TrendingUp className='h-3 w-3 mr-1' />
									) : (
										<TrendingDown className='h-3 w-3 mr-1' />
									)}
									{isIncrease ? '+' : ''}
									{formatCurrency(difference)}
								</Badge>
							</div>

							{/* Reason */}
							<div className='flex items-start gap-2 mb-2'>
								<FileText className='h-4 w-4 text-base-content/40 mt-0.5 shrink-0' />
								<p className='text-sm text-base-content/70 line-clamp-2'>{item.reason}</p>
							</div>

							{/* Metadata */}
							<div className='flex items-center gap-4 text-xs text-base-content/50'>
								{isAdminViewActive && (
									<div className='flex items-center gap-1'>
										<User className='h-3 w-3' />
										<span>{item.overriddenByUserId}</span>
									</div>
								)}
								<div className='flex items-center gap-1'>
									<Clock className='h-3 w-3' />
									<span>{formatDate(item.overriddenAt, 'MMM d, yyyy h:mm a')}</span>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</Card>
	)
}
