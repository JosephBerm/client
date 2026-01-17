/**
 * Customers Page Object Model
 *
 * Encapsulates customer management interactions for Sales Rep (Level 3000)
 * and Admin (Level 5000) roles.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class CustomersPage extends BasePage {
	// Customer list
	readonly customersTable: Locator
	readonly customerRows: Locator
	readonly emptyCustomersMessage: Locator

	// Filters and search
	readonly searchInput: Locator
	readonly statusFilter: Locator
	readonly typeFilter: Locator
	readonly sortDropdown: Locator

	// Customer actions
	readonly addCustomerButton: Locator
	readonly editCustomerButton: Locator
	readonly deleteCustomerButton: Locator
	readonly viewDetailsButton: Locator

	// Customer form/editor
	readonly customerForm: Locator
	readonly companyNameInput: Locator
	readonly contactNameInput: Locator
	readonly emailInput: Locator
	readonly phoneInput: Locator
	readonly businessTypeSelect: Locator

	// Address fields
	readonly streetInput: Locator
	readonly street2Input: Locator
	readonly cityInput: Locator
	readonly stateSelect: Locator
	readonly zipInput: Locator
	readonly countrySelect: Locator

	// Customer details
	readonly customerDetailPanel: Locator
	readonly customerName: Locator
	readonly customerEmail: Locator
	readonly customerStatus: Locator
	readonly customerOrders: Locator
	readonly customerQuotes: Locator

	// Pricing contract (linked to customer)
	readonly pricingContractSection: Locator
	readonly contractTier: Locator
	readonly customPricing: Locator

	// Save actions
	readonly saveCustomerButton: Locator
	readonly cancelButton: Locator

	constructor(page: Page) {
		super(page)

		// Customer list
		this.customersTable = page.getByTestId('customers-table').or(page.getByRole('table'))
		this.customerRows = page.getByTestId('customer-row').or(page.locator('tbody tr'))
		this.emptyCustomersMessage = page.getByText(/no customers|no results/i)

		// Filters and search
		this.searchInput = page
			.getByPlaceholder(/search customers|customer name/i)
			.or(page.getByRole('searchbox'))
		this.statusFilter = page.getByRole('combobox', { name: /status/i })
		this.typeFilter = page.getByRole('combobox', { name: /type|business type/i })
		this.sortDropdown = page.getByRole('combobox', { name: /sort/i })

		// Customer actions
		this.addCustomerButton = page
			.getByRole('button', { name: /add customer|new customer/i })
			.or(page.getByTestId('add-customer-btn'))
		this.editCustomerButton = page.getByRole('button', { name: /edit/i })
		this.deleteCustomerButton = page.getByRole('button', { name: /delete/i })
		this.viewDetailsButton = page.getByRole('button', { name: /view|details/i })

		// Customer form/editor
		this.customerForm = page.getByRole('dialog').or(page.getByTestId('customer-form'))
		this.companyNameInput = page
			.getByLabel(/company name/i)
			.or(page.getByPlaceholder(/company/i))
		this.contactNameInput = page.getByLabel(/contact name/i).or(page.getByPlaceholder(/contact/i))
		this.emailInput = page
			.getByLabel(/email/i)
			.or(page.getByPlaceholder(/email/i))
			.or(page.locator('input[type="email"]'))
		this.phoneInput = page
			.getByLabel(/phone/i)
			.or(page.getByPlaceholder(/phone/i))
			.or(page.locator('input[type="tel"]'))
		this.businessTypeSelect = page.getByRole('combobox', { name: /business type/i })

		// Address fields
		this.streetInput = page.getByLabel(/street|address line 1/i)
		this.street2Input = page.getByLabel(/street 2|address line 2|suite/i)
		this.cityInput = page.getByLabel(/city/i)
		this.stateSelect = page.getByRole('combobox', { name: /state/i })
		this.zipInput = page.getByLabel(/zip|postal/i)
		this.countrySelect = page.getByRole('combobox', { name: /country/i })

		// Customer details
		this.customerDetailPanel = page
			.getByTestId('customer-detail')
			.or(page.getByRole('complementary'))
		this.customerName = page.getByTestId('customer-name')
		this.customerEmail = page.getByTestId('customer-email')
		this.customerStatus = page.getByTestId('customer-status')
		this.customerOrders = page.getByTestId('customer-orders')
		this.customerQuotes = page.getByTestId('customer-quotes')

		// Pricing contract
		this.pricingContractSection = page.getByTestId('pricing-contract')
		this.contractTier = page.getByTestId('contract-tier')
		this.customPricing = page.getByTestId('custom-pricing')

		// Save actions
		this.saveCustomerButton = page
			.getByRole('button', { name: /save|create customer/i })
			.or(page.getByTestId('save-customer-btn'))
		this.cancelButton = page.getByRole('button', { name: /cancel/i })
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/customers')
		await this.waitForLoad()
	}

	async gotoCustomer(customerId: string): Promise<void> {
		await this.page.goto(`/app/customers/${customerId}`)
		await this.waitForLoad()
	}

	async gotoNewCustomer(): Promise<void> {
		await this.page.goto('/app/customers/create')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to be stable
		await this.page.waitForLoadState('networkidle')
		
		// Primary check: Look for the Customers heading (most reliable indicator)
		const hasHeading = await this.page.getByRole('heading', { name: /customers/i }).first().isVisible().catch(() => false)
		
		// Secondary checks for various page states
		const hasTable = await this.customersTable.isVisible().catch(() => false)
		const hasDataGrid = await this.page.getByTestId('customers-table').isVisible().catch(() => false)
		const hasEmptyState = await this.emptyCustomersMessage.isVisible().catch(() => false)
		const isCreatePage = this.page.url().includes('/create')
		
		// Success if any indicator is present
		expect(hasHeading || hasTable || hasDataGrid || hasEmptyState || isCreatePage).toBeTruthy()
	}

	// =============================================
	// CUSTOMER LIST ACTIONS
	// =============================================

	/**
	 * Get customer row by name
	 */
	getCustomerRow(customerName: string): Locator {
		return this.customerRows.filter({ hasText: customerName })
	}

	/**
	 * Select a customer from the list
	 */
	async selectCustomer(customerName: string): Promise<void> {
		const row = this.getCustomerRow(customerName)
		await row.click()
		await this.waitForLoad()
	}

	/**
	 * Search for customers
	 */
	async searchCustomer(query: string): Promise<void> {
		await this.searchInput.fill(query)
		await this.searchInput.press('Enter')
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
	 * Filter by business type
	 */
	async filterByType(type: string): Promise<void> {
		await this.typeFilter.selectOption(type)
		await this.waitForLoad()
	}

	// =============================================
	// CUSTOMER CREATION & EDITING
	// =============================================

	/**
	 * Open form to add new customer
	 */
	async openAddCustomer(): Promise<void> {
		await this.addCustomerButton.click()
		await this.waitForLoad()
	}

	/**
	 * Fill customer form
	 */
	async fillCustomerForm(customer: {
		companyName: string
		contactName: string
		email: string
		phone: string
		businessType?: string
	}): Promise<void> {
		await this.companyNameInput.fill(customer.companyName)
		await this.contactNameInput.fill(customer.contactName)
		await this.emailInput.fill(customer.email)
		await this.phoneInput.fill(customer.phone)

		if (customer.businessType) {
			const typeVisible = await this.businessTypeSelect.isVisible().catch(() => false)
			if (typeVisible) {
				await this.businessTypeSelect.selectOption(customer.businessType)
			}
		}
	}

	/**
	 * Fill address form
	 */
	async fillAddressForm(address: {
		street: string
		street2?: string
		city: string
		state: string
		zip: string
		country?: string
	}): Promise<void> {
		await this.streetInput.fill(address.street)

		if (address.street2) {
			const street2Visible = await this.street2Input.isVisible().catch(() => false)
			if (street2Visible) {
				await this.street2Input.fill(address.street2)
			}
		}

		await this.cityInput.fill(address.city)
		await this.stateSelect.selectOption(address.state)
		await this.zipInput.fill(address.zip)

		if (address.country) {
			const countryVisible = await this.countrySelect.isVisible().catch(() => false)
			if (countryVisible) {
				await this.countrySelect.selectOption(address.country)
			}
		}
	}

	/**
	 * Save customer
	 */
	async saveCustomer(): Promise<void> {
		await this.saveCustomerButton.click()
		await this.waitForLoad()
	}

	/**
	 * Create complete customer
	 */
	async createCustomer(customer: {
		companyName: string
		contactName: string
		email: string
		phone: string
		businessType?: string
	}): Promise<void> {
		await this.openAddCustomer()
		await this.fillCustomerForm(customer)
		await this.saveCustomer()
	}

	// =============================================
	// CUSTOMER DETAILS
	// =============================================

	/**
	 * Get customer name from detail panel
	 */
	async getCustomerName(): Promise<string> {
		return (await this.customerName.textContent()) || ''
	}

	/**
	 * Get customer email from detail panel
	 */
	async getCustomerEmail(): Promise<string> {
		return (await this.customerEmail.textContent()) || ''
	}

	/**
	 * Get customer status
	 */
	async getCustomerStatus(): Promise<string> {
		return (await this.customerStatus.textContent()) || ''
	}

	/**
	 * Check pricing contract tier
	 */
	async getContractTier(): Promise<string> {
		const isVisible = await this.contractTier.isVisible().catch(() => false)
		if (!isVisible) return ''
		return (await this.contractTier.textContent()) || ''
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect customer in list
	 */
	async expectCustomerInList(customerName: string): Promise<void> {
		await expect(this.getCustomerRow(customerName)).toBeVisible()
	}

	/**
	 * Expect customer NOT in list
	 */
	async expectCustomerNotInList(customerName: string): Promise<void> {
		await expect(this.getCustomerRow(customerName)).not.toBeVisible()
	}

	/**
	 * Expect customer detail visible
	 */
	async expectDetailVisible(): Promise<void> {
		await expect(this.customerDetailPanel).toBeVisible()
	}

	/**
	 * Expect customer status
	 */
	async expectCustomerStatus(status: string | RegExp): Promise<void> {
		await expect(this.customerStatus).toContainText(status)
	}

	/**
	 * Expect empty customers list
	 */
	async expectEmptyList(): Promise<void> {
		await expect(this.emptyCustomersMessage).toBeVisible()
	}

	/**
	 * Expect form validation error
	 */
	async expectValidationError(field: string): Promise<void> {
		const errorMessage = this.page.getByText(new RegExp(`${field}.*required|invalid.*${field}`, 'i'))
		await expect(errorMessage).toBeVisible()
	}
}
