/**
 * AnalyticsOrderMetrics Component
 * 
 * Order analytics metrics section.
 * Displays order-related metrics.
 * 
 * **Features:**
 * - Comprehensive logging and error handling
 * - Data validation
 * - Safe formatting
 * 
 * @module components/analytics/AnalyticsOrderMetrics
 */

import { useEffect } from 'react'

import { logger } from '@_core'

import { formatFinanceNumber } from '@_lib'

import type FinanceNumbers from '@_classes/FinanceNumbers'

import AnalyticsMetricCard from './AnalyticsMetricCard'

// Component name for logging (FAANG-level best practice)
const COMPONENT_NAME = 'AnalyticsOrderMetrics'

interface AnalyticsOrderMetricsProps {
	/** Finance numbers data */
	financeNumbers: FinanceNumbers
	/** Products per order value (calculated) */
	productsPerOrderValue: number
	/** Whether data is available */
	hasData: boolean
}

/**
 * AnalyticsOrderMetrics Component
 * 
 * Displays order analytics metrics.
 * 
 * @param props - Component props
 * @returns Order metrics section
 */
export default function AnalyticsOrderMetrics({
	financeNumbers,
	productsPerOrderValue,
	hasData,
}: AnalyticsOrderMetricsProps) {
	// No mount or state change logging - excessive and impacts performance

	// Validate products per order calculation
	useEffect(() => {
		if (hasData && !Number.isFinite(productsPerOrderValue)) {
			logger.warn('Invalid products per order value calculated', {
				component: COMPONENT_NAME,
				productsPerOrderValue,
				totalOrders: financeNumbers.orders.totalOrders,
				totalProductsSold: financeNumbers.orders.totalProductsSold,
			})
		}
	}, [productsPerOrderValue, hasData, financeNumbers.orders.totalOrders, financeNumbers.orders.totalProductsSold])

	if (!hasData) {
		return null
	}

	try {
		const orderMetrics = [
			{ label: 'Total Products Sold', value: formatFinanceNumber(financeNumbers.orders.totalProductsSold) },
			{ label: 'Products per Order', value: Number.isFinite(productsPerOrderValue) ? productsPerOrderValue.toFixed(1) : '0.0' },
		]

		return (
			<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
				<h3 className="text-base font-semibold text-base-content">Order Analytics</h3>
				<div className="mt-4 space-y-4">
					{orderMetrics.map((metric) => (
						<AnalyticsMetricCard key={metric.label} label={metric.label} value={metric.value} />
					))}
				</div>
			</div>
		)
	} catch (error) {
		logger.error('AnalyticsOrderMetrics: Rendering error', {
			component: COMPONENT_NAME,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		})
		// Return null on error to prevent crash (parent handles empty state)
		return null
	}
}
