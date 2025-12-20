'use client'

/**
 * RevenueChart Component
 *
 * Line chart visualization for revenue trends over time.
 * Uses CSS-based chart rendering for simplicity.
 *
 * @see prd_analytics.md - Section 5.2 Frontend Components
 * @module analytics/components/RevenueChart
 */

import { TrendingUp, DollarSign } from 'lucide-react'

import Card from '@_components/ui/Card'
import type { RevenueData } from '@_types/analytics.types'

import { formatCurrencyAbbreviated, formatChartDate } from '../_utils'

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
 * Revenue chart component with bar visualization.
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
	height = 250,
}: RevenueChartProps) {
	if (isLoading) {
		return (
			<Card title={title} className="col-span-2">
				<div className="flex items-center justify-center" style={{ height }}>
					<span className="loading loading-spinner loading-lg text-primary"></span>
				</div>
			</Card>
		)
	}

	if (!data.length) {
		return (
			<Card title={title} className="col-span-2">
				<div className="flex flex-col items-center justify-center text-base-content/50" style={{ height }}>
					<TrendingUp className="h-12 w-12 mb-2" />
					<p>No revenue data available</p>
				</div>
			</Card>
		)
	}

	// Calculate max value for scaling
	const maxRevenue = Math.max(...data.map((d) => d.revenue))
	const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
	const totalOrders = data.reduce((sum, d) => sum + d.orderCount, 0)

	return (
		<Card className="col-span-2">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="p-2 bg-primary/10 rounded-lg">
						<DollarSign className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-base-content">{title}</h3>
						<p className="text-sm text-base-content/60">
							Total: {formatCurrencyAbbreviated(totalRevenue)} ({totalOrders} orders)
						</p>
					</div>
				</div>
			</div>

			{/* Chart Container */}
			<div className="relative" style={{ height }}>
				{/* Y-axis labels */}
				<div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-base-content/50">
					<span>{formatCurrencyAbbreviated(maxRevenue)}</span>
					<span>{formatCurrencyAbbreviated(maxRevenue / 2)}</span>
					<span>$0</span>
				</div>

				{/* Chart area */}
				<div className="ml-14 h-full flex items-end gap-1 pb-6">
					{data.map((point, index) => {
						const heightPercent = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0
						return (
							<div
								key={index}
								className="flex-1 flex flex-col items-center group"
								style={{ minWidth: 0 }}
							>
								{/* Bar */}
								<div
									className="w-full bg-primary/20 rounded-t-sm relative group-hover:bg-primary/30 transition-colors"
									style={{ height: `${Math.max(heightPercent, 2)}%` }}
								>
									{/* Tooltip */}
									<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
										<div className="bg-base-300 text-base-content rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap">
											<p className="font-semibold">{formatCurrencyAbbreviated(point.revenue)}</p>
											<p className="text-base-content/60">{point.orderCount} orders</p>
											<p className="text-base-content/60">{formatChartDate(point.date)}</p>
										</div>
									</div>
									{/* Fill bar */}
									<div
										className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all"
										style={{ height: '100%' }}
									/>
								</div>
								{/* X-axis label */}
								<span className="text-[10px] text-base-content/50 mt-1 truncate w-full text-center">
									{formatChartDate(point.date)}
								</span>
							</div>
						)
					})}
				</div>
			</div>
		</Card>
	)
}

export default RevenueChart

