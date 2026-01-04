'use client'

/**
 * ManagerAnalytics View Component
 *
 * Analytics view for Sales Manager and Admin role users.
 * Shows system-wide business intelligence and team performance.
 *
 * **Story**: As a manager/admin, I want to see overall business
 * performance, team metrics, and identify top performers.
 *
 * **Architecture Notes (per Next.js 16 + React 19 best practices):**
 * - Uses React.memo() for shallow prop comparison optimization
 * - Uses useMemo() for expensive derived calculations (avgTurnaround)
 *   per React docs: "useMemo is a React Hook that lets you cache the
 *   result of a calculation between re-renders" - used here because
 *   the reduce operation iterates over teamData array
 * - Direct imports to avoid circular dependencies (no parent barrel imports)
 * - 'use client' boundary at view level (minimal client boundary)
 *
 * @see prd_analytics.md - US-ANA-002 Manager/Admin View
 * @see https://react.dev/reference/react/useMemo
 * @see https://react.dev/reference/react/memo
 * @module analytics/components/views/ManagerAnalytics
 */

import { memo, useMemo } from 'react'

import {
	DollarSign,
	ShoppingCart,
	FileText,
	TrendingUp,
	Package,
	Users,
	Clock,
	CheckCircle,
	Loader,
} from 'lucide-react'

import type { AnalyticsSummary, SalesRepPerformance, RevenueData } from '@_types/analytics.types'

// Direct imports to avoid circular dependencies through barrel files
import { AnalyticsKPICard } from '../AnalyticsKPICard'
import { RevenueChart } from '../RevenueChart'
import { ConversionFunnel } from '../ConversionFunnel'
import { TeamLeaderboard } from '../TeamLeaderboard'
import { formatCurrencyAbbreviated } from '../../_utils/formatters'

// ============================================================================
// TYPES
// ============================================================================

export interface ManagerAnalyticsProps {
	/** Analytics summary data */
	summary: AnalyticsSummary
	/** Team performance data */
	teamData: SalesRepPerformance[]
	/** Revenue timeline data */
	revenueData: RevenueData[]
	/** Whether summary is loading */
	isLoading: boolean
	/** Whether team data is loading */
	teamLoading: boolean
	/** Whether revenue data is loading */
	revenueLoading: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Manager/Admin Analytics View
 *
 * Displays:
 * - System-wide KPIs (revenue, orders, quotes, conversion)
 * - Secondary KPIs (AOV, team size, turnaround time)
 * - Revenue trends chart
 * - Quote pipeline funnel
 * - Team performance leaderboard
 */
function ManagerAnalyticsView({
	summary,
	teamData,
	revenueData,
	isLoading,
	teamLoading,
	revenueLoading,
}: ManagerAnalyticsProps) {
	// Calculate team average turnaround
	const avgTurnaround = useMemo(() => {
		if (!teamData?.length) return 'N/A'
		const total = teamData.reduce((sum, rep) => sum + rep.avgTurnaroundHours, 0)
		return `${(total / teamData.length).toFixed(0)}h`
	}, [teamData])

	// Guard against null/undefined summary - MAANG best practice for defensive coding
	if (!summary) {
		return (
			<section aria-labelledby="manager-primary-kpi-heading">
				<h2 id="manager-primary-kpi-heading" className="sr-only">
					Business Overview
				</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<AnalyticsKPICard
						title="Total Revenue"
						value="$0"
						subtitle="No data available"
						icon={DollarSign}
						iconBgColor="bg-success/10"
						iconColor="text-success"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Completed Orders"
						value={0}
						subtitle="No data available"
						icon={CheckCircle}
						iconBgColor="bg-success/10"
						iconColor="text-success"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Pending Orders"
						value={0}
						subtitle="No data available"
						icon={Loader}
						iconBgColor="bg-warning/10"
						iconColor="text-warning"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Total Quotes"
						value={0}
						subtitle="No data available"
						icon={FileText}
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Conversion Rate"
						value="0%"
						subtitle="No data available"
						icon={TrendingUp}
						iconBgColor="bg-primary/10"
						iconColor="text-primary"
						isLoading={isLoading}
					/>
				</div>
			</section>
		)
	}

	// Determine which revenue data to display
	const chartData = revenueData.length > 0 ? revenueData : summary.revenueByMonth

	return (
		<>
			{/* Primary KPIs - System-wide metrics */}
			<section aria-labelledby="manager-primary-kpi-heading">
				<h2 id="manager-primary-kpi-heading" className="sr-only">
					Business Overview
				</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<AnalyticsKPICard
						title="Total Revenue"
						value={formatCurrencyAbbreviated(summary.totalRevenue)}
						rawValue={summary.totalRevenue}
						subtitle="This period"
						change={summary.revenueGrowthPercent}
						changeIsPositive={true}
						icon={DollarSign}
						iconBgColor="bg-success/10"
						iconColor="text-success"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Completed Orders"
						value={summary.completedOrders}
						rawValue={summary.completedOrders}
						subtitle="Delivered"
						change={summary.orderGrowthPercent}
						changeIsPositive={true}
						icon={CheckCircle}
						iconBgColor="bg-success/10"
						iconColor="text-success"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Pending Orders"
						value={summary.pendingOrders}
						rawValue={summary.pendingOrders}
						subtitle="In progress"
						icon={Loader}
						iconBgColor="bg-warning/10"
						iconColor="text-warning"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Total Quotes"
						value={summary.totalQuotes}
						rawValue={summary.totalQuotes}
						subtitle="All statuses"
						icon={FileText}
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Conversion Rate"
						value={`${summary.overallConversionRate.toFixed(1)}%`}
						rawValue={summary.overallConversionRate}
						subtitle="Quotes to orders"
						icon={TrendingUp}
						iconBgColor="bg-primary/10"
						iconColor="text-primary"
						isLoading={isLoading}
					/>
				</div>
			</section>

			{/* Secondary KPIs - Operational metrics */}
			<section aria-labelledby="manager-secondary-kpi-heading">
				<h2 id="manager-secondary-kpi-heading" className="sr-only">
					Operational Metrics
				</h2>
				<div className="grid gap-4 md:grid-cols-3">
					<AnalyticsKPICard
						title="Average Order Value"
						value={formatCurrencyAbbreviated(summary.averageOrderValue)}
						rawValue={summary.averageOrderValue}
						subtitle="Per order"
						icon={Package}
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Active Team Members"
						value={teamData?.length || 0}
						rawValue={teamData?.length || 0}
						subtitle="Sales reps"
						icon={Users}
						isLoading={teamLoading}
					/>
					<AnalyticsKPICard
						title="Avg Turnaround"
						value={avgTurnaround}
						subtitle="Quote processing"
						icon={Clock}
						isLoading={teamLoading}
					/>
				</div>
			</section>

			{/* Revenue Chart & Pipeline */}
			<section aria-labelledby="manager-trends-heading">
				<h2 id="manager-trends-heading" className="sr-only">
					Revenue Trends & Pipeline
				</h2>
				<div className="grid gap-6 lg:grid-cols-3">
					<RevenueChart
						data={chartData}
						title="Revenue Trends"
						isLoading={revenueLoading}
					/>
					<ConversionFunnel data={summary.quotePipeline} isLoading={isLoading} />
				</div>
			</section>

			{/* Team Leaderboard */}
			{teamData && teamData.length > 0 && (
				<section aria-labelledby="manager-team-heading">
					<h2 id="manager-team-heading" className="sr-only">
						Team Performance
					</h2>
					<TeamLeaderboard
						data={teamData}
						maxRows={10}
						isLoading={teamLoading}
						title="Sales Team Performance"
					/>
				</section>
			)}

			{/* Fallback: Top Performers from Summary */}
			{summary.topPerformers && summary.topPerformers.length > 0 && !teamData?.length && (
				<section aria-labelledby="manager-top-performers-heading">
					<h2 id="manager-top-performers-heading" className="sr-only">
						Top Performers
					</h2>
					<TeamLeaderboard
						data={summary.topPerformers}
						maxRows={5}
						isLoading={isLoading}
						title="Top Performers"
					/>
				</section>
			)}
		</>
	)
}

// Memoize to prevent unnecessary re-renders
export const ManagerAnalytics = memo(ManagerAnalyticsView)

