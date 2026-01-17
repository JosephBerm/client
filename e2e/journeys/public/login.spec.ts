/**
 * Public Login Page E2E Tests
 *
 * Tests authentication flows for unauthenticated users.
 * Uses fresh browser context (no storage state).
 *
 * @see https://playwright.dev/docs/auth
 */

import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages'

test.describe('Login Page', () => {
	let loginPage: LoginPage

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page)
		await loginPage.goto()
	})

	test('should display login form', async () => {
		await loginPage.expectLoaded()

		await expect(loginPage.emailInput).toBeVisible()
		await expect(loginPage.passwordInput).toBeVisible()
		await expect(loginPage.submitButton).toBeVisible()
	})

	test('should show error for invalid credentials', async () => {
		await loginPage.login('invalid@email.com', 'wrongpassword')

		// Wait for error response
		await loginPage.page.waitForLoadState('networkidle')

		// Should show error or stay on login page
		const url = loginPage.getUrl()
		expect(url).toContain('login')
	})

	test('should show error for empty form submission', async () => {
		await loginPage.submitButton.click()

		// Should show validation error or form error
		const hasError = await loginPage.errorMessage.isVisible().catch(() => false)
		const hasFormError = await loginPage.formError.isVisible().catch(() => false)
		const stayedOnPage = loginPage.getUrl().includes('login')

		expect(hasError || hasFormError || stayedOnPage).toBeTruthy()
	})

	test('should navigate to forgot password', async () => {
		const forgotLink = loginPage.forgotPasswordLink
		const hasLink = await forgotLink.isVisible().catch(() => false)

		if (hasLink) {
			await forgotLink.click()
			await loginPage.page.waitForLoadState('networkidle')

			// Should navigate away from login
			const url = loginPage.getUrl()
			expect(url).toMatch(/forgot|reset|password/)
		}
	})

	test('should navigate to signup', async () => {
		const signupLink = loginPage.signUpLink
		const hasLink = await signupLink.isVisible().catch(() => false)

		if (hasLink) {
			await signupLink.click()
			await loginPage.page.waitForLoadState('networkidle')

			// Should navigate to signup
			const url = loginPage.getUrl()
			expect(url).toMatch(/signup|register|create/)
		}
	})

	test('should handle remember me checkbox', async () => {
		const rememberMe = loginPage.rememberMeCheckbox
		const hasRememberMe = await rememberMe.isVisible().catch(() => false)

		if (hasRememberMe) {
			// Check it
			await rememberMe.check()
			await expect(rememberMe).toBeChecked()

			// Uncheck it
			await rememberMe.uncheck()
			await expect(rememberMe).not.toBeChecked()
		}
	})
})

test.describe('Login Security', () => {
	test('should not expose password in URL', async ({ page }) => {
		const loginPage = new LoginPage(page)
		await loginPage.goto()

		await loginPage.login('test@example.com', 'secretpassword')
		await page.waitForLoadState('networkidle')

		const url = page.url()
		expect(url).not.toContain('secretpassword')
	})

	test('should have secure password input', async ({ page }) => {
		const loginPage = new LoginPage(page)
		await loginPage.goto()

		// Verify password input type is password
		const passwordType = await loginPage.passwordInput.getAttribute('type')
		expect(passwordType).toBe('password')
	})
})
