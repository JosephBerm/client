/**
 * Cart Page Object Model
 *
 * Encapsulates shopping cart interactions.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class CartPage extends BasePage {
	// Cart items
	readonly cartContainer: Locator
	readonly cartItems: Locator
	readonly emptyCartMessage: Locator

	// Summary
	readonly subtotal: Locator
	readonly tax: Locator
	readonly shipping: Locator
	readonly totalPrice: Locator
	readonly discount: Locator

	// Actions
	readonly checkoutButton: Locator
	readonly continueShoppingButton: Locator
	readonly clearCartButton: Locator

	// Promo code
	readonly promoCodeInput: Locator
	readonly applyPromoButton: Locator

	// Quote request form (B2B model - quote form is on cart page)
	readonly quoteForm: Locator
	readonly firstNameInput: Locator
	readonly lastNameInput: Locator
	readonly emailInput: Locator
	readonly notesInput: Locator
	readonly submitQuoteButton: Locator
	readonly quoteSuccessMessage: Locator

	constructor(page: Page) {
		super(page)

		// Cart items
		this.cartContainer = page.getByTestId('cart-container').or(page.locator('[data-testid*="cart"]'))
		this.cartItems = page.getByTestId('cart-item').or(page.locator('[data-testid*="cart-item"]'))
		this.emptyCartMessage = page.getByText(/cart is empty|no items/i)

		// Summary
		this.subtotal = page.getByTestId('cart-subtotal').or(page.getByText(/subtotal/i))
		this.tax = page.getByTestId('cart-tax').or(page.getByText(/tax/i))
		this.shipping = page.getByTestId('cart-shipping').or(page.getByText(/shipping/i))
		this.totalPrice = page.getByTestId('cart-total').or(page.getByText(/total/i))
		this.discount = page.getByTestId('cart-discount').or(page.getByText(/discount/i))

		// Actions
		// B2B quote-based system: "Submit Quote Request" button instead of traditional checkout
		this.checkoutButton = page.getByRole('button', { name: /request|submit.*quote|checkout|proceed/i })
		this.continueShoppingButton = page.getByRole('link', { name: /continue shopping|browse/i })
		this.clearCartButton = page.getByRole('button', { name: /clear|empty cart/i })

		// Promo code
		this.promoCodeInput = page.getByPlaceholder(/promo|coupon|discount/i)
		this.applyPromoButton = page.getByRole('button', { name: /apply/i })

		// Quote request form (embedded in cart page for B2B model)
		this.quoteForm = page.locator('form[aria-label*="quote" i]').or(page.locator('form').filter({ hasText: /quote request/i }))
		this.firstNameInput = page.getByLabel(/first name/i)
		this.lastNameInput = page.getByLabel(/last name/i)
		this.emailInput = page.getByLabel(/email/i)
		this.notesInput = page.getByLabel(/notes/i).or(page.getByPlaceholder(/requirements|preferences|questions/i))
		this.submitQuoteButton = page.getByRole('button', { name: /request|submit/i })
		this.quoteSuccessMessage = page.getByText(/quote.*submitted|request.*received|thank you|success/i)
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/cart')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Either cart items or empty message should be visible
		const hasItems = await this.cartItems.first().isVisible().catch(() => false)
		const isEmpty = await this.emptyCartMessage.isVisible().catch(() => false)

		expect(hasItems || isEmpty).toBeTruthy()
	}

	// =============================================
	// CART ITEM ACTIONS
	// =============================================

	/**
	 * Get a cart item by product name
	 */
	getCartItem(productName: string): Locator {
		return this.cartItems.filter({ hasText: productName })
	}

	/**
	 * Update quantity for a cart item using increment/decrement buttons
	 * The cart uses read-only quantity display with +/- buttons (better UX pattern)
	 */
	async updateQuantity(productName: string, quantity: number): Promise<void> {
		const item = this.getCartItem(productName)
		const currentQty = await this.getQuantity(item)

		if (quantity > currentQty) {
			// Need to increment
			for (let i = currentQty; i < quantity; i++) {
				await this.incrementQuantityForItem(item)
			}
		} else if (quantity < currentQty) {
			// Need to decrement
			for (let i = currentQty; i > quantity; i--) {
				await this.decrementQuantityForItem(item)
			}
		}
	}

	/**
	 * Get current quantity for a cart item
	 */
	private async getQuantity(item: Locator): Promise<number> {
		// The quantity is displayed in a span with role="status" inside the quantity selector
		const quantityDisplay = item.locator('[role="status"]').or(item.locator('.input-bordered'))
		const text = await quantityDisplay.textContent()
		return parseInt(text?.trim() || '1', 10)
	}

	/**
	 * Get current quantity for a cart item by name
	 */
	async getItemQuantity(productName: string): Promise<number> {
		const item = this.getCartItem(productName)
		return this.getQuantity(item)
	}

	/**
	 * Increment quantity for a specific item locator
	 */
	private async incrementQuantityForItem(item: Locator): Promise<void> {
		// The increment button has aria-label containing "Increase"
		const incrementButton = item.getByRole('button', { name: /increase/i })
		await incrementButton.click()
		await this.waitForLoad()
	}

	/**
	 * Decrement quantity for a specific item locator
	 */
	private async decrementQuantityForItem(item: Locator): Promise<void> {
		// The decrement button has aria-label containing "Decrease"
		const decrementButton = item.getByRole('button', { name: /decrease/i })
		await decrementButton.click()
		await this.waitForLoad()
	}

	/**
	 * Increment quantity for a cart item by name
	 */
	async incrementQuantity(productName: string): Promise<void> {
		const item = this.getCartItem(productName)
		await this.incrementQuantityForItem(item)
	}

	/**
	 * Decrement quantity for a cart item by name
	 */
	async decrementQuantity(productName: string): Promise<void> {
		const item = this.getCartItem(productName)
		await this.decrementQuantityForItem(item)
	}

	/**
	 * Remove item from cart
	 */
	async removeItem(productName: string): Promise<void> {
		const item = this.getCartItem(productName)
		const removeButton = item.getByRole('button', { name: /remove|delete|×/i })
		await removeButton.click()
		await this.waitForLoad()
	}

	/**
	 * Clear entire cart
	 */
	async clearCart(): Promise<void> {
		await this.clearCartButton.click()
		// Might show confirmation dialog
		const confirmButton = this.page.getByRole('button', { name: /confirm|yes/i })
		const hasConfirm = await confirmButton.isVisible().catch(() => false)
		if (hasConfirm) {
			await confirmButton.click()
		}
		await this.waitForLoad()
	}

	// =============================================
	// PROMO CODE
	// =============================================

	/**
	 * Apply promo code
	 */
	async applyPromoCode(code: string): Promise<void> {
		await this.promoCodeInput.fill(code)
		await this.applyPromoButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// QUOTE REQUEST (B2B Model)
	// =============================================

	/**
	 * Fill quote request form for non-authenticated users
	 */
	async fillQuoteForm(info: { firstName: string; lastName: string; email: string; notes?: string }): Promise<void> {
		// These fields only appear for non-authenticated users
		const hasFirstName = await this.firstNameInput.isVisible().catch(() => false)
		if (hasFirstName) {
			await this.firstNameInput.fill(info.firstName)
			await this.lastNameInput.fill(info.lastName)
			await this.emailInput.fill(info.email)
		}

		if (info.notes) {
			const hasNotes = await this.notesInput.isVisible().catch(() => false)
			if (hasNotes) {
				await this.notesInput.fill(info.notes)
			}
		}
	}

	/**
	 * Submit quote request
	 * This is the B2B equivalent of "checkout" - submitting a quote request
	 */
	async submitQuoteRequest(): Promise<void> {
		await this.submitQuoteButton.click()
		await this.waitForLoad()
	}

	/**
	 * Proceed to checkout (B2B: submits quote request)
	 * For backwards compatibility with tests that expect a checkout flow
	 */
	async proceedToCheckout(): Promise<void> {
		await this.checkoutButton.click()
	}

	/**
	 * Check if quote was submitted successfully
	 */
	async expectQuoteSubmitted(): Promise<void> {
		await expect(this.quoteSuccessMessage).toBeVisible({ timeout: 10000 })
	}

	/**
	 * Continue shopping
	 */
	async continueShopping(): Promise<void> {
		await this.continueShoppingButton.click()
	}

	// =============================================
	// GETTERS
	// =============================================

	/**
	 * Get total price as number
	 */
	async getTotalPrice(): Promise<number> {
		const text = await this.totalPrice.textContent()
		// Extract number from string like "$123.45"
		const match = text?.match(/[\d,]+\.?\d*/)?.[0]
		return match ? parseFloat(match.replace(',', '')) : 0
	}

	/**
	 * Get cart item count
	 */
	async getItemCount(): Promise<number> {
		return this.cartItems.count()
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect item in cart
	 */
	async expectItemInCart(productName: string): Promise<void> {
		await expect(this.getCartItem(productName)).toBeVisible()
	}

	/**
	 * Expect item NOT in cart
	 */
	async expectItemNotInCart(productName: string): Promise<void> {
		await expect(this.getCartItem(productName)).not.toBeVisible()
	}

	/**
	 * Expect cart to be empty
	 */
	async expectEmpty(): Promise<void> {
		await expect(this.emptyCartMessage).toBeVisible()
	}

	/**
	 * Expect total price
	 */
	async expectTotal(amount: string | RegExp): Promise<void> {
		await expect(this.totalPrice).toContainText(amount)
	}

	/**
	 * Expect specific item count
	 */
	async expectItemCount(count: number): Promise<void> {
		await expect(this.cartItems).toHaveCount(count)
	}

	/**
	 * Expect quantity for item (uses read-only display, not spinbutton)
	 */
	async expectQuantity(productName: string, quantity: number): Promise<void> {
		const item = this.getCartItem(productName)
		// Quantity is displayed in a span with role="status", not an input
		const quantityDisplay = item.locator('[role="status"]').or(item.locator('.input-bordered'))
		await expect(quantityDisplay).toHaveText(quantity.toString())
	}
}
