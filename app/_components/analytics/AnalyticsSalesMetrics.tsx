/**
 * AnalyticsSalesMetrics Component
 * 
 * Sales performance metrics section.
 * Displays detailed sales-related financial metrics.
 * 
 * **Features:**
 * - Comprehensive logging and error handling
 * - Data validation
 * - Safe formatting
 * 
 * @module components/analytics/AnalyticsSalesMetrics
 */

import { useEffect } from 'react'

import { logger } from '@_core'

import { formatFinanceCurrency } from '@_lib'

import type FinanceNumbers from '@_classes/FinanceNumbers'

import AnalyticsMetricCard from './AnalyticsMetricCard'

// Component name for logging (FAANG-level best practice)
const COMPONENT_NAME = 'AnalyticsSalesMetrics'

interface AnalyticsSalesMetricsProps {
	/** Finance numbers data */
	financeNumbers: FinanceNumbers
	/** Average order value (calculated) */
	averageOrderValueValue: number
	/** Whether data is available */
	hasData: boolean
}

/**
 * AnalyticsSalesMetrics Component
 * 
 * Displays sales performance metrics.
 * 
 * @param props - Component props
 * @returns Sales metrics section
 */
export default function AnalyticsSalesMetrics({
	financeNumbers,
	averageOrderValueValue,
	hasData,
}: AnalyticsSalesMetricsProps) {
	// No mount or state change logging - excessive and impacts performance

	// Validate average order value
	useEffect(() => {
		if (hasData && !Number.isFinite(averageOrderValueValue)) {
			logger.warn('Invalid average order value calculated', {
				component: COMPONENT_NAME,
				averageOrderValueValue,
				revenue: financeNumbers.sales.totalRevenue,
				orders: financeNumbers.orders.totalOrders,
			})
		}
	}, [averageOrderValueValue, hasData, financeNumbers.sales.totalRevenue, financeNumbers.orders.totalOrders])

	try {
		const salesMetrics = [
		{ label: 'Total Sales', value: formatFinanceCurrency(financeNumbers.sales.totalSales) },
		{ label: 'Total Cost', value: formatFinanceCurrency(financeNumbers.sales.totalCost) },
		{ label: 'Total Discount', value: formatFinanceCurrency(financeNumbers.sales.totalDiscount) },
		{ label: 'Total Tax', value: formatFinanceCurrency(financeNumbers.sales.totalTax) },
		{ label: 'Total Shipping', value: formatFinanceCurrency(financeNumbers.sales.totalShipping) },
		{ label: 'Average Order Value', value: formatFinanceCurrency(averageOrderValueValue) },
	]

		// Loading state is handled by parent component
		if (!hasData) {
			return null
		}

		return (
			<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm lg:col-span-2">
				<h3 className="text-base font-semibold text-base-content">Sales Performance</h3>
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					{salesMetrics.map((metric) => (
						<AnalyticsMetricCard key={metric.label} label={metric.label} value={metric.value} />
					))}
				</div>
			</div>
		)
	} catch (error) {
		logger.error('AnalyticsSalesMetrics: Rendering error', {
			component: COMPONENT_NAME,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		})
		// Return null on error to prevent crash (parent handles empty state)
		return null
	}
}
