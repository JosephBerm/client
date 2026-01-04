'use client'

/**
 * CustomerAnalytics View Component
 *
 * Analytics view for Customer role users.
 * Shows personal spending history, order trends, and quote activity.
 *
 * **Story**: As a customer, I want to see my spending patterns
 * and order history to understand my purchasing behavior.
 *
 * **Architecture Notes (per Next.js 16 + React 19 best practices):**
 * - Uses React.memo() for shallow prop comparison optimization
 * - Direct imports to avoid circular dependencies (no parent barrel imports)
 * - 'use client' boundary at view level (minimal client boundary)
 *
 * @see prd_analytics.md - US-ANA-001 Customer View
 * @see https://react.dev/reference/react/memo
 * @module analytics/components/views/CustomerAnalytics
 */

import { memo } from 'react'

import { DollarSign, FileText, Package, CheckCircle, Loader } from 'lucide-react'

import type { AnalyticsSummary } from '@_types/analytics.types'

// Direct imports to avoid circular dependencies through barrel files
// Per industry best practice: https://react-typescript-style-guide.com/
import { AnalyticsKPICard } from '../AnalyticsKPICard'
import { RevenueChart } from '../RevenueChart'
import { formatCurrencyAbbreviated } from '../../_utils/formatters'

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerAnalyticsProps {
	/** Analytics summary data */
	summary: AnalyticsSummary
	/** Whether data is loading */
	isLoading: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Customer Analytics View
 *
 * Displays:
 * - Total spent (lifetime value)
 * - Order count and quote requests
 * - Average order value
 * - Spending trends over time
 */
function CustomerAnalyticsView({ summary, isLoading }: CustomerAnalyticsProps) {
	// Guard against null/undefined summary - MAANG best practice for defensive coding
	if (!summary) {
		return (
			<section aria-labelledby="customer-kpi-heading">
				<h2 id="customer-kpi-heading" className="sr-only">
					Your Key Metrics
				</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<AnalyticsKPICard
						title="Total Spent"
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
						title="Quote Requests"
						value={0}
						subtitle="No data available"
						icon={FileText}
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Avg Order Value"
						value="$0"
						subtitle="No data available"
						icon={Package}
						isLoading={isLoading}
					/>
				</div>
			</section>
		)
	}

	return (
		<>
			{/* KPI Cards - Customer's key metrics */}
			<section aria-labelledby="customer-kpi-heading">
				<h2 id="customer-kpi-heading" className="sr-only">
					Your Key Metrics
				</h2>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<AnalyticsKPICard
						title="Total Spent"
						value={formatCurrencyAbbreviated(summary.customerTotalSpent || 0)}
						rawValue={summary.customerTotalSpent || 0}
						subtitle="Lifetime value"
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
						title="Quote Requests"
						value={summary.customerQuoteCount || 0}
						rawValue={summary.customerQuoteCount || 0}
						subtitle="Quotes submitted"
						icon={FileText}
						isLoading={isLoading}
					/>
					<AnalyticsKPICard
						title="Avg Order Value"
						value={formatCurrencyAbbreviated(summary.averageOrderValue || 0)}
						rawValue={summary.averageOrderValue || 0}
						subtitle="Per order"
						icon={Package}
						isLoading={isLoading}
					/>
				</div>
			</section>

			{/* Spending Trends Chart */}
			{summary.revenueByMonth && summary.revenueByMonth.length > 0 && (
				<section aria-labelledby="customer-trends-heading">
					<h2 id="customer-trends-heading" className="sr-only">
						Your Spending Trends
					</h2>
					<RevenueChart
						data={summary.revenueByMonth}
						title="Your Spending Over Time"
						isLoading={isLoading}
					/>
				</section>
			)}
		</>
	)
}

// Memoize to prevent unnecessary re-renders
export const CustomerAnalytics = memo(CustomerAnalyticsView)

