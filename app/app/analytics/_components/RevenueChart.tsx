'use client'

/**
 * RevenueChart Component (visx)
 *
 * Production-grade revenue visualization using visx.
 * Full MAANG-grade chart with interactivity, tooltips, and accessibility.
 *
 * **Migrated**: Originally CSS-based, now powered by visx AreaChart.
 * See PHASE_7_CLEANUP.md for migration details.
 *
 * @see prd_analytics.md - Section 5.2 Frontend Components
 * @module analytics/components/RevenueChart
 */

import { useMemo } from 'react'
import { isValid, parseISO } from 'date-fns'
import { DollarSign } from 'lucide-react'

import Card from '@_components/ui/Card'
import {
	AreaChart,
	type AreaChartDataPoint,
	ChartHeader,
} from '@_components/charts'
import type { RevenueData } from '@_types/analytics.types'

import { formatCurrencyAbbreviated } from '../_utils'

interface RevenueChartProps {
	/** Revenue data points */
	data: RevenueData[]
	/** Chart title */
	title?: string
	/** Whether data is loading */
	isLoading?: boolean
	/** Chart height in pixels */
	height?: number
}

/**
 * Revenue chart component with area visualization.
 * Built on visx for MAANG-grade quality.
 *
 * @example
 * ```tsx
 * <RevenueChart
 *   data={revenueByMonth}
 *   title="Monthly Revenue"
 *   isLoading={isLoading}
 * />
 * ```
 */
export function RevenueChart({
	data,
	title = 'Revenue Trends',
	isLoading = false,
	height = 280,
}: RevenueChartProps) {
	const normalizedData = useMemo(() => (Array.isArray(data) ? data : []), [data])

	// Transform RevenueData to AreaChartDataPoint
	const chartData = useMemo((): AreaChartDataPoint[] => {
		return normalizedData
			.filter((d) => {
				const parsed = typeof d.date === 'string' ? parseISO(d.date) : new Date(d.date)
				return (
					isValid(parsed) &&
					Number.isFinite(d.revenue) &&
					Number.isFinite(d.orderCount)
				)
			})
			.map((d) => ({
				date: d.date,
				value: d.revenue,
				secondaryValue: d.orderCount,
				secondaryLabel: 'Orders',
			}))
	}, [normalizedData])

	// Calculate totals for subtitle
	const { totalRevenue, totalOrders } = useMemo(() => {
		return normalizedData.reduce(
			(acc, d) => ({
				totalRevenue: acc.totalRevenue + d.revenue,
				totalOrders: acc.totalOrders + d.orderCount,
			}),
			{ totalRevenue: 0, totalOrders: 0 }
		)
	}, [normalizedData])

	const subtitle = chartData.length > 0
		? `Total: ${formatCurrencyAbbreviated(totalRevenue)} (${totalOrders} orders)`
		: undefined

	return (
		<Card className="col-span-2">
			<ChartHeader
				title={title}
				subtitle={subtitle}
				icon={DollarSign}
			/>

			<AreaChart
				data={chartData}
				height={height}
				valueType="currency"
				granularity="month"
				showGradient
				isLoading={isLoading}
				ariaLabel={`${title} - Revenue over time`}
			/>
		</Card>
	)
}

export default RevenueChart
