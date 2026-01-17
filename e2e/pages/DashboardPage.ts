/**
 * Dashboard Page Object Model
 *
 * Encapsulates dashboard interactions for various roles.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class DashboardPage extends BasePage {
	// Page heading
	readonly heading: Locator

	// Welcome section
	readonly welcomeMessage: Locator
	readonly userName: Locator
	readonly userRole: Locator

	// Stats cards
	readonly statsSection: Locator
	readonly totalOrdersCard: Locator
	readonly pendingOrdersCard: Locator
	readonly revenueCard: Locator
	readonly customersCard: Locator

	// Recent activity
	readonly recentOrdersSection: Locator
	readonly recentOrders: Locator
	readonly recentQuotesSection: Locator
	readonly recentQuotes: Locator

	// Quick actions
	readonly quickActionsSection: Locator
	readonly newOrderButton: Locator
	readonly viewOrdersButton: Locator
	readonly viewCustomersButton: Locator
	readonly viewReportsButton: Locator

	// Notifications
	readonly notificationsSection: Locator
	readonly unreadNotifications: Locator

	// Tasks (for internal users)
	readonly tasksSection: Locator
	readonly pendingTasks: Locator

	constructor(page: Page) {
		super(page)

		// Page heading
		this.heading = page.getByRole('heading', { name: /dashboard/i }).first()

		// Welcome section
		this.welcomeMessage = page.getByTestId('welcome-message').or(page.getByText(/welcome|hello/i))
		this.userName = page.getByTestId('user-name')
		this.userRole = page.getByTestId('user-role')

		// Stats cards
		this.statsSection = page.getByTestId('stats-section')
		this.totalOrdersCard = page.getByTestId('total-orders-card')
		this.pendingOrdersCard = page.getByTestId('pending-orders-card')
		this.revenueCard = page.getByTestId('revenue-card')
		this.customersCard = page.getByTestId('customers-card')

		// Recent activity
		this.recentOrdersSection = page.getByTestId('recent-orders')
		this.recentOrders = page.getByTestId('recent-order-item')
		this.recentQuotesSection = page.getByTestId('recent-quotes')
		this.recentQuotes = page.getByTestId('recent-quote-item')

		// Quick actions
		this.quickActionsSection = page.getByTestId('quick-actions')
		this.newOrderButton = page.getByRole('button', { name: /new order|place order/i })
		this.viewOrdersButton = page.getByRole('link', { name: /view orders|all orders/i })
		this.viewCustomersButton = page.getByRole('link', { name: /view customers|all customers/i })
		this.viewReportsButton = page.getByRole('link', { name: /view reports|analytics/i })

		// Notifications
		this.notificationsSection = page.getByTestId('notifications-section')
		this.unreadNotifications = page.getByTestId('unread-notification')

		// Tasks
		this.tasksSection = page.getByTestId('tasks-section')
		this.pendingTasks = page.getByTestId('pending-task')
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to load and DOM to be ready
		await this.page.waitForLoadState('domcontentloaded')

		// Wait for the dashboard heading to appear (most reliable indicator)
		await this.page
			.getByRole('heading', { name: /dashboard/i })
			.first()
			.waitFor({ state: 'visible', timeout: 15000 })
			.catch(() => {
				// If dashboard heading not found, try waiting for stats section
			})

		// Now check for dashboard elements
		const hasDashboardTitle = await this.page
			.getByRole('heading', { name: /dashboard/i })
			.first()
			.isVisible()
			.catch(() => false)
		const hasWelcome = await this.welcomeMessage.isVisible().catch(() => false)
		const hasStats = await this.statsSection.isVisible().catch(() => false)
		const hasRecentOrders = await this.recentOrdersSection.isVisible().catch(() => false)
		const hasRecentQuotes = await this.recentQuotesSection.isVisible().catch(() => false)
		const hasQuickActions = await this.quickActionsSection.isVisible().catch(() => false)

		// Any of these indicates the dashboard is loaded
		expect(
			hasDashboardTitle || hasWelcome || hasStats || hasRecentOrders || hasRecentQuotes || hasQuickActions
		).toBeTruthy()
	}

	// =============================================
	// STATS GETTERS
	// =============================================

	/**
	 * Get total orders count
	 */
	async getTotalOrders(): Promise<number> {
		const text = await this.totalOrdersCard.textContent()
		const match = text?.match(/\d+/)?.[0]
		return match ? parseInt(match, 10) : 0
	}

	/**
	 * Get pending orders count
	 */
	async getPendingOrders(): Promise<number> {
		const text = await this.pendingOrdersCard.textContent()
		const match = text?.match(/\d+/)?.[0]
		return match ? parseInt(match, 10) : 0
	}

	/**
	 * Get revenue amount
	 */
	async getRevenue(): Promise<number> {
		const text = await this.revenueCard.textContent()
		const match = text?.match(/[\d,]+\.?\d*/)?.[0]
		return match ? parseFloat(match.replace(',', '')) : 0
	}

	// =============================================
	// QUICK ACTIONS
	// =============================================

	/**
	 * Click new order button
	 */
	async clickNewOrder(): Promise<void> {
		await this.newOrderButton.click()
	}

	/**
	 * Click view orders
	 */
	async clickViewOrders(): Promise<void> {
		await this.viewOrdersButton.click()
	}

	/**
	 * Click view customers
	 */
	async clickViewCustomers(): Promise<void> {
		await this.viewCustomersButton.click()
	}

	/**
	 * Click view reports
	 */
	async clickViewReports(): Promise<void> {
		await this.viewReportsButton.click()
	}

	// =============================================
	// RECENT ACTIVITY
	// =============================================

	/**
	 * Get recent order count
	 */
	async getRecentOrderCount(): Promise<number> {
		return this.recentOrders.count()
	}

	/**
	 * Click on recent order
	 */
	async clickRecentOrder(index: number = 0): Promise<void> {
		await this.recentOrders.nth(index).click()
	}

	// =============================================
	// NOTIFICATIONS
	// =============================================

	/**
	 * Get unread notification count
	 */
	async getUnreadNotificationCount(): Promise<number> {
		return this.unreadNotifications.count()
	}

	// =============================================
	// TASKS
	// =============================================

	/**
	 * Get pending task count
	 */
	async getPendingTaskCount(): Promise<number> {
		return this.pendingTasks.count()
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect welcome message with name
	 */
	async expectWelcome(name?: string): Promise<void> {
		await expect(this.welcomeMessage).toBeVisible()
		if (name) {
			await expect(this.welcomeMessage).toContainText(name)
		}
	}

	/**
	 * Expect stats section visible
	 */
	async expectStatsVisible(): Promise<void> {
		await expect(this.statsSection).toBeVisible()
	}

	/**
	 * Expect recent orders visible
	 */
	async expectRecentOrdersVisible(): Promise<void> {
		await expect(this.recentOrdersSection).toBeVisible()
	}

	/**
	 * Expect quick actions visible
	 */
	async expectQuickActionsVisible(): Promise<void> {
		await expect(this.quickActionsSection).toBeVisible()
	}

	/**
	 * Expect user role badge
	 */
	async expectUserRole(role: string | RegExp): Promise<void> {
		await expect(this.userRole).toContainText(role)
	}
}
