/**
 * E2E Test Utilities
 *
 * Common utilities and helpers for E2E tests.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

import { Page, Locator, expect } from '@playwright/test'

// =============================================
// WAIT UTILITIES
// =============================================

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
	await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Wait for element to be stable (no DOM changes)
 */
export async function waitForStable(locator: Locator, timeout = 5000): Promise<void> {
	await expect(locator).toBeVisible({ timeout })
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp, timeout = 10000): Promise<void> {
	await page.waitForResponse(
		(response) => {
			const url = response.url()
			if (typeof urlPattern === 'string') {
				return url.includes(urlPattern)
			}
			return urlPattern.test(url)
		},
		{ timeout }
	)
}

// =============================================
// SCREENSHOT UTILITIES
// =============================================

/**
 * Take a named screenshot
 */
export async function takeScreenshot(page: Page, name: string): Promise<string> {
	const path = `test-results/screenshots/${name}-${Date.now()}.png`
	await page.screenshot({ path, fullPage: true })
	return path
}

/**
 * Take screenshot on failure
 */
export async function screenshotOnFailure(page: Page, testName: string): Promise<void> {
	const path = `test-results/failures/${testName}-${Date.now()}.png`
	await page.screenshot({ path, fullPage: true })
	console.log(`📸 Failure screenshot: ${path}`)
}

// =============================================
// ASSERTION UTILITIES
// =============================================

/**
 * Soft assertion that doesn't fail the test immediately
 */
export function softExpect(condition: boolean, message: string): void {
	if (!condition) {
		console.warn(`⚠️ Soft assertion failed: ${message}`)
	}
}

/**
 * Assert element contains one of the expected texts
 */
export async function expectOneOf(locator: Locator, expectedTexts: string[], timeout = 5000): Promise<void> {
	await expect(locator).toBeVisible({ timeout })
	const text = await locator.textContent()

	const hasMatch = expectedTexts.some((expected) => text?.includes(expected))
	expect(hasMatch).toBeTruthy()
}

// =============================================
// DATA UTILITIES
// =============================================

/**
 * Generate unique identifier
 */
export function generateId(prefix = 'test'): string {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8)
	return `${prefix}-${timestamp}-${random}`
}

/**
 * Generate unique email
 */
export function generateEmail(domain = 'medsource-test.com'): string {
	return `test-${generateId()}@${domain}`
}

/**
 * Generate unique PO number
 */
export function generatePONumber(): string {
	return `PO-TEST-${Date.now()}`
}

/**
 * Format currency for comparison
 */
export function formatCurrency(amount: number): string {
	return `$${amount.toFixed(2)}`
}

/**
 * Parse currency string to number
 */
export function parseCurrency(text: string): number {
	const cleaned = text.replace(/[^0-9.]/g, '')
	return parseFloat(cleaned) || 0
}

// =============================================
// RETRY UTILITIES
// =============================================

/**
 * Retry an action with exponential backoff
 */
export async function retryAction<T>(action: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
	let lastError: Error | undefined

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await action()
		} catch (error) {
			lastError = error as Error
			const delay = baseDelay * Math.pow(2, attempt)
			console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
			await new Promise((resolve) => setTimeout(resolve, delay))
		}
	}

	throw lastError
}

// =============================================
// ACCESSIBILITY UTILITIES
// =============================================

/**
 * Check for common accessibility issues
 * Note: For full a11y testing, use @axe-core/playwright
 * Playwright 1.57.0 removed page.accessibility API
 */
export async function basicA11yCheck(page: Page): Promise<{ passed: boolean; issues: string[] }> {
	const issues: string[] = []

	// Check for images without alt text
	const imagesWithoutAlt = await page.locator('img:not([alt])').count()
	if (imagesWithoutAlt > 0) {
		issues.push(`${imagesWithoutAlt} image(s) without alt text`)
	}

	// Check for buttons without accessible names
	const buttonsWithoutName = await page.locator('button:not([aria-label]):empty').count()
	if (buttonsWithoutName > 0) {
		issues.push(`${buttonsWithoutName} button(s) without accessible name`)
	}

	// Check for links without text
	const linksWithoutText = await page.locator('a:not([aria-label]):empty').count()
	if (linksWithoutText > 0) {
		issues.push(`${linksWithoutText} link(s) without text`)
	}

	// Check for form inputs without labels
	const inputsWithoutLabels = await page.locator('input:not([aria-label]):not([id])').count()
	if (inputsWithoutLabels > 0) {
		issues.push(`${inputsWithoutLabels} input(s) without labels`)
	}

	return {
		passed: issues.length === 0,
		issues,
	}
}

// =============================================
// CONSOLE LOG CAPTURE
// =============================================

/**
 * Capture console errors during test
 */
export function setupConsoleCapture(page: Page): {
	errors: string[]
	warnings: string[]
} {
	const errors: string[] = []
	const warnings: string[] = []

	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			errors.push(msg.text())
		} else if (msg.type() === 'warning') {
			warnings.push(msg.text())
		}
	})

	return { errors, warnings }
}
