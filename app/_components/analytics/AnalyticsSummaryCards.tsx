/**
 * AnalyticsSummaryCards Component
 *
 * Container component for displaying summary financial metrics.
 * Shows revenue, profit, orders, and profit margin in a responsive grid.
 *
 * **Features:**
 * - Responsive grid layout (1 col mobile → 2 cols tablet → 4 cols desktop)
 * - Loading skeleton support
 * - Empty state handling
 * - Comprehensive logging and error handling
 *
 * @module components/analytics/AnalyticsSummaryCards
 */

import { useEffect } from 'react'

import { logger } from '@_core'

import { formatFinanceCurrency, formatFinanceNumber } from '@_lib'

import type FinanceNumbers from '@_classes/FinanceNumbers'

import EmptyState from '@_components/common/EmptyState'

import { SummaryCardSkeleton } from './AnalyticsLoadingSkeleton'
import AnalyticsSummaryCard from './AnalyticsSummaryCard'

// Component name for logging (FAANG-level best practice)
const COMPONENT_NAME = 'AnalyticsSummaryCards'

interface AnalyticsSummaryCardsProps {
	/** Finance numbers data */
	financeNumbers: FinanceNumbers
	/** Profit margin value (calculated) */
	profitMarginValue: number
	/** Whether data is loading */
	isLoading: boolean
	/** Whether initial load has completed */
	hasLoaded: boolean
	/** Whether data is available */
	hasData: boolean
}

/**
 * AnalyticsSummaryCards Component
 *
 * Displays summary cards with key financial metrics.
 *
 * @param props - Component props
 * @returns Summary cards section
 */
export default function AnalyticsSummaryCards({
	financeNumbers,
	profitMarginValue,
	isLoading,
	hasLoaded,
	hasData,
}: AnalyticsSummaryCardsProps) {
	// No mount or state change logging - excessive and impacts performance

	// Validate profit margin calculation
	useEffect(() => {
		if (hasData && !Number.isFinite(profitMarginValue)) {
			logger.warn('Invalid profit margin value calculated', {
				component: COMPONENT_NAME,
				profitMarginValue,
				revenue: financeNumbers.sales.totalRevenue,
				profit: financeNumbers.sales.totalProfit,
			})
		}
	}, [profitMarginValue, hasData, financeNumbers.sales.totalRevenue, financeNumbers.sales.totalProfit])

	try {
		if (isLoading && !hasLoaded) {
			return (
				<section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<SummaryCardSkeleton key={i} />
					))}
				</section>
			)
		}

		if (!hasData) {
			return (
				<EmptyState
					title='No financial data available'
					description='Financial analytics data will appear here once orders and transactions are processed.'
				/>
			)
		}

		const summaryCards = [
			{
				title: 'Total Revenue',
				value: formatFinanceCurrency(financeNumbers.sales.totalRevenue),
				borderClass: 'border-primary/20',
				bgClass: 'bg-primary/10',
				titleClass: 'text-primary',
			},
			{
				title: 'Total Profit',
				value: formatFinanceCurrency(financeNumbers.sales.totalProfit),
				borderClass: 'border-success/20',
				bgClass: 'bg-success/10',
				titleClass: 'text-success',
			},
			{
				title: 'Total Orders',
				value: formatFinanceNumber(financeNumbers.orders.totalOrders),
				borderClass: 'border-warning/20',
				bgClass: 'bg-warning/10',
				titleClass: 'text-warning',
			},
			{
				title: 'Profit Margin',
				value: `${profitMarginValue.toFixed(1)}%`,
				borderClass: 'border-info/20',
				bgClass: 'bg-info/10',
				titleClass: 'text-info',
			},
		]

		return (
			<section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{summaryCards.map((card) => (
					<AnalyticsSummaryCard
						key={card.title}
						title={card.title}
						value={card.value}
						borderClass={card.borderClass}
						bgClass={card.bgClass}
						titleClass={card.titleClass}
					/>
				))}
			</section>
		)
	} catch (error) {
		logger.error('AnalyticsSummaryCards: Rendering error', {
			component: COMPONENT_NAME,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		})
		// Return empty state on error to prevent crash
		return (
			<EmptyState
				title='Error loading analytics'
				description='Unable to display financial metrics. Please refresh the page or contact support.'
			/>
		)
	}
}
