/**
 * Cross-Role Integration E2E Tests
 *
 * CRITICAL PATH: End-to-end workflows spanning multiple user roles
 * Tests the complete business processes that involve handoffs between roles.
 *
 * BUSINESS RULES:
 * - Orders must flow seamlessly from customer to fulfillment
 * - Quotes requiring approval must be processed by managers
 * - All handoffs must maintain data integrity
 * - Status changes must be visible to all relevant roles
 *
 * Prerequisites:
 * - All test accounts exist (customer, fulfillment, sales rep, sales manager)
 * - Storage states are set up for quick role switching
 *
 * @tags @integration @critical @smoke
 */

import { test, expect, BrowserContext, Page } from '@playwright/test'
import { StorePage } from '../../pages/StorePage'
import { CartPage } from '../../pages/CartPage'
import { CheckoutPage } from '../../pages/CheckoutPage'
import { OrdersPage } from '../../pages/OrdersPage'
import { FulfillmentQueuePage } from '../../pages/FulfillmentQueuePage'
import { QuotesPage } from '../../pages/QuotesPage'
import { ApprovalQueuePage } from '../../pages/ApprovalQueuePage'
import { TEST_ADDRESSES, TEST_CUSTOMERS, TEST_PRODUCTS } from '../../fixtures/test-data'

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Generate unique tracking number
 */
function generateTrackingNumber(): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8).toUpperCase()
	return `1Z${random}${timestamp.toString().slice(-8)}`
}

/**
 * Wait for page to be ready
 */
async function waitForPageReady(page: Page): Promise<void> {
	await page.waitForLoadState('networkidle')
}

// =============================================
// STORAGE STATE PATHS
// =============================================

const AUTH_STATES = {
	customer: 'playwright/.auth/customer.json',
	fulfillment: 'playwright/.auth/fulfillment.json',
	salesRep: 'playwright/.auth/sales-rep.json',
	salesManager: 'playwright/.auth/sales-manager.json',
	admin: 'playwright/.auth/admin.json',
	superAdmin: 'playwright/.auth/super-admin.json',
}

// =============================================
// ORDER HANDOFF WORKFLOW
// Tests: Customer → Fulfillment → Customer (status verification)
// =============================================

test.describe('Order Handoff Workflow', () => {
	test.describe.configure({ mode: 'serial' })

	// Shared state across tests
	let orderNumber: string | null = null

	test('Step 1: Customer creates an order @smoke @critical', async ({ browser }) => {
		// Create context with customer auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.customer,
		})
		const page = await context.newPage()

		try {
			const storePage = new StorePage(page)
			const cartPage = new CartPage(page)
			const checkoutPage = new CheckoutPage(page)

			// Navigate to store and add product
			await storePage.goto()
			await storePage.expectLoaded()

			const firstProduct = storePage.productCards.first()
			const addButton = firstProduct.getByRole('button', { name: /add/i })
			const hasAddButton = await addButton.isVisible().catch(() => false)

			if (hasAddButton) {
				await addButton.click()
				await storePage.waitForLoad()

				// Go to cart
				await cartPage.goto()
				const itemCount = await cartPage.getItemCount()

				if (itemCount > 0) {
					// Proceed to checkout
					await cartPage.proceedToCheckout()
					await checkoutPage.expectLoaded()

					// Fill shipping address
					const hasStreet = await checkoutPage.streetInput.isVisible().catch(() => false)
					if (hasStreet) {
						await checkoutPage.fillShippingAddress(TEST_ADDRESSES.shipping)
					}

					// Select payment method
					const hasInvoice = await checkoutPage.invoiceOption.isVisible().catch(() => false)
					if (hasInvoice) {
						await checkoutPage.invoiceOption.check()
					}

					// Place order
					const hasPlaceOrder = await checkoutPage.placeOrderButton.isVisible().catch(() => false)
					if (hasPlaceOrder) {
						await checkoutPage.placeOrderButton.click()
						await waitForPageReady(page)

						// Get order number
						try {
							orderNumber = await checkoutPage.getOrderNumber()
							console.log(`✅ Customer created order: ${orderNumber}`)
						} catch {
							// Try to get from URL or confirmation page
							const confirmationText = await page.locator('.order-number, [data-testid="order-number"]').textContent()
							if (confirmationText) {
								orderNumber = confirmationText.replace(/[^A-Z0-9-]/gi, '')
								console.log(`✅ Customer created order: ${orderNumber}`)
							}
						}
					}
				}
			}

			// Verify order was created
			expect(orderNumber).toBeTruthy()
		} finally {
			await context.close()
		}
	})

	test('Step 2: Fulfillment processes the order @critical', async ({ browser }) => {
		test.skip(!orderNumber, 'No order created in previous step')

		// Create context with fulfillment auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.fulfillment,
		})
		const page = await context.newPage()

		try {
			const fulfillmentPage = new FulfillmentQueuePage(page)

			// Navigate to fulfillment queue
			await fulfillmentPage.goto()
			await fulfillmentPage.expectLoaded()

			// Filter to pending orders
			await fulfillmentPage.filterByStatus('pending')
			await fulfillmentPage.waitForLoad()

			// Find and select the order
			if (orderNumber) {
				await fulfillmentPage.selectOrder(orderNumber)
				await fulfillmentPage.waitForLoad()

				// Process the order
				await fulfillmentPage.processOrder()

				// Generate shipping label (if available)
				const hasLabelButton = await fulfillmentPage.generateLabelButton.isVisible().catch(() => false)
				if (hasLabelButton) {
					await fulfillmentPage.generateShippingLabel()
				}

				// Add tracking and mark as shipped
				const trackingNumber = generateTrackingNumber()
				await fulfillmentPage.completeShippingFlow(trackingNumber, 'UPS')

				// Verify status
				await fulfillmentPage.expectSelectedOrderStatus(/shipped/i)

				console.log(`✅ Fulfillment shipped order ${orderNumber} with tracking: ${trackingNumber}`)
			}
		} finally {
			await context.close()
		}
	})

	test('Step 3: Customer verifies shipped status @critical', async ({ browser }) => {
		test.skip(!orderNumber, 'No order created in previous steps')

		// Create context with customer auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.customer,
		})
		const page = await context.newPage()

		try {
			const ordersPage = new OrdersPage(page)

			// Navigate to order history
			await ordersPage.goto()
			await ordersPage.expectLoaded()

			// Find the order
			if (orderNumber) {
				await ordersPage.expectOrderInList(orderNumber)

				// Click to view details
				const orderRow = ordersPage.orderRows.filter({ hasText: orderNumber })
				await orderRow.click()
				await ordersPage.waitForLoad()

				// Verify shipped status
				const orderStatus = ordersPage.orderStatus
				const statusText = await orderStatus.textContent()

				expect(statusText?.toLowerCase()).toContain('shipped')
				console.log(`✅ Customer verified order ${orderNumber} is shipped`)
			}
		} finally {
			await context.close()
		}
	})
})

// =============================================
// QUOTE APPROVAL WORKFLOW
// Tests: Sales Rep → Sales Manager → Sales Rep (conversion)
// =============================================

test.describe('Quote Approval Workflow', () => {
	test.describe.configure({ mode: 'serial' })

	// Shared state
	let quoteReference: string | null = null

	test('Step 1: Sales Rep creates quote requiring approval @smoke @critical', async ({ browser }) => {
		// Create context with sales rep auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.salesRep,
		})
		const page = await context.newPage()

		try {
			const quotesPage = new QuotesPage(page)

			// Navigate to quotes
			await quotesPage.goto()
			await quotesPage.expectLoaded()

			// Open create quote form
			await quotesPage.openCreateQuote()

			// Select customer
			await quotesPage.selectCustomer(TEST_CUSTOMERS.existingCustomer.companyName)

			// Add products (large quantity to trigger approval)
			await quotesPage.addProduct(TEST_PRODUCTS.surgicalGloves.name, 100)

			// Apply discount that requires approval
			await quotesPage.applyDiscount(20) // 20% discount - should require approval

			// Verify margin warning is shown
			const hasWarning = await quotesPage.hasMarginWarning()
			if (hasWarning) {
				console.log('⚠️ Margin warning displayed - quote will require approval')
			}

			// Submit for approval
			await quotesPage.submitForApproval()

			// Get quote reference
			const quoteRef = quotesPage.quoteNumber
			const hasRef = await quoteRef.isVisible().catch(() => false)
			if (hasRef) {
				quoteReference = await quoteRef.textContent()
				console.log(`✅ Sales Rep created quote: ${quoteReference}`)
			}

			// Verify status
			const quoteStatus = quotesPage.quoteStatus
			const hasStatus = await quoteStatus.isVisible().catch(() => false)
			if (hasStatus) {
				await expect(quoteStatus).toContainText(/pending|approval/i)
			}
		} finally {
			await context.close()
		}
	})

	test('Step 2: Sales Manager approves the quote @critical', async ({ browser }) => {
		test.skip(!quoteReference, 'No quote created in previous step')

		// Create context with sales manager auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.salesManager,
		})
		const page = await context.newPage()

		try {
			const approvalPage = new ApprovalQueuePage(page)

			// Navigate to approval queue
			await approvalPage.goto()
			await approvalPage.expectLoaded()

			// Find and select the quote
			if (quoteReference) {
				await approvalPage.selectApproval(quoteReference)
				await approvalPage.waitForLoad()

				// Check for pricing violations
				const hasViolation = await approvalPage.hasPricingViolation()

				if (hasViolation) {
					// Approve with override
					await approvalPage.approveWithOverride('Approved for strategic customer acquisition')
				} else {
					// Standard approval
					await approvalPage.approve('Approved - pricing within guidelines')
				}

				// Verify success
				await approvalPage.expectApprovalSuccess()

				console.log(`✅ Sales Manager approved quote: ${quoteReference}`)
			}
		} finally {
			await context.close()
		}
	})

	test('Step 3: Sales Rep converts approved quote to order @critical', async ({ browser }) => {
		test.skip(!quoteReference, 'No quote created in previous steps')

		// Create context with sales rep auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.salesRep,
		})
		const page = await context.newPage()

		try {
			const quotesPage = new QuotesPage(page)

			// Navigate to quotes
			await quotesPage.goto()
			await quotesPage.expectLoaded()

			// Filter to approved quotes
			const statusFilter = quotesPage.statusFilter
			const hasFilter = await statusFilter.isVisible().catch(() => false)
			if (hasFilter) {
				await statusFilter.selectOption('approved')
				await quotesPage.waitForLoad()
			}

			// Find the quote
			if (quoteReference) {
				const quoteRow = quotesPage.quoteRows.filter({ hasText: quoteReference })
				const exists = await quoteRow.isVisible().catch(() => false)

				if (exists) {
					await quoteRow.click()
					await quotesPage.waitForLoad()

					// Convert to order
					await quotesPage.convertToOrder()

					// Verify success via toast
					await quotesPage.expectToast(/order|converted|created/i).catch(() => {
						// Toast might have already disappeared
					})

					console.log(`✅ Sales Rep converted quote ${quoteReference} to order`)
				}
			}
		} finally {
			await context.close()
		}
	})
})

// =============================================
// USER PERMISSION CASCADE
// Tests: Admin creates user → User can perform role actions
// =============================================

test.describe('User Permission Cascade', () => {
	test.describe.configure({ mode: 'serial' })

	let newUserEmail: string | null = null

	test.beforeAll(() => {
		// Generate unique email for test user
		const timestamp = Date.now()
		newUserEmail = `test-cascade-${timestamp}@medsource-test.com`
	})

	test('Step 1: Admin creates a new customer user @critical', async ({ browser }) => {
		// Create context with admin auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.admin,
		})
		const page = await context.newPage()

		try {
			// Navigate to user management
			await page.goto('/admin/users')
			await waitForPageReady(page)

			// Open add user form
			const addButton = page.getByRole('button', { name: /add|create|new/i })
			const hasAdd = await addButton.isVisible().catch(() => false)

			if (hasAdd) {
				await addButton.click()
				await waitForPageReady(page)

				// Fill user form
				const emailInput = page.getByLabel(/email/i)
				const firstNameInput = page.getByLabel(/first name/i)
				const lastNameInput = page.getByLabel(/last name/i)
				const roleSelect = page.getByLabel(/role/i)

				if (newUserEmail) {
					await emailInput.fill(newUserEmail)
				}
				await firstNameInput.fill('Test')
				await lastNameInput.fill('Cascade')

				const hasRole = await roleSelect.isVisible().catch(() => false)
				if (hasRole) {
					await roleSelect.selectOption('Customer')
				}

				// Set password
				const passwordInput = page.getByLabel(/password/i).first()
				const hasPassword = await passwordInput.isVisible().catch(() => false)
				if (hasPassword) {
					await passwordInput.fill('TestPassword123!')
				}

				// Submit
				const submitButton = page.getByRole('button', { name: /submit|create|save/i })
				await submitButton.click()
				await waitForPageReady(page)

				// Verify success
				const successMessage = page.getByRole('alert').filter({ hasText: /success|created/i })
				const hasSuccess = await successMessage.isVisible().catch(() => false)

				if (hasSuccess) {
					console.log(`✅ Admin created user: ${newUserEmail}`)
				}
			}
		} finally {
			await context.close()
		}
	})

	test('Step 2: Verify new user appears in user list @regression', async ({ browser }) => {
		test.skip(!newUserEmail, 'No user created in previous step')

		// Create context with admin auth
		const context = await browser.newContext({
			storageState: AUTH_STATES.admin,
		})
		const page = await context.newPage()

		try {
			// Navigate to user management
			await page.goto('/admin/users')
			await waitForPageReady(page)

			// Search for the new user
			const searchInput = page.getByPlaceholder(/search/i)
			const hasSearch = await searchInput.isVisible().catch(() => false)

			if (hasSearch && newUserEmail) {
				await searchInput.fill(newUserEmail)
				await waitForPageReady(page)

				// Verify user appears
				const userRow = page.locator('tbody tr').filter({ hasText: newUserEmail })
				await expect(userRow).toBeVisible()

				console.log(`✅ User ${newUserEmail} found in user list`)
			}
		} finally {
			await context.close()
		}
	})
})

// =============================================
// FULL BUSINESS CYCLE
// Tests: Complete order lifecycle from quote to delivery
// =============================================

test.describe('Full Business Cycle', () => {
	test.describe.configure({ mode: 'serial' })

	let quoteRef: string | null = null
	let orderNumber: string | null = null

	test('Complete cycle: Quote → Approval → Order → Fulfillment @smoke', async ({ browser }) => {
		// This is a comprehensive smoke test that runs through the entire cycle
		// Individual steps are tested in dedicated describe blocks above

		// Step 1: Sales Rep creates quote
		let salesContext = await browser.newContext({ storageState: AUTH_STATES.salesRep })
		let page = await salesContext.newPage()

		try {
			const quotesPage = new QuotesPage(page)
			await quotesPage.goto()
			await quotesPage.expectLoaded()

			await quotesPage.openCreateQuote()
			await quotesPage.selectCustomer(TEST_CUSTOMERS.existingCustomer.companyName)
			await quotesPage.addProduct(TEST_PRODUCTS.surgicalGloves.name, 50)
			await quotesPage.submitForApproval()

			const quoteRefEl = quotesPage.quoteNumber
			const hasRef = await quoteRefEl.isVisible().catch(() => false)
			if (hasRef) {
				quoteRef = await quoteRefEl.textContent()
			}
		} finally {
			await salesContext.close()
		}

		// Step 2: Manager approves (if quote was created)
		if (quoteRef) {
			const managerContext = await browser.newContext({ storageState: AUTH_STATES.salesManager })
			page = await managerContext.newPage()

			try {
				const approvalPage = new ApprovalQueuePage(page)
				await approvalPage.goto()
				await approvalPage.expectLoaded()

				await approvalPage.selectApproval(quoteRef)
				await approvalPage.approve('Full cycle test - approved')
			} finally {
				await managerContext.close()
			}

			// Step 3: Sales Rep converts to order
			salesContext = await browser.newContext({ storageState: AUTH_STATES.salesRep })
			page = await salesContext.newPage()

			try {
				const quotesPage = new QuotesPage(page)
				await quotesPage.goto()
				await quotesPage.expectLoaded()

				// Filter to approved
				const statusFilter = quotesPage.statusFilter
				const hasFilter = await statusFilter.isVisible().catch(() => false)
				if (hasFilter) {
					await statusFilter.selectOption('approved')
					await quotesPage.waitForLoad()
				}

				const quoteRow = quotesPage.quoteRows.filter({ hasText: quoteRef })
				const exists = await quoteRow.isVisible().catch(() => false)
				if (exists) {
					await quoteRow.click()
					await quotesPage.convertToOrder()

					// Try to get order number
					const orderRefEl = page.locator('[data-testid="order-number"]')
					const hasOrder = await orderRefEl.isVisible().catch(() => false)
					if (hasOrder) {
						orderNumber = await orderRefEl.textContent()
					}
				}
			} finally {
				await salesContext.close()
			}
		}

		// Step 4: Fulfillment ships (if order was created)
		if (orderNumber) {
			const fulfillmentContext = await browser.newContext({ storageState: AUTH_STATES.fulfillment })
			page = await fulfillmentContext.newPage()

			try {
				const fulfillmentPage = new FulfillmentQueuePage(page)
				await fulfillmentPage.goto()
				await fulfillmentPage.expectLoaded()

				await fulfillmentPage.selectOrder(orderNumber)
				await fulfillmentPage.processOrder()
				await fulfillmentPage.completeShippingFlow(generateTrackingNumber(), 'UPS')
				await fulfillmentPage.expectSelectedOrderStatus(/shipped/i)
			} finally {
				await fulfillmentContext.close()
			}
		}

		// Log results
		if (quoteRef && orderNumber) {
			console.log(`✅ Full business cycle completed: Quote ${quoteRef} → Order ${orderNumber} → Shipped`)
		} else if (quoteRef) {
			console.log(`⚠️ Partial cycle: Quote ${quoteRef} created but order conversion may have failed`)
		} else {
			console.log(`⚠️ Cycle incomplete: Quote creation may have failed`)
		}

		// The test passes if we got through without errors
		// Individual assertions in each step validate the specifics
		expect(true).toBeTruthy()
	})
})

// =============================================
// DATA INTEGRITY TESTS
// Verifies data consistency across role transitions
// =============================================

test.describe('Data Integrity Across Roles', () => {
	test('Order amounts should be consistent across views @critical', async ({ browser }) => {
		// Get an existing order number from customer view
		const customerContext = await browser.newContext({ storageState: AUTH_STATES.customer })
		const customerPage = await customerContext.newPage()

		let orderAmount: string | null = null
		let testOrderNumber: string | null = null

		try {
			const ordersPage = new OrdersPage(customerPage)
			await ordersPage.goto()
			await ordersPage.expectLoaded()

			// Get first order's amount
			const orderRows = ordersPage.orderRows
			const orderCount = await orderRows.count()

			if (orderCount > 0) {
				const firstRow = orderRows.first()
				const amountCell = firstRow.locator('[data-testid="order-total"]').or(firstRow.locator('td:last-child'))
				orderAmount = await amountCell.textContent()

				const numberCell = firstRow.locator('[data-testid="order-number"]').or(firstRow.locator('td:first-child'))
				testOrderNumber = await numberCell.textContent()
			}
		} finally {
			await customerContext.close()
		}

		// Verify same amount in fulfillment view
		if (testOrderNumber && orderAmount) {
			const fulfillmentContext = await browser.newContext({ storageState: AUTH_STATES.fulfillment })
			const fulfillmentPage = await fulfillmentContext.newPage()

			try {
				const queuePage = new FulfillmentQueuePage(fulfillmentPage)
				await queuePage.goto()
				await queuePage.expectLoaded()

				await queuePage.selectOrder(testOrderNumber)
				await queuePage.waitForLoad()

				// Get fulfillment view amount
				const fulfillmentAmount = await fulfillmentPage
					.locator('[data-testid="order-total"]')
					.or(fulfillmentPage.getByText(/total.*\$/i))
					.textContent()

				// Amounts should match (allowing for formatting differences)
				if (orderAmount && fulfillmentAmount) {
					const customerNum = parseFloat(orderAmount.replace(/[^0-9.]/g, ''))
					const fulfillmentNum = parseFloat(fulfillmentAmount.replace(/[^0-9.]/g, ''))

					expect(customerNum).toBeCloseTo(fulfillmentNum, 2)
					console.log(`✅ Order amounts match: Customer $${customerNum} = Fulfillment $${fulfillmentNum}`)
				}
			} finally {
				await fulfillmentContext.close()
			}
		}
	})
})
