/**
 * Orders Page Object Model
 *
 * Encapsulates order list and detail interactions.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class OrdersPage extends BasePage {
	// Order list
	readonly ordersTable: Locator
	readonly orderRows: Locator
	readonly emptyOrdersMessage: Locator

	// Filters
	readonly statusFilter: Locator
	readonly dateRangeFilter: Locator
	readonly searchInput: Locator

	// Order detail
	readonly orderDetail: Locator
	readonly orderNumber: Locator
	readonly orderStatus: Locator
	readonly orderDate: Locator
	readonly orderItems: Locator
	readonly orderTotal: Locator
	readonly trackingNumber: Locator

	// Actions
	readonly viewOrderButton: Locator
	readonly reorderButton: Locator
	readonly cancelOrderButton: Locator
	readonly exportButton: Locator

	// Pagination
	readonly pagination: Locator
	readonly nextPageButton: Locator
	readonly prevPageButton: Locator

	constructor(page: Page) {
		super(page)

		// Order list
		this.ordersTable = page.getByTestId('orders-table').or(page.getByRole('table'))
		this.orderRows = page.getByTestId('order-row').or(page.locator('tbody tr'))
		this.emptyOrdersMessage = page.getByText(/no orders|no results/i)

		// Filters
		this.statusFilter = page.getByRole('combobox', { name: /status/i })
		this.dateRangeFilter = page.getByRole('combobox', { name: /date|range/i })
		this.searchInput = page.getByPlaceholder(/search orders|order number/i)

		// Order detail
		this.orderDetail = page.getByTestId('order-detail')
		this.orderNumber = page.getByTestId('order-number')
		this.orderStatus = page.getByTestId('order-status')
		this.orderDate = page.getByTestId('order-date')
		this.orderItems = page.getByTestId('order-items')
		this.orderTotal = page.getByTestId('order-total')
		this.trackingNumber = page.getByTestId('tracking-number')

		// Actions
		this.viewOrderButton = page.getByRole('button', { name: /view|details/i })
		this.reorderButton = page.getByRole('button', { name: /reorder|order again/i })
		this.cancelOrderButton = page.getByRole('button', { name: /cancel/i })
		this.exportButton = page.getByRole('button', { name: /export|download/i })

		// Pagination
		this.pagination = page.getByRole('navigation', { name: /pagination/i })
		this.nextPageButton = page.getByRole('button', { name: /next/i })
		this.prevPageButton = page.getByRole('button', { name: /previous|prev/i })
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/orders')
		await this.waitForLoad()
	}

	async gotoOrder(orderId: string): Promise<void> {
		await this.page.goto(`/app/orders/${orderId}`)
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		const hasOrders = await this.ordersTable.isVisible().catch(() => false)
		const isEmpty = await this.emptyOrdersMessage.isVisible().catch(() => false)
		expect(hasOrders || isEmpty).toBeTruthy()
	}

	// =============================================
	// FILTER ACTIONS
	// =============================================

	/**
	 * Filter by status
	 */
	async filterByStatus(status: string): Promise<void> {
		await this.statusFilter.selectOption(status)
		await this.waitForLoad()
	}

	/**
	 * Search for order
	 */
	async searchOrder(query: string): Promise<void> {
		await this.searchInput.fill(query)
		await this.searchInput.press('Enter')
		await this.waitForLoad()
	}

	// =============================================
	// ORDER LIST ACTIONS
	// =============================================

	/**
	 * Get order row by order number
	 */
	getOrderRow(orderNumber: string): Locator {
		return this.orderRows.filter({ hasText: orderNumber })
	}

	/**
	 * Click on an order to view details
	 */
	async viewOrder(orderNumber: string): Promise<void> {
		const row = this.getOrderRow(orderNumber)
		await row.click()
		await this.waitForLoad()
	}

	/**
	 * Get order status from list
	 */
	async getOrderStatusFromList(orderNumber: string): Promise<string> {
		const row = this.getOrderRow(orderNumber)
		const statusCell = row.locator('[data-status]').or(row.locator('td').nth(2))
		return (await statusCell.textContent()) || ''
	}

	// =============================================
	// ORDER DETAIL ACTIONS
	// =============================================

	/**
	 * Get current order number
	 */
	async getCurrentOrderNumber(): Promise<string> {
		return (await this.orderNumber.textContent()) || ''
	}

	/**
	 * Get current order status
	 */
	async getCurrentOrderStatus(): Promise<string> {
		return (await this.orderStatus.textContent()) || ''
	}

	/**
	 * Get tracking number
	 */
	async getTrackingNumber(): Promise<string> {
		const isVisible = await this.trackingNumber.isVisible().catch(() => false)
		if (!isVisible) return ''
		return (await this.trackingNumber.textContent()) || ''
	}

	/**
	 * Reorder this order
	 */
	async reorder(): Promise<void> {
		await this.reorderButton.click()
	}

	/**
	 * Cancel this order
	 */
	async cancelOrder(): Promise<void> {
		await this.cancelOrderButton.click()
		// Handle confirmation dialog
		const confirmButton = this.page.getByRole('button', { name: /confirm|yes/i })
		const hasConfirm = await confirmButton.isVisible().catch(() => false)
		if (hasConfirm) {
			await confirmButton.click()
		}
		await this.waitForLoad()
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect order in list
	 */
	async expectOrderInList(orderNumber: string): Promise<void> {
		await expect(this.getOrderRow(orderNumber)).toBeVisible()
	}

	/**
	 * Expect order NOT in list
	 */
	async expectOrderNotInList(orderNumber: string): Promise<void> {
		await expect(this.getOrderRow(orderNumber)).not.toBeVisible()
	}

	/**
	 * Expect order status
	 */
	async expectStatus(status: string | RegExp): Promise<void> {
		await expect(this.orderStatus).toContainText(status)
	}

	/**
	 * Expect order detail visible
	 */
	async expectDetailVisible(): Promise<void> {
		await expect(this.orderDetail).toBeVisible()
	}

	/**
	 * Expect empty orders
	 */
	async expectEmpty(): Promise<void> {
		await expect(this.emptyOrdersMessage).toBeVisible()
	}

	/**
	 * Expect tracking number
	 */
	async expectTrackingNumber(): Promise<void> {
		await expect(this.trackingNumber).toBeVisible()
	}
}
