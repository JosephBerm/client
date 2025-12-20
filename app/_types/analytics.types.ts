/**
 * Analytics Types
 *
 * TypeScript types for the Business Intelligence Analytics feature.
 * Maps to backend AnalyticsDTOs.cs
 *
 * @see prd_analytics.md - Section 5.2 Frontend Types
 * @module analytics.types
 */

/**
 * Date range for filtering analytics data.
 */
export interface DateRange {
	/** Start date of the range (ISO string) */
	start: string
	/** End date of the range (ISO string) */
	end: string
}

/**
 * Sales representative performance metrics.
 * Used by managers and admins to track team performance.
 */
export interface SalesRepPerformance {
	/** Sales rep account ID */
	salesRepId: string
	/** Sales rep display name */
	salesRepName: string
	/** Total quotes assigned to this rep */
	totalQuotes: number
	/** Quotes converted to orders */
	convertedQuotes: number
	/** Quote to order conversion rate (percentage) */
	conversionRate: number
	/** Total revenue from orders */
	totalRevenue: number
	/** Average quote turnaround time in hours */
	avgTurnaroundHours: number
	/** Number of active customers for this rep */
	activeCustomers: number
	/** Total orders processed */
	totalOrders: number
}

/**
 * Revenue data point for charting.
 */
export interface RevenueData {
	/** Date for this data point (ISO string) */
	date: string
	/** Revenue amount for this period */
	revenue: number
	/** Number of orders in this period */
	orderCount: number
}

/**
 * Quote pipeline status distribution.
 * Shows quotes at each stage of the sales funnel.
 */
export interface QuotePipelineData {
	/** Quotes not yet viewed by sales rep */
	unread: number
	/** Quotes viewed but not priced */
	read: number
	/** Quotes approved and sent to customer */
	approved: number
	/** Quotes converted to orders */
	converted: number
	/** Quotes rejected by customer or sales */
	rejected: number
	/** Quotes that have expired */
	expired: number
	/** Total quotes in pipeline */
	total: number
}

/**
 * Comprehensive analytics summary response.
 * Contains role-specific metrics for the analytics dashboard.
 */
export interface AnalyticsSummary {
	// =========================================================================
	// OVERVIEW METRICS
	// =========================================================================

	/** Total revenue in the date range */
	totalRevenue: number
	/** Revenue growth percentage vs previous period */
	revenueGrowthPercent: number
	/** Total number of orders */
	totalOrders: number
	/** Order growth percentage vs previous period */
	orderGrowthPercent: number
	/** Total number of quotes */
	totalQuotes: number
	/** Overall quote to order conversion rate */
	overallConversionRate: number
	/** Average order value */
	averageOrderValue: number

	// =========================================================================
	// TRENDS DATA (for charts)
	// =========================================================================

	/** Revenue trend by month */
	revenueByMonth: RevenueData[]
	/** Revenue trend by week */
	revenueByWeek: RevenueData[]

	// =========================================================================
	// QUOTE PIPELINE
	// =========================================================================

	/** Quote pipeline distribution */
	quotePipeline: QuotePipelineData

	// =========================================================================
	// PERFORMANCE (Manager/Admin only)
	// =========================================================================

	/** Top performing sales reps (manager/admin only) */
	topPerformers?: SalesRepPerformance[]

	// =========================================================================
	// COMPARISON (Sales Rep)
	// =========================================================================

	/** Team average conversion rate (for comparison) */
	teamAvgConversionRate?: number
	/** Team average revenue (for comparison) */
	teamAvgRevenue?: number
	/** Personal conversion rate (for sales rep) */
	personalConversionRate?: number
	/** Personal revenue (for sales rep) */
	personalRevenue?: number
	/** Comparison to team average (positive means above average) */
	conversionVsTeamAvg?: number

	// =========================================================================
	// CUSTOMER METRICS (Customer role)
	// =========================================================================

	/** Customer's total spending */
	customerTotalSpent?: number
	/** Customer's order count */
	customerOrderCount?: number
	/** Customer's quote count */
	customerQuoteCount?: number
}

/**
 * Time range preset options for analytics filtering.
 *
 * Extends core DateRangePreset from @_lib/dates with analytics-specific presets:
 * - Core presets: '7d', '30d', '90d', '1y' (as '12m'), 'ytd'
 * - Extended: '6m', 'custom'
 *
 * @see @_lib/dates/types.DateRangePreset for core date presets
 */
export type TimeRangePreset =
	| '7d'
	| '30d'
	| '90d'
	| '6m'
	| '12m'
	| 'ytd'
	| 'custom'

/**
 * Analytics filter state for the dashboard.
 */
export interface AnalyticsFilter {
	/** Selected time range preset */
	timeRange: TimeRangePreset
	/** Custom start date (when timeRange is 'custom') */
	startDate?: string
	/** Custom end date (when timeRange is 'custom') */
	endDate?: string
}

/**
 * Granularity options for revenue timeline.
 */
export type TimelineGranularity = 'day' | 'week' | 'month'

/**
 * Revenue timeline request parameters.
 */
export interface RevenueTimelineParams {
	/** Start date for the timeline */
	startDate: string
	/** End date for the timeline */
	endDate: string
	/** Granularity: "day", "week", or "month" */
	granularity: TimelineGranularity
}

/**
 * Chart data point with label for rendering.
 */
export interface ChartDataPoint {
	/** Display label (e.g., "Jan 2024", "Week 1") */
	label: string
	/** Value for the data point */
	value: number
	/** Secondary value (optional, e.g., order count) */
	secondaryValue?: number
}

/**
 * Props for the revenue chart component.
 */
export interface RevenueChartProps {
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
 * Props for the conversion funnel component.
 */
export interface ConversionFunnelProps {
	/** Pipeline data */
	data: QuotePipelineData
	/** Whether data is loading */
	isLoading?: boolean
}

/**
 * Props for the team leaderboard component.
 */
export interface TeamLeaderboardProps {
	/** List of sales rep performance data */
	data: SalesRepPerformance[]
	/** Maximum number of rows to display */
	maxRows?: number
	/** Whether data is loading */
	isLoading?: boolean
	/** Click handler for row selection */
	onRowClick?: (salesRepId: string) => void
}

/**
 * Analytics metric card props.
 */
export interface AnalyticsMetricProps {
	/** Metric title */
	title: string
	/** Main value to display */
	value: string | number
	/** Optional subtitle */
	subtitle?: string
	/** Change percentage (positive/negative) */
	change?: number
	/** Whether the change is positive */
	changeIsPositive?: boolean
	/** Icon component */
	icon?: React.ReactNode
	/** Whether data is loading */
	isLoading?: boolean
}

