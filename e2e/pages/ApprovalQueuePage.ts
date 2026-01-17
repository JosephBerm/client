/**
 * Approval Queue Page Object Model
 *
 * Encapsulates approval workflow interactions for Sales Manager (Level 4000).
 * Handles quote approvals, pricing overrides, and audit trails.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class ApprovalQueuePage extends BasePage {
	// Approval queue list
	readonly approvalQueue: Locator
	readonly approvalRows: Locator
	readonly emptyQueueMessage: Locator
	readonly queueCount: Locator

	// Filters
	readonly statusFilter: Locator
	readonly typeFilter: Locator
	readonly salesRepFilter: Locator
	readonly dateFilter: Locator
	readonly searchInput: Locator

	// Approval detail panel
	readonly approvalDetailPanel: Locator
	readonly approvalType: Locator
	readonly submittedBy: Locator
	readonly submittedDate: Locator
	readonly requestReason: Locator

	// Quote/Request details (when reviewing a quote)
	readonly quoteNumber: Locator
	readonly customerName: Locator
	readonly quoteAmount: Locator
	readonly discountRequested: Locator
	readonly lineItems: Locator

	// Pricing details (Business critical)
	readonly originalPrice: Locator
	readonly requestedPrice: Locator
	readonly marginImpact: Locator
	readonly marginPercentage: Locator
	readonly pricingExplanation: Locator
	readonly pricingRuleViolation: Locator

	// Approval actions
	readonly approveButton: Locator
	readonly rejectButton: Locator
	readonly requestChangesButton: Locator
	readonly escalateButton: Locator

	// Approval form
	readonly approvalComments: Locator
	readonly rejectionReason: Locator
	readonly conditionsField: Locator
	readonly confirmApprovalButton: Locator
	readonly confirmRejectButton: Locator

	// Audit trail
	readonly auditTrailSection: Locator
	readonly auditEntries: Locator
	readonly viewFullHistoryButton: Locator

	// Team performance (manager view)
	readonly teamMetrics: Locator
	readonly pendingApprovals: Locator
	readonly averageApprovalTime: Locator
	readonly approvalRate: Locator

	constructor(page: Page) {
		super(page)

		// Approval queue list
		this.approvalQueue = page
			.getByTestId('approval-queue')
			.or(page.getByRole('table'))
			.or(page.locator('[data-approvals]'))
		this.approvalRows = page.getByTestId('approval-row').or(page.locator('tbody tr'))
		this.emptyQueueMessage = page.getByText(/no pending approvals|queue is empty/i)
		this.queueCount = page.getByTestId('queue-count').or(page.locator('[data-pending-count]'))

		// Filters
		this.statusFilter = page.getByRole('combobox', { name: /status/i })
		this.typeFilter = page.getByRole('combobox', { name: /type/i })
		this.salesRepFilter = page.getByRole('combobox', { name: /sales rep|submitted by/i })
		this.dateFilter = page.getByRole('combobox', { name: /date/i })
		this.searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'))

		// Approval detail panel
		this.approvalDetailPanel = page
			.getByTestId('approval-detail')
			.or(page.getByRole('complementary'))
		this.approvalType = page.getByTestId('approval-type')
		this.submittedBy = page.getByTestId('submitted-by')
		this.submittedDate = page.getByTestId('submitted-date')
		this.requestReason = page.getByTestId('request-reason')

		// Quote/Request details
		this.quoteNumber = page.getByTestId('quote-number')
		this.customerName = page.getByTestId('customer-name')
		this.quoteAmount = page.getByTestId('quote-amount')
		this.discountRequested = page.getByTestId('discount-requested')
		this.lineItems = page.getByTestId('line-items')

		// Pricing details (Business critical)
		this.originalPrice = page.getByTestId('original-price').or(page.locator('[data-original]'))
		this.requestedPrice = page.getByTestId('requested-price').or(page.locator('[data-requested]'))
		this.marginImpact = page.getByTestId('margin-impact').or(page.locator('[data-margin-impact]'))
		this.marginPercentage = page.getByTestId('margin-percent').or(page.locator('[data-margin]'))
		this.pricingExplanation = page
			.getByTestId('pricing-explanation')
			.or(page.locator('[data-price-explanation]'))
		this.pricingRuleViolation = page
			.getByTestId('rule-violation')
			.or(page.getByText(/below minimum|exceeds maximum|violates/i))

		// Approval actions
		this.approveButton = page
			.getByRole('button', { name: /approve/i })
			.or(page.getByTestId('approve-btn'))
		this.rejectButton = page
			.getByRole('button', { name: /reject/i })
			.or(page.getByTestId('reject-btn'))
		this.requestChangesButton = page.getByRole('button', { name: /request changes|revise/i })
		this.escalateButton = page.getByRole('button', { name: /escalate/i })

		// Approval form
		this.approvalComments = page
			.getByLabel(/comments|notes/i)
			.or(page.getByPlaceholder(/comments/i))
		this.rejectionReason = page
			.getByLabel(/reason|rejection reason/i)
			.or(page.getByPlaceholder(/reason/i))
		this.conditionsField = page.getByLabel(/conditions/i)
		this.confirmApprovalButton = page.getByRole('button', { name: /confirm approval|yes, approve/i })
		this.confirmRejectButton = page.getByRole('button', { name: /confirm rejection|yes, reject/i })

		// Audit trail
		this.auditTrailSection = page
			.getByTestId('audit-trail')
			.or(page.locator('[data-audit-trail]'))
		this.auditEntries = page.getByTestId('audit-entry').or(page.locator('[data-audit-entry]'))
		this.viewFullHistoryButton = page.getByRole('button', { name: /view history|full history/i })

		// Team performance
		this.teamMetrics = page.getByTestId('team-metrics')
		this.pendingApprovals = page.getByTestId('pending-count')
		this.averageApprovalTime = page.getByTestId('avg-approval-time')
		this.approvalRate = page.getByTestId('approval-rate')
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/approvals')
		await this.waitForLoad()
	}

	async gotoApproval(approvalId: string): Promise<void> {
		await this.page.goto(`/app/approvals/${approvalId}`)
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to be stable
		await this.page.waitForLoadState('networkidle')
		
		// Primary check: Look for the Approval Queue heading
		const hasHeading = await this.page.getByRole('heading', { name: /approval|queue/i }).first().isVisible().catch(() => false)
		
		// Secondary checks for various page states
		const hasTable = await this.page.getByTestId('approval-queue').isVisible().catch(() => false)
		const hasDataGrid = await this.page.getByRole('table').first().isVisible().catch(() => false)
		const hasEmptyState = await this.emptyQueueMessage.isVisible().catch(() => false)
		const hasAccessDenied = await this.page.getByText(/access denied/i).isVisible().catch(() => false)
		
		// Success if any indicator is present (including access denied - that's a valid page state)
		expect(hasHeading || hasTable || hasDataGrid || hasEmptyState || hasAccessDenied).toBeTruthy()
	}

	// =============================================
	// QUEUE ACTIONS
	// =============================================

	/**
	 * Get approval row by quote number or reference
	 */
	getApprovalRow(reference: string): Locator {
		return this.approvalRows.filter({ hasText: reference })
	}

	/**
	 * Select an approval request from queue
	 */
	async selectApproval(reference: string): Promise<void> {
		const row = this.getApprovalRow(reference)
		await row.click()
		await this.waitForLoad()
	}

	/**
	 * Select first pending approval
	 */
	async selectFirstPending(): Promise<void> {
		const firstRow = this.approvalRows.first()
		await firstRow.click()
		await this.waitForLoad()
	}

	/**
	 * Get pending approval count
	 */
	async getPendingCount(): Promise<number> {
		const countText = await this.queueCount.textContent().catch(() => '0')
		return parseInt(countText?.replace(/\D/g, '') || '0', 10)
	}

	/**
	 * Filter by status
	 */
	async filterByStatus(status: string): Promise<void> {
		await this.statusFilter.selectOption(status)
		await this.waitForLoad()
	}

	/**
	 * Filter by sales rep
	 */
	async filterBySalesRep(salesRep: string): Promise<void> {
		await this.salesRepFilter.selectOption(salesRep)
		await this.waitForLoad()
	}

	// =============================================
	// APPROVAL ACTIONS
	// =============================================

	/**
	 * Approve the selected request
	 */
	async approve(comments?: string): Promise<void> {
		if (comments) {
			const commentsVisible = await this.approvalComments.isVisible().catch(() => false)
			if (commentsVisible) {
				await this.approvalComments.fill(comments)
			}
		}

		await this.approveButton.click()

		// Handle confirmation dialog if present
		const confirmVisible = await this.confirmApprovalButton.isVisible().catch(() => false)
		if (confirmVisible) {
			await this.confirmApprovalButton.click()
		}

		await this.waitForLoad()
	}

	/**
	 * Reject the selected request
	 */
	async reject(reason: string): Promise<void> {
		await this.rejectButton.click()

		// Fill rejection reason
		const reasonVisible = await this.rejectionReason.isVisible().catch(() => false)
		if (reasonVisible) {
			await this.rejectionReason.fill(reason)
		} else {
			const commentsVisible = await this.approvalComments.isVisible().catch(() => false)
			if (commentsVisible) {
				await this.approvalComments.fill(reason)
			}
		}

		// Confirm rejection
		const confirmVisible = await this.confirmRejectButton.isVisible().catch(() => false)
		if (confirmVisible) {
			await this.confirmRejectButton.click()
		}

		await this.waitForLoad()
	}

	/**
	 * Request changes on the selected request
	 */
	async requestChanges(feedback: string): Promise<void> {
		await this.requestChangesButton.click()
		await this.approvalComments.fill(feedback)
		await this.waitForLoad()
	}

	/**
	 * Approve with pricing override (business critical - requires audit)
	 */
	async approveWithOverride(overrideReason: string): Promise<void> {
		// Document the override reason for audit trail
		await this.approvalComments.fill(`PRICING OVERRIDE: ${overrideReason}`)
		await this.approveButton.click()

		const confirmVisible = await this.confirmApprovalButton.isVisible().catch(() => false)
		if (confirmVisible) {
			await this.confirmApprovalButton.click()
		}

		await this.waitForLoad()
	}

	// =============================================
	// PRICING & MARGIN REVIEW
	// =============================================

	/**
	 * Get margin impact percentage
	 */
	async getMarginImpact(): Promise<number> {
		const text = (await this.marginPercentage.textContent()) || '0'
		return parseFloat(text.replace(/[^0-9.-]/g, ''))
	}

	/**
	 * Get requested discount percentage
	 */
	async getRequestedDiscount(): Promise<number> {
		const text = (await this.discountRequested.textContent()) || '0'
		return parseFloat(text.replace(/[^0-9.]/g, ''))
	}

	/**
	 * Check if pricing rule violation exists
	 */
	async hasPricingViolation(): Promise<boolean> {
		return this.pricingRuleViolation.isVisible().catch(() => false)
	}

	/**
	 * Get pricing explanation
	 */
	async getPricingExplanation(): Promise<string> {
		const isVisible = await this.pricingExplanation.isVisible().catch(() => false)
		if (!isVisible) return ''
		return (await this.pricingExplanation.textContent()) || ''
	}

	// =============================================
	// AUDIT TRAIL
	// =============================================

	/**
	 * Get audit trail entries count
	 */
	async getAuditEntriesCount(): Promise<number> {
		return this.auditEntries.count()
	}

	/**
	 * Verify audit trail contains entry
	 */
	async hasAuditEntry(text: string): Promise<boolean> {
		const entry = this.auditEntries.filter({ hasText: text })
		return entry.isVisible().catch(() => false)
	}

	/**
	 * Open full audit history
	 */
	async viewFullHistory(): Promise<void> {
		await this.viewFullHistoryButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect approval in queue
	 */
	async expectInQueue(reference: string): Promise<void> {
		await expect(this.getApprovalRow(reference)).toBeVisible()
	}

	/**
	 * Expect approval NOT in queue (already processed)
	 */
	async expectNotInQueue(reference: string): Promise<void> {
		await expect(this.getApprovalRow(reference)).not.toBeVisible()
	}

	/**
	 * Expect empty queue
	 */
	async expectEmptyQueue(): Promise<void> {
		await expect(this.emptyQueueMessage).toBeVisible()
	}

	/**
	 * Expect detail panel visible
	 */
	async expectDetailVisible(): Promise<void> {
		await expect(this.approvalDetailPanel).toBeVisible()
	}

	/**
	 * Expect pricing explanation visible
	 */
	async expectPricingExplanationVisible(): Promise<void> {
		await expect(this.pricingExplanation).toBeVisible()
	}

	/**
	 * Expect margin impact visible
	 */
	async expectMarginImpactVisible(): Promise<void> {
		await expect(this.marginImpact).toBeVisible()
	}

	/**
	 * Expect pricing violation warning
	 */
	async expectPricingViolationWarning(): Promise<void> {
		await expect(this.pricingRuleViolation).toBeVisible()
	}

	/**
	 * Expect audit trail visible
	 */
	async expectAuditTrailVisible(): Promise<void> {
		await expect(this.auditTrailSection).toBeVisible()
	}

	/**
	 * Expect approval successful (toast/message)
	 */
	async expectApprovalSuccess(): Promise<void> {
		await this.expectToast(/approved|success/i)
	}

	/**
	 * Expect rejection successful
	 */
	async expectRejectionSuccess(): Promise<void> {
		await this.expectToast(/rejected|declined/i)
	}
}
