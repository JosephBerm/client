'use client'

/**
 * TeamLeaderboard Component
 *
 * Displays sales rep performance in a ranked table format.
 * Shows conversion rates, revenue, and other key metrics.
 *
 * @see prd_analytics.md - US-ANA-002
 * @module analytics/components/TeamLeaderboard
 */

import { Trophy, TrendingUp, TrendingDown, Users } from 'lucide-react'

import Card from '@_components/ui/Card'
import type { SalesRepPerformance } from '@_types/analytics.types'

import { formatCurrencyAbbreviated } from '../_utils'

interface TeamLeaderboardProps {
	/** List of sales rep performance data */
	data: SalesRepPerformance[]
	/** Maximum number of rows to display */
	maxRows?: number
	/** Whether data is loading */
	isLoading?: boolean
	/** Click handler for row selection */
	onRowClick?: (salesRepId: string) => void
	/** Title for the card */
	title?: string
}

/**
 * Get rank badge style
 */
function getRankBadge(rank: number): { bg: string; text: string } {
	switch (rank) {
		case 1:
			return { bg: 'bg-yellow-500', text: 'text-yellow-950' }
		case 2:
			return { bg: 'bg-gray-400', text: 'text-gray-950' }
		case 3:
			return { bg: 'bg-amber-600', text: 'text-amber-950' }
		default:
			return { bg: 'bg-base-300', text: 'text-base-content' }
	}
}

/**
 * Team leaderboard table.
 *
 * @example
 * ```tsx
 * <TeamLeaderboard
 *   data={teamPerformance}
 *   maxRows={10}
 *   onRowClick={(id) => router.push(`/analytics/rep/${id}`)}
 * />
 * ```
 */
export function TeamLeaderboard({
	data,
	maxRows = 10,
	isLoading = false,
	onRowClick,
	title = 'Team Performance',
}: TeamLeaderboardProps) {
	if (isLoading) {
		return (
			<Card title={title} className="col-span-full">
				<div className="flex items-center justify-center h-64">
					<span className="loading loading-spinner loading-lg text-primary"></span>
				</div>
			</Card>
		)
	}

	if (!data.length) {
		return (
			<Card title={title} className="col-span-full">
				<div className="flex flex-col items-center justify-center h-64 text-base-content/50">
					<Users className="h-12 w-12 mb-2" />
					<p>No team data available</p>
				</div>
			</Card>
		)
	}

	// Calculate team averages for comparison
	const avgConversion =
		data.reduce((sum, rep) => sum + rep.conversionRate, 0) / data.length
	const avgRevenue = data.reduce((sum, rep) => sum + rep.totalRevenue, 0) / data.length

	// Limit rows
	const displayData = data.slice(0, maxRows)

	return (
		<Card className="col-span-full">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Trophy className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-base-content">{title}</h3>
						<p className="text-sm text-base-content/60">
							Team avg: {avgConversion.toFixed(1)}% conversion, {formatCurrencyAbbreviated(avgRevenue)} revenue
						</p>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="table table-sm">
					<thead>
						<tr className="text-base-content/60">
							<th className="w-12">#</th>
							<th>Sales Rep</th>
							<th className="text-right">Quotes</th>
							<th className="text-right">Converted</th>
							<th className="text-right">Conversion</th>
							<th className="text-right">Revenue</th>
							<th className="text-right">Avg Turnaround</th>
						</tr>
					</thead>
					<tbody>
						{displayData.map((rep, index) => {
							const rank = index + 1
							const rankStyle = getRankBadge(rank)
							const isAboveAvg = rep.conversionRate >= avgConversion

							return (
								<tr
									key={rep.salesRepId}
									className={`hover:bg-base-200 ${onRowClick ? 'cursor-pointer' : ''}`}
									onClick={() => onRowClick?.(rep.salesRepId)}
								>
									{/* Rank */}
									<td>
										<span
											className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rankStyle.bg} ${rankStyle.text}`}
										>
											{rank}
										</span>
									</td>

									{/* Name */}
									<td>
										<div className="font-medium text-base-content">
											{rep.salesRepName || 'Unknown'}
										</div>
										<div className="text-xs text-base-content/60">
											{rep.activeCustomers} active customers
										</div>
									</td>

									{/* Total Quotes */}
									<td className="text-right font-medium">{rep.totalQuotes}</td>

									{/* Converted */}
									<td className="text-right font-medium text-success">
										{rep.convertedQuotes}
									</td>

									{/* Conversion Rate */}
									<td className="text-right">
										<div className="flex items-center justify-end gap-1">
											<span
												className={`font-bold ${
													isAboveAvg ? 'text-success' : 'text-warning'
												}`}
											>
												{rep.conversionRate.toFixed(1)}%
											</span>
											{isAboveAvg ? (
												<TrendingUp className="h-3 w-3 text-success" />
											) : (
												<TrendingDown className="h-3 w-3 text-warning" />
											)}
										</div>
									</td>

									{/* Revenue */}
									<td className="text-right font-medium">
										{formatCurrencyAbbreviated(rep.totalRevenue)}
									</td>

									{/* Turnaround */}
									<td className="text-right text-base-content/60">
										{rep.avgTurnaroundHours.toFixed(0)}h
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			{data.length > maxRows && (
				<div className="mt-4 text-center">
					<span className="text-sm text-base-content/60">
						Showing top {maxRows} of {data.length} team members
					</span>
				</div>
			)}
		</Card>
	)
}

export default TeamLeaderboard

