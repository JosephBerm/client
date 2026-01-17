# 03 - Test Design Rules

> **Document**: Playwright Integration Plan - Part 3 of 5
> **Version**: 1.0
> **Last Updated**: January 2026
> **Status**: Implementation Ready

---

## 1. Overview

This document establishes strict implementation rules for all Playwright tests in MedSource Pro. These rules are enforced through code review, linting, and CI checks.

**Philosophy**: These rules are harsh by design. Discipline in test design prevents flaky tests, reduces maintenance burden, and ensures the test suite remains a reliable quality gate.

---

## 2. Best Practices Analysis

The following MAANG-level practices were evaluated against MedSource Pro's specific needs:

### 2.1 Adopted Rules (MANDATORY)

| Practice                               | Why It Applies                          | Enforcement              |
| -------------------------------------- | --------------------------------------- | ------------------------ |
| Test user journeys, not implementation | Order lifecycle is the critical path    | Code review              |
| Stable locators (role/label/testid)    | Prevents brittle DOM-dependent tests    | Strict selectors enabled |
| No fixed sleeps                        | Deterministic tests require auto-waits  | ESLint rule              |
| Centralize auth (storageState)         | Already implemented, must be maintained | Architecture             |
| Keep tests independent                 | Parallel execution requires isolation   | Code review              |
| Arrange/Act/Assert structure           | Readability and consistency             | Code review              |
| API setup over UI setup                | Faster, less flaky data creation        | Encouraged               |
| Unique disposable data                 | Prevents test collisions                | Helper functions         |
| Fixtures for everything                | Page objects, test data, users          | Architecture             |
| One assertion theme per test           | Focused, debuggable tests               | Code review              |
| Tag and shard tests                    | @smoke, @critical for CI filtering      | Config                   |
| Screenshots/video on failure           | Debugging artifacts                     | Config                   |
| Trace on first retry                   | Root cause analysis                     | Config                   |
| Strict mode                            | Fail on ambiguous selectors             | Config                   |
| Custom assertion messages              | Helpful failure output                  | Code review              |
| Treat tests as production code         | Reviews, types, ownership               | Process                  |

### 2.2 Deferred Rules (NOT YET NEEDED)

| Practice               | Why Deferred                 | When to Revisit             |
| ---------------------- | ---------------------------- | --------------------------- |
| Mock/replay APIs       | Internal APIs are stable     | When flakiness increases    |
| Time freezing          | Date-dependent UI is minimal | When date tests are added   |
| Cross-browser on PRs   | Too slow for PR checks       | Schedule in nightly         |
| Performance budgets    | Suite is small currently     | When runtime exceeds 10 min |
| Feature flag awareness | Not feature-flagged yet      | When flags are added        |

### 2.3 Rejected Rules (NOT APPLICABLE)

| Practice                       | Why Rejected                          |
| ------------------------------ | ------------------------------------- |
| Per-test tenant isolation      | Single-tenant test environment        |
| Global mutable state avoidance | Already using Playwright fixtures     |
| Version pinning of browsers    | Playwright handles this automatically |

### 2.4 Business-Critical Assertions (MANDATORY)

These assertions align tests with Prometheus business goals and must appear in critical flows:

-   **Quote-to-order traceability**: quotes must show approval status and convert to orders with a clear audit trail.
-   **Pricing explainability**: any pricing override or discount must expose a \"Why this price?\" explanation.
-   **Margin guardrails**: overrides that violate floors/caps must be blocked or require approval.
-   **ERP reliability signals**: order export/sync status must be visible and consistent for ERP-connected workflows.
-   **White-label limits**: configuration changes must not alter core workflow logic.

---

## 3. Locator Contract

### 3.1 Locator Priority (MANDATORY)

Use locators in this order of preference:

```typescript
// 1. BEST: Role-based (accessible, stable)
page.getByRole('button', { name: /submit/i })
page.getByRole('textbox', { name: /email/i })
page.getByRole('heading', { level: 1 })

// 2. GOOD: Label-based (accessible)
page.getByLabel(/email address/i)
page.getByLabel(/password/i)

// 3. ACCEPTABLE: Placeholder-based
page.getByPlaceholder(/search products/i)

// 4. ACCEPTABLE: Text-based (for static content)
page.getByText(/order confirmed/i)

// 5. LAST RESORT: Test ID (when above fail)
page.getByTestId('product-grid')

// 6. FORBIDDEN: CSS/XPath selectors
// page.locator('.btn-primary')  // NO
// page.locator('//div[@class="header"]')  // NO
```

### 3.2 Locator Fallbacks

When multiple strategies might work, use `.or()`:

```typescript
// CORRECT: Fallback chain
const submitButton = page.getByRole('button', { name: /submit|sign in/i }).or(page.locator('button[type="submit"]'))

// INCORRECT: JavaScript || operator (always returns first)
const submitButton = page.getByRole('button') || page.locator('button')
```

### 3.3 Strict Selectors

Strict mode is enabled in `playwright.config.ts`:

```typescript
use: {
  contextOptions: {
    strictSelectors: true, // Fail on ambiguous selectors
  },
}
```

This means:

-   Locators matching multiple elements will throw
-   Forces precise, intentional element selection
-   Catches accidental broad selectors early

---

## 4. Test Structure Rules

### 4.1 Arrange/Act/Assert Pattern (MANDATORY)

Every test must follow this structure:

```typescript
test('should complete checkout', async ({ storePage, cartPage }) => {
	// ARRANGE - Set up preconditions
	await storePage.goto()
	await storePage.addProductToCart('Surgical Gloves')

	// ACT - Perform the action under test
	await cartPage.goto()
	await cartPage.proceedToCheckout()

	// ASSERT - Verify the outcome
	await expect(page).toHaveURL(/checkout/)
})
```

### 4.2 One Theme Per Test (MANDATORY)

Each test should verify ONE logical outcome:

```typescript
// CORRECT: Focused tests
test('should display product search results', async ({ storePage }) => {
	await storePage.goto()
	await storePage.searchProduct('gloves')
	await expect(storePage.productGrid).toBeVisible()
})

test('should show empty state for no results', async ({ storePage }) => {
	await storePage.goto()
	await storePage.searchProduct('xyznonexistent')
	await expect(storePage.noResultsMessage).toBeVisible()
})

// INCORRECT: Kitchen sink test
test('should handle all search scenarios', async ({ storePage }) => {
	// Tests multiple unrelated things
	await storePage.searchProduct('gloves')
	await expect(storePage.productGrid).toBeVisible()
	await storePage.searchProduct('xyznonexistent')
	await expect(storePage.noResultsMessage).toBeVisible()
	await storePage.clearSearch()
	await expect(storePage.productGrid).toBeVisible()
})
```

### 4.3 Test Naming Convention

```typescript
// Pattern: should [action] [expected outcome]
test('should display error for invalid credentials', ...)
test('should add product to cart', ...)
test('should navigate to order details', ...)

// NOT: vague or implementation-focused names
test('test login', ...)  // NO
test('clicking submit button', ...)  // NO
test('API returns 200', ...)  // NO
```

---

## 5. Wait and Timing Rules

### 5.1 No Fixed Sleeps (FORBIDDEN)

```typescript
// FORBIDDEN: Never use fixed waits
await page.waitForTimeout(5000) // NO
await new Promise((r) => setTimeout(r, 2000)) // NO

// CORRECT: Wait for specific conditions
await expect(page.getByText('Order confirmed')).toBeVisible()
await page.waitForURL(/\/confirmation/)
await page.waitForLoadState('networkidle')
```

### 5.2 Acceptable Wait Patterns

```typescript
// Wait for element visibility
await expect(locator).toBeVisible({ timeout: 10000 })

// Wait for URL change
await page.waitForURL(/\/dashboard/)

// Wait for network
await page.waitForLoadState('networkidle')
await page.waitForResponse((resp) => resp.url().includes('/api/orders'))

// Wait for element state
await expect(locator).toBeEnabled()
await expect(locator).toHaveValue('expected')
```

### 5.3 Timeout Configuration

```typescript
// Global timeouts (playwright.config.ts)
timeout: 30000,  // Test timeout
expect: { timeout: 5000 },  // Assertion timeout
use: {
  actionTimeout: 10000,  // Click, fill, etc.
  navigationTimeout: 30000,  // goto, click navigation
}
```

---

## 6. Page Object Rules

### 6.1 Keep Page Objects Thin (MANDATORY)

Page objects should:

-   Expose meaningful actions (not raw selectors)
-   NOT contain assertions (put in tests)
-   NOT hide business logic

```typescript
// CORRECT: Thin page object
class CartPage extends BasePage {
	readonly cartItems: Locator
	readonly checkoutButton: Locator

	async proceedToCheckout(): Promise<void> {
		await this.checkoutButton.click()
	}

	async getItemCount(): Promise<number> {
		return this.cartItems.count()
	}
}

// INCORRECT: Fat page object with assertions
class CartPage extends BasePage {
	async verifyCartHasItems(): Promise<void> {
		// Assertions don't belong in page objects
		await expect(this.cartItems.first()).toBeVisible()
	}
}
```

### 6.2 Page Object Structure

All page objects must:

1. Extend `BasePage`
2. Implement `goto()` method
3. Implement `expectLoaded()` method
4. Declare locators as readonly properties

```typescript
export class OrdersPage extends BasePage {
	readonly ordersTable: Locator
	readonly orderRows: Locator

	constructor(page: Page) {
		super(page)
		this.ordersTable = page.getByRole('table')
		this.orderRows = page.getByTestId('order-row')
	}

	async goto(): Promise<void> {
		await this.page.goto('/orders')
		await this.waitForLoad()
	}

	async expectLoaded(): Promise<void> {
		await expect(this.ordersTable).toBeVisible()
	}
}
```

---

## 7. Data Isolation Rules

### 7.1 No Shared Mutable State (MANDATORY)

Tests must not depend on each other:

```typescript
// FORBIDDEN: Shared state between tests
let orderId: string // Module-level variable

test('create order', async () => {
	orderId = await createOrder() // Sets shared state
})

test('verify order', async () => {
	await verifyOrder(orderId) // Depends on previous test
})

// CORRECT: Self-contained tests
test('create and verify order', async () => {
	const orderId = await createOrder()
	await verifyOrder(orderId)
})

// ACCEPTABLE: Serial tests with explicit dependency
test.describe('Order Lifecycle', () => {
	test.describe.configure({ mode: 'serial' })
	let orderId: string // Scoped to describe block

	test('create order', async () => {
		orderId = await createOrder()
	})

	test('verify order', async () => {
		await verifyOrder(orderId)
	})
})
```

### 7.2 Unique Test Data (MANDATORY)

All test-created data must be unique:

```typescript
// CORRECT: Unique identifiers
const email = generateTestEmail('customer') // customer-1705123456789@test.com
const poNumber = generateTestPONumber() // PO-TEST-1705123456789

// INCORRECT: Static data that collides
const email = 'test@test.com' // Will collide with other tests
```

---

## 8. Assertion Rules

### 8.1 Use Playwright Assertions (MANDATORY)

```typescript
// CORRECT: Playwright's expect with auto-retry
await expect(page.getByText('Success')).toBeVisible()
await expect(page).toHaveURL(/\/confirmation/)
await expect(locator).toHaveText('Order #123')

// INCORRECT: Jest-style assertions (no auto-retry)
expect(await page.isVisible('.success')).toBe(true) // NO
```

### 8.2 Custom Assertion Messages (ENCOURAGED)

```typescript
// Add context for debugging
await expect(submitButton, 'Submit button should be enabled after form is valid').toBeEnabled()

await expect(orderNumber, `Order number should be visible after checkout`).toBeVisible()
```

### 8.3 Soft Assertions (USE SPARINGLY)

```typescript
// For non-critical checks that shouldn't fail the test
import { softExpect } from '../utils'

test('check page elements', async ({ page }) => {
	// Critical assertion - fails test
	await expect(page.getByRole('main')).toBeVisible()

	// Soft assertion - logs warning but continues
	softExpect((await page.title()) === 'Expected Title', 'Page title mismatch')
})
```

---

## 9. Tagging Rules

### 9.1 Required Tags

Every test file should have appropriate tags:

| Tag           | Meaning                        | When to Use             |
| ------------- | ------------------------------ | ----------------------- |
| `@smoke`      | Critical path, run on every PR | Order completion, login |
| `@critical`   | Must pass for release          | Core workflows          |
| `@regression` | Full coverage                  | All tests               |
| `@slow`       | Takes >30 seconds              | Complex workflows       |
| `@flaky`      | Known intermittent failures    | Quarantined tests       |

### 9.2 Tag Implementation

```typescript
// In test file
test('should complete order @smoke @critical', async ({ page }) => {
	// ...
})

// Or using test.describe
test.describe('Order Lifecycle @smoke', () => {
	// All tests in block inherit tag
})
```

### 9.3 Running Tagged Tests

```bash
# Run smoke tests only
npm run test:e2e -- --grep @smoke

# Run all except slow tests
npm run test:e2e -- --grep-invert @slow

# Run critical tests for a specific role
npm run test:e2e:customer -- --grep @critical
```

---

## 10. Code Review Checklist

Before approving any test PR, verify:

### 10.1 Structure

-   [ ] Follows AAA pattern
-   [ ] One assertion theme per test
-   [ ] Descriptive test names

### 10.2 Locators

-   [ ] Uses role/label/testid (no CSS/XPath)
-   [ ] Strict selectors would pass
-   [ ] Fallbacks use `.or()` not `||`

### 10.3 Timing

-   [ ] No `waitForTimeout` or fixed sleeps
-   [ ] Uses Playwright auto-waits
-   [ ] Reasonable timeouts

### 10.4 Data

-   [ ] No hardcoded credentials
-   [ ] Unique test data generated
-   [ ] No shared mutable state (unless serial)

### 10.5 Page Objects

-   [ ] Thin (actions only, no assertions)
-   [ ] Extends BasePage
-   [ ] Has goto() and expectLoaded()

---

## 11. Red Lines (AUTOMATIC REJECTION)

The following will result in immediate PR rejection:

1. **Any `waitForTimeout()` call** - Use proper waits
2. **Hardcoded credentials** - Use environment variables
3. **CSS class selectors** - Use accessible locators
4. **XPath selectors** - Use accessible locators
5. **Tests depending on execution order** - Use serial mode explicitly
6. **Assertions in page objects** - Keep assertions in tests
7. **Missing test tags** - All tests need @smoke, @critical, or @regression
8. **Commented-out tests** - Delete or fix them
9. **Critical flows without pricing or audit assertions** - Pricing and quote workflows must validate traceability
10. **ERP flows without sync validation** - Export/sync must be asserted when included

---

## 12. ESLint Rules

Add to `client/.eslintrc.js`:

```javascript
// Playwright-specific rules
'no-restricted-syntax': [
  'error',
  {
    selector: 'CallExpression[callee.property.name="waitForTimeout"]',
    message: 'waitForTimeout is forbidden. Use proper Playwright waits.',
  },
],
```

---

## 13. References

-   [Playwright Best Practices](https://playwright.dev/docs/best-practices)
-   [Playwright Locators](https://playwright.dev/docs/locators)
-   [Existing Page Objects](../../e2e/pages/)
-   [Test Fixtures](../../e2e/fixtures/)
