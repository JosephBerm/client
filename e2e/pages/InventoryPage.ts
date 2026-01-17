/**
 * Inventory Page Object Model
 *
 * ARCHITECTURE: Page object for /app/inventory
 * - Stock level viewing
 * - Low stock alerts
 * - Inventory filtering
 *
 * PLAYWRIGHT 1.57.0:
 * - Uses getByRole for stable locators
 * - Strict selectors enabled
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class InventoryPage extends BasePage {
	// Page URL
	readonly url = '/app/inventory'

	// Tab navigation
	readonly stockLevelsTab: Locator
	readonly alertsTab: Locator
	readonly historyTab: Locator

	// Stats cards (ProductStatsGrid)
	readonly statsGrid: Locator
	readonly totalProductsStat: Locator
	readonly lowStockStat: Locator
	readonly outOfStockStat: Locator
	readonly inventoryValueStat: Locator

	// Stock filter
	readonly stockFilterSelect: Locator

	// Data grid
	readonly inventoryTable: Locator
	readonly searchInput: Locator

	// Alert section elements
	readonly outOfStockSection: Locator
	readonly lowStockSection: Locator
	readonly allStockedMessage: Locator

	// Common table columns
	readonly productNameColumn: Locator
	readonly skuColumn: Locator
	readonly onHandColumn: Locator
	readonly reservedColumn: Locator
	readonly availableColumn: Locator
	readonly statusColumn: Locator

	constructor(page: Page) {
		super(page)

		// Tab navigation - use getByRole for accessibility
		this.stockLevelsTab = page.getByRole('tab', { name: /stock levels/i })
		this.alertsTab = page.getByRole('tab', { name: /alerts/i })
		this.historyTab = page.getByRole('tab', { name: /history/i })

		// Stats grid - the ProductStatsGrid component
		this.statsGrid = page.locator('.grid').first()
		this.totalProductsStat = page.getByText(/total products/i).locator('..')
		this.lowStockStat = page
			.getByText(/low stock/i)
			.first()
			.locator('..')
		this.outOfStockStat = page
			.getByText(/out of stock/i)
			.first()
			.locator('..')
		this.inventoryValueStat = page.getByText(/inventory value/i).locator('..')

		// Stock filter dropdown
		this.stockFilterSelect = page.getByRole('combobox').or(page.locator('select'))

		// Data grid table
		this.inventoryTable = page.getByRole('table').or(page.getByLabel(/inventory table/i))
		this.searchInput = page.getByPlaceholder(/search products/i)

		// Alert section elements
		this.outOfStockSection = page.getByRole('heading', { name: /out of stock/i }).locator('..')
		this.lowStockSection = page.getByRole('heading', { name: /low stock \(/i }).locator('..')
		this.allStockedMessage = page.getByText(/all products are well-stocked/i)

		// Table columns - for verification
		this.productNameColumn = page.getByRole('columnheader', { name: /product/i })
		this.skuColumn = page.getByRole('columnheader', { name: /sku/i })
		this.onHandColumn = page.getByRole('columnheader', { name: /on-hand/i })
		this.reservedColumn = page.getByRole('columnheader', { name: /reserved/i })
		this.availableColumn = page.getByRole('columnheader', { name: /available/i })
		this.statusColumn = page.getByRole('columnheader', { name: /status/i })
	}

	// =============================================
	// NAVIGATION
	// =============================================

	/**
	 * Navigate to inventory page
	 */
	async goto(): Promise<void> {
		await this.page.goto(this.url)
		await this.waitForLoad()
	}

	/**
	 * Verify the page is loaded correctly
	 */
	async expectLoaded(): Promise<void> {
		// Wait for page header
		await expect(this.page.getByRole('heading', { name: /inventory management/i })).toBeVisible()
		// Wait for tabs to be visible
		await expect(this.stockLevelsTab).toBeVisible()
	}

	// =============================================
	// TAB NAVIGATION
	// =============================================

	/**
	 * Switch to Stock Levels tab
	 */
	async goToStockLevels(): Promise<void> {
		await this.stockLevelsTab.click()
		await expect(this.inventoryTable).toBeVisible()
	}

	/**
	 * Switch to Alerts tab
	 */
	async goToAlerts(): Promise<void> {
		await this.alertsTab.click()
		// Wait for either alerts content or "all stocked" message
		await expect(this.outOfStockSection.or(this.lowStockSection).or(this.allStockedMessage)).toBeVisible({
			timeout: 10000,
		})
	}

	/**
	 * Switch to History tab
	 */
	async goToHistory(): Promise<void> {
		await this.historyTab.click()
		await expect(this.page.getByText(/transaction history/i)).toBeVisible()
	}

	// =============================================
	// STATS VERIFICATION
	// =============================================

	/**
	 * Get the total products count from stats
	 */
	async getTotalProductsCount(): Promise<number> {
		const statText = await this.totalProductsStat.textContent()
		const match = statText?.match(/\d+/)
		return match ? parseInt(match[0], 10) : 0
	}

	/**
	 * Get low stock count from stats
	 */
	async getLowStockCount(): Promise<number> {
		const statText = await this.lowStockStat.textContent()
		const match = statText?.match(/\d+/)
		return match ? parseInt(match[0], 10) : 0
	}

	/**
	 * Get out of stock count from stats
	 */
	async getOutOfStockCount(): Promise<number> {
		const statText = await this.outOfStockStat.textContent()
		const match = statText?.match(/\d+/)
		return match ? parseInt(match[0], 10) : 0
	}

	/**
	 * Verify stats cards are displayed
	 */
	async expectStatsVisible(): Promise<void> {
		await expect(this.totalProductsStat).toBeVisible()
		await expect(this.lowStockStat).toBeVisible()
		await expect(this.outOfStockStat).toBeVisible()
		await expect(this.inventoryValueStat).toBeVisible()
	}

	// =============================================
	// FILTERING
	// =============================================

	/**
	 * Filter by stock status
	 */
	async filterByStockStatus(status: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'): Promise<void> {
		await this.stockFilterSelect.selectOption(status)
		await this.waitForNetworkIdle()
	}

	/**
	 * Search for a product
	 */
	async searchProduct(query: string): Promise<void> {
		await this.searchInput.fill(query)
		await this.waitForNetworkIdle()
	}

	// =============================================
	// TABLE VERIFICATION
	// =============================================

	/**
	 * Verify all inventory columns are visible
	 */
	async expectInventoryColumnsVisible(): Promise<void> {
		await expect(this.productNameColumn).toBeVisible()
		await expect(this.skuColumn).toBeVisible()
		await expect(this.onHandColumn).toBeVisible()
		await expect(this.reservedColumn).toBeVisible()
		await expect(this.availableColumn).toBeVisible()
		await expect(this.statusColumn).toBeVisible()
	}

	/**
	 * Get product row by name
	 */
	getProductRow(productName: string): Locator {
		return this.inventoryTable.getByRole('row').filter({ hasText: productName })
	}

	/**
	 * Get stock values for a product
	 */
	async getProductStockValues(productName: string): Promise<{
		onHand: number
		reserved: number
		available: number
		status: string
	}> {
		const row = this.getProductRow(productName)
		const cells = row.getByRole('cell')

		// Column order: Product, SKU, Category, On-Hand, Reserved, Available, Status, Actions
		const onHandText = await cells.nth(3).textContent()
		const reservedText = await cells.nth(4).textContent()
		const availableText = await cells.nth(5).textContent()
		const statusBadge = await cells.nth(6).textContent()

		return {
			onHand: parseInt(onHandText || '0', 10),
			reserved: parseInt(reservedText || '0', 10),
			available: parseInt(availableText || '0', 10),
			status: statusBadge?.trim() || '',
		}
	}

	/**
	 * Verify a product shows specific stock values
	 */
	async expectProductStock(
		productName: string,
		expected: { onHand?: number; reserved?: number; available?: number; status?: string }
	): Promise<void> {
		const row = this.getProductRow(productName)
		await expect(row).toBeVisible()

		if (expected.onHand !== undefined) {
			await expect(row).toContainText(expected.onHand.toString())
		}

		if (expected.status) {
			await expect(row.getByText(expected.status, { exact: false })).toBeVisible()
		}
	}

	/**
	 * Verify a product has "In Stock" status
	 */
	async expectProductInStock(productName: string): Promise<void> {
		const row = this.getProductRow(productName)
		await expect(row.getByText(/in stock/i)).toBeVisible()
	}

	/**
	 * Verify a product has "Low Stock" status
	 */
	async expectProductLowStock(productName: string): Promise<void> {
		const row = this.getProductRow(productName)
		await expect(row.getByText(/low stock/i)).toBeVisible()
	}

	/**
	 * Verify a product has "Out of Stock" status
	 */
	async expectProductOutOfStock(productName: string): Promise<void> {
		const row = this.getProductRow(productName)
		await expect(row.getByText(/out of stock/i)).toBeVisible()
	}

	// =============================================
	// ALERTS TAB
	// =============================================

	/**
	 * Get out of stock products from alerts
	 */
	async getOutOfStockProducts(): Promise<string[]> {
		await this.goToAlerts()

		if (await this.allStockedMessage.isVisible()) {
			return []
		}

		const products: string[] = []
		const cards = this.outOfStockSection.locator('[class*="card"]')
		const count = await cards.count()

		for (let i = 0; i < count; i++) {
			const name = await cards.nth(i).locator('p').first().textContent()
			if (name) products.push(name.trim())
		}

		return products
	}

	/**
	 * Get low stock products from alerts
	 */
	async getLowStockProducts(): Promise<string[]> {
		await this.goToAlerts()

		if (await this.allStockedMessage.isVisible()) {
			return []
		}

		const products: string[] = []
		const cards = this.lowStockSection.locator('[class*="card"]')
		const count = await cards.count()

		for (let i = 0; i < count; i++) {
			const name = await cards.nth(i).locator('p').first().textContent()
			if (name) products.push(name.trim())
		}

		return products
	}

	/**
	 * Verify alerts tab shows correct counts
	 */
	async expectAlertsCount(outOfStock: number, lowStock: number): Promise<void> {
		if (outOfStock === 0 && lowStock === 0) {
			await expect(this.allStockedMessage).toBeVisible()
			return
		}

		if (outOfStock > 0) {
			await expect(
				this.page.getByRole('heading', { name: new RegExp(`out of stock \\(${outOfStock}\\)`, 'i') })
			).toBeVisible()
		}

		if (lowStock > 0) {
			await expect(
				this.page.getByRole('heading', { name: new RegExp(`low stock \\(${lowStock}\\)`, 'i') })
			).toBeVisible()
		}
	}

	// =============================================
	// REFRESH & ACTIONS
	// =============================================

	/**
	 * Click refresh button
	 */
	async refresh(): Promise<void> {
		await this.page.getByRole('button', { name: /refresh/i }).click()
		await this.waitForNetworkIdle()
	}

	/**
	 * Click view button for a product
	 */
	async viewProduct(productName: string): Promise<void> {
		const row = this.getProductRow(productName)
		await row.getByRole('button', { name: /view/i }).click()
		await this.waitForLoad()
	}

	/**
	 * Click restock button for an out of stock product (in alerts)
	 */
	async clickRestockFromAlert(productName: string): Promise<void> {
		const card = this.page.locator('[class*="card"]').filter({ hasText: productName })
		await card.getByRole('button', { name: /restock/i }).click()
		await this.waitForLoad()
	}
}
