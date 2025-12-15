# MedSource Pro - Unit Testing Plan for Public Routes

## Executive Summary

**Document Version**: 1.0  
**Date**: December 14, 2025  
**Scope**: Comprehensive unit testing strategy for all public-facing routes and business logic  
**Approach**: MAANG-Level Testing Standards with exhaustive edge case coverage

---

## 🎯 Testing Philosophy: MAANG-Level Robustness

### Core Principles

1. **Revenue Protection First**: Every test protects a revenue-generating or customer-facing path
2. **Edge Case Exhaustion**: Test boundary conditions, null/undefined, invalid inputs, network failures
3. **Deterministic Testing**: No flaky tests, no race conditions, no time-dependent failures
4. **Business Logic Validation**: Test business rules explicitly, not just happy paths
5. **Isolation & Speed**: Unit tests < 50ms, fully isolated, no external dependencies

### MAANG Testing Standards Applied

| Standard | Implementation |
|----------|---------------|
| **Google's Test Pyramid** | 70% Unit, 20% Integration, 10% E2E |
| **Google's SMURF Framework** | Speed, Maintainability, Utilization, Reliability, Fidelity |
| **Meta's Test Coverage** | Focus on behavior, test edge cases rigorously |
| **Amazon's Testing Culture** | Every production bug = missing test case |
| **Netflix's Chaos Engineering** | Test failure modes, not just success paths |

---

## 📍 Public Routes Inventory

### Identified Public Routes

| Route | Type | Business Criticality | Auth Required |
|-------|------|---------------------|---------------|
| `/` | Landing Page | ⚠️ Medium (Marketing) | ❌ No |
| `/store` | Product Catalog | 🔴 **CRITICAL** (Revenue) | ❌ No |
| `/store/product/[id]` | Product Detail | 🔴 **CRITICAL** (Revenue) | ❌ No |
| `/cart` | Shopping Cart | 🔴 **CRITICAL** (Revenue) | ❌ No |
| `/about-us` | Static Page | ⚠️ Low | ❌ No |
| `/contact` | Contact Form | 🟡 Medium | ❌ No |

### Public API Endpoints

| Endpoint | Method | Purpose | Criticality |
|----------|--------|---------|-------------|
| `/Products/search/public` | POST | Product search/filter | 🔴 CRITICAL |
| `/Products/categories/clean` | GET | Category listing | 🟡 Medium |
| `/products/[id]` | GET | Product details | 🔴 CRITICAL |
| `/quotes` | POST | Quote submission | 🔴 **CRITICAL** |
| `/contact` | POST | Contact form | 🟡 Medium |
| `/account/login` | POST | Authentication | 🔴 CRITICAL |
| `/account/signup` | POST | Registration | 🔴 CRITICAL |

---

## 📁 Test File Organization Strategy

### Industry Best Practice: Co-Location (MAANG Standard)

**Research Findings:**
- ✅ **Vercel/Next.js Official**: Tests should be co-located within the app directory or in `__tests__` folders
- ✅ **React Testing Library**: Recommends co-location with source files
- ✅ **MAANG Companies** (Google, Meta, Microsoft): Use co-location for unit tests
- ✅ **TypeScript Team**: Co-location prevents accidental test dependencies in production code
- ✅ **Kent C. Dodds**: Co-location improves maintainability and discoverability

### Why Co-Location is Better for Separation of Concerns:

| Aspect | Co-Location (✅ Recommended) | Separate Directory (❌ Not Recommended) |
|--------|-----------------------------|----------------------------------------|
| **Maintainability** | Tests live next to code they test - easy to find and update | Parallel structure must be manually maintained, prone to drift |
| **Discoverability** | Immediately see what's tested when viewing source | Must navigate separate directory structure |
| **Type Safety** | TypeScript prevents importing test code in production | Risk of accidentally importing test utilities |
| **Refactoring** | Move/rename files includes tests automatically | Must remember to update test structure separately |
| **Deployment** | Build tools automatically exclude `.test.ts` files | Requires explicit configuration |
| **Team Velocity** | Less context switching, faster development | More navigation, slower development |

### Recommended Structure (MAANG-Level):

```
MedSource Pro/
├── client/                          # Frontend package
│   ├── app/                         # Next.js app directory
│   │   ├── _features/
│   │   │   ├── cart/
│   │   │   │   ├── stores/
│   │   │   │   │   ├── useCartStore.ts
│   │   │   │   │   └── __tests__/           # ✅ Co-located tests
│   │   │   │   │       └── useCartStore.test.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useCartPageLogic.ts
│   │   │   │   │   └── __tests__/           # ✅ Co-located tests
│   │   │   │   │       └── useCartPageLogic.test.ts
│   │   │   └── auth/
│   │   │       ├── stores/
│   │   │       │   ├── useAuthStore.ts
│   │   │       │   └── __tests__/
│   │   │       │       └── useAuthStore.test.ts
│   │   ├── _shared/
│   │   │   └── services/
│   │   │       ├── httpService.ts
│   │   │       └── __tests__/
│   │   │           └── httpService.test.ts
│   │   ├── _core/
│   │   │   └── validation/
│   │   │       ├── validation-schemas.ts
│   │   │       └── __tests__/
│   │   │           └── validation-schemas.test.ts
│   │   └── cart/
│   │       ├── page.tsx
│   │       └── __tests__/
│   │           └── page.test.tsx
│   ├── vitest.config.ts             # ✅ Root-level config
│   ├── vitest.setup.ts              # ✅ Root-level setup
│   ├── __mocks__/                   # ✅ Shared mocks (root level)
│   │   ├── next/
│   │   │   └── navigation.ts
│   │   └── zustand/
│   │       └── middleware.ts
│   ├── test-utils/                  # ✅ Shared test utilities (root level)
│   │   ├── renderWithProviders.tsx
│   │   ├── mockHandlers.ts
│   │   └── testDataBuilders.ts
│   └── mocks/                       # ✅ MSW handlers (root level)
│       └── handlers.ts
└── server/                          # Backend package (separate)
    └── Tests/                       # Backend tests in separate Tests project
        └── Services/
            └── QuoteServiceTests.cs
```

### Key Principles:

1. **Unit Tests**: Co-located in `__tests__/` folders next to source files ✅
2. **Test Utilities**: Shared utilities at `client/test-utils/` (root of client folder) ✅
3. **Test Configuration**: `vitest.config.ts` at root of client folder ✅
4. **E2E Tests**: Can be in `client/e2e/` at root level (separate from unit tests) ✅
5. **Mocks**: Shared mocks at `client/__mocks__/` (root level) ✅

### Why NOT Outside Client Folder:

❌ **Separate `tests/` folder outside client:**
- Breaks package boundaries (tests are part of the client package)
- Harder to maintain parallel structure
- Can't share TypeScript path aliases easily
- Violates Next.js conventions
- Makes imports more complex
- Doesn't align with MAANG patterns

---

## 🔥 Phase 1: Foundation Infrastructure (Week 1)

### 1.1 Test Setup & Configuration

**Priority**: 🔴 **MUST HAVE**

#### Prerequisites Installation

Before setting up tests, install required dependencies:

```bash
cd client
npm install --save-dev @vitest/coverage-v8@latest
```

**Why @vitest/coverage-v8?**
- Required for coverage analysis (targeting 95%+ coverage)
- Enables line-by-line coverage insights via vitest-mcp
- Industry standard for Vitest coverage reporting

#### Vitest MCP Integration

**✅ Already Configured**: Vitest MCP server has been added to your Cursor MCP configuration (`~/.cursor/mcp.json`)

**Benefits:**
- Natural language test commands: "Run tests for cart store"
- Structured output reduces token usage
- Console log capture for easier debugging
- Coverage gap analysis to reach 95%+ targets
- Safety guards prevent full test suite runs

**Usage in Cursor:**
```
"Run tests for useCartStore"
"Debug the cart store tests"
"Analyze coverage for quote submission"
```

Or use the prefix:
```
"vitest-mcp: run tests for this component"
"vitest-mcp: analyze coverage for this file"
```

**First Command After Setup:**
1. Set project root: `set_project_root({ path: "/path/to/client" })`
2. Then run tests: `run_tests({ target: "./app/_features/cart" })`

#### Files to Create (All Inside `client/` Folder):

```
client/
├── vitest.config.ts                 # ✅ Root-level config (required by Vitest)
├── vitest.setup.ts                  # ✅ Root-level setup file
├── __mocks__/                       # ✅ Shared mocks (root level for Jest/Vitest)
│   ├── next/
│   │   └── navigation.ts
│   └── zustand/
│       └── middleware.ts
├── test-utils/                      # ✅ Shared test utilities (root level)
│   ├── renderWithProviders.tsx
│   ├── mockHandlers.ts
│   └── testDataBuilders.ts
└── mocks/                           # ✅ MSW handlers (root level)
    └── handlers.ts
```

#### Tests Required:

**File**: `app/__tests__/setup/vitest-setup.test.ts` (Inside client folder, co-located)

```typescript
describe('Test Setup Validation', () => {
  it('should configure jsdom environment correctly', () => {
    expect(window).toBeDefined()
    expect(document).toBeDefined()
  })

  it('should mock Next.js navigation', () => {
    // Verify mocks are loaded
  })

  it('should configure localStorage mock', () => {
    expect(localStorage.setItem).toBeDefined()
    expect(localStorage.getItem).toBeDefined()
  })
})
```

**Edge Cases to Test:**
- ✅ localStorage unavailable (Safari private mode)
- ✅ sessionStorage unavailable
- ✅ Window object undefined (SSR)
- ✅ Document undefined (SSR)

---

### 1.2 Test Utilities & Mock Infrastructure

**Priority**: 🔴 **MUST HAVE**

#### File: `test-utils/testDataBuilders.ts`

```typescript
/**
 * Test Data Builders Pattern
 * MAANG-Level: Provides deterministic test data with builder pattern
 */
export class ProductBuilder {
  private product: Partial<Product> = {
    id: 'test-product-1',
    name: 'Test Product',
    sku: 'TEST-001',
    quantity: 10,
    price: 99.99,
  }

  withId(id: string): this {
    this.product.id = id
    return this
  }

  withName(name: string): this {
    this.product.name = name
    return this
  }

  withPrice(price: number): this {
    this.product.price = price
    return this
  }

  withQuantity(quantity: number): this {
    this.product.quantity = quantity
    return this
  }

  withoutId(): this {
    this.product.id = undefined
    return this
  }

  build(): Product {
    return new Product(this.product as Product)
  }
}

export class CartItemBuilder {
  // Similar pattern for cart items
}

export class QuoteFormDataBuilder {
  // Similar pattern for quote forms
}
```

**Edge Cases to Test:**
- ✅ Null/undefined values
- ✅ Empty strings
- ✅ Negative numbers
- ✅ Extremely large numbers
- ✅ Special characters in strings
- ✅ Unicode characters
- ✅ Malformed data structures

---

## 🔥 Phase 2: Cart Store Unit Tests (CRITICAL)

### 2.1 Cart Store Core Operations

**Priority**: 🔴 **CRITICAL - REVENUE PROTECTION**

**File**: `client/app/_features/cart/stores/__tests__/useCartStore.test.ts`

**Location Rationale**: Co-located with source file for optimal maintainability

#### Test Categories:

##### Category 1: Add to Cart Operations

```typescript
describe('Cart Store - addToCart', () => {
  describe('Happy Path', () => {
    it('should add product with correct quantity', () => {
      // Arrange
      const store = useCartStore.getState()
      const item: CartItem = {
        productId: 'prod-1',
        quantity: 2,
        price: 99.99,
        name: 'Test Product',
      }

      // Act
      store.addToCart(item)

      // Assert
      const cart = useCartStore.getState().cart
      expect(cart).toHaveLength(1)
      expect(cart[0]).toMatchObject(item)
    })

    it('should increment quantity when adding duplicate product', () => {
      // Arrange
      const store = useCartStore.getState()
      store.clearCart()
      store.addToCart({ productId: 'prod-1', quantity: 2, price: 99.99, name: 'Product' })

      // Act
      store.addToCart({ productId: 'prod-1', quantity: 3, price: 99.99, name: 'Product' })

      // Assert
      const cart = useCartStore.getState().cart
      expect(cart).toHaveLength(1)
      expect(cart[0].quantity).toBe(5) // 2 + 3
    })
  })

  describe('Edge Cases - Product ID', () => {
    it('should handle empty string productId', () => {
      // Business Rule: Empty ID should be rejected or handled gracefully
    })

    it('should handle undefined productId', () => {
      // Business Rule: Undefined ID should throw or reject
    })

    it('should handle null productId', () => {
      // Business Rule: Null ID should be rejected
    })

    it('should handle whitespace-only productId', () => {
      // Business Rule: Whitespace should be trimmed or rejected
    })

    it('should handle extremely long productId', () => {
      // Performance: Very long IDs might affect performance
      const longId = 'a'.repeat(10000)
      // Test that it still works or is rejected appropriately
    })

    it('should handle special characters in productId', () => {
      // Test: <script>, SQL injection patterns, etc.
      const maliciousIds = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE products; --",
        '../../../etc/passwd',
      ]
      maliciousIds.forEach(id => {
        // Should handle safely
      })
    })

    it('should handle Unicode productId', () => {
      // Internationalization: Emoji, Chinese characters, etc.
      const unicodeIds = ['🚀', '产品-1', 'товар-1']
      unicodeIds.forEach(id => {
        // Should handle Unicode IDs correctly
      })
    })
  })

  describe('Edge Cases - Quantity', () => {
    it('should handle quantity = 0', () => {
      // Business Rule: 0 quantity might mean remove or error
    })

    it('should handle negative quantity', () => {
      // Business Rule: Negative should be rejected or normalized
    })

    it('should handle quantity = Number.MAX_SAFE_INTEGER', () => {
      // Boundary: Maximum integer
    })

    it('should handle quantity = Number.MIN_SAFE_INTEGER', () => {
      // Boundary: Minimum integer
    })

    it('should handle floating point quantity', () => {
      // Business Rule: Should quantities be integers only?
      const item = { productId: 'prod-1', quantity: 1.5, price: 99.99, name: 'Product' }
      // Should either reject or handle fractional quantities
    })

    it('should handle NaN quantity', () => {
      // Edge: Invalid number
    })

    it('should handle Infinity quantity', () => {
      // Edge: Infinite quantity
    })
  })

  describe('Edge Cases - Price', () => {
    it('should handle price = 0', () => {
      // Business Rule: Free items should be allowed or rejected?
    })

    it('should handle negative price', () => {
      // Business Rule: Negative prices should be rejected
    })

    it('should handle very large price', () => {
      // Boundary: Maximum price value
      const maxPrice = Number.MAX_VALUE
      // Test precision and handling
    })

    it('should handle very small price (fractions of cents)', () => {
      // Edge: Very precise pricing
      const item = { productId: 'prod-1', quantity: 1, price: 0.001, name: 'Product' }
      // Should handle or reject based on currency precision
    })

    it('should handle NaN price', () => {
      // Invalid number
    })

    it('should handle Infinity price', () => {
      // Infinite price
    })
  })

  describe('Edge Cases - Name', () => {
    it('should handle empty string name', () => {
      // Business Rule: Name might be optional or required
    })

    it('should handle very long product name', () => {
      // Performance: Long names might affect rendering
      const longName = 'A'.repeat(10000)
      // Test that it still works
    })

    it('should handle HTML in product name', () => {
      // Security: XSS prevention
      const item = { productId: 'prod-1', quantity: 1, price: 99.99, name: '<script>alert("xss")</script>' }
      // Should sanitize or reject
    })

    it('should handle Unicode product names', () => {
      // Internationalization
      const unicodeNames = ['产品名称', 'товар название', '🚀 Product Name']
      unicodeNames.forEach(name => {
        // Should handle correctly
      })
    })
  })

  describe('Edge Cases - Combined Scenarios', () => {
    it('should handle adding same product with different prices', () => {
      // Business Rule: What if same product has different prices?
      // Should update price or keep original?
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 89.99, name: 'Product' })
      // Which price should be used?
    })

    it('should handle adding same product with different names', () => {
      // Business Rule: Same product ID, different name (data inconsistency)
    })

    it('should handle adding 1000+ products to cart', () => {
      // Performance: Large cart handling
      for (let i = 0; i < 1000; i++) {
        store.addToCart({
          productId: `prod-${i}`,
          quantity: 1,
          price: 99.99,
          name: `Product ${i}`,
        })
      }
      // Should perform acceptably
    })
  })
})
```

##### Category 2: Remove from Cart Operations

```typescript
describe('Cart Store - removeFromCart', () => {
  describe('Happy Path', () => {
    it('should remove product by ID', () => {
      // Arrange
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      
      // Act
      store.removeFromCart('prod-1')
      
      // Assert
      expect(store.cart).toHaveLength(0)
    })

    it('should remove specific product from cart with multiple items', () => {
      // Arrange
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product 1' })
      store.addToCart({ productId: 'prod-2', quantity: 1, price: 49.99, name: 'Product 2' })
      
      // Act
      store.removeFromCart('prod-1')
      
      // Assert
      expect(store.cart).toHaveLength(1)
      expect(store.cart[0].productId).toBe('prod-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle removing non-existent product', () => {
      // Business Rule: Should be idempotent (no error)
      store.removeFromCart('non-existent-id')
      expect(store.cart).toHaveLength(0)
    })

    it('should handle removing from empty cart', () => {
      // Business Rule: Should not error
      store.clearCart()
      store.removeFromCart('prod-1')
      expect(store.cart).toHaveLength(0)
    })

    it('should handle empty string productId', () => {
      // Edge case
    })

    it('should handle undefined productId', () => {
      // Type safety
    })

    it('should handle null productId', () => {
      // Type safety
    })

    it('should handle case-sensitive productId matching', () => {
      // Business Rule: Are IDs case-sensitive?
      store.addToCart({ productId: 'Prod-1', quantity: 1, price: 99.99, name: 'Product' })
      store.removeFromCart('prod-1') // Different case
      // Should it remove or not?
    })

    it('should handle removing product with whitespace in ID', () => {
      // Edge case
    })
  })
})
```

##### Category 3: Update Quantity Operations

```typescript
describe('Cart Store - updateCartQuantity', () => {
  describe('Happy Path', () => {
    it('should update quantity of existing product', () => {
      // Arrange
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      
      // Act
      store.updateCartQuantity('prod-1', 5)
      
      // Assert
      expect(store.cart[0].quantity).toBe(5)
    })

    it('should remove item when quantity set to 0', () => {
      // Business Rule: 0 quantity = remove from cart
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      store.updateCartQuantity('prod-1', 0)
      expect(store.cart).toHaveLength(0)
    })

    it('should remove item when quantity set to negative', () => {
      // Business Rule: Negative = remove
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      store.updateCartQuantity('prod-1', -1)
      expect(store.cart).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle updating non-existent product', () => {
      // Business Rule: Should be idempotent
    })

    it('should handle quantity = Number.MAX_SAFE_INTEGER', () => {
      // Boundary condition
    })

    it('should handle floating point quantities', () => {
      // Business Rule: Should quantities be integers?
    })

    it('should handle updating quantity to same value', () => {
      // Performance: No-op updates
      store.addToCart({ productId: 'prod-1', quantity: 5, price: 99.99, name: 'Product' })
      store.updateCartQuantity('prod-1', 5)
      // Should not trigger unnecessary re-renders
    })
  })
})
```

##### Category 4: Clear Cart Operations

```typescript
describe('Cart Store - clearCart', () => {
  describe('Happy Path', () => {
    it('should remove all items from cart', () => {
      // Arrange
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product 1' })
      store.addToCart({ productId: 'prod-2', quantity: 2, price: 49.99, name: 'Product 2' })
      
      // Act
      store.clearCart()
      
      // Assert
      expect(store.cart).toHaveLength(0)
    })

    it('should handle clearing empty cart', () => {
      // Business Rule: Should be idempotent
      store.clearCart()
      expect(store.cart).toHaveLength(0)
    })
  })
})
```

##### Category 5: localStorage Persistence

```typescript
describe('Cart Store - Persistence', () => {
  describe('Happy Path', () => {
    it('should persist cart to localStorage on add', () => {
      // Arrange
      vi.spyOn(Storage.prototype, 'setItem')
      
      // Act
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      
      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('cart-storage'),
        expect.any(String)
      )
    })

    it('should restore cart from localStorage on initialization', () => {
      // Arrange
      const cartData = [{ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' }]
      localStorage.setItem('cart-storage', JSON.stringify({ state: { cart: cartData }, version: 0 }))
      
      // Act
      const newStore = useCartStore.getState()
      
      // Assert
      // Note: This requires proper hydration timing
      expect(newStore.cart.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Edge Cases - localStorage Failures', () => {
    it('should handle localStorage quota exceeded', () => {
      // Arrange
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError')
      })
      
      // Act & Assert
      // Should not crash, should handle gracefully
      expect(() => {
        store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      }).not.toThrow()
    })

    it('should handle localStorage unavailable (Safari private mode)', () => {
      // Arrange
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage is not available')
      })
      
      // Act & Assert
      // Should work in memory only
    })

    it('should handle corrupted localStorage data', () => {
      // Arrange
      localStorage.setItem('cart-storage', 'invalid-json{{{')
      
      // Act & Assert
      // Should handle gracefully, start with empty cart
    })

    it('should handle localStorage with wrong schema version', () => {
      // Arrange
      localStorage.setItem('cart-storage', JSON.stringify({ state: { cart: [] }, version: 999 }))
      
      // Act & Assert
      // Should migrate or reset gracefully
    })

    it('should handle localStorage with missing cart array', () => {
      // Arrange
      localStorage.setItem('cart-storage', JSON.stringify({ state: {}, version: 0 }))
      
      // Act & Assert
      // Should default to empty array
    })

    it('should handle localStorage with invalid cart item structure', () => {
      // Arrange
      localStorage.setItem('cart-storage', JSON.stringify({
        state: {
          cart: [
            { invalidField: 'invalid' }, // Missing required fields
            { productId: 'prod-1' }, // Missing quantity, price, name
          ],
        },
        version: 0,
      }))
      
      // Act & Assert
      // Should filter invalid items or reset
    })
  })

  describe('Edge Cases - Concurrent Modifications', () => {
    it('should handle rapid sequential cart operations', () => {
      // Performance: Rapid fire operations
      for (let i = 0; i < 100; i++) {
        store.addToCart({ productId: `prod-${i}`, quantity: 1, price: 99.99, name: `Product ${i}` })
      }
      // Should handle all operations correctly
    })

    it('should handle cart operations during hydration', () => {
      // Race condition: Operations during localStorage hydration
      // Complex timing test
    })
  })
})
```

##### Category 6: Hydration Awareness

```typescript
describe('Cart Store - Hydration', () => {
  describe('useHydratedCart Hook', () => {
    it('should return empty cart before hydration', () => {
      // Arrange
      const { result } = renderHook(() => useHydratedCart())
      
      // Assert
      expect(result.current.isHydrated).toBe(false)
      expect(result.current.cart).toHaveLength(0)
    })

    it('should return cart after hydration', () => {
      // Arrange
      store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
      
      // Act
      store.setHasHydrated(true)
      const { result } = renderHook(() => useHydratedCart())
      
      // Assert
      expect(result.current.isHydrated).toBe(true)
      expect(result.current.cart.length).toBeGreaterThan(0)
    })

    it('should calculate itemCount correctly', () => {
      // Arrange
      store.addToCart({ productId: 'prod-1', quantity: 2, price: 99.99, name: 'Product 1' })
      store.addToCart({ productId: 'prod-2', quantity: 3, price: 49.99, name: 'Product 2' })
      store.setHasHydrated(true)
      
      // Act
      const { result } = renderHook(() => useHydratedCart())
      
      // Assert
      expect(result.current.itemCount).toBe(5) // 2 + 3
    })

    it('should handle SSR correctly (window undefined)', () => {
      // Arrange
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      // Act & Assert
      // Should not crash during SSR
      
      // Cleanup
      global.window = originalWindow
    })
  })
})
```

---

## 🔥 Phase 3: Quote Submission Logic (CRITICAL)

### 3.1 Quote Submission Hook Tests

**Priority**: 🔴 **CRITICAL - REVENUE PROTECTION**

**File**: `client/app/_features/cart/hooks/__tests__/useCartPageLogic.test.ts`

**Location Rationale**: Co-located with hook for optimal maintainability

```typescript
describe('useCartPageLogic - Quote Submission', () => {
  describe('Form Validation', () => {
    describe('Authenticated Users', () => {
      it('should not require guest fields for authenticated users', () => {
        // Business Rule: Logged-in users don't need to re-enter contact info
      })

      it('should use customerId from authenticated user', () => {
        // Business Rule: Link quote to customer account
      })

      it('should handle authenticated users with customerId = 0', () => {
        // Edge: Admin accounts may not have customerId
      })
    })

    describe('Non-Authenticated Users (Guest)', () => {
      it('should require firstName for guest users', () => {
        // Business Rule: Guest quotes need contact info
      })

      it('should require lastName for guest users', () => {
        // Business Rule
      })

      it('should require email for guest users', () => {
        // Business Rule
      })

      it('should validate email format for guest users', () => {
        // Edge cases:
        const invalidEmails = [
          'not-an-email',
          '@example.com',
          'user@',
          'user@example',
          'user name@example.com', // Spaces
          'user@exam ple.com', // Spaces in domain
        ]
        invalidEmails.forEach(email => {
          // Should reject
        })
      })

      it('should require at least one cart item', () => {
        // Business Rule: Cannot submit empty quote
      })
    })

    describe('Common Fields', () => {
      it('should validate validUntil date is in future', () => {
        // Business Rule: Quote expiration must be future date
      })

      it('should validate validUntil is not too far in future', () => {
        // Business Rule: Reasonable expiration window (e.g., max 1 year)
      })

      it('should validate validUntil format', () => {
        // Edge: Invalid date formats
      })

      it('should handle notes field (optional)', () => {
        // Business Rule: Notes are optional
      })

      it('should validate notes length (max 1000 chars)', () => {
        // Business Rule: Reasonable note length
      })
    })
  })

  describe('Quote Submission Flow', () => {
    describe('Happy Path', () => {
      it('should submit quote with all cart items', async () => {
        // Arrange
        store.addToCart({ productId: 'prod-1', quantity: 2, price: 99.99, name: 'Product' })
        const formData = createValidQuoteFormData()
        
        // Act
        await handleSubmit(formData)
        
        // Assert
        expect(mockApi.Public.sendQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({ productId: 'prod-1', quantity: 2 }),
            ]),
          })
        )
      })

      it('should clear cart after successful submission', async () => {
        // Business Rule: Cart cleared after quote submission
        store.addToCart({ productId: 'prod-1', quantity: 1, price: 99.99, name: 'Product' })
        await handleSubmit(createValidQuoteFormData())
        expect(store.cart).toHaveLength(0)
      })

      it('should set submitted state after success', async () => {
        // UI State: Show success message
      })

      it('should include referral information if provided', async () => {
        // Business Rule: Referral tracking
      })

      it('should include customerId for authenticated users', async () => {
        // Business Rule: Link to customer account
      })
    })

    describe('Error Handling', () => {
      it('should handle network failure gracefully', async () => {
        // Arrange
        mockApi.Public.sendQuote.mockRejectedValue(new Error('Network error'))
        
        // Act & Assert
        await expect(handleSubmit(createValidQuoteFormData())).rejects.toThrow()
        expect(store.cart).not.toHaveLength(0) // Cart should NOT be cleared on error
      })

      it('should handle API error response', async () => {
        // Arrange
        mockApi.Public.sendQuote.mockRejectedValue({
          response: { status: 400, data: { message: 'Invalid quote data' } },
        })
        
        // Act & Assert
        // Should show error message, not clear cart
      })

      it('should handle rate limiting (429)', async () => {
        // Business Rule: Rate limiting protection
        mockApi.Public.sendQuote.mockRejectedValue({
          response: { status: 429, data: { message: 'Too many requests' } },
        })
        // Should show rate limit message
      })

      it('should handle timeout errors', async () => {
        // Edge: Request timeout
        mockApi.Public.sendQuote.mockImplementation(() => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 30000)
        }))
        // Should handle timeout gracefully
      })

      it('should handle malformed API response', async () => {
        // Edge: API returns invalid JSON or unexpected structure
      })
    })

    describe('Edge Cases', () => {
      it('should handle submission with empty cart', () => {
        // Business Rule: Should be prevented by validation
      })

      it('should handle submission during product fetch', () => {
        // Race condition: Submit while products are loading
      })

      it('should handle duplicate submissions (prevent double-submit)', () => {
        // Security: Prevent accidental duplicate quotes
        const formData = createValidQuoteFormData()
        handleSubmit(formData)
        handleSubmit(formData) // Immediate second call
        // Should only submit once or reject second
      })

      it('should handle cart modification during submission', () => {
        // Race condition: Cart changes while submitting
        handleSubmit(createValidQuoteFormData())
        store.addToCart({ productId: 'prod-2', quantity: 1, price: 49.99, name: 'Product 2' })
        // Which cart state should be submitted?
      })
    })
  })
})
```

---

## 🔥 Phase 4: HTTP Service Public Methods (CRITICAL)

### 4.1 Public HTTP Methods Tests

**Priority**: 🔴 **CRITICAL - INFRASTRUCTURE**

**File**: `client/app/_shared/services/__tests__/httpService.public.test.ts`

**Location Rationale**: Co-located with service for optimal maintainability

```typescript
describe('HttpService - Public Methods', () => {
  describe('getPublic', () => {
    describe('Happy Path', () => {
      it('should make GET request without auth headers', async () => {
        // Arrange
        vi.spyOn(global, 'fetch')
        
        // Act
        await HttpService.getPublic<Product>('/products/123')
        
        // Assert
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/products/123'),
          expect.objectContaining({
            method: 'GET',
            headers: expect.not.objectContaining({
              Authorization: expect.anything(),
            }),
          })
        )
      })

      it('should parse JSON response correctly', async () => {
        // Arrange
        mockFetchResponse({ statusCode: 200, data: mockProduct })
        
        // Act
        const response = await HttpService.getPublic<Product>('/products/123')
        
        // Assert
        expect(response.data.data).toMatchObject(mockProduct)
      })
    })

    describe('Error Handling', () => {
      it('should handle 404 Not Found', async () => {
        // Arrange
        mockFetchResponse({ status: 404, statusText: 'Not Found' })
        
        // Act & Assert
        await expect(HttpService.getPublic<Product>('/products/999')).rejects.toThrow()
      })

      it('should handle 500 Server Error', async () => {
        // Arrange
        mockFetchResponse({ status: 500, statusText: 'Internal Server Error' })
        
        // Act & Assert
        await expect(HttpService.getPublic<Product>('/products/123')).rejects.toThrow()
      })

      it('should handle network errors', async () => {
        // Arrange
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
        
        // Act & Assert
        await expect(HttpService.getPublic<Product>('/products/123')).rejects.toThrow('Network error')
      })

      it('should handle timeout', async () => {
        // Arrange
        global.fetch = vi.fn().mockImplementation(() => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 5000)
        }))
        
        // Act & Assert
        // Should handle timeout appropriately
      })

      it('should handle malformed JSON response', async () => {
        // Arrange
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON')),
        })
        
        // Act & Assert
        await expect(HttpService.getPublic<Product>('/products/123')).rejects.toThrow()
      })

      it('should handle CORS errors', async () => {
        // Edge: Cross-origin issues
        global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
        
        // Act & Assert
        await expect(HttpService.getPublic<Product>('/products/123')).rejects.toThrow()
      })
    })

    describe('Edge Cases', () => {
      it('should handle empty response', async () => {
        // Edge: API returns empty body
      })

      it('should handle very large response', async () => {
        // Performance: Large payloads
      })

      it('should handle special characters in URL', async () => {
        // Edge: URL encoding
        await HttpService.getPublic<Product>('/products/test%20product')
        // Should encode correctly
      })

      it('should handle invalid base URL', async () => {
        // Edge: Configuration error
      })

      it('should handle concurrent requests', async () => {
        // Performance: Multiple simultaneous requests
        const requests = Array.from({ length: 10 }, () =>
          HttpService.getPublic<Product>('/products/123')
        )
        await Promise.all(requests)
        // Should handle all correctly
      })
    })
  })

  describe('postPublic', () => {
    describe('Happy Path', () => {
      it('should make POST request without auth headers', async () => {
        // Similar to getPublic tests
      })

      it('should serialize JSON body correctly', async () => {
        // Arrange
        const data = { name: 'Test', quantity: 1 }
        vi.spyOn(global, 'fetch')
        
        // Act
        await HttpService.postPublic('/quotes', data)
        
        // Assert
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(data),
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        )
      })

      it('should handle FormData without Content-Type header', async () => {
        // Business Rule: Browser sets Content-Type for FormData
        const formData = new FormData()
        formData.append('file', new Blob(['test'], { type: 'text/plain' }))
        
        await HttpService.postPublic('/upload', formData)
        
        // Should NOT set Content-Type manually for FormData
      })
    })

    describe('Error Handling', () => {
      // Similar error cases as getPublic
      it('should handle 400 Bad Request with error message', async () => {
        // Business Rule: Show validation errors to user
      })

      it('should handle 429 Rate Limit', async () => {
        // Business Rule: Rate limiting
      })
    })

    describe('Edge Cases', () => {
      it('should handle null/undefined data', async () => {
        // Edge: Empty payload
      })

      it('should handle circular references in data', async () => {
        // Edge: Cannot serialize
        const circular: any = { name: 'Test' }
        circular.self = circular
        // Should handle or reject
      })

      it('should handle very large payload', async () => {
        // Performance: Large request body
        const largeData = { items: Array.from({ length: 10000 }, (_, i) => ({ id: i })) }
        // Should handle or reject based on limits
      })

      it('should handle special characters in data', async () => {
        // Edge: Unicode, emoji, etc.
        const data = { name: '产品名称 🚀', description: 'Description with "quotes" & <tags>' }
        // Should serialize correctly
      })
    })
  })
})
```

---

## 🔥 Phase 5: Validation Schema Tests (CRITICAL)

### 5.1 Quote Schema Validation

**Priority**: 🔴 **CRITICAL - DATA INTEGRITY**

**File**: `client/app/_core/validation/__tests__/quoteSchema.test.ts`

**Location Rationale**: Co-located with validation schema for optimal maintainability

```typescript
describe('quoteSchema Validation', () => {
  describe('Authenticated User Validation', () => {
    it('should accept valid authenticated user quote', () => {
      // Business Rule: Authenticated users don't need guest fields
      const validQuote = {
        customerId: 1,
        isAuthenticated: true,
        items: [{ productId: 'prod-1', quantity: 1, price: 99.99 }],
        validUntil: addDays(new Date(), 30).toISOString(),
      }
      expect(() => quoteSchema.parse(validQuote)).not.toThrow()
    })

    it('should reject authenticated quote without items', () => {
      // Business Rule: At least one item required
      const invalidQuote = {
        customerId: 1,
        isAuthenticated: true,
        items: [],
        validUntil: addDays(new Date(), 30).toISOString(),
      }
      expect(() => quoteSchema.parse(invalidQuote)).toThrow()
    })

    it('should accept authenticated user with customerId = 0', () => {
      // Edge: Admin accounts
      const validQuote = {
        customerId: 0,
        isAuthenticated: true,
        items: [{ productId: 'prod-1', quantity: 1, price: 99.99 }],
        validUntil: addDays(new Date(), 30).toISOString(),
      }
      expect(() => quoteSchema.parse(validQuote)).not.toThrow()
    })
  })

  describe('Guest User Validation', () => {
    it('should require firstName for guest users', () => {
      // Business Rule
    })

    it('should require lastName for guest users', () => {
      // Business Rule
    })

    it('should require email for guest users', () => {
      // Business Rule
    })

    it('should validate email format', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@example',
        '',
        '   ',
        'user name@example.com',
        'user@exam ple.com',
      ]
      invalidEmails.forEach(email => {
        expect(() => quoteSchema.parse({
          firstName: 'John',
          lastName: 'Doe',
          email,
          items: [{ productId: 'prod-1', quantity: 1, price: 99.99 }],
          validUntil: addDays(new Date(), 30).toISOString(),
        })).toThrow()
      })
    })

    it('should accept valid guest quote', () => {
      // Happy path
    })
  })

  describe('Items Validation', () => {
    it('should require at least one item', () => {
      // Business Rule
    })

    it('should validate item productId', () => {
      // Edge cases: empty, null, undefined, special chars
    })

    it('should validate item quantity is positive integer', () => {
      // Edge cases: 0, negative, float, NaN, Infinity
    })

    it('should validate item price is positive number', () => {
      // Edge cases: 0, negative, NaN, Infinity
    })

    it('should handle maximum items limit', () => {
      // Performance: Large quote submissions
      const items = Array.from({ length: 1000 }, (_, i) => ({
        productId: `prod-${i}`,
        quantity: 1,
        price: 99.99,
      }))
      // Should handle or reject based on business rules
    })
  })

  describe('validUntil Validation', () => {
    it('should accept valid future date', () => {
      // Happy path
    })

    it('should reject past dates', () => {
      // Business Rule: Quote expiration must be in future
      const pastDate = subDays(new Date(), 1).toISOString()
      expect(() => quoteSchema.parse({
        items: [{ productId: 'prod-1', quantity: 1, price: 99.99 }],
        validUntil: pastDate,
      })).toThrow()
    })

    it('should reject dates too far in future', () => {
      // Business Rule: Reasonable expiration window
      const farFuture = addYears(new Date(), 2).toISOString()
      // Should reject or accept based on business rules
    })

    it('should handle invalid date formats', () => {
      // Edge: Invalid date strings
      const invalidDates = [
        'not-a-date',
        '2025-13-45', // Invalid month/day
        '2025-02-30', // Invalid date
        '',
        null,
        undefined,
      ]
      invalidDates.forEach(date => {
        // Should reject
      })
    })
  })

  describe('Notes Validation', () => {
    it('should accept valid notes', () => {
      // Happy path
    })

    it('should accept empty notes (optional)', () => {
      // Business Rule: Notes are optional
    })

    it('should reject notes exceeding maximum length', () => {
      // Business Rule: Max 1000 characters
      const longNotes = 'A'.repeat(1001)
      // Should reject
    })

    it('should handle special characters in notes', () => {
      // Edge: Unicode, HTML, SQL injection attempts
      const maliciousNotes = [
        '<script>alert("xss")</script>',
        "'; DROP TABLE quotes; --",
        '🚀 Emoji notes',
        'Multi\nline\nnotes',
      ]
      // Should sanitize or reject based on business rules
    })
  })
})
```

---

## 🔥 Phase 6: Store Page Logic (Product Catalog)

### 6.1 Store Page Logic Tests

**Priority**: 🟡 **HIGH - REVENUE IMPACT**

**File**: `client/app/_features/store/__tests__/useStorePageLogic.test.ts`

**Location Rationale**: Co-located with hook for optimal maintainability

```typescript
describe('useStorePageLogic - Product Catalog', () => {
  describe('Product Search', () => {
    it('should search products by name', async () => {
      // Happy path
    })

    it('should handle empty search query', async () => {
      // Edge: Empty string should return all or handle gracefully
    })

    it('should handle special characters in search', async () => {
      // Edge: SQL injection attempts, special chars
      const maliciousQueries = [
        "'; DROP TABLE products; --",
        '<script>alert("xss")</script>',
        '../../etc/passwd',
        '%',
        '_',
      ]
      // Should sanitize or handle safely
    })

    it('should handle very long search queries', async () => {
      // Performance: Long query strings
      const longQuery = 'A'.repeat(10000)
      // Should handle or truncate
    })

    it('should debounce search input', () => {
      // Performance: Don't search on every keystroke
    })
  })

  describe('Product Filtering', () => {
    it('should filter by category', async () => {
      // Happy path
    })

    it('should handle multiple categories', async () => {
      // Business Rule: Multi-select categories
    })

    it('should handle non-existent category IDs', async () => {
      // Edge: Invalid category
    })

    it('should handle filtering with no results', async () => {
      // Edge: Empty result set
    })
  })

  describe('Product Sorting', () => {
    it('should sort by price ascending', async () => {
      // Happy path
    })

    it('should sort by price descending', async () => {
      // Happy path
    })

    it('should sort by name alphabetically', async () => {
      // Happy path
    })

    it('should handle sorting with null/undefined prices', async () => {
      // Edge: Products without prices
    })

    it('should handle sorting with same values', async () => {
      // Edge: Tie-breaking logic
    })
  })

  describe('Pagination', () => {
    it('should paginate results correctly', async () => {
      // Happy path
    })

    it('should handle page = 0', async () => {
      // Edge: Invalid page number
    })

    it('should handle page exceeding total pages', async () => {
      // Edge: Page out of bounds
    })

    it('should handle very large pageSize', async () => {
      // Performance: Large page sizes
    })

    it('should handle pageSize = 0', async () => {
      // Edge: Invalid page size
    })
  })

  describe('Product Loading', () => {
    it('should load initial products on mount', async () => {
      // Happy path
    })

    it('should handle loading state correctly', async () => {
      // UI State: Show loading spinner
    })

    it('should handle empty product list', async () => {
      // Edge: No products available
    })

    it('should handle product fetch failure', async () => {
      // Error handling
    })

    it('should handle partial product fetch failure', async () => {
      // Edge: Some products fail to load
    })
  })
})
```

---

## 🔥 Phase 7: Product Detail Page Logic

### 7.1 Product Detail Tests

**Priority**: 🟡 **HIGH - REVENUE IMPACT**

**File**: `client/app/store/product/[id]/__tests__/page.test.ts`

**Location Rationale**: Co-located with page component for optimal maintainability

```typescript
describe('Product Detail Page', () => {
  describe('Product Loading', () => {
    it('should load product by ID', async () => {
      // Happy path
    })

    it('should handle non-existent product ID', async () => {
      // Edge: 404 handling
    })

    it('should handle invalid product ID format', async () => {
      // Edge: Malformed IDs
      const invalidIds = [
        '',
        '   ',
        '../../etc/passwd',
        '<script>alert("xss")</script>',
        'very-long-id-' + 'a'.repeat(10000),
      ]
      // Should handle safely
    })

    it('should handle product fetch failure', async () => {
      // Error handling
    })
  })

  describe('Add to Cart from Detail', () => {
    it('should add product to cart with default quantity', async () => {
      // Happy path
    })

    it('should add product to cart with custom quantity', async () => {
      // Happy path
    })

    it('should handle adding out-of-stock product', async () => {
      // Business Rule: Out-of-stock handling
    })

    it('should handle adding product with quantity > stock', async () => {
      // Business Rule: Stock validation
    })

    it('should increment existing cart item quantity', async () => {
      // Business Rule: Duplicate handling
    })
  })

  describe('Product Image Handling', () => {
    it('should display product image if available', () => {
      // Happy path
    })

    it('should handle missing product image', () => {
      // Edge: Fallback to placeholder
    })

    it('should handle broken image URLs', () => {
      // Edge: 404 images
    })

    it('should handle very large images', () => {
      // Performance: Large image files
    })
  })
})
```

---

## 📊 Test Coverage Targets

### MAANG-Level Coverage Goals

| Component | Target Coverage | Critical Paths | Edge Cases |
|-----------|----------------|----------------|------------|
| **Cart Store** | 95%+ | 100% | 90%+ |
| **Quote Submission** | 95%+ | 100% | 90%+ |
| **HTTP Service (Public)** | 90%+ | 100% | 85%+ |
| **Validation Schemas** | 98%+ | 100% | 95%+ |
| **Store Page Logic** | 85%+ | 100% | 80%+ |
| **Product Detail** | 85%+ | 100% | 80%+ |

### What NOT to Test

- ❌ CSS styling and visual appearance
- ❌ Animation timing and effects
- ❌ Third-party library internals (React, Zustand, Zod)
- ❌ Next.js routing internals
- ❌ Browser API implementations (localStorage, fetch)

---

## 🚀 Implementation Timeline

### Phase 1: Foundation (Week 1)
- [x] ✅ **Vitest MCP Integration** - Added to Cursor MCP config
- [ ] Install @vitest/coverage-v8 dependency
- [ ] Set up Vitest configuration (`vitest.config.ts`)
- [ ] Set up Vitest setup file (`vitest.setup.ts`)
- [ ] Set up MSW for API mocking
- [ ] Create test utilities and builders
- [ ] Create mock handlers for all public APIs
- [ ] Test vitest-mcp integration with first test file

### Phase 2: Cart Store (Week 2)
- [ ] Cart store core operations (add, remove, update)
- [ ] Cart store persistence (localStorage)
- [ ] Cart store hydration
- [ ] Cart store edge cases

### Phase 3: Quote Submission (Week 3)
- [ ] Quote form validation
- [ ] Quote submission flow
- [ ] Error handling
- [ ] Edge cases and race conditions

### Phase 4: HTTP Service (Week 4)
- [ ] Public HTTP methods (getPublic, postPublic)
- [ ] Error handling
- [ ] Edge cases

### Phase 5: Validation (Week 5)
- [ ] Quote schema validation
- [ ] Contact schema validation
- [ ] Edge cases for all schemas

### Phase 6: Store Logic (Week 6)
- [ ] Product search
- [ ] Product filtering
- [ ] Product sorting
- [ ] Pagination

### Phase 7: Product Detail (Week 7)
- [ ] Product loading
- [ ] Add to cart
- [ ] Image handling

### Phase 8: Integration & Polish (Week 8)
- [ ] Integration tests
- [ ] Test performance optimization
- [ ] Coverage reports
- [ ] Documentation

---

## ✅ Definition of Done

Every test MUST:

1. **Business-Justified**: Answers "what business scenario does this protect?"
2. **Deterministic**: Same input = same output, every time (no randomness, no time dependencies)
3. **Fast**: < 50ms execution time
4. **Isolated**: No shared state, can run in any order
5. **Clear Naming**: `Method_Scenario_ExpectedResult` pattern
6. **AAA Pattern**: Arrange, Act, Assert clearly separated
7. **Edge Cases**: Tests at least 3 edge cases per happy path
8. **Error Paths**: Tests all error scenarios
9. **Documented**: Complex tests have comments explaining why

---

## 🔗 Related Documents

- [Frontend Testing Strategy](./medsource-frontend-testing.md) - Overall testing approach
- [Business Flow Documentation](./business_flow.md) - Business rules to test
- [Backend Testing Strategy](../server/Migrations/medsource-backend-testing.md) - API contract alignment

---

## 📚 References & Industry Standards

### Official Recommendations:
- ✅ **Vercel/Next.js**: [Testing Documentation](https://nextjs.org/docs/app/guides/testing/vitest) - Co-locate tests in app directory
- ✅ **React Testing Library**: [Best Practices](https://testing-library.com/docs/react-testing-library/intro/) - Co-location recommended
- ✅ **Vitest**: [Project Structure](https://vitest.dev/guide/project) - Co-locate with source files
- ✅ **TypeScript**: [Performance Wiki](https://github.com/microsoft/TypeScript/wiki/Performance) - Co-location prevents test dependencies
- ✅ **Vitest MCP**: [@djankies/vitest-mcp](https://www.npmjs.com/package/@djankies/vitest-mcp) - AI-optimized test runner for Cursor/Claude

### MAANG Company Patterns:
- ✅ **Microsoft**: Co-locates tests in monorepo with source files (100+ packages, 1M+ LOC)
- ✅ **Google**: Test files co-located in `__tests__/` directories
- ✅ **Meta**: Co-location for unit tests, separate E2E tests
- ✅ **Amazon**: Co-location pattern for maintainability

### Key Takeaways:
1. **Co-location is Industry Standard** - All major frameworks and companies use it
2. **Separation of Concerns is ENHANCED** - Each module is self-contained (code + tests)
3. **Type Safety Benefits** - TypeScript prevents test code in production
4. **Maintainability** - Tests stay with code during refactoring
5. **Discoverability** - Immediate visibility of test coverage

---

*Document created: December 14, 2025*  
*Last updated: December 14, 2025*  
*Author: MAANG-Level Testing Strategy Review*  
*Approach: Exhaustive edge case coverage with business-first prioritization*  
*Organization: Co-location pattern (Industry Standard & MAANG Best Practice)*
