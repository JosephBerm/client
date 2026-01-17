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
		this.checkoutButton = page.getByRole('button', { name: /checkout|proceed/i })
		this.continueShoppingButton = page.getByRole('link', { name: /continue shopping/i })
		this.clearCartButton = page.getByRole('button', { name: /clear|empty cart/i })

		// Promo code
		this.promoCodeInput = page.getByPlaceholder(/promo|coupon|discount/i)
		this.applyPromoButton = page.getByRole('button', { name: /apply/i })
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
	 * Update quantity for a cart item
	 */
	async updateQuantity(productName: string, quantity: number): Promise<void> {
		const item = this.getCartItem(productName)
		const quantityInput = item.getByRole('spinbutton')
		await quantityInput.fill(quantity.toString())
		await this.waitForLoad()
	}

	/**
	 * Increment quantity for a cart item
	 */
	async incrementQuantity(productName: string): Promise<void> {
		const item = this.getCartItem(productName)
		const incrementButton = item.getByRole('button', { name: /\+|increase/i })
		await incrementButton.click()
		await this.waitForLoad()
	}

	/**
	 * Decrement quantity for a cart item
	 */
	async decrementQuantity(productName: string): Promise<void> {
		const item = this.getCartItem(productName)
		const decrementButton = item.getByRole('button', { name: /-|decrease/i })
		await decrementButton.click()
		await this.waitForLoad()
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
	// CHECKOUT
	// =============================================

	/**
	 * Proceed to checkout
	 */
	async proceedToCheckout(): Promise<void> {
		await this.checkoutButton.click()
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
	 * Expect quantity for item
	 */
	async expectQuantity(productName: string, quantity: number): Promise<void> {
		const item = this.getCartItem(productName)
		const quantityInput = item.getByRole('spinbutton')
		await expect(quantityInput).toHaveValue(quantity.toString())
	}
}
