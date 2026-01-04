'use client'

/**
 * SalesRepAnalytics View Component
 *
 * Analytics view for Sales Rep role users.
 * Shows personal performance metrics and anonymized team comparison.
 *
 * **Story**: As a sales rep, I want to track my performance
 * and see how I compare to team averages (anonymized).
 *
 * **Architecture Notes (per Next.js 16 + React 19 best practices):**
 * - Uses React.memo() for shallow prop comparison optimization
 * - Direct imports to avoid circular dependencies (no parent barrel imports)
 * - 'use client' boundary at view level (minimal client boundary)
 *
 * @see prd_analytics.md - US-ANA-001 Sales Rep View
 * @see https://react.dev/reference/react/memo
 * @module analytics/components/views/SalesRepAnalytics
 */

import { memo } from 'react'

import { Percent, FileText, DollarSign, CheckCircle, Loader } from 'lucide-react'

import type { AnalyticsSummary } from '@_types/analytics.types'

// Direct imports to avoid circular dependencies through barrel files
import { AnalyticsKPICard } from '../AnalyticsKPICard'
import { PersonalVsTeamCard } from '../PersonalVsTeamCard'
import { ConversionFunnel } from '../ConversionFunnel'
import { formatCurrencyAbbreviated } from '../../_utils/formatters'

// ============================================================================
// TYPES
// ============================================================================

export interface SalesRepAnalyticsProps {
	/** Analytics summary data */
	summary: AnalyticsSummary
	/** Whether data is loading */
	isLoading: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Sales Rep Analytics View
 *
 * Displays:
 * - Personal conversion rate with team comparison
 * - Quote and order counts
 * - Revenue generated
 * - Personal vs team performance comparison
 * - Quote pipeline visualization
 */
function SalesRepAnalyticsView({ summary, isLoading }: SalesRepAnalyticsProps) {
	// Guard against null/undefined summary - MAANG best practice for defensive coding
	if (!summary) {
		return (
			<section aria-labelledby="salesrep-kpi-heading">
				<h2 id="salesrep-kpi-heading" className="sr-only">
					Your Performance Metrics
				</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<AnalyticsKPICard
						title="Conversion Rate"
						value="0%"
						subtitle="No data available"
						icon={Percent}
						iconBgColor="bg-success/10"
						iconColor="text-success"
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
						title="Revenue Generated"
						value="$0"
						subtitle="No data available"
						icon={DollarSign}
						iconBgColor="bg-primary/10"
						iconColor="text-primary"
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
				</div>
			</section>
		)
	}

	const hasTeamComparison = summary.teamAvgConversionRate !== undefined

	return (
		<>
			{/* Personal Performance KPIs */}
			<section aria-labelledby="salesrep-kpi-heading">
				<h2 id="salesrep-kpi-heading" className="sr-only">
					Your Performance Metrics
				</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<AnalyticsKPICard
						title="Conversion Rate"
						value={`${(summary.personalConversionRate || 0).toFixed(1)}%`}
						rawValue={summary.personalConversionRate || 0}
						subtitle="Quotes to orders"
						change={summary.conversionVsTeamAvg}
						changeIsPositive={true}
						icon={Percent}
						iconBgColor="bg-success/10"
						iconColor="text-success"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Total Quotes"
						value={summary.totalQuotes}
						rawValue={summary.totalQuotes}
						subtitle="This period"
						icon={FileText}
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Revenue Generated"
						value={formatCurrencyAbbreviated(summary.personalRevenue || 0)}
						rawValue={summary.personalRevenue || 0}
						subtitle="Your contribution"
						icon={DollarSign}
						iconBgColor="bg-primary/10"
						iconColor="text-primary"
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Completed Orders"
						value={summary.completedOrders}
						rawValue={summary.completedOrders}
						subtitle="Delivered"
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
				</div>
			</section>

			{/* Personal vs Team Comparison */}
			{hasTeamComparison && (
				<section aria-labelledby="salesrep-comparison-heading">
					<h2 id="salesrep-comparison-heading" className="sr-only">
						Your Performance vs Team Average
					</h2>
					<PersonalVsTeamCard
						personalConversionRate={summary.personalConversionRate || 0}
						teamAvgConversionRate={summary.teamAvgConversionRate || 0}
						conversionVsTeamAvg={summary.conversionVsTeamAvg || 0}
						personalRevenue={summary.personalRevenue || 0}
						teamAvgRevenue={summary.teamAvgRevenue || 0}
						isLoading={isLoading}
					/>
				</section>
			)}

			{/* Quote Pipeline */}
			{summary.quotePipeline && (
				<section aria-labelledby="salesrep-pipeline-heading">
					<h2 id="salesrep-pipeline-heading" className="sr-only">
						Your Quote Pipeline
					</h2>
					<div className="grid gap-6 lg:grid-cols-2">
						<ConversionFunnel data={summary.quotePipeline} isLoading={isLoading} />
					</div>
				</section>
			)}
		</>
	)
}

// Memoize to prevent unnecessary re-renders
export const SalesRepAnalytics = memo(SalesRepAnalyticsView)

