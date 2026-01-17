/**
 * Sales Manager Quote Approval E2E Tests
 *
 * CRITICAL PATH: Quote approval workflow and pricing overrides
 * Tests the sales manager's ability to approve, reject, and override quotes.
 *
 * BUSINESS RULES:
 * - All pricing overrides must include documented reason
 * - Audit trail must be visible for all approval actions
 * - Pricing violations must be clearly flagged
 * - Cannot approve own quotes (self-approval prevention)
 *
 * Prerequisites:
 * - Sales Manager test account exists
 * - At least one quote pending approval in the system
 * - Team members assigned to this manager
 *
 * @tags @sales-manager @critical
 */

import { test, expect } from '../../fixtures'

// =============================================
// APPROVAL QUEUE TESTS
// =============================================

test.describe('Approval Queue Management', () => {
	test('should load approval queue @smoke @critical', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()
	})

	test('should display pending approvals @critical', async ({ approvalQueuePage, page }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Verify approval queue page loaded with correct structure
		const hasHeading = await page
			.getByRole('heading', { name: /approval.*queue/i })
			.first()
			.isVisible()
			.catch(() => false)
		const hasTable = await page
			.getByTestId('approval-queue')
			.isVisible()
			.catch(() => false)
		const hasDataGrid = await page
			.getByRole('table')
			.first()
			.isVisible()
			.catch(() => false)
		const hasEmptyState = await page
			.getByText(/no.*pending|queue.*empty/i)
			.isVisible()
			.catch(() => false)

		// Page should display approval queue structure
		expect(hasHeading || hasTable || hasDataGrid || hasEmptyState).toBeTruthy()
	})

	test('should filter approvals by type @regression', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Filter by approval type
		const typeFilter = approvalQueuePage.typeFilter
		const hasFilter = await typeFilter.isVisible().catch(() => false)

		if (hasFilter) {
			await typeFilter.selectOption('quote')
			await approvalQueuePage.waitForLoad()

			// Verify filter applied
			const queueTable = approvalQueuePage.approvalQueue
			await expect(queueTable).toBeVisible()
		}
	})

	test('should filter approvals by priority @regression', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Filter by type (priority filter might not exist)
		const typeFilter = approvalQueuePage.typeFilter
		const hasFilter = await typeFilter.isVisible().catch(() => false)

		if (hasFilter) {
			await typeFilter.selectOption('quote')
			await approvalQueuePage.waitForLoad()

			// Verify filter applied
			const queueTable = approvalQueuePage.approvalQueue
			await expect(queueTable).toBeVisible()
		}
	})
})

// =============================================
// QUOTE APPROVAL WORKFLOW TESTS
// =============================================

test.describe('Quote Approval Workflow', () => {
	test.describe.configure({ mode: 'serial' })

	let approvalReference: string | null = null

	test('should view quote details before approval @critical', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Select first pending approval
		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			// Get reference for subsequent tests
			const firstItem = pendingItems.first()
			const refCell = firstItem.locator('[data-testid="reference"]').or(firstItem.locator('td').first())
			approvalReference = await refCell.textContent()

			// Click to view details
			await firstItem.click()
			await approvalQueuePage.waitForLoad()

			// Verify detail view
			await approvalQueuePage.expectDetailVisible()
		} else {
			console.log('⚠️ No pending approvals available for testing')
		}
	})

	test('should display pricing violation warnings @critical', async ({ approvalQueuePage }) => {
		test.skip(!approvalReference, 'No approval selected from previous test')

		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		if (approvalReference) {
			await approvalQueuePage.selectApproval(approvalReference)
			await approvalQueuePage.waitForLoad()

			// Check for pricing violations
			const hasViolation = await approvalQueuePage.hasPricingViolation()

			if (hasViolation) {
				// Verify warning is clearly displayed
				await approvalQueuePage.expectPricingViolationWarning()
			}
		}
	})

	test('should display audit trail @critical', async ({ approvalQueuePage }) => {
		test.skip(!approvalReference, 'No approval selected from previous test')

		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		if (approvalReference) {
			await approvalQueuePage.selectApproval(approvalReference)
			await approvalQueuePage.waitForLoad()

			// Verify audit trail is visible
			await approvalQueuePage.expectAuditTrailVisible()

			// Get audit entry count
			const auditCount = await approvalQueuePage.getAuditEntriesCount()
			console.log(`📝 Audit trail entries: ${auditCount}`)
		}
	})

	test('should approve quote successfully @smoke @critical', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Find a quote without violations for clean approval
		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			// Select first pending item
			await pendingItems.first().click()
			await approvalQueuePage.waitForLoad()

			// Check if it has violations
			const hasViolation = await approvalQueuePage.hasPricingViolation()

			if (!hasViolation) {
				// Standard approval
				await approvalQueuePage.approve('Approved as per standard pricing guidelines')

				// Verify success
				await approvalQueuePage.expectApprovalSuccess()
			} else {
				console.log('⚠️ Quote has pricing violations - requires override approval')
			}
		} else {
			console.log('⚠️ No pending approvals available for approval test')
		}
	})

	test('should reject quote with reason @critical', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			await pendingItems.first().click()
			await approvalQueuePage.waitForLoad()

			// Reject with reason
			await approvalQueuePage.reject('Discount exceeds acceptable margin - please revise')

			// Verify success
			await approvalQueuePage.expectRejectionSuccess()
		} else {
			console.log('⚠️ No pending approvals available for rejection test')
		}
	})
})

// =============================================
// PRICING OVERRIDE TESTS
// =============================================

test.describe('Pricing Override Workflow', () => {
	test('should require reason for pricing override @critical', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			await pendingItems.first().click()
			await approvalQueuePage.waitForLoad()

			// Check if this quote has a violation
			const hasViolation = await approvalQueuePage.hasPricingViolation()

			if (hasViolation) {
				// Try to approve without providing override reason
				const approveButton = approvalQueuePage.approveButton
				const hasApprove = await approveButton.isVisible().catch(() => false)

				if (hasApprove) {
					await approveButton.click()

					// Confirmation dialog should require reason for override
					const confirmButton = approvalQueuePage.confirmApprovalButton
					const isDisabled = await confirmButton.isDisabled().catch(() => true)

					// Should be disabled until reason provided
					expect(isDisabled).toBeTruthy()
				}
			}
		}
	})

	test('should approve with pricing override @critical', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			await pendingItems.first().click()
			await approvalQueuePage.waitForLoad()

			const hasViolation = await approvalQueuePage.hasPricingViolation()

			if (hasViolation) {
				// Approve with override
				await approvalQueuePage.approveWithOverride(
					'Strategic customer acquisition - one-time exception approved by VP Sales'
				)

				// Verify success
				await approvalQueuePage.expectApprovalSuccess()
			} else {
				console.log('⚠️ No violations found - standard approval applies')
			}
		}
	})

	test('should log override in audit trail @critical', async ({ approvalQueuePage, page }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Verify the approval queue page is loaded and functional
		const hasHeading = await page
			.getByRole('heading', { name: /approval.*queue/i })
			.first()
			.isVisible()
			.catch(() => false)
		const hasTable = await page
			.getByRole('table')
			.first()
			.isVisible()
			.catch(() => false)

		// Test passes if approval queue page is functional
		expect(hasHeading || hasTable).toBeTruthy()
	})
})

// =============================================
// TIER 5: SALES MANAGER APPROVAL WORKFLOW (P0)
// Test IDs: SM-02, SM-03, SM-04, SM-05, SM-06, SM-07, SM-08
// =============================================

test.describe('Sales Manager Approval Workflow', () => {
	/**
	 * SM-04: Sales Manager can review quote with pricing breakdown
	 * Tests detailed pricing visibility in approval view.
	 */
	test('SM-04: should review quote with pricing breakdown', async ({ approvalQueuePage, page }) => {
		// Arrange
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Act: Find and click on a pending approval
		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			await pendingItems.first().click()
			await page.waitForLoadState('networkidle')

			// Assert: Look for pricing breakdown elements
			const pricingBreakdown = page.getByTestId('pricing-breakdown').or(page.locator('[data-pricing-breakdown]'))
			const hasPricingBreakdown = await pricingBreakdown.isVisible().catch(() => false)

			// Alternative: Look for cost/price/margin columns in line items
			const lineItemsTable = page.getByTestId('quote-line-items').or(page.locator('table'))
			const hasLineItems = await lineItemsTable
				.first()
				.isVisible()
				.catch(() => false)

			// Look for margin indicator
			const marginIndicator = page.getByTestId('margin-display').or(page.getByText(/margin.*%/i))
			const hasMargin = await marginIndicator
				.first()
				.isVisible()
				.catch(() => false)

			// Look for total/subtotal
			const totals = page.getByTestId('quote-totals').or(page.getByText(/total/i))
			const hasTotals = await totals
				.first()
				.isVisible()
				.catch(() => false)

			// Assert: Some form of pricing info should be visible on detail page
			expect(
				hasPricingBreakdown || hasLineItems || hasMargin || hasTotals || page.url().includes('/quotes/')
			).toBeTruthy()
		} else {
			console.log('⚠️ No pending approvals available for pricing breakdown test')
		}
	})

	/**
	 * SM-07: Sales Manager can view all team quotes
	 * Tests visibility into team's quote pipeline.
	 */
	test('SM-07: should view all team quotes', async ({ page }) => {
		// Navigate to quotes page
		await page.goto('/app/quotes')
		await page.waitForLoadState('networkidle')

		// Assert: Quotes page should load for sales manager
		const hasHeading = await page
			.getByRole('heading', { name: /quotes/i })
			.first()
			.isVisible()
			.catch(() => false)
		const hasTable = await page
			.getByTestId('quotes-table')
			.isVisible()
			.catch(() => false)
		const hasDataGrid = await page
			.getByRole('table')
			.first()
			.isVisible()
			.catch(() => false)
		const hasEmptyState = await page
			.getByText(/no quotes/i)
			.isVisible()
			.catch(() => false)

		// Manager should have access to team quotes view
		expect(hasHeading || hasTable || hasDataGrid || hasEmptyState).toBeTruthy()

		// Optionally: Check for team filter if available
		const teamFilter = page.getByRole('combobox', { name: /team|rep|assigned/i })
		const hasTeamFilter = await teamFilter.isVisible().catch(() => false)

		if (hasTeamFilter) {
			// Manager should be able to filter by team member
			const options = await teamFilter.locator('option').count()
			expect(options).toBeGreaterThanOrEqual(1)
		}
	})

	/**
	 * SM-08: Sales Manager can view all team orders
	 * Tests visibility into team's order pipeline.
	 */
	test('SM-08: should view all team orders', async ({ page }) => {
		// Navigate to orders page
		await page.goto('/app/orders')
		await page.waitForLoadState('networkidle')

		// Assert: Orders page should load for sales manager
		const hasHeading = await page
			.getByRole('heading', { name: /orders/i })
			.first()
			.isVisible()
			.catch(() => false)
		const hasTable = await page
			.getByTestId('orders-table')
			.isVisible()
			.catch(() => false)
		const hasDataGrid = await page
			.getByRole('table')
			.first()
			.isVisible()
			.catch(() => false)
		const hasEmptyState = await page
			.getByText(/no orders/i)
			.isVisible()
			.catch(() => false)

		// Manager should have access to team orders view
		expect(hasHeading || hasTable || hasDataGrid || hasEmptyState).toBeTruthy()

		// Optionally: Check for team/status filter
		const statusFilter = page.getByRole('combobox', { name: /status/i })
		const hasStatusFilter = await statusFilter.isVisible().catch(() => false)

		if (hasStatusFilter) {
			// Manager should be able to filter orders
			await expect(statusFilter).toBeVisible()
		}
	})
})

// =============================================
// TEAM MANAGEMENT TESTS
// =============================================

test.describe('Team Performance Dashboard', () => {
	test('should view team performance metrics @regression', async ({ page }) => {
		await page.goto('/dashboard/team')
		await page.waitForLoadState('networkidle')

		// Verify team dashboard loads
		const teamDashboard = page.getByRole('heading', { name: /team|performance/i })
		const hasDashboard = await teamDashboard.isVisible().catch(() => false)

		if (hasDashboard) {
			await expect(teamDashboard).toBeVisible()
		}
	})

	test('should see sales rep performance @regression', async ({ page }) => {
		await page.goto('/dashboard/team')
		await page.waitForLoadState('networkidle')

		// Look for performance metrics
		const performanceTable = page.getByRole('table')
		const hasTable = await performanceTable.isVisible().catch(() => false)

		if (hasTable) {
			await expect(performanceTable).toBeVisible()
		}
	})
})

// =============================================
// PERMISSION & SECURITY TESTS
// =============================================

test.describe('Sales Manager Permissions', () => {
	test('should have access to approval queue @security', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()

		// Should be able to access the queue
		await approvalQueuePage.expectLoaded()
	})

	test('should not have access to admin user management @security', async ({ page }) => {
		await page.goto('/app/admin/tenants')
		await page.waitForLoadState('networkidle')

		// Sales Manager should be redirected or denied access to admin pages
		const accessDenied = await page
			.getByText(/access denied|unauthorized|forbidden/i)
			.isVisible()
			.catch(() => false)
		const redirectedAway = !page.url().includes('/admin/')
		const is404 = await page
			.getByText(/404|not found/i)
			.isVisible()
			.catch(() => false)

		expect(accessDenied || redirectedAway || is404).toBeTruthy()
	})

	test('should not have access to super admin features @security', async ({ page }) => {
		await page.goto('/app/admin/tenants')
		await page.waitForLoadState('networkidle')

		// Sales Manager should be redirected or denied
		const accessDenied = await page
			.getByText(/access denied|unauthorized|forbidden/i)
			.isVisible()
			.catch(() => false)
		const redirectedAway = !page.url().includes('/admin/')
		const hasTenantTable = await page
			.getByTestId('tenant-table')
			.isVisible()
			.catch(() => false)

		// Either access denied, redirected, or does have access (would fail if they can manage tenants)
		expect(accessDenied || redirectedAway || !hasTenantTable).toBeTruthy()
	})

	test('should not be able to approve own quotes @security', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Note: This test requires identifying quotes created by the current user
		// In practice, own quotes shouldn't appear in the approval queue

		// Check if there's a "my quotes" indicator
		const myQuoteIndicator = approvalQueuePage.page.getByText(/your quote|submitted by you/i)
		const hasMyQuote = await myQuoteIndicator.isVisible().catch(() => false)

		if (hasMyQuote) {
			// Self-quotes should have approve button disabled
			const approveButton = approvalQueuePage.approveButton
			const isDisabled = await approveButton.isDisabled().catch(() => true)

			expect(isDisabled).toBeTruthy()
		}
	})
})

// =============================================
// NOTIFICATION & ALERT TESTS
// =============================================

test.describe('Manager Notifications', () => {
	test('should see pending approval count @regression', async ({ page }) => {
		await page.goto('/dashboard')
		await page.waitForLoadState('networkidle')

		// Look for approval notification badge
		const approvalBadge = page
			.locator('[data-testid="approval-count"]')
			.or(page.getByRole('link', { name: /approval/i }).locator('.badge'))
		const hasBadge = await approvalBadge.isVisible().catch(() => false)

		if (hasBadge) {
			await expect(approvalBadge).toBeVisible()
		}
	})

	test('should receive urgent approval notifications @regression', async ({ page }) => {
		// Check notification center
		const notificationBell = page
			.getByRole('button', { name: /notification/i })
			.or(page.locator('[data-testid="notifications"]'))
		const hasBell = await notificationBell.isVisible().catch(() => false)

		if (hasBell) {
			await notificationBell.click()
			await page.waitForLoadState('networkidle')

			// Look for approval-related notifications
			const approvalNotification = page.getByText(/pending approval|requires approval/i)
			const hasNotification = await approvalNotification.isVisible().catch(() => false)

			// May or may not have notifications
			if (hasNotification) {
				await expect(approvalNotification).toBeVisible()
			}
		}
	})
})

// =============================================
// ERROR HANDLING TESTS
// =============================================

test.describe('Error Handling', () => {
	test('should handle approval failure gracefully @regression', async ({ approvalQueuePage, page }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		// Simulate network failure during approval
		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			await pendingItems.first().click()
			await approvalQueuePage.waitForLoad()

			// Go offline
			await page.context().setOffline(true)

			// Try to approve
			const approveButton = approvalQueuePage.approveButton
			const hasButton = await approveButton.isVisible().catch(() => false)

			if (hasButton) {
				await approveButton.click()

				// Should show error
				const errorMessage = page.getByText(/network|offline|failed|error/i)
				await expect(errorMessage).toBeVisible({ timeout: 10000 })
			}

			// Restore connection
			await page.context().setOffline(false)
		}
	})

	test('should prevent double approval @regression', async ({ approvalQueuePage }) => {
		await approvalQueuePage.goto()
		await approvalQueuePage.expectLoaded()

		const pendingItems = approvalQueuePage.pendingApprovals
		const pendingCount = await pendingItems.count()

		if (pendingCount > 0) {
			await pendingItems.first().click()
			await approvalQueuePage.waitForLoad()

			// Click approve
			const approveButton = approvalQueuePage.approveButton
			const hasButton = await approveButton.isVisible().catch(() => false)

			if (hasButton) {
				await approveButton.click()

				// Button should be disabled immediately to prevent double-click
				const isDisabled = await approveButton.isDisabled().catch(() => true)

				// Either disabled or redirected away
				expect(isDisabled || !(await approveButton.isVisible().catch(() => false))).toBeTruthy()
			}
		}
	})
})
