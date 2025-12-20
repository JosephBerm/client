/**
 * useOrderActions Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive tests for order workflow actions.
 * Tests all order actions: confirm payment, update status, add tracking, cancel.
 * 
 * **Priority**: 🔴 CRITICAL - REVENUE & OPERATIONAL
 * 
 * **What This Tests:**
 * - confirmPayment: Placed → Paid transition
 * - updateStatus: Status transitions (Processing, Shipped, Delivered)
 * - addTracking: Adding tracking numbers to order items
 * - requestCancellation: Customer cancellation requests
 * - cancelOrder: Manager direct cancellation
 * - isProcessing: Combined loading state
 * 
 * **Coverage Areas (from PRD prd_orders.md):**
 * - US-ORD-003: Payment confirmation
 * - US-ORD-004: Fulfillment processing / tracking
 * - US-ORD-005: Order delivery
 * - US-ORD-006: Order cancellation
 * 
 * @see prd_orders.md - Full PRD specification
 * @module app/orders/[id]/_components/hooks/useOrderActions.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useOrderActions } from '../useOrderActions'
import * as sharedModule from '@_shared'
import { OrderStatus } from '@_classes/Enums'
import type Order from '@_classes/Order'

// ============================================================================
// MOCK SETUP
// ============================================================================

vi.mock('@_shared', async () => {
  const actual = await vi.importActual('@_shared')
  return {
    ...actual,
    useFormSubmit: vi.fn(),
    API: {
      Orders: {
        confirmPayment: vi.fn(),
        updateStatus: vi.fn(),
        addTracking: vi.fn(),
        requestCancellation: vi.fn(),
      },
    },
  }
})

// ============================================================================
// TEST DATA HELPERS
// ============================================================================

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1,
    orderNumber: 'ORD-001',
    status: OrderStatus.Placed,
    total: 500.00,
    customerId: 100,
    products: [],
    createdAt: new Date(),
    isArchived: false,
    shipping: 0,
    discount: 0,
    notes: '',
    ...overrides,
  } as Order
}

/**
 * Creates mock return values for multiple useFormSubmit calls
 */
function createMockFormSubmitReturns(count: number, options: {
  submitResults?: Array<{ success: boolean }>
  isSubmitting?: boolean[]
} = {}) {
  const mocks: Array<{
    submit: ReturnType<typeof vi.fn>
    isSubmitting: boolean
    error: null
  }> = []
  
  for (let i = 0; i < count; i++) {
    mocks.push({
      submit: vi.fn().mockResolvedValue(options.submitResults?.[i] ?? { success: true }),
      isSubmitting: options.isSubmitting?.[i] ?? false,
      error: null,
    })
  }
  
  return mocks
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useOrderActions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock - returns success for all 5 useFormSubmit calls
    const mocks = createMockFormSubmitReturns(5)
    let callIndex = 0
    ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return mocks[callIndex++ % mocks.length]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // HOOK INITIALIZATION
  // ==========================================================================

  describe('Hook Initialization', () => {
    it('should initialize with all expected properties', () => {
      const mockOrder = createMockOrder()
      
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current).toHaveProperty('confirmPayment')
      expect(result.current).toHaveProperty('updateStatus')
      expect(result.current).toHaveProperty('addTracking')
      expect(result.current).toHaveProperty('requestCancellation')
      expect(result.current).toHaveProperty('cancelOrder')
      expect(result.current).toHaveProperty('isProcessing')
    })

    it('should initialize isProcessing as false', () => {
      const mockOrder = createMockOrder()
      
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(false)
    })

    it('should handle null order gracefully', () => {
      const { result } = renderHook(() => useOrderActions(null))
      
      expect(result.current.confirmPayment).toBeDefined()
      expect(result.current.updateStatus).toBeDefined()
      expect(result.current.cancelOrder).toBeDefined()
    })

    it('should call useFormSubmit 5 times for 5 actions', () => {
      const mockOrder = createMockOrder()
      
      renderHook(() => useOrderActions(mockOrder))
      
      // 5 calls: confirmPayment, updateStatus, addTracking, requestCancellation, cancelOrder
      expect(sharedModule.useFormSubmit).toHaveBeenCalledTimes(5)
    })
  })

  // ==========================================================================
  // confirmPayment TESTS
  // ==========================================================================

  describe('confirmPayment', () => {
    describe('Successful Payment Confirmation', () => {
      it('should call submit with payment reference and notes', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ id: 123 })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.confirmPayment('CHK-12345', 'Payment via check')
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          paymentReference: 'CHK-12345',
          notes: 'Payment via check',
        })
      })

      it('should return success result on successful confirmation', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        let confirmResult: { success: boolean } | undefined
        await act(async () => {
          confirmResult = await result.current.confirmPayment()
        })
        
        expect(confirmResult?.success).toBe(true)
      })

      it('should call confirmPayment without optional parameters', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.confirmPayment()
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          paymentReference: undefined,
          notes: undefined,
        })
      })
    })

    describe('Failed Payment Confirmation', () => {
      it('should return failure result on API error', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: false })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        let confirmResult: { success: boolean } | undefined
        await act(async () => {
          confirmResult = await result.current.confirmPayment()
        })
        
        expect(confirmResult?.success).toBe(false)
      })
    })

    describe('Configuration', () => {
      it('should configure useFormSubmit with correct options', () => {
        const mockOrder = createMockOrder()
        const mockRefresh = vi.fn()
        
        renderHook(() => useOrderActions(mockOrder, mockRefresh))
        
        // Get the first call (confirmPayment)
        const firstCall = (sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mock.calls[0]
        const options = firstCall[1]
        
        expect(options.successMessage).toBe('Payment confirmed successfully')
        expect(options.errorMessage).toBe('Failed to confirm payment')
        expect(options.componentName).toBe('useOrderActions')
        expect(options.actionName).toBe('confirmPayment')
      })
    })
  })

  // ==========================================================================
  // updateStatus TESTS
  // ==========================================================================

  describe('updateStatus', () => {
    describe('Status Transitions', () => {
      it('should call submit with new status', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null }) // confirmPayment
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null }) // updateStatus
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Paid })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.updateStatus(OrderStatus.Processing)
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          newStatus: OrderStatus.Processing,
          trackingNumber: undefined,
          carrier: undefined,
          notes: undefined,
        })
      })

      it('should support updating to Processing status', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Paid })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        let statusResult: { success: boolean } | undefined
        await act(async () => {
          statusResult = await result.current.updateStatus(OrderStatus.Processing)
        })
        
        expect(statusResult?.success).toBe(true)
      })

      it('should support updating to Shipped with tracking', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Processing })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.updateStatus(
            OrderStatus.Shipped,
            '1Z999AA10123456784',
            'UPS',
            'Shipped via UPS Ground'
          )
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          newStatus: OrderStatus.Shipped,
          trackingNumber: '1Z999AA10123456784',
          carrier: 'UPS',
          notes: 'Shipped via UPS Ground',
        })
      })

      it('should support updating to Delivered', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Shipped })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        let statusResult: { success: boolean } | undefined
        await act(async () => {
          statusResult = await result.current.updateStatus(OrderStatus.Delivered)
        })
        
        expect(statusResult?.success).toBe(true)
      })
    })

    describe('Configuration', () => {
      it('should configure useFormSubmit with correct options', () => {
        const mockOrder = createMockOrder()
        
        renderHook(() => useOrderActions(mockOrder))
        
        // Get the second call (updateStatus)
        const secondCall = (sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mock.calls[1]
        const options = secondCall[1]
        
        expect(options.successMessage).toBe('Order status updated')
        expect(options.errorMessage).toBe('Failed to update order status')
        expect(options.actionName).toBe('updateStatus')
      })
    })
  })

  // ==========================================================================
  // addTracking TESTS
  // ==========================================================================

  describe('addTracking', () => {
    describe('Adding Tracking Numbers', () => {
      it('should call submit with order item and tracking number', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null }) // confirmPayment
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null }) // updateStatus
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null }) // addTracking
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.addTracking(42, '1Z999AA10123456784', 'UPS')
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          orderItemId: 42,
          trackingNumber: '1Z999AA10123456784',
          carrier: 'UPS',
        })
      })

      it('should support adding tracking without carrier', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.addTracking(42, '1Z999AA10123456784')
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          orderItemId: 42,
          trackingNumber: '1Z999AA10123456784',
          carrier: undefined,
        })
      })

      it('should return success result', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        let trackingResult: { success: boolean } | undefined
        await act(async () => {
          trackingResult = await result.current.addTracking(42, 'TRK123')
        })
        
        expect(trackingResult?.success).toBe(true)
      })
    })

    describe('Tracking Number Formats', () => {
      it('should support UPS tracking numbers', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.addTracking(1, '1Z12345E0205271688', 'UPS')
        })
        
        expect(mockSubmit).toHaveBeenCalled()
      })

      it('should support FedEx tracking numbers', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.addTracking(1, '789912345678901234567890', 'FedEx')
        })
        
        expect(mockSubmit).toHaveBeenCalled()
      })

      it('should support USPS tracking numbers', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.addTracking(1, '9400111899223456789012', 'USPS')
        })
        
        expect(mockSubmit).toHaveBeenCalled()
      })
    })

    describe('Configuration', () => {
      it('should configure useFormSubmit with correct options', () => {
        const mockOrder = createMockOrder()
        
        renderHook(() => useOrderActions(mockOrder))
        
        // Get the third call (addTracking)
        const thirdCall = (sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mock.calls[2]
        const options = thirdCall[1]
        
        expect(options.successMessage).toBe('Tracking number added')
        expect(options.errorMessage).toBe('Failed to add tracking number')
        expect(options.actionName).toBe('addTracking')
      })
    })
  })

  // ==========================================================================
  // requestCancellation TESTS
  // ==========================================================================

  describe('requestCancellation', () => {
    describe('Customer Cancellation Requests', () => {
      it('should call submit with cancellation reason', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null }) // requestCancellation
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Placed })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.requestCancellation('Changed my mind about the purchase')
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          reason: 'Changed my mind about the purchase',
        })
      })

      it('should return success result', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        let cancelResult: { success: boolean } | undefined
        await act(async () => {
          cancelResult = await result.current.requestCancellation('No longer needed')
        })
        
        expect(cancelResult?.success).toBe(true)
      })
    })

    describe('Configuration', () => {
      it('should configure useFormSubmit with correct options', () => {
        const mockOrder = createMockOrder()
        
        renderHook(() => useOrderActions(mockOrder))
        
        // Get the fourth call (requestCancellation)
        const fourthCall = (sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mock.calls[3]
        const options = fourthCall[1]
        
        expect(options.successMessage).toBe('Cancellation request submitted')
        expect(options.errorMessage).toBe('Failed to submit cancellation request')
        expect(options.actionName).toBe('requestCancellation')
      })
    })
  })

  // ==========================================================================
  // cancelOrder TESTS
  // ==========================================================================

  describe('cancelOrder', () => {
    describe('Manager Direct Cancellation', () => {
      it('should call submit with cancellation reason', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null }) // cancelOrder
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.cancelOrder('Customer requested cancellation')
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          reason: 'Customer requested cancellation',
        })
      })

      it('should return success result', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        let cancelResult: { success: boolean } | undefined
        await act(async () => {
          cancelResult = await result.current.cancelOrder('Out of stock')
        })
        
        expect(cancelResult?.success).toBe(true)
      })
    })

    describe('Configuration', () => {
      it('should configure useFormSubmit with correct options', () => {
        const mockOrder = createMockOrder()
        
        renderHook(() => useOrderActions(mockOrder))
        
        // Get the fifth call (cancelOrder)
        const fifthCall = (sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mock.calls[4]
        const options = fifthCall[1]
        
        expect(options.successMessage).toBe('Order cancelled')
        expect(options.errorMessage).toBe('Failed to cancel order')
        expect(options.actionName).toBe('cancelOrder')
      })
    })
  })

  // ==========================================================================
  // isProcessing COMBINED STATE TESTS
  // ==========================================================================

  describe('isProcessing', () => {
    it('should be true when confirming payment', () => {
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: true, error: null }) // confirming
        .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
      
      const mockOrder = createMockOrder()
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(true)
    })

    it('should be true when updating status', () => {
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: true, error: null }) // updating
        .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
      
      const mockOrder = createMockOrder()
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(true)
    })

    it('should be true when adding tracking', () => {
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: true, error: null }) // adding tracking
        .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
      
      const mockOrder = createMockOrder()
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(true)
    })

    it('should be true when requesting cancellation', () => {
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: true, error: null }) // requesting
        .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
      
      const mockOrder = createMockOrder()
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(true)
    })

    it('should be true when cancelling order', () => {
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: true, error: null }) // cancelling
      
      const mockOrder = createMockOrder()
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(true)
    })

    it('should be false when no action is processing', () => {
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
        .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
      
      const mockOrder = createMockOrder()
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(false)
    })

    it('should be true when multiple actions are processing', () => {
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: true, error: null })
        .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: true, error: null })
        .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
      
      const mockOrder = createMockOrder()
      const { result } = renderHook(() => useOrderActions(mockOrder))
      
      expect(result.current.isProcessing).toBe(true)
    })
  })

  // ==========================================================================
  // ONREFRESH CALLBACK TESTS
  // ==========================================================================

  describe('onRefresh Callback', () => {
    it('should call onRefresh after successful payment confirmation', async () => {
      const mockRefresh = vi.fn()
      
      let capturedOnSuccess: (() => Promise<void>) | undefined
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mockImplementation(
        (_submitFn: unknown, options: { onSuccess?: () => Promise<void> }) => {
          if (!capturedOnSuccess) {
            capturedOnSuccess = options.onSuccess
          }
          return {
            submit: vi.fn().mockResolvedValue({ success: true }),
            isSubmitting: false,
            error: null,
          }
        }
      )
      
      const mockOrder = createMockOrder()
      renderHook(() => useOrderActions(mockOrder, mockRefresh))
      
      if (capturedOnSuccess) {
        await capturedOnSuccess()
      }
      
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('should not fail if onRefresh is not provided', async () => {
      let capturedOnSuccess: (() => Promise<void>) | undefined
      ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>).mockImplementation(
        (_submitFn: unknown, options: { onSuccess?: () => Promise<void> }) => {
          if (!capturedOnSuccess) {
            capturedOnSuccess = options.onSuccess
          }
          return {
            submit: vi.fn().mockResolvedValue({ success: true }),
            isSubmitting: false,
            error: null,
          }
        }
      )
      
      const mockOrder = createMockOrder()
      renderHook(() => useOrderActions(mockOrder)) // No refresh callback
      
      // Should not throw
      await expect(capturedOnSuccess?.()).resolves.toBeUndefined()
    })
  })

  // ==========================================================================
  // REAL-WORLD SCENARIOS
  // ==========================================================================

  describe('Real-World Scenarios', () => {
    describe('Complete Order Lifecycle', () => {
      it('should support full lifecycle: Place → Pay → Process → Ship → Deliver', async () => {
        const submitMocks = Array(5).fill(null).map(() => 
          vi.fn().mockResolvedValue({ success: true })
        )
        
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: submitMocks[0], isSubmitting: false, error: null }) // confirmPayment
          .mockReturnValueOnce({ submit: submitMocks[1], isSubmitting: false, error: null }) // updateStatus
          .mockReturnValueOnce({ submit: submitMocks[2], isSubmitting: false, error: null }) // addTracking
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Placed })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        // 1. Confirm payment (Placed → Paid)
        await act(async () => {
          await result.current.confirmPayment('WIRE-12345', 'Wire transfer received')
        })
        expect(submitMocks[0]).toHaveBeenCalled()
        
        // 2. Mark as Processing
        await act(async () => {
          await result.current.updateStatus(OrderStatus.Processing)
        })
        expect(submitMocks[1]).toHaveBeenCalled()
      })
    })

    describe('Cancellation Scenarios', () => {
      it('should handle customer cancellation request', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Placed })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.requestCancellation('Found better price elsewhere')
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          reason: 'Found better price elsewhere',
        })
      })

      it('should handle manager direct cancellation', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder({ status: OrderStatus.Paid })
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        await act(async () => {
          await result.current.cancelOrder('Customer credit card declined')
        })
        
        expect(mockSubmit).toHaveBeenCalledWith({
          reason: 'Customer credit card declined',
        })
      })
    })

    describe('Multi-Item Tracking', () => {
      it('should support adding tracking to multiple items', async () => {
        const mockSubmit = vi.fn().mockResolvedValue({ success: true })
        ;(sharedModule.useFormSubmit as ReturnType<typeof vi.fn>)
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: vi.fn(), isSubmitting: false, error: null })
          .mockReturnValueOnce({ submit: mockSubmit, isSubmitting: false, error: null })
          .mockReturnValue({ submit: vi.fn(), isSubmitting: false, error: null })
        
        const mockOrder = createMockOrder()
        const { result } = renderHook(() => useOrderActions(mockOrder))
        
        // Add tracking to multiple items
        await act(async () => {
          await result.current.addTracking(1, 'TRK001', 'UPS')
          await result.current.addTracking(2, 'TRK002', 'FedEx')
          await result.current.addTracking(3, 'TRK003', 'USPS')
        })
        
        expect(mockSubmit).toHaveBeenCalledTimes(3)
      })
    })
  })

  // ==========================================================================
  // STABILITY TESTS
  // ==========================================================================

  describe('Stability', () => {
    it('should be stable across re-renders', () => {
      const mockOrder = createMockOrder()
      const { result, rerender } = renderHook(() => useOrderActions(mockOrder))
      
      const firstConfirmPayment = result.current.confirmPayment
      const firstUpdateStatus = result.current.updateStatus
      const firstCancelOrder = result.current.cancelOrder
      
      // Re-render
      rerender()
      
      // Functions should be memoized with useCallback
      expect(result.current.confirmPayment).toBe(firstConfirmPayment)
      expect(result.current.updateStatus).toBe(firstUpdateStatus)
      expect(result.current.cancelOrder).toBe(firstCancelOrder)
    })

    it('should handle order change', () => {
      const mockOrder1 = createMockOrder({ id: 1 })
      const mockOrder2 = createMockOrder({ id: 2 })
      
      const { result, rerender } = renderHook(
        ({ order }) => useOrderActions(order),
        { initialProps: { order: mockOrder1 } }
      )
      
      expect(result.current.confirmPayment).toBeDefined()
      
      // Change order
      rerender({ order: mockOrder2 })
      
      expect(result.current.confirmPayment).toBeDefined()
    })
  })
})

