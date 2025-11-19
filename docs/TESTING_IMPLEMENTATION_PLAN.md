# Frontend Testing Implementation Plan
## FAANG-Level, Industry Best Practice Implementation Strategy

**Status:** Ready for Implementation  
**Target Coverage:** 70%+ overall, 80%+ critical paths  
**Timeline:** 8-12 weeks (phased rollout)  
**Compliance:** Aligned with Feature Instructions Phase 4 — Verification

---

## Table of Contents

1. [Phase 0: Pre-Implementation Verification](#phase-0-pre-implementation-verification)
2. [Phase 1: Foundation & Infrastructure](#phase-1-foundation--infrastructure)
3. [Phase 2: Critical Path Testing](#phase-2-critical-path-testing)
4. [Phase 3: Integration Testing](#phase-3-integration-testing)
5. [Phase 4: E2E Testing](#phase-4-e2e-testing)
6. [Phase 5: CI/CD Integration](#phase-5-cicd-integration)
7. [Phase 6: Coverage Expansion](#phase-6-coverage-expansion)
8. [Phase 7: Optimization & Documentation](#phase-7-optimization--documentation)
9. [Phase 8: Refactor & Consolidation](#phase-8-refactor--consolidation)

---

## Phase 0: Pre-Implementation Verification

**Duration:** 1-2 days  
**Goal:** Verify React 19 compatibility and create compatibility matrix  
**Deliverables:** Compatibility report, verified package versions, risk assessment

### 0.1 Compatibility Verification (CRITICAL)

**Objective:** Verify all testing packages support React 19.1.0 before installation

#### Step 1: Check npm Peer Dependencies

```bash
# Create verification script
cat > scripts/verify-testing-compat.sh << 'EOF'
#!/bin/bash
echo "=== Testing Package Compatibility Verification ==="
echo ""

packages=(
  "vitest"
  "@testing-library/react"
  "@testing-library/jest-dom"
  "@testing-library/user-event"
  "msw"
  "@axe-core/react"
  "vitest-axe"
  "next-router-mock"
  "@playwright/test"
)

for pkg in "${packages[@]}"; do
  echo "Checking $pkg..."
  npm view "$pkg" peerDependencies 2>/dev/null || echo "  ⚠️  Package not found or no peer dependencies"
  echo ""
done
EOF

chmod +x scripts/verify-testing-compat.sh
./scripts/verify-testing-compat.sh > docs/COMPATIBILITY_REPORT.md
```

#### Step 2: GitHub Release Verification

**Check for React 19 support announcements:**

1. **Vitest:**
   - URL: https://github.com/vitest-dev/vitest/releases
   - Look for: React 19 support, changelog entries
   - Document: Latest version, React 19 support status

2. **React Testing Library:**
   - URL: https://github.com/testing-library/react-testing-library/releases
   - Look for: v16+ releases, React 19 compatibility notes
   - Document: Version number, breaking changes

3. **MSW:**
   - URL: https://github.com/mswjs/msw/releases
   - Verify: Latest stable version

4. **Playwright:**
   - URL: https://github.com/microsoft/playwright/releases
   - Verify: Latest version (React version independent)

#### Step 3: Official Documentation Review

**Review official docs for compatibility statements:**

- [ ] Vitest: https://vitest.dev/guide/react.html
- [ ] React Testing Library: https://testing-library.com/react
- [ ] Next.js Testing: https://nextjs.org/docs/app/building-your-application/testing
- [ ] Playwright: https://playwright.dev/docs/intro

**Document findings in:** `docs/COMPATIBILITY_REPORT.md`

#### Step 4: Dry-Run Installation Test

```bash
# Test installation without installing
npm install -D vitest@latest --dry-run
npm install -D @testing-library/react@latest --dry-run
npm install -D @testing-library/jest-dom@latest --dry-run
npm install -D @testing-library/user-event@latest --dry-run
npm install -D msw@latest --dry-run
npm install -D @axe-core/react@latest --dry-run
npm install -D vitest-axe@latest --dry-run
npm install -D next-router-mock@latest --dry-run
npm install -D @playwright/test@latest --dry-run
npm install -D jsdom@latest --dry-run

# Check for peer dependency warnings
# Document any warnings or errors
```

#### Step 5: Create Compatibility Matrix

**Create:** `docs/COMPATIBILITY_MATRIX.md`

| Package | Version | React 19 Support | Next.js 15.5 | Notes | Risk Level |
|---------|---------|-----------------|--------------|-------|------------|
| vitest | TBD | ⚠️ Verify | ✅ Likely | Check peer deps | Medium |
| @testing-library/react | TBD | ⚠️ Verify | ✅ Likely | v16+ required? | High |
| msw | TBD | ✅ Likely | ✅ Yes | React-agnostic | Low |
| @playwright/test | TBD | ✅ Yes | ✅ Yes | Version independent | Low |

### 0.2 Risk Assessment & Mitigation Plan

**Create:** `docs/TESTING_RISK_ASSESSMENT.md`

#### Risk 1: React 19 Not Supported
- **Probability:** Medium
- **Impact:** High
- **Mitigation:**
  1. Start with unit tests (services, utilities) - less React-dependent
  2. Use Playwright for E2E (React version independent)
  3. Monitor package updates for React 19 support
  4. Consider React 18 compatibility mode if needed

#### Risk 2: Tailwind CSS 4.1.0 CSS Processing
- **Probability:** High
- **Impact:** Medium
- **Mitigation:**
  1. Configure Vitest CSS processing (`css: true`)
  2. Import `globals.css` in test setup
  3. Create PostCSS config for Vitest if needed
  4. Test CSS class application in component tests

#### Risk 3: Zustand Store Testing Complexity
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:**
  1. Create test store factory utilities
  2. Reset stores between tests
  3. Mock persistence middleware
  4. Document patterns in test utilities

### 0.3 Decision Matrix

**If React 19 NOT supported:**

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Wait for support | Official support, stable | Delays testing implementation | ⭐ Best if < 1 month wait |
| Use React 18 mode | Can start testing now | May miss React 19 features | Consider if urgent |
| E2E only (Playwright) | Works immediately | No unit/integration tests | Fallback option |
| Experimental versions | Early access | Unstable, breaking changes | Not recommended |

**Deliverable:** Decision document with chosen path

---

## Phase 1: Foundation & Infrastructure

**Duration:** 1-2 weeks  
**Goal:** Set up testing infrastructure, configuration, and utilities  
**Deliverables:** Vitest config, test utilities, setup files, example tests

### 1.1 Discovery & Planning

**Objective:** Inventory existing code, identify test targets, plan structure

#### 1.1.1 Codebase Inventory

**Create:** `docs/TESTING_INVENTORY.md`

**Services to Test (Priority Order):**
1. `app/_features/auth/services/AuthService.ts` - CRITICAL
2. `app/_features/cart/stores/useCartStore.ts` - CRITICAL
3. `app/_features/settings/services/ThemeService.ts` - HIGH
4. `app/_features/settings/services/ReducedMotionService.ts` - HIGH
5. `app/_features/products/services/ProductService.ts` - MEDIUM
6. `app/_features/images/services/ImageService.ts` - MEDIUM

**Hooks to Test:**
1. `app/_shared/hooks/useScrollReveal.ts` - HIGH
2. `app/_shared/hooks/useSharedIntersectionObserver.ts` - HIGH
3. `app/_shared/hooks/useFocusTrap.ts` - MEDIUM
4. `app/_shared/hooks/useZodForm.ts` - MEDIUM

**Components to Test:**
1. `app/_components/forms/FormInput.tsx` - CRITICAL
2. `app/_components/auth/LoginModal.tsx` - CRITICAL
3. `app/_components/store/ProductCard.tsx` - HIGH
4. `app/_components/ui/Modal.tsx` - HIGH
5. `app/_components/forms/FormSelect.tsx` - MEDIUM

**Utilities to Test:**
1. `app/_lib/formatters/*` - MEDIUM
2. `app/_core/validation/*` - MEDIUM
3. `app/_classes/Order.ts` (calculations) - HIGH

#### 1.1.2 Test Structure Planning

**Directory Structure:**
```
app/
├── _features/
│   ├── auth/
│   │   ├── services/
│   │   │   ├── AuthService.ts
│   │   │   └── AuthService.test.ts          # Unit tests
│   │   └── stores/
│   │       ├── useAuthStore.ts
│   │       └── useAuthStore.test.ts         # Store tests
│   └── cart/
│       └── stores/
│           ├── useCartStore.ts
│           └── useCartStore.test.ts         # Store tests
├── _components/
│   ├── forms/
│   │   ├── FormInput.tsx
│   │   └── FormInput.test.tsx              # Component tests
│   └── auth/
│       ├── LoginModal.tsx
│       └── LoginModal.test.tsx             # Component tests
├── _shared/
│   └── hooks/
│       ├── useScrollReveal.ts
│       └── useScrollReveal.test.ts         # Hook tests
└── __tests__/                              # Integration tests
    ├── auth/
    │   └── login-flow.test.tsx
    └── cart/
        └── cart-flow.test.tsx
```

### 1.2 Design & Architecture

**Objective:** Design test utilities, patterns, and configuration

#### 1.2.1 Test Utility Design

**Create:** `app/__tests__/utils/test-utils.tsx`

**Requirements:**
- Custom render function with all providers (Zustand, React Hook Form, etc.)
- MSW setup/teardown helpers
- Store reset utilities
- Accessibility testing helpers
- Snapshot testing utilities
- Mock data factories

#### 1.2.2 Configuration Design

**Vitest Config Requirements:**
- Path aliases matching `tsconfig.json`
- Tailwind CSS 4.1.0 CSS processing
- TypeScript 5 support
- jsdom environment
- Coverage configuration
- Test file patterns

**MSW Setup Requirements:**
- API handlers matching your API structure
- Error scenario handlers
- Network delay simulation
- Request/response logging

### 1.3 Implementation

#### 1.3.1 Install Dependencies

**After Phase 0 verification:**

```bash
# Core testing framework
npm install -D vitest@latest @vitest/ui@latest

# React Testing Library (verify React 19 support first!)
npm install -D @testing-library/react@latest \
  @testing-library/jest-dom@latest \
  @testing-library/user-event@latest

# Test environment
npm install -D jsdom@latest

# API mocking
npm install -D msw@latest

# Accessibility testing
npm install -D @axe-core/react@latest vitest-axe@latest

# Next.js mocking
npm install -D next-router-mock@latest

# E2E testing (React version independent)
npm install -D @playwright/test@latest

# Coverage reporting
npm install -D @vitest/coverage-v8
```

#### 1.3.2 Create Vitest Configuration

**Create:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./app/__tests__/setup.ts'],
    css: true, // CRITICAL for Tailwind CSS 4.1.0
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'app/__tests__/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@_features': path.resolve(__dirname, './app/_features'),
      '@_core': path.resolve(__dirname, './app/_core'),
      '@_lib': path.resolve(__dirname, './app/_lib'),
      '@_shared': path.resolve(__dirname, './app/_shared'),
      '@_classes': path.resolve(__dirname, './app/_classes'),
      '@_components': path.resolve(__dirname, './app/_components'),
      '@_types': path.resolve(__dirname, './app/_types'),
      '@_helpers': path.resolve(__dirname, './app/_helpers'),
      '@_scripts': path.resolve(__dirname, './app/_scripts'),
    },
  },
})
```

#### 1.3.3 Create Test Setup File

**Create:** `app/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { toHaveNoViolations } from 'vitest-axe'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)
expect.extend(toHaveNoViolations)

// Import Tailwind CSS for tests (CRITICAL for Tailwind 4.1.0)
import '../globals.css'

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock window.matchMedia (for theme/reduced motion tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (for scroll reveal tests)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any
```

#### 1.3.4 Create Test Utilities

**Create:** `app/__tests__/utils/test-utils.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-toastify'

// Import your providers here
// import { AuthProvider } from '@_features/auth'
// import { SettingsProvider } from '@_features/settings'

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {/* Add your providers here */}
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

**Create:** `app/__tests__/utils/store-test-utils.ts`

```typescript
import { create } from 'zustand'
import { useCartStore } from '@_features/cart/stores/useCartStore'
import { useAuthStore } from '@_features/auth/stores/useAuthStore'

/**
 * Reset all Zustand stores between tests
 * FAANG-level: Ensures test isolation
 */
export function resetAllStores() {
  // Reset cart store
  useCartStore.getState().clearCart()
  
  // Reset auth store
  useAuthStore.getState().logout()
  
  // Add other stores as needed
}

/**
 * Create a test store instance (for testing store logic in isolation)
 */
export function createTestStore<T>(storeFactory: () => T): T {
  return storeFactory()
}
```

**Create:** `app/__tests__/utils/mock-data-factories.ts`

```typescript
import type { IUser } from '@_classes/User'
import type { CartItem } from '@_features/cart/stores/useCartStore'

/**
 * Mock data factories for consistent test data
 * FAANG-level: Centralized, reusable test fixtures
 */

export const createMockUser = (overrides?: Partial<IUser>): IUser => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  name: {
    first: 'Test',
    last: 'User',
  },
  role: 0,
  customerId: 1,
  ...overrides,
})

export const createMockCartItem = (overrides?: Partial<CartItem>): CartItem => ({
  productId: '1',
  quantity: 1,
  price: 99.99,
  name: 'Test Product',
  ...overrides,
})
```

#### 1.3.5 Create MSW Handlers

**Create:** `app/__tests__/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254/api'

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/account/login`, () => {
    return HttpResponse.json({
      payload: {
        account: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        token: 'mock-jwt-token',
      },
      message: 'Login successful',
      statusCode: 200,
    })
  }),

  http.get(`${API_URL}/account`, () => {
    return HttpResponse.json({
      payload: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      },
      message: null,
      statusCode: 200,
    })
  }),

  // Add more handlers matching your API structure
]
```

**Create:** `app/__tests__/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server for Node.js (Vitest) environment
export const server = setupServer(...handlers)

// Setup server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Cleanup after all tests
afterAll(() => server.close())
```

#### 1.3.6 Update package.json Scripts

**Add test scripts:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 1.4 Verification

#### 1.4.1 Configuration Verification

- [ ] Vitest config loads without errors
- [ ] Path aliases resolve correctly
- [ ] CSS processing works (Tailwind classes apply)
- [ ] TypeScript types resolve
- [ ] Test setup file executes

#### 1.4.2 Utility Verification

- [ ] Custom render function works
- [ ] Store reset utilities function
- [ ] MSW handlers intercept requests
- [ ] Mock data factories generate valid data
- [ ] Accessibility helpers work

#### 1.4.3 Example Test

**Create:** `app/__tests__/example.test.ts`

```typescript
import { describe, it, expect } from 'vitest'

describe('Example Test', () => {
  it('should verify test setup works', () => {
    expect(true).toBe(true)
  })
})
```

**Run:** `npm test` - Should pass

**Deliverables Checklist:**
- [x] Vitest configuration file
- [x] Test setup file
- [x] Test utilities
- [x] MSW handlers
- [x] Package.json scripts
- [x] Example test passing

---

## Phase 2: Critical Path Testing

**Duration:** 2-3 weeks  
**Goal:** Test critical business logic (auth, cart, forms)  
**Coverage Target:** 80%+ for critical paths  
**Deliverables:** Test suites for AuthService, useCartStore, FormInput, LoginModal

### 2.1 Discovery

**Objective:** Analyze critical paths, identify test scenarios, edge cases

#### 2.1.1 AuthService Test Plan

**File:** `app/_features/auth/services/AuthService.test.ts`

**Test Scenarios:**
1. **Login Flow:**
   - ✅ Valid credentials → success
   - ✅ Invalid credentials → error
   - ✅ Network error → error handling
   - ✅ Token storage (cookie)
   - ✅ Remember me functionality (30 days vs 1 day)

2. **Signup Flow:**
   - ✅ Valid data → success
   - ✅ Duplicate username → error
   - ✅ Invalid email → error
   - ✅ Network error → error handling

3. **Token Management:**
   - ✅ Token retrieval
   - ✅ Token validation
   - ✅ Token expiration handling
   - ✅ Logout (token removal)

4. **Edge Cases:**
   - ✅ Empty credentials
   - ✅ Malformed responses
   - ✅ Server errors (500, 503)
   - ✅ Timeout scenarios

#### 2.1.2 useCartStore Test Plan

**File:** `app/_features/cart/stores/useCartStore.test.ts`

**Test Scenarios:**
1. **Add to Cart:**
   - ✅ New item → added
   - ✅ Existing item → quantity updated
   - ✅ Multiple items → all added

2. **Remove from Cart:**
   - ✅ Remove by productId
   - ✅ Remove non-existent item (no error)

3. **Update Quantity:**
   - ✅ Valid quantity → updated
   - ✅ Quantity 0 → removed
   - ✅ Negative quantity → removed

4. **Persistence:**
   - ✅ localStorage sync
   - ✅ Hydration on load
   - ✅ Clear cart → localStorage cleared

5. **Edge Cases:**
   - ✅ Empty cart operations
   - ✅ Invalid data handling
   - ✅ localStorage unavailable

#### 2.1.3 FormInput Test Plan

**File:** `app/_components/forms/FormInput.test.tsx`

**Test Scenarios:**
1. **Rendering:**
   - ✅ Renders with label
   - ✅ Renders without label
   - ✅ Required indicator (*)
   - ✅ Helper text display
   - ✅ Error message display

2. **Validation:**
   - ✅ Error state styling
   - ✅ Error message priority over helper text
   - ✅ React Hook Form integration

3. **Accessibility:**
   - ✅ Label-input association
   - ✅ ARIA attributes
   - ✅ Error announcement
   - ✅ Required field indication

4. **Interactions:**
   - ✅ User input
   - ✅ Focus management
   - ✅ Ref forwarding (React Hook Form)

#### 2.1.4 LoginModal Test Plan

**File:** `app/_components/auth/LoginModal.test.tsx`

**Test Scenarios:**
1. **Form Submission:**
   - ✅ Valid credentials → login success
   - ✅ Invalid credentials → error display
   - ✅ Network error → error handling
   - ✅ Loading state during submission

2. **User Interactions:**
   - ✅ Email input
   - ✅ Password input
   - ✅ Remember me checkbox
   - ✅ Submit button click
   - ✅ Close modal

3. **Accessibility:**
   - ✅ Focus trap
   - ✅ Keyboard navigation
   - ✅ Screen reader announcements
   - ✅ ARIA labels

4. **Integration:**
   - ✅ AuthService integration
   - ✅ Store update on success
   - ✅ Navigation on success

### 2.2 Design

**Objective:** Design test structure, mock strategies, assertion patterns

#### 2.2.1 Test Structure Pattern

```typescript
describe('Component/Service Name', () => {
  describe('Feature/Function', () => {
    describe('Scenario', () => {
      it('should expected behavior', () => {
        // Arrange
        // Act
        // Assert
      })
    })
  })
})
```

#### 2.2.2 Mock Strategy

- **Services:** Mock API calls with MSW
- **Stores:** Use test store instances
- **Router:** Mock with next-router-mock
- **Browser APIs:** Mock in setup file

### 2.3 Implementation

#### 2.3.1 AuthService Tests

**Create:** `app/_features/auth/services/AuthService.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login, signup, checkAuthStatus, logout, getAuthToken } from './AuthService'
import { server } from '@__tests__/mocks/server'
import { http, HttpResponse } from 'msw'
import { getCookie, deleteCookie } from 'cookies-next'

describe('AuthService', () => {
  beforeEach(() => {
    // Clear cookies before each test
    deleteCookie('at')
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberUser: false,
      }

      const result = await login(credentials)

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
      expect(getCookie('at')).toBeDefined()
    })

    it('should set 30-day cookie when rememberUser is true', async () => {
      // Test implementation
    })

    it('should set 1-day cookie when rememberUser is false', async () => {
      // Test implementation
    })

    it('should handle invalid credentials', async () => {
      server.use(
        http.post('*/account/login', () => {
          return HttpResponse.json({
            payload: null,
            message: 'Invalid credentials',
            statusCode: 401,
          })
        })
      )

      const result = await login({
        email: 'wrong@example.com',
        password: 'wrong',
        rememberUser: false,
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid credentials')
    })

    it('should handle network errors', async () => {
      server.use(
        http.post('*/account/login', () => {
          return HttpResponse.error()
        })
      )

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
        rememberUser: false,
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Network error occurred')
    })
  })

  describe('signup', () => {
    // Test implementation
  })

  describe('checkAuthStatus', () => {
    // Test implementation
  })

  describe('logout', () => {
    // Test implementation
  })
})
```

#### 2.3.2 useCartStore Tests

**Create:** `app/_features/cart/stores/useCartStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from './useCartStore'
import { resetAllStores } from '@__tests__/utils/store-test-utils'
import { createMockCartItem } from '@__tests__/utils/mock-data-factories'

describe('useCartStore', () => {
  beforeEach(() => {
    resetAllStores()
  })

  describe('addToCart', () => {
    it('should add new item to cart', () => {
      const { result } = renderHook(() => useCartStore())
      const item = createMockCartItem({ productId: '1', quantity: 1 })

      act(() => {
        result.current.addToCart(item)
      })

      expect(result.current.cart).toHaveLength(1)
      expect(result.current.cart[0]).toEqual(item)
    })

    it('should update quantity when item already exists', () => {
      const { result } = renderHook(() => useCartStore())
      const item = createMockCartItem({ productId: '1', quantity: 1 })

      act(() => {
        result.current.addToCart(item)
        result.current.addToCart(item)
      })

      expect(result.current.cart).toHaveLength(1)
      expect(result.current.cart[0].quantity).toBe(2)
    })
  })

  describe('removeFromCart', () => {
    // Test implementation
  })

  describe('updateCartQuantity', () => {
    // Test implementation
  })

  describe('clearCart', () => {
    // Test implementation
  })

  describe('persistence', () => {
    // Test localStorage sync
  })
})
```

#### 2.3.3 FormInput Tests

**Create:** `app/_components/forms/FormInput.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@__tests__/utils/test-utils'
import { useForm } from 'react-hook-form'
import FormInput from './FormInput'
import { axe, toHaveNoViolations } from 'vitest-axe'

expect.extend(toHaveNoViolations)

describe('FormInput', () => {
  it('should render with label', () => {
    render(<FormInput label="Email" name="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('should display required indicator', () => {
    render(<FormInput label="Email" name="email" required />)
    const label = screen.getByText('Email')
    expect(label).toHaveTextContent('Email*')
  })

  it('should display error message', () => {
    const error = { message: 'Email is required', type: 'required' }
    render(<FormInput label="Email" name="email" error={error} />)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('should prioritize error over helper text', () => {
    const error = { message: 'Error', type: 'required' }
    render(
      <FormInput
        label="Email"
        name="email"
        error={error}
        helperText="Helper text"
      />
    )
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <FormInput label="Email" name="email" required />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should integrate with React Hook Form', () => {
    const TestForm = () => {
      const { register, formState } = useForm()
      return (
        <FormInput
          label="Email"
          {...register('email')}
          error={formState.errors.email}
        />
      )
    }
    render(<TestForm />)
    // Test React Hook Form integration
  })
})
```

#### 2.3.4 LoginModal Tests

**Create:** `app/_components/auth/LoginModal.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import LoginModal from './LoginModal'
import * as AuthService from '@_features/auth/services/AuthService'

vi.mock('@_features/auth/services/AuthService')

describe('LoginModal', () => {
  it('should render login form', () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.spyOn(AuthService, 'login').mockResolvedValue({
      success: true,
      user: { id: '1', email: 'test@example.com' },
      token: 'token',
    })

    render(<LoginModal isOpen={true} onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberUser: false,
      })
    })
  })

  it('should display error on login failure', async () => {
    // Test implementation
  })

  it('should handle remember me checkbox', async () => {
    // Test implementation
  })

  it('should have no accessibility violations', async () => {
    // Test implementation
  })
})
```

### 2.4 Verification

**Run tests and verify coverage:**

```bash
npm run test:coverage
```

**Coverage Targets:**
- AuthService: 85%+
- useCartStore: 85%+
- FormInput: 80%+
- LoginModal: 80%+

**Deliverables Checklist:**
- [x] AuthService test suite (80%+ coverage)
- [x] useCartStore test suite (80%+ coverage)
- [x] FormInput test suite (80%+ coverage)
- [x] LoginModal test suite (80%+ coverage)
- [x] All tests passing
- [x] Coverage report generated

---

## Phase 3: Integration Testing

**Duration:** 2 weeks  
**Goal:** Test component + service integration flows  
**Coverage Target:** 70%+ for integration paths  
**Deliverables:** Integration test suites for critical user flows

### 3.1 Discovery

**Objective:** Identify integration points, data flows, side effects

#### 3.1.1 Integration Test Plan

**Critical Flows to Test:**

1. **Login Flow:**
   - Form → AuthService → API → Store Update → Navigation
   - Error handling → Error display
   - Loading states → UI feedback

2. **Cart Flow:**
   - Add Item → Store Update → localStorage → UI Update
   - Remove Item → Store Update → UI Update
   - Checkout → Clear Cart → Navigation

3. **Product Search Flow:**
   - Filter Input → API Call → Results Display
   - Pagination → API Call → Results Update

### 3.2 Design

**Objective:** Design integration test patterns, mock strategies

#### 3.2.1 Integration Test Structure

```typescript
describe('Integration: Feature Name', () => {
  describe('User Flow: Flow Name', () => {
    it('should complete flow successfully', async () => {
      // Test full flow
    })

    it('should handle errors gracefully', async () => {
      // Test error scenarios
    })
  })
})
```

### 3.3 Implementation

#### 3.3.1 Login Flow Integration Test

**Create:** `app/__tests__/integration/auth/login-flow.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import LoginModal from '@_components/auth/LoginModal'
import { useAuthStore } from '@_features/auth/stores/useAuthStore'
import { server } from '@__tests__/mocks/server'
import { http, HttpResponse } from 'msw'

describe('Integration: Login Flow', () => {
  beforeEach(() => {
    // Reset stores
    useAuthStore.getState().logout()
  })

  it('should complete login flow successfully', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<LoginModal isOpen={true} onClose={onClose} />)

    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    // Submit
    await user.click(screen.getByRole('button', { name: /login/i }))

    // Verify loading state
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled()

    // Wait for success
    await waitFor(() => {
      expect(useAuthStore.getState().user).toBeDefined()
    })

    // Verify modal closes
    expect(onClose).toHaveBeenCalled()
  })

  it('should handle login error and display message', async () => {
    server.use(
      http.post('*/account/login', () => {
        return HttpResponse.json({
          payload: null,
          message: 'Invalid credentials',
          statusCode: 401,
        })
      })
    )

    // Test implementation
  })
})
```

#### 3.3.2 Cart Flow Integration Test

**Create:** `app/__tests__/integration/cart/cart-flow.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { useCartStore } from '@_features/cart/stores/useCartStore'
import ProductCard from '@_components/store/ProductCard'

describe('Integration: Cart Flow', () => {
  it('should add product to cart and update UI', async () => {
    const user = userEvent.setup()
    const product = {
      id: '1',
      name: 'Test Product',
      price: 99.99,
    }

    render(<ProductCard product={product} />)

    // Click add to cart
    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    // Verify cart updated
    expect(useCartStore.getState().cart).toHaveLength(1)
    expect(useCartStore.getState().cart[0].productId).toBe('1')

    // Verify UI feedback (toast, badge, etc.)
    // Test implementation
  })
})
```

### 3.4 Verification

**Run integration tests:**

```bash
npm test -- app/__tests__/integration
```

**Deliverables Checklist:**
- [x] Login flow integration tests
- [x] Cart flow integration tests
- [x] Product search integration tests
- [x] All integration tests passing
- [x] Coverage report for integration paths

---

## Phase 4: E2E Testing

**Duration:** 1-2 weeks  
**Goal:** Test critical user journeys in real browser  
**Coverage Target:** 5-10 critical paths  
**Deliverables:** Playwright test suite for critical flows

### 4.1 Discovery

**Objective:** Identify critical user journeys for E2E testing

#### 4.1.1 E2E Test Plan

**Critical Paths:**
1. User Registration → Login → Browse Products → Add to Cart → Checkout
2. User Login → View Orders → View Order Details
3. Admin Login → Manage Products → Update Product
4. User Login → Update Profile → Save Changes

### 4.2 Design

**Objective:** Design E2E test structure, page object model

#### 4.2.1 Playwright Configuration

**Create:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './app/__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 4.3 Implementation

#### 4.3.1 Page Object Model

**Create:** `app/__tests__/e2e/pages/LoginPage.ts`

```typescript
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly rememberMeCheckbox: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel(/email/i)
    this.passwordInput = page.getByLabel(/password/i)
    this.loginButton = page.getByRole('button', { name: /login/i })
    this.rememberMeCheckbox = page.getByLabel(/remember me/i)
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
    await this.loginButton.click()
  }
}
```

#### 4.3.2 E2E Tests

**Create:** `app/__tests__/e2e/auth/login.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test.describe('E2E: Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'password123')

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*medsource-app/)
  })

  test('should display error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('wrong@example.com', 'wrong')

    // Verify error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })
})
```

### 4.4 Verification

**Run E2E tests:**

```bash
npm run test:e2e
```

**Deliverables Checklist:**
- [x] Playwright configuration
- [x] Page object models
- [x] Critical path E2E tests
- [x] All E2E tests passing
- [x] Cross-browser testing verified

---

## Phase 5: CI/CD Integration

**Duration:** 1 week  
**Goal:** Integrate testing into CI/CD pipeline  
**Deliverables:** GitHub Actions workflow, coverage reporting, test status badges

### 5.1 Discovery

**Objective:** Identify CI/CD requirements, coverage thresholds, reporting needs

### 5.2 Design

**Objective:** Design CI/CD workflow, coverage reporting strategy

### 5.3 Implementation

#### 5.3.1 GitHub Actions Workflow

**Create:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, front-end-modernization]
  pull_request:
    branches: [main, front-end-modernization]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - name: Coverage Comment
        uses: py-cov-action/python-coverage-comment-action@v3
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5.4 Verification

**Test CI/CD workflow:**

- [ ] Push to branch triggers workflow
- [ ] Tests run successfully
- [ ] Coverage report generated
- [ ] Coverage threshold enforced
- [ ] PR status checks work

**Deliverables Checklist:**
- [x] GitHub Actions workflow
- [x] Coverage reporting
- [x] Test status badges
- [x] PR status checks

---

## Phase 6: Coverage Expansion

**Duration:** 2-3 weeks  
**Goal:** Expand test coverage to 70%+ overall  
**Deliverables:** Additional test suites for services, hooks, components

### 6.1 Priority Order

1. **High Priority:**
   - ThemeService
   - ReducedMotionService
   - useScrollReveal
   - useSharedIntersectionObserver
   - ProductCard
   - Modal

2. **Medium Priority:**
   - ImageService
   - ProductService
   - FormSelect
   - FormCheckbox
   - DataTable

3. **Low Priority:**
   - Formatters
   - Validators
   - Utility functions

### 6.2 Implementation

**Follow same pattern as Phase 2 for each component/service**

### 6.3 Verification

**Coverage targets:**
- Overall: 70%+
- Critical paths: 80%+
- Services: 75%+
- Components: 65%+

---

## Phase 7: Optimization & Documentation

**Duration:** 1 week  
**Goal:** Optimize test performance, document testing patterns  
**Deliverables:** Test performance improvements, testing guide

### 7.1 Optimization

**Objectives:**
- Optimize test execution time
- Reduce flaky tests
- Improve test maintainability

**Actions:**
- Parallel test execution
- Test data optimization
- Mock optimization
- Snapshot test cleanup

### 7.2 Documentation

**Create:** `docs/TESTING_GUIDE.md`

**Contents:**
- Testing patterns
- Best practices
- Common pitfalls
- How to write tests
- How to debug tests

---

## Phase 8: Refactor & Consolidation

**Duration:** 1 week  
**Goal:** Refactor test code, consolidate patterns, improve maintainability  
**Deliverables:** Refactored test utilities, consolidated patterns

### 8.1 Refactor Pass

**Objectives:**
- Extract common test patterns
- Consolidate test utilities
- Improve test readability
- Remove duplication

### 8.2 Verification

**Re-run all tests after refactoring:**

```bash
npm run test:run
npm run test:e2e
npm run test:coverage
```

**Ensure:**
- All tests still pass
- Coverage maintained
- No regressions

---

## Success Criteria

### Phase Completion Criteria

**Each phase must meet:**
- [ ] All tests passing
- [ ] Coverage targets met
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Code reviewed

### Overall Success Criteria

- [ ] 70%+ overall test coverage
- [ ] 80%+ coverage for critical paths
- [ ] All critical user flows tested
- [ ] CI/CD integration complete
- [ ] Testing guide documented
- [ ] Team trained on testing patterns

---

## Risk Mitigation

### Ongoing Risk Management

1. **Monitor React 19 Support:**
   - Weekly check for package updates
   - Subscribe to GitHub release notifications
   - Update packages when React 19 support confirmed

2. **Test Maintenance:**
   - Review flaky tests weekly
   - Update tests when code changes
   - Refactor tests quarterly

3. **Coverage Monitoring:**
   - Set coverage thresholds
   - Block PRs below threshold
   - Review coverage reports weekly

---

## Timeline Summary

| Phase | Duration | Start Week | End Week |
|-------|----------|------------|----------|
| Phase 0: Verification | 1-2 days | Week 0 | Week 0 |
| Phase 1: Foundation | 1-2 weeks | Week 1 | Week 2 |
| Phase 2: Critical Paths | 2-3 weeks | Week 3 | Week 5 |
| Phase 3: Integration | 2 weeks | Week 6 | Week 7 |
| Phase 4: E2E | 1-2 weeks | Week 8 | Week 9 |
| Phase 5: CI/CD | 1 week | Week 10 | Week 10 |
| Phase 6: Expansion | 2-3 weeks | Week 11 | Week 13 |
| Phase 7: Optimization | 1 week | Week 14 | Week 14 |
| Phase 8: Refactor | 1 week | Week 15 | Week 15 |

**Total Duration:** 12-15 weeks (phased, can run in parallel)

---

## Next Steps

1. **Review this plan** with team
2. **Approve Phase 0** verification approach
3. **Begin Phase 0** verification
4. **Proceed with Phase 1** after verification complete

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Ready for Implementation

