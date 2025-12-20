/**
 * useOrderPermissions Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive permission testing for orders.
 * Tests all order-related permissions across all roles.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY & REVENUE
 * 
 * **What This Tests:**
 * - View permissions (Own, Assigned, All contexts)
 * - Update permissions (status transitions)
 * - Confirm payment (SalesRep+)
 * - Fulfillment actions (Fulfillment+)
 * - Cancel permissions (Manager+)
 * - Delete permissions (Admin only)
 * 
 * **Coverage Areas (from PRD prd_orders.md):**
 * - Customer: View own orders, request cancellation
 * - SalesRep: View/manage assigned orders, confirm payment
 * - Fulfillment: Update status, add tracking
 * - SalesManager: Cancel orders, full operational access
 * - Admin: Full access including delete
 * 
 * @see prd_orders.md - Full PRD specification
 * @module app/orders/[id]/_components/hooks/useOrderPermissions.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOrderPermissions } from '../useOrderPermissions'
import * as usePermissionsModule from '@_shared/hooks/usePermissions'
import { RoleLevels, Resources, Actions, Contexts, type RoleLevel } from '@_types/rbac'
import { OrderStatus } from '@_classes/Enums'
import type Order from '@_classes/Order'

// ============================================================================
// MOCK SETUP
// ============================================================================

vi.mock('@_shared/hooks/usePermissions', async () => {
  const actual = await vi.importActual('@_shared/hooks/usePermissions')
  return {
    ...actual,
    usePermissions: vi.fn(),
  }
})

// ============================================================================
// TEST DATA
// ============================================================================

interface MockUser {
  id: string | null
  email: string
  role: RoleLevel
  customerId?: number | null
}

// ============================================================================
// TEST HELPERS
// ============================================================================

function createMockOrder(overrides: Partial<Order & { customerId?: number; assignedSalesRepId?: string }> = {}): Order {
  return {
    id: 1,
    orderNumber: 'ORD-001',
    status: OrderStatus.Placed,
    total: 500.00,
    customerId: 100,
    assignedSalesRepId: undefined,
    products: [],
    createdAt: new Date(),
    isArchived: false,
    shipping: 0,
    discount: 0,
    notes: '',
    ...overrides,
  } as Order & { customerId?: number; assignedSalesRepId?: string }
}

function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: '1',
    email: 'test@medsource.com',
    role: RoleLevels.Customer,
    customerId: 100,
    ...overrides,
  }
}

function mockUsePermissions(user: MockUser | null, roleLevel?: RoleLevel) {
  const role = roleLevel ?? user?.role ?? RoleLevels.Customer
  
  const mockHasPermission = vi.fn((resource: string, action: string, context?: string) => {
    // Simulate real permission logic per PRD prd_orders.md
    // Per PRD hierarchy: Admin > SalesManager > SalesRep > Fulfillment > Customer
    
    // Admin: full access
    if (role >= RoleLevels.Admin) return true
    
    // SalesManager: team and all access, cannot delete
    if (role >= RoleLevels.SalesManager) {
      if (context === Contexts.All || context === Contexts.Team) return true
      if (action === Actions.Delete) return false // Only Admin can delete
      return true
    }
    
    // SalesRep: assigned access only (NOT all)
    // Check BEFORE Fulfillment since SalesRep (300) > Fulfillment (200) in hierarchy
    if (role >= RoleLevels.SalesRep) {
      if (context === Contexts.Assigned) return true
      if (context === Contexts.Own) return true
      if (context === Contexts.All) return false // SalesRep cannot view all orders per PRD
      if (action === Actions.Delete) return false
      return false
    }
    
    // Fulfillment: can view all orders, update order status (but NOT confirm payment per PRD)
    // This is a specific role check, not hierarchical
    if (role === RoleLevels.FulfillmentCoordinator) {
      if (action === Actions.Read && context === Contexts.All) return true
      if (action === Actions.Update && resource === Resources.Orders) return true
      if (action === Actions.Delete) return false
      return false
    }
    
    // Customer: own context only
    if (role >= RoleLevels.Customer) {
      if (context === Contexts.Own) return true
      return false
    }
    
    return false
  })
  
  const mockHasMinimumRole = vi.fn((min: RoleLevel) => role >= min)
  
  ;(usePermissionsModule.usePermissions as ReturnType<typeof vi.fn>).mockReturnValue({
    user: user ? { ...user, id: user.id ?? null } : null,
    roleLevel: role,
    isAuthenticated: !!user,
    isAdmin: role >= RoleLevels.Admin,
    isSalesManagerOrAbove: role >= RoleLevels.SalesManager,
    isSalesRepOrAbove: role >= RoleLevels.SalesRep,
    isFulfillmentCoordinatorOrAbove: role >= RoleLevels.FulfillmentCoordinator,
    isCustomer: role === RoleLevels.Customer,
    hasMinimumRole: mockHasMinimumRole,
    hasPermission: mockHasPermission,
  })
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useOrderPermissions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // OWNERSHIP CONTEXT TESTS
  // ==========================================================================

  describe('Ownership Context', () => {
    describe('Own Order (Customer)', () => {
      it('should recognize order as owned by user via customerId', () => {
        const mockUser = createMockUser({ id: '100', customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.context.isOwnOrder).toBe(true)
      })

      it('Customer can view own order', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canView).toBe(true)
      })

      it('Customer CANNOT confirm payment on own order', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100, status: OrderStatus.Placed })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canConfirmPayment).toBe(false)
      })

      it('Customer can request cancellation for own Placed order', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100, status: OrderStatus.Placed })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canRequestCancellation).toBe(true)
      })

      it('Customer can request cancellation for own Paid order', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100, status: OrderStatus.Paid })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canRequestCancellation).toBe(true)
      })

      it('Customer CANNOT request cancellation for Shipped order', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100, status: OrderStatus.Shipped })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canRequestCancellation).toBe(false)
      })

      it('Customer CANNOT cancel order directly', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canCancel).toBe(false)
      })

      it('Customer CANNOT add internal notes', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canAddInternalNotes).toBe(false)
      })

      it('Customer CANNOT delete order', () => {
        const mockUser = createMockUser({ customerId: 100 })
        const mockOrder = createMockOrder({ customerId: 100 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canDelete).toBe(false)
      })
    })

    describe('Unrelated Order', () => {
      it('Customer CANNOT view unrelated order', () => {
        const mockUser = createMockUser({ id: '999', customerId: 999 })
        const mockOrder = createMockOrder({ customerId: 100 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.context.isOwnOrder).toBe(false)
        expect(result.current.canView).toBe(false)
      })

      it('Customer CANNOT request cancellation for unrelated order', () => {
        const mockUser = createMockUser({ id: '999', customerId: 999 })
        const mockOrder = createMockOrder({ customerId: 100, status: OrderStatus.Placed })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canRequestCancellation).toBe(false)
      })
    })
  })

  // ==========================================================================
  // SALES REP PERMISSIONS
  // ==========================================================================

  describe('SalesRep Permissions', () => {
    describe('Assigned Orders', () => {
      it('should recognize order as assigned to SalesRep', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ assignedSalesRepId: '200' })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.context.isAssignedOrder).toBe(true)
      })

      it('SalesRep can view assigned order', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ assignedSalesRepId: '200' })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canView).toBe(true)
      })

      it('SalesRep can confirm payment for assigned Placed order', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ 
          assignedSalesRepId: '200', 
          status: OrderStatus.Placed 
        })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canConfirmPayment).toBe(true)
      })

      it('SalesRep CANNOT confirm payment for Paid order', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ 
          assignedSalesRepId: '200', 
          status: OrderStatus.Paid 
        })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canConfirmPayment).toBe(false)
      })

      it('SalesRep CANNOT update tracking (per PRD: cannot process fulfillment)', () => {
        // PRD prd_orders.md: SalesRep "Cannot: Process fulfillment (add tracking)"
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ 
          assignedSalesRepId: '200', 
          status: OrderStatus.Paid 
        })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canUpdateTracking).toBe(false)
      })

      it('SalesRep can add internal notes', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ assignedSalesRepId: '200' })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canAddInternalNotes).toBe(true)
      })

      it('SalesRep CANNOT cancel order', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ assignedSalesRepId: '200' })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canCancel).toBe(false)
      })

      it('SalesRep CANNOT mark as Processing', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ 
          assignedSalesRepId: '200', 
          status: OrderStatus.Paid 
        })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canMarkProcessing).toBe(false)
      })

      it('SalesRep CANNOT mark as Shipped', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ 
          assignedSalesRepId: '200', 
          status: OrderStatus.Processing 
        })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canMarkShipped).toBe(false)
      })
    })

    describe('Unassigned Orders', () => {
      it('SalesRep CANNOT view unassigned order', () => {
        // User is SalesRep (not Customer), so customerId should not match order
        const mockUser = createMockUser({ id: '200', customerId: null })
        // Order belongs to a different customer and is assigned to a different sales rep
        const mockOrder = createMockOrder({ customerId: 999, assignedSalesRepId: '300' })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.context.isAssignedOrder).toBe(false)
        expect(result.current.canView).toBe(false)
      })

      it('SalesRep CANNOT confirm payment for unassigned order', () => {
        const mockUser = createMockUser({ id: '200' })
        const mockOrder = createMockOrder({ 
          assignedSalesRepId: '300', 
          status: OrderStatus.Placed 
        })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useOrderPermissions(mockOrder))
        
        expect(result.current.canConfirmPayment).toBe(false)
      })
    })
  })

  // ==========================================================================
  // FULFILLMENT COORDINATOR PERMISSIONS
  // ==========================================================================

  describe('Fulfillment Coordinator Permissions', () => {
    it('Fulfillment can view all orders', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ assignedSalesRepId: '200' })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canView).toBe(true)
    })

    it('Fulfillment can update tracking', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Paid })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canUpdateTracking).toBe(true)
    })

    it('Fulfillment can mark Paid order as Processing', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Paid })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canMarkProcessing).toBe(true)
    })

    it('Fulfillment CANNOT mark Placed order as Processing', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Placed })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canMarkProcessing).toBe(false)
    })

    it('Fulfillment can mark Processing order as Shipped', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Processing })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canMarkShipped).toBe(true)
    })

    it('Fulfillment CANNOT mark Paid order as Shipped', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Paid })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canMarkShipped).toBe(false)
    })

    it('Fulfillment can mark Shipped order as Delivered', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Shipped })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canMarkDelivered).toBe(true)
    })

    it('Fulfillment CANNOT mark Processing order as Delivered', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Processing })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canMarkDelivered).toBe(false)
    })

    it('Fulfillment CANNOT confirm payment', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Placed })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      // Per PRD: Fulfillment cannot confirm payments
      expect(result.current.canConfirmPayment).toBe(false)
    })

    it('Fulfillment CANNOT cancel orders', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder({ status: OrderStatus.Paid })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(false)
    })

    it('Fulfillment CANNOT delete orders', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder()
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canDelete).toBe(false)
    })
  })

  // ==========================================================================
  // SALES MANAGER PERMISSIONS
  // ==========================================================================

  describe('SalesManager Permissions', () => {
    it('Manager can view all orders', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder({ customerId: 999, assignedSalesRepId: '888' })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canView).toBe(true)
    })

    it('Manager can confirm payment for any Placed order', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder({ status: OrderStatus.Placed })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canConfirmPayment).toBe(true)
    })

    it('Manager can cancel Placed order', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder({ status: OrderStatus.Placed })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(true)
    })

    it('Manager can cancel Paid order', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder({ status: OrderStatus.Paid })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(true)
    })

    it('Manager can cancel Processing order', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder({ status: OrderStatus.Processing })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(true)
    })

    it('Manager CANNOT cancel Shipped order', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder({ status: OrderStatus.Shipped })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(false)
    })

    it('Manager CANNOT cancel Delivered order', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder({ status: OrderStatus.Delivered })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(false)
    })

    it('Manager CANNOT delete orders', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder()
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canDelete).toBe(false)
    })

    it('Manager can add internal notes', () => {
      const mockUser = createMockUser({ id: '400' })
      const mockOrder = createMockOrder()
      mockUsePermissions(mockUser, RoleLevels.SalesManager)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canAddInternalNotes).toBe(true)
    })
  })

  // ==========================================================================
  // ADMIN PERMISSIONS
  // ==========================================================================

  describe('Admin Permissions', () => {
    it('Admin has all order permissions', () => {
      const mockUser = createMockUser({ id: '1' })
      const mockOrder = createMockOrder({ status: OrderStatus.Paid })
      mockUsePermissions(mockUser, RoleLevels.Admin)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canView).toBe(true)
      expect(result.current.canUpdate).toBe(true)
      expect(result.current.canCancel).toBe(true)
      expect(result.current.canAddInternalNotes).toBe(true)
    })

    it('Admin can delete orders', () => {
      const mockUser = createMockUser({ id: '1' })
      const mockOrder = createMockOrder()
      mockUsePermissions(mockUser, RoleLevels.Admin)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canDelete).toBe(true)
    })

    it('Admin can confirm payment for Placed order', () => {
      const mockUser = createMockUser({ id: '1' })
      const mockOrder = createMockOrder({ status: OrderStatus.Placed })
      mockUsePermissions(mockUser, RoleLevels.Admin)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canConfirmPayment).toBe(true)
    })

    it('Admin can cancel any non-shipped/delivered order', () => {
      const mockUser = createMockUser({ id: '1' })
      const mockOrder = createMockOrder({ status: OrderStatus.Processing })
      mockUsePermissions(mockUser, RoleLevels.Admin)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(true)
    })

    it('Admin CANNOT cancel Shipped order', () => {
      // Business rule: Even Admin cannot cancel shipped orders
      const mockUser = createMockUser({ id: '1' })
      const mockOrder = createMockOrder({ status: OrderStatus.Shipped })
      mockUsePermissions(mockUser, RoleLevels.Admin)

      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.canCancel).toBe(false)
    })
  })

  // ==========================================================================
  // STATUS-BASED PERMISSIONS
  // ==========================================================================

  describe('Status-Based Permissions', () => {
    const mockUser = createMockUser({ id: '1' })
    
    describe('Placed Status', () => {
      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.Admin)
      })

      const placedOrder = createMockOrder({ status: OrderStatus.Placed })

      it('can confirm payment', () => {
        const { result } = renderHook(() => useOrderPermissions(placedOrder))
        expect(result.current.canConfirmPayment).toBe(true)
      })

      it('CANNOT mark as Processing', () => {
        const { result } = renderHook(() => useOrderPermissions(placedOrder))
        expect(result.current.canMarkProcessing).toBe(false)
      })

      it('CANNOT mark as Shipped', () => {
        const { result } = renderHook(() => useOrderPermissions(placedOrder))
        expect(result.current.canMarkShipped).toBe(false)
      })

      it('can cancel', () => {
        const { result } = renderHook(() => useOrderPermissions(placedOrder))
        expect(result.current.canCancel).toBe(true)
      })
    })

    describe('Paid Status', () => {
      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.Admin)
      })

      const paidOrder = createMockOrder({ status: OrderStatus.Paid })

      it('CANNOT confirm payment', () => {
        const { result } = renderHook(() => useOrderPermissions(paidOrder))
        expect(result.current.canConfirmPayment).toBe(false)
      })

      it('can mark as Processing', () => {
        const { result } = renderHook(() => useOrderPermissions(paidOrder))
        expect(result.current.canMarkProcessing).toBe(true)
      })

      it('CANNOT mark as Shipped', () => {
        const { result } = renderHook(() => useOrderPermissions(paidOrder))
        expect(result.current.canMarkShipped).toBe(false)
      })

      it('can cancel', () => {
        const { result } = renderHook(() => useOrderPermissions(paidOrder))
        expect(result.current.canCancel).toBe(true)
      })
    })

    describe('Processing Status', () => {
      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.Admin)
      })

      const processingOrder = createMockOrder({ status: OrderStatus.Processing })

      it('CANNOT mark as Processing', () => {
        const { result } = renderHook(() => useOrderPermissions(processingOrder))
        expect(result.current.canMarkProcessing).toBe(false)
      })

      it('can mark as Shipped', () => {
        const { result } = renderHook(() => useOrderPermissions(processingOrder))
        expect(result.current.canMarkShipped).toBe(true)
      })

      it('CANNOT mark as Delivered', () => {
        const { result } = renderHook(() => useOrderPermissions(processingOrder))
        expect(result.current.canMarkDelivered).toBe(false)
      })

      it('can cancel', () => {
        const { result } = renderHook(() => useOrderPermissions(processingOrder))
        expect(result.current.canCancel).toBe(true)
      })
    })

    describe('Shipped Status', () => {
      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.Admin)
      })

      const shippedOrder = createMockOrder({ status: OrderStatus.Shipped })

      it('CANNOT mark as Shipped', () => {
        const { result } = renderHook(() => useOrderPermissions(shippedOrder))
        expect(result.current.canMarkShipped).toBe(false)
      })

      it('can mark as Delivered', () => {
        const { result } = renderHook(() => useOrderPermissions(shippedOrder))
        expect(result.current.canMarkDelivered).toBe(true)
      })

      it('CANNOT cancel', () => {
        const { result } = renderHook(() => useOrderPermissions(shippedOrder))
        expect(result.current.canCancel).toBe(false)
      })
    })

    describe('Delivered Status', () => {
      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.Admin)
      })

      const deliveredOrder = createMockOrder({ status: OrderStatus.Delivered })

      it('CANNOT mark as Delivered', () => {
        const { result } = renderHook(() => useOrderPermissions(deliveredOrder))
        expect(result.current.canMarkDelivered).toBe(false)
      })

      it('CANNOT cancel', () => {
        const { result } = renderHook(() => useOrderPermissions(deliveredOrder))
        expect(result.current.canCancel).toBe(false)
      })

      it('CANNOT update tracking', () => {
        const { result } = renderHook(() => useOrderPermissions(deliveredOrder))
        expect(result.current.canUpdateTracking).toBe(false)
      })
    })

    describe('Cancelled Status', () => {
      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.Admin)
      })

      const cancelledOrder = createMockOrder({ status: OrderStatus.Cancelled })

      it('CANNOT cancel again', () => {
        const { result } = renderHook(() => useOrderPermissions(cancelledOrder))
        expect(result.current.canCancel).toBe(false)
      })

      it('CANNOT update status', () => {
        const { result } = renderHook(() => useOrderPermissions(cancelledOrder))
        expect(result.current.canMarkProcessing).toBe(false)
        expect(result.current.canMarkShipped).toBe(false)
        expect(result.current.canMarkDelivered).toBe(false)
      })
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle null order gracefully', () => {
      const mockUser = createMockUser()
      mockUsePermissions(mockUser)
      
      const { result } = renderHook(() => useOrderPermissions(null))
      
      // All permissions should be false
      expect(result.current.canView).toBe(false)
      expect(result.current.canUpdate).toBe(false)
      expect(result.current.canConfirmPayment).toBe(false)
      expect(result.current.canCancel).toBe(false)
      expect(result.current.canDelete).toBe(false)
      expect(result.current.context.isOwnOrder).toBe(false)
      expect(result.current.context.isAssignedOrder).toBe(false)
    })

    it('should handle null user gracefully', () => {
      const mockOrder = createMockOrder()
      mockUsePermissions(null)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      // All permissions should be false
      expect(result.current.canView).toBe(false)
      expect(result.current.canUpdate).toBe(false)
      expect(result.current.canConfirmPayment).toBe(false)
      expect(result.current.canDelete).toBe(false)
    })

    it('should handle both null order and user', () => {
      mockUsePermissions(null)
      
      const { result } = renderHook(() => useOrderPermissions(null))
      
      expect(result.current.canView).toBe(false)
      expect(result.current.context.isOwnOrder).toBe(false)
      expect(result.current.context.isAssignedOrder).toBe(false)
    })

    it('should handle order without assignedSalesRepId', () => {
      const mockUser = createMockUser({ id: '200' })
      const mockOrder = createMockOrder({ assignedSalesRepId: undefined })
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.context.isAssignedOrder).toBe(false)
    })

    it('should handle order without customerId', () => {
      const mockUser = createMockUser({ customerId: 100 })
      const mockOrder = createMockOrder({ customerId: undefined })
      mockUsePermissions(mockUser, RoleLevels.Customer)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.context.isOwnOrder).toBe(false)
    })

    it('should handle user with null customerId', () => {
      const mockUser = createMockUser({ customerId: null })
      const mockOrder = createMockOrder({ customerId: 100 })
      mockUsePermissions(mockUser, RoleLevels.Customer)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.context.isOwnOrder).toBe(false)
    })
  })

  // ==========================================================================
  // COMBINED SCENARIOS (REAL-WORLD)
  // ==========================================================================

  describe('Combined Real-World Scenarios', () => {
    it('Customer owns order but is also staff (SalesRep): should have staff permissions', () => {
      // Edge case: User is both customer and staff
      const mockUser = createMockUser({ id: '200', customerId: 100 })
      const mockOrder = createMockOrder({ customerId: 100, assignedSalesRepId: '200' })
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      // Staff permissions should apply
      expect(result.current.canAddInternalNotes).toBe(true)
      expect(result.current.isStaff).toBe(true)
      // Should not be able to request cancellation (staff don't request, they cancel)
      expect(result.current.canRequestCancellation).toBe(false)
    })

    it('SalesRep views assigned order at different statuses', () => {
      const mockUser = createMockUser({ id: '200' })
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
      
      // Placed: Can confirm payment
      const placedOrder = createMockOrder({ assignedSalesRepId: '200', status: OrderStatus.Placed })
      const { result: r1 } = renderHook(() => useOrderPermissions(placedOrder))
      expect(r1.current.canConfirmPayment).toBe(true)
      
      // Paid: Cannot confirm payment, CANNOT update tracking (per PRD: SalesRep cannot process fulfillment)
      const paidOrder = createMockOrder({ assignedSalesRepId: '200', status: OrderStatus.Paid })
      const { result: r2 } = renderHook(() => useOrderPermissions(paidOrder))
      expect(r2.current.canConfirmPayment).toBe(false)
      expect(r2.current.canUpdateTracking).toBe(false) // PRD: SalesRep CANNOT add tracking
      
      // Delivered: No actions
      const deliveredOrder = createMockOrder({ assignedSalesRepId: '200', status: OrderStatus.Delivered })
      const { result: r3 } = renderHook(() => useOrderPermissions(deliveredOrder))
      expect(r3.current.canUpdateTracking).toBe(false)
    })

    it('Fulfillment processes order through lifecycle', () => {
      const mockUser = createMockUser({ id: '300' })
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)
      
      // Paid: Can mark as Processing
      const paidOrder = createMockOrder({ status: OrderStatus.Paid })
      const { result: r1 } = renderHook(() => useOrderPermissions(paidOrder))
      expect(r1.current.canMarkProcessing).toBe(true)
      expect(r1.current.canMarkShipped).toBe(false)
      
      // Processing: Can mark as Shipped
      const processingOrder = createMockOrder({ status: OrderStatus.Processing })
      const { result: r2 } = renderHook(() => useOrderPermissions(processingOrder))
      expect(r2.current.canMarkProcessing).toBe(false)
      expect(r2.current.canMarkShipped).toBe(true)
      
      // Shipped: Can mark as Delivered
      const shippedOrder = createMockOrder({ status: OrderStatus.Shipped })
      const { result: r3 } = renderHook(() => useOrderPermissions(shippedOrder))
      expect(r3.current.canMarkShipped).toBe(false)
      expect(r3.current.canMarkDelivered).toBe(true)
    })
  })

  // ==========================================================================
  // HELPER FLAGS
  // ==========================================================================

  describe('Helper Flags', () => {
    it('should set isStaff correctly for SalesRep', () => {
      const mockUser = createMockUser({ id: '200' })
      const mockOrder = createMockOrder()
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.isStaff).toBe(true)
    })

    it('should set isStaff correctly for Customer', () => {
      const mockUser = createMockUser({ id: '100' })
      const mockOrder = createMockOrder({ customerId: 100 })
      mockUsePermissions(mockUser, RoleLevels.Customer)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.isStaff).toBe(false)
    })

    it('should set isFulfillmentOrAbove correctly', () => {
      const mockUser = createMockUser({ id: '300' })
      const mockOrder = createMockOrder()
      mockUsePermissions(mockUser, RoleLevels.FulfillmentCoordinator)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.isFulfillmentOrAbove).toBe(true)
    })

    it('SalesRep IS FulfillmentOrAbove (hierarchy: SalesRep > Fulfillment)', () => {
      // Per PRD hierarchy: Admin (500) > SalesManager (400) > SalesRep (300) > Fulfillment (200) > Customer (100)
      // SalesRep (300) is above FulfillmentCoordinator (200) in the organizational hierarchy
      // So isFulfillmentOrAbove should be TRUE for SalesRep
      // Note: This doesn't mean SalesRep can DO fulfillment tasks - that's a separate check (hasFulfillmentPermissions)
      const mockUser = createMockUser({ id: '200' })
      const mockOrder = createMockOrder()
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
      
      const { result } = renderHook(() => useOrderPermissions(mockOrder))
      
      expect(result.current.isFulfillmentOrAbove).toBe(true)
    })
  })
})

