/**
 * Tenants Page Object Model
 *
 * Encapsulates multi-tenant management interactions for Super Admin role.
 * Handles tenant CRUD operations, configuration, and platform settings.
 *
 * BUSINESS RULES:
 * - Only Super Admin (Level 9999) can access tenant management
 * - Tenant creation requires unique domain/identifier
 * - Tenant deletion is soft-delete with recovery period
 * - White-label settings have defined boundaries
 *
 * @see 04-role-journeys.md - Super Admin Journey section
 */

import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

export class TenantsPage extends BasePage {
	// =============================================
	// LOCATORS - Tenant List
	// =============================================

	/** Main tenant table */
	readonly tenantTable: Locator

	/** Individual tenant rows */
	readonly tenantRows: Locator

	/** Search input for filtering tenants */
	readonly searchInput: Locator

	/** Status filter dropdown */
	readonly statusFilter: Locator

	/** Add tenant button */
	readonly addTenantButton: Locator

	// =============================================
	// LOCATORS - Tenant Form
	// =============================================

	/** Tenant creation/edit form */
	readonly tenantForm: Locator

	/** Tenant name input */
	readonly tenantNameInput: Locator

	/** Tenant domain/subdomain input */
	readonly domainInput: Locator

	/** Tenant identifier input */
	readonly identifierInput: Locator

	/** Subscription tier select */
	readonly subscriptionTierSelect: Locator

	/** Max users input */
	readonly maxUsersInput: Locator

	/** Submit button */
	readonly submitButton: Locator

	/** Cancel button */
	readonly cancelButton: Locator

	// =============================================
	// LOCATORS - Tenant Detail
	// =============================================

	/** Tenant detail view container */
	readonly tenantDetailView: Locator

	/** Tenant status indicator */
	readonly tenantStatusIndicator: Locator

	/** Edit tenant button */
	readonly editButton: Locator

	/** Save button */
	readonly saveButton: Locator

	/** Suspend tenant button */
	readonly suspendButton: Locator

	/** Activate tenant button */
	readonly activateButton: Locator

	/** Delete tenant button */
	readonly deleteButton: Locator

	// =============================================
	// LOCATORS - Configuration
	// =============================================

	/** Configuration tab/section */
	readonly configurationTab: Locator

	/** White-label settings section */
	readonly whiteLabelSection: Locator

	/** Logo upload input */
	readonly logoUploadInput: Locator

	/** Primary color input */
	readonly primaryColorInput: Locator

	/** Company name override input */
	readonly companyNameInput: Locator

	/** Feature toggles section */
	readonly featureTogglesSection: Locator

	// =============================================
	// LOCATORS - Feedback
	// =============================================

	/** Success message */
	readonly successMessage: Locator

	/** Error message */
	readonly errorMessage: Locator

	/** Validation error */
	readonly validationError: Locator

	/** Domain validation error */
	readonly domainValidationError: Locator

	/** Confirmation dialog */
	readonly confirmationDialog: Locator

	/** Confirm button in dialog */
	readonly confirmButton: Locator

	constructor(page: Page) {
		super(page)

		// Tenant List
		this.tenantTable = page.getByRole('table').or(page.locator('[data-testid="tenant-table"]'))
		this.tenantRows = this.tenantTable.locator('tbody tr').or(page.locator('[data-testid="tenant-row"]'))
		this.searchInput = page.getByPlaceholder(/search|filter/i).or(page.locator('[data-testid="tenant-search"]'))
		this.statusFilter = page.getByLabel(/status/i).or(page.locator('[data-testid="status-filter"]'))
		this.addTenantButton = page.getByRole('button', { name: /add|create|new/i }).or(
			page.locator('[data-testid="add-tenant"]')
		)

		// Tenant Form
		this.tenantForm = page.locator('form').or(page.locator('[data-testid="tenant-form"]'))
		this.tenantNameInput = page.getByLabel(/tenant name|name/i).or(page.locator('[data-testid="tenant-name"]'))
		this.domainInput = page.getByLabel(/domain|subdomain/i).or(page.locator('[data-testid="tenant-domain"]'))
		this.identifierInput = page.getByLabel(/identifier|slug/i).or(page.locator('[data-testid="tenant-identifier"]'))
		this.subscriptionTierSelect = page.getByLabel(/tier|subscription|plan/i).or(
			page.locator('[data-testid="subscription-tier"]')
		)
		this.maxUsersInput = page.getByLabel(/max users|user limit/i).or(page.locator('[data-testid="max-users"]'))
		this.submitButton = page.getByRole('button', { name: /submit|create|save/i }).or(
			page.locator('[data-testid="submit-button"]')
		)
		this.cancelButton = page.getByRole('button', { name: /cancel/i })

		// Tenant Detail
		this.tenantDetailView = page.locator('[data-testid="tenant-detail"]').or(
			page.locator('.tenant-detail, .tenant-view')
		)
		this.tenantStatusIndicator = page.locator('[data-testid="tenant-status"]').or(
			page.getByText(/active|suspended|inactive/i)
		)
		this.editButton = page.getByRole('button', { name: /edit/i })
		this.saveButton = page.getByRole('button', { name: /save/i })
		this.suspendButton = page.getByRole('button', { name: /suspend/i })
		this.activateButton = page.getByRole('button', { name: /activate/i })
		this.deleteButton = page.getByRole('button', { name: /delete/i })

		// Configuration
		this.configurationTab = page.getByRole('tab', { name: /config|settings/i }).or(
			page.locator('[data-testid="config-tab"]')
		)
		this.whiteLabelSection = page.locator('[data-testid="white-label"]').or(page.getByText(/white.?label/i))
		this.logoUploadInput = page.locator('input[type="file"]').or(page.locator('[data-testid="logo-upload"]'))
		this.primaryColorInput = page.getByLabel(/primary color|brand color/i).or(
			page.locator('[data-testid="primary-color"]')
		)
		this.companyNameInput = page.getByLabel(/company name|display name/i).or(
			page.locator('[data-testid="company-name"]')
		)
		this.featureTogglesSection = page.locator('[data-testid="feature-toggles"]').or(
			page.getByText(/feature.?flags|toggles/i)
		)

		// Feedback
		this.successMessage = page.getByRole('alert').filter({ hasText: /success|created|saved/i }).or(
			page.locator('[data-testid="success-message"]')
		)
		this.errorMessage = page.getByRole('alert').filter({ hasText: /error|failed/i }).or(
			page.locator('[data-testid="error-message"]')
		)
		this.validationError = page.locator('.validation-error, .field-error, [data-testid="validation-error"]')
		this.domainValidationError = page.locator('[data-testid="domain-error"]').or(
			this.domainInput.locator('~ .error')
		)
		this.confirmationDialog = page.getByRole('dialog').or(page.locator('[data-testid="confirmation-dialog"]'))
		this.confirmButton = this.confirmationDialog.getByRole('button', { name: /confirm|yes|delete/i })
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/admin/tenants')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to be ready
		await this.page.waitForLoadState('networkidle')

		// Verify key elements are visible
		const tableVisible = await this.tenantTable.isVisible().catch(() => false)
		const addButtonVisible = await this.addTenantButton.isVisible().catch(() => false)

		if (!tableVisible && !addButtonVisible) {
			throw new Error('Tenants page did not load correctly - expected tenant table or add button')
		}
	}

	// =============================================
	// TENANT CRUD OPERATIONS
	// =============================================

	async openAddTenant(): Promise<void> {
		await this.addTenantButton.click()
		await this.tenantForm.waitFor({ state: 'visible' })
	}

	async fillTenantForm(tenant: {
		name: string
		domain?: string
		identifier?: string
		tier?: string
		maxUsers?: number
	}): Promise<void> {
		// Name is required
		await this.tenantNameInput.fill(tenant.name)

		// Optional fields
		if (tenant.domain) {
			const hasDomain = await this.domainInput.isVisible().catch(() => false)
			if (hasDomain) {
				await this.domainInput.fill(tenant.domain)
			}
		}

		if (tenant.identifier) {
			const hasIdentifier = await this.identifierInput.isVisible().catch(() => false)
			if (hasIdentifier) {
				await this.identifierInput.fill(tenant.identifier)
			}
		}

		if (tenant.tier) {
			const hasTier = await this.subscriptionTierSelect.isVisible().catch(() => false)
			if (hasTier) {
				await this.subscriptionTierSelect.selectOption(tenant.tier)
			}
		}

		if (tenant.maxUsers) {
			const hasMaxUsers = await this.maxUsersInput.isVisible().catch(() => false)
			if (hasMaxUsers) {
				await this.maxUsersInput.fill(tenant.maxUsers.toString())
			}
		}
	}

	async createTenant(tenant: {
		name: string
		domain?: string
		identifier?: string
		tier?: string
		maxUsers?: number
	}): Promise<void> {
		await this.fillTenantForm(tenant)
		await this.submitButton.click()
		await this.waitForLoad()
	}

	async selectTenant(identifier: string): Promise<void> {
		// Find tenant row by name or identifier
		const targetRow = this.tenantRows.filter({ hasText: identifier })
		const exists = await targetRow.isVisible().catch(() => false)

		if (exists) {
			await targetRow.click()
			await this.waitForLoad()
		} else {
			// Try searching first
			await this.searchInput.fill(identifier)
			await this.waitForLoad()

			const searchedRow = this.tenantRows.first()
			await searchedRow.click()
			await this.waitForLoad()
		}
	}

	async suspendTenant(): Promise<void> {
		await this.suspendButton.click()

		// Handle confirmation dialog if present
		const hasDialog = await this.confirmationDialog.isVisible().catch(() => false)
		if (hasDialog) {
			await this.confirmButton.click()
		}

		await this.waitForLoad()
	}

	async activateTenant(): Promise<void> {
		await this.activateButton.click()

		// Handle confirmation dialog if present
		const hasDialog = await this.confirmationDialog.isVisible().catch(() => false)
		if (hasDialog) {
			await this.confirmButton.click()
		}

		await this.waitForLoad()
	}

	async deleteTenant(): Promise<void> {
		await this.deleteButton.click()

		// Handle confirmation dialog
		const hasDialog = await this.confirmationDialog.isVisible().catch(() => false)
		if (hasDialog) {
			await this.confirmButton.click()
		}

		await this.waitForLoad()
	}

	// =============================================
	// CONFIGURATION
	// =============================================

	async openConfiguration(): Promise<void> {
		const hasTab = await this.configurationTab.isVisible().catch(() => false)
		if (hasTab) {
			await this.configurationTab.click()
			await this.waitForLoad()
		}
	}

	async setWhiteLabelSettings(settings: {
		companyName?: string
		primaryColor?: string
	}): Promise<void> {
		await this.openConfiguration()

		if (settings.companyName) {
			const hasCompanyName = await this.companyNameInput.isVisible().catch(() => false)
			if (hasCompanyName) {
				await this.companyNameInput.fill(settings.companyName)
			}
		}

		if (settings.primaryColor) {
			const hasColor = await this.primaryColorInput.isVisible().catch(() => false)
			if (hasColor) {
				await this.primaryColorInput.fill(settings.primaryColor)
			}
		}

		await this.saveButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// GETTERS
	// =============================================

	async getTenantStatus(): Promise<string> {
		const status = await this.tenantStatusIndicator.textContent()
		return status?.trim() || ''
	}

	async getTenantCount(): Promise<number> {
		return await this.tenantRows.count()
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	async expectTenantInList(identifier: string): Promise<void> {
		const targetRow = this.tenantRows.filter({ hasText: identifier })
		await targetRow.waitFor({ state: 'visible', timeout: 10000 })
	}

	async expectTenantStatus(expectedStatus: string | RegExp): Promise<void> {
		const status = await this.getTenantStatus()
		if (typeof expectedStatus === 'string') {
			if (!status.toLowerCase().includes(expectedStatus.toLowerCase())) {
				throw new Error(`Expected tenant status "${expectedStatus}", got "${status}"`)
			}
		} else {
			if (!expectedStatus.test(status)) {
				throw new Error(`Expected tenant status to match ${expectedStatus}, got "${status}"`)
			}
		}
	}

	async expectTenantDetailVisible(): Promise<void> {
		await this.tenantDetailView.waitFor({ state: 'visible', timeout: 10000 })
	}

	async expectAccessDenied(): Promise<void> {
		const accessDenied = this.page.getByText(/access denied|unauthorized|forbidden/i)
		await accessDenied.waitFor({ state: 'visible', timeout: 10000 })
	}
}
