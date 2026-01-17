/**
 * Pricing Page Object Model
 *
 * Encapsulates pricing management interactions including price lists,
 * volume tiers, contract pricing, and margin controls.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class PricingPage extends BasePage {
	// Main pricing dashboard
	readonly pricingHeading: Locator
	readonly statsCards: Locator
	readonly analyticsSection: Locator

	// Price lists table
	readonly priceListsTable: Locator
	readonly priceListRows: Locator
	readonly emptyPriceListsMessage: Locator

	// Actions
	readonly createPriceListButton: Locator
	readonly editPriceListButton: Locator
	readonly deletePriceListButton: Locator

	// Price list form
	readonly priceListNameInput: Locator
	readonly effectiveDateInput: Locator
	readonly expirationDateInput: Locator
	readonly priceListStatusSelect: Locator
	readonly savePriceListButton: Locator
	readonly cancelButton: Locator

	// Price list items
	readonly priceListItemsTable: Locator
	readonly productSearch: Locator
	readonly basePriceInput: Locator
	readonly vendorCostInput: Locator
	readonly marginDisplay: Locator
	readonly marginIndicator: Locator

	// Volume tiers
	readonly volumeTiersSection: Locator
	readonly addTierButton: Locator
	readonly tierQuantityInput: Locator
	readonly tierDiscountInput: Locator
	readonly tierPriceInput: Locator

	// Contract pricing / Customer assignment
	readonly customerAssignmentSection: Locator
	readonly customerSelect: Locator
	readonly contractPriceInput: Locator
	readonly assignCustomerButton: Locator

	// Audit log
	readonly auditLogSection: Locator
	readonly auditLogEntries: Locator

	// Filters
	readonly searchInput: Locator
	readonly statusFilter: Locator
	readonly dateRangeFilter: Locator

	constructor(page: Page) {
		super(page)

		// Main pricing dashboard
		this.pricingHeading = page.getByRole('heading', { name: /pricing/i })
		this.statsCards = page.getByTestId('pricing-stats').or(page.locator('[data-stats-card]'))
		this.analyticsSection = page.getByTestId('pricing-analytics')

		// Price lists table
		this.priceListsTable = page.getByTestId('price-lists-table').or(page.getByRole('table'))
		this.priceListRows = page.locator('tbody tr')
		this.emptyPriceListsMessage = page.getByText(/no price lists|no results/i)

		// Actions
		this.createPriceListButton = page.getByRole('button', { name: /create|new|add/i }).first()
		this.editPriceListButton = page.getByRole('button', { name: /edit/i })
		this.deletePriceListButton = page.getByRole('button', { name: /delete/i })

		// Price list form
		this.priceListNameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i))
		this.effectiveDateInput = page.getByLabel(/effective.*date|start.*date/i)
		this.expirationDateInput = page.getByLabel(/expir.*date|end.*date/i)
		this.priceListStatusSelect = page.getByRole('combobox', { name: /status/i })
		this.savePriceListButton = page.getByRole('button', { name: /save|submit|create/i })
		this.cancelButton = page.getByRole('button', { name: /cancel/i })

		// Price list items
		this.priceListItemsTable = page.getByTestId('price-list-items').or(page.locator('table').nth(1))
		this.productSearch = page.getByPlaceholder(/search.*product|product.*search/i)
		this.basePriceInput = page.getByLabel(/base.*price|price/i)
		this.vendorCostInput = page.getByLabel(/vendor.*cost|cost/i)
		this.marginDisplay = page.getByTestId('margin-display').or(page.locator('[data-margin]'))
		this.marginIndicator = page.getByTestId('margin-indicator').or(page.locator('[data-margin-status]'))

		// Volume tiers
		this.volumeTiersSection = page
			.getByTestId('volume-tiers')
			.or(page.getByRole('heading', { name: /volume.*tier/i }))
		this.addTierButton = page.getByRole('button', { name: /add.*tier/i })
		this.tierQuantityInput = page.getByLabel(/quantity|min.*qty/i)
		this.tierDiscountInput = page.getByLabel(/discount/i)
		this.tierPriceInput = page.getByLabel(/tier.*price/i)

		// Contract pricing / Customer assignment
		this.customerAssignmentSection = page
			.getByTestId('customer-assignment')
			.or(page.getByRole('heading', { name: /customer.*assign|contract/i }))
		this.customerSelect = page.getByRole('combobox', { name: /customer/i })
		this.contractPriceInput = page.getByLabel(/contract.*price|special.*price/i)
		this.assignCustomerButton = page.getByRole('button', { name: /assign|add.*customer/i })

		// Audit log
		this.auditLogSection = page.getByTestId('audit-log').or(page.getByRole('heading', { name: /audit/i }))
		this.auditLogEntries = page.locator('[data-audit-entry]').or(page.getByTestId('audit-entry'))

		// Filters
		this.searchInput = page.getByPlaceholder(/search/i)
		this.statusFilter = page.getByRole('combobox', { name: /status/i })
		this.dateRangeFilter = page.getByRole('combobox', { name: /date|range/i })
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/pricing')
		await this.waitForLoad()
	}

	async gotoPriceLists(): Promise<void> {
		await this.page.goto('/app/pricing/price-lists')
		await this.waitForLoad()
	}

	async gotoCreatePriceList(): Promise<void> {
		await this.page.goto('/app/pricing/price-lists/create')
		await this.waitForLoad()
	}

	async gotoPriceList(id: string): Promise<void> {
		await this.page.goto(`/app/pricing/price-lists/${id}`)
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		const hasPricingContent =
			(await this.pricingHeading.isVisible().catch(() => false)) ||
			(await this.priceListsTable.isVisible().catch(() => false)) ||
			(await this.emptyPriceListsMessage.isVisible().catch(() => false))
		expect(hasPricingContent).toBeTruthy()
	}

	// =============================================
	// PRICE LIST ACTIONS
	// =============================================

	/**
	 * Create a new price list
	 */
	async createPriceList(data: { name: string; effectiveDate?: string; expirationDate?: string }): Promise<void> {
		await this.createPriceListButton.click()
		await this.page.waitForLoadState('networkidle')

		await this.priceListNameInput.fill(data.name)

		if (data.effectiveDate) {
			await this.effectiveDateInput.fill(data.effectiveDate)
		}

		if (data.expirationDate) {
			await this.expirationDateInput.fill(data.expirationDate)
		}

		await this.savePriceListButton.click()
		await this.waitForLoad()
	}

	/**
	 * Get price list row by name
	 */
	getPriceListRow(name: string): Locator {
		return this.priceListRows.filter({ hasText: name })
	}

	/**
	 * Click on a price list to view/edit
	 */
	async viewPriceList(name: string): Promise<void> {
		const row = this.getPriceListRow(name)
		await row.click()
		await this.waitForLoad()
	}

	// =============================================
	// PRICING ITEM ACTIONS
	// =============================================

	/**
	 * Set base price for a product
	 */
	async setBasePrice(productName: string, price: string): Promise<void> {
		// Find the product row
		const productRow = this.page.locator('tbody tr').filter({ hasText: productName })
		const priceInput = productRow.getByRole('spinbutton').or(productRow.locator('input[type="number"]'))

		await priceInput.first().fill(price)
	}

	/**
	 * Get margin indicator color
	 */
	async getMarginIndicatorColor(productName: string): Promise<string | null> {
		const productRow = this.page.locator('tbody tr').filter({ hasText: productName })
		const indicator = productRow.locator('[data-margin-status]').or(productRow.getByTestId('margin-indicator'))

		const className = await indicator.getAttribute('class')
		const dataStatus = await indicator.getAttribute('data-margin-status')

		return dataStatus || className || null
	}

	// =============================================
	// VOLUME TIER ACTIONS
	// =============================================

	/**
	 * Add a volume tier
	 */
	async addVolumeTier(quantity: string, discount: string): Promise<void> {
		await this.addTierButton.click()

		const lastTierRow = this.page.locator('[data-tier-row]').last()
		await lastTierRow.getByLabel(/quantity/i).fill(quantity)
		await lastTierRow.getByLabel(/discount/i).fill(discount)
	}

	// =============================================
	// CONTRACT PRICING ACTIONS
	// =============================================

	/**
	 * Assign customer-specific pricing
	 */
	async assignCustomerPrice(customerName: string, price: string): Promise<void> {
		await this.customerSelect.selectOption({ label: customerName })
		await this.contractPriceInput.fill(price)
		await this.assignCustomerButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect price list in table
	 */
	async expectPriceListInTable(name: string): Promise<void> {
		await expect(this.getPriceListRow(name)).toBeVisible()
	}

	/**
	 * Expect price list NOT in table
	 */
	async expectPriceListNotInTable(name: string): Promise<void> {
		await expect(this.getPriceListRow(name)).not.toBeVisible()
	}

	/**
	 * Expect margin indicator visible
	 */
	async expectMarginIndicatorVisible(): Promise<void> {
		await expect(this.marginIndicator.first()).toBeVisible()
	}

	/**
	 * Expect volume tiers section visible
	 */
	async expectVolumeTiersVisible(): Promise<void> {
		await expect(this.volumeTiersSection).toBeVisible()
	}

	/**
	 * Expect vendor cost NOT visible (for customer view)
	 */
	async expectVendorCostHidden(): Promise<void> {
		await expect(this.vendorCostInput).not.toBeVisible()
	}

	/**
	 * Expect empty state
	 */
	async expectEmpty(): Promise<void> {
		await expect(this.emptyPriceListsMessage).toBeVisible()
	}
}
