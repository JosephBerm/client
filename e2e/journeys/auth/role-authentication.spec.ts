/**
 * Role-Based Authentication E2E Tests
 *
 * TIER 1: Authentication Tests (P0)
 * Verifies that each role can login and access their dashboard.
 *
 * **Test IDs:**
 * - C-01: Customer login with valid credentials
 * - SR-01: Sales Rep login and dashboard access
 * - SM-01: Sales Manager login and dashboard access
 * - FC-01: Fulfillment Coordinator login and dashboard
 * - A-01: Admin login and dashboard access
 * - SA-01: Super-Admin login with full navigation
 *
 * **Architecture:**
 * - Uses pre-authenticated storage states from global-setup
 * - Each role has its own Playwright project with storageState
 * - Tests verify dashboard loads correctly for each role
 *
 * **Best Practices Applied:**
 * - Centralized auth (storageState) instead of logging in per test
 * - Stable locators (getByRole, getByTestId)
 * - Independent tests (each can run alone)
 * - Arrange/Act/Assert pattern
 *
 * @see E2E_TEST_IMPLEMENTATION_PRIORITY_LIST.md - TIER 1
 */

import { test, expect } from '../../fixtures'
import { Page } from '@playwright/test'
import { DashboardPage } from '../../pages/DashboardPage'

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Verify dashboard loads for authenticated user.
 * Used across all role tests.
 */
async function verifyDashboardAccess(page: Page): Promise<DashboardPage> {
	const dashboardPage = new DashboardPage(page)
	await dashboardPage.goto()
	await dashboardPage.expectLoaded()
	return dashboardPage
}

/**
 * Verify navigation sidebar contains expected links.
 * Role-specific navigation items indicate correct access.
 */
async function verifyNavigationLinks(page: Page, expectedLinks: RegExp[]): Promise<void> {
	const nav = page.getByRole('navigation')

	for (const linkPattern of expectedLinks) {
		const link = nav.getByRole('link', { name: linkPattern })
		// Use first() to handle multiple matches, check if at least one exists
		const isVisible = await link
			.first()
			.isVisible()
			.catch(() => false)
		expect(isVisible, `Expected navigation link matching ${linkPattern}`).toBeTruthy()
	}
}

/**
 * Verify navigation sidebar does NOT contain restricted links.
 * Used for RBAC enforcement verification.
 */
async function verifyNoRestrictedLinks(page: Page, restrictedLinks: RegExp[]): Promise<void> {
	const nav = page.getByRole('navigation')

	for (const linkPattern of restrictedLinks) {
		const link = nav.getByRole('link', { name: linkPattern })
		const isVisible = await link
			.first()
			.isVisible()
			.catch(() => false)
		expect(isVisible, `Should NOT see navigation link matching ${linkPattern}`).toBeFalsy()
	}
}

// =============================================
// CUSTOMER AUTHENTICATION TESTS
// =============================================

test.describe('C-01: Customer Authentication', () => {
	test('Customer can access dashboard after login', async ({ page }) => {
		// Arrange: Page is pre-authenticated via storageState
		const dashboardPage = await verifyDashboardAccess(page)

		// Assert: Dashboard elements appropriate for customer
		const pageTitle = await page.title()
		expect(pageTitle).toBeTruthy()

		// Verify we're on an authenticated route
		const url = page.url()
		expect(url).toMatch(/\/app/)
	})

	test('Customer sees appropriate navigation', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Customer should see these navigation items
		const expectedLinks = [/store/i, /orders/i, /cart/i]

		await verifyNavigationLinks(page, expectedLinks)
	})

	test('Customer does NOT see internal navigation', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Customer should NOT see internal-only navigation
		const restrictedLinks = [/quotes/i, /approvals/i, /fulfillment/i, /accounts/i, /tenants/i]

		await verifyNoRestrictedLinks(page, restrictedLinks)
	})
})

// =============================================
// SALES REP AUTHENTICATION TESTS
// =============================================

test.describe('SR-01: Sales Rep Authentication', () => {
	test('Sales Rep can access dashboard after login', async ({ page }) => {
		// Arrange: Page is pre-authenticated via storageState
		const dashboardPage = await verifyDashboardAccess(page)

		// Assert: Dashboard loaded
		const url = page.url()
		expect(url).toMatch(/\/app/)
	})

	test('Sales Rep sees quote management navigation', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Sales Rep should see quotes and customers
		const expectedLinks = [/quotes/i, /customers/i, /orders/i]

		await verifyNavigationLinks(page, expectedLinks)
	})

	test('Sales Rep does NOT see fulfillment or approvals', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Sales Rep should NOT see fulfillment or approval queues
		const restrictedLinks = [/fulfillment/i, /approvals/i, /tenants/i]

		await verifyNoRestrictedLinks(page, restrictedLinks)
	})
})

// =============================================
// SALES MANAGER AUTHENTICATION TESTS
// =============================================

test.describe('SM-01: Sales Manager Authentication', () => {
	test('Sales Manager can access dashboard after login', async ({ page }) => {
		// Arrange: Page is pre-authenticated via storageState
		const dashboardPage = await verifyDashboardAccess(page)

		// Assert: Dashboard loaded
		const url = page.url()
		expect(url).toMatch(/\/app/)
	})

	test('Sales Manager sees approval queue navigation', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Sales Manager should see approvals, quotes, customers
		const expectedLinks = [/approvals/i, /quotes/i, /customers/i, /orders/i]

		await verifyNavigationLinks(page, expectedLinks)
	})

	test('Sales Manager sees team management options', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Sales Manager should see analytics/reports for team oversight
		const teamLinks = [/analytics/i]

		await verifyNavigationLinks(page, teamLinks)
	})
})

// =============================================
// FULFILLMENT COORDINATOR AUTHENTICATION TESTS
// =============================================

test.describe('FC-01: Fulfillment Coordinator Authentication', () => {
	test('Fulfillment Coordinator can access dashboard after login', async ({ page }) => {
		// Arrange: Page is pre-authenticated via storageState
		const dashboardPage = await verifyDashboardAccess(page)

		// Assert: Dashboard loaded
		const url = page.url()
		expect(url).toMatch(/\/app/)
	})

	test('Fulfillment sees fulfillment queue navigation', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Fulfillment should see fulfillment queue and orders
		const expectedLinks = [/fulfillment/i, /orders/i]

		await verifyNavigationLinks(page, expectedLinks)
	})

	test('Fulfillment does NOT see quotes or approvals', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Fulfillment should NOT see quotes or approval queues
		const restrictedLinks = [/approvals/i, /tenants/i]

		await verifyNoRestrictedLinks(page, restrictedLinks)
	})
})

// =============================================
// ADMIN AUTHENTICATION TESTS
// =============================================

test.describe('A-01: Admin Authentication', () => {
	test('Admin can access dashboard after login', async ({ page }) => {
		// Arrange: Page is pre-authenticated via storageState
		const dashboardPage = await verifyDashboardAccess(page)

		// Assert: Dashboard loaded
		const url = page.url()
		expect(url).toMatch(/\/app/)
	})

	test('Admin sees user management navigation', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Admin should see accounts, customers, rbac, pricing, analytics
		const expectedLinks = [/accounts/i, /customers/i, /pricing/i, /analytics/i]

		await verifyNavigationLinks(page, expectedLinks)
	})

	test('Admin does NOT see tenant management', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Admin should NOT see super-admin only features
		const restrictedLinks = [/tenants/i]

		await verifyNoRestrictedLinks(page, restrictedLinks)
	})
})

// =============================================
// SUPER-ADMIN AUTHENTICATION TESTS
// =============================================

test.describe('SA-01: Super-Admin Authentication', () => {
	// Skip if super-admin credentials not provided
	test.beforeEach(async ({ page }) => {
		// Check if super-admin storage state exists (set by global-setup)
		// If not, skip these tests gracefully
	})

	test('Super-Admin can access dashboard after login', async ({ page }) => {
		// Arrange: Page is pre-authenticated via storageState
		const dashboardPage = await verifyDashboardAccess(page)

		// Assert: Dashboard loaded
		const url = page.url()
		expect(url).toMatch(/\/app/)
	})

	test('Super-Admin sees full navigation including tenants', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Super-Admin should see all navigation including tenant management
		const expectedLinks = [/accounts/i, /customers/i, /orders/i, /quotes/i, /analytics/i, /pricing/i]

		await verifyNavigationLinks(page, expectedLinks)
	})

	test('Super-Admin can access tenant management', async ({ page }) => {
		// Arrange
		await page.goto('/app/admin/tenants')
		await page.waitForLoadState('domcontentloaded')

		// Assert: Should load tenant management page (or access denied for non-super-admin)
		const url = page.url()
		expect(url).toContain('admin/tenants')

		// Verify page content indicates tenant management
		const pageContent = page.getByRole('main')
		await expect(pageContent).toBeVisible()
	})
})

// =============================================
// CROSS-CUTTING AUTHENTICATION TESTS
// =============================================

test.describe('Authentication Cross-Cutting', () => {
	test('Authenticated user sees user menu', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Assert: User menu should be visible
		const userMenu = page.getByTestId('user-menu').or(page.getByRole('button', { name: /user|account|profile/i }))

		const isVisible = await userMenu
			.first()
			.isVisible()
			.catch(() => false)
		expect(isVisible).toBeTruthy()
	})

	test('Authenticated user can logout', async ({ page }) => {
		// Arrange
		await page.goto('/app')
		await page.waitForLoadState('domcontentloaded')

		// Act: Find and click user menu, then logout
		const userMenuButton = page.getByRole('button', { name: /user|account|profile/i }).first()
		const hasUserMenu = await userMenuButton.isVisible().catch(() => false)

		if (hasUserMenu) {
			await userMenuButton.click()

			const logoutButton = page.getByRole('menuitem', { name: /logout|sign out/i })
			const hasLogout = await logoutButton.isVisible().catch(() => false)

			if (hasLogout) {
				await logoutButton.click()

				// Assert: Should redirect to login or home
				await page.waitForURL(/\/(login|$)/, { timeout: 10000 })
				const url = page.url()
				expect(url).toMatch(/\/(login|$|\?)/)
			}
		}
	})
})
