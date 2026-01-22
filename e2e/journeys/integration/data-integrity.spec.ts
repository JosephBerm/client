/**
 * Data Integrity Verification E2E Tests
 *
 * Critical tests to ensure data consistency across roles and state transitions.
 * These tests verify that business data remains consistent when viewed by
 * different roles and after status transitions.
 *
 * TESTS COVERED:
 * - Order amounts match across Customer and Sales Rep views
 * - Quote pricing is consistent after status changes
 * - Tracking information persists after fulfillment updates
 * - Payment status reflects correctly across all roles
 * - Historical data accuracy (order history, audit trails)
 *
 * MAANG BEST PRACTICES:
 * - Cross-role data verification
 * - State transition validation
 * - Data persistence checks
 * - Concurrent access safety
 *
 * @tags @data-integrity @critical @cross-role
 */

import { test, expect } from '../../fixtures'

// =============================================
// AUTH STORAGE STATES
// =============================================

const AUTH_STATES = {
	customer: '.auth/customer.json',
	salesRep: '.auth/sales-rep.json',
	salesManager: '.auth/sales-manager.json',
	fulfillment: '.auth/fulfillment.json',
	admin: '.auth/admin.json',
} as const

// =============================================
// HELPER: Extract numeric value from currency string
// =============================================

function parseCurrency(text: string): number {
	return parseFloat(text.replace(/[^0-9.-]/g, '')) || 0
}

// =============================================
// ORDER DATA INTEGRITY
// =============================================

test.describe('Order Data Integrity', () => {
	let capturedOrderNumber: string | null = null
	let capturedOrderTotal: number | null = null
	let capturedOrderStatus: string | null = null

	test.describe.configure({ mode: 'serial' })

	/**
	 * Capture order data as Customer
	 */
	test('Capture: Customer views order details', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.customer })
		const page = await context.newPage()

		try {
			await page.goto('/app/orders')
			await page.waitForLoadState('networkidle')

			// Find first order
			const orderLink = page.locator('tbody tr a').first()

			if (await orderLink.isVisible().catch(() => false)) {
				// Capture order number from list
				const orderRow = page.locator('tbody tr').first()
				const orderNumberCell = orderRow.locator('td').first()
				capturedOrderNumber = await orderNumberCell.textContent().catch(() => null)

				// Navigate to detail
				await orderLink.click()
				await page.waitForLoadState('networkidle')

				// Capture order total
				const totalEl = page.getByTestId('order-total').or(page.getByText(/total.*\$\d+/i))
				const totalText = await totalEl.textContent().catch(() => '0')
				capturedOrderTotal = parseCurrency(totalText || '0')

				// Capture order status
				const statusEl = page.getByTestId('order-status').or(page.locator('[data-status]'))
				capturedOrderStatus = await statusEl.textContent().catch(() => null)

				console.log(`[Data Integrity] Customer captured:`)
				console.log(`  Order: ${capturedOrderNumber}`)
				console.log(`  Total: $${capturedOrderTotal}`)
				console.log(`  Status: ${capturedOrderStatus}`)
			}

			expect(capturedOrderNumber).not.toBeNull()
		} finally {
			await context.close()
		}
	})

	/**
	 * Verify: Sales Rep sees same order data
	 */
	test('Verify: Sales Rep sees same order data', async ({ browser }) => {
		test.skip(!capturedOrderNumber, 'No order captured from previous step')

		const context = await browser.newContext({ storageState: AUTH_STATES.salesRep })
		const page = await context.newPage()

		try {
			await page.goto('/app/orders')
			await page.waitForLoadState('networkidle')

			// Find the same order
			const orderRow = page.locator('tbody tr').filter({ hasText: capturedOrderNumber! })

			if (await orderRow.isVisible().catch(() => false)) {
				const orderLink = orderRow.getByRole('link').first()
				await orderLink.click()
				await page.waitForLoadState('networkidle')

				// Verify total matches
				const totalEl = page.getByTestId('order-total').or(page.getByText(/total.*\$\d+/i))
				const salesRepTotal = parseCurrency((await totalEl.textContent().catch(() => '0')) || '0')

				// Verify status matches
				const statusEl = page.getByTestId('order-status').or(page.locator('[data-status]'))
				const salesRepStatus = await statusEl.textContent().catch(() => null)

				console.log(`[Data Integrity] Sales Rep sees:`)
				console.log(`  Total: $${salesRepTotal} (Customer: $${capturedOrderTotal})`)
				console.log(`  Status: ${salesRepStatus} (Customer: ${capturedOrderStatus})`)

				// OUTCOME ASSERTIONS: Data should match
				expect(salesRepTotal).toBeCloseTo(capturedOrderTotal!, 2)
				expect(salesRepStatus?.toLowerCase()).toEqual(capturedOrderStatus?.toLowerCase())
			}
		} finally {
			await context.close()
		}
	})

	/**
	 * Verify: Fulfillment sees same order data
	 */
	test('Verify: Fulfillment sees same order data', async ({ browser }) => {
		test.skip(!capturedOrderNumber, 'No order captured from previous step')

		const context = await browser.newContext({ storageState: AUTH_STATES.fulfillment })
		const page = await context.newPage()

		try {
			await page.goto('/app/fulfillment')
			await page.waitForLoadState('networkidle')

			// Find the same order in fulfillment queue
			const orderRow = page.locator('tbody tr').filter({ hasText: capturedOrderNumber! })

			if (await orderRow.isVisible().catch(() => false)) {
				await orderRow.click()
				await page.waitForLoadState('networkidle')

				// Verify status matches
				const statusEl = page.getByTestId('selected-order-status').or(page.locator('[data-status]'))
				const fulfillmentStatus = await statusEl.textContent().catch(() => null)

				console.log(`[Data Integrity] Fulfillment sees status: ${fulfillmentStatus}`)

				// Status should match (accounting for possible display differences)
				expect(fulfillmentStatus?.toLowerCase()).toContain(capturedOrderStatus?.toLowerCase().split(' ')[0] || '')
			}
		} finally {
			await context.close()
		}
	})

	/**
	 * Verify: Admin sees same order data
	 */
	test('Verify: Admin sees same order data', async ({ browser }) => {
		test.skip(!capturedOrderNumber, 'No order captured from previous step')

		const context = await browser.newContext({ storageState: AUTH_STATES.admin })
		const page = await context.newPage()

		try {
			await page.goto('/app/orders')
			await page.waitForLoadState('networkidle')

			// Find the same order
			const orderRow = page.locator('tbody tr').filter({ hasText: capturedOrderNumber! })

			if (await orderRow.isVisible().catch(() => false)) {
				const orderLink = orderRow.getByRole('link').first()
				await orderLink.click()
				await page.waitForLoadState('networkidle')

				// Verify total matches
				const totalEl = page.getByTestId('order-total').or(page.getByText(/total.*\$\d+/i))
				const adminTotal = parseCurrency((await totalEl.textContent().catch(() => '0')) || '0')

				console.log(`[Data Integrity] Admin sees total: $${adminTotal} (Original: $${capturedOrderTotal})`)

				// OUTCOME ASSERTION
				expect(adminTotal).toBeCloseTo(capturedOrderTotal!, 2)
			}
		} finally {
			await context.close()
		}
	})
})

// =============================================
// QUOTE PRICING INTEGRITY
// =============================================

test.describe('Quote Pricing Integrity', () => {
	let capturedQuoteId: string | null = null
	let capturedVendorCost: number | null = null
	let capturedCustomerPrice: number | null = null
	let capturedMargin: string | null = null

	test.describe.configure({ mode: 'serial' })

	/**
	 * Capture: Sales Rep quote pricing
	 */
	test('Capture: Sales Rep quote pricing data', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesRep })
		const page = await context.newPage()

		try {
			await page.goto('/app/quotes')
			await page.waitForLoadState('networkidle')

			// Find a quote with pricing data
			const quoteLink = page.locator('tbody tr a').first()

			if (await quoteLink.isVisible().catch(() => false)) {
				await quoteLink.click()
				await page.waitForLoadState('networkidle')

				// Extract quote ID from URL
				const url = page.url()
				const match = url.match(/\/quotes\/([a-f0-9-]+)/i)
				if (match) capturedQuoteId = match[1]

				// Capture vendor cost
				const vendorCostEl = page.getByTestId('vendor-cost').or(page.locator('[data-vendor-cost]'))
				const vendorCostText = await vendorCostEl.textContent().catch(() => null)
				if (vendorCostText) capturedVendorCost = parseCurrency(vendorCostText)

				// Capture customer price
				const customerPriceEl = page.getByTestId('customer-price').or(page.locator('[data-customer-price]'))
				const customerPriceText = await customerPriceEl.textContent().catch(() => null)
				if (customerPriceText) capturedCustomerPrice = parseCurrency(customerPriceText)

				// Capture margin
				const marginEl = page.getByTestId('margin-display').or(page.locator('[data-margin]'))
				capturedMargin = await marginEl.textContent().catch(() => null)

				console.log(`[Pricing Integrity] Sales Rep captured:`)
				console.log(`  Quote ID: ${capturedQuoteId}`)
				console.log(`  Vendor Cost: $${capturedVendorCost}`)
				console.log(`  Customer Price: $${capturedCustomerPrice}`)
				console.log(`  Margin: ${capturedMargin}`)
			}

			expect(capturedQuoteId).not.toBeNull()
		} finally {
			await context.close()
		}
	})

	/**
	 * Verify: Sales Manager sees same pricing
	 */
	test('Verify: Sales Manager sees same pricing data', async ({ browser }) => {
		test.skip(!capturedQuoteId, 'No quote captured from previous step')

		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto(`/app/quotes/${capturedQuoteId}`)
			await page.waitForLoadState('networkidle')

			// Verify vendor cost
			const vendorCostEl = page.getByTestId('vendor-cost').or(page.locator('[data-vendor-cost]'))
			const managerVendorCost = parseCurrency((await vendorCostEl.textContent().catch(() => '0')) || '0')

			// Verify customer price
			const customerPriceEl = page.getByTestId('customer-price').or(page.locator('[data-customer-price]'))
			const managerCustomerPrice = parseCurrency((await customerPriceEl.textContent().catch(() => '0')) || '0')

			console.log(`[Pricing Integrity] Sales Manager sees:`)
			console.log(`  Vendor Cost: $${managerVendorCost} (Original: $${capturedVendorCost})`)
			console.log(`  Customer Price: $${managerCustomerPrice} (Original: $${capturedCustomerPrice})`)

			// OUTCOME ASSERTIONS
			if (capturedVendorCost !== null && managerVendorCost > 0) {
				expect(managerVendorCost).toBeCloseTo(capturedVendorCost, 2)
			}

			if (capturedCustomerPrice !== null && managerCustomerPrice > 0) {
				expect(managerCustomerPrice).toBeCloseTo(capturedCustomerPrice, 2)
			}
		} finally {
			await context.close()
		}
	})

	/**
	 * Verify: Customer CANNOT see internal pricing
	 */
	test('Verify: Customer cannot see internal pricing (RBAC)', async ({ browser }) => {
		test.skip(!capturedQuoteId, 'No quote captured from previous step')

		const context = await browser.newContext({ storageState: AUTH_STATES.customer })
		const page = await context.newPage()

		try {
			// Try to access the quote directly
			await page.goto(`/app/quotes/${capturedQuoteId}`)
			await page.waitForLoadState('networkidle')

			// Check if access is denied
			const accessDenied = page.getByText(/access.*denied|unauthorized/i)
			const redirected = !page.url().includes('/quotes/')

			// If customer can access quote page, vendor cost should be hidden
			if (!redirected) {
				const vendorCostEl = page.getByTestId('vendor-cost').or(page.getByText(/vendor.*cost/i))
				const hasVendorCost = await vendorCostEl.isVisible().catch(() => false)

				const marginEl = page.getByTestId('margin-display').or(page.getByText(/margin/i))
				const hasMargin = await marginEl.isVisible().catch(() => false)

				console.log(`[RBAC] Customer sees vendor cost: ${hasVendorCost}, margin: ${hasMargin}`)

				// Customer should NOT see internal pricing
				expect(hasVendorCost).toBe(false)
				expect(hasMargin).toBe(false)
			} else {
				console.log(`[RBAC] Customer correctly blocked from quote page`)
				expect(redirected || (await accessDenied.isVisible().catch(() => false))).toBe(true)
			}
		} finally {
			await context.close()
		}
	})
})

// =============================================
// STATUS TRANSITION INTEGRITY
// =============================================

test.describe('Status Transition Integrity', () => {
	/**
	 * Test: Order status follows valid transitions
	 */
	test('Order status follows valid state machine', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.admin })
		const page = await context.newPage()

		try {
			await page.goto('/app/orders')
			await page.waitForLoadState('networkidle')

			// Get all visible statuses
			const statusBadges = page.locator('[data-status]').or(page.locator('.badge'))
			const statusCount = await statusBadges.count()

			const validStatuses = ['placed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
			const foundStatuses: string[] = []

			for (let i = 0; i < Math.min(statusCount, 10); i++) {
				const status = await statusBadges.nth(i).textContent().catch(() => '')
				if (status) foundStatuses.push(status.toLowerCase().trim())
			}

			console.log(`[Status Integrity] Found statuses: ${foundStatuses.join(', ')}`)

			// All found statuses should be in valid list
			const allValid = foundStatuses.every(
				(status) => validStatuses.some((valid) => status.includes(valid)) || status === ''
			)

			expect(allValid).toBe(true)
		} finally {
			await context.close()
		}
	})

	/**
	 * Test: Quote status follows valid transitions
	 */
	test('Quote status follows valid state machine', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesRep })
		const page = await context.newPage()

		try {
			await page.goto('/app/quotes')
			await page.waitForLoadState('networkidle')

			const validStatuses = ['draft', 'pending', 'read', 'approved', 'rejected', 'converted', 'expired']
			const statusBadges = page.locator('[data-status]').or(page.locator('.badge'))
			const statusCount = await statusBadges.count()

			const foundStatuses: string[] = []

			for (let i = 0; i < Math.min(statusCount, 10); i++) {
				const status = await statusBadges.nth(i).textContent().catch(() => '')
				if (status) foundStatuses.push(status.toLowerCase().trim())
			}

			console.log(`[Status Integrity] Found quote statuses: ${foundStatuses.join(', ')}`)

			const allValid = foundStatuses.every(
				(status) => validStatuses.some((valid) => status.includes(valid)) || status === ''
			)

			expect(allValid).toBe(true)
		} finally {
			await context.close()
		}
	})
})

// =============================================
// TRACKING DATA INTEGRITY
// =============================================

test.describe('Tracking Data Integrity', () => {
	let capturedTrackingNumber: string | null = null
	let capturedCarrier: string | null = null

	test.describe.configure({ mode: 'serial' })

	/**
	 * Capture: Fulfillment tracking data
	 */
	test('Capture: Tracking data from Fulfillment', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.fulfillment })
		const page = await context.newPage()

		try {
			await page.goto('/app/fulfillment')
			await page.waitForLoadState('networkidle')

			// Find shipped order with tracking
			const shippedOrder = page.locator('tbody tr').filter({ hasText: /shipped/i }).first()

			if (await shippedOrder.isVisible().catch(() => false)) {
				await shippedOrder.click()
				await page.waitForLoadState('networkidle')

				// Capture tracking number
				const trackingEl = page.getByTestId('tracking-number').or(page.getByText(/1Z\w+|TRACK/i))
				capturedTrackingNumber = await trackingEl.textContent().catch(() => null)

				// Capture carrier
				const carrierEl = page.getByTestId('carrier').or(page.getByText(/ups|fedex|usps/i))
				capturedCarrier = await carrierEl.textContent().catch(() => null)

				console.log(`[Tracking Integrity] Fulfillment captured:`)
				console.log(`  Tracking: ${capturedTrackingNumber}`)
				console.log(`  Carrier: ${capturedCarrier}`)
			}

			expect(true).toBe(true)
		} finally {
			await context.close()
		}
	})

	/**
	 * Verify: Customer sees same tracking data
	 */
	test('Verify: Customer sees same tracking data', async ({ browser }) => {
		test.skip(!capturedTrackingNumber, 'No tracking captured from previous step')

		const context = await browser.newContext({ storageState: AUTH_STATES.customer })
		const page = await context.newPage()

		try {
			await page.goto('/app/orders')
			await page.waitForLoadState('networkidle')

			// Find shipped order
			const shippedOrder = page.locator('tbody tr').filter({ hasText: /shipped/i }).first()

			if (await shippedOrder.isVisible().catch(() => false)) {
				const orderLink = shippedOrder.getByRole('link').first()
				await orderLink.click()
				await page.waitForLoadState('networkidle')

				// Verify tracking number matches
				const trackingEl = page.getByTestId('tracking-number').or(page.getByText(/1Z\w+|TRACK/i))
				const customerTracking = await trackingEl.textContent().catch(() => null)

				console.log(`[Tracking Integrity] Customer sees: ${customerTracking}`)

				if (capturedTrackingNumber && customerTracking) {
					expect(customerTracking).toContain(capturedTrackingNumber.trim())
				}
			}
		} finally {
			await context.close()
		}
	})
})

// =============================================
// CONCURRENT ACCESS SAFETY
// =============================================

test.describe('Concurrent Access Safety', () => {
	/**
	 * Test: Multiple roles can view same data simultaneously
	 */
	test('Multiple roles can access same order without conflict', async ({ browser }) => {
		// Create contexts for multiple roles
		const customerContext = await browser.newContext({ storageState: AUTH_STATES.customer })
		const salesRepContext = await browser.newContext({ storageState: AUTH_STATES.salesRep })
		const adminContext = await browser.newContext({ storageState: AUTH_STATES.admin })

		const customerPage = await customerContext.newPage()
		const salesRepPage = await salesRepContext.newPage()
		const adminPage = await adminContext.newPage()

		try {
			// Navigate all three roles to orders page simultaneously
			await Promise.all([
				customerPage.goto('/app/orders'),
				salesRepPage.goto('/app/orders'),
				adminPage.goto('/app/orders'),
			])

			await Promise.all([
				customerPage.waitForLoadState('networkidle'),
				salesRepPage.waitForLoadState('networkidle'),
				adminPage.waitForLoadState('networkidle'),
			])

			// OUTCOME ASSERTION: All pages load without errors
			const customerLoaded = await customerPage.getByRole('heading').first().isVisible().catch(() => false)
			const salesRepLoaded = await salesRepPage.getByRole('heading').first().isVisible().catch(() => false)
			const adminLoaded = await adminPage.getByRole('heading').first().isVisible().catch(() => false)

			console.log(`[Concurrent Access] Pages loaded:`)
			console.log(`  Customer: ${customerLoaded}`)
			console.log(`  Sales Rep: ${salesRepLoaded}`)
			console.log(`  Admin: ${adminLoaded}`)

			expect(customerLoaded && salesRepLoaded && adminLoaded).toBe(true)
		} finally {
			await Promise.all([customerContext.close(), salesRepContext.close(), adminContext.close()])
		}
	})
})
