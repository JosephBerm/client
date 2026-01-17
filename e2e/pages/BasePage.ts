/**
 * Base Page Object Model
 *
 * ARCHITECTURE: All Page Objects extend this base class
 * - Common functionality
 * - Shared locators
 * - Utility methods
 *
 * PLAYWRIGHT 1.57.0:
 * - Uses locator.description() for better debugging
 * - Strict selectors enabled
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'

export abstract class BasePage {
	readonly page: Page

	// Common navigation elements
	readonly header: Locator
	readonly footer: Locator
	readonly sidebar: Locator
	readonly mainContent: Locator

	// Common UI elements
	readonly loadingSpinner: Locator
	readonly toastNotification: Locator
	readonly modal: Locator

	// User menu
	readonly userMenu: Locator
	readonly userMenuButton: Locator
	readonly logoutButton: Locator

	constructor(page: Page) {
		this.page = page

		// Initialize common locators
		this.header = page.getByRole('banner')
		this.footer = page.getByRole('contentinfo')
		this.sidebar = page.getByRole('navigation', { name: /sidebar|main/i })
		this.mainContent = page.getByRole('main')

		// Loading and notifications
		this.loadingSpinner = page.getByTestId('loading-spinner')
		this.toastNotification = page.getByRole('alert')
		this.modal = page.getByRole('dialog')

		// User menu
		this.userMenu = page.getByTestId('user-menu')
		this.userMenuButton = page.getByRole('button', { name: /user|account|profile/i })
		this.logoutButton = page.getByRole('menuitem', { name: /logout|sign out/i })
	}

	// =============================================
	// ABSTRACT METHODS
	// Subclasses must implement these
	// =============================================

	/**
	 * Navigate to this page
	 */
	abstract goto(): Promise<void>

	/**
	 * Verify the page is loaded correctly
	 */
	abstract expectLoaded(): Promise<void>

	// =============================================
	// COMMON METHODS
	// =============================================

	/**
	 * Wait for page to finish loading
	 */
	async waitForLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		// Wait for any loading spinners to disappear
		await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
			// Loading spinner might not exist, that's okay
		})
	}

	/**
	 * Get the current page URL
	 */
	getUrl(): string {
		return this.page.url()
	}

	/**
	 * Get the current page title
	 */
	async getTitle(): Promise<string> {
		return this.page.title()
	}

	/**
	 * Wait for a toast notification and verify its content
	 */
	async expectToast(message: string | RegExp): Promise<void> {
		await expect(this.toastNotification).toContainText(message)
	}

	/**
	 * Wait for toast to disappear
	 */
	async waitForToastToDisappear(): Promise<void> {
		await this.toastNotification.waitFor({ state: 'hidden', timeout: 10000 })
	}

	/**
	 * Open user menu
	 */
	async openUserMenu(): Promise<void> {
		await this.userMenuButton.click()
		await this.userMenu.waitFor({ state: 'visible' })
	}

	/**
	 * Logout from the application
	 */
	async logout(): Promise<void> {
		await this.openUserMenu()
		await this.logoutButton.click()
		await this.page.waitForURL(/\/login/)
	}

	/**
	 * Take a screenshot with a descriptive name
	 */
	async screenshot(name: string): Promise<void> {
		await this.page.screenshot({
			path: `test-results/screenshots/${name}-${Date.now()}.png`,
			fullPage: true,
		})
	}

	/**
	 * Wait for modal to appear
	 */
	async waitForModal(): Promise<void> {
		await this.modal.waitFor({ state: 'visible' })
	}

	/**
	 * Close modal
	 */
	async closeModal(): Promise<void> {
		const closeButton = this.modal.getByRole('button', { name: /close|cancel|×/i })
		await closeButton.click()
		await this.modal.waitFor({ state: 'hidden' })
	}

	/**
	 * Scroll to element
	 */
	async scrollToElement(locator: Locator): Promise<void> {
		await locator.scrollIntoViewIfNeeded()
	}

	/**
	 * Check if an element is visible
	 */
	async isVisible(locator: Locator): Promise<boolean> {
		return locator.isVisible()
	}

	/**
	 * Wait for network requests to complete
	 */
	async waitForNetworkIdle(timeout = 5000): Promise<void> {
		await this.page.waitForLoadState('networkidle', { timeout })
	}
}
