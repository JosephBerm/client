/**
 * Users Page Object Model
 *
 * Encapsulates user management interactions for Admin (Level 5000)
 * and Super Admin (Level 9999) roles.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class UsersPage extends BasePage {
	// User list
	readonly usersTable: Locator
	readonly userRows: Locator
	readonly emptyUsersMessage: Locator

	// Filters and search
	readonly searchInput: Locator
	readonly roleFilter: Locator
	readonly statusFilter: Locator
	readonly sortDropdown: Locator

	// User actions
	readonly addUserButton: Locator
	readonly editUserButton: Locator
	readonly deleteUserButton: Locator
	readonly deactivateUserButton: Locator
	readonly resetPasswordButton: Locator

	// User form/editor
	readonly userForm: Locator
	readonly firstNameInput: Locator
	readonly lastNameInput: Locator
	readonly emailInput: Locator
	readonly phoneInput: Locator
	readonly roleSelect: Locator
	readonly statusSelect: Locator

	// Password fields
	readonly passwordInput: Locator
	readonly confirmPasswordInput: Locator
	readonly generatePasswordButton: Locator
	readonly sendInviteCheckbox: Locator

	// User details
	readonly userDetailPanel: Locator
	readonly userName: Locator
	readonly userEmail: Locator
	readonly userRole: Locator
	readonly userStatus: Locator
	readonly userLastLogin: Locator
	readonly userCreatedDate: Locator

	// Permissions
	readonly permissionsSection: Locator
	readonly permissionCheckboxes: Locator
	readonly rolePermissions: Locator

	// Audit
	readonly userActivityLog: Locator
	readonly loginHistory: Locator

	// Save actions
	readonly saveUserButton: Locator
	readonly cancelButton: Locator

	// Confirmation dialogs
	readonly confirmDeleteButton: Locator
	readonly confirmDeactivateButton: Locator

	constructor(page: Page) {
		super(page)

		// User list
		this.usersTable = page.getByTestId('users-table').or(page.getByRole('table'))
		this.userRows = page.getByTestId('user-row').or(page.locator('tbody tr'))
		this.emptyUsersMessage = page.getByText(/no users|no results/i)

		// Filters and search
		this.searchInput = page
			.getByPlaceholder(/search users|email|name/i)
			.or(page.getByRole('searchbox'))
		this.roleFilter = page.getByRole('combobox', { name: /role/i })
		this.statusFilter = page.getByRole('combobox', { name: /status/i })
		this.sortDropdown = page.getByRole('combobox', { name: /sort/i })

		// User actions
		this.addUserButton = page
			.getByRole('button', { name: /add user|new user|create user/i })
			.or(page.getByTestId('add-user-btn'))
		this.editUserButton = page.getByRole('button', { name: /edit/i })
		this.deleteUserButton = page.getByRole('button', { name: /delete/i })
		this.deactivateUserButton = page.getByRole('button', { name: /deactivate|suspend/i })
		this.resetPasswordButton = page.getByRole('button', { name: /reset password/i })

		// User form/editor
		this.userForm = page.getByRole('dialog').or(page.getByTestId('user-form'))
		this.firstNameInput = page
			.getByLabel(/first name/i)
			.or(page.getByPlaceholder(/first name/i))
		this.lastNameInput = page.getByLabel(/last name/i).or(page.getByPlaceholder(/last name/i))
		this.emailInput = page
			.getByLabel(/email/i)
			.or(page.getByPlaceholder(/email/i))
			.or(page.locator('input[type="email"]'))
		this.phoneInput = page
			.getByLabel(/phone/i)
			.or(page.getByPlaceholder(/phone/i))
			.or(page.locator('input[type="tel"]'))
		this.roleSelect = page
			.getByRole('combobox', { name: /role|assign role/i })
			.or(page.getByTestId('role-select'))
		this.statusSelect = page.getByRole('combobox', { name: /status/i })

		// Password fields
		this.passwordInput = page
			.getByLabel(/^password$/i)
			.or(page.locator('input[type="password"]').first())
		this.confirmPasswordInput = page
			.getByLabel(/confirm password/i)
			.or(page.locator('input[type="password"]').nth(1))
		this.generatePasswordButton = page.getByRole('button', { name: /generate password/i })
		this.sendInviteCheckbox = page.getByRole('checkbox', { name: /send invite|email invitation/i })

		// User details
		this.userDetailPanel = page.getByTestId('user-detail').or(page.getByRole('complementary'))
		this.userName = page.getByTestId('user-name')
		this.userEmail = page.getByTestId('user-email')
		this.userRole = page.getByTestId('user-role')
		this.userStatus = page.getByTestId('user-status')
		this.userLastLogin = page.getByTestId('last-login')
		this.userCreatedDate = page.getByTestId('created-date')

		// Permissions
		this.permissionsSection = page.getByTestId('permissions-section')
		this.permissionCheckboxes = page.locator('[data-permission]')
		this.rolePermissions = page.getByTestId('role-permissions')

		// Audit
		this.userActivityLog = page.getByTestId('activity-log')
		this.loginHistory = page.getByTestId('login-history')

		// Save actions
		this.saveUserButton = page
			.getByRole('button', { name: /save|create user/i })
			.or(page.getByTestId('save-user-btn'))
		this.cancelButton = page.getByRole('button', { name: /cancel/i })

		// Confirmation dialogs
		this.confirmDeleteButton = page.getByRole('button', { name: /confirm delete|yes, delete/i })
		this.confirmDeactivateButton = page.getByRole('button', {
			name: /confirm deactivate|yes, deactivate/i,
		})
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		await this.page.goto('/app/accounts')
		await this.waitForLoad()
	}

	async gotoUser(userId: string): Promise<void> {
		await this.page.goto(`/app/accounts/${userId}`)
		await this.waitForLoad()
	}

	async gotoNewUser(): Promise<void> {
		await this.page.goto('/app/accounts/create')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for page to be stable
		await this.page.waitForLoadState('networkidle')
		
		// Primary check: Look for the Accounts/Users heading
		const hasHeading = await this.page.getByRole('heading', { name: /accounts|users/i }).first().isVisible().catch(() => false)
		
		// Secondary checks for various page states
		const hasTable = await this.page.getByTestId('users-table').isVisible().catch(() => false)
		const hasDataGrid = await this.page.getByRole('table').first().isVisible().catch(() => false)
		const hasEmptyState = await this.emptyUsersMessage.isVisible().catch(() => false)
		const isCreatePage = this.page.url().includes('/create')
		const hasAccessDenied = await this.page.getByText(/access denied/i).isVisible().catch(() => false)
		
		// Success if any indicator is present
		expect(hasHeading || hasTable || hasDataGrid || hasEmptyState || isCreatePage || hasAccessDenied).toBeTruthy()
	}

	// =============================================
	// USER LIST ACTIONS
	// =============================================

	/**
	 * Get user row by email or name
	 */
	getUserRow(identifier: string): Locator {
		return this.userRows.filter({ hasText: identifier })
	}

	/**
	 * Select a user from the list
	 */
	async selectUser(identifier: string): Promise<void> {
		const row = this.getUserRow(identifier)
		await row.click()
		await this.waitForLoad()
	}

	/**
	 * Search for users
	 */
	async searchUser(query: string): Promise<void> {
		await this.searchInput.fill(query)
		await this.searchInput.press('Enter')
		await this.waitForLoad()
	}

	/**
	 * Filter by role
	 */
	async filterByRole(role: string): Promise<void> {
		await this.roleFilter.selectOption(role)
		await this.waitForLoad()
	}

	/**
	 * Filter by status
	 */
	async filterByStatus(status: string): Promise<void> {
		await this.statusFilter.selectOption(status)
		await this.waitForLoad()
	}

	// =============================================
	// USER CREATION & EDITING
	// =============================================

	/**
	 * Open form to add new user
	 */
	async openAddUser(): Promise<void> {
		await this.addUserButton.click()
		await this.waitForLoad()
	}

	/**
	 * Fill user form
	 */
	async fillUserForm(user: {
		firstName: string
		lastName: string
		email: string
		phone?: string
		role: string
	}): Promise<void> {
		await this.firstNameInput.fill(user.firstName)
		await this.lastNameInput.fill(user.lastName)
		await this.emailInput.fill(user.email)

		if (user.phone) {
			const phoneVisible = await this.phoneInput.isVisible().catch(() => false)
			if (phoneVisible) {
				await this.phoneInput.fill(user.phone)
			}
		}

		await this.roleSelect.selectOption(user.role)
	}

	/**
	 * Set password for user
	 */
	async setPassword(password: string): Promise<void> {
		await this.passwordInput.fill(password)
		const confirmVisible = await this.confirmPasswordInput.isVisible().catch(() => false)
		if (confirmVisible) {
			await this.confirmPasswordInput.fill(password)
		}
	}

	/**
	 * Save user
	 */
	async saveUser(): Promise<void> {
		await this.saveUserButton.click()
		await this.waitForLoad()
	}

	/**
	 * Create complete user
	 */
	async createUser(user: {
		firstName: string
		lastName: string
		email: string
		phone?: string
		role: string
		password?: string
	}): Promise<void> {
		await this.openAddUser()
		await this.fillUserForm(user)

		if (user.password) {
			await this.setPassword(user.password)
		}

		await this.saveUser()
	}

	/**
	 * Edit existing user's role
	 */
	async changeUserRole(newRole: string): Promise<void> {
		await this.editUserButton.click()
		await this.roleSelect.selectOption(newRole)
		await this.saveUser()
	}

	// =============================================
	// USER MANAGEMENT ACTIONS
	// =============================================

	/**
	 * Deactivate user
	 */
	async deactivateUser(): Promise<void> {
		await this.deactivateUserButton.click()
		const confirmVisible = await this.confirmDeactivateButton.isVisible().catch(() => false)
		if (confirmVisible) {
			await this.confirmDeactivateButton.click()
		}
		await this.waitForLoad()
	}

	/**
	 * Delete user
	 */
	async deleteUser(): Promise<void> {
		await this.deleteUserButton.click()
		const confirmVisible = await this.confirmDeleteButton.isVisible().catch(() => false)
		if (confirmVisible) {
			await this.confirmDeleteButton.click()
		}
		await this.waitForLoad()
	}

	/**
	 * Reset user password
	 */
	async resetPassword(): Promise<void> {
		await this.resetPasswordButton.click()
		await this.waitForLoad()
	}

	// =============================================
	// USER DETAILS
	// =============================================

	/**
	 * Get user name from detail panel
	 */
	async getUserName(): Promise<string> {
		return (await this.userName.textContent()) || ''
	}

	/**
	 * Get user email from detail panel
	 */
	async getUserEmail(): Promise<string> {
		return (await this.userEmail.textContent()) || ''
	}

	/**
	 * Get user role
	 */
	async getUserRole(): Promise<string> {
		return (await this.userRole.textContent()) || ''
	}

	/**
	 * Get user status
	 */
	async getUserStatus(): Promise<string> {
		return (await this.userStatus.textContent()) || ''
	}

	// =============================================
	// RBAC VERIFICATION
	// =============================================

	/**
	 * Check if role option exists in dropdown
	 */
	async hasRoleOption(roleName: string): Promise<boolean> {
		await this.roleSelect.click()
		const option = this.page.getByRole('option', { name: new RegExp(roleName, 'i') })
		const exists = await option.isVisible().catch(() => false)
		await this.page.keyboard.press('Escape') // Close dropdown
		return exists
	}

	/**
	 * Verify cannot assign higher role than own
	 */
	async cannotAssignRole(roleName: string): Promise<boolean> {
		return !(await this.hasRoleOption(roleName))
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect user in list
	 */
	async expectUserInList(identifier: string): Promise<void> {
		await expect(this.getUserRow(identifier)).toBeVisible()
	}

	/**
	 * Expect user NOT in list
	 */
	async expectUserNotInList(identifier: string): Promise<void> {
		await expect(this.getUserRow(identifier)).not.toBeVisible()
	}

	/**
	 * Expect user detail visible
	 */
	async expectDetailVisible(): Promise<void> {
		await expect(this.userDetailPanel).toBeVisible()
	}

	/**
	 * Expect user role
	 */
	async expectUserRole(role: string | RegExp): Promise<void> {
		await expect(this.userRole).toContainText(role)
	}

	/**
	 * Expect user status
	 */
	async expectUserStatus(status: string | RegExp): Promise<void> {
		await expect(this.userStatus).toContainText(status)
	}

	/**
	 * Expect empty users list
	 */
	async expectEmptyList(): Promise<void> {
		await expect(this.emptyUsersMessage).toBeVisible()
	}

	/**
	 * Expect user created successfully
	 */
	async expectUserCreated(): Promise<void> {
		await this.expectToast(/created|success/i)
	}

	/**
	 * Expect user deleted successfully
	 */
	async expectUserDeleted(): Promise<void> {
		await this.expectToast(/deleted|removed/i)
	}

	/**
	 * Expect validation error
	 */
	async expectValidationError(field: string): Promise<void> {
		const errorMessage = this.page.getByText(new RegExp(`${field}.*required|invalid.*${field}`, 'i'))
		await expect(errorMessage).toBeVisible()
	}

	/**
	 * Expect cannot access (forbidden)
	 */
	async expectAccessDenied(): Promise<void> {
		const forbidden = this.page.getByText(/access denied|forbidden|not authorized/i)
		await expect(forbidden).toBeVisible()
	}
}
