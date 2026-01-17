/**
 * Quotes Page Object Model
 *
 * Encapsulates quote management interactions for Sales Rep (Level 3000)
 * and Sales Manager (Level 4000) roles.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class QuotesPage extends BasePage {
	// Quote list
	readonly quotesTable: Locator
	readonly quoteRows: Locator
	readonly emptyQuotesMessage: Locator

	// Filters
	readonly statusFilter: Locator
	readonly customerFilter: Locator
	readonly dateFilter: Locator
	readonly searchInput: Locator

	// Quote actions
	readonly createQuoteButton: Locator
	readonly editQuoteButton: Locator
	readonly deleteQuoteButton: Locator
	readonly cloneQuoteButton: Locator
	readonly submitForApprovalButton: Locator
	readonly convertToOrderButton: Locator

	// Quote editor
	readonly quoteEditorModal: Locator
	readonly customerSelect: Locator
	readonly productSearch: Locator
	readonly productResults: Locator
	readonly quoteLineItems: Locator
	readonly addProductButton: Locator
	readonly removeProductButton: Locator
	readonly quantityInput: Locator
	readonly priceInput: Locator
	readonly discountInput: Locator

	// Quote totals
	readonly subtotalAmount: Locator
	readonly discountAmount: Locator
	readonly taxAmount: Locator
	readonly totalAmount: Locator

	// Quote details
	readonly quoteNumber: Locator
	readonly quoteStatus: Locator
	readonly quoteDate: Locator
	readonly validUntilDate: Locator
	readonly customerName: Locator
	readonly notesField: Locator

	// Pricing explainability (Business requirement)
	readonly priceBreakdown: Locator
	readonly priceExplanation: Locator
	readonly marginDisplay: Locator
	readonly marginWarning: Locator
	readonly pricingRuleApplied: Locator

	// Approval workflow
	readonly approvalStatus: Locator
	readonly approvalHistory: Locator
	readonly approvalComments: Locator

	// Save actions
	readonly saveDraftButton: Locator
	readonly saveAndSendButton: Locator
	readonly cancelButton: Locator

	constructor(page: Page) {
		super(page)

		// Quote list
		this.quotesTable = page.getByTestId('quotes-table').or(page.getByRole('table'))
		this.quoteRows = page.getByTestId('quote-row').or(page.locator('tbody tr'))
		this.emptyQuotesMessage = page.getByText(/no quotes|no results/i)

		// Filters
		this.statusFilter = page.getByRole('combobox', { name: /status/i })
		this.customerFilter = page.getByRole('combobox', { name: /customer/i })
		this.dateFilter = page.getByRole('combobox', { name: /date/i })
		this.searchInput = page.getByPlaceholder(/search quotes|quote number/i)

		// Quote actions
		this.createQuoteButton = page
			.getByRole('button', { name: /create quote|new quote/i })
			.or(page.getByTestId('create-quote-btn'))
		this.editQuoteButton = page.getByRole('button', { name: /edit/i })
		this.deleteQuoteButton = page.getByRole('button', { name: /delete/i })
		this.cloneQuoteButton = page.getByRole('button', { name: /clone|duplicate/i })
		this.submitForApprovalButton = page
			.getByRole('button', { name: /submit for approval|request approval/i })
			.or(page.getByTestId('submit-approval-btn'))
		this.convertToOrderButton = page
			.getByRole('button', { name: /convert to order|create order/i })
			.or(page.getByTestId('convert-order-btn'))

		// Quote editor
		this.quoteEditorModal = page.getByRole('dialog').or(page.getByTestId('quote-editor'))
		this.customerSelect = page
			.getByRole('combobox', { name: /select customer|customer/i })
			.or(page.getByTestId('customer-select'))
		this.productSearch = page
			.getByPlaceholder(/search products|add product/i)
			.or(page.getByTestId('product-search'))
		this.productResults = page.getByTestId('product-results').or(page.locator('[data-products]'))
		this.quoteLineItems = page.getByTestId('quote-line-items').or(page.locator('[data-line-items]'))
		this.addProductButton = page.getByRole('button', { name: /add product|add item/i })
		this.removeProductButton = page.getByRole('button', { name: /remove|delete item/i })
		this.quantityInput = page.getByLabel(/quantity/i).or(page.getByTestId('quantity-input'))
		this.priceInput = page.getByLabel(/price|unit price/i).or(page.getByTestId('price-input'))
		this.discountInput = page.getByLabel(/discount/i).or(page.getByTestId('discount-input'))

		// Quote totals
		this.subtotalAmount = page.getByTestId('subtotal').or(page.locator('[data-subtotal]'))
		this.discountAmount = page.getByTestId('discount-total').or(page.locator('[data-discount]'))
		this.taxAmount = page.getByTestId('tax').or(page.locator('[data-tax]'))
		this.totalAmount = page.getByTestId('total').or(page.locator('[data-total]'))

		// Quote details
		this.quoteNumber = page.getByTestId('quote-number')
		this.quoteStatus = page.getByTestId('quote-status')
		this.quoteDate = page.getByTestId('quote-date')
		this.validUntilDate = page.getByTestId('valid-until')
		this.customerName = page.getByTestId('customer-name')
		this.notesField = page.getByLabel(/notes/i).or(page.getByTestId('quote-notes'))

		// Pricing explainability (Critical business requirement)
		this.priceBreakdown = page
			.getByTestId('price-breakdown')
			.or(page.locator('[data-price-breakdown]'))
		this.priceExplanation = page
			.getByTestId('price-explanation')
			.or(page.locator('[data-price-explanation]'))
		this.marginDisplay = page.getByTestId('margin-display').or(page.locator('[data-margin]'))
		this.marginWarning = page
			.getByTestId('margin-warning')
			.or(page.getByText(/margin too low|below threshold/i))
		this.pricingRuleApplied = page
			.getByTestId('pricing-rule')
			.or(page.locator('[data-pricing-rule]'))

		// Approval workflow
		this.approvalStatus = page.getByTestId('approval-status')
		this.approvalHistory = page.getByTestId('approval-history')
		this.approvalComments = page.getByLabel(/comments|approval notes/i)

		// Save actions
		this.saveDraftButton = page.getByRole('button', { name: /save draft|save as draft/i })
		this.saveAndSendButton = page.getByRole('button', { name: /save and send|send quote/i })
		this.cancelButton = page.getByRole('button', { name: /cancel/i })
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/quotes')
		await this.waitForLoad()
	}

	async gotoQuote(quoteId: string): Promise<void> {
		await this.page.goto(`/app/quotes/${quoteId}`)
		await this.waitForLoad()
	}

	async gotoNewQuote(): Promise<void> {
		await this.page.goto('/app/quotes/create')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to be stable
		await this.page.waitForLoadState('networkidle')
		
		// Primary check: Look for the Quotes heading (most reliable indicator)
		const hasHeading = await this.page.getByRole('heading', { name: /quotes/i }).first().isVisible().catch(() => false)
		
		// Secondary checks for various page states  
		const hasTable = await this.page.getByTestId('quotes-table').isVisible().catch(() => false)
		const hasQuoteStatus = await this.page.getByTestId('quote-status').isVisible().catch(() => false)
		const hasEmptyState = await this.emptyQuotesMessage.isVisible().catch(() => false)
		const isDetailPage = this.page.url().includes('/quotes/')
		
		// Success if any indicator is present
		expect(hasHeading || hasTable || hasQuoteStatus || hasEmptyState || isDetailPage).toBeTruthy()
	}

	// =============================================
	// QUOTE LIST ACTIONS
	// =============================================

	/**
	 * Get quote row by quote number
	 */
	getQuoteRow(quoteNumber: string): Locator {
		return this.quoteRows.filter({ hasText: quoteNumber })
	}

	/**
	 * Select a quote from the list
	 */
	async selectQuote(quoteNumber: string): Promise<void> {
		const row = this.getQuoteRow(quoteNumber)
		await row.click()
		await this.waitForLoad()
	}

	/**
	 * Open quote editor for new quote
	 */
	async openCreateQuote(): Promise<void> {
		await this.createQuoteButton.click()
		await this.waitForLoad()
	}

	/**
	 * Filter by status
	 */
	async filterByStatus(status: string): Promise<void> {
		await this.statusFilter.selectOption(status)
		await this.waitForLoad()
	}

	/**
	 * Search quotes
	 */
	async searchQuote(query: string): Promise<void> {
		await this.searchInput.fill(query)
		await this.searchInput.press('Enter')
		await this.waitForLoad()
	}

	// =============================================
	// QUOTE CREATION & EDITING
	// =============================================

	/**
	 * Select customer for quote
	 */
	async selectCustomer(customerName: string): Promise<void> {
		await this.customerSelect.click()
		const option = this.page.getByRole('option', { name: new RegExp(customerName, 'i') })
		await option.click()
		await this.waitForLoad()
	}

	/**
	 * Add product to quote
	 */
	async addProduct(productName: string, quantity: number = 1): Promise<void> {
		await this.productSearch.fill(productName)
		await this.productResults.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})

		// Select from results
		const productOption = this.productResults.getByText(new RegExp(productName, 'i')).first()
		await productOption.click()

		// Set quantity if needed
		const lastQuantityInput = this.quoteLineItems.locator('[data-quantity]').last()
		const inputVisible = await lastQuantityInput.isVisible().catch(() => false)
		if (inputVisible && quantity > 1) {
			await lastQuantityInput.fill(quantity.toString())
		}

		await this.waitForLoad()
	}

	/**
	 * Apply discount to a line item or quote
	 */
	async applyDiscount(discountPercent: number): Promise<void> {
		await this.discountInput.fill(discountPercent.toString())
		await this.discountInput.press('Tab') // Trigger calculation
		await this.waitForLoad()
	}

	/**
	 * Save quote as draft
	 */
	async saveDraft(): Promise<void> {
		await this.saveDraftButton.click()
		await this.waitForLoad()
	}

	/**
	 * Submit quote for approval
	 */
	async submitForApproval(): Promise<void> {
		await this.submitForApprovalButton.click()
		await this.waitForLoad()
	}

	/**
	 * Convert approved quote to order
	 */
	async convertToOrder(): Promise<void> {
		await this.convertToOrderButton.click()
		await this.waitForLoad()
	}

	/**
	 * Create complete quote: select customer, add products, save
	 */
	async createCompleteQuote(
		customerName: string,
		products: Array<{ name: string; quantity: number }>,
		saveAsDraft: boolean = true
	): Promise<void> {
		await this.openCreateQuote()
		await this.selectCustomer(customerName)

		for (const product of products) {
			await this.addProduct(product.name, product.quantity)
		}

		if (saveAsDraft) {
			await this.saveDraft()
		}
	}

	// =============================================
	// PRICING & MARGIN (Business critical)
	// =============================================

	/**
	 * Get total amount
	 */
	async getTotalAmount(): Promise<number> {
		const text = (await this.totalAmount.textContent()) || '0'
		return parseFloat(text.replace(/[^0-9.]/g, ''))
	}

	/**
	 * Get margin percentage
	 */
	async getMarginPercentage(): Promise<number> {
		const text = (await this.marginDisplay.textContent()) || '0'
		return parseFloat(text.replace(/[^0-9.]/g, ''))
	}

	/**
	 * Check if margin warning is visible
	 */
	async hasMarginWarning(): Promise<boolean> {
		return this.marginWarning.isVisible().catch(() => false)
	}

	/**
	 * Get pricing explanation text
	 */
	async getPriceExplanation(): Promise<string> {
		const isVisible = await this.priceExplanation.isVisible().catch(() => false)
		if (!isVisible) return ''
		return (await this.priceExplanation.textContent()) || ''
	}

	/**
	 * Get applied pricing rule
	 */
	async getAppliedPricingRule(): Promise<string> {
		const isVisible = await this.pricingRuleApplied.isVisible().catch(() => false)
		if (!isVisible) return ''
		return (await this.pricingRuleApplied.textContent()) || ''
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect quote in list
	 */
	async expectQuoteInList(quoteNumber: string): Promise<void> {
		await expect(this.getQuoteRow(quoteNumber)).toBeVisible()
	}

	/**
	 * Expect quote status
	 */
	async expectQuoteStatus(status: string | RegExp): Promise<void> {
		await expect(this.quoteStatus).toContainText(status)
	}

	/**
	 * Expect price explanation visible (Business requirement)
	 */
	async expectPriceExplanationVisible(): Promise<void> {
		await expect(this.priceExplanation).toBeVisible()
	}

	/**
	 * Expect margin within acceptable range
	 */
	async expectMarginAboveThreshold(minMargin: number): Promise<void> {
		const margin = await this.getMarginPercentage()
		expect(margin).toBeGreaterThanOrEqual(minMargin)
	}

	/**
	 * Expect margin warning visible (guardrail triggered)
	 */
	async expectMarginWarningVisible(): Promise<void> {
		await expect(this.marginWarning).toBeVisible()
	}

	/**
	 * Expect convert to order button enabled (quote approved)
	 */
	async expectCanConvertToOrder(): Promise<void> {
		await expect(this.convertToOrderButton).toBeEnabled()
	}

	/**
	 * Expect convert to order button disabled (awaiting approval)
	 */
	async expectCannotConvertToOrder(): Promise<void> {
		await expect(this.convertToOrderButton).toBeDisabled()
	}

	/**
	 * Expect empty quotes list
	 */
	async expectEmptyList(): Promise<void> {
		await expect(this.emptyQuotesMessage).toBeVisible()
	}
}
