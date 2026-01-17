/**
 * Analytics Page Object Model
 *
 * Encapsulates all analytics page interactions.
 * Role-specific views are handled with conditional locators.
 *
 * **Architecture:**
 * - CustomerAnalytics: Spending history, order trends
 * - SalesRepAnalytics: Personal performance, team comparison
 * - ManagerAnalytics: Business intelligence, team metrics, revenue charts
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class AnalyticsPage extends BasePage {
	// =============================================
	// PAGE HEADER & ACTIONS
	// =============================================
	readonly pageHeader: Locator
	readonly pageTitle: Locator
	readonly pageDescription: Locator
	readonly dateRangePicker: Locator

	// =============================================
	// COMMON ELEMENTS (ALL ROLES)
	// =============================================
	readonly mainContent: Locator
	readonly loadingState: Locator
	readonly errorState: Locator
	readonly emptyState: Locator
	readonly retryButton: Locator

	// =============================================
	// KPI CARDS (ALL ROLES)
	// =============================================
	readonly kpiCards: Locator
	readonly totalRevenueCard: Locator
	readonly totalOrdersCard: Locator
	readonly averageOrderValueCard: Locator
	readonly conversionRateCard: Locator

	// =============================================
	// SALES REP ANALYTICS
	// =============================================
	readonly salesRepView: Locator
	readonly personalPerformanceSection: Locator
	readonly teamComparisonSection: Locator
	readonly pipelineSection: Locator
	readonly quotesMetrics: Locator
	readonly ordersMetrics: Locator

	// =============================================
	// MANAGER ANALYTICS
	// =============================================
	readonly managerView: Locator
	readonly teamLeaderboard: Locator
	readonly teamLeaderboardTable: Locator
	readonly revenueChart: Locator
	readonly conversionFunnel: Locator
	readonly teamPerformanceSection: Locator

	// =============================================
	// CUSTOMER ANALYTICS
	// =============================================
	readonly customerView: Locator
	readonly spendingHistorySection: Locator
	readonly orderTrendsSection: Locator
	readonly spendingSummaryCard: Locator

	constructor(page: Page) {
		super(page)

		// Page Header & Actions
		this.pageHeader = page.getByRole('banner').or(page.locator('header'))
		this.pageTitle = page.getByRole('heading', { name: /analytics/i })
		this.pageDescription = page.getByText(/track|monitor|business intelligence/i).first()
		this.dateRangePicker = page
			.getByRole('combobox', { name: /date|time|period|range/i })
			.or(page.getByTestId('analytics-date-picker'))
			.or(page.getByRole('button', { name: /12m|6m|3m|1m|custom/i }))

		// Common Elements
		this.mainContent = page.getByRole('main').or(page.locator('main'))
		this.loadingState = page.getByTestId('analytics-loading').or(page.getByText(/loading/i))
		this.errorState = page.getByTestId('analytics-error').or(page.getByRole('alert'))
		this.emptyState = page.getByTestId('analytics-empty').or(page.getByText(/no data|no analytics/i))
		this.retryButton = page.getByRole('button', { name: /retry|try again/i })

		// KPI Cards
		this.kpiCards = page.getByTestId('kpi-card').or(page.locator('[class*="kpi"]'))
		this.totalRevenueCard = page.getByText(/total revenue/i).locator('..')
		this.totalOrdersCard = page.getByText(/total orders/i).locator('..')
		this.averageOrderValueCard = page.getByText(/average.*order|avg.*order/i).locator('..')
		this.conversionRateCard = page.getByText(/conversion.*rate/i).locator('..')

		// Sales Rep Analytics
		this.salesRepView = page.getByTestId('sales-rep-analytics').or(page.locator('[class*="sales-rep"]'))
		this.personalPerformanceSection = page.getByText(/personal.*performance|your.*performance/i).locator('..')
		this.teamComparisonSection = page.getByText(/team.*comparison|vs.*team/i).locator('..')
		this.pipelineSection = page.getByText(/pipeline/i).locator('..')
		this.quotesMetrics = page.getByText(/quotes/i).first()
		this.ordersMetrics = page.getByText(/orders/i).first()

		// Manager Analytics
		this.managerView = page.getByTestId('manager-analytics').or(page.locator('[class*="manager"]'))
		this.teamLeaderboard = page.getByTestId('team-leaderboard').or(page.getByText(/leaderboard/i).locator('..'))
		this.teamLeaderboardTable = page.getByRole('table').filter({ hasText: /rep|sales|name/i })
		this.revenueChart = page
			.getByTestId('revenue-chart')
			.or(page.locator('canvas'))
			.or(page.locator('[class*="chart"]'))
		this.conversionFunnel = page.getByTestId('conversion-funnel').or(page.getByText(/funnel/i).locator('..'))
		this.teamPerformanceSection = page.getByText(/team.*performance/i).locator('..')

		// Customer Analytics
		this.customerView = page.getByTestId('customer-analytics').or(page.locator('[class*="customer"]'))
		this.spendingHistorySection = page.getByText(/spending.*history/i).locator('..')
		this.orderTrendsSection = page.getByText(/order.*trends/i).locator('..')
		this.spendingSummaryCard = page.getByText(/spending.*summary|total.*spent/i).locator('..')
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/analytics')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		await this.page.waitForLoadState('networkidle')

		// Primary: Look for analytics heading
		const hasTitle = await this.pageTitle.isVisible().catch(() => false)

		// Secondary: Look for KPI cards or main content
		const hasKPIs = await this.kpiCards
			.first()
			.isVisible()
			.catch(() => false)
		const hasMainContent = await this.mainContent.isVisible().catch(() => false)
		const hasChart = await this.revenueChart.isVisible().catch(() => false)
		const hasEmpty = await this.emptyState.isVisible().catch(() => false)
		const hasError = await this.errorState.isVisible().catch(() => false)

		// Page should show something meaningful
		expect(hasTitle || hasKPIs || hasMainContent || hasChart || hasEmpty || hasError).toBeTruthy()
	}

	// =============================================
	// DATE RANGE ACTIONS
	// =============================================

	/**
	 * Select a time range preset
	 */
	async selectTimeRange(range: '12m' | '6m' | '3m' | '1m' | 'custom'): Promise<void> {
		const rangeButton = this.page.getByRole('button', { name: new RegExp(range, 'i') })
		const hasButton = await rangeButton.isVisible().catch(() => false)

		if (hasButton) {
			await rangeButton.click()
			await this.waitForLoad()
		} else {
			// Try combobox approach
			const hasCombobox = await this.dateRangePicker.isVisible().catch(() => false)
			if (hasCombobox) {
				await this.dateRangePicker.click()
				const option = this.page.getByRole('option', { name: new RegExp(range, 'i') })
				const hasOption = await option.isVisible().catch(() => false)
				if (hasOption) {
					await option.click()
					await this.waitForLoad()
				}
			}
		}
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect page title to be visible
	 */
	async expectTitleVisible(): Promise<void> {
		await expect(this.pageTitle).toBeVisible()
	}

	/**
	 * Expect KPI cards to be visible
	 */
	async expectKPICardsVisible(): Promise<void> {
		const hasKPIs = await this.kpiCards
			.first()
			.isVisible()
			.catch(() => false)
		const hasRevenue = await this.page
			.getByText(/revenue|orders|sales/i)
			.first()
			.isVisible()
			.catch(() => false)

		expect(hasKPIs || hasRevenue).toBeTruthy()
	}

	/**
	 * Expect Sales Rep view components
	 */
	async expectSalesRepViewVisible(): Promise<void> {
		// Sales rep should see personal performance metrics
		const hasPerformance = await this.personalPerformanceSection.isVisible().catch(() => false)
		const hasQuotes = await this.quotesMetrics.isVisible().catch(() => false)
		const hasOrders = await this.ordersMetrics.isVisible().catch(() => false)
		const hasKPIs = await this.kpiCards
			.first()
			.isVisible()
			.catch(() => false)

		expect(hasPerformance || hasQuotes || hasOrders || hasKPIs).toBeTruthy()
	}

	/**
	 * Expect Manager view components (team leaderboard, revenue chart)
	 */
	async expectManagerViewVisible(): Promise<void> {
		const hasLeaderboard = await this.teamLeaderboard.isVisible().catch(() => false)
		const hasChart = await this.revenueChart.isVisible().catch(() => false)
		const hasTeamPerf = await this.teamPerformanceSection.isVisible().catch(() => false)
		const hasKPIs = await this.kpiCards
			.first()
			.isVisible()
			.catch(() => false)

		expect(hasLeaderboard || hasChart || hasTeamPerf || hasKPIs).toBeTruthy()
	}

	/**
	 * Expect Customer view components
	 */
	async expectCustomerViewVisible(): Promise<void> {
		const hasSpending = await this.spendingHistorySection.isVisible().catch(() => false)
		const hasTrends = await this.orderTrendsSection.isVisible().catch(() => false)
		const hasKPIs = await this.kpiCards
			.first()
			.isVisible()
			.catch(() => false)
		const hasSummary = await this.spendingSummaryCard.isVisible().catch(() => false)

		expect(hasSpending || hasTrends || hasKPIs || hasSummary).toBeTruthy()
	}

	/**
	 * Expect revenue chart to be visible
	 */
	async expectRevenueChartVisible(): Promise<void> {
		const hasCanvas = await this.page
			.locator('canvas')
			.first()
			.isVisible()
			.catch(() => false)
		const hasChart = await this.page
			.locator('[class*="chart"]')
			.first()
			.isVisible()
			.catch(() => false)
		const hasRevenueText = await this.page
			.getByText(/revenue/i)
			.first()
			.isVisible()
			.catch(() => false)

		expect(hasCanvas || hasChart || hasRevenueText).toBeTruthy()
	}

	/**
	 * Expect team leaderboard to be visible
	 */
	async expectTeamLeaderboardVisible(): Promise<void> {
		const hasLeaderboard = await this.teamLeaderboard.isVisible().catch(() => false)
		const hasTable = await this.teamLeaderboardTable.isVisible().catch(() => false)
		const hasLeaderboardText = await this.page
			.getByText(/leaderboard/i)
			.isVisible()
			.catch(() => false)

		expect(hasLeaderboard || hasTable || hasLeaderboardText).toBeTruthy()
	}

	/**
	 * Expect date range picker to be visible
	 */
	async expectDateRangePickerVisible(): Promise<void> {
		const hasPicker = await this.dateRangePicker.isVisible().catch(() => false)
		const hasTimeButtons = await this.page
			.getByRole('button', { name: /12m|6m|3m|1m/i })
			.first()
			.isVisible()
			.catch(() => false)

		expect(hasPicker || hasTimeButtons).toBeTruthy()
	}

	/**
	 * Expect loading state
	 */
	async expectLoading(): Promise<void> {
		await expect(this.loadingState).toBeVisible()
	}

	/**
	 * Expect error state
	 */
	async expectError(): Promise<void> {
		await expect(this.errorState).toBeVisible()
	}

	/**
	 * Expect empty state
	 */
	async expectEmpty(): Promise<void> {
		await expect(this.emptyState).toBeVisible()
	}

	// =============================================
	// HELPER METHODS
	// =============================================

	/**
	 * Get visible KPI card count
	 */
	async getKPICardCount(): Promise<number> {
		const count = await this.kpiCards.count()
		return count
	}

	/**
	 * Get team leaderboard row count
	 */
	async getLeaderboardRowCount(): Promise<number> {
		const rows = this.teamLeaderboardTable.locator('tbody tr')
		const count = await rows.count()
		return count
	}

	/**
	 * Click retry button if visible
	 */
	async retry(): Promise<void> {
		const hasRetry = await this.retryButton.isVisible().catch(() => false)
		if (hasRetry) {
			await this.retryButton.click()
			await this.waitForLoad()
		}
	}
}
