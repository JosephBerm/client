/**
 * Playwright Configuration - MedSource Pro E2E Testing
 *
 * ARCHITECTURE: Multi-project setup for role-based testing
 * Each project uses a different storage state (authenticated session)
 *
 * VERSION: Playwright 1.57.0
 * - Uses Chrome for Testing (not Chromium) for headed/headless
 * - Speedboard in HTML reporter for performance analysis
 * - New testConfig.tag for report merging
 * - Service Worker network requests now routable
 *
 * @see https://playwright.dev/docs/test-configuration
 * @see https://playwright.dev/docs/auth
 * @see https://playwright.dev/docs/test-projects
 */

import { defineConfig, devices } from '@playwright/test'
import path from 'path'

/**
 * Environment configuration
 * @see https://playwright.dev/docs/test-configuration#use-options
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const IS_CI = !!process.env.CI

// Storage state paths for authenticated sessions
const AUTH_DIR = path.join(__dirname, '.auth')

export default defineConfig({
	// Test directory structure
	testDir: './e2e',
	testMatch: '**/*.spec.ts',

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if test.only is left in code
	forbidOnly: IS_CI,

	// Retry configuration
	retries: IS_CI ? 2 : 0,

	// Limit parallel workers on CI
	workers: IS_CI ? 1 : undefined,

	// Reporter configuration
	// v1.57.0: Speedboard tab for performance analysis
	reporter: [
		['html', { open: IS_CI ? 'never' : 'on-failure', outputFolder: 'playwright-report' }],
		['list'],
		IS_CI ? ['github'] : ['line'],
		['json', { outputFile: 'test-results/results.json' }],
	],

	// Global test timeout
	timeout: 30000,

	// Expect timeout
	expect: {
		timeout: 5000,
	},

	// Shared settings for all projects
	use: {
		// Base URL for page.goto()
		baseURL: BASE_URL,

		// Collect trace on first retry
		trace: 'on-first-retry',

		// Screenshot on failure
		screenshot: 'only-on-failure',

		// Video on failure (first retry)
		video: 'on-first-retry',

		// Action timeout
		actionTimeout: 10000,

		// Navigation timeout
		navigationTimeout: 30000,

		// Viewport size
		viewport: { width: 1280, height: 720 },

		// Locale
		locale: 'en-US',

		// Timezone
		timezoneId: 'America/New_York',

		// Geolocation (optional, for location-based features)
		// geolocation: { longitude: -73.935242, latitude: 40.730610 },

		// Browser context options
		contextOptions: {
			strictSelectors: true, // Fail on ambiguous selectors
		},
	},

	// Global setup/teardown for authentication
	globalSetup: require.resolve('./e2e/global-setup'),
	globalTeardown: require.resolve('./e2e/global-teardown'),

	// Web server configuration
	// Starts Next.js dev server before tests if not running
	webServer: {
		command: 'npm run dev',
		url: BASE_URL,
		reuseExistingServer: !IS_CI,
		timeout: 120000, // 2 minutes for Next.js to start
		// v1.57.0: New wait option for log-based readiness
		// wait: /ready started server on/i,
	},

	// Output directory for test artifacts
	outputDir: 'test-results',

	// Configure projects for different user roles
	projects: [
		// =============================================
		// SETUP PROJECT - Authenticates all roles
		// Runs first, other projects depend on it
		// =============================================
		{
			name: 'setup',
			testMatch: /global-setup\.ts/,
			teardown: 'teardown',
		},

		{
			name: 'teardown',
			testMatch: /global-teardown\.ts/,
		},

		// =============================================
		// CUSTOMER ROLE TESTS
		// Level 1000 - End customers placing orders
		// =============================================
		{
			name: 'customer',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(AUTH_DIR, 'customer.json'),
			},
			dependencies: ['setup'],
			testMatch: [
				/journeys\/customer\/.*.spec.ts/,
				/journeys\/auth\/.*customer.*.spec.ts/,
				/journeys\/security\/.*Customer.*.spec.ts/,
			],
			// Tag for report organization (v1.57.0+)
			// tag: '@customer',
		},

		// =============================================
		// FULFILLMENT COORDINATOR TESTS
		// Level 2000 - Order processing and shipping
		// =============================================
		{
			name: 'fulfillment',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(AUTH_DIR, 'fulfillment.json'),
			},
			dependencies: ['setup'],
			testMatch: [
				/journeys\/fulfillment\/.*.spec.ts/,
				/journeys\/auth\/.*fulfillment.*.spec.ts/,
				/journeys\/security\/.*Fulfillment.*.spec.ts/,
			],
			// tag: '@fulfillment',
		},

		// =============================================
		// SALES REP TESTS
		// Level 3000 - Customer relationship management
		// =============================================
		{
			name: 'sales-rep',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(AUTH_DIR, 'sales-rep.json'),
			},
			dependencies: ['setup'],
			testMatch: [
				/journeys\/sales\/.*.spec.ts/,
				/journeys\/auth\/.*sales-rep.*.spec.ts/,
				/journeys\/security\/.*Sales.Rep.*.spec.ts/,
			],
			// tag: '@sales',
		},

		// =============================================
		// SALES MANAGER TESTS
		// Level 4000 - Team oversight
		// =============================================
		{
			name: 'sales-manager',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(AUTH_DIR, 'sales-manager.json'),
			},
			dependencies: ['setup'],
			testMatch: [/journeys\/sales-manager\/.*.spec.ts/, /journeys\/auth\/.*sales-manager.*.spec.ts/],
			// tag: '@sales-manager',
		},

		// =============================================
		// ADMIN TESTS
		// Level 5000 - System administration
		// =============================================
		{
			name: 'admin',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(AUTH_DIR, 'admin.json'),
			},
			dependencies: ['setup'],
			testMatch: [
				/journeys\/admin\/.*.spec.ts/,
				/journeys\/auth\/.*admin.*.spec.ts/,
				/journeys\/security\/.*Admin.*.spec.ts/,
			],
			// tag: '@admin',
		},

		// =============================================
		// SUPER ADMIN TESTS
		// Level 9999 - Full system access
		// =============================================
		{
			name: 'super-admin',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(AUTH_DIR, 'super-admin.json'),
			},
			dependencies: ['setup'],
			testMatch: [/journeys\/super-admin\/.*.spec.ts/, /journeys\/auth\/.*super-admin.*.spec.ts/],
			// tag: '@super-admin',
		},

		// =============================================
		// UNAUTHENTICATED TESTS
		// Public pages, login, signup
		// =============================================
		{
			name: 'unauthenticated',
			use: {
				...devices['Desktop Chrome'],
				// No storageState - fresh browser context
			},
			testMatch: /journeys\/public\/.*.spec.ts/,
			// tag: '@public',
		},

		// =============================================
		// CROSS-BROWSER TESTING (Customer critical path)
		// =============================================
		{
			name: 'customer-firefox',
			use: {
				...devices['Desktop Firefox'],
				storageState: path.join(AUTH_DIR, 'customer.json'),
			},
			dependencies: ['setup'],
			testMatch: /journeys\/customer\/order-lifecycle.spec.ts/,
			// tag: '@cross-browser',
		},
		{
			name: 'customer-webkit',
			use: {
				...devices['Desktop Safari'],
				storageState: path.join(AUTH_DIR, 'customer.json'),
			},
			dependencies: ['setup'],
			testMatch: /journeys\/customer\/order-lifecycle.spec.ts/,
			// tag: '@cross-browser',
		},

		// =============================================
		// MOBILE TESTING
		// =============================================
		{
			name: 'mobile-chrome',
			use: {
				...devices['Pixel 5'],
				storageState: path.join(AUTH_DIR, 'customer.json'),
			},
			dependencies: ['setup'],
			testMatch: /journeys\/customer\/order-lifecycle.spec.ts/,
			// tag: '@mobile',
		},
		{
			name: 'mobile-safari',
			use: {
				...devices['iPhone 14'],
				storageState: path.join(AUTH_DIR, 'customer.json'),
			},
			dependencies: ['setup'],
			testMatch: /journeys\/customer\/order-lifecycle.spec.ts/,
			// tag: '@mobile',
		},

		// =============================================
		// ACCESSIBILITY TESTING
		// v1.57.0: page.accessibility removed, use @axe-core/playwright
		// =============================================
		{
			name: 'a11y',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(AUTH_DIR, 'customer.json'),
			},
			dependencies: ['setup'],
			testMatch: /journeys\/accessibility\/.*.spec.ts/,
			// tag: '@a11y',
		},
	],
})
