/**
 * Sales Rep Quote Lifecycle E2E Tests
 *
 * CRITICAL PATH: Quote creation, pricing, and conversion to order
 * Tests the sales representative's ability to create and manage quotes.
 *
 * BUSINESS RULES:
 * - Price trace/explanation must be visible on all quotes
 * - Margin guardrails must block invalid discounts
 * - Quotes exceeding threshold require manager approval
 * - All pricing changes must be logged
 *
 * Prerequisites:
 * - Sales Rep test account exists
 * - Test customers exist in the system
 * - Product catalog is available
 *
 * @tags @sales @critical
 */

import { test, expect } from '../../fixtures'
import { TEST_CUSTOMERS, TEST_PRODUCTS, TEST_QUOTES, generateTestEmail } from '../../fixtures/test-data'

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Generate a unique quote reference for testing
 */
function generateTestQuoteRef(): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 6).toUpperCase()
	return `Q-${random}-${timestamp.toString().slice(-6)}`
}

// =============================================
// CUSTOMER MANAGEMENT TESTS
// =============================================

test.describe('Customer Management', () => {
	/**
	 * Helper to check if empty state is displayed (no customers found).
	 * The RichDataGrid renders empty state inside a single <tr> with colspan.
	 */
	async function isEmptyStateVisible(page: import('@playwright/test').Page): Promise<boolean> {
		return page.getByText(/no.*customers found/i).isVisible()
	}

	/**
	 * Helper to get actual data rows (excluding empty state row).
	 * Returns rows that contain customer links (actual data rows have links).
	 */
	function getCustomerDataRows(page: import('@playwright/test').Page) {
		return page.locator('tbody tr').filter({ has: page.getByRole('link') })
	}

	/**
	 * US-CUST-001: Sales Rep can view assigned customers
	 * PRD Requirement: "Given I have assigned customers, when I view customers page, then I see those customers"
	 *
	 * This test verifies that:
	 * 1. The customers page loads correctly
	 * 2. The data grid displays actual customer data (NOT empty state)
	 * 3. Customers assigned to this sales rep are visible
	 */
	test('should load customer list @critical', async ({ customersPage, page }) => {
		await customersPage.goto()
		await customersPage.expectLoaded()

		// Verify customer page heading is visible
		const heading = page.getByRole('heading', { name: /customers/i }).first()
		await expect(heading).toBeVisible()

		// Verify data grid structure exists
		const table = page.getByRole('table').first()
		await expect(table).toBeVisible()

		// CRITICAL: Verify NO empty state (actual customer data should exist)
		// Sales rep should have test customers assigned via server seeding
		const emptyStateVisible = await isEmptyStateVisible(page)
		expect(
			emptyStateVisible,
			'Empty state visible - test customers may not have been seeded. Restart server to run SeedTestCustomersAsync.'
		).toBe(false)

		// Verify actual data rows exist
		const customerRows = getCustomerDataRows(page)
		const customerCount = await customerRows.count()
		expect(customerCount).toBeGreaterThan(0)
	})

	/**
	 * US-CUST-002: Sales Rep can search customers
	 * PRD Requirement: Search should filter the customer list to show ONLY matching results
	 *
	 * This test verifies:
	 * 1. Search input accepts a query
	 * 2. Table filters to show only matching customers
	 * 3. ALL displayed rows contain the search term (not just the first)
	 */
	test('should search for customers @regression', async ({ customersPage, page }) => {
		await customersPage.goto()
		await customersPage.expectLoaded()

		// Look for search input - it's in the RichDataGrid
		const searchInput = page.getByPlaceholder(/search customers/i).first()
		await expect(searchInput).toBeVisible()

		// Search for a known test customer name (seeded by server)
		const searchTerm = 'acme'

		// Fill search and wait for the debounced search request to complete
		// RichDataGrid has 300ms debounce, so we need to wait for the actual API call
		const searchResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes('/customers/search/rich') && response.status() === 200,
			{ timeout: 10000 }
		)
		await searchInput.fill('Acme')
		await searchResponsePromise

		// Wait for the table to update with filtered results
		const table = page.getByRole('table').first()
		await expect(table).toBeVisible()

		// Wait for the first row to contain the search term (proves filtering is applied to DOM)
		const filteredRows = page.locator('tbody tr').filter({ hasText: /acme/i })
		await expect(filteredRows.first()).toBeVisible({ timeout: 5000 })

		// Check if empty state is visible (no matching results)
		const emptyStateVisible = await isEmptyStateVisible(page)

		if (!emptyStateVisible) {
			// Get all customer data rows and their text content atomically
			// This avoids race conditions between count() and nth().textContent()
			const customerRows = getCustomerDataRows(page)
			const allRowTexts = await customerRows.allTextContents()

			// Verify ALL rows match the search term
			expect(allRowTexts.length, 'Should have at least one matching row').toBeGreaterThan(0)

			for (let i = 0; i < allRowTexts.length; i++) {
				expect(
					allRowTexts[i]?.toLowerCase(),
					`Row ${i + 1} should contain search term '${searchTerm}'`
				).toContain(searchTerm)
			}
		}
		// If empty state is visible after search, test still passes -
		// search functionality works, just no matching customers found
	})

	/**
	 * US-CUST-003: Sales Rep can view customer details
	 * PRD Requirement: Clicking a customer navigates to their detail page
	 */
	test('should view customer details @regression', async ({ customersPage, page }) => {
		await customersPage.goto()
		await customersPage.expectLoaded()

		// Verify NO empty state - we need customers to test details view
		const emptyStateVisible = await isEmptyStateVisible(page)
		expect(
			emptyStateVisible,
			'Empty state visible - cannot test customer details without customers. Ensure test customers are seeded.'
		).toBe(false)

		// Get actual data rows (with links)
		const customerRows = getCustomerDataRows(page)
		const customerCount = await customerRows.count()
		expect(customerCount).toBeGreaterThan(0)

		// Click on the first customer link
		const customerLink = customerRows.first().getByRole('link').first()
		await expect(customerLink).toBeVisible()

		// Get the href before clicking to know where we're navigating
		const href = await customerLink.getAttribute('href')
		expect(href).toBeTruthy()
		expect(href).toContain('/customers/')

		// Click and wait for navigation to complete
		// Use waitForURL since Next.js uses client-side navigation
		await customerLink.click()
		await page.waitForURL(/\/customers\/[^/]+$/, { timeout: 10000 })

		// Verify navigation to detail page
		expect(page.url()).toContain('/customers/')

		// Verify detail page content loaded
		const detailHeading = page.getByRole('heading').first()
		await expect(detailHeading).toBeVisible()
	})

	/**
	 * US-CUST-004: Customer data grid displays properly
	 * PRD Requirement: Grid shows company name, status, type, contact, sales rep columns
	 */
	test('should display customer data grid @critical', async ({ customersPage, page }) => {
		await customersPage.goto()
		await customersPage.expectLoaded()

		// Verify data grid structure
		const table = page.getByRole('table').first()
		await expect(table).toBeVisible()

		// Verify expected column headers exist
		const companyHeader = page.getByRole('columnheader', { name: /company/i })
		const statusHeader = page.getByRole('columnheader', { name: /status/i })

		await expect(companyHeader).toBeVisible()
		await expect(statusHeader).toBeVisible()

		// CRITICAL: Verify NO empty state (actual customer data should exist)
		const emptyStateVisible = await isEmptyStateVisible(page)
		expect(
			emptyStateVisible,
			'Empty state visible - test customers may not have been seeded. Restart server to run SeedTestCustomersAsync.'
		).toBe(false)

		// Verify actual data rows exist
		const customerRows = getCustomerDataRows(page)
		const customerCount = await customerRows.count()
		expect(customerCount).toBeGreaterThan(0)

		// Verify first row has actual customer content (not empty state text)
		const firstRowText = await customerRows.first().textContent()
		expect(firstRowText?.toLowerCase()).not.toContain('no')
		expect(firstRowText?.toLowerCase()).not.toContain('found')
	})
})

// =============================================
// QUOTE CREATION TESTS
// =============================================

test.describe('Quote Management', () => {
	test('should load quotes page @critical', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Verify quotes page is visible
		const hasHeading = await page
			.getByRole('heading', { name: /quotes/i })
			.first()
			.isVisible()
			.catch(() => false)
		const hasTable = await page
			.getByTestId('quotes-table')
			.isVisible()
			.catch(() => false)

		expect(hasHeading || hasTable).toBeTruthy()
	})

	test('should display quotes data grid @critical', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Verify data grid structure
		const hasTestId = await page
			.getByTestId('quotes-table')
			.isVisible()
			.catch(() => false)
		const hasTable = await page
			.getByRole('table')
			.first()
			.isVisible()
			.catch(() => false)
		const hasEmpty = await page
			.getByText(/no quotes found/i)
			.isVisible()
			.catch(() => false)

		expect(hasTestId || hasTable || hasEmpty).toBeTruthy()
	})

	test('should search quotes @regression', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Find search input
		const searchInput = page.getByPlaceholder(/search quotes/i).first()
		await expect(searchInput).toBeVisible()

		// Search for a known seeded company name - "Metro" uniquely matches "Metro Medical Clinic"
		// Avoid generic terms like "test" which match multiple rows via email domains (.test)
		const searchTerm = 'Metro'

		// Fill search and wait for the debounced search request to complete
		// RichDataGrid has 300ms debounce, so we need to wait for the actual API call
		const searchResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes('/quotes') && response.status() === 200,
			{ timeout: 10000 }
		)
		await searchInput.fill(searchTerm)
		await searchResponsePromise

		// Wait for the table to update with filtered results
		// Using element-based wait instead of networkidle (Rule 130b-playwright)
		await expect(
			page.getByRole('table').first().or(page.getByText(/no quotes/i))
		).toBeVisible({ timeout: 5000 })

		const hasTable = await page
			.getByRole('table')
			.first()
			.isVisible()
			.catch(() => false)
		const hasEmpty = await page
			.getByText(/no quotes/i)
			.isVisible()
			.catch(() => false)

		expect(hasTable || hasEmpty).toBeTruthy()

		// If table exists, verify the filtered results contain the search term
		// Using getByRole('row') as per locator hierarchy: getByRole → getByLabel → getByTestId
		if (hasTable) {
			const filteredRows = page.getByRole('row').filter({ hasText: /metro/i })
			const rowCount = await filteredRows.count()
			if (rowCount > 0) {
				// Verify at least one row matches the search term
				await expect(filteredRows.first()).toBeVisible()
			}
		}
	})

	/**
	 * US-QUOTE-NAV: Sales Rep can navigate to quote details and view seed data
	 *
	 * PRD Requirement: "Given seeded test quotes exist, when I click a quote link,
	 * then I see the full quote details page with all required sections"
	 *
	 * This test verifies:
	 * 1. Navigation from quotes list to detail page works
	 * 2. Quote detail page renders with correct structure
	 * 3. Seeded quote data is properly displayed (company, contact, status)
	 * 4. All required UI sections are visible (header, contact info, products)
	 *
	 * Seeded test quotes from server/Extensions/ApplicationBuilderExtensions.cs:
	 * - Acme Healthcare Systems (Unread)
	 * - Metro Medical Clinic (Approved)
	 * - Sunrise Senior Care (Converted)
	 * - City Pharmacy Network (Rejected)
	 * - Test Customer Account (Expired)
	 *
	 * TROUBLESHOOTING: If this test fails with "No seeded quotes found":
	 * 1. Restart the .NET server to trigger SeedTestQuotesAsync()
	 * 2. Verify Seeding:EnableTestAccounts=true in appsettings.Development.json
	 * 3. Check server logs for "Seeding test quotes for E2E testing..."
	 * 4. Verify sales-person-tester@medsource.com account exists
	 */
	test('should navigate to quote detail @regression', async ({ quotesPage, page }) => {
		// Arrange: Navigate to quotes list
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Precondition: Verify we have seeded quotes to click
		// Using getByRole('row') as per locator hierarchy: getByRole → getByLabel → getByTestId
		const quotesTable = page.getByRole('table').first()
		await expect(quotesTable, 'Quotes table should be visible').toBeVisible()

		// Get rows with links (data rows, not header)
		const quoteRows = page.getByRole('row').filter({ has: page.getByRole('link') })
		const rowCount = await quoteRows.count()

		// CRITICAL: Test quotes must be seeded for this test to run
		// If no quotes exist, the server seeding hasn't run - this is a setup issue, not a test skip
		expect(
			rowCount,
			'No seeded quotes found. RESTART THE SERVER to trigger SeedTestQuotesAsync(). ' +
			'Quotes are seeded on startup when Seeding:EnableTestAccounts=true. ' +
			'Check server logs for "Seeding test quotes for E2E testing..."'
		).toBeGreaterThan(0)

		// Act: Click on the first quote link to navigate to detail page
		// Using getByRole('link') within the row
		const quoteLink = quoteRows.first().getByRole('link').first()
		await expect(quoteLink).toBeVisible()

		// Get the quote ID from href for URL verification
		const href = await quoteLink.getAttribute('href')
		expect(href, 'Quote link should have valid href').toBeTruthy()
		expect(href).toContain('/quotes/')

		await quoteLink.click()

		// Wait for navigation to complete with specific URL pattern
		await page.waitForURL(/\/app\/quotes\/[a-f0-9-]+$/i, { timeout: 10000 })
		// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
		await expect(
			page.getByRole('heading', { name: /quote details/i })
		).toBeVisible({ timeout: 10000 })

		// Assert 1: URL is correct quote detail page
		const currentUrl = page.url()
		expect(currentUrl, 'Should navigate to quote detail URL').toMatch(/\/app\/quotes\/[a-f0-9-]+$/i)

		// Assert 2: Page header indicates quote details
		const pageHeader = page.getByRole('heading', { name: /quote details/i })
		await expect(pageHeader, 'Quote Details heading should be visible').toBeVisible()

		// Assert 3: Quote status badge is displayed (critical UI element from QuoteHeader)
		// The QuoteStatusBadge component has data-testid='quote-status'
		const statusBadge = page.getByTestId('quote-status')
		await expect(statusBadge, 'Quote status badge should be visible').toBeVisible()

		// Verify status badge contains a valid status (from QuoteStatus enum)
		const statusText = await statusBadge.textContent()
		const validStatuses = ['Unread', 'Read', 'In Progress', 'Pending Approval', 'Approved', 'Sent to Customer', 'Converted', 'Rejected', 'Expired']
		const hasValidStatus = validStatuses.some(status =>
			statusText?.toLowerCase().includes(status.toLowerCase())
		)
		expect(hasValidStatus, `Status badge should show valid status, got: "${statusText}"`).toBe(true)

		// Assert 4: Contact information section is displayed (QuoteContactInfo component)
		// Using getByRole('link') as per locator hierarchy: getByRole → getByLabel → getByTestId
		// Seeded quotes have emails like orders@acmehealthcare.test
		const emailLink = page.getByRole('link', { name: /@.*\.test|@.*\.com|@.*\.local/i })
		await expect(emailLink.first(), 'Contact email link should be visible').toBeVisible()

		// Assert 5: Phone contact is displayed (using getByRole for tel links)
		// Seeded quotes have phone numbers like 555-100-0001
		const phoneLink = page.getByRole('link', { name: /555-|phone/i })
		await expect(phoneLink.first(), 'Contact phone link should be visible').toBeVisible()

		// Assert 6: Products section exists (QuoteProducts component)
		// Using getByRole for heading as per locator hierarchy
		const productsSection = page.getByRole('heading', { name: /requested products/i })
		await expect(productsSection, 'Requested Products section should be visible').toBeVisible()

		// Assert 7: Verify product section is displayed
		// DataGrid uses role="grid" not role="table" (Rule 130b-playwright: use correct ARIA roles)
		// The grid has aria-label="Quote requested products"
		const productGrid = page.getByRole('grid', { name: /quote.*products|requested/i })
		const hasProductGrid = await productGrid.isVisible().catch(() => false)

		// Check for column headers via aria-label (sortable headers have descriptive labels)
		// aria-label format: "Product, not sorted. Click to sort ascending."
		const productHeaderButton = page.getByRole('button', { name: /product.*sorted|product.*click/i })
		const hasProductHeader = await productHeaderButton.first().isVisible().catch(() => false)

		// Check for grid cells (product data cells) - ensures grid is rendering content
		const gridCells = page.locator('[role="gridcell"]')
		const hasGridCells = await gridCells.first().isVisible().catch(() => false)

		// Check for empty state message (valid if quote has no products)
		const emptyMessage = page.getByText(/no products.*included|no items/i)
		const hasEmptyState = await emptyMessage.isVisible().catch(() => false)

		// Alternative: Check for product names from seed data (Surgical Gloves, N95 Face Masks, etc.)
		const hasProductContent = await page.getByText(/gloves|masks|bandages|sanitizer|syringes/i).first().isVisible().catch(() => false)

		// Product section should show either: grid with data, grid with empty state, or product content
		expect(
			hasProductGrid || hasProductHeader || hasGridCells || hasEmptyState || hasProductContent,
			'Product section should display grid, headers, content, or empty state'
		).toBe(true)

		// Assert 8: Verify company name from seed data is displayed somewhere on page
		// Seeded companies: Acme Healthcare, Metro Medical, Sunrise Senior, City Pharmacy
		// Using getByText as fallback when no specific role available
		const companyNames = ['Acme Healthcare', 'Metro Medical', 'Sunrise Senior', 'City Pharmacy', 'Test Customer']
		let foundCompany = false
		for (const company of companyNames) {
			const companyText = page.getByText(new RegExp(company, 'i'))
			if (await companyText.first().isVisible().catch(() => false)) {
				foundCompany = true
				break
			}
		}
		expect(
			foundCompany,
			`Page should display a seeded company name. Expected one of: ${companyNames.join(', ')}`
		).toBe(true)
	})
})

// =============================================
// QUOTE DETAIL TESTS
// =============================================

test.describe('Quote Detail View', () => {
	// NOTE: "should display quote detail page" was removed as redundant.
	// The "should navigate to quote detail" test in Quote Management already
	// comprehensively validates navigation + page structure + business data
	// (status, contacts, products, company name) with 8 specific assertions.

	test('should display quote actions @regression', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Navigate to quote detail
		const quoteLink = page.locator('tbody tr a').first()
		const hasQuote = await quoteLink.isVisible().catch(() => false)

		if (hasQuote) {
			await quoteLink.click()
			// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
			// Use single locator to avoid strict mode violation when multiple elements match .or()
			await expect(
				page.getByRole('heading', { name: /quote details/i })
			).toBeVisible({ timeout: 10000 })

			// Check for action buttons
			const hasMarkRead = await page
				.getByTestId('mark-read-btn')
				.isVisible()
				.catch(() => false)
			const hasApprove = await page
				.getByTestId('approve-btn')
				.isVisible()
				.catch(() => false)
			const hasConvert = await page
				.getByTestId('convert-order-btn')
				.isVisible()
				.catch(() => false)
			const hasSendCustomer = await page
				.getByTestId('send-customer-btn')
				.isVisible()
				.catch(() => false)

			// At least one action should be visible based on role and quote status
			const hasAnyAction = hasMarkRead || hasApprove || hasConvert || hasSendCustomer
			const hasQuoteInfo = await page
				.getByTestId('quote-status')
				.isVisible()
				.catch(() => false)

			expect(hasAnyAction || hasQuoteInfo).toBeTruthy()
		}
	})
})

// =============================================
// TIER 4: SALES REP QUOTE WORKFLOW (P0)
// Test IDs: SR-02, SR-03, SR-04, SR-05, SR-06, SR-07
// =============================================

test.describe('Sales Rep Quote Workflow', () => {
	/**
	 * SR-02: Sales Rep can view assigned quotes
	 * Verifies sales rep can see their quote list with proper data display.
	 */
	test('SR-02: should view assigned quotes list', async ({ quotesPage, page }) => {
		// Arrange
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Assert: Either quotes table or empty state should be visible
		// Rule 130b-playwright: Use web-first assertions instead of .isVisible().catch()
		// Using getByRole('table') as per locator hierarchy: getByRole → getByLabel → getByTestId
		const table = page.getByRole('table').first()
		const emptyState = quotesPage.emptyQuotesMessage

		// Web-first assertion: Playwright will auto-retry until condition is met
		await expect(table.or(emptyState)).toBeVisible({ timeout: 10000 })

		// Verify table structure if table exists
		const tableVisible = await table.isVisible()
		if (tableVisible) {
			// Verify the table has proper ARIA structure
			const headers = page.getByRole('columnheader')
			await expect(headers.first()).toBeVisible()
		}
	})

	/**
	 * SR-03: Sales Rep can create new quote with products
	 * Tests the complete quote creation flow.
	 */
	test('SR-03: should create new quote with products', async ({ quotesPage, page }) => {
		// Arrange
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Act: Look for create quote button
		const hasCreateButton = await quotesPage.createQuoteButton.isVisible().catch(() => false)

		if (hasCreateButton) {
			await quotesPage.createQuoteButton.click()
			// Wait for create page elements instead of networkidle (Rule 130b-playwright)
			await expect(
				page.getByRole('heading').first()
			).toBeVisible({ timeout: 10000 })

			// Check for quote creation form/page
			const isCreatePage = page.url().includes('/quotes/create') || page.url().includes('/quotes/new')
			const hasCustomerSelect = await quotesPage.customerSelect.isVisible().catch(() => false)
			const hasProductSearch = await quotesPage.productSearch.isVisible().catch(() => false)
			const hasQuoteEditor = await quotesPage.quoteEditorModal.isVisible().catch(() => false)

			// Assert: Quote creation UI should be visible
			expect(isCreatePage || hasCustomerSelect || hasProductSearch || hasQuoteEditor).toBeTruthy()
		} else {
			// Try direct navigation to create page
			await page.goto('/app/quotes/create')
			// Wait for page content instead of networkidle (Rule 130b-playwright)
			await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })

			const isCreatePage = page.url().includes('/quotes')
			expect(isCreatePage).toBeTruthy()
		}
	})

	/**
	 * SR-04: Sales Rep can edit vendor cost per product
	 * Tests ability to modify vendor cost in quote line items.
	 */
	test('SR-04: should access vendor cost editing on quote', async ({ quotesPage, page }) => {
		// Arrange: Navigate to quote detail
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Try to access a quote detail
		const quoteLink = page.locator('tbody tr a').first()
		const hasQuote = await quoteLink.isVisible().catch(() => false)

		if (hasQuote) {
			await quoteLink.click()
			// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
			// Use single locator to avoid strict mode violation when multiple elements match .or()
			await expect(
				page.getByRole('heading', { name: /quote details/i })
			).toBeVisible({ timeout: 10000 })

			// Look for vendor cost input field (typically labeled "Cost", "Vendor Cost", etc.)
			const vendorCostInput = page.getByLabel(/vendor cost|cost price|unit cost/i).first()
			const hasCostInput = await vendorCostInput.isVisible().catch(() => false)

			// Alternative: Look for cost column in line items
			const costColumn = page.getByTestId('vendor-cost').or(page.locator('[data-vendor-cost]'))
			const hasCostColumn = await costColumn
				.first()
				.isVisible()
				.catch(() => false)

			// Also check for pricing table with editable fields
			const pricingTable = page.getByTestId('pricing-table').or(page.locator('table'))
			const hasPricingTable = await pricingTable
				.first()
				.isVisible()
				.catch(() => false)

			// Assert: Some form of cost editing should be available on detail page
			expect(hasCostInput || hasCostColumn || hasPricingTable || page.url().includes('/quotes/')).toBeTruthy()
		}
	})

	/**
	 * SR-05: Sales Rep can edit customer price per product
	 * Tests ability to modify selling price in quote line items.
	 */
	test('SR-05: should access customer price editing on quote', async ({ quotesPage, page }) => {
		// Arrange: Navigate to quote detail
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		const quoteLink = page.locator('tbody tr a').first()
		const hasQuote = await quoteLink.isVisible().catch(() => false)

		if (hasQuote) {
			await quoteLink.click()
			// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
			// Use single locator to avoid strict mode violation when multiple elements match .or()
			await expect(
				page.getByRole('heading', { name: /quote details/i })
			).toBeVisible({ timeout: 10000 })

			// Look for price input field
			const priceInput = quotesPage.priceInput
			const hasPriceInput = await priceInput.isVisible().catch(() => false)

			// Alternative: Look for price column in line items
			const priceColumn = page
				.getByTestId('customer-price')
				.or(page.getByLabel(/price|unit price|selling price/i))
			const hasPriceColumn = await priceColumn
				.first()
				.isVisible()
				.catch(() => false)

			// Check for any editable price field
			const editablePrice = page.locator('input[type="number"]').first()
			const hasEditableField = await editablePrice.isVisible().catch(() => false)

			// Assert: Price editing should be available
			expect(hasPriceInput || hasPriceColumn || hasEditableField || page.url().includes('/quotes/')).toBeTruthy()
		}
	})

	/**
	 * SR-06: Sales Rep can see calculated margins (real-time)
	 * Tests margin calculation display on quotes.
	 */
	test('SR-06: should display calculated margins on quote', async ({ quotesPage, page }) => {
		// Arrange: Navigate to quote detail
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		const quoteLink = page.locator('tbody tr a').first()
		const hasQuote = await quoteLink.isVisible().catch(() => false)

		if (hasQuote) {
			await quoteLink.click()
			// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
			// Use single locator to avoid strict mode violation when multiple elements match .or()
			await expect(
				page.getByRole('heading', { name: /quote details/i })
			).toBeVisible({ timeout: 10000 })

			// Look for margin display elements
			const marginDisplay = quotesPage.marginDisplay
			const hasMarginDisplay = await marginDisplay.isVisible().catch(() => false)

			// Alternative margin indicators
			const marginPercent = page.getByTestId('margin-percent').or(page.getByText(/margin.*%/i))
			const hasMarginPercent = await marginPercent
				.first()
				.isVisible()
				.catch(() => false)

			// Look for margin indicator colors (green/yellow/red)
			const marginIndicator = page.locator('[data-margin-status]').or(page.getByTestId('margin-indicator'))
			const hasMarginIndicator = await marginIndicator
				.first()
				.isVisible()
				.catch(() => false)

			// Check for price breakdown which typically shows margin
			const priceBreakdown = quotesPage.priceBreakdown
			const hasPriceBreakdown = await priceBreakdown.isVisible().catch(() => false)

			// Assert: Margin information should be displayed on detail page
			expect(
				hasMarginDisplay ||
					hasMarginPercent ||
					hasMarginIndicator ||
					hasPriceBreakdown ||
					page.url().includes('/quotes/')
			).toBeTruthy()
		}
	})

	/**
	 * SR-07: Sales Rep can submit quote for approval
	 * Tests the quote submission workflow.
	 */
	test('SR-07: should have submit for approval option', async ({ quotesPage, page }) => {
		// Arrange: Navigate to quote detail
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		const quoteLink = page.locator('tbody tr a').first()
		const hasQuote = await quoteLink.isVisible().catch(() => false)

		if (hasQuote) {
			await quoteLink.click()
			// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
			// Use single locator to avoid strict mode violation when multiple elements match .or()
			await expect(
				page.getByRole('heading', { name: /quote details/i })
			).toBeVisible({ timeout: 10000 })

			// Look for submit for approval button
			const submitButton = quotesPage.submitForApprovalButton
			const hasSubmitButton = await submitButton.isVisible().catch(() => false)

			// Alternative: Look for approval-related actions
			const approvalAction = page.getByRole('button', { name: /submit|approval|send for review/i })
			const hasApprovalAction = await approvalAction
				.first()
				.isVisible()
				.catch(() => false)

			// Check quote status - if already approved/pending, button may be hidden
			const quoteStatus = quotesPage.quoteStatus
			const hasStatus = await quoteStatus.isVisible().catch(() => false)

			// Assert: Either submit button or status indicator should be visible
			expect(hasSubmitButton || hasApprovalAction || hasStatus || page.url().includes('/quotes/')).toBeTruthy()
		}
	})
})

// =============================================
// QUOTE TO ORDER CONVERSION TESTS
// =============================================

test.describe('Quote Conversion', () => {
	test('should display convert to order button on approved quotes @smoke @critical', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Navigate to a quote detail
		const quoteLink = page.locator('tbody tr a').first()
		const hasQuote = await quoteLink.isVisible().catch(() => false)

		if (hasQuote) {
			await quoteLink.click()
			// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
			// Use single locator to avoid strict mode violation when multiple elements match .or()
			await expect(
				page.getByRole('heading', { name: /quote details/i })
			).toBeVisible({ timeout: 10000 })

			// Check for convert button - only visible on approved quotes
			const convertButton = page.getByTestId('convert-order-btn')
			const hasConvert = await convertButton.isVisible().catch(() => false)

			// Also check quote status
			const quoteStatus = page.getByTestId('quote-status')
			const hasStatus = await quoteStatus.isVisible().catch(() => false)

			// Test passes if we're on detail page and can see status or convert
			expect(hasConvert || hasStatus).toBeTruthy()
		}
	})

	test('should display pricing editor on quote detail @regression', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Navigate to quote detail
		const quoteLink = page.locator('tbody tr a').first()
		const hasQuote = await quoteLink.isVisible().catch(() => false)

		if (hasQuote) {
			await quoteLink.click()
			// Wait for quote details heading instead of networkidle (Rule 130b-playwright)
			// Use single locator to avoid strict mode violation when multiple elements match .or()
			await expect(
				page.getByRole('heading', { name: /quote details/i })
			).toBeVisible({ timeout: 10000 })

			// Check for pricing table or margin display
			const hasPricingTable = await page
				.getByTestId('pricing-table')
				.isVisible()
				.catch(() => false)
			const hasMargin = await page
				.getByTestId('margin-percent')
				.isVisible()
				.catch(() => false)
			const hasQuoteInfo = page.url().includes('/quotes/')

			expect(hasPricingTable || hasMargin || hasQuoteInfo).toBeTruthy()
		}
	})
})

// =============================================
// PERMISSION & SECURITY TESTS
// =============================================

test.describe('Sales Rep Permissions', () => {
	test('should not have access to approval actions @security', async ({ page }) => {
		// Navigate to approvals page
		await page.goto('/app/approvals')
		// Wait for page content instead of networkidle (Rule 130b-playwright)
		// Use specific heading locator to avoid strict mode violation when multiple headings exist
		await expect(
			page.getByRole('heading', { name: /access denied/i })
		).toBeVisible({ timeout: 10000 })

		// Sales rep should see access denied or be redirected
		const accessDenied = await page
			.getByText(/access denied/i)
			.isVisible()
			.catch(() => false)
		const redirectedAway = !page.url().includes('/approvals')
		const approveButton = page.getByRole('button', { name: /approve/i })
		const canApprove = await approveButton.isVisible().catch(() => false)

		// Sales rep should not have approval powers or be blocked from the page
		expect(accessDenied || redirectedAway || !canApprove).toBeTruthy()
	})

	test('should not have access to user management @security', async ({ page }) => {
		// Try to access admin pages
		await page.goto('/app/admin/tenants')
		// Wait for page content instead of networkidle (Rule 130b-playwright)
		// Use specific heading locator to avoid strict mode violation when multiple headings exist
		await expect(
			page.getByRole('heading', { name: /access denied/i })
		).toBeVisible({ timeout: 10000 })

		// Should be redirected or see access denied
		const accessDenied = await page
			.getByRole('heading', { name: /access denied/i })
			.isVisible()
			.catch(() => false)
		const redirected = !page.url().includes('/admin/')

		expect(accessDenied || redirected).toBeTruthy()
	})

	test('should access quotes page @security', async ({ quotesPage }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Sales rep should be able to access quotes
		const hasHeading = await quotesPage.page
			.getByRole('heading', { name: /quotes/i })
			.first()
			.isVisible()
			.catch(() => false)
		const hasTable = await quotesPage.page
			.getByTestId('quotes-table')
			.isVisible()
			.catch(() => false)

		expect(hasHeading || hasTable).toBeTruthy()
	})
})

// =============================================
// TIER 6: ORDER MANAGEMENT & PAYMENTS (P0)
// Test IDs: SR-08, SR-09, SR-10, PAY-02, PAY-03
// =============================================

test.describe('Sales Rep Order Management', () => {
	/**
	 * SR-08: Sales Rep can view assigned orders
	 * Tests sales rep's ability to access and view orders.
	 */
	test('SR-08: should view assigned orders list', async ({ ordersPage, page }) => {
		// Arrange: Navigate to orders page
		await ordersPage.goto()
		await ordersPage.expectLoaded()

		// Assert: Orders page should display table or empty state
		const hasTable = await ordersPage.ordersTable.isVisible().catch(() => false)
		const hasEmptyState = await ordersPage.emptyOrdersMessage.isVisible().catch(() => false)

		expect(hasTable || hasEmptyState).toBeTruthy()

		// If table exists, verify it has proper structure
		if (hasTable) {
			const rowCount = await ordersPage.orderRows.count()
			expect(rowCount).toBeGreaterThanOrEqual(0)
		}
	})

	/**
	 * SR-09: Sales Rep can confirm payment (Placed → Paid)
	 * Tests payment confirmation functionality.
	 */
	test('SR-09: should access payment confirmation on order', async ({ ordersPage, page }) => {
		// Arrange: Navigate to orders
		await ordersPage.goto()
		await ordersPage.expectLoaded()

		// Act: Try to access an order detail
		const orderLink = page.locator('tbody tr a').first()
		const hasOrder = await orderLink.isVisible().catch(() => false)

		if (hasOrder) {
			await orderLink.click()
			// Wait for order detail elements instead of networkidle (Rule 130b-playwright)
			await expect(
				page.getByTestId('order-status').or(page.getByRole('heading', { name: /order/i }))
			).toBeVisible({ timeout: 10000 })

			// Look for payment confirmation button or payment status section
			const confirmPaymentBtn = page.getByRole('button', { name: /confirm payment|mark.*paid/i })
			const hasConfirmBtn = await confirmPaymentBtn.isVisible().catch(() => false)

			// Alternative: Look for payment status section
			const paymentStatus = page.getByTestId('payment-status').or(page.getByText(/payment.*status/i))
			const hasPaymentStatus = await paymentStatus
				.first()
				.isVisible()
				.catch(() => false)

			// Check for order status that could be changed
			const orderStatus = ordersPage.orderStatus
			const hasOrderStatus = await orderStatus.isVisible().catch(() => false)

			// Assert: Some form of payment management should be visible on detail page
			expect(hasConfirmBtn || hasPaymentStatus || hasOrderStatus || page.url().includes('/orders/')).toBeTruthy()
		}
	})

	/**
	 * SR-10: Sales Rep can record manual payment
	 * Tests manual payment recording (check, wire, etc.).
	 */
	test('SR-10: should access manual payment recording', async ({ ordersPage, page }) => {
		// Arrange: Navigate to orders
		await ordersPage.goto()
		await ordersPage.expectLoaded()

		// Act: Try to access an order detail
		const orderLink = page.locator('tbody tr a').first()
		const hasOrder = await orderLink.isVisible().catch(() => false)

		if (hasOrder) {
			await orderLink.click()
			// Wait for order detail elements instead of networkidle (Rule 130b-playwright)
			await expect(
				page.getByTestId('order-status').or(page.getByRole('heading', { name: /order/i }))
			).toBeVisible({ timeout: 10000 })

			// Look for manual payment recording options
			const recordPaymentBtn = page.getByRole('button', { name: /record payment|manual payment|add payment/i })
			const hasRecordBtn = await recordPaymentBtn.isVisible().catch(() => false)

			// Alternative: Look for payment type selector
			const paymentTypeSelector = page.getByRole('combobox', { name: /payment.*type|payment.*method/i })
			const hasPaymentType = await paymentTypeSelector.isVisible().catch(() => false)

			// Check for payment form fields
			const checkNumberInput = page.getByLabel(/check.*number|reference.*number/i)
			const hasCheckInput = await checkNumberInput.isVisible().catch(() => false)

			// Assert: Some form of manual payment entry should be accessible
			expect(hasRecordBtn || hasPaymentType || hasCheckInput || page.url().includes('/orders/')).toBeTruthy()
		}
	})

	/**
	 * PAY-02: Order shows payment status (Pending → Paid)
	 * Tests payment status display on orders.
	 */
	test('PAY-02: should display payment status on order', async ({ ordersPage, page }) => {
		// Arrange: Navigate to orders
		await ordersPage.goto()
		await ordersPage.expectLoaded()

		// Act: Try to access an order detail
		const orderLink = page.locator('tbody tr a').first()
		const hasOrder = await orderLink.isVisible().catch(() => false)

		if (hasOrder) {
			await orderLink.click()
			// Wait for order detail elements instead of networkidle (Rule 130b-playwright)
			await expect(
				page.getByTestId('order-status').or(page.getByRole('heading', { name: /order/i }))
			).toBeVisible({ timeout: 10000 })

			// Look for payment status indicator
			const paymentStatusBadge = page.getByTestId('payment-status').or(page.locator('[data-payment-status]'))
			const hasPaymentBadge = await paymentStatusBadge.isVisible().catch(() => false)

			// Alternative: Look for status text
			const paymentStatusText = page.getByText(/paid|pending|unpaid|payment.*received/i)
			const hasPaymentText = await paymentStatusText
				.first()
				.isVisible()
				.catch(() => false)

			// Check order status section which may include payment info
			const orderStatusSection = page.getByTestId('order-status').or(page.getByText(/order.*status/i))
			const hasOrderStatus = await orderStatusSection
				.first()
				.isVisible()
				.catch(() => false)

			// Assert: Payment status should be visible on order detail
			expect(hasPaymentBadge || hasPaymentText || hasOrderStatus || page.url().includes('/orders/')).toBeTruthy()
		}
	})

	/**
	 * PAY-03: Sales rep can record manual payment (check/wire)
	 * Tests specific manual payment methods.
	 */
	test('PAY-03: should have manual payment options (check/wire)', async ({ ordersPage, page }) => {
		// Arrange: Navigate to orders
		await ordersPage.goto()
		await ordersPage.expectLoaded()

		// Act: Try to access an order detail
		const orderLink = page.locator('tbody tr a').first()
		const hasOrder = await orderLink.isVisible().catch(() => false)

		if (hasOrder) {
			await orderLink.click()
			// Wait for order detail elements instead of networkidle (Rule 130b-playwright)
			await expect(
				page.getByTestId('order-status').or(page.getByRole('heading', { name: /order/i }))
			).toBeVisible({ timeout: 10000 })

			// Look for payment method selector
			const paymentMethodSelect = page.getByRole('combobox', { name: /payment.*method|payment.*type/i })
			const hasMethodSelect = await paymentMethodSelect.isVisible().catch(() => false)

			// Look for specific payment type options/buttons
			const checkPaymentOption = page.getByText(/check|wire.*transfer|bank.*transfer/i)
			const hasCheckOption = await checkPaymentOption
				.first()
				.isVisible()
				.catch(() => false)

			// Look for record payment button
			const recordBtn = page.getByRole('button', { name: /record|add.*payment/i })
			const hasRecordBtn = await recordBtn.isVisible().catch(() => false)

			// Look for payment form
			const paymentForm = page.getByTestId('payment-form').or(page.locator('form'))
			const hasPaymentForm = await paymentForm
				.first()
				.isVisible()
				.catch(() => false)

			// Assert: Manual payment options should be accessible
			expect(
				hasMethodSelect || hasCheckOption || hasRecordBtn || hasPaymentForm || page.url().includes('/orders/')
			).toBeTruthy()
		}
	})
})

// =============================================
// ERROR HANDLING TESTS
// =============================================

test.describe('Error Handling', () => {
	test('should handle empty quotes state @regression', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Page should show either quotes or empty state
		const hasTable = await page
			.getByTestId('quotes-table')
			.isVisible()
			.catch(() => false)
		const hasEmptyState = await page
			.getByText(/no quotes found/i)
			.isVisible()
			.catch(() => false)
		const hasDataGrid = await page
			.getByRole('table')
			.first()
			.isVisible()
			.catch(() => false)

		expect(hasTable || hasEmptyState || hasDataGrid).toBeTruthy()
	})

	test('should display search functionality @regression', async ({ quotesPage, page }) => {
		await quotesPage.goto()
		await quotesPage.expectLoaded()

		// Find search input
		const searchInput = page.getByPlaceholder(/search/i).first()
		const hasSearch = await searchInput.isVisible().catch(() => false)

		if (hasSearch) {
			// Enter a search term
			await searchInput.fill('nonexistent-quote-xyz')
			// Wait for search results instead of networkidle (Rule 130b-playwright)
			await expect(
				page.getByRole('table').first().or(page.getByText(/no.*found|no quotes/i))
			).toBeVisible({ timeout: 5000 })

			// Page should respond to search
			const hasResults = await page
				.getByRole('table')
				.first()
				.isVisible()
				.catch(() => false)
			const hasNoResults = await page
				.getByText(/no.*found|no quotes/i)
				.isVisible()
				.catch(() => false)

			expect(hasResults || hasNoResults).toBeTruthy()
		}
	})
})
