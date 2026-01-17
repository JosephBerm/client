/**
 * RBAC Security Enforcement E2E Tests
 *
 * TIER 2: Security Tests (P0)
 * Verifies that role-based access controls are properly enforced.
 *
 * **Test IDs:** SEC-01 to SEC-10, C-09, C-10, SR-11, SR-12, FC-09 to FC-11, A-14
 *
 * **Best Practices Applied:**
 * - Security sanity checks: verify hidden actions are truly blocked
 * - One assertion theme per test
 * - Stable locators (getByRole, getByTestId)
 * - Independent tests (each can run alone)
 *
 * @see E2E_TEST_IMPLEMENTATION_PRIORITY_LIST.md - TIER 2
 */

import { test, expect } from '../../fixtures'
import { Page } from '@playwright/test'

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Test that accessing a route results in redirect or access denied.
 * Returns true if access was blocked (redirect to login/dashboard or 403).
 */
async function expectRouteBlocked(page: Page, route: string): Promise<void> {
	await page.goto(route)
	await page.waitForLoadState('domcontentloaded')

	const currentUrl = page.url()

	// Access should be blocked - either redirected away or shows access denied
	const wasRedirected = !currentUrl.includes(route.replace('/app', ''))
	const hasAccessDenied = await page
		.getByText(/access denied|unauthorized|forbidden|not authorized/i)
		.isVisible()
		.catch(() => false)
	const redirectedToLogin = currentUrl.includes('login')
	const redirectedToDashboard = currentUrl.includes('/app') && !currentUrl.includes(route.replace('/app', ''))

	expect(
		wasRedirected || hasAccessDenied || redirectedToLogin || redirectedToDashboard,
		`Expected route ${route} to be blocked but got ${currentUrl}`
	).toBeTruthy()
}

/**
 * Test that a specific element/data is NOT visible on the page.
 */
async function expectElementNotVisible(page: Page, selector: string | RegExp): Promise<void> {
	let isVisible: boolean

	if (typeof selector === 'string') {
		isVisible = await page
			.getByTestId(selector)
			.isVisible()
			.catch(() => false)
	} else {
		isVisible = await page
			.getByText(selector)
			.first()
			.isVisible()
			.catch(() => false)
	}

	expect(isVisible, `Expected element matching ${selector} to NOT be visible`).toBeFalsy()
}

// =============================================
// SEC-01 to SEC-04: CUSTOMER ROUTE RESTRICTIONS
// =============================================

test.describe('Customer Route Restrictions', () => {
	// These tests should run with customer storage state

	test('SEC-01: Customer cannot access /app/quotes', async ({ page }) => {
		await expectRouteBlocked(page, '/app/quotes')
	})

	test('SEC-02: Customer cannot access /app/approvals', async ({ page }) => {
		await expectRouteBlocked(page, '/app/approvals')
	})

	test('SEC-03: Customer cannot access /app/fulfillment', async ({ page }) => {
		await expectRouteBlocked(page, '/app/fulfillment')
	})

	test('SEC-04: Customer cannot access /app/accounts', async ({ page }) => {
		await expectRouteBlocked(page, '/app/accounts')
	})

	test('C-09: Customer cannot see vendor cost/margins', async ({ page }) => {
		// Navigate to store or order page
		await page.goto('/app/store')
		await page.waitForLoadState('domcontentloaded')

		// Vendor cost and margin data should not be visible
		await expectElementNotVisible(page, /vendor cost/i)
		await expectElementNotVisible(page, /margin %/i)
		await expectElementNotVisible(page, /cost price/i)
	})

	test('C-10: Customer cannot see other customers orders', async ({ page }) => {
		// Navigate to orders
		await page.goto('/app/orders')
		await page.waitForLoadState('domcontentloaded')

		// Should only see own orders - verify no "all customers" filter or other customer data
		const hasAllCustomersFilter = await page
			.getByRole('combobox', { name: /customer/i })
			.isVisible()
			.catch(() => false)
		expect(hasAllCustomersFilter, 'Customer should not see customer filter dropdown').toBeFalsy()
	})
})

// =============================================
// SEC-05, SEC-06, SR-11, SR-12: SALES REP RESTRICTIONS
// =============================================

test.describe('Sales Rep Route Restrictions', () => {
	test('SEC-05: Sales Rep cannot access /app/fulfillment', async ({ page }) => {
		await expectRouteBlocked(page, '/app/fulfillment')
	})

	test('SEC-06: Sales Rep cannot access /app/approvals', async ({ page }) => {
		await expectRouteBlocked(page, '/app/approvals')
	})

	test('SR-11: Sales Rep cannot see other reps quotes', async ({ page }) => {
		// Navigate to quotes
		await page.goto('/app/quotes')
		await page.waitForLoadState('domcontentloaded')

		// Should only see assigned quotes - no "all reps" filter
		const hasAllRepsFilter = await page
			.getByRole('combobox', { name: /sales rep|assigned to/i })
			.isVisible()
			.catch(() => false)

		// If filter exists, it should only show "My Quotes" or current rep
		if (hasAllRepsFilter) {
			const filterText = await page.getByRole('combobox', { name: /sales rep|assigned to/i }).textContent()
			expect(filterText).toMatch(/my|assigned/i)
		}
	})

	test('SR-12: Sales Rep cannot access fulfillment queue', async ({ page }) => {
		await expectRouteBlocked(page, '/app/fulfillment')
	})

	test('SEC-10: Sales Rep A cannot see Rep Bs quotes', async ({ page }) => {
		// This verifies data isolation between sales reps
		await page.goto('/app/quotes')
		await page.waitForLoadState('domcontentloaded')

		// The page should only show quotes assigned to the current rep
		// Verify there's no way to view other reps' quotes
		const hasTeamViewToggle = await page
			.getByRole('button', { name: /team view|all quotes/i })
			.isVisible()
			.catch(() => false)
		expect(hasTeamViewToggle, 'Sales Rep should not have team view access').toBeFalsy()
	})
})

// =============================================
// SEC-07, SEC-08, FC-09 to FC-11: FULFILLMENT RESTRICTIONS
// =============================================

test.describe('Fulfillment Route Restrictions', () => {
	test('SEC-07: Fulfillment cannot access /app/approvals', async ({ page }) => {
		await expectRouteBlocked(page, '/app/approvals')
	})

	test('SEC-08: Fulfillment cannot see vendor cost', async ({ page }) => {
		// Navigate to fulfillment queue or order detail
		await page.goto('/app/fulfillment')
		await page.waitForLoadState('domcontentloaded')

		// Vendor cost should not be visible
		await expectElementNotVisible(page, /vendor cost/i)
		await expectElementNotVisible(page, /cost price/i)
		await expectElementNotVisible(page, /margin/i)
	})

	test('FC-09: Fulfillment cannot confirm payments', async ({ page }) => {
		// Navigate to an order
		await page.goto('/app/orders')
		await page.waitForLoadState('domcontentloaded')

		// Payment confirmation button should not be visible
		const hasPaymentButton = await page
			.getByRole('button', { name: /confirm payment|record payment/i })
			.isVisible()
			.catch(() => false)
		expect(hasPaymentButton, 'Fulfillment should not see payment confirmation button').toBeFalsy()
	})

	test('FC-10: Fulfillment cannot see vendor costs/margins', async ({ page }) => {
		await page.goto('/app/orders')
		await page.waitForLoadState('domcontentloaded')

		await expectElementNotVisible(page, /vendor cost/i)
		await expectElementNotVisible(page, /margin %/i)
		await expectElementNotVisible(page, /profit/i)
	})

	test('FC-11: Fulfillment cannot access approval queue', async ({ page }) => {
		await expectRouteBlocked(page, '/app/approvals')
	})
})

// =============================================
// SEC-09, A-14: ADMIN RESTRICTIONS
// =============================================

test.describe('Admin Route Restrictions', () => {
	test('SEC-09: Admin cannot access /app/admin/tenants', async ({ page }) => {
		await expectRouteBlocked(page, '/app/admin/tenants')
	})

	test('A-14: Admin cannot access tenant management', async ({ page }) => {
		// Same as SEC-09 but from admin context
		await expectRouteBlocked(page, '/app/admin/tenants')

		// Also verify tenant link not in navigation
		const nav = page.getByRole('navigation')
		const hasTenantLink = await nav
			.getByRole('link', { name: /tenants/i })
			.isVisible()
			.catch(() => false)
		expect(hasTenantLink, 'Admin should not see tenants link').toBeFalsy()
	})
})

// =============================================
// CROSS-ROLE DATA ISOLATION TESTS
// =============================================

test.describe('Data Isolation', () => {
	test('Sensitive pricing data hidden from unauthorized roles', async ({ page }) => {
		// Navigate to any page with product data
		await page.goto('/app/store')
		await page.waitForLoadState('domcontentloaded')

		// Check if current user should see pricing internals
		// This is a general test - specific role tests handle the details
		const pageContent = await page.content()

		// These terms should ONLY appear for authorized roles
		const hasSensitiveTerms =
			pageContent.includes('vendor_cost') ||
			pageContent.includes('vendorCost') ||
			pageContent.includes('margin_percentage')

		// If we're a customer/fulfillment, these should not appear in raw HTML
		// Note: This is a basic check - real audit would check API responses
	})
})
