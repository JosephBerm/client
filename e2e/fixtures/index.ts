/**
 * Test Fixtures - Custom Extensions for Playwright Tests
 *
 * ARCHITECTURE: Extends Playwright's test with custom fixtures:
 * - Page Object Models
 * - Test data factories
 * - API helpers
 *
 * PLAYWRIGHT 1.57.0:
 * - Better TypeScript support
 * - Enhanced fixture scoping
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

/* eslint-disable react-hooks/rules-of-hooks */
// Note: Playwright's `use` callback is NOT a React Hook - disabling false positive

import { test as base, expect, type Page, type BrowserContext } from '@playwright/test'

import { AnalyticsPage } from '../pages/AnalyticsPage'
import { ApprovalQueuePage } from '../pages/ApprovalQueuePage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { CustomersPage } from '../pages/CustomersPage'
import { DashboardPage } from '../pages/DashboardPage'
import { FulfillmentQueuePage } from '../pages/FulfillmentQueuePage'
import { InventoryPage } from '../pages/InventoryPage'
import { LoginPage } from '../pages/LoginPage'
import { OrdersPage } from '../pages/OrdersPage'
import { PricingPage } from '../pages/PricingPage'
import { QuotesPage } from '../pages/QuotesPage'
import { StorePage } from '../pages/StorePage'
import { TenantsPage } from '../pages/TenantsPage'
import { UsersPage } from '../pages/UsersPage'
import { ApiTestHelper } from '../utils/api-helpers'

// =============================================
// TYPE DEFINITIONS
// =============================================

/**
 * Custom fixtures type definition
 */
export type TestFixtures = {
	// Page Object Models - Core
	loginPage: LoginPage
	storePage: StorePage
	cartPage: CartPage
	checkoutPage: CheckoutPage
	ordersPage: OrdersPage
	dashboardPage: DashboardPage

	// Page Object Models - Role-Specific
	fulfillmentQueuePage: FulfillmentQueuePage
	quotesPage: QuotesPage
	customersPage: CustomersPage
	approvalQueuePage: ApprovalQueuePage
	usersPage: UsersPage
	tenantsPage: TenantsPage
	pricingPage: PricingPage
	inventoryPage: InventoryPage
	analyticsPage: AnalyticsPage

	// Helper functions
	apiContext: BrowserContext

	// API Test Helper for deterministic data setup
	apiHelper: ApiTestHelper
}

/**
 * Worker fixtures (shared across tests in a worker)
 */
export type WorkerFixtures = {
	// Can add worker-scoped fixtures here
}

// =============================================
// EXTEND TEST WITH FIXTURES
// =============================================

export const test = base.extend<TestFixtures, WorkerFixtures>({
	// =============================================
	// BASE PAGE SETUP
	// =============================================

	page: async ({ page }, use) => {
		await setupTestEnvironment(page)
		await use(page)
	},
	// =============================================
	// PAGE OBJECT MODEL FIXTURES
	// =============================================

	loginPage: async ({ page }, use) => {
		const loginPage = new LoginPage(page)
		await use(loginPage)
	},

	storePage: async ({ page }, use) => {
		const storePage = new StorePage(page)
		await use(storePage)
	},

	cartPage: async ({ page }, use) => {
		const cartPage = new CartPage(page)
		await use(cartPage)
	},

	checkoutPage: async ({ page }, use) => {
		const checkoutPage = new CheckoutPage(page)
		await use(checkoutPage)
	},

	ordersPage: async ({ page }, use) => {
		const ordersPage = new OrdersPage(page)
		await use(ordersPage)
	},

	dashboardPage: async ({ page }, use) => {
		const dashboardPage = new DashboardPage(page)
		await use(dashboardPage)
	},

	// =============================================
	// ROLE-SPECIFIC PAGE OBJECT FIXTURES
	// =============================================

	fulfillmentQueuePage: async ({ page }, use) => {
		const fulfillmentQueuePage = new FulfillmentQueuePage(page)
		await use(fulfillmentQueuePage)
	},

	quotesPage: async ({ page }, use) => {
		const quotesPage = new QuotesPage(page)
		await use(quotesPage)
	},

	customersPage: async ({ page }, use) => {
		const customersPage = new CustomersPage(page)
		await use(customersPage)
	},

	approvalQueuePage: async ({ page }, use) => {
		const approvalQueuePage = new ApprovalQueuePage(page)
		await use(approvalQueuePage)
	},

	usersPage: async ({ page }, use) => {
		const usersPage = new UsersPage(page)
		await use(usersPage)
	},

	tenantsPage: async ({ page }, use) => {
		const tenantsPage = new TenantsPage(page)
		await use(tenantsPage)
	},

	pricingPage: async ({ page }, use) => {
		const pricingPage = new PricingPage(page)
		await use(pricingPage)
	},

	inventoryPage: async ({ page }, use) => {
		const inventoryPage = new InventoryPage(page)
		await use(inventoryPage)
	},

	analyticsPage: async ({ page }, use) => {
		const analyticsPage = new AnalyticsPage(page)
		await use(analyticsPage)
	},

	// =============================================
	// API CONTEXT FIXTURE
	// For direct API calls in tests
	// =============================================

	apiContext: async ({ browser }, use) => {
		const context = await browser.newContext({
			baseURL: process.env.API_BASE_URL ?? 'http://localhost:5254/api/v1',
		})
		await use(context)
		await context.close()
	},

	// =============================================
	// API TEST HELPER FIXTURE
	// For deterministic data setup/teardown
	// =============================================

	apiHelper: async ({}, use) => {
		const helper = new ApiTestHelper()
		await helper.init()
		await use(helper)
		// Automatically cleanup all created entities
		await helper.cleanup()
	},
})

// Re-export expect for convenience
export { expect }

// =============================================
// TEST DATA HELPERS
// =============================================

/**
 * Generate unique test identifiers
 */
export function generateTestId(prefix: string = 'test'): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8)
	return `${prefix}-${timestamp}-${random}`
}

/**
 * Freeze time for deterministic date-dependent UI.
 * Must run before navigation to ensure scripts see the mocked Date.
 */
export async function freezeTime(page: Page, isoDate: string): Promise<void> {
	await page.addInitScript(
		({ date }) => {
			const frozenTime = new Date(date).getTime()

			// Override Date.now() for deterministic time
			Date.now = () => frozenTime

			// Store original constructor
			const OriginalDateConstructor = Date

			// Create proxy for Date constructor to freeze time
			window.Date = new Proxy(OriginalDateConstructor, {
				construct(_target, args) {
					if (args.length === 0) {
						return new OriginalDateConstructor(frozenTime)
					}
					return new OriginalDateConstructor(...(args as ConstructorParameters<typeof Date>))
				},
				get(target, prop) {
					if (prop === 'now') {
						return () => frozenTime
					}
					return Reflect.get(target, prop)
				},
			})
		},
		{ date: isoDate }
	)
}

/**
 * Block common third-party requests that can introduce flakiness.
 */
export async function blockThirdParty(page: Page): Promise<void> {
	await page.route(
		/https?:\/\/.*(googletagmanager|google-analytics|segment|sentry|intercom|hotjar).*/i,
		async (route) => route.abort()
	)
}

/**
 * Standardized environment setup for all tests.
 */
export async function setupTestEnvironment(page: Page): Promise<void> {
	await blockThirdParty(page)
	await freezeTime(page, '2026-01-15T12:00:00Z')
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
	await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Take a named screenshot
 */
export async function takeNamedScreenshot(page: Page, name: string): Promise<void> {
	await page.screenshot({
		path: `test-results/screenshots/${name}-${Date.now()}.png`,
		fullPage: true,
	})
}

// =============================================
// ASSERTION HELPERS
// Best Practice: Outcome-based assertions, not presence-only
// =============================================

/**
 * Assert that a value changed after an action
 * @example await assertValueChanged(page, '#total', async () => await addItemButton.click())
 */
export async function assertValueChanged(
	page: Page,
	selector: string,
	action: () => Promise<void>,
	options?: { timeout?: number }
): Promise<{ before: string; after: string }> {
	const element = page.locator(selector)
	const before = (await element.textContent()) ?? ''
	await action()
	await expect
		.poll(async () => element.textContent(), {
			timeout: options?.timeout ?? 5000,
			message: `Expected value at ${selector} to change from "${before}"`,
		})
		.not.toBe(before)
	const after = (await element.textContent()) ?? ''
	return { before, after }
}

/**
 * Assert that a count increased after an action
 */
export async function assertCountIncreased(
	page: Page,
	listSelector: string,
	action: () => Promise<void>,
	options?: { timeout?: number }
): Promise<{ before: number; after: number }> {
	const list = page.locator(listSelector)
	const before = await list.count()
	await action()
	await expect
		.poll(async () => list.count(), {
			timeout: options?.timeout ?? 5000,
			message: `Expected count of ${listSelector} to increase from ${before}`,
		})
		.toBeGreaterThan(before)
	const after = await list.count()
	return { before, after }
}

/**
 * Assert that a row appears in a table with specific content
 */
export async function assertRowInTable(
	page: Page,
	tableSelector: string,
	expectedContent: string | RegExp,
	options?: { timeout?: number; column?: number }
): Promise<void> {
	const table = page.locator(tableSelector)
	await expect(table).toBeVisible({ timeout: options?.timeout ?? 5000 })

	const rows = table.locator('tbody tr')
	await expect
		.poll(
			async () => {
				const count = await rows.count()
				for (let i = 0; i < count; i++) {
					const row = rows.nth(i)
					const text =
						options?.column !== undefined
							? await row.locator('td').nth(options.column).textContent()
							: await row.textContent()
					if (typeof expectedContent === 'string' && text?.includes(expectedContent)) {
						return true
					}
					if (expectedContent instanceof RegExp && expectedContent.test(text ?? '')) {
						return true
					}
				}
				return false
			},
			{
				timeout: options?.timeout ?? 5000,
				message: `Expected to find row with content "${expectedContent}" in ${tableSelector}`,
			}
		)
		.toBe(true)
}

/**
 * Assert that a toast/notification appears with specific message
 */
export async function assertToastMessage(
	page: Page,
	expectedMessage: string | RegExp,
	options?: { timeout?: number }
): Promise<void> {
	const toastSelectors = ['[role="alert"]', '.toast', '.notification', '[data-testid="toast"]', '.Toastify__toast']

	await expect
		.poll(
			async () => {
				for (const selector of toastSelectors) {
					const toast = page.locator(selector)
					if (await toast.isVisible().catch(() => false)) {
						const text = await toast.textContent()
						if (typeof expectedMessage === 'string' && text?.includes(expectedMessage)) {
							return true
						}
						if (expectedMessage instanceof RegExp && expectedMessage.test(text ?? '')) {
							return true
						}
					}
				}
				return false
			},
			{
				timeout: options?.timeout ?? 5000,
				message: `Expected toast with message "${expectedMessage}"`,
			}
		)
		.toBe(true)
}

/**
 * Assert URL changed to expected pattern after an action
 */
export async function assertNavigatedTo(
	page: Page,
	expectedUrl: string | RegExp,
	action?: () => Promise<void>,
	options?: { timeout?: number }
): Promise<void> {
	if (action) {
		await action()
	}

	if (typeof expectedUrl === 'string') {
		await page.waitForURL(`**${expectedUrl}**`, { timeout: options?.timeout ?? 10000 })
	} else {
		await expect
			.poll(() => expectedUrl.test(page.url()), {
				timeout: options?.timeout ?? 10000,
				message: `Expected URL to match ${expectedUrl}`,
			})
			.toBe(true)
	}
}

/**
 * Assert that a status changed from one value to another
 */
export async function assertStatusChanged(
	page: Page,
	statusSelector: string,
	expectedStatus: string | RegExp,
	options?: { timeout?: number }
): Promise<void> {
	const statusElement = page.locator(statusSelector)
	await expect
		.poll(
			async () => {
				const text = await statusElement.textContent()
				if (typeof expectedStatus === 'string') {
					return text?.toLowerCase().includes(expectedStatus.toLowerCase())
				}
				return expectedStatus.test(text ?? '')
			},
			{
				timeout: options?.timeout ?? 10000,
				message: `Expected status to become "${expectedStatus}"`,
			}
		)
		.toBe(true)
}

// Re-export API helpers for convenience
export { ApiTestHelper } from '../utils/api-helpers'
export type { TestQuote, TestOrder, TestCustomer, TestProduct } from '../utils/api-helpers'
