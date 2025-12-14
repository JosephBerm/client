# MedSource Pro - Frontend Testing Strategy

## Executive Summary

**Document Version**: 1.0  
**Date**: December 14, 2025  
**Scope**: Strategic testing plan aligned with business-critical flows for a B2B Medical Supply Quote-Based Platform

---

## 📊 Testing Philosophy: Business-First, Not Coverage-First

### Core Principle: **Test What Matters Most**

We are NOT building tests for the sake of code coverage. We are building tests that:

1. **Protect Revenue-Critical Flows** (Quote submission, Cart, Checkout, Authentication)
2. **Prevent Customer-Facing Bugs** (UI/UX that affects conversions)
3. **Ensure Business Logic Integrity** (Pricing calculations, Status transitions)
4. **Reduce Manual QA Time** (Automate repetitive regression testing)

### What We Will NOT Test (Avoiding Waste)

| Skip Testing | Reason |
|--------------|--------|
| Static pages (About, Contact) | Low risk, rarely change, easy to visually verify |
| Third-party library internals | Already tested by library authors |
| CSS styling details | Visual regression testing is overkill for current stage |
| Every edge case | Focus on happy paths + critical error paths |
| Implementation details | Test behavior, not internal state |

---

## 🎯 Testing Pyramid Strategy

### MAANG-Level Test Distribution (Google's Approach)

```
          ┌─────────────┐
          │     E2E     │  10% (Critical User Journeys)
          │  Playwright │
          ├─────────────┤
          │ Integration │  20% (Component Interactions, API)
          │   Vitest    │
          ├─────────────┤
          │    Unit     │  70% (Business Logic, Utilities)
          │   Vitest    │
          └─────────────┘
```

### Why This Distribution?

| Test Type | Speed | Reliability | Maintenance | Business Value |
|-----------|-------|-------------|-------------|----------------|
| **Unit** | ⚡ Fast | ✅ Stable | Low | High for logic |
| **Integration** | 🔄 Medium | ✅ Stable | Medium | High for flows |
| **E2E** | 🐢 Slow | ⚠️ Flaky risk | High | Highest for UX |

---

## 🔥 Priority 1: Critical Business Flow Tests (MUST HAVE)

These tests directly protect revenue. Failure here = lost sales.

### 1.1 Cart System Tests

**Business Impact**: Cart is the gateway to revenue. Bugs here = lost quotes.

```typescript
// File: app/_features/cart/__tests__/useCartStore.test.ts

describe('Cart Store - Business Critical', () => {
  // MUST TEST: Core operations that affect quote submission
  
  describe('addToCart', () => {
    it('should add product with correct quantity', () => {});
    it('should increment quantity for existing product', () => {});
    it('should handle product with no ID gracefully', () => {});
  });

  describe('removeFromCart', () => {
    it('should remove product by ID', () => {});
    it('should clear cart completely', () => {});
  });

  describe('cart persistence', () => {
    it('should persist cart to localStorage', () => {});
    it('should restore cart on page reload', () => {});
    it('should handle corrupted localStorage gracefully', () => {});
  });

  describe('cart calculations', () => {
    it('should calculate total quantity correctly', () => {});
    it('should return empty cart state when cleared', () => {});
  });
});
```

**What NOT to test in Cart**:
- ❌ UI animations
- ❌ Hover states
- ❌ CSS layout
- ❌ Image loading

---

### 1.2 Authentication System Tests

**Business Impact**: Auth failure = customers can't access their quotes/orders.

```typescript
// File: app/_features/auth/__tests__/useAuthStore.test.ts

describe('Auth Store - Business Critical', () => {
  describe('login flow', () => {
    it('should set user and isAuthenticated on login', () => {});
    it('should persist auth state to localStorage', () => {});
    it('should handle login with invalid credentials', () => {});
  });

  describe('logout flow', () => {
    it('should clear user and isAuthenticated on logout', () => {});
    it('should remove auth from localStorage', () => {});
    it('should redirect to home page', () => {});
  });

  describe('checkAuth (token validation)', () => {
    it('should restore auth state from valid token', () => {});
    it('should clear auth state if token expired', () => {});
    it('should handle network errors gracefully', () => {});
  });

  describe('role-based access', () => {
    it('should identify admin users', () => {});
    it('should identify customer users', () => {});
  });
});
```

---

### 1.3 Quote Submission Flow Tests

**Business Impact**: This is THE revenue-generating action. 100% must work.

```typescript
// File: app/_features/cart/__tests__/quoteSubmission.test.ts

describe('Quote Submission - Revenue Critical', () => {
  describe('form validation', () => {
    it('should require contact name', () => {});
    it('should require valid email address', () => {});
    it('should require phone number', () => {});
    it('should require delivery address', () => {});
    it('should require at least one product in cart', () => {});
  });

  describe('submission behavior', () => {
    it('should send quote request with all cart products', () => {});
    it('should include referral information if provided', () => {});
    it('should include customer ID for authenticated users', () => {});
    it('should clear cart after successful submission', () => {});
    it('should show success message on submission', () => {});
  });

  describe('error handling', () => {
    it('should show error message on network failure', () => {});
    it('should retain cart data on submission failure', () => {});
    it('should handle rate limiting gracefully', () => {});
  });
});
```

---

### 1.4 API Service Tests

**Business Impact**: API failures = application is useless.

```typescript
// File: app/_shared/services/__tests__/httpService.test.ts

describe('HTTP Service - Infrastructure Critical', () => {
  describe('authentication', () => {
    it('should attach JWT token to authenticated requests', () => {});
    it('should handle 401 by clearing auth state', () => {});
    it('should handle 403 without logging out', () => {});
  });

  describe('error handling', () => {
    it('should parse error messages from API responses', () => {});
    it('should handle network errors', () => {});
    it('should handle timeout errors', () => {});
  });

  describe('request cancellation', () => {
    it('should cancel duplicate requests', () => {});
    it('should not cancel non-duplicate requests', () => {});
  });
});
```

---

## 🔶 Priority 2: Integration Tests (SHOULD HAVE)

These tests verify component interactions and data flow.

### 2.1 Cart Page Integration

```typescript
// File: app/cart/__tests__/CartPage.integration.test.tsx

describe('Cart Page Integration', () => {
  it('should render cart items from store', () => {});
  it('should update quantity when buttons clicked', () => {});
  it('should remove item when delete clicked', () => {});
  it('should navigate to quote form on submit', () => {});
  it('should show empty state when cart is empty', () => {});
});
```

### 2.2 Store Page Product Loading

```typescript
// File: app/store/__tests__/StorePage.integration.test.tsx

describe('Store Page Integration', () => {
  it('should load and display products', () => {});
  it('should filter products by category', () => {});
  it('should search products by name', () => {});
  it('should paginate results correctly', () => {});
  it('should add product to cart from store', () => {});
});
```

### 2.3 Internal Dashboard (Admin) Integration

```typescript
// File: app/app/__tests__/Dashboard.integration.test.tsx

describe('Admin Dashboard Integration', () => {
  describe('Quotes Management', () => {
    it('should load quotes list with correct columns', () => {});
    it('should filter quotes by status', () => {});
    it('should navigate to quote details on row click', () => {});
  });

  describe('Orders Management', () => {
    it('should load orders list', () => {});
    it('should filter orders by status', () => {});
    it('should show order status badges correctly', () => {});
  });
});
```

---

## 🟢 Priority 3: E2E Tests (Critical Journeys Only)

### E2E Test Selection Criteria

Only create E2E tests for flows that:
1. ✅ Span multiple pages
2. ✅ Involve real API interactions
3. ✅ Are revenue-critical
4. ✅ Cannot be adequately tested with unit/integration tests

### 3.1 Customer Quote Journey (CRITICAL)

```typescript
// File: e2e/customer-quote-journey.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Customer Quote Journey', () => {
  test('complete quote submission flow', async ({ page }) => {
    // 1. Browse store
    await page.goto('/store');
    await expect(page.getByRole('heading', { name: /Store/i })).toBeVisible();

    // 2. Add products to cart
    await page.click('[data-testid="add-to-cart-1"]');
    await page.click('[data-testid="add-to-cart-2"]');
    
    // 3. Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL('/cart');
    await expect(page.getByTestId('cart-item')).toHaveCount(2);

    // 4. Submit quote request
    await page.fill('[name="contactName"]', 'Dr. John Smith');
    await page.fill('[name="email"]', 'john@clinic.com');
    await page.fill('[name="phone"]', '555-123-4567');
    await page.fill('[name="address"]', '123 Medical Center Dr');
    await page.fill('[name="city"]', 'Austin');
    await page.selectOption('[name="state"]', 'TX');
    await page.fill('[name="zip"]', '78701');

    // 5. Submit and verify success
    await page.click('[data-testid="submit-quote"]');
    await expect(page.getByText(/quote.*received/i)).toBeVisible();
  });
});
```

### 3.2 Admin Quote Processing Journey

```typescript
// File: e2e/admin-quote-processing.spec.ts

test.describe('Admin Quote Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@medsource.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');
  });

  test('view and process quote', async ({ page }) => {
    // 1. Navigate to quotes
    await page.goto('/app/quotes');
    
    // 2. Click on first quote
    await page.click('[data-testid="quote-row-0"]');
    
    // 3. Verify quote details loaded
    await expect(page.getByTestId('quote-details')).toBeVisible();
    
    // 4. Change quote status
    await page.selectOption('[data-testid="quote-status"]', 'Approved');
    await page.click('[data-testid="save-quote"]');
    
    // 5. Verify status updated
    await expect(page.getByText('Quote updated')).toBeVisible();
  });
});
```

### 3.3 Authentication Flow

```typescript
// File: e2e/authentication.spec.ts

test.describe('Authentication', () => {
  test('login and logout flow', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'customer@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('[data-testid="login-button"]');
    
    // 2. Verify logged in
    await expect(page).toHaveURL('/app');
    await expect(page.getByTestId('user-menu')).toBeVisible();
    
    // 3. Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // 4. Verify logged out
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('login-link')).toBeVisible();
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/app/quotes');
    await expect(page).toHaveURL(/.*login/);
  });
});
```

---

## 📁 Project Structure

```
client/
├── app/
│   ├── _features/
│   │   ├── auth/
│   │   │   └── __tests__/
│   │   │       ├── useAuthStore.test.ts
│   │   │       └── AuthService.test.ts
│   │   ├── cart/
│   │   │   └── __tests__/
│   │   │       ├── useCartStore.test.ts
│   │   │       └── quoteSubmission.test.ts
│   │   └── ...
│   ├── _shared/
│   │   └── services/
│   │       └── __tests__/
│   │           └── httpService.test.ts
│   └── _lib/
│       └── __tests__/
│           ├── currency.test.ts
│           └── dates.test.ts
├── e2e/
│   ├── customer-quote-journey.spec.ts
│   ├── admin-quote-processing.spec.ts
│   └── authentication.spec.ts
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## ⚙️ Configuration Files

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'app/_features/**/*.{ts,tsx}',
        'app/_shared/**/*.{ts,tsx}',
        'app/_lib/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/__tests__/**',
        '**/index.ts',
        '**/*.d.ts',
      ],
    },
  },
})
```

### Vitest Setup

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as unknown as Storage

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 📋 NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

---

## 🧪 Testing Utilities & Patterns

### Custom Test Utilities

```typescript
// test-utils/renderWithProviders.tsx
import { render, type RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Add any providers your components need
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
```

### API Mocking with MSW

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/quotes/latest', () => {
    return HttpResponse.json({
      statusCode: 200,
      message: 'success',
      data: [
        { id: '1', status: 'Unread', createdAt: new Date().toISOString() },
        { id: '2', status: 'Approved', createdAt: new Date().toISOString() },
      ],
    })
  }),

  http.post('/api/quotes', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      statusCode: 200,
      message: 'quote_received',
      data: 'quote_received',
    })
  }),

  http.get('/api/account/profile', () => {
    return HttpResponse.json({
      statusCode: 200,
      message: 'success',
      data: {
        id: 1,
        email: 'test@example.com',
        name: { first: 'Test', last: 'User' },
        role: 0,
      },
    })
  }),
]
```

---

## 📊 Coverage Targets (Business-Aligned)

### Coverage Goals by Priority

| Feature Area | Unit Coverage | Integration Coverage | E2E Coverage |
|--------------|---------------|---------------------|--------------|
| **Cart Store** | 90%+ | 80% | Covered |
| **Auth Store** | 90%+ | 80% | Covered |
| **Quote Submission** | 90%+ | 80% | Covered |
| **API Services** | 80%+ | N/A | N/A |
| **Utility Functions** | 80%+ | N/A | N/A |
| **UI Components** | 50% | N/A | N/A |

### What NOT to Chase Coverage On

- ❌ Page layouts (visual, hard to test)
- ❌ Animation components (visual, not business logic)
- ❌ Third-party component wrappers
- ❌ Type definitions

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

1. [ ] Set up Vitest configuration
2. [ ] Set up Playwright configuration
3. [ ] Create test utilities and mocks
4. [ ] Write cart store unit tests
5. [ ] Write auth store unit tests

### Phase 2: Core Business Logic (Week 3-4)

1. [ ] Write quote submission tests
2. [ ] Write API service tests
3. [ ] Write utility function tests
4. [ ] Cart page integration tests
5. [ ] Auth flow integration tests

### Phase 3: E2E Critical Journeys (Week 5-6)

1. [ ] Customer quote journey E2E
2. [ ] Admin quote processing E2E
3. [ ] Authentication E2E
4. [ ] CI/CD integration

### Phase 4: Expansion (Ongoing)

1. [ ] Add tests as new features are built
2. [ ] Maintain test coverage during refactoring
3. [ ] Quarterly test audit (remove obsolete tests)

---

## ✅ Definition of Done for Tests

Every test MUST:

1. **Be business-justified**: Answer "what business scenario does this protect?"
2. **Be deterministic**: Same input = same output, every time
3. **Be fast**: Unit tests < 50ms, Integration < 500ms
4. **Be isolated**: No shared state between tests
5. **Use stable selectors**: data-testid, roles, labels (not CSS classes)
6. **Test behavior, not implementation**: Test what happens, not how

---

## 🔗 Related Documents

- [Business Flow Documentation](./business_flow.md) - Understanding what to test
- [RBAC Architecture](./RBAC_ARCHITECTURE.md) - Permission testing requirements
- [Backend Testing Strategy](./medsource-backend-testing.md) - API contract testing

---

*Document created: December 14, 2025*  
*Author: MAANG-Level Testing Strategy Review*
