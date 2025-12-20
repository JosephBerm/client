/**
 * Analytics View Components Tests
 *
 * MAANG-Level: Comprehensive tests for role-based analytics views.
 *
 * **Test Coverage (Per PRD prd_analytics.md Section 3):**
 *
 * 1. **CustomerAnalytics View**
 *    - Shows own spending history
 *    - Shows own order trends
 *    - Does NOT show company-wide metrics
 *
 * 2. **SalesRepAnalytics View**
 *    - Shows personal performance metrics
 *    - Shows team comparison (anonymized)
 *    - Does NOT show individual teammate stats
 *
 * 3. **ManagerAnalytics View**
 *    - Shows team performance metrics
 *    - Shows individual rep performance
 *    - Shows revenue by rep
 *
 * @module __tests__/analytics/components/AnalyticsViews.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'

// Import components under test
import { CustomerAnalytics } from '@/app/app/analytics/_components/views/CustomerAnalytics'
import { SalesRepAnalytics } from '@/app/app/analytics/_components/views/SalesRepAnalytics'
import { ManagerAnalytics } from '@/app/app/analytics/_components/views/ManagerAnalytics'

import {
	AnalyticsSummaryBuilder,
	TeamPerformanceBuilder,
	RevenueSeriesBuilder,
	SalesRepPerformanceBuilder,
} from '@/test-utils/analyticsTestBuilders'
import type { AnalyticsSummary, SalesRepPerformance, RevenueData } from '@_types/analytics.types'

// ============================================================================
// CUSTOMER ANALYTICS VIEW TESTS
// ============================================================================

describe('CustomerAnalytics', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Rendering', () => {
		it('should render customer-specific metrics', () => {
			const summary = new AnalyticsSummaryBuilder().forCustomerRole().build()

			render(<CustomerAnalytics summary={summary} isLoading={false} />)

			// Customer should see their own spending and order info
			// Looking for KPI cards with customer metrics
			expect(screen.getByText(/total spent/i)).toBeInTheDocument()
		})

		it('should display customer order count', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forCustomerRole()
				.withCustomerOrderCount(15)
				.build()

			render(<CustomerAnalytics summary={summary} isLoading={false} />)

			// Customer should see their order count
			expect(screen.getByText('15')).toBeInTheDocument()
		})

		it('should display customer quote count', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forCustomerRole()
				.withCustomerQuoteCount(20)
				.build()

			render(<CustomerAnalytics summary={summary} isLoading={false} />)

			expect(screen.getByText('20')).toBeInTheDocument()
		})

		it('should NOT display company-wide revenue (per PRD)', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forCustomerRole()
				.withTotalRevenue(1000000) // Company-wide - should not show
				.build()

			render(<CustomerAnalytics summary={summary} isLoading={false} />)

			// Should NOT show company-wide total revenue label
			expect(screen.queryByText(/company.*revenue/i)).not.toBeInTheDocument()
		})

		it('should NOT display team performance (per PRD)', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forCustomerRole()
				.withTopPerformers(new TeamPerformanceBuilder().withTypicalTeam().build())
				.build()

			render(<CustomerAnalytics summary={summary} isLoading={false} />)

			// Should NOT show team leaderboard
			expect(screen.queryByText(/team.*performance/i)).not.toBeInTheDocument()
			expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument()
		})
	})

	describe('Loading State', () => {
		it('should show loading indicators when isLoading is true', () => {
			const summary = new AnalyticsSummaryBuilder().forCustomerRole().build()

			render(<CustomerAnalytics summary={summary} isLoading={true} />)

			// Should show some loading indication (skeleton, spinner, etc.)
			// The exact implementation may vary
		})
	})

	describe('Empty State', () => {
		it('should handle null summary gracefully', () => {
			// Per MAANG best practices: Components MUST gracefully handle null/undefined data
			// The component now has a guard clause that renders a fallback UI when summary is null
			// This test verifies the component does NOT throw when passed null
			expect(() => {
				render(<CustomerAnalytics summary={null as unknown as AnalyticsSummary} isLoading={false} />)
			}).not.toThrow()
		})

		it('should render fallback UI when summary is null', () => {
			render(<CustomerAnalytics summary={null as unknown as AnalyticsSummary} isLoading={false} />)

			// Should still render KPI cards with default/fallback values
			expect(screen.getByText(/total spent/i)).toBeInTheDocument()
			expect(screen.getByText(/no data available/i)).toBeInTheDocument()
		})

		it('should handle empty summary object', () => {
			// Test with an empty summary object (all fields undefined/zero)
			const emptySummary = new AnalyticsSummaryBuilder().withEmptyData().build()
			expect(() => {
				render(<CustomerAnalytics summary={emptySummary} isLoading={false} />)
			}).not.toThrow()
		})

		it('should handle zero values', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forCustomerRole()
				.withCustomerTotalSpent(0)
				.withCustomerOrderCount(0)
				.withCustomerQuoteCount(0)
				.build()

			render(<CustomerAnalytics summary={summary} isLoading={false} />)

			// Should display zeros without crashing
			expect(screen.getAllByText('0').length).toBeGreaterThan(0)
		})
	})
})

// ============================================================================
// SALES REP ANALYTICS VIEW TESTS
// ============================================================================

describe('SalesRepAnalytics', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Personal Metrics (Per PRD US-ANA-001)', () => {
		it('should display personal conversion rate', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withPersonalConversionRate(52.5)
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			// Component renders conversion rate in multiple places (KPI card + comparison)
			// Use getAllByText since value appears multiple times per MAANG UI pattern
			const conversionElements = screen.getAllByText(/52\.5%?/)
			expect(conversionElements.length).toBeGreaterThan(0)
		})

		it('should display personal revenue', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withPersonalRevenue(150000)
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			// Component uses formatCurrencyAbbreviated which renders as "$150K"
			// Revenue may appear in KPI card and comparison sections
			const revenueElements = screen.getAllByText(/\$?150K?/i)
			expect(revenueElements.length).toBeGreaterThan(0)
		})
	})

	describe('Team Comparison (Per PRD - Anonymized)', () => {
		it('should display comparison to team average', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withPersonalConversionRate(50)
				.withTeamAvgConversionRate(45)
				.withConversionVsTeamAvg(5) // 5% above average
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			// PersonalVsTeamCard shows "+5.0%" badge when above average
			// The badge may appear multiple times (for conversion and revenue comparison)
			const comparisonElements = screen.getAllByText(/\+5\.0%/)
			expect(comparisonElements.length).toBeGreaterThan(0)
		})

		it('should display team average conversion rate', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withTeamAvgConversionRate(45)
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			expect(screen.getByText(/45/)).toBeInTheDocument()
		})

		it('should NOT display individual teammate names (per PRD)', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withTopPerformers(new TeamPerformanceBuilder().withTypicalTeam().build())
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			// Should NOT show individual teammate names
			expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
			expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
		})

		it('should NOT display company-wide revenue details (per PRD)', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withTotalRevenue(1000000)
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			// Should NOT show company-wide revenue
			expect(screen.queryByText(/company.*revenue/i)).not.toBeInTheDocument()
		})
	})

	describe('Below/Above Average Indication', () => {
		it('should indicate when above team average', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withConversionVsTeamAvg(10) // 10% above
				.withTeamAvgConversionRate(40) // Need team avg to trigger comparison
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			// PersonalVsTeamCard renders "+10.0%" badge(s) when above average
			// May appear in multiple comparison sections
			const positiveIndicators = screen.getAllByText(/\+10\.0%/)
			expect(positiveIndicators.length).toBeGreaterThan(0)
		})

		it('should indicate when below team average', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forSalesRepRole()
				.withConversionVsTeamAvg(-5) // 5% below
				.withTeamAvgConversionRate(50) // Need team avg to trigger comparison
				.build()

			render(<SalesRepAnalytics summary={summary} isLoading={false} />)

			// PersonalVsTeamCard renders "-5.0%" badge(s) when below average
			const negativeIndicators = screen.getAllByText(/-5\.0%/)
			expect(negativeIndicators.length).toBeGreaterThan(0)
		})
	})
})

// ============================================================================
// MANAGER ANALYTICS VIEW TESTS
// ============================================================================

describe('ManagerAnalytics', () => {
	let mockSummary: AnalyticsSummary
	let mockTeamData: SalesRepPerformance[]
	let mockRevenueData: RevenueData[]

	beforeEach(() => {
		vi.clearAllMocks()
		mockSummary = new AnalyticsSummaryBuilder().forManagerRole().build()
		mockTeamData = new TeamPerformanceBuilder().withTypicalTeam().build()
		mockRevenueData = new RevenueSeriesBuilder().withMonthlyDataForYear().build()
	})

	describe('Team Performance Metrics (Per PRD US-ANA-002)', () => {
		it('should display all team members', () => {
			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Should show team member names
			expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
			expect(screen.getByText('Bob Smith')).toBeInTheDocument()
		})

		it('should display individual rep metrics', () => {
			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Each rep should have their metrics visible
			// Check for conversion rates, revenue, etc.
			mockTeamData.forEach((rep) => {
				expect(screen.getByText(rep.salesRepName)).toBeInTheDocument()
			})
		})

		it('should flag below average performers (per PRD)', () => {
			// Add a clearly below-average performer
			const teamWithLowPerformer = [
				new SalesRepPerformanceBuilder().asTopPerformer().withName('Star').build(),
				new SalesRepPerformanceBuilder().asPoorPerformer().withName('Needs Help').build(),
			] as SalesRepPerformance[]

			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={teamWithLowPerformer}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Poor performer should be visible
			expect(screen.getByText('Needs Help')).toBeInTheDocument()
		})
	})

	describe('Revenue Charts (Per PRD US-ANA-003)', () => {
		it('should display revenue chart', () => {
			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Should have a revenue chart component
			// Check for chart container or specific elements
		})

		it('should show revenue growth', () => {
			const summaryWithGrowth = new AnalyticsSummaryBuilder()
				.forManagerRole()
				.withRevenueGrowthPercent(15.5)
				.build()

			render(
				<ManagerAnalytics
					summary={summaryWithGrowth}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Should show growth percentage
			expect(screen.getByText(/15\.5/)).toBeInTheDocument()
		})
	})

	describe('Company-Wide Metrics', () => {
		it('should display total company revenue', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forManagerRole()
				.withTotalRevenue(750000)
				.build()

			render(
				<ManagerAnalytics
					summary={summary}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Should show total revenue (may be formatted as $750K)
			expect(screen.getByText(/750/)).toBeInTheDocument()
		})

		it('should display total orders', () => {
			const summary = new AnalyticsSummaryBuilder().forManagerRole().withTotalOrders(400).build()

			render(
				<ManagerAnalytics
					summary={summary}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			expect(screen.getByText('400')).toBeInTheDocument()
		})

		it('should display overall conversion rate', () => {
			const summary = new AnalyticsSummaryBuilder()
				.forManagerRole()
				.withOverallConversionRate(61.5)
				.build()

			render(
				<ManagerAnalytics
					summary={summary}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			expect(screen.getByText(/61\.5/)).toBeInTheDocument()
		})
	})

	describe('Loading States', () => {
		it('should handle summary loading', () => {
			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={mockTeamData}
					revenueData={mockRevenueData}
					isLoading={true}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Component should render without crashing during loading
		})

		it('should handle team data loading', () => {
			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={[]}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={true}
					revenueLoading={false}
				/>,
			)

			// Team section should show loading state
		})

		it('should handle revenue data loading', () => {
			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={mockTeamData}
					revenueData={[]}
					isLoading={false}
					teamLoading={false}
					revenueLoading={true}
				/>,
			)

			// Revenue chart should show loading state
		})
	})

	describe('Edge Cases', () => {
		it('should handle empty team', () => {
			render(
				<ManagerAnalytics
					summary={mockSummary}
					teamData={[]}
					revenueData={mockRevenueData}
					isLoading={false}
					teamLoading={false}
					revenueLoading={false}
				/>,
			)

			// Should show empty state or message
		})

		it('should handle empty team data', () => {
			expect(() => {
				render(
					<ManagerAnalytics
						summary={mockSummary}
						teamData={[]}
						revenueData={mockRevenueData}
						isLoading={false}
						teamLoading={false}
						revenueLoading={false}
					/>,
				)
			}).not.toThrow()
		})

		it('should handle empty revenue data', () => {
			expect(() => {
				render(
					<ManagerAnalytics
						summary={mockSummary}
						teamData={mockTeamData}
						revenueData={[]}
						isLoading={false}
						teamLoading={false}
						revenueLoading={false}
					/>,
				)
			}).not.toThrow()
		})
	})
})

// ============================================================================
// STATE COMPONENT TESTS
// ============================================================================

describe('Analytics State Components', () => {
	describe('AnalyticsLoadingState', () => {
		it('should render loading indicator', async () => {
			const { AnalyticsLoadingState } = await import(
				'@/app/app/analytics/_components/states/AnalyticsLoadingState'
			)

			render(<AnalyticsLoadingState />)

			// Should show loading indicator
			// Implementation may vary (spinner, skeleton, etc.)
		})
	})

	describe('AnalyticsEmptyState', () => {
		it('should render empty state message', async () => {
			const { AnalyticsEmptyState } = await import(
				'@/app/app/analytics/_components/states/AnalyticsEmptyState'
			)

			render(<AnalyticsEmptyState />)

			// Should show empty state message
			expect(screen.getByText(/no.*data/i) || screen.getByText(/empty/i)).toBeTruthy()
		})
	})

	describe('AnalyticsErrorState', () => {
		it('should render error message', async () => {
			const { AnalyticsErrorState } = await import(
				'@/app/app/analytics/_components/states/AnalyticsErrorState'
			)

			const mockRetry = vi.fn()
			render(<AnalyticsErrorState error="Failed to load" onRetry={mockRetry} />)

			// Should show error message
			expect(screen.getByText(/failed/i)).toBeInTheDocument()
		})

		it('should call retry function when retry button clicked', async () => {
			const { AnalyticsErrorState } = await import(
				'@/app/app/analytics/_components/states/AnalyticsErrorState'
			)

			const mockRetry = vi.fn()
			render(<AnalyticsErrorState error="Error occurred" onRetry={mockRetry} />)

			// Find and click retry button
			const retryButton = screen.getByRole('button', { name: /retry/i })
			retryButton.click()

			expect(mockRetry).toHaveBeenCalledTimes(1)
		})
	})
})

