/**
 * Checkout Page Object Model
 *
 * Encapsulates checkout flow interactions.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export interface ShippingAddress {
	street: string
	street2?: string
	city: string
	state: string
	zip: string
	country?: string
}

export interface BillingInfo {
	sameAsShipping?: boolean
	street?: string
	city?: string
	state?: string
	zip?: string
}

export class CheckoutPage extends BasePage {
	// Steps indicator
	readonly stepsIndicator: Locator
	readonly currentStep: Locator

	// Shipping form
	readonly shippingForm: Locator
	readonly streetInput: Locator
	readonly street2Input: Locator
	readonly cityInput: Locator
	readonly stateInput: Locator
	readonly zipInput: Locator
	readonly countrySelect: Locator

	// Billing form
	readonly billingForm: Locator
	readonly sameAsShippingCheckbox: Locator

	// Payment section
	readonly paymentSection: Locator
	readonly invoiceOption: Locator
	readonly purchaseOrderOption: Locator
	readonly creditCardOption: Locator
	readonly poNumberInput: Locator

	// Order summary
	readonly orderSummary: Locator
	readonly orderItems: Locator
	readonly summarySubtotal: Locator
	readonly summaryTax: Locator
	readonly summaryShipping: Locator
	readonly summaryTotal: Locator

	// Actions
	readonly placeOrderButton: Locator
	readonly backButton: Locator
	readonly continueButton: Locator

	// Confirmation
	readonly confirmationSection: Locator
	readonly orderNumber: Locator
	readonly confirmationMessage: Locator

	constructor(page: Page) {
		super(page)

		// Steps
		this.stepsIndicator = page.getByTestId('checkout-steps')
		this.currentStep = page.locator('[data-step="current"]')

		// Shipping form
		this.shippingForm = page.getByTestId('shipping-form').or(page.locator('form'))
		this.streetInput = page.getByLabel(/street|address line 1/i)
		this.street2Input = page.getByLabel(/apt|suite|address line 2/i)
		this.cityInput = page.getByLabel(/city/i)
		this.stateInput = page.getByLabel(/state|province/i)
		this.zipInput = page.getByLabel(/zip|postal/i)
		this.countrySelect = page.getByLabel(/country/i)

		// Billing
		this.billingForm = page.getByTestId('billing-form')
		this.sameAsShippingCheckbox = page.getByLabel(/same as shipping|billing same/i)

		// Payment
		this.paymentSection = page.getByTestId('payment-section')
		this.invoiceOption = page.getByRole('radio', { name: /invoice/i })
		this.purchaseOrderOption = page.getByRole('radio', { name: /purchase order|po/i })
		this.creditCardOption = page.getByRole('radio', { name: /credit card|card/i })
		this.poNumberInput = page.getByLabel(/po number|purchase order number/i)

		// Order summary
		this.orderSummary = page.getByTestId('order-summary')
		this.orderItems = page.getByTestId('order-item')
		this.summarySubtotal = page.getByTestId('summary-subtotal')
		this.summaryTax = page.getByTestId('summary-tax')
		this.summaryShipping = page.getByTestId('summary-shipping')
		this.summaryTotal = page.getByTestId('summary-total')

		// Actions
		this.placeOrderButton = page.getByRole('button', { name: /place order|confirm|submit/i })
		this.backButton = page.getByRole('button', { name: /back|previous/i })
		this.continueButton = page.getByRole('button', { name: /continue|next/i })

		// Confirmation
		this.confirmationSection = page.getByTestId('order-confirmation')
		this.orderNumber = page.getByTestId('order-number')
		this.confirmationMessage = page.getByText(/order.*confirmed|thank you|success/i)
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/checkout')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		await expect(this.shippingForm.or(this.paymentSection).or(this.confirmationSection)).toBeVisible()
	}

	// =============================================
	// SHIPPING ACTIONS
	// =============================================

	/**
	 * Fill shipping address form
	 */
	async fillShippingAddress(address: ShippingAddress): Promise<void> {
		await this.streetInput.fill(address.street)

		if (address.street2) {
			await this.street2Input.fill(address.street2)
		}

		await this.cityInput.fill(address.city)
		await this.stateInput.fill(address.state)
		await this.zipInput.fill(address.zip)

		if (address.country) {
			await this.countrySelect.selectOption(address.country)
		}
	}

	/**
	 * Continue from shipping to payment
	 */
	async continueToPayment(): Promise<void> {
		await this.continueButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// BILLING ACTIONS
	// =============================================

	/**
	 * Set billing same as shipping
	 */
	async setBillingSameAsShipping(same: boolean): Promise<void> {
		if (same) {
			await this.sameAsShippingCheckbox.check()
		} else {
			await this.sameAsShippingCheckbox.uncheck()
		}
	}

	// =============================================
	// PAYMENT ACTIONS
	// =============================================

	/**
	 * Select payment method
	 */
	async selectPaymentMethod(method: 'invoice' | 'purchase-order' | 'credit-card'): Promise<void> {
		switch (method) {
			case 'invoice':
				await this.invoiceOption.check()
				break
			case 'purchase-order':
				await this.purchaseOrderOption.check()
				break
			case 'credit-card':
				await this.creditCardOption.check()
				break
		}
	}

	/**
	 * Fill PO number
	 */
	async fillPONumber(poNumber: string): Promise<void> {
		await this.poNumberInput.fill(poNumber)
	}

	// =============================================
	// ORDER ACTIONS
	// =============================================

	/**
	 * Place the order
	 */
	async placeOrder(): Promise<void> {
		await this.placeOrderButton.click()
		await this.waitForLoad()
	}

	/**
	 * Complete full checkout flow
	 */
	async completeCheckout(options: {
		shippingAddress: ShippingAddress
		paymentMethod: 'invoice' | 'purchase-order' | 'credit-card'
		poNumber?: string
	}): Promise<string> {
		// Fill shipping
		await this.fillShippingAddress(options.shippingAddress)
		await this.continueToPayment()

		// Select payment
		await this.selectPaymentMethod(options.paymentMethod)

		if (options.paymentMethod === 'purchase-order' && options.poNumber) {
			await this.fillPONumber(options.poNumber)
		}

		// Place order
		await this.placeOrder()

		// Get order number
		return this.getOrderNumber()
	}

	// =============================================
	// GETTERS
	// =============================================

	/**
	 * Get order number from confirmation
	 */
	async getOrderNumber(): Promise<string> {
		await expect(this.confirmationSection.or(this.confirmationMessage)).toBeVisible({
			timeout: 30000,
		})

		// Try to get from specific element first
		const orderNumVisible = await this.orderNumber.isVisible().catch(() => false)
		if (orderNumVisible) {
			const text = await this.orderNumber.textContent()
			return text?.trim() || ''
		}

		// Fallback: extract from confirmation message
		const confirmText = await this.confirmationMessage.textContent()
		const match = confirmText?.match(/order[:\s#]*([A-Z0-9-]+)/i)
		return match?.[1] || ''
	}

	/**
	 * Get total from summary
	 */
	async getTotal(): Promise<number> {
		const text = await this.summaryTotal.textContent()
		const match = text?.match(/[\d,]+\.?\d*/)?.[0]
		return match ? parseFloat(match.replace(',', '')) : 0
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect to be on shipping step
	 */
	async expectShippingStep(): Promise<void> {
		await expect(this.shippingForm).toBeVisible()
	}

	/**
	 * Expect to be on payment step
	 */
	async expectPaymentStep(): Promise<void> {
		await expect(this.paymentSection).toBeVisible()
	}

	/**
	 * Expect order confirmation
	 */
	async expectConfirmation(): Promise<void> {
		await expect(this.confirmationSection.or(this.confirmationMessage)).toBeVisible({
			timeout: 30000,
		})
	}

	/**
	 * Expect specific total
	 */
	async expectTotal(amount: string | RegExp): Promise<void> {
		await expect(this.summaryTotal).toContainText(amount)
	}

	/**
	 * Expect order number format
	 */
	async expectOrderNumber(): Promise<void> {
		const orderNum = await this.getOrderNumber()
		expect(orderNum).toBeTruthy()
		expect(orderNum.length).toBeGreaterThan(0)
	}
}
