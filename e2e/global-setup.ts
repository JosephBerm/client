/**
 * Global Setup - Authentication for All Roles
 *
 * ARCHITECTURE: Authenticates once per role, saves storage state.
 * All tests reuse these states - no login per test!
 *
 * PLAYWRIGHT 1.57.0:
 * - Uses Chrome for Testing (not Chromium)
 * - Better service worker handling
 *
 * @see https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */

import { chromium, FullConfig, Browser, BrowserContext, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables from .env.test.local
// This file should contain test credentials and is gitignored
const envPath = path.join(__dirname, '..', '.env.test.local')
if (fs.existsSync(envPath)) {
	dotenv.config({ path: envPath })
	console.log('📄 Loaded environment from .env.test.local')
} else {
	// Fallback to .env.test if .env.test.local doesn't exist
	const fallbackPath = path.join(__dirname, '..', '.env.test')
	if (fs.existsSync(fallbackPath)) {
		dotenv.config({ path: fallbackPath })
		console.log('📄 Loaded environment from .env.test')
	}
}

// =============================================
// CONFIGURATION
// =============================================

const AUTH_DIR = path.join(__dirname, '..', '.auth')

/**
 * Test account configuration
 *
 * SECURITY: All credentials MUST come from environment variables.
 * - Local: Use .env.test.local (gitignored)
 * - CI/CD: Use GitHub Secrets or your CI's secret management
 *
 * @see client/.env.test.example for required variables
 */
interface TestAccount {
	role: string
	email: string
	password: string
	storageStatePath: string
	roleLevel: number
}

/**
 * Validates that all required environment variables are set.
 * Super Admin is optional - tests for that role will be skipped if not provided.
 */
function validateTestCredentials(): void {
	// Required credentials (core roles that must exist)
	const requiredVars = [
		'TEST_CUSTOMER_EMAIL',
		'TEST_CUSTOMER_PASSWORD',
		'TEST_FULFILLMENT_EMAIL',
		'TEST_FULFILLMENT_PASSWORD',
		'TEST_SALESREP_EMAIL',
		'TEST_SALESREP_PASSWORD',
		'TEST_SALESMANAGER_EMAIL',
		'TEST_SALESMANAGER_PASSWORD',
		'TEST_ADMIN_EMAIL',
		'TEST_ADMIN_PASSWORD',
	]

	// Optional credentials (tests will be skipped if not provided)
	const optionalVars = ['TEST_SUPERADMIN_EMAIL', 'TEST_SUPERADMIN_PASSWORD']

	const missing = requiredVars.filter((v) => !process.env[v])
	const missingOptional = optionalVars.filter((v) => !process.env[v])

	if (missing.length > 0) {
		console.error('\n' + '='.repeat(60))
		console.error('❌ MISSING TEST CREDENTIALS')
		console.error('='.repeat(60))
		console.error('\nThe following environment variables are required:\n')
		missing.forEach((v) => console.error(`  - ${v}`))
		console.error('\n📋 Setup instructions:')
		console.error('  1. Copy .env.test.example to .env.test.local')
		console.error('  2. Fill in all credential values')
		console.error('  3. Never commit .env.test.local to version control')
		console.error('\nFor CI/CD, configure these as secrets in your pipeline.')
		console.error('='.repeat(60) + '\n')
		throw new Error(`Missing ${missing.length} required test credential(s)`)
	}

	if (missingOptional.length > 0) {
		console.warn('\n⚠️  Optional credentials not provided:')
		missingOptional.forEach((v) => console.warn(`   - ${v}`))
		console.warn('   Super Admin tests will be skipped.\n')
	}
}

/**
 * Build the list of test accounts dynamically.
 * Super Admin is only included if credentials are provided.
 */
function buildTestAccounts(): TestAccount[] {
	const accounts: TestAccount[] = [
		{
			role: 'customer',
			email: process.env.TEST_CUSTOMER_EMAIL || '',
			password: process.env.TEST_CUSTOMER_PASSWORD || '',
			storageStatePath: path.join(AUTH_DIR, 'customer.json'),
			roleLevel: 1000,
		},
		{
			role: 'fulfillment',
			email: process.env.TEST_FULFILLMENT_EMAIL || '',
			password: process.env.TEST_FULFILLMENT_PASSWORD || '',
			storageStatePath: path.join(AUTH_DIR, 'fulfillment.json'),
			roleLevel: 2000,
		},
		{
			role: 'sales-rep',
			email: process.env.TEST_SALESREP_EMAIL || '',
			password: process.env.TEST_SALESREP_PASSWORD || '',
			storageStatePath: path.join(AUTH_DIR, 'sales-rep.json'),
			roleLevel: 3000,
		},
		{
			role: 'sales-manager',
			email: process.env.TEST_SALESMANAGER_EMAIL || '',
			password: process.env.TEST_SALESMANAGER_PASSWORD || '',
			storageStatePath: path.join(AUTH_DIR, 'sales-manager.json'),
			roleLevel: 4000,
		},
		{
			role: 'admin',
			email: process.env.TEST_ADMIN_EMAIL || '',
			password: process.env.TEST_ADMIN_PASSWORD || '',
			storageStatePath: path.join(AUTH_DIR, 'admin.json'),
			roleLevel: 5000,
		},
	]

	// Only add Super Admin if credentials are provided
	if (process.env.TEST_SUPERADMIN_EMAIL && process.env.TEST_SUPERADMIN_PASSWORD) {
		accounts.push({
			role: 'super-admin',
			email: process.env.TEST_SUPERADMIN_EMAIL,
			password: process.env.TEST_SUPERADMIN_PASSWORD,
			storageStatePath: path.join(AUTH_DIR, 'super-admin.json'),
			roleLevel: 9999,
		})
	}

	return accounts
}

// Build accounts at runtime (after env vars are loaded)
let TEST_ACCOUNTS: TestAccount[] = []

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Ensure the auth directory exists
 */
function ensureAuthDir(): void {
	if (!fs.existsSync(AUTH_DIR)) {
		fs.mkdirSync(AUTH_DIR, { recursive: true })
		console.log(`📁 Created auth directory: ${AUTH_DIR}`)
	}
}

/**
 * Check if storage state is still valid (not expired)
 * Storage states are valid for 24 hours by default
 */
function isStorageStateValid(filePath: string, maxAgeHours = 24): boolean {
	if (!fs.existsSync(filePath)) {
		return false
	}

	const stats = fs.statSync(filePath)
	const ageMs = Date.now() - stats.mtimeMs
	const ageHours = ageMs / (1000 * 60 * 60)

	return ageHours < maxAgeHours
}

/**
 * Authenticate a single account and save storage state
 */
async function authenticateAccount(
	browser: Browser,
	account: TestAccount,
	baseURL: string
): Promise<boolean> {
	console.log(`\n🔐 Authenticating ${account.role} (level ${account.roleLevel})...`)

	// Check if we can reuse existing storage state
	if (isStorageStateValid(account.storageStatePath)) {
		console.log(`  ♻️  Reusing existing storage state (still valid)`)
		return true
	}

	const context = await browser.newContext()
	const page = await context.newPage()

	try {
		// Navigate to login page - this opens a modal dialog
		// Increased timeout for slow initial server response (especially first request)
		await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle', timeout: 60000 })

		// Wait for the login modal - there are 2 nested dialogs
		await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 })

		// STEP 1: Fill email and password, then click "Continue"
		console.log(`  📝 Filling credentials for ${account.email}...`)

		// Email field - textbox with placeholder "Email address"
		const emailInput = page.getByRole('textbox', { name: /email address/i })
		await emailInput.waitFor({ state: 'visible', timeout: 5000 })
		await emailInput.fill(account.email)

		// Password field - textbox with placeholder containing "password"
		const passwordInput = page.getByRole('textbox', { name: /password/i })
		await passwordInput.fill(account.password)

		// Click "Continue" button (first step of two-step login)
		const continueButton = page.getByRole('button', { name: /^continue$/i })
		await continueButton.click()
		console.log(`  ⏳ Clicked Continue, waiting for Sign In button...`)

		// STEP 2: Wait for the "Sign In" button to appear and click it
		// After clicking Continue, the form transitions and shows a "Sign In" button
		const signInButton = page.getByRole('button', { name: /^sign in$/i })

		// Wait for Sign In button to be visible and enabled
		await signInButton.waitFor({ state: 'visible', timeout: 10000 })

		// Ensure the button is enabled before clicking
		await expect(signInButton).toBeEnabled({ timeout: 10000 })

		// Click Sign In
		await signInButton.click()
		console.log(`  ⏳ Clicked Sign In, waiting for login to complete...`)

		// Wait for login to process (URL change or dialog dismissal)
		await Promise.race([
			page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }),
			page.locator('[role="dialog"]').first().waitFor({ state: 'hidden', timeout: 15000 }),
		]).catch(() => {})

		// Check login result - look for navigation away from login modal
		const currentUrl = page.url()
		const stillOnLogin = currentUrl.includes('login=true') || currentUrl.includes('/login')
		const dialogVisible = await page.locator('[role="dialog"]').first().isVisible().catch(() => false)

		// Check for actual error messages (not success messages!)
		const errorMessages = page.locator('.text-error, .alert-error')
		const errorCount = await errorMessages.count()

		for (let i = 0; i < errorCount; i++) {
			const errorText = await errorMessages.nth(i).textContent().catch(() => '')
			// Only treat it as an error if it's not a success message
			if (
				errorText &&
				errorText.trim().length > 0 &&
				!errorText.toLowerCase().includes('success') &&
				!errorText.toLowerCase().includes('loading') &&
				!errorText.toLowerCase().includes('logged in')
			) {
				throw new Error(`Login failed: ${errorText.trim()}`)
			}
		}

		// If modal is still visible after clicking Sign In, check if login succeeded
		if (dialogVisible && stillOnLogin) {
			// Wait more and check again
			await page.waitForLoadState('networkidle')
			const stillHasDialog = await page.locator('[role="dialog"]').first().isVisible().catch(() => false)
			if (stillHasDialog) {
				// Take a screenshot to see what's happening
				throw new Error('Login modal still visible after Sign In - credentials may be invalid')
			}
		}

		console.log(`  ✓ Login flow completed`)

		// Save storage state (cookies + localStorage)
		await context.storageState({ path: account.storageStatePath })

		console.log(`  ✅ ${account.role} authenticated successfully`)
		console.log(`  📄 Storage state saved to: ${account.storageStatePath}`)

		return true
	} catch (error) {
		console.error(`  ❌ Failed to authenticate ${account.role}:`)
		console.error(`     ${error instanceof Error ? error.message : 'Unknown error'}`)

		// Take screenshot on failure for debugging
		const screenshotPath = path.join(AUTH_DIR, `${account.role}-auth-failure.png`)
		await page.screenshot({ path: screenshotPath, fullPage: true })
		console.log(`  📸 Failure screenshot saved: ${screenshotPath}`)

		return false
	} finally {
		await context.close()
	}
}

// =============================================
// GLOBAL SETUP
// =============================================

/**
 * Global setup function
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
	console.log('\n' + '='.repeat(60))
	console.log('🚀 PLAYWRIGHT GLOBAL SETUP - MedSource Pro E2E Tests')
	console.log('='.repeat(60))
	console.log(`📅 ${new Date().toISOString()}`)
	console.log(`🌐 Base URL: ${config.projects[0].use.baseURL}`)
	console.log(`🔧 Playwright Version: 1.57.0`)

	// SECURITY: Validate all credentials are provided via environment variables
	validateTestCredentials()

	// Build test accounts list (must be after env validation)
	TEST_ACCOUNTS = buildTestAccounts()
	console.log(`\n📋 Test accounts to authenticate: ${TEST_ACCOUNTS.length}`)
	TEST_ACCOUNTS.forEach((a) => console.log(`   - ${a.role} (level ${a.roleLevel})`))

	// Ensure auth directory exists
	ensureAuthDir()

	// Get base URL from config
	const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'

	// Launch browser
	console.log('\n📦 Launching browser for authentication...')
	const browser = await chromium.launch({
		// In CI, run headless; locally, can run headed for debugging
		headless: !process.env.HEADED,
	})

	// Track authentication results
	const results: { role: string; success: boolean }[] = []

	// Authenticate each account
	for (const account of TEST_ACCOUNTS) {
		const success = await authenticateAccount(browser, account, baseURL)
		results.push({ role: account.role, success })
	}

	// Close browser
	await browser.close()

	// Summary
	console.log('\n' + '='.repeat(60))
	console.log('📊 AUTHENTICATION SUMMARY')
	console.log('='.repeat(60))

	const successful = results.filter((r) => r.success)
	const failed = results.filter((r) => !r.success)

	console.log(`✅ Successful: ${successful.length}/${results.length}`)
	successful.forEach((r) => console.log(`   - ${r.role}`))

	if (failed.length > 0) {
		console.log(`❌ Failed: ${failed.length}/${results.length}`)
		failed.forEach((r) => console.log(`   - ${r.role}`))

		// Don't fail setup completely - allow tests to run for authenticated roles
		console.log('\n⚠️  Some authentications failed. Tests for those roles will be skipped.')
	}

	console.log('\n' + '='.repeat(60) + '\n')
}

export default globalSetup
