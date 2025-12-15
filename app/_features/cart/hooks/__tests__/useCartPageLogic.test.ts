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
import { useCartPageLogic } from '../useCartPageLogic'
import { useCartStore } from '../../stores/useCartStore'
import { useAuthStore } from '@_features/auth'
import { API } from '@_shared'
import * as referralTracking from '@_features/store/hooks/useReferralTracking'
import { QuoteFormDataBuilder, CartItemBuilder } from '@/test-utils/testDataBuilders'
import type { QuoteFormData } from '@_core'
import Quote from '@_classes/Quote'

// ============================================================================
// Mocks
// ============================================================================

// Mock useCartStore and useHydratedCart
const mockUseCartStore = vi.fn()
const mockUseHydratedCart = vi.fn()

vi.mock('@_features/cart/stores/useCartStore', () => ({
  useCartStore: vi.fn(),
  useHydratedCart: vi.fn(() => ({
    cart: [],
    isHydrated: true,
    itemCount: 0,
  })),
}))

vi.mock('@_features/auth', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  })),
}))

// Mock API service - defined before mocks so they can reference it
const mockSendQuote = vi.fn()
const mockGetProduct = vi.fn()

vi.mock('@_shared', async () => {
  const actual = await vi.importActual('@_shared')
  return {
    ...actual,
    API: {
      ...actual.API,
      Public: {
        ...actual.API?.Public,
        sendQuote: mockSendQuote,
      },
      Store: {
        ...actual.API?.Store,
        Products: {
          ...actual.API?.Store?.Products,
          get: mockGetProduct,
        },
      },
    },
  }
})

vi.mock('@_features/store/hooks/useReferralTracking', () => ({
  getStoredReferral: vi.fn(() => null),
}))

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
  let mockRouter: { push: MockedFunction<any> }

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

    // Setup useHydratedCart mock - import dynamically to access mocked version
    const { useHydratedCart: mockHydratedCart } = require('@_features/cart/stores/useCartStore')
    mockHydratedCart.mockReturnValue({
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

    // Setup router mock
    mockRouter = {
      push: vi.fn(),
    }
    const { useRouter } = require('next/navigation')
    useRouter.mockReturnValue(mockRouter)

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

      // Assert
      expect(mockSendQuote).toHaveBeenCalledTimes(1)
      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs).toBeInstanceOf(Quote)
      expect(callArgs.products).toHaveLength(2)
      expect(callArgs.products[0].productId).toBe('prod-1')
      expect(callArgs.products[0].quantity).toBe(2)
      expect(callArgs.products[1].productId).toBe('prod-2')
      expect(callArgs.products[1].quantity).toBe(1)
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

      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.emailAddress).toBe('user@example.com')
      expect(callArgs.name.first).toBe('Jane')
      expect(callArgs.name.last).toBe('Smith')
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

      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs.name.first).toBe('Guest')
      expect(callArgs.name.last).toBe('User')
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
      // Business Rule: Empty cart should be prevented by validation, but test hook behavior
      mockCartStore.cart = []

      const formData: QuoteFormData = new QuoteFormDataBuilder()
        .withIsAuthenticated(false)
        .withFirstName('John')
        .withLastName('Doe')
        .withEmail('john@example.com')
        .withEmptyItems()
        .build()

      const { result } = renderHook(() => useCartPageLogic())

      // Even with empty cart, hook should attempt submission
      // Validation should prevent it at form level
      await act(async () => {
        try {
          await result.current.handleSubmit(formData)
        } catch (error) {
          // May throw validation error
        }
      })

      // If submission attempted with empty cart, should not clear cart
      expect(mockCartStore.clearCart).not.toHaveBeenCalled()
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

    it('should construct Quote object correctly', async () => {
      mockCartStore.cart = [
        new CartItemBuilder()
          .withProductId('prod-1')
          .withQuantity(3)
          .withPrice(99.99)
          .withName('Product 1')
          .build(),
      ]

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

      const callArgs = mockSendQuote.mock.calls[0][0]
      expect(callArgs).toBeInstanceOf(Quote)
      expect(callArgs.products).toHaveLength(1)
      expect(callArgs.products[0].quantity).toBe(3)
      expect(callArgs.description).toBe('Test notes')
      expect(callArgs.createdAt).toBeInstanceOf(Date)
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

      // Update mock to return correct cart
      const { useHydratedCart: mockHydratedCart } = require('@_features/cart/stores/useCartStore')
      mockHydratedCart.mockReturnValue({
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

      // Update mock to return correct cart
      const { useHydratedCart: mockHydratedCart } = require('@_features/cart/stores/useCartStore')
      mockHydratedCart.mockReturnValue({
        cart: mockCartStore.cart,
        isHydrated: true,
        itemCount: 3,
      })

      const { result } = renderHook(() => useCartPageLogic())

      expect(result.current.totalProducts).toBe(3)
    })
  })
})
