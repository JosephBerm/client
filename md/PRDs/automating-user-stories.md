# Automating User Stories: End-to-End Role-Based Testing Strategy

> **Document Version**: 1.0  
> **Last Updated**: January 2026  
> **Stack**: Next.js 16.1.1, React 19.2.3, Playwright 1.56.1, TypeScript 5.9.3  
> **Author**: AI Research Assistant

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Industry Best Practices 2025-2026](#industry-best-practices-2025-2026)
3. [Our Stack Analysis](#our-stack-analysis)
4. [Recommended Architecture](#recommended-architecture)
5. [Role-Based Test Strategy](#role-based-test-strategy)
6. [Implementation Guide](#implementation-guide)
7. [AI-Enhanced Testing](#ai-enhanced-testing)
8. [MCP Integration for Cursor IDE](#mcp-integration-for-cursor-ide)
9. [Test Data Management](#test-data-management)
10. [CI/CD Integration](#cicd-integration)
11. [Usage Examples](#usage-examples)
12. [Official Documentation References](#official-documentation-references)

---

## Executive Summary

This document outlines a **MAANG-level approach** to automating end-to-end (E2E) user story testing across all user roles in the MedSource Pro application. The goal is to enable commands like:

```bash
npm run test:e2e:customer-journey
# Uses: customer-tester@medsource.com / CustomerTester2026!!
# Tests: Complete order lifecycle from start to finish
```

### Key Recommendations

| Aspect | Tool/Approach | Rationale |
|--------|--------------|-----------|
| **E2E Framework** | Playwright 1.56.1 | Already installed, AI-enhanced agents, best-in-class |
| **Unit Testing** | Vitest 4.0.12 | Already configured with 26 test files |
| **Role Testing** | Playwright Projects | One project per role with storage state |
| **AI Enhancement** | Playwright Agents | Planner, Generator, Healer agents (new in 1.56) |
| **IDE Integration** | Cursor MCP | Browser automation directly in IDE |

---

## Industry Best Practices 2025-2026

### 1. Storage State Authentication Pattern (Official Recommendation)

**Source**: [Playwright Official Documentation - Authentication](https://playwright.dev/docs/auth)

The modern approach to role-based testing is **storage state management**:

```typescript
// Global setup authenticates once per role, saves state
// Tests reuse state - NO login per test
// Result: 70-80% faster test execution
```

**Benefits**:
- Login happens ONCE per role in global setup
- All tests reuse the authenticated state
- Eliminates flaky login-dependent tests
- Dramatically faster test execution

### 2. AI-Driven Test Generation (Playwright 1.56+)

**Source**: [Playwright GitHub - AI Code Generation RFC](https://github.com/microsoft/playwright/issues/35540)

Playwright 1.56 (October 2025) introduced **three AI agents**:

| Agent | Purpose | Benefit |
|-------|---------|---------|
| **Planner Agent** | Analyzes app, identifies critical user paths | Generates human-readable test plans |
| **Generator Agent** | Transforms plans into executable tests | Verifies selectors in real-time |
| **Healer Agent** | Auto-repairs failing tests | Updates selectors when UI changes |

**Reported Results**:
- 70-80% reduction in test creation time
- 60-70% decrease in maintenance efforts

### 3. Shift-Left Testing Strategy

**Source**: [IBM - End-to-End Testing Best Practices](https://www.ibm.com/think/insights/end-to-end-testing-best-practices)

- Integrate E2E testing early in development
- Run tests on every commit
- Use production-like environments
- Maintain test independence

### 4. Model Context Protocol (MCP) Integration

**Source**: [Playwright MCP Documentation](https://playwright.dev/dotnet/agents)

MCP enables AI assistants to interact directly with browsers:
- Generate tests from natural language
- Execute tests from IDE
- Debug tests interactively
- Auto-heal broken selectors

---

## Our Stack Analysis

### Current Configuration

```json
// package.json (current)
{
  "devDependencies": {
    "@playwright/test": "^1.56.1",  // ✅ Latest with AI agents
    "vitest": "^4.0.12"             // ✅ Unit testing configured
  },
  "scripts": {
    "test:e2e": "playwright test",        // ✅ Exists but not configured
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### Our User Roles

```typescript
// From: client/app/_shared/constants/rbac-defaults.ts
export const RoleLevels = {
  Customer: 1000,              // End customer placing orders
  FulfillmentCoordinator: 2000, // Processes/ships orders
  SalesRep: 3000,              // Manages customer relationships
  SalesManager: 4000,          // Oversees sales team
  Admin: 5000,                 // System administration
  SuperAdmin: 9999,            // Full system access
}
```

### Test Accounts Strategy

Create dedicated test accounts for automation:

| Role | Email | Purpose |
|------|-------|---------|
| Customer | `customer-tester@medsource.com` | Order lifecycle tests |
| Fulfillment | `fulfillment-tester@medsource.com` | Order processing tests |
| Sales Rep | `salesrep-tester@medsource.com` | Customer management tests |
| Sales Manager | `salesmanager-tester@medsource.com` | Team oversight tests |
| Admin | `admin-tester@medsource.com` | System admin tests |
| Super Admin | `superadmin-tester@medsource.com` | Full access tests |

---

## Recommended Architecture

### Directory Structure

```
client/
├── e2e/
│   ├── fixtures/
│   │   ├── auth.fixture.ts       # Authentication fixtures
│   │   ├── test-data.fixture.ts  # Test data fixtures
│   │   └── index.ts
│   ├── pages/                    # Page Object Models
│   │   ├── LoginPage.ts
│   │   ├── StorePage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   ├── OrderPage.ts
│   │   ├── DashboardPage.ts
│   │   └── index.ts
│   ├── journeys/                 # User journey tests
│   │   ├── customer/
│   │   │   ├── order-lifecycle.spec.ts
│   │   │   ├── browse-products.spec.ts
│   │   │   └── manage-profile.spec.ts
│   │   ├── fulfillment/
│   │   │   ├── process-order.spec.ts
│   │   │   └── shipping.spec.ts
│   │   ├── sales/
│   │   │   ├── manage-customers.spec.ts
│   │   │   └── quotes.spec.ts
│   │   └── admin/
│   │       ├── user-management.spec.ts
│   │       └── system-settings.spec.ts
│   ├── global-setup.ts           # Authenticates all roles
│   └── global-teardown.ts        # Cleanup
├── playwright.config.ts          # Multi-project configuration
└── .auth/                        # Storage state files (gitignored)
    ├── customer.json
    ├── fulfillment.json
    ├── sales-rep.json
    ├── sales-manager.json
    ├── admin.json
    └── super-admin.json
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

/**
 * MedSource Pro E2E Test Configuration
 * 
 * ARCHITECTURE: Multi-project setup for role-based testing
 * Each project uses a different storage state (auth)
 * 
 * @see https://playwright.dev/docs/test-projects
 * @see https://playwright.dev/docs/auth
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    process.env.CI ? ['github'] : ['line'],
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'on-first-retry',
  },

  /* Global setup/teardown */
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),

  /* Configure projects for different user roles */
  projects: [
    // =============================================
    // SETUP PROJECT - Authenticates all roles
    // =============================================
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },

    // =============================================
    // CUSTOMER ROLE TESTS
    // =============================================
    {
      name: 'customer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/customer.json',
      },
      dependencies: ['setup'],
      testMatch: /customer\/.*.spec.ts/,
    },

    // =============================================
    // FULFILLMENT COORDINATOR TESTS
    // =============================================
    {
      name: 'fulfillment',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/fulfillment.json',
      },
      dependencies: ['setup'],
      testMatch: /fulfillment\/.*.spec.ts/,
    },

    // =============================================
    // SALES REP TESTS
    // =============================================
    {
      name: 'sales-rep',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/sales-rep.json',
      },
      dependencies: ['setup'],
      testMatch: /sales\/.*.spec.ts/,
    },

    // =============================================
    // ADMIN TESTS
    // =============================================
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /admin\/.*.spec.ts/,
    },

    // =============================================
    // CROSS-BROWSER TESTING (Customer role)
    // =============================================
    {
      name: 'customer-firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/customer.json',
      },
      dependencies: ['setup'],
      testMatch: /customer\/order-lifecycle.spec.ts/,
    },
    {
      name: 'customer-webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/customer.json',
      },
      dependencies: ['setup'],
      testMatch: /customer\/order-lifecycle.spec.ts/,
    },

    // =============================================
    // MOBILE TESTING
    // =============================================
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: '.auth/customer.json',
      },
      dependencies: ['setup'],
      testMatch: /customer\/order-lifecycle.spec.ts/,
    },
  ],
})
```

---

## Role-Based Test Strategy

### Test Matrix by Role

| Test Category | Customer | Fulfillment | Sales Rep | Admin | Super Admin |
|---------------|----------|-------------|-----------|-------|-------------|
| Browse Store | ✅ | ❌ | ✅ | ✅ | ✅ |
| Add to Cart | ✅ | ❌ | ❌ | ❌ | ❌ |
| Place Order | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Own Orders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Process Orders | ❌ | ✅ | ❌ | ✅ | ✅ |
| Manage Customers | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ✅ |

### Critical User Journeys to Automate

#### 1. Customer Order Lifecycle (Priority: CRITICAL)

```gherkin
Feature: Customer Order Lifecycle
  As a customer
  I want to browse products, add to cart, and complete an order
  So that I can purchase medical supplies

  Scenario: Complete order from start to finish
    Given I am logged in as a customer
    When I browse the store
    And I add products to my cart
    And I proceed to checkout
    And I complete payment
    Then I should see my order confirmation
    And the order should appear in my order history
```

#### 2. Fulfillment Order Processing (Priority: HIGH)

```gherkin
Feature: Fulfillment Order Processing
  As a fulfillment coordinator
  I want to process and ship orders
  So that customers receive their products

  Scenario: Process order through fulfillment
    Given I am logged in as a fulfillment coordinator
    And there is a pending order
    When I view the order details
    And I confirm the order items
    And I mark the order as shipped
    Then the order status should be "Shipped"
    And the customer should be notified
```

#### 3. Sales Rep Customer Management (Priority: HIGH)

```gherkin
Feature: Sales Rep Customer Management
  As a sales rep
  I want to manage my assigned customers
  So that I can maintain relationships and support orders

  Scenario: View and manage assigned customers
    Given I am logged in as a sales rep
    When I view my customer list
    Then I should see only my assigned customers
    And I should be able to view customer order history
    And I should be able to create quotes for customers
```

---

## Implementation Guide

### Step 1: Global Setup (Authentication)

```typescript
// e2e/global-setup.ts
import { chromium, FullConfig } from '@playwright/test'

/**
 * Global Setup - Authenticates all test accounts
 * 
 * Runs ONCE before all tests, saves storage state for each role.
 * Tests then reuse these states - no login per test!
 * 
 * @see https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
 */

interface TestAccount {
  role: string
  email: string
  password: string
  storageStatePath: string
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    role: 'customer',
    email: process.env.TEST_CUSTOMER_EMAIL || 'customer-tester@medsource.com',
    password: process.env.TEST_CUSTOMER_PASSWORD || 'CustomerTester2026!!',
    storageStatePath: '.auth/customer.json',
  },
  {
    role: 'fulfillment',
    email: process.env.TEST_FULFILLMENT_EMAIL || 'fulfillment-tester@medsource.com',
    password: process.env.TEST_FULFILLMENT_PASSWORD || 'FulfillmentTester2026!!',
    storageStatePath: '.auth/fulfillment.json',
  },
  {
    role: 'sales-rep',
    email: process.env.TEST_SALESREP_EMAIL || 'salesrep-tester@medsource.com',
    password: process.env.TEST_SALESREP_PASSWORD || 'SalesRepTester2026!!',
    storageStatePath: '.auth/sales-rep.json',
  },
  {
    role: 'sales-manager',
    email: process.env.TEST_SALESMANAGER_EMAIL || 'salesmanager-tester@medsource.com',
    password: process.env.TEST_SALESMANAGER_PASSWORD || 'SalesManagerTester2026!!',
    storageStatePath: '.auth/sales-manager.json',
  },
  {
    role: 'admin',
    email: process.env.TEST_ADMIN_EMAIL || 'admin-tester@medsource.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminTester2026!!',
    storageStatePath: '.auth/admin.json',
  },
  {
    role: 'super-admin',
    email: process.env.TEST_SUPERADMIN_EMAIL || 'superadmin-tester@medsource.com',
    password: process.env.TEST_SUPERADMIN_PASSWORD || 'SuperAdminTester2026!!',
    storageStatePath: '.auth/super-admin.json',
  },
]

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use
  const browser = await chromium.launch()

  for (const account of TEST_ACCOUNTS) {
    console.log(`🔐 Authenticating ${account.role}...`)
    
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      // Navigate to login page
      await page.goto(`${baseURL}/login`)

      // Fill login form
      await page.getByLabel('Email').fill(account.email)
      await page.getByLabel('Password').fill(account.password)
      
      // Submit and wait for navigation
      await page.getByRole('button', { name: /sign in|log in/i }).click()
      
      // Wait for successful login (redirect to dashboard or store)
      await page.waitForURL(/\/(dashboard|store|app)/, { timeout: 30000 })

      // Save storage state
      await context.storageState({ path: account.storageStatePath })
      
      console.log(`✅ ${account.role} authenticated successfully`)
    } catch (error) {
      console.error(`❌ Failed to authenticate ${account.role}:`, error)
      throw error
    } finally {
      await context.close()
    }
  }

  await browser.close()
}

export default globalSetup
```

### Step 2: Page Object Models

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

/**
 * Login Page Object Model
 * 
 * Encapsulates all login page interactions.
 * Single source of truth for login selectors.
 * 
 * @see https://playwright.dev/docs/pom
 */
export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly rememberMeCheckbox: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: /sign in|log in/i })
    this.errorMessage = page.getByRole('alert')
    this.rememberMeCheckbox = page.getByLabel(/remember/i)
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check()
    }
    
    await this.submitButton.click()
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorMessage).toContainText(message)
  }
}
```

```typescript
// e2e/pages/StorePage.ts
import { Page, Locator, expect } from '@playwright/test'

/**
 * Store Page Object Model
 * 
 * Encapsulates product browsing and cart operations.
 */
export class StorePage {
  readonly page: Page
  readonly searchInput: Locator
  readonly categoryFilter: Locator
  readonly productGrid: Locator
  readonly cartButton: Locator
  readonly cartBadge: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.getByPlaceholder(/search/i)
    this.categoryFilter = page.getByRole('combobox', { name: /category/i })
    this.productGrid = page.getByTestId('product-grid')
    this.cartButton = page.getByRole('link', { name: /cart/i })
    this.cartBadge = page.getByTestId('cart-badge')
  }

  async goto() {
    await this.page.goto('/store')
  }

  async searchProduct(query: string) {
    await this.searchInput.fill(query)
    await this.searchInput.press('Enter')
    await this.page.waitForLoadState('networkidle')
  }

  async selectCategory(category: string) {
    await this.categoryFilter.selectOption(category)
    await this.page.waitForLoadState('networkidle')
  }

  async addProductToCart(productName: string) {
    const productCard = this.page.getByTestId('product-card').filter({
      hasText: productName
    })
    await productCard.getByRole('button', { name: /add to cart/i }).click()
  }

  async getCartItemCount(): Promise<number> {
    const text = await this.cartBadge.textContent()
    return parseInt(text || '0', 10)
  }

  async expectProductInGrid(productName: string) {
    await expect(this.productGrid).toContainText(productName)
  }
}
```

```typescript
// e2e/pages/CartPage.ts
import { Page, Locator, expect } from '@playwright/test'

/**
 * Cart Page Object Model
 */
export class CartPage {
  readonly page: Page
  readonly cartItems: Locator
  readonly totalPrice: Locator
  readonly checkoutButton: Locator
  readonly emptyCartMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.cartItems = page.getByTestId('cart-item')
    this.totalPrice = page.getByTestId('cart-total')
    this.checkoutButton = page.getByRole('button', { name: /checkout|proceed/i })
    this.emptyCartMessage = page.getByText(/cart is empty/i)
  }

  async goto() {
    await this.page.goto('/cart')
  }

  async updateQuantity(productName: string, quantity: number) {
    const item = this.cartItems.filter({ hasText: productName })
    await item.getByRole('spinbutton').fill(quantity.toString())
  }

  async removeItem(productName: string) {
    const item = this.cartItems.filter({ hasText: productName })
    await item.getByRole('button', { name: /remove|delete/i }).click()
  }

  async proceedToCheckout() {
    await this.checkoutButton.click()
  }

  async expectItemInCart(productName: string) {
    await expect(this.cartItems.filter({ hasText: productName })).toBeVisible()
  }

  async expectTotal(amount: string | RegExp) {
    await expect(this.totalPrice).toContainText(amount)
  }
}
```

```typescript
// e2e/pages/CheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test'

/**
 * Checkout Page Object Model
 */
export class CheckoutPage {
  readonly page: Page
  readonly shippingAddressForm: Locator
  readonly paymentMethodSection: Locator
  readonly orderSummary: Locator
  readonly placeOrderButton: Locator
  readonly confirmationMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.shippingAddressForm = page.getByTestId('shipping-form')
    this.paymentMethodSection = page.getByTestId('payment-section')
    this.orderSummary = page.getByTestId('order-summary')
    this.placeOrderButton = page.getByRole('button', { name: /place order|confirm/i })
    this.confirmationMessage = page.getByTestId('order-confirmation')
  }

  async fillShippingAddress(address: {
    street: string
    city: string
    state: string
    zip: string
  }) {
    await this.page.getByLabel(/street|address/i).fill(address.street)
    await this.page.getByLabel(/city/i).fill(address.city)
    await this.page.getByLabel(/state/i).fill(address.state)
    await this.page.getByLabel(/zip|postal/i).fill(address.zip)
  }

  async selectPaymentMethod(method: 'credit-card' | 'invoice' | 'purchase-order') {
    await this.page.getByRole('radio', { name: new RegExp(method, 'i') }).check()
  }

  async placeOrder() {
    await this.placeOrderButton.click()
  }

  async expectConfirmation() {
    await expect(this.confirmationMessage).toBeVisible()
  }

  async getOrderNumber(): Promise<string> {
    const text = await this.confirmationMessage.textContent()
    const match = text?.match(/order[:\s#]*(\w+)/i)
    return match?.[1] || ''
  }
}
```

### Step 3: Test Fixtures

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { StorePage } from '../pages/StorePage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'

/**
 * Custom Test Fixtures
 * 
 * Extends Playwright's test with our Page Objects
 * 
 * @see https://playwright.dev/docs/test-fixtures
 */

type PageObjects = {
  loginPage: LoginPage
  storePage: StorePage
  cartPage: CartPage
  checkoutPage: CheckoutPage
}

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  
  storePage: async ({ page }, use) => {
    await use(new StorePage(page))
  },
  
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page))
  },
  
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page))
  },
})

export { expect } from '@playwright/test'
```

### Step 4: User Journey Tests

```typescript
// e2e/journeys/customer/order-lifecycle.spec.ts
import { test, expect } from '../../fixtures/auth.fixture'

/**
 * Customer Order Lifecycle Tests
 * 
 * CRITICAL PATH: Complete order from browsing to confirmation
 * 
 * Prerequisites:
 * - Customer test account exists
 * - Products available in store
 * - Payment processing enabled (test mode)
 */

test.describe('Customer Order Lifecycle', () => {
  test.describe.configure({ mode: 'serial' }) // Run in order

  test('should browse store and view products', async ({ storePage }) => {
    await storePage.goto()
    
    // Verify store loaded
    await expect(storePage.productGrid).toBeVisible()
    
    // Search for a specific product
    await storePage.searchProduct('surgical gloves')
    await storePage.expectProductInGrid('Surgical Gloves')
  })

  test('should add products to cart', async ({ storePage, cartPage }) => {
    await storePage.goto()
    
    // Add first product
    await storePage.addProductToCart('Surgical Gloves')
    await expect(storePage.cartBadge).toHaveText('1')
    
    // Add second product
    await storePage.addProductToCart('Face Masks')
    await expect(storePage.cartBadge).toHaveText('2')
    
    // Navigate to cart
    await cartPage.goto()
    await cartPage.expectItemInCart('Surgical Gloves')
    await cartPage.expectItemInCart('Face Masks')
  })

  test('should complete checkout process', async ({ cartPage, checkoutPage }) => {
    await cartPage.goto()
    await cartPage.proceedToCheckout()
    
    // Fill shipping info
    await checkoutPage.fillShippingAddress({
      street: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      zip: '90210',
    })
    
    // Select payment method
    await checkoutPage.selectPaymentMethod('invoice')
    
    // Place order
    await checkoutPage.placeOrder()
    
    // Verify confirmation
    await checkoutPage.expectConfirmation()
    const orderNumber = await checkoutPage.getOrderNumber()
    expect(orderNumber).toBeTruthy()
    
    console.log(`✅ Order created: ${orderNumber}`)
  })

  test('should see order in order history', async ({ page }) => {
    await page.goto('/orders')
    
    // Most recent order should be visible
    await expect(page.getByTestId('order-list')).toBeVisible()
    await expect(page.getByText(/pending|processing/i).first()).toBeVisible()
  })
})
```

```typescript
// e2e/journeys/fulfillment/process-order.spec.ts
import { test, expect } from '@playwright/test'

/**
 * Fulfillment Order Processing Tests
 * 
 * Tests the fulfillment coordinator workflow
 */

test.describe('Fulfillment Order Processing', () => {
  test('should view pending orders', async ({ page }) => {
    await page.goto('/app/orders')
    
    // Filter to pending orders
    await page.getByRole('combobox', { name: /status/i }).selectOption('pending')
    
    // Verify orders list
    await expect(page.getByTestId('orders-table')).toBeVisible()
  })

  test('should process an order', async ({ page }) => {
    await page.goto('/app/orders')
    
    // Click first pending order
    await page.getByTestId('order-row').first().click()
    
    // Wait for order detail page
    await expect(page.getByTestId('order-detail')).toBeVisible()
    
    // Update order status
    await page.getByRole('button', { name: /confirm|process/i }).click()
    
    // Verify status changed
    await expect(page.getByText(/processing|confirmed/i)).toBeVisible()
  })

  test('should mark order as shipped', async ({ page }) => {
    await page.goto('/app/orders')
    
    // Filter to processing orders
    await page.getByRole('combobox', { name: /status/i }).selectOption('processing')
    
    // Click first processing order
    await page.getByTestId('order-row').first().click()
    
    // Add tracking info
    await page.getByRole('button', { name: /ship|mark shipped/i }).click()
    await page.getByLabel(/tracking/i).fill('1Z999AA10123456784')
    await page.getByRole('button', { name: /confirm/i }).click()
    
    // Verify status changed
    await expect(page.getByText(/shipped/i)).toBeVisible()
  })
})
```

---

## AI-Enhanced Testing

### Playwright AI Agents (v1.56+)

Playwright 1.56 introduced AI agents that can dramatically improve test automation:

#### 1. Planner Agent

```typescript
// Use Playwright's planner to generate test plans
// Run: npx playwright test --plan

// This generates a human-readable test plan:
// - Identifies critical user paths
// - Suggests test scenarios
// - Maps page interactions
```

#### 2. Generator Agent

```typescript
// Use Playwright's generator for test creation
// Run: npx playwright codegen http://localhost:3000

// New in 1.56: AI-enhanced recording
// - Captures richer metadata
// - Generates better selectors
// - Adds smart assertions
```

#### 3. Healer Agent

```typescript
// e2e/healer.config.ts
// Enable auto-healing for tests

export default {
  // When selectors break, healer attempts to fix
  healing: {
    enabled: true,
    strategies: [
      'text-content',      // Try text-based selectors
      'aria-label',        // Try accessibility attributes
      'test-id',           // Try data-testid attributes
      'structural',        // Try DOM structure
    ],
    // Report healed selectors for review
    reportPath: '.playwright/healed-selectors.json',
  },
}
```

### Using Codegen for Quick Test Creation

```bash
# Start codegen with specific role's storage state
npx playwright codegen --load-storage=.auth/customer.json http://localhost:3000

# Generate tests for specific user flows
npx playwright codegen --save-storage=.auth/temp.json http://localhost:3000/store
```

---

## MCP Integration for Cursor IDE

### Available MCP Tools

Your Cursor IDE has the `cursor-browser-extension` MCP with these tools:

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to URLs |
| `browser_click` | Click elements |
| `browser_fill_form` | Fill form fields |
| `browser_type` | Type text |
| `browser_take_screenshot` | Capture screenshots |
| `browser_snapshot` | Get page state |
| `browser_wait_for` | Wait for conditions |

### Using MCP for Test Development

You can ask me to help test flows using MCP:

```
"Navigate to localhost:3000/login, fill in customer-tester@medsource.com 
and CustomerTester2026!!, then take a screenshot"
```

This allows interactive test development directly in Cursor:
1. Test user flows manually
2. Capture screenshots for documentation
3. Debug failing tests
4. Explore page structure

### Example MCP Test Session

```typescript
// This is how I would execute a test flow via MCP:

// 1. Navigate to login
await CallMcpTool('cursor-browser-extension', 'browser_navigate', {
  url: 'http://localhost:3000/login'
})

// 2. Fill login form
await CallMcpTool('cursor-browser-extension', 'browser_fill_form', {
  fields: [
    { name: 'Email', ref: '[name="email"]', type: 'textbox', value: 'customer-tester@medsource.com' },
    { name: 'Password', ref: '[name="password"]', type: 'textbox', value: 'CustomerTester2026!!' },
  ]
})

// 3. Click submit
await CallMcpTool('cursor-browser-extension', 'browser_click', {
  element: 'Sign In button',
  ref: '[type="submit"]'
})

// 4. Take screenshot
await CallMcpTool('cursor-browser-extension', 'browser_take_screenshot', {})
```

---

## Test Data Management

### Environment Variables

```bash
# .env.test (gitignored)

# Base URL
BASE_URL=http://localhost:3000

# Test Accounts - Customer
TEST_CUSTOMER_EMAIL=customer-tester@medsource.com
TEST_CUSTOMER_PASSWORD=CustomerTester2026!!

# Test Accounts - Fulfillment
TEST_FULFILLMENT_EMAIL=fulfillment-tester@medsource.com
TEST_FULFILLMENT_PASSWORD=FulfillmentTester2026!!

# Test Accounts - Sales Rep
TEST_SALESREP_EMAIL=salesrep-tester@medsource.com
TEST_SALESREP_PASSWORD=SalesRepTester2026!!

# Test Accounts - Sales Manager
TEST_SALESMANAGER_EMAIL=salesmanager-tester@medsource.com
TEST_SALESMANAGER_PASSWORD=SalesManagerTester2026!!

# Test Accounts - Admin
TEST_ADMIN_EMAIL=admin-tester@medsource.com
TEST_ADMIN_PASSWORD=AdminTester2026!!

# Test Accounts - Super Admin
TEST_SUPERADMIN_EMAIL=superadmin-tester@medsource.com
TEST_SUPERADMIN_PASSWORD=SuperAdminTester2026!!
```

### Test Data Fixtures

```typescript
// e2e/fixtures/test-data.fixture.ts

/**
 * Test Data Fixtures
 * 
 * Provides consistent test data across all tests
 */

export const TEST_PRODUCTS = {
  surgical_gloves: {
    name: 'Surgical Gloves',
    sku: 'SG-001',
    price: 29.99,
  },
  face_masks: {
    name: 'N95 Face Masks',
    sku: 'FM-001',
    price: 49.99,
  },
  hand_sanitizer: {
    name: 'Hand Sanitizer 500ml',
    sku: 'HS-001',
    price: 9.99,
  },
}

export const TEST_ADDRESSES = {
  shipping: {
    street: '123 Medical Center Drive',
    city: 'Healthcare City',
    state: 'CA',
    zip: '90210',
    country: 'USA',
  },
  billing: {
    street: '456 Business Park Ave',
    city: 'Commerce Town',
    state: 'CA',
    zip: '90211',
    country: 'USA',
  },
}

export const TEST_CUSTOMER = {
  name: 'Test Customer Inc.',
  contact: 'John Tester',
  email: 'john@testcustomer.com',
  phone: '555-123-4567',
}
```

### Database Seeding (Backend)

```csharp
// server/Services/Testing/TestDataSeeder.cs

/// <summary>
/// Seeds test accounts for E2E testing
/// Run via: dotnet run seed-test-data
/// </summary>
public class TestDataSeeder
{
    public async Task SeedTestAccounts()
    {
        var testAccounts = new[]
        {
            new { Email = "customer-tester@medsource.com", Role = "Customer", Level = 1000 },
            new { Email = "fulfillment-tester@medsource.com", Role = "FulfillmentCoordinator", Level = 2000 },
            new { Email = "salesrep-tester@medsource.com", Role = "SalesRep", Level = 3000 },
            new { Email = "salesmanager-tester@medsource.com", Role = "SalesManager", Level = 4000 },
            new { Email = "admin-tester@medsource.com", Role = "Admin", Level = 5000 },
            new { Email = "superadmin-tester@medsource.com", Role = "SuperAdmin", Level = 9999 },
        };

        foreach (var account in testAccounts)
        {
            await CreateOrUpdateTestAccount(account);
        }
    }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml

name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  # Manual trigger with role selection
  workflow_dispatch:
    inputs:
      role:
        description: 'Role to test (all, customer, fulfillment, sales-rep, admin)'
        required: false
        default: 'all'

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        # Run different roles in parallel
        project: [customer, fulfillment, sales-rep, admin]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json
      
      - name: Install dependencies
        run: npm ci
        working-directory: client
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        working-directory: client
      
      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.project }}
        working-directory: client
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          TEST_CUSTOMER_EMAIL: ${{ secrets.TEST_CUSTOMER_EMAIL }}
          TEST_CUSTOMER_PASSWORD: ${{ secrets.TEST_CUSTOMER_PASSWORD }}
          TEST_FULFILLMENT_EMAIL: ${{ secrets.TEST_FULFILLMENT_EMAIL }}
          TEST_FULFILLMENT_PASSWORD: ${{ secrets.TEST_FULFILLMENT_PASSWORD }}
          TEST_SALESREP_EMAIL: ${{ secrets.TEST_SALESREP_EMAIL }}
          TEST_SALESREP_PASSWORD: ${{ secrets.TEST_SALESREP_PASSWORD }}
          TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.project }}
          path: client/playwright-report/
          retention-days: 30
      
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-screenshots-${{ matrix.project }}
          path: client/test-results/
          retention-days: 7
```

### Package.json Scripts

```json
{
  "scripts": {
    // Existing scripts...
    
    // E2E Test Commands
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    
    // Role-specific tests
    "test:e2e:customer": "playwright test --project=customer",
    "test:e2e:fulfillment": "playwright test --project=fulfillment",
    "test:e2e:sales": "playwright test --project=sales-rep",
    "test:e2e:admin": "playwright test --project=admin",
    
    // User journey tests
    "test:e2e:order-lifecycle": "playwright test journeys/customer/order-lifecycle.spec.ts",
    "test:e2e:customer-journey": "playwright test --project=customer journeys/customer/",
    
    // Codegen for test creation
    "test:e2e:codegen": "playwright codegen",
    "test:e2e:codegen:customer": "playwright codegen --load-storage=.auth/customer.json",
    "test:e2e:codegen:admin": "playwright codegen --load-storage=.auth/admin.json",
    
    // Reports
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Usage Examples

### Running the Full Customer Journey

When you say:

```
USE THE CUSTOMER TEST ACCOUNT:
user: `customer-tester@medsource.com`
password: `CustomerTester2026!!`

RUN THE AUTOMATED TEST THAT ENSURES ORDER CAN BE COMPLETED FROM SCRATCH.
```

I will execute:

```bash
# Option 1: Run via npm script
npm run test:e2e:customer-journey

# Option 2: Run specific test file
npx playwright test journeys/customer/order-lifecycle.spec.ts --project=customer

# Option 3: Run with visual debugging
npx playwright test journeys/customer/order-lifecycle.spec.ts --project=customer --headed --debug
```

### Running All Role Tests

```bash
# Run all projects (all roles)
npm run test:e2e

# Run specific role
npm run test:e2e:customer
npm run test:e2e:fulfillment
npm run test:e2e:sales
npm run test:e2e:admin

# Run with UI mode (interactive)
npm run test:e2e:ui
```

### Generating New Tests

```bash
# Start codegen as customer
npm run test:e2e:codegen:customer

# This opens a browser logged in as customer
# Record your actions, then copy generated code
```

---

## Official Documentation References

### Playwright

| Topic | URL |
|-------|-----|
| Authentication | https://playwright.dev/docs/auth |
| Test Projects | https://playwright.dev/docs/test-projects |
| Page Object Model | https://playwright.dev/docs/pom |
| Test Fixtures | https://playwright.dev/docs/test-fixtures |
| Best Practices | https://playwright.dev/docs/best-practices |
| CI/CD Integration | https://playwright.dev/docs/ci |
| AI Codegen RFC | https://github.com/microsoft/playwright/issues/35540 |

### Next.js

| Topic | URL |
|-------|-----|
| Testing with Playwright | https://nextjs.org/docs/pages/guides/testing/playwright |

### Industry Best Practices

| Source | URL |
|--------|-----|
| IBM E2E Testing | https://www.ibm.com/think/insights/end-to-end-testing-best-practices |
| Bunnyshell E2E Guide | https://www.bunnyshell.com/blog/best-practices-for-end-to-end-testing-in-2025 |

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Create `playwright.config.ts` with multi-project setup
- [ ] Create test accounts in database
- [ ] Implement `global-setup.ts` for authentication
- [ ] Add `.auth/` to `.gitignore`
- [ ] Create base Page Object Models

### Phase 2: Core Tests (Week 2)

- [ ] Customer order lifecycle test
- [ ] Fulfillment order processing test
- [ ] Sales rep customer management test
- [ ] Admin user management test

### Phase 3: Integration (Week 3)

- [ ] Set up CI/CD workflow
- [ ] Configure environment secrets
- [ ] Add test reporting
- [ ] Document test accounts

### Phase 4: Enhancement (Ongoing)

- [ ] Add cross-browser tests
- [ ] Add mobile tests
- [ ] Implement AI-enhanced healing
- [ ] Create visual regression tests

---

## Summary

This document provides a comprehensive guide to automating user story testing for MedSource Pro. The key takeaways:

1. **Use Playwright's storage state pattern** - Authenticate once per role, reuse everywhere
2. **Multi-project configuration** - One project per role with dedicated tests
3. **Page Object Model** - Encapsulate page interactions for maintainability
4. **AI-enhanced testing** - Leverage Playwright 1.56's agents for efficiency
5. **MCP integration** - Use Cursor's browser extension for interactive testing
6. **CI/CD integration** - Run role-based tests in parallel on every commit

When you're ready to run tests, simply tell me:

```
Run the customer order lifecycle test using the test account
```

And I'll execute the full test suite or help debug any issues.

---

*Document generated based on research conducted January 2026, using official documentation and industry best practices.*
