/**
 * Login Page Object Model
 *
 * Encapsulates all login page interactions.
 * Single source of truth for login selectors.
 *
 * @see https://playwright.dev/docs/pom
 */

import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
	// Login modal container - the inner dialog with the form
	readonly loginModal: Locator

	// Form elements
	readonly emailInput: Locator
	readonly passwordInput: Locator
	readonly submitButton: Locator
	readonly rememberMeCheckbox: Locator

	// Error/feedback elements
	readonly errorMessage: Locator
	readonly formError: Locator

	// Links
	readonly forgotPasswordLink: Locator
	readonly signUpLink: Locator

	// MFA elements (if applicable)
	readonly mfaCodeInput: Locator
	readonly mfaSubmitButton: Locator

	constructor(page: Page) {
		super(page)

		// Login modal - get the inner dialog that contains the form (second dialog)
		// The UI has nested dialogs: outer (backdrop) and inner (content)
		this.loginModal = page.getByRole('dialog').nth(1)

		// Form elements - scope to the login modal to avoid matching page elements
		this.emailInput = this.loginModal.getByRole('textbox', { name: /email address/i })
		this.passwordInput = this.loginModal.getByRole('textbox', { name: /password/i })
		this.submitButton = this.loginModal
			.getByRole('button', { name: /sign in|continue|log in/i })
			.first()
		this.rememberMeCheckbox = this.loginModal.getByLabel(/remember/i)

		// Error elements - within modal
		this.errorMessage = this.loginModal.getByRole('alert')
		this.formError = this.loginModal.getByTestId('form-error').or(this.loginModal.locator('.form-error'))

		// Links - within modal
		this.forgotPasswordLink = this.loginModal.getByRole('link', { name: /forgot|reset/i })
		this.signUpLink = this.loginModal.getByRole('link', { name: /sign up|register|create/i })

		// MFA elements
		this.mfaCodeInput = this.loginModal.getByLabel(/code|otp|verification/i)
		this.mfaSubmitButton = this.loginModal.getByRole('button', { name: /verify|confirm/i })
	}

	// =============================================
	// NAVIGATION
	// =============================================

	async goto(): Promise<void> {
		// Login is a modal triggered by ?login=true query parameter
		await this.page.goto('/?login=true')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		// Wait for login modal to appear (the inner dialog)
		await this.loginModal.waitFor({ state: 'visible', timeout: 10000 })
		await expect(this.emailInput).toBeVisible()
		await expect(this.passwordInput).toBeVisible()
		await expect(this.submitButton).toBeVisible()
	}

	// =============================================
	// ACTIONS
	// =============================================

	/**
	 * Fill the login form
	 */
	async fillForm(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email)
		await this.passwordInput.fill(password)
	}

	/**
	 * Submit the login form
	 */
	async submit(): Promise<void> {
		await this.submitButton.click()
	}

	/**
	 * Complete login flow
	 */
	async login(email: string, password: string, rememberMe = false): Promise<void> {
		await this.fillForm(email, password)

		if (rememberMe) {
			await this.rememberMeCheckbox.check()
		}

		await this.submit()
	}

	/**
	 * Login and wait for dashboard
	 */
	async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
		await this.login(email, password)
		await this.page.waitForURL(/\/(dashboard|store|app|orders)/, {
			timeout: 30000,
		})
	}

	/**
	 * Login and expect MFA challenge
	 */
	async loginWithMfa(email: string, password: string, mfaCode: string): Promise<void> {
		await this.login(email, password)

		// Wait for MFA screen
		await expect(this.mfaCodeInput).toBeVisible({ timeout: 10000 })

		// Enter MFA code
		await this.mfaCodeInput.fill(mfaCode)
		await this.mfaSubmitButton.click()

		// Wait for redirect
		await this.page.waitForURL(/\/(dashboard|store|app)/, {
			timeout: 30000,
		})
	}

	// =============================================
	// ASSERTIONS
	// =============================================

	/**
	 * Expect login error message
	 */
	async expectError(message: string | RegExp): Promise<void> {
		await expect(this.errorMessage.or(this.formError)).toContainText(message)
	}

	/**
	 * Expect successful redirect
	 */
	async expectRedirectTo(urlPattern: RegExp): Promise<void> {
		await this.page.waitForURL(urlPattern, { timeout: 30000 })
	}

	/**
	 * Expect MFA challenge
	 */
	async expectMfaChallenge(): Promise<void> {
		await expect(this.mfaCodeInput).toBeVisible({ timeout: 10000 })
	}

	// =============================================
	// HELPER METHODS
	// =============================================

	/**
	 * Click forgot password link
	 */
	async clickForgotPassword(): Promise<void> {
		await this.forgotPasswordLink.click()
	}

	/**
	 * Click sign up link
	 */
	async clickSignUp(): Promise<void> {
		await this.signUpLink.click()
	}
}
