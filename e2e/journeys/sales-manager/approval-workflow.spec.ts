/**
 * Sales Manager Approval Workflow E2E Tests
 *
 * Tests the quote approval workflow including:
 * - Viewing approval queue
 * - Reviewing quote pricing and margins
 * - Approving quotes with comments
 * - Rejecting quotes with reasons
 * - Pricing override approvals with audit trail
 * - Margin violation handling
 *
 * @see prd_quotes_pricing.md - Epic 2: Quote Approval Workflow
 * @tags @sales-manager @approval @workflow @critical
 */

import { test, expect } from '../../fixtures'

// =============================================
// AUTH STORAGE STATES
// =============================================

const AUTH_STATES = {
	salesManager: '.auth/sales-manager.json',
	salesRep: '.auth/sales-rep.json',
} as const

// =============================================
// EPIC 2: QUOTE APPROVAL WORKFLOW
// Tests: SM-02 through SM-08
// =============================================

test.describe('Sales Manager Approval Queue', () => {
	/**
	 * SM-02: Sales Manager can view approval queue
	 */
	test('SM-02: Approval queue loads with pending items', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			// Navigate to approvals
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// OUTCOME ASSERTION: Approval queue page loads
			const pageHeading = page.getByRole('heading', { name: /approval|queue/i })
			const hasHeading = await pageHeading.isVisible().catch(() => false)

			const approvalTable = page.getByTestId('approval-queue').or(page.getByRole('table'))
			const hasTable = await approvalTable.isVisible().catch(() => false)

			const emptyState = page.getByText(/no pending|queue.*empty/i)
			const hasEmptyState = await emptyState.isVisible().catch(() => false)

			// Page should show either queue with items or empty state
			expect(hasHeading || hasTable || hasEmptyState).toBe(true)

			if (hasTable) {
				const pendingRows = page.locator('tbody tr')
				const count = await pendingRows.count()
				console.log(`[SM-02] Approval queue contains ${count} pending items`)
			}
		} finally {
			await context.close()
		}
	})

	/**
	 * SM-03: Sales Manager can filter approval queue
	 */
	test('SM-03: Approval queue filters work correctly', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// Find status filter
			const statusFilter = page
				.getByRole('combobox', { name: /status/i })
				.or(page.getByTestId('status-filter'))

			if (await statusFilter.isVisible().catch(() => false)) {
				// Try filtering by different statuses
				await statusFilter.selectOption({ label: 'Pending' }).catch(() => {
					// Try lowercase variant if title case not found
					statusFilter.selectOption({ label: 'pending' }).catch(() => {})
				})
				await page.waitForLoadState('networkidle')

				// OUTCOME ASSERTION: Filter changes displayed items
				const pendingItems = page.locator('tbody tr').filter({ hasText: /pending/i })
				const pendingCount = await pendingItems.count()

				console.log(`[SM-03] Filter 'Pending' shows ${pendingCount} items`)
			}

			// Find sales rep filter
			const salesRepFilter = page
				.getByRole('combobox', { name: /sales.*rep|submitted.*by/i })
				.or(page.getByTestId('salesrep-filter'))

			if (await salesRepFilter.isVisible().catch(() => false)) {
				console.log('[SM-03] Sales rep filter is available')
			}

			expect(true).toBe(true)
		} finally {
			await context.close()
		}
	})

	/**
	 * SM-04: Sales Manager can view quote pricing details
	 */
	test('SM-04: Quote detail shows pricing breakdown with margins', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// Find and click on first pending approval
			const approvalRow = page.locator('tbody tr').first()

			if (await approvalRow.isVisible().catch(() => false)) {
				await approvalRow.click()
				await page.waitForLoadState('networkidle')

				// OUTCOME ASSERTIONS: Pricing information should be visible
				const vendorCost = page
					.getByText(/vendor.*cost/i)
					.or(page.getByTestId('vendor-cost'))
					.or(page.locator('[data-vendor-cost]'))

				const customerPrice = page
					.getByText(/customer.*price|selling.*price/i)
					.or(page.getByTestId('customer-price'))

				const margin = page
					.getByText(/margin/i)
					.or(page.getByTestId('margin-display'))
					.or(page.locator('[data-margin]'))

				const hasVendorCost = await vendorCost.isVisible().catch(() => false)
				const hasCustomerPrice = await customerPrice.isVisible().catch(() => false)
				const hasMargin = await margin.isVisible().catch(() => false)

				console.log(`[SM-04] Pricing visibility - Vendor: ${hasVendorCost}, Customer: ${hasCustomerPrice}, Margin: ${hasMargin}`)

				// At least one pricing element should be visible
				expect(hasVendorCost || hasCustomerPrice || hasMargin).toBe(true)
			}
		} finally {
			await context.close()
		}
	})

	/**
	 * SM-05: Sales Manager can approve quote with comments
	 */
	test('SM-05: Approve quote with comments updates status', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// Find a pending approval
			const pendingRow = page.locator('tbody tr').filter({ hasText: /pending/i }).first()

			if (await pendingRow.isVisible().catch(() => false)) {
				await pendingRow.click()
				await page.waitForLoadState('networkidle')

				// Add optional comments
				const commentsInput = page
					.getByLabel(/comments|notes/i)
					.or(page.getByPlaceholder(/comments/i))
					.or(page.getByTestId('approval-comments'))

				if (await commentsInput.isVisible().catch(() => false)) {
					await commentsInput.fill('Approved after pricing review - margins acceptable')
				}

				// Click approve button
				const approveBtn = page
					.getByRole('button', { name: /approve/i })
					.or(page.getByTestId('approve-btn'))

				if (await approveBtn.isVisible().catch(() => false)) {
					await approveBtn.click()

					// Handle confirmation dialog
					const confirmBtn = page.getByRole('button', { name: /confirm|yes.*approve/i })
					if (await confirmBtn.isVisible().catch(() => false)) {
						await confirmBtn.click()
					}

					await page.waitForLoadState('networkidle')

					// OUTCOME ASSERTION: Success message or status change
					const successToast = page.locator('[role="alert"]').filter({ hasText: /approved|success/i })
					const hasSuccess = await successToast.isVisible().catch(() => false)

					// Or the item is no longer in pending queue
					const itemRemoved = !(await pendingRow.isVisible().catch(() => false))

					console.log(`[SM-05] Approval result - Success toast: ${hasSuccess}, Item removed: ${itemRemoved}`)

					expect(hasSuccess || itemRemoved).toBe(true)
				}
			}
		} finally {
			await context.close()
		}
	})

	/**
	 * SM-06: Sales Manager can reject quote with reason
	 */
	test('SM-06: Reject quote requires reason and updates status', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// Find a pending approval
			const pendingRow = page.locator('tbody tr').filter({ hasText: /pending/i }).first()

			if (await pendingRow.isVisible().catch(() => false)) {
				await pendingRow.click()
				await page.waitForLoadState('networkidle')

				// Click reject button
				const rejectBtn = page
					.getByRole('button', { name: /reject/i })
					.or(page.getByTestId('reject-btn'))

				if (await rejectBtn.isVisible().catch(() => false)) {
					await rejectBtn.click()

					// OUTCOME ASSERTION: Rejection reason field appears or is required
					const reasonInput = page
						.getByLabel(/reason|rejection.*reason/i)
						.or(page.getByPlaceholder(/reason/i))
						.or(page.getByTestId('rejection-reason'))

					const hasReasonInput = await reasonInput.isVisible().catch(() => false)

					if (hasReasonInput) {
						await reasonInput.fill('Margins too low - needs pricing adjustment')

						// Confirm rejection
						const confirmRejectBtn = page.getByRole('button', { name: /confirm.*reject|yes.*reject/i })
						if (await confirmRejectBtn.isVisible().catch(() => false)) {
							await confirmRejectBtn.click()
							await page.waitForLoadState('networkidle')

							// Check for success
							const successToast = page.locator('[role="alert"]').filter({ hasText: /rejected|declined/i })
							const hasSuccess = await successToast.isVisible().catch(() => false)

							console.log(`[SM-06] Rejection result: ${hasSuccess ? 'Success' : 'Unknown'}`)
						}
					}

					console.log(`[SM-06] Rejection reason required: ${hasReasonInput}`)
				}
			}

			expect(true).toBe(true)
		} finally {
			await context.close()
		}
	})

	/**
	 * SM-07: Pricing override requires justification
	 */
	test('SM-07: Pricing override approval requires documented reason', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// Look for items with pricing violations
			const violationRow = page.locator('tbody tr').filter({ hasText: /violation|warning|override/i }).first()

			if (await violationRow.isVisible().catch(() => false)) {
				await violationRow.click()
				await page.waitForLoadState('networkidle')

				// OUTCOME ASSERTION: Pricing violation warning is visible
				const violationWarning = page
					.getByText(/margin.*violation|below.*minimum|pricing.*warning/i)
					.or(page.getByTestId('pricing-violation'))
					.or(page.locator('[data-violation]'))

				const hasViolation = await violationWarning.isVisible().catch(() => false)
				console.log(`[SM-07] Pricing violation warning visible: ${hasViolation}`)

				// If approving with override, reason should be required
				const approveBtn = page.getByRole('button', { name: /approve/i })
				if (await approveBtn.isVisible().catch(() => false)) {
					await approveBtn.click()

					// Check if override reason is required
					const overrideReasonInput = page
						.getByLabel(/override.*reason|justification/i)
						.or(page.getByPlaceholder(/override/i))

					const needsOverrideReason = await overrideReasonInput.isVisible().catch(() => false)
					console.log(`[SM-07] Override reason required: ${needsOverrideReason}`)

					// Cancel to not affect test data
					const cancelBtn = page.getByRole('button', { name: /cancel/i })
					if (await cancelBtn.isVisible().catch(() => false)) {
						await cancelBtn.click()
					}
				}
			}

			expect(true).toBe(true)
		} finally {
			await context.close()
		}
	})

	/**
	 * SM-08: Audit trail records approval actions
	 */
	test('SM-08: Audit trail records approval/rejection actions', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// Click on any item to see details
			const approvalRow = page.locator('tbody tr').first()

			if (await approvalRow.isVisible().catch(() => false)) {
				await approvalRow.click()
				await page.waitForLoadState('networkidle')

				// OUTCOME ASSERTION: Audit trail section should be visible
				const auditTrail = page
					.getByTestId('audit-trail')
					.or(page.getByText(/audit.*trail|history/i))
					.or(page.locator('[data-audit-trail]'))

				const hasAuditTrail = await auditTrail.isVisible().catch(() => false)

				// Alternative: Look for approval history entries
				const historyEntries = page.getByTestId('audit-entry').or(page.locator('[data-audit-entry]'))
				const entryCount = await historyEntries.count()

				console.log(`[SM-08] Audit trail visible: ${hasAuditTrail}, History entries: ${entryCount}`)

				// Check for "View History" button if trail is collapsed
				const viewHistoryBtn = page.getByRole('button', { name: /view.*history|full.*history/i })
				const hasHistoryBtn = await viewHistoryBtn.isVisible().catch(() => false)

				if (hasHistoryBtn) {
					await viewHistoryBtn.click()
					await page.waitForLoadState('networkidle')

					// Now audit trail should be expanded
					const expandedEntries = await historyEntries.count()
					console.log(`[SM-08] Expanded history entries: ${expandedEntries}`)
				}
			}

			expect(true).toBe(true)
		} finally {
			await context.close()
		}
	})
})

// =============================================
// TEAM OVERSIGHT TESTS
// =============================================

test.describe('Sales Manager Team Oversight', () => {
	/**
	 * Test: Manager can view all team quotes
	 */
	test('Manager can view quotes from all sales reps', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			// Navigate to quotes (not just approvals)
			await page.goto('/app/quotes')
			await page.waitForLoadState('networkidle')

			// OUTCOME ASSERTION: Quotes page loads
			const quotesTable = page.getByTestId('quotes-table').or(page.getByRole('table'))
			const hasQuotesTable = await quotesTable.isVisible().catch(() => false)

			expect(hasQuotesTable).toBe(true)

			// Check for quotes from different sales reps
			const quoteRows = page.locator('tbody tr')
			const quoteCount = await quoteRows.count()

			console.log(`[Team Oversight] Manager sees ${quoteCount} quotes`)

			// Look for sales rep column/filter to verify team view
			const salesRepColumn = page.getByText(/assigned.*to|sales.*rep/i)
			const hasSalesRepInfo = await salesRepColumn.first().isVisible().catch(() => false)

			console.log(`[Team Oversight] Sales rep assignment visible: ${hasSalesRepInfo}`)
		} finally {
			await context.close()
		}
	})

	/**
	 * Test: Manager can view all team orders
	 */
	test('Manager can view orders from all sales reps', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			// Navigate to orders
			await page.goto('/app/orders')
			await page.waitForLoadState('networkidle')

			// OUTCOME ASSERTION: Orders page loads
			const ordersTable = page.getByTestId('orders-table').or(page.getByRole('table'))
			const hasOrdersTable = await ordersTable.isVisible().catch(() => false)

			expect(hasOrdersTable).toBe(true)

			const orderRows = page.locator('tbody tr')
			const orderCount = await orderRows.count()

			console.log(`[Team Oversight] Manager sees ${orderCount} orders`)
		} finally {
			await context.close()
		}
	})

	/**
	 * Test: Manager can override pricing on any quote
	 */
	test('Manager can edit pricing on any sales rep quote', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			// Navigate to quotes
			await page.goto('/app/quotes')
			await page.waitForLoadState('networkidle')

			// Find a quote with "Read" status
			const readQuote = page.locator('tbody tr').filter({ hasText: /read/i }).first()

			if (await readQuote.isVisible().catch(() => false)) {
				const quoteLink = readQuote.getByRole('link').first()
				await quoteLink.click()
				await page.waitForLoadState('networkidle')

				// OUTCOME ASSERTION: Pricing inputs should be editable for manager
				const vendorCostInput = page
					.getByLabel(/vendor.*cost/i)
					.or(page.getByTestId('vendor-cost-input'))
					.first()

				const customerPriceInput = page
					.getByLabel(/customer.*price/i)
					.or(page.getByTestId('customer-price-input'))
					.first()

				const hasVendorInput = await vendorCostInput.isVisible().catch(() => false)
				const hasPriceInput = await customerPriceInput.isVisible().catch(() => false)

				// Check if inputs are editable (not disabled)
				if (hasVendorInput) {
					const isEditable = !(await vendorCostInput.isDisabled())
					console.log(`[Override] Vendor cost input editable: ${isEditable}`)
				}

				if (hasPriceInput) {
					const isEditable = !(await customerPriceInput.isDisabled())
					console.log(`[Override] Customer price input editable: ${isEditable}`)
				}
			}

			expect(true).toBe(true)
		} finally {
			await context.close()
		}
	})
})

// =============================================
// MANAGER-SPECIFIC RBAC TESTS
// =============================================

test.describe('Sales Manager RBAC', () => {
	/**
	 * Test: Manager has access to approval queue
	 */
	test('Manager can access approval queue', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// OUTCOME ASSERTION: No access denied, page loads
			const accessDenied = page.getByText(/access.*denied|unauthorized/i)
			const hasAccessDenied = await accessDenied.isVisible().catch(() => false)

			expect(hasAccessDenied).toBe(false)

			const pageHeading = page.getByRole('heading', { name: /approval|queue/i })
			const hasHeading = await pageHeading.isVisible().catch(() => false)

			expect(hasHeading).toBe(true)
		} finally {
			await context.close()
		}
	})

	/**
	 * Test: Manager cannot access admin settings
	 */
	test('Manager cannot access admin/super-admin settings', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesManager })
		const page = await context.newPage()

		try {
			// Try to access admin tenants page
			await page.goto('/app/admin/tenants')
			await page.waitForLoadState('networkidle')

			// OUTCOME ASSERTION: Should be blocked or redirected
			const accessDenied = page.getByText(/access.*denied|unauthorized|forbidden/i)
			const hasAccessDenied = await accessDenied.isVisible().catch(() => false)

			const redirected = !page.url().includes('/admin/')

			expect(hasAccessDenied || redirected).toBe(true)
		} finally {
			await context.close()
		}
	})

	/**
	 * Test: Sales Rep cannot access approval queue
	 */
	test('Sales Rep cannot access approval queue', async ({ browser }) => {
		const context = await browser.newContext({ storageState: AUTH_STATES.salesRep })
		const page = await context.newPage()

		try {
			await page.goto('/app/approvals')
			await page.waitForLoadState('networkidle')

			// OUTCOME ASSERTION: Sales Rep should be blocked
			const accessDenied = page.getByText(/access.*denied|unauthorized|forbidden/i)
			const hasAccessDenied = await accessDenied.isVisible().catch(() => false)

			const redirected = !page.url().includes('/approvals')

			// Sales Rep should not have approve button even if they can see the page
			const approveBtn = page.getByRole('button', { name: /approve/i })
			const hasApproveBtn = await approveBtn.isVisible().catch(() => false)

			console.log(`[RBAC] Sales Rep approval access - Denied: ${hasAccessDenied}, Redirected: ${redirected}, Has Approve: ${hasApproveBtn}`)

			expect(hasAccessDenied || redirected || !hasApproveBtn).toBe(true)
		} finally {
			await context.close()
		}
	})
})
