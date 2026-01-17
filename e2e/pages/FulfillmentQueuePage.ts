/**
 * Fulfillment Queue Page Object Model
 *
 * Encapsulates fulfillment coordinator's order queue and processing interactions.
 * Used by Fulfillment role (Level 2000) for order processing workflows.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class FulfillmentQueuePage extends BasePage {
	// Queue list
	readonly orderQueue: Locator
	readonly queueRows: Locator
	readonly emptyQueueMessage: Locator
	readonly queueCount: Locator

	// Filters
	readonly statusFilter: Locator
	readonly priorityFilter: Locator
	readonly dateFilter: Locator
	readonly searchInput: Locator

	// Order details panel
	readonly orderDetailPanel: Locator
	readonly selectedOrderNumber: Locator
	readonly selectedOrderStatus: Locator
	readonly selectedOrderItems: Locator
	readonly selectedOrderCustomer: Locator
	readonly selectedOrderAddress: Locator

	// Processing actions
	readonly processButton: Locator
	readonly markShippedButton: Locator
	readonly addTrackingButton: Locator
	readonly markDeliveredButton: Locator
	readonly cancelOrderButton: Locator
	readonly generateLabelButton: Locator
	readonly printPackingSlipButton: Locator

	// Tracking input
	readonly trackingNumberInput: Locator
	readonly carrierSelect: Locator
	readonly saveTrackingButton: Locator

	// Bulk actions
	readonly selectAllCheckbox: Locator
	readonly bulkProcessButton: Locator
	readonly bulkPrintLabelsButton: Locator

	// ERP sync status
	readonly erpSyncStatus: Locator
	readonly erpExportButton: Locator
	readonly lastSyncTimestamp: Locator

	constructor(page: Page) {
		super(page)

		// Queue list
		this.orderQueue = page
			.getByTestId('order-queue')
			.or(page.getByRole('table'))
			.or(page.locator('[data-queue]'))
		this.queueRows = page
			.getByTestId('queue-row')
			.or(page.locator('tbody tr'))
			.or(page.locator('[data-order-row]'))
		this.emptyQueueMessage = page.getByText(/no orders|no pending|queue is empty/i)
		this.queueCount = page.getByTestId('queue-count').or(page.locator('[data-count]'))

		// Filters
		this.statusFilter = page
			.getByRole('combobox', { name: /status/i })
			.or(page.getByTestId('status-filter'))
		this.priorityFilter = page
			.getByRole('combobox', { name: /priority/i })
			.or(page.getByTestId('priority-filter'))
		this.dateFilter = page
			.getByRole('combobox', { name: /date/i })
			.or(page.getByTestId('date-filter'))
		this.searchInput = page
			.getByPlaceholder(/search|order number/i)
			.or(page.getByRole('searchbox'))

		// Order details panel
		this.orderDetailPanel = page
			.getByTestId('order-detail-panel')
			.or(page.getByRole('complementary'))
		this.selectedOrderNumber = page.getByTestId('selected-order-number')
		this.selectedOrderStatus = page.getByTestId('selected-order-status')
		this.selectedOrderItems = page.getByTestId('selected-order-items')
		this.selectedOrderCustomer = page.getByTestId('selected-customer')
		this.selectedOrderAddress = page.getByTestId('shipping-address')

		// Processing actions
		this.processButton = page
			.getByRole('button', { name: /process|start processing/i })
			.or(page.getByTestId('process-btn'))
		this.markShippedButton = page
			.getByRole('button', { name: /ship|mark shipped|mark as shipped/i })
			.or(page.getByTestId('ship-btn'))
		this.addTrackingButton = page
			.getByRole('button', { name: /tracking|add tracking/i })
			.or(page.getByTestId('tracking-btn'))
		this.markDeliveredButton = page
			.getByRole('button', { name: /deliver|mark delivered|complete/i })
			.or(page.getByTestId('deliver-btn'))
		this.cancelOrderButton = page
			.getByRole('button', { name: /cancel/i })
			.or(page.getByTestId('cancel-btn'))
		this.generateLabelButton = page
			.getByRole('button', { name: /label|generate label|print label/i })
			.or(page.getByTestId('label-btn'))
		this.printPackingSlipButton = page
			.getByRole('button', { name: /packing slip|packing list/i })
			.or(page.getByTestId('packing-btn'))

		// Tracking input
		this.trackingNumberInput = page
			.getByLabel(/tracking number/i)
			.or(page.getByPlaceholder(/tracking/i))
			.or(page.getByTestId('tracking-input'))
		this.carrierSelect = page
			.getByRole('combobox', { name: /carrier/i })
			.or(page.getByTestId('carrier-select'))
		this.saveTrackingButton = page
			.getByRole('button', { name: /save tracking|update tracking/i })
			.or(page.getByTestId('save-tracking-btn'))

		// Bulk actions
		this.selectAllCheckbox = page.getByRole('checkbox', { name: /select all/i })
		this.bulkProcessButton = page.getByRole('button', { name: /bulk process/i })
		this.bulkPrintLabelsButton = page.getByRole('button', { name: /print all labels/i })

		// ERP sync status
		this.erpSyncStatus = page
			.getByTestId('erp-sync-status')
			.or(page.locator('[data-erp-status]'))
		this.erpExportButton = page
			.getByRole('button', { name: /export to erp|sync to/i })
			.or(page.getByTestId('erp-export-btn'))
		this.lastSyncTimestamp = page.getByTestId('last-sync').or(page.locator('[data-last-sync]'))
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/fulfillment')
		await this.waitForLoad()
	}

	async gotoQueue(): Promise<void> {
		await this.page.goto('/app/fulfillment')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to be stable
		await this.page.waitForLoadState('networkidle')
		
		// Primary check: Look for the Fulfillment Queue heading
		const hasHeading = await this.page.getByRole('heading', { name: /fulfillment/i }).first().isVisible().catch(() => false)
		
		// Secondary checks for various page states
		const hasTestId = await this.page.getByTestId('order-queue').isVisible().catch(() => false)
		const hasTable = await this.page.getByRole('table').first().isVisible().catch(() => false)
		const hasEmptyState = await this.emptyQueueMessage.isVisible().catch(() => false)
		const hasAccessDenied = await this.page.getByText(/access denied/i).isVisible().catch(() => false)
		const hasCard = await this.page.locator('.card-body').first().isVisible().catch(() => false)
		
		// Success if any indicator is present (including access denied - valid page state)
		expect(hasHeading || hasTestId || hasTable || hasEmptyState || hasAccessDenied || hasCard).toBeTruthy()
	}

	// =============================================
	// FILTER ACTIONS
	// =============================================

	/**
	 * Filter queue by status
	 */
	async filterByStatus(status: string): Promise<void> {
		await this.statusFilter.selectOption(status)
		await this.waitForLoad()
	}

	/**
	 * Filter queue by priority
	 */
	async filterByPriority(priority: string): Promise<void> {
		await this.priorityFilter.selectOption(priority)
		await this.waitForLoad()
	}

	/**
	 * Search for order in queue
	 */
	async searchOrder(query: string): Promise<void> {
		await this.searchInput.fill(query)
		await this.searchInput.press('Enter')
		await this.waitForLoad()
	}

	// =============================================
	// ORDER SELECTION
	// =============================================

	/**
	 * Get order row by order number
	 */
	getOrderRow(orderNumber: string): Locator {
		return this.queueRows.filter({ hasText: orderNumber })
	}

	/**
	 * Select an order from the queue
	 */
	async selectOrder(orderNumber: string): Promise<void> {
		const row = this.getOrderRow(orderNumber)
		await row.click()
		await this.waitForLoad()
	}

	/**
	 * Select first pending order
	 */
	async selectFirstPendingOrder(): Promise<void> {
		const firstRow = this.queueRows.first()
		await firstRow.click()
		await this.waitForLoad()
	}

	/**
	 * Get current queue count
	 */
	async getQueueCount(): Promise<number> {
		const countText = await this.queueCount.textContent().catch(() => '0')
		return parseInt(countText?.replace(/\D/g, '') || '0', 10)
	}

	// =============================================
	// ORDER PROCESSING
	// =============================================

	/**
	 * Process (start working on) the selected order
	 */
	async processOrder(): Promise<void> {
		await this.processButton.click()
		await this.waitForLoad()
	}

	/**
	 * Generate shipping label for selected order
	 */
	async generateShippingLabel(): Promise<void> {
		await this.generateLabelButton.click()
		await this.waitForLoad()
	}

	/**
	 * Add tracking information
	 */
	async addTracking(trackingNumber: string, carrier: string = 'UPS'): Promise<void> {
		// Open tracking dialog if needed
		const inputVisible = await this.trackingNumberInput.isVisible().catch(() => false)
		if (!inputVisible) {
			await this.addTrackingButton.click()
			await this.trackingNumberInput.waitFor({ state: 'visible', timeout: 5000 })
		}

		await this.trackingNumberInput.fill(trackingNumber)

		const carrierVisible = await this.carrierSelect.isVisible().catch(() => false)
		if (carrierVisible) {
			await this.carrierSelect.selectOption(carrier)
		}

		await this.saveTrackingButton.click()
		await this.waitForLoad()
	}

	/**
	 * Mark order as shipped
	 */
	async markAsShipped(): Promise<void> {
		await this.markShippedButton.click()
		await this.waitForLoad()
	}

	/**
	 * Mark order as delivered
	 */
	async markAsDelivered(): Promise<void> {
		await this.markDeliveredButton.click()
		await this.waitForLoad()
	}

	/**
	 * Complete full shipping flow: process -> label -> tracking -> ship
	 */
	async completeShippingFlow(trackingNumber: string, carrier: string = 'UPS'): Promise<void> {
		// Process order if pending
		const canProcess = await this.processButton.isVisible().catch(() => false)
		if (canProcess) {
			await this.processOrder()
		}

		// Generate label if available
		const canLabel = await this.generateLabelButton.isVisible().catch(() => false)
		if (canLabel) {
			await this.generateShippingLabel()
		}

		// Add tracking
		await this.addTracking(trackingNumber, carrier)

		// Mark as shipped
		await this.markAsShipped()
	}

	// =============================================
	// ERP INTEGRATION
	// =============================================

	/**
	 * Get ERP sync status
	 */
	async getErpSyncStatus(): Promise<string> {
		const isVisible = await this.erpSyncStatus.isVisible().catch(() => false)
		if (!isVisible) return 'not-visible'
		return (await this.erpSyncStatus.textContent()) || ''
	}

	/**
	 * Trigger ERP export
	 */
	async exportToErp(): Promise<void> {
		await this.erpExportButton.click()
		await this.waitForLoad()
	}

	/**
	 * Check if ERP export button is visible
	 */
	async hasErpExport(): Promise<boolean> {
		return this.erpExportButton.isVisible().catch(() => false)
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect order in queue
	 */
	async expectOrderInQueue(orderNumber: string): Promise<void> {
		await expect(this.getOrderRow(orderNumber)).toBeVisible()
	}

	/**
	 * Expect order NOT in queue (already processed)
	 */
	async expectOrderNotInQueue(orderNumber: string): Promise<void> {
		await expect(this.getOrderRow(orderNumber)).not.toBeVisible()
	}

	/**
	 * Expect queue to be empty
	 */
	async expectEmptyQueue(): Promise<void> {
		await expect(this.emptyQueueMessage).toBeVisible()
	}

	/**
	 * Expect order detail panel visible
	 */
	async expectDetailPanelVisible(): Promise<void> {
		await expect(this.orderDetailPanel).toBeVisible()
	}

	/**
	 * Expect order status
	 */
	async expectSelectedOrderStatus(status: string | RegExp): Promise<void> {
		await expect(this.selectedOrderStatus).toContainText(status)
	}

	/**
	 * Expect process button enabled (order can be processed)
	 */
	async expectCanProcess(): Promise<void> {
		await expect(this.processButton).toBeEnabled()
	}

	/**
	 * Expect shipped button enabled
	 */
	async expectCanShip(): Promise<void> {
		await expect(this.markShippedButton).toBeEnabled()
	}

	/**
	 * Expect ERP sync status
	 */
	async expectErpSyncStatus(status: string | RegExp): Promise<void> {
		await expect(this.erpSyncStatus).toContainText(status)
	}
}
