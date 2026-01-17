/**
 * Store Page Object Model
 *
 * Encapsulates product browsing and cart operations.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class StorePage extends BasePage {
	// Page heading
	readonly heading: Locator

	// Search and filters
	readonly searchInput: Locator
	readonly searchButton: Locator
	readonly categoryFilter: Locator
	readonly sortSelect: Locator
	readonly filterButton: Locator
	readonly clearFiltersButton: Locator

	// Product grid
	readonly productGrid: Locator
	readonly productCards: Locator
	readonly noResultsMessage: Locator

	// Pagination
	readonly pagination: Locator
	readonly nextPageButton: Locator
	readonly prevPageButton: Locator

	// Cart elements
	readonly cartButton: Locator
	readonly cartBadge: Locator

	constructor(page: Page) {
		super(page)

		// Page heading - look for store/products heading
		this.heading = page.getByRole('heading', { name: /store|products|shop|catalog/i }).first()

		// Search and filters - use visible search input (lg version is visible on desktop)
		this.searchInput = page.locator('#product-search-lg').or(page.locator('#product-search'))
		this.searchButton = page.getByRole('button', { name: /search/i })
		this.categoryFilter = page.getByRole('combobox', { name: /category/i })
		this.sortSelect = page.getByRole('combobox', { name: /sort/i })
		this.filterButton = page.getByRole('button', { name: /filter/i })
		this.clearFiltersButton = page.getByRole('button', { name: /clear|reset/i })

		// Product grid - use specific testid
		this.productGrid = page.getByTestId('product-grid')
		this.productCards = page.getByTestId('product-card')
		this.noResultsMessage = page.getByText(/no products|no results|nothing found/i)

		// Pagination
		this.pagination = page.getByRole('navigation', { name: /pagination/i })
		this.nextPageButton = page.getByRole('button', { name: /next/i })
		this.prevPageButton = page.getByRole('button', { name: /previous|prev/i })

		// Cart - the badge is a span inside the cart link showing item count
		this.cartButton = page.getByRole('link', { name: /cart/i }).or(page.getByTestId('cart-button'))
		// Cart badge is inside the cart link, looking for the span with the count
		this.cartBadge = page.getByRole('link', { name: /cart/i }).locator('span').first()
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/store')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to finish loading first
		await this.page.waitForLoadState('networkidle')

		// Wait for products to load - either product cards are visible or no results message
		// Give more time since products come from API
		const hasProducts = await this.productCards.first().isVisible().catch(() => false)
		const hasNoResults = await this.noResultsMessage.isVisible().catch(() => false)

		if (!hasProducts && !hasNoResults) {
			// Wait a bit more for products to load
			await this.productCards.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {
				// If still not visible, check for no results
			})
		}

		// Final check - either products or no results
		const finalHasProducts = await this.productCards.first().isVisible().catch(() => false)
		expect(finalHasProducts).toBeTruthy()
	}

	// =============================================
	// SEARCH & FILTER ACTIONS
	// =============================================

	/**
	 * Search for products
	 */
	async searchProduct(query: string): Promise<void> {
		// Wait for visible search input - try lg version first (desktop), fallback to mobile
		const lgSearch = this.page.locator('#product-search-lg')
		const mobileSearch = this.page.locator('#product-search')

		// Check which one is visible and use it
		const lgVisible = await lgSearch.isVisible().catch(() => false)
		const searchElement = lgVisible ? lgSearch : mobileSearch

		await searchElement.scrollIntoViewIfNeeded()
		await searchElement.fill(query)
		await searchElement.press('Enter')
		await this.waitForLoad()
	}

	/**
	 * Select a category
	 */
	async selectCategory(category: string): Promise<void> {
		await this.categoryFilter.selectOption(category)
		await this.waitForLoad()
	}

	/**
	 * Sort products
	 */
	async sortBy(option: string): Promise<void> {
		await this.sortSelect.selectOption(option)
		await this.waitForLoad()
	}

	/**
	 * Clear all filters
	 */
	async clearFilters(): Promise<void> {
		await this.clearFiltersButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// PRODUCT ACTIONS
	// =============================================

	/**
	 * Get a product card by name
	 */
	getProductCard(productName: string): Locator {
		return this.productCards.filter({ hasText: productName })
	}

	/**
	 * Click on a product to view details
	 */
	async viewProduct(productName: string): Promise<void> {
		const card = this.getProductCard(productName)
		await card.click()
	}

	/**
	 * Add product to cart from grid
	 */
	async addProductToCart(productName: string): Promise<void> {
		const card = this.getProductCard(productName)
		const addButton = card.getByRole('button', { name: /add to cart|add/i })
		await addButton.click()
	}

	/**
	 * Add product with quantity
	 */
	async addProductWithQuantity(productName: string, quantity: number): Promise<void> {
		const card = this.getProductCard(productName)

		// Find quantity input if it exists
		const quantityInput = card.getByRole('spinbutton')
		const hasQuantityInput = await quantityInput.isVisible().catch(() => false)

		if (hasQuantityInput) {
			await quantityInput.fill(quantity.toString())
		}

		await this.addProductToCart(productName)
	}

	/**
	 * Get current cart item count
	 */
	async getCartItemCount(): Promise<number> {
		const isVisible = await this.cartBadge.isVisible().catch(() => false)
		if (!isVisible) return 0

		const text = await this.cartBadge.textContent()
		return parseInt(text || '0', 10)
	}

	// =============================================
	// PAGINATION
	// =============================================

	/**
	 * Go to next page
	 */
	async goToNextPage(): Promise<void> {
		await this.nextPageButton.click()
		await this.waitForLoad()
	}

	/**
	 * Go to previous page
	 */
	async goToPrevPage(): Promise<void> {
		await this.prevPageButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect product to be in grid
	 */
	async expectProductInGrid(productName: string): Promise<void> {
		await expect(this.getProductCard(productName)).toBeVisible()
	}

	/**
	 * Expect product NOT to be in grid
	 */
	async expectProductNotInGrid(productName: string): Promise<void> {
		await expect(this.getProductCard(productName)).not.toBeVisible()
	}

	/**
	 * Expect no results message
	 */
	async expectNoResults(): Promise<void> {
		await expect(this.noResultsMessage).toBeVisible()
	}

	/**
	 * Expect specific number of products
	 */
	async expectProductCount(count: number): Promise<void> {
		await expect(this.productCards).toHaveCount(count)
	}

	/**
	 * Expect cart badge to show count
	 */
	async expectCartCount(count: number): Promise<void> {
		await expect(this.cartBadge).toHaveText(count.toString())
	}

	// =============================================
	// NAVIGATION HELPERS
	// =============================================

	/**
	 * Navigate to cart
	 */
	async goToCart(): Promise<void> {
		await this.cartButton.click()
	}
}
