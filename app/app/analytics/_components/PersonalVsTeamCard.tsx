'use client'

/**
 * PersonalVsTeamCard Component
 *
 * Shows sales rep's personal performance compared to team average.
 * Used in sales rep analytics view.
 *
 * @see prd_analytics.md - US-ANA-001
 * @module analytics/components/PersonalVsTeamCard
 */

import { UserCheck, Users, TrendingUp, TrendingDown } from 'lucide-react'

import Card from '@_components/ui/Card'

import { formatCurrencyAbbreviated } from '../_utils'

interface PersonalVsTeamCardProps {
	/** Personal conversion rate */
	personalConversionRate: number
	/** Team average conversion rate */
	teamAvgConversionRate: number
	/** Difference from team average */
	conversionVsTeamAvg: number
	/** Personal revenue */
	personalRevenue: number
	/** Team average revenue */
	teamAvgRevenue: number
	/** Whether data is loading */
	isLoading?: boolean
}

/**
 * Personal vs Team comparison card.
 *
 * @example
 * ```tsx
 * <PersonalVsTeamCard
 *   personalConversionRate={52.5}
 *   teamAvgConversionRate={45.0}
 *   conversionVsTeamAvg={7.5}
 *   personalRevenue={125000}
 *   teamAvgRevenue={100000}
 * />
 * ```
 */
export function PersonalVsTeamCard({
	personalConversionRate,
	teamAvgConversionRate,
	conversionVsTeamAvg,
	personalRevenue,
	teamAvgRevenue,
	isLoading = false,
}: PersonalVsTeamCardProps) {
	if (isLoading) {
		return (
			<Card className="col-span-full">
				<div className="flex items-center justify-center h-32">
					<span className="loading loading-spinner loading-lg text-primary"></span>
				</div>
			</Card>
		)
	}

	const isAboveAvg = conversionVsTeamAvg >= 0
	const revenueVsAvg = teamAvgRevenue > 0
		? ((personalRevenue - teamAvgRevenue) / teamAvgRevenue) * 100
		: 0
	const isRevenueAboveAvg = revenueVsAvg >= 0

	return (
		<Card className="col-span-full">
			<div className="flex items-center gap-2 mb-4">
				<div className="p-2 bg-primary/10 rounded-lg">
					<UserCheck className="h-5 w-5 text-primary" />
				</div>
				<h3 className="font-semibold text-base-content">Your Performance vs Team</h3>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Conversion Rate Comparison */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm text-base-content/60">Conversion Rate</span>
						<div className={`badge ${isAboveAvg ? 'badge-success' : 'badge-warning'} gap-1`}>
							{isAboveAvg ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
							{isAboveAvg ? '+' : ''}{conversionVsTeamAvg.toFixed(1)}%
						</div>
					</div>

					<div className="flex items-end gap-4">
						{/* Your rate */}
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<UserCheck className="h-4 w-4 text-primary" />
								<span className="text-xs text-base-content/60">You</span>
							</div>
							<div className="h-8 bg-primary/20 rounded-lg relative overflow-hidden">
								<div
									className="h-full bg-primary rounded-lg transition-all"
									style={{ width: `${Math.min(personalConversionRate, 100)}%` }}
								/>
								<span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-base-content">
									{personalConversionRate.toFixed(1)}%
								</span>
							</div>
						</div>

						{/* Team average */}
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<Users className="h-4 w-4 text-base-content/50" />
								<span className="text-xs text-base-content/60">Team Avg</span>
							</div>
							<div className="h-8 bg-base-300 rounded-lg relative overflow-hidden">
								<div
									className="h-full bg-base-content/30 rounded-lg transition-all"
									style={{ width: `${Math.min(teamAvgConversionRate, 100)}%` }}
								/>
								<span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-base-content/70">
									{teamAvgConversionRate.toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Revenue Comparison */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm text-base-content/60">Revenue</span>
						<div className={`badge ${isRevenueAboveAvg ? 'badge-success' : 'badge-warning'} gap-1`}>
							{isRevenueAboveAvg ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
							{isRevenueAboveAvg ? '+' : ''}{revenueVsAvg.toFixed(1)}%
						</div>
					</div>

					<div className="flex items-end gap-4">
						{/* Your revenue */}
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<UserCheck className="h-4 w-4 text-primary" />
								<span className="text-xs text-base-content/60">You</span>
							</div>
							<div className="text-2xl font-bold text-primary">
								{formatCurrencyAbbreviated(personalRevenue)}
							</div>
						</div>

						{/* Team average */}
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-1">
								<Users className="h-4 w-4 text-base-content/50" />
								<span className="text-xs text-base-content/60">Team Avg</span>
							</div>
							<div className="text-2xl font-bold text-base-content/50">
								{formatCurrencyAbbreviated(teamAvgRevenue)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	)
}

export default PersonalVsTeamCard

