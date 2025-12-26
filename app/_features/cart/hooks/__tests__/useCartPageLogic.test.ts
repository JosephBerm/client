/**
 * useCartPageLogic Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive tests for cart page business logic hook.
 * Tests quote submission flow, error handling, and edge cases.
 * 
 * **Priority**: 🔴 CRITICAL - REVENUE PROTECTION
 * 
 * **What This Tests:**
 * - Quote submission flow (authenticated and guest users)
 * - Cart clearing after successful submission
 * - Error handling (network failures, API errors, rate limiting)
 * - Referral tracking integration
 * - Edge cases (empty cart, duplicate submissions, race conditions)
 * 
 * **Testing Strategy:**
 * - Mock all external dependencies (API, stores, router)
 * - Test hook return values and side effects
 * - Verify business logic correctness
 * - Test error scenarios thoroughly
 */

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QuoteFormDataBuilder, CartItemBuilder } from '@/test-utils/testDataBuilders'
import type { QuoteFormData } from '@_core'
import Quote from '@_classes/Quote'

// ============================================================================
// Mocks - Using vi.hoisted() to ensure variables are available for vi.mock()
// ============================================================================

// Hoisted mock functions - these are initialized BEFORE vi.mock() calls
const { mockSendQuote, mockGetProduct, mockUseCartStore, mockUseHydratedCart } = vi.hoisted(() => ({
  mockSendQuote: vi.fn(),
  mockGetProduct: vi.fn(),
  mockUseCartStore: vi.fn(),
  mockUseHydratedCart: vi.fn(),
}))

vi.mock('@_features/cart/stores/useCartStore', () => ({
  useCartStore: mockUseCartStore,
  useHydratedCart: mockUseHydratedCart,
}))

vi.mock('@_features/auth', () => ({
  useAuthStore: vi.fn(),
}))

// Hoisted mock for useRouter - must be vi.fn() to allow mockReturnValue
interface MockRouter {
  push: ReturnType<typeof vi.fn>
  replace: ReturnType<typeof vi.fn>
  refresh: ReturnType<typeof vi.fn>
  back: ReturnType<typeof vi.fn>
  forward: ReturnType<typeof vi.fn>
  prefetch: ReturnType<typeof vi.fn>
}
const mockUseRouter = vi.hoisted(() => vi.fn<() => MockRouter>())

vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
}))

vi.mock('@_shared', async () => {
  const actual = await vi.importActual('@_shared') as typeof import('@_shared')
  return {
    ...actual,
    API: {
      ...actual.API,
      Public: {
        ...(actual.API?.Public || {}),
        sendQuote: mockSendQuote,
      },
      Store: {
        ...(actual.API?.Store || {}),
        Products: {
          ...(actual.API?.Store?.Products || {}),
          get: mockGetProduct,
        },
      },
    },
  }
})

vi.mock('@_features/store/hooks/useReferralTracking', () => ({
  getStoredReferral: vi.fn(() => null),
}))

// Import after mocks are set up
import { useCartPageLogic } from '../useCartPageLogic'
import { useCartStore } from '../../stores/useCartStore'
import { useAuthStore } from '@_features/auth'
import { API } from '@_shared'
import * as referralTracking from '@_features/store/hooks/useReferralTracking'

// ============================================================================
// Test Helpers
// ============================================================================

function createMockCartStore(cart: any[] = []) {
  const mockStore = {
    cart,
    updateCartQuantity: vi.fn((productId: string, quantity: number) => {
      const item = mockStore.cart.find((i) => i.productId === productId)
      if (item) {
        item.quantity = quantity
      }
    }),
    removeFromCart: vi.fn((productId: string) => {
      mockStore.cart = mockStore.cart.filter((i) => i.productId !== productId)
    }),
    clearCart: vi.fn(() => {
      mockStore.cart = []
    }),
  }
  return mockStore
}

function createMockAuthStore(user: any = null, isAuthenticated: boolean = false) {
  return {
    isAuthenticated,
    user,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('useCartPageLogic - Quote Submission', () => {
  let mockCartStore: ReturnType<typeof createMockCartStore>
  let mockAuthStore: ReturnType<typeof createMockAuthStore>
  let mockRouter: MockRouter

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup cart store mock
    mockCartStore = createMockCartStore([])
    ;(useCartStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockCartStore)
      }
      return mockCartStore
    })

    // Setup useHydratedCart mock - use the hoisted mock directly
    mockUseHydratedCart.mockReturnValue({
      cart: mockCartStore.cart,
      isHydrated: true,
      itemCount: mockCartStore.cart.reduce((sum: number, item: any) => sum + item.quantity, 0),
    })

    // Setup auth store mock
    mockAuthStore = createMockAuthStore(null, false)
    ;(useAuthStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockAuthStore)
      }
      return mockAuthStore
    })

    // Setup router mock - use the hoisted mock directly
    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }
    mockUseRouter.mockReturnValue(mockRouter)

    // Setup API mocks
    mockSendQuote.mockResolvedValue({
      data: {
        statusCode: 200,
        message: 'Quote submitted successfully',
        payload: { id: 'quote-123' },
      },
    })

    mockGetProduct.mockResolvedValue({
      data: {
        statusCode: 200,
        payload: {
          id: 'prod-1',
          name: 'Test Product',
          price: 99.99,
        },
      },
    })

    // Setup referral tracking mock
    vi.mocked(referralTracking.getStoredReferral).mockReturnValue(null)
  })

  // ============================================================================
  // Quote Submission Flow - Happy Path
  // ============================================================================

  describe('Quote Submission Flow - Happy Path', () => {
    it('should submit quote with all cart items', async () => {
      // Arrange
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(2).withPrice(99.99).build(),
        new CartItemBuilder().withProductId('prod-2').withQuantity(1).withPrice(49.99).build(),
      ]
      // Update useHydratedCart mock to reflect the new cart
      mockUseHydratedCart.mockReturnValue({
        cart: mockCartStore.cart,
        isHydrated: true,
        itemCount: mockCartStore.cart.reduce((sum, item) => sum + item.quantity, 0),
      })

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .withNotes('Please expedite')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      // Act
      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Assert - hook uses CreateQuoteRequest DTO (flat structure) not Quote class
      expect(mockSendQuote).toHaveBeenCalledTimes(1)
      const callArgs = mockSendQuote.mock.calls[0][0]
      // CreateQuoteRequest has 'items' array, not 'products'
      expect(callArgs.items).toHaveLength(2)
      expect(callArgs.items[0].productId).toBe('prod-1')
      expect(callArgs.items[0].quantity).toBe(2)
      expect(callArgs.items[1].productId).toBe('prod-2')
      expect(callArgs.items[1].quantity).toBe(1)
      expect(callArgs.emailAddress).toBe('john@example.com')
      expect(callArgs.description).toBe('Please expedite')
    })

    it('should clear cart after successful submission', async () => {
      // Business Rule: Cart cleared after quote submission
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Wait for async operations
      await waitFor(() => {
        expect(mockCartStore.clearCart).toHaveBeenCalled()
      })

      // Cart should be cleared
      expect(mockCartStore.cart).toHaveLength(0)
    })

    it('should set submitted state after success', async () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      expect(result.current.submitted).toBe(false)

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Wait for state update
      await waitFor(() => {
        expect(result.current.submitted).toBe(true)
      })
    })

    it('should include referral information if provided', async () => {
      // Business Rule: Referral tracking (per business_flow.md Section 2.2)
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      vi.mocked(referralTracking.getStoredReferral).mockReturnValue({
        referredBy: 'salesrep@example.com',
        source: 'url',
        capturedAt: new Date().toISOString(),
      })

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.referredBy).toBe('salesrep@example.com')
      expect(callArgs.referralSource).toBe('url')
    })

    it('should use authenticated user data when logged in', async () => {
      // Business Rule: Use user account data for authenticated users
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      mockAuthStore = createMockAuthStore(
        {
          customerId: 123,
          email: 'user@example.com',
          name: { first: 'Jane', last: 'Smith' },
          phone: '555-1234',
          customer: { name: 'Acme Corp' },
        },
        true
      )
      ;(useAuthStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector(mockAuthStore)
        }
        return mockAuthStore
      })

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(true)
        .withCustomerId(123)
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // CreateQuoteRequest has flat structure: firstName/lastName, not name.first/name.last
      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.emailAddress).toBe('user@example.com')
      expect(callArgs.firstName).toBe('Jane')
      expect(callArgs.lastName).toBe('Smith')
      expect(callArgs.phoneNumber).toBe('555-1234')
      expect(callArgs.companyName).toBe('Acme Corp')
    })

    it('should use guest form data when not authenticated', async () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('Guest')
        .withLastName('User')
        .withEmail('guest@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // CreateQuoteRequest has flat structure: firstName/lastName, not name.first/name.last
      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.firstName).toBe('Guest')
      expect(callArgs.lastName).toBe('User')
      expect(callArgs.emailAddress).toBe('guest@example.com')
    })
  })

  // ============================================================================
  // Error Handling
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle network failure gracefully', async () => {
      // Arrange
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      mockSendQuote.mockRejectedValue(new Error('Network error'))

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())
      const initialCartLength = mockCartStore.cart.length

      // Act & Assert
      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Wait a bit to ensure cart is not cleared
      await waitFor(() => {
        expect(mockCartStore.cart.length).toBe(initialCartLength)
      })

      // Cart should NOT be cleared on error
      expect(mockCartStore.clearCart).not.toHaveBeenCalled()
      expect(result.current.submitted).toBe(false)
    })

    it('should handle API error response (400)', async () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      mockSendQuote.mockResolvedValue({
        data: {
          statusCode: 400,
          message: 'Invalid quote data',
          payload: null,
        },
      })

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Should not clear cart on error
      expect(mockCartStore.clearCart).not.toHaveBeenCalled()
      expect(result.current.submitted).toBe(false)
    })

    it('should handle rate limiting (429)', async () => {
      // Business Rule: Rate limiting protection
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      mockSendQuote.mockResolvedValue({
        data: {
          statusCode: 429,
          message: 'Too many requests',
          payload: null,
        },
      })

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Should not clear cart on rate limit error
      expect(mockCartStore.clearCart).not.toHaveBeenCalled()
      expect(result.current.submitted).toBe(false)
    })

    it('should handle timeout errors', async () => {
      // Edge: Request timeout
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      mockSendQuote.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 100)
          })
      )

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        try {
          await result.current.handleSubmit(formData)
        } catch (error) {
          // Expected to throw
        }
      })

      // Should not clear cart on timeout
      expect(mockCartStore.clearCart).not.toHaveBeenCalled()
    })

    it('should handle 500 server error', async () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      mockSendQuote.mockResolvedValue({
        data: {
          statusCode: 500,
          message: 'Internal server error',
          payload: null,
        },
      })

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      expect(mockCartStore.clearCart).not.toHaveBeenCalled()
      expect(result.current.submitted).toBe(false)
    })
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle submission with empty cart gracefully', async () => {
      // Business Rule: Empty cart submission still goes through (API handles validation)
      // The hook doesn't prevent submission - it delegates to API which may return error
      mockCartStore.cart = []

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .withEmptyItems()
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      // Hook will attempt submission, API mock returns success, so cart is cleared
      await act(async () => {
        try {
          await result.current.handleSubmit(formData)
        } catch (error) {
          // May throw validation error
        }
      })

      // Empty cart submission still triggers the API (with empty items array)
      // Since API mock returns success, cart clearCart is called
      expect(mockSendQuote).toHaveBeenCalled()
      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.items).toHaveLength(0)
    })

    it('should handle authenticated user with customerId = 0', async () => {
      // Edge: Admin accounts may not have customerId
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      mockAuthStore = createMockAuthStore(
        {
          customerId: 0, // No customer ID
          email: 'admin@example.com',
          name: { first: 'Admin', last: 'User' },
        },
        true
      )
      ;(useAuthStore as any).mockImplementation((selector: any) => {
        if (typeof selector === 'function') {
          return selector(mockAuthStore)
        }
        return mockAuthStore
      })

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(true)
        .withCustomerId(0)
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Should still work - uses user email and name
      expect(mockSendQuote).toHaveBeenCalled()
      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.emailAddress).toBe('admin@example.com')
    })

    it('should construct CreateQuoteRequest correctly', async () => {
      // Hook uses CreateQuoteRequest DTO (flat structure), not Quote class
      mockCartStore.cart = [
        new CartItemBuilder()
          .withProductId('prod-1')
          .withQuantity(3)
          .withPrice(99.99)
          .withName('Product 1')
          .build(),
      ]
      // Update useHydratedCart mock to reflect the new cart
      mockUseHydratedCart.mockReturnValue({
        cart: mockCartStore.cart,
        isHydrated: true,
        itemCount: mockCartStore.cart.reduce((sum, item) => sum + item.quantity, 0),
      })

      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 1)

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .withNotes('Test notes')
        .withValidUntil(futureDate)
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      // Assert CreateQuoteRequest structure (flat, not Quote class with nested objects)
      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.items).toHaveLength(1)
      expect(callArgs.items[0].quantity).toBe(3)
      expect(callArgs.description).toBe('Test notes')
      expect(callArgs.firstName).toBe('John')
      expect(callArgs.lastName).toBe('Doe')
      expect(callArgs.emailAddress).toBe('john@example.com')
    })

    it('should handle missing optional fields gracefully', async () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .withNotes('') // Empty notes
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      await act(async () => {
        await result.current.handleSubmit(formData)
      })

      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.description).toBe('')
      expect(mockSendQuote).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // State Management
  // ============================================================================

  describe('State Management', () => {
    it('should track loading state during submission', async () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(1).withPrice(99.99).build(),
      ]

      // Delay API response
      mockSendQuote.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  data: { statusCode: 200, message: 'Success', payload: null },
                }),
              100
            )
          })
      )

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      expect(result.current.isLoading).toBe(false)

      // Start submission
      act(() => {
        result.current.handleSubmit(formData)
      })

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should calculate totalItems correctly', () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').withQuantity(2).build(),
        new CartItemBuilder().withProductId('prod-2').withQuantity(3).build(),
      ]

      // Update mock to return correct cart using hoisted mock
      mockUseHydratedCart.mockReturnValue({
        cart: mockCartStore.cart,
        isHydrated: true,
        itemCount: 5, // 2 + 3
      })

      const { result } = renderHook(() => useCartPageLogic())

      expect(result.current.totalItems).toBe(5)
    })

    it('should calculate totalProducts correctly', () => {
      mockCartStore.cart = [
        new CartItemBuilder().withProductId('prod-1').build(),
        new CartItemBuilder().withProductId('prod-2').build(),
        new CartItemBuilder().withProductId('prod-3').build(),
      ]

      // Update mock to return correct cart using hoisted mock
      mockUseHydratedCart.mockReturnValue({
        cart: mockCartStore.cart,
        isHydrated: true,
        itemCount: 3,
      })

      const { result } = renderHook(() => useCartPageLogic())

      expect(result.current.totalProducts).toBe(3)
    })
  })
})
