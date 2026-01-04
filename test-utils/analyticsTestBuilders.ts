/**
 * Analytics Test Data Builders
 *
 * MAANG-Level: Comprehensive test data builders for Analytics feature.
 * Based on PRD requirements from prd_analytics.md, NOT implementation.
 *
 * **Coverage:**
 * - AnalyticsSummary with all role-specific fields
 * - SalesRepPerformance with edge cases
 * - RevenueData with various granularities
 * - QuotePipelineData with all status combinations
 * - DateRange with boundary conditions
 *
 * **Edge Cases Built-In:**
 * - Zero values (empty data)
 * - Maximum values (stress testing)
 * - Negative growth (declining performance)
 * - Invalid/malformed data
 * - Unicode and special characters
 * - Boundary dates
 *
 * @module test-utils/analyticsTestBuilders
 */

import type {
	AnalyticsSummary,
	SalesRepPerformance,
	RevenueData,
	QuotePipelineData,
	DateRange,
	TimeRangePreset,
} from '@_types/analytics.types'

// ============================================================================
// CONSTANTS FOR TESTING
// ============================================================================

export const TEST_DATE_RANGES = {
	LAST_7_DAYS: {
		start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		end: new Date().toISOString(),
	},
	LAST_30_DAYS: {
		start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		end: new Date().toISOString(),
	},
	LAST_12_MONTHS: {
		start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
		end: new Date().toISOString(),
	},
	FUTURE_RANGE: {
		start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
		end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
	},
	INVERTED_RANGE: {
		start: new Date().toISOString(),
		end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
	},
} as const

export const TIME_RANGE_PRESETS: TimeRangePreset[] = ['7d', '30d', '90d', '6m', '12m', 'ytd', 'custom']

// ============================================================================
// QUOTE PIPELINE BUILDER
// ============================================================================

/**
 * Builder for QuotePipelineData test data.
 *
 * @example
 * ```typescript
 * const pipeline = new QuotePipelineBuilder()
 *   .withUnread(10)
 *   .withConverted(5)
 *   .build()
 * ```
 */
export class QuotePipelineBuilder {
	private data: QuotePipelineData = {
		unread: 5,
		read: 10,
		approved: 8,
		converted: 6,
		rejected: 2,
		expired: 1,
		total: 32,
	}

	withUnread(count: number): this {
		this.data.unread = count
		return this
	}

	withRead(count: number): this {
		this.data.read = count
		return this
	}

	withApproved(count: number): this {
		this.data.approved = count
		return this
	}

	withConverted(count: number): this {
		this.data.converted = count
		return this
	}

	withRejected(count: number): this {
		this.data.rejected = count
		return this
	}

	withExpired(count: number): this {
		this.data.expired = count
		return this
	}

	// =========================================================================
	// EDGE CASE BUILDERS
	// =========================================================================

	/** All quotes in unread state - brand new pipeline */
	withAllUnread(total: number = 20): this {
		this.data = {
			unread: total,
			read: 0,
			approved: 0,
			converted: 0,
			rejected: 0,
			expired: 0,
			total,
		}
		return this
	}

	/** All quotes converted - perfect pipeline */
	withAllConverted(total: number = 20): this {
		this.data = {
			unread: 0,
			read: 0,
			approved: 0,
			converted: total,
			rejected: 0,
			expired: 0,
			total,
		}
		return this
	}

	/** All quotes rejected - worst case pipeline */
	withAllRejected(total: number = 20): this {
		this.data = {
			unread: 0,
			read: 0,
			approved: 0,
			converted: 0,
			rejected: total,
			expired: 0,
			total,
		}
		return this
	}

	/** Empty pipeline - no quotes */
	withEmpty(): this {
		this.data = {
			unread: 0,
			read: 0,
			approved: 0,
			converted: 0,
			rejected: 0,
			expired: 0,
			total: 0,
		}
		return this
	}

	/** Large numbers - stress testing */
	withLargeNumbers(): this {
		this.data = {
			unread: 10000,
			read: 50000,
			approved: 25000,
			converted: 20000,
			rejected: 3000,
			expired: 2000,
			total: 110000,
		}
		return this
	}

	/** Inconsistent total - data integrity issue */
	withInconsistentTotal(): this {
		this.data = {
			unread: 5,
			read: 10,
			approved: 8,
			converted: 6,
			rejected: 2,
			expired: 1,
			total: 999, // Doesn't match sum
		}
		return this
	}

	/** Negative values - invalid data */
	withNegativeValues(): this {
		this.data = {
			unread: -5,
			read: -10,
			approved: 8,
			converted: 6,
			rejected: 2,
			expired: 1,
			total: 2,
		}
		return this
	}

	build(): QuotePipelineData {
		return { ...this.data }
	}
}

// ============================================================================
// REVENUE DATA BUILDER
// ============================================================================

/**
 * Builder for RevenueData test data.
 *
 * @example
 * ```typescript
 * const revenue = new RevenueDataBuilder()
 *   .withDate('2024-01-01')
 *   .withRevenue(50000)
 *   .withOrderCount(25)
 *   .build()
 * ```
 */
export class RevenueDataBuilder {
	private data: RevenueData = {
		date: new Date().toISOString(),
		revenue: 10000,
		orderCount: 10,
	}

	withDate(date: string | Date): this {
		this.data.date = typeof date === 'string' ? date : date.toISOString()
		return this
	}

	withRevenue(revenue: number): this {
		this.data.revenue = revenue
		return this
	}

	withOrderCount(count: number): this {
		this.data.orderCount = count
		return this
	}

	// =========================================================================
	// EDGE CASE BUILDERS
	// =========================================================================

	/** Zero revenue day */
	withZeroRevenue(): this {
		this.data.revenue = 0
		this.data.orderCount = 0
		return this
	}

	/** Very high revenue day */
	withHighRevenue(): this {
		this.data.revenue = 1000000
		this.data.orderCount = 500
		return this
	}

	/** Single order day */
	withSingleOrder(revenue: number = 5000): this {
		this.data.revenue = revenue
		this.data.orderCount = 1
		return this
	}

	/** Negative revenue - refunds exceed sales */
	withNegativeRevenue(): this {
		this.data.revenue = -5000
		this.data.orderCount = 10
		return this
	}

	/** Invalid date */
	withInvalidDate(): this {
		this.data.date = 'not-a-date'
		return this
	}

	build(): RevenueData {
		return { ...this.data }
	}
}

// ============================================================================
// REVENUE DATA SERIES BUILDER
// ============================================================================

/**
 * Builder for creating arrays of RevenueData for chart testing.
 */
export class RevenueSeriesBuilder {
	private series: RevenueData[] = []

	/** Generate monthly data for a year */
	withMonthlyDataForYear(year: number = 2024, baseRevenue: number = 50000): this {
		this.series = Array.from({ length: 12 }, (_, i) => ({
			date: new Date(year, i, 1).toISOString(),
			revenue: baseRevenue + Math.floor(Math.random() * 20000) - 10000,
			orderCount: Math.floor(baseRevenue / 1000) + Math.floor(Math.random() * 20),
		}))
		return this
	}

	/** Generate weekly data for 12 weeks */
	withWeeklyData(weeks: number = 12): this {
		const now = new Date()
		this.series = Array.from({ length: weeks }, (_, i) => {
			const date = new Date(now)
			date.setDate(date.getDate() - i * 7)
			return {
				date: date.toISOString(),
				revenue: 10000 + Math.floor(Math.random() * 5000),
				orderCount: 10 + Math.floor(Math.random() * 10),
			}
		}).reverse()
		return this
	}

	/** Generate daily data for N days */
	withDailyData(days: number = 30): this {
		const now = new Date()
		this.series = Array.from({ length: days }, (_, i) => {
			const date = new Date(now)
			date.setDate(date.getDate() - i)
			return {
				date: date.toISOString(),
				revenue: 1000 + Math.floor(Math.random() * 2000),
				orderCount: 1 + Math.floor(Math.random() * 5),
			}
		}).reverse()
		return this
	}

	/** Consistent growth pattern */
	withGrowthPattern(months: number = 12, startRevenue: number = 30000, growthRate: number = 0.1): this {
		this.series = Array.from({ length: months }, (_, i) => {
			const date = new Date()
			date.setMonth(date.getMonth() - (months - i - 1))
			const revenue = startRevenue * Math.pow(1 + growthRate, i)
			return {
				date: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
				revenue: Math.round(revenue),
				orderCount: Math.floor(revenue / 1000),
			}
		})
		return this
	}

	/** Declining pattern */
	withDeclinePattern(months: number = 12, startRevenue: number = 100000, declineRate: number = 0.05): this {
		this.series = Array.from({ length: months }, (_, i) => {
			const date = new Date()
			date.setMonth(date.getMonth() - (months - i - 1))
			const revenue = startRevenue * Math.pow(1 - declineRate, i)
			return {
				date: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
				revenue: Math.round(revenue),
				orderCount: Math.floor(revenue / 1000),
			}
		})
		return this
	}

	/** Empty series */
	withEmpty(): this {
		this.series = []
		return this
	}

	/** Single data point */
	withSinglePoint(revenue: number = 50000): this {
		this.series = [
			{
				date: new Date().toISOString(),
				revenue,
				orderCount: Math.floor(revenue / 1000),
			},
		]
		return this
	}

	build(): RevenueData[] {
		return [...this.series]
	}
}

// ============================================================================
// SALES REP PERFORMANCE BUILDER
// ============================================================================

/**
 * Builder for SalesRepPerformance test data.
 *
 * @example
 * ```typescript
 * const rep = new SalesRepPerformanceBuilder()
 *   .withName('John Doe')
 *   .withConversionRate(65)
 *   .build()
 * ```
 */
export class SalesRepPerformanceBuilder {
	private data: SalesRepPerformance = {
		salesRepId: 'rep-1',
		salesRepName: 'John Smith',
		totalQuotes: 100,
		convertedQuotes: 50,
		conversionRate: 50,
		totalRevenue: 250000,
		avgTurnaroundHours: 24,
		activeCustomers: 15,
		totalOrders: 50,
	}

	withId(id: string): this {
		this.data.salesRepId = id
		return this
	}

	withName(name: string): this {
		this.data.salesRepName = name
		return this
	}

	withTotalQuotes(count: number): this {
		this.data.totalQuotes = count
		return this
	}

	withConvertedQuotes(count: number): this {
		this.data.convertedQuotes = count
		return this
	}

	withConversionRate(rate: number): this {
		this.data.conversionRate = rate
		return this
	}

	withTotalRevenue(revenue: number): this {
		this.data.totalRevenue = revenue
		return this
	}

	withAvgTurnaroundHours(hours: number): this {
		this.data.avgTurnaroundHours = hours
		return this
	}

	withActiveCustomers(count: number): this {
		this.data.activeCustomers = count
		return this
	}

	withTotalOrders(count: number): this {
		this.data.totalOrders = count
		return this
	}

	// =========================================================================
	// EDGE CASE BUILDERS
	// =========================================================================

	/** Top performer - high metrics */
	asTopPerformer(): this {
		this.data = {
			salesRepId: 'top-rep',
			salesRepName: 'Star Performer',
			totalQuotes: 200,
			convertedQuotes: 160,
			conversionRate: 80,
			totalRevenue: 500000,
			avgTurnaroundHours: 4,
			activeCustomers: 50,
			totalOrders: 160,
		}
		return this
	}

	/** Poor performer - low metrics */
	asPoorPerformer(): this {
		this.data = {
			salesRepId: 'poor-rep',
			salesRepName: 'Needs Coaching',
			totalQuotes: 50,
			convertedQuotes: 5,
			conversionRate: 10,
			totalRevenue: 10000,
			avgTurnaroundHours: 72,
			activeCustomers: 2,
			totalOrders: 5,
		}
		return this
	}

	/** New sales rep - no data */
	asNewRep(): this {
		this.data = {
			salesRepId: 'new-rep',
			salesRepName: 'New Hire',
			totalQuotes: 0,
			convertedQuotes: 0,
			conversionRate: 0,
			totalRevenue: 0,
			avgTurnaroundHours: 0,
			activeCustomers: 0,
			totalOrders: 0,
		}
		return this
	}

	/** Average performer */
	asAveragePerformer(): this {
		this.data = {
			salesRepId: 'avg-rep',
			salesRepName: 'Average Joe',
			totalQuotes: 100,
			convertedQuotes: 45,
			conversionRate: 45,
			totalRevenue: 150000,
			avgTurnaroundHours: 24,
			activeCustomers: 20,
			totalOrders: 45,
		}
		return this
	}

	/** 100% conversion rate - perfect */
	withPerfectConversion(): this {
		this.data.totalQuotes = 50
		this.data.convertedQuotes = 50
		this.data.conversionRate = 100
		return this
	}

	/** 0% conversion rate - no sales */
	withZeroConversion(): this {
		this.data.totalQuotes = 50
		this.data.convertedQuotes = 0
		this.data.conversionRate = 0
		return this
	}

	/** Unicode name */
	withUnicodeName(): this {
		this.data.salesRepName = '田中太郎 🎯'
		return this
	}

	/** Very long name */
	withVeryLongName(): this {
		this.data.salesRepName = 'A'.repeat(200)
		return this
	}

	/** Empty name */
	withEmptyName(): this {
		this.data.salesRepName = ''
		return this
	}

	build(): SalesRepPerformance {
		return { ...this.data }
	}
}

// ============================================================================
// TEAM PERFORMANCE BUILDER
// ============================================================================

/**
 * Builder for creating arrays of SalesRepPerformance for team testing.
 */
export class TeamPerformanceBuilder {
	private team: SalesRepPerformance[] = []

	/** Create a typical team of 5 sales reps */
	withTypicalTeam(): this {
		this.team = [
			new SalesRepPerformanceBuilder().asTopPerformer().withId('rep-1').withName('Alice Johnson').build(),
			new SalesRepPerformanceBuilder()
				.withId('rep-2')
				.withName('Bob Smith')
				.withConversionRate(55)
				.withTotalRevenue(180000)
				.build(),
			new SalesRepPerformanceBuilder().asAveragePerformer().withId('rep-3').withName('Carol Davis').build(),
			new SalesRepPerformanceBuilder()
				.withId('rep-4')
				.withName('David Wilson')
				.withConversionRate(35)
				.withTotalRevenue(100000)
				.build(),
			new SalesRepPerformanceBuilder().asPoorPerformer().withId('rep-5').withName('Eve Brown').build(),
		]
		return this
	}

	/** All top performers */
	withAllTopPerformers(count: number = 5): this {
		this.team = Array.from({ length: count }, (_, i) =>
			new SalesRepPerformanceBuilder()
				.asTopPerformer()
				.withId(`rep-${i + 1}`)
				.withName(`Top Performer ${i + 1}`)
				.build(),
		)
		return this
	}

	/** All poor performers */
	withAllPoorPerformers(count: number = 5): this {
		this.team = Array.from({ length: count }, (_, i) =>
			new SalesRepPerformanceBuilder()
				.asPoorPerformer()
				.withId(`rep-${i + 1}`)
				.withName(`Poor Performer ${i + 1}`)
				.build(),
		)
		return this
	}

	/** Large team - stress testing */
	withLargeTeam(count: number = 50): this {
		this.team = Array.from({ length: count }, (_, i) =>
			new SalesRepPerformanceBuilder()
				.withId(`rep-${i + 1}`)
				.withName(`Sales Rep ${i + 1}`)
				.withConversionRate(Math.floor(Math.random() * 100))
				.withTotalRevenue(Math.floor(Math.random() * 500000))
				.withTotalQuotes(Math.floor(Math.random() * 200))
				.build(),
		)
		return this
	}

	/** Empty team */
	withEmpty(): this {
		this.team = []
		return this
	}

	/** Single team member */
	withSingleMember(): this {
		this.team = [new SalesRepPerformanceBuilder().asAveragePerformer().build()]
		return this
	}

	/** All new reps - no performance data */
	withAllNewReps(count: number = 5): this {
		this.team = Array.from({ length: count }, (_, i) =>
			new SalesRepPerformanceBuilder()
				.asNewRep()
				.withId(`new-rep-${i + 1}`)
				.withName(`New Hire ${i + 1}`)
				.build(),
		)
		return this
	}

	/** Add a specific rep */
	withRep(rep: SalesRepPerformance): this {
		this.team.push(rep)
		return this
	}

	build(): SalesRepPerformance[] {
		return [...this.team]
	}
}

// ============================================================================
// ANALYTICS SUMMARY BUILDER
// ============================================================================

/**
 * Builder for AnalyticsSummary test data.
 * Supports all role-specific fields from the PRD.
 *
 * @example
 * ```typescript
 * const summary = new AnalyticsSummaryBuilder()
 *   .forManagerRole()
 *   .withTopPerformers(5)
 *   .build()
 * ```
 */
export class AnalyticsSummaryBuilder {
	private data: AnalyticsSummary = {
		// Overview
		totalRevenue: 500000,
		revenueGrowthPercent: 15.5,
		totalOrders: 250,
		completedOrders: 200,
		pendingOrders: 50,
		orderGrowthPercent: 12.3,
		totalQuotes: 400,
		overallConversionRate: 62.5,
		averageOrderValue: 2000,
		// Trends
		revenueByMonth: new RevenueSeriesBuilder().withMonthlyDataForYear().build(),
		revenueByWeek: new RevenueSeriesBuilder().withWeeklyData().build(),
		// Pipeline
		quotePipeline: new QuotePipelineBuilder().build(),
	}

	// =========================================================================
	// OVERVIEW METRICS
	// =========================================================================

	withTotalRevenue(revenue: number): this {
		this.data.totalRevenue = revenue
		return this
	}

	withRevenueGrowthPercent(percent: number): this {
		this.data.revenueGrowthPercent = percent
		return this
	}

	withTotalOrders(count: number): this {
		this.data.totalOrders = count
		return this
	}

	withCompletedOrders(count: number): this {
		this.data.completedOrders = count
		return this
	}

	withPendingOrders(count: number): this {
		this.data.pendingOrders = count
		return this
	}

	withOrderGrowthPercent(percent: number): this {
		this.data.orderGrowthPercent = percent
		return this
	}

	withTotalQuotes(count: number): this {
		this.data.totalQuotes = count
		return this
	}

	withOverallConversionRate(rate: number): this {
		this.data.overallConversionRate = rate
		return this
	}

	withAverageOrderValue(value: number): this {
		this.data.averageOrderValue = value
		return this
	}

	// =========================================================================
	// TRENDS
	// =========================================================================

	withRevenueByMonth(data: RevenueData[]): this {
		this.data.revenueByMonth = data
		return this
	}

	withRevenueByWeek(data: RevenueData[]): this {
		this.data.revenueByWeek = data
		return this
	}

	// =========================================================================
	// PIPELINE
	// =========================================================================

	withQuotePipeline(pipeline: QuotePipelineData): this {
		this.data.quotePipeline = pipeline
		return this
	}

	// =========================================================================
	// ROLE-SPECIFIC: MANAGER/ADMIN
	// =========================================================================

	withTopPerformers(performers: SalesRepPerformance[]): this {
		this.data.topPerformers = performers
		return this
	}

	// =========================================================================
	// ROLE-SPECIFIC: SALES REP
	// =========================================================================

	withTeamAvgConversionRate(rate: number): this {
		this.data.teamAvgConversionRate = rate
		return this
	}

	withTeamAvgRevenue(revenue: number): this {
		this.data.teamAvgRevenue = revenue
		return this
	}

	withPersonalConversionRate(rate: number): this {
		this.data.personalConversionRate = rate
		return this
	}

	withPersonalRevenue(revenue: number): this {
		this.data.personalRevenue = revenue
		return this
	}

	withConversionVsTeamAvg(diff: number): this {
		this.data.conversionVsTeamAvg = diff
		return this
	}

	// =========================================================================
	// ROLE-SPECIFIC: CUSTOMER
	// =========================================================================

	withCustomerTotalSpent(amount: number): this {
		this.data.customerTotalSpent = amount
		return this
	}

	withCustomerOrderCount(count: number): this {
		this.data.customerOrderCount = count
		return this
	}

	withCustomerQuoteCount(count: number): this {
		this.data.customerQuoteCount = count
		return this
	}

	// =========================================================================
	// ROLE-BASED PRESETS (Per PRD Section 3)
	// =========================================================================

	/**
	 * Customer view: Own spending history, order trends
	 * @see prd_analytics.md Section 3 - Customer View
	 */
	forCustomerRole(): this {
		this.data = {
			// Overview - customer's own data only
			totalRevenue: 0, // Not visible to customer
			revenueGrowthPercent: 0,
			totalOrders: 0,
			completedOrders: 12,
			pendingOrders: 3,
			orderGrowthPercent: 0,
			totalQuotes: 0,
			overallConversionRate: 0,
			averageOrderValue: 0,
			// Trends
			revenueByMonth: new RevenueSeriesBuilder().withMonthlyDataForYear(2024, 5000).build(),
			revenueByWeek: [],
			// Pipeline - not visible
			quotePipeline: new QuotePipelineBuilder().withEmpty().build(),
			// Customer-specific
			customerTotalSpent: 45000,
			customerOrderCount: 15,
			customerQuoteCount: 20,
		}
		return this
	}

	/**
	 * Sales Rep view: Personal metrics + team comparison
	 * @see prd_analytics.md Section 3 - Sales Rep View
	 */
	forSalesRepRole(): this {
		this.data = {
			// Overview - personal data
			totalRevenue: 150000,
			revenueGrowthPercent: 8.5,
			totalOrders: 75,
			completedOrders: 60,
			pendingOrders: 15,
			orderGrowthPercent: 10.2,
			totalQuotes: 120,
			overallConversionRate: 0, // Use personalConversionRate instead
			averageOrderValue: 2000,
			// Trends - personal
			revenueByMonth: new RevenueSeriesBuilder().withMonthlyDataForYear(2024, 12000).build(),
			revenueByWeek: [],
			// Pipeline - personal quotes
			quotePipeline: new QuotePipelineBuilder().withUnread(5).withRead(10).withConverted(15).build(),
			// Team comparison (anonymized)
			teamAvgConversionRate: 45,
			teamAvgRevenue: 120000,
			personalConversionRate: 52.5,
			personalRevenue: 150000,
			conversionVsTeamAvg: 7.5, // 7.5% above average
		}
		return this
	}

	/**
	 * Sales Manager view: Team performance, revenue by rep
	 * @see prd_analytics.md Section 3 - Sales Manager View
	 */
	forManagerRole(): this {
		this.data = {
			// Overview - system-wide
			totalRevenue: 750000,
			revenueGrowthPercent: 12.3,
			totalOrders: 400,
			completedOrders: 320,
			pendingOrders: 80,
			orderGrowthPercent: 8.5,
			totalQuotes: 650,
			overallConversionRate: 61.5,
			averageOrderValue: 1875,
			// Trends
			revenueByMonth: new RevenueSeriesBuilder().withMonthlyDataForYear(2024, 60000).build(),
			revenueByWeek: new RevenueSeriesBuilder().withWeeklyData().build(),
			// Pipeline - all quotes
			quotePipeline: new QuotePipelineBuilder().build(),
			// Top performers
			topPerformers: new TeamPerformanceBuilder().withTypicalTeam().build().slice(0, 5),
		}
		return this
	}

	/**
	 * Admin view: Full access to all metrics
	 * @see prd_analytics.md Section 3 - Admin View
	 */
	forAdminRole(): this {
		this.data = {
			// Overview - full system metrics
			totalRevenue: 1500000,
			revenueGrowthPercent: 15.8,
			totalOrders: 800,
			completedOrders: 650,
			pendingOrders: 150,
			orderGrowthPercent: 12.5,
			totalQuotes: 1200,
			overallConversionRate: 66.7,
			averageOrderValue: 1875,
			// Trends
			revenueByMonth: new RevenueSeriesBuilder().withMonthlyDataForYear(2024, 120000).build(),
			revenueByWeek: new RevenueSeriesBuilder().withWeeklyData().build(),
			// Pipeline
			quotePipeline: new QuotePipelineBuilder().withLargeNumbers().build(),
			// All performers
			topPerformers: new TeamPerformanceBuilder().withLargeTeam(10).build(),
		}
		return this
	}

	// =========================================================================
	// EDGE CASE PRESETS
	// =========================================================================

	/** Empty data - new system or no activity */
	withEmptyData(): this {
		this.data = {
			totalRevenue: 0,
			revenueGrowthPercent: 0,
			totalOrders: 0,
			completedOrders: 0,
			pendingOrders: 0,
			orderGrowthPercent: 0,
			totalQuotes: 0,
			overallConversionRate: 0,
			averageOrderValue: 0,
			revenueByMonth: [],
			revenueByWeek: [],
			quotePipeline: new QuotePipelineBuilder().withEmpty().build(),
		}
		return this
	}

	/** Negative growth - declining business */
	withNegativeGrowth(): this {
		this.data.revenueGrowthPercent = -25.5
		this.data.orderGrowthPercent = -15.3
		this.data.revenueByMonth = new RevenueSeriesBuilder().withDeclinePattern().build()
		return this
	}

	/** Extremely high growth - anomaly detection */
	withExtremeGrowth(): this {
		this.data.revenueGrowthPercent = 500
		this.data.orderGrowthPercent = 300
		return this
	}

	/** Very large numbers - stress testing */
	withLargeNumbers(): this {
		this.data.totalRevenue = 100000000
		this.data.totalOrders = 50000
		this.data.totalQuotes = 100000
		this.data.averageOrderValue = 2000
		return this
	}

	/** Division by zero scenarios */
	withZeroQuotes(): this {
		this.data.totalQuotes = 0
		this.data.overallConversionRate = 0 // Would cause division by zero if not handled
		return this
	}

	/** NaN/Infinity edge cases */
	withInvalidNumbers(): this {
		this.data.revenueGrowthPercent = NaN
		this.data.orderGrowthPercent = Infinity
		this.data.averageOrderValue = -Infinity
		return this
	}

	build(): AnalyticsSummary {
		return JSON.parse(JSON.stringify(this.data)) // Deep clone
	}
}

// ============================================================================
// HELPER FUNCTIONS FOR TESTS
// ============================================================================

/**
 * Creates a mock API response for analytics summary.
 */
export function createMockSummaryResponse(summary: AnalyticsSummary) {
	return {
		data: {
			statusCode: 200,
			message: 'summary_retrieved',
			payload: summary,
		},
	}
}

/**
 * Creates a mock API error response.
 */
export function createMockErrorResponse(message: string = 'Failed to fetch analytics') {
	return {
		data: {
			statusCode: 500,
			message,
			payload: null,
		},
	}
}

/**
 * Creates mock team performance API response.
 */
export function createMockTeamResponse(team: SalesRepPerformance[]) {
	return {
		data: {
			statusCode: 200,
			message: 'team_retrieved',
			payload: team,
		},
	}
}

/**
 * Creates mock revenue timeline API response.
 */
export function createMockRevenueResponse(data: RevenueData[]) {
	return {
		data: {
			statusCode: 200,
			message: 'revenue_retrieved',
			payload: data,
		},
	}
}

/**
 * Calculates expected conversion rate.
 */
export function calculateExpectedConversionRate(converted: number, total: number): number {
	if (total === 0) return 0
	return Math.round((converted / total) * 100 * 100) / 100
}

/**
 * Calculates expected growth percent.
 */
export function calculateExpectedGrowthPercent(current: number, previous: number): number {
	if (previous === 0) return current > 0 ? 100 : 0
	return Math.round(((current - previous) / previous) * 100 * 100) / 100
}

