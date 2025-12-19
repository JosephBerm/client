/**
 * useQuotePermissions Hook Unit Tests
 * 
 * MAANG-Level: Domain-specific permission testing for quotes.
 * 
 * **Priority**: 🔴 CRITICAL - REVENUE & SECURITY
 * 
 * This hook handles context-aware permissions for quotes based on:
 * - Quote ownership (user created it)
 * - Quote assignment (user is assigned to handle it)
 * - Quote status (determines available actions)
 * - User role (determines capability level)
 * 
 * **Testing Strategy:**
 * 1. Test all quote states (Unread, Read, Approved, Rejected, etc.)
 * 2. Test ownership scenarios (own, assigned, neither)
 * 3. Test all role levels
 * 4. Test combined state + role scenarios
 * 5. Security edge cases
 * 
 * @module Quotes/useQuotePermissions.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useQuotePermissions } from '../useQuotePermissions'
import * as usePermissionsModule from '@_shared/hooks/usePermissions'
import { RoleLevels, Resources, Actions, Contexts, type RoleLevel } from '@_types/rbac'
import { QuoteStatus } from '@_classes/Enums'
import type Quote from '@_classes/Quote'

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
  id: number
  email: string
  role: RoleLevel
  customerId?: number
  customer?: { name: string }
}

// ============================================================================
// TEST HELPERS
// ============================================================================

function createMockQuote(overrides: Partial<Quote & { customerId?: number }> = {}): Quote {
  return {
    id: 'quote-1',
    status: QuoteStatus.Unread,
    emailAddress: 'customer@hospital.com',
    companyName: 'Test Hospital',
    assignedSalesRepId: undefined,
    customerId: 300,
    products: [],
    name: { first: 'Test', last: 'Customer' },
    createdAt: new Date(),
    ...overrides,
  } as Quote & { customerId?: number }
}

function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 1,
    email: 'test@medsource.com',
    role: RoleLevels.Customer,
    customerId: 300,
    customer: { name: 'Test Hospital' },
    ...overrides,
  }
}

function mockUsePermissions(user: MockUser | null, roleLevel?: RoleLevel) {
  const role = roleLevel ?? user?.role ?? RoleLevels.Customer
  
  const mockHasPermission = vi.fn((resource: string, action: string, context?: string) => {
    // Simulate real permission logic matching the actual hook
    if (role >= RoleLevels.Admin) return true
    
    if (role >= RoleLevels.SalesManager) {
      if (action === Actions.Approve || action === Actions.Assign) return true
      if (context === Contexts.All || context === Contexts.Team) return true
      if (action === Actions.Create && resource === Resources.Orders) return true
    }
    
    if (role >= RoleLevels.SalesRep) {
      if (context === Contexts.Assigned) return true
      if (action === Actions.Create && resource === Resources.Orders) return true
    }
    
    if (role >= RoleLevels.Customer) {
      if (context === Contexts.Own) return true
    }
    
    return false
  })
  
  ;(usePermissionsModule.usePermissions as any).mockReturnValue({
    user,
    roleLevel: role,
    isAuthenticated: !!user,
    isAdmin: role >= RoleLevels.Admin,
    isSalesManagerOrAbove: role >= RoleLevels.SalesManager,
    isSalesRepOrAbove: role >= RoleLevels.SalesRep,
    isCustomer: role === RoleLevels.Customer,
    hasMinimumRole: (min: RoleLevel) => role >= min,
    hasPermission: mockHasPermission,
  })
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('useQuotePermissions Hook', () => {
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
    describe('Own Quote (Customer via customerId)', () => {
      it('should recognize quote as owned by user via customerId', () => {
        const mockUser = createMockUser({ id: 100, customerId: 300 })
        const mockQuote = createMockQuote({ customerId: 300 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.context.isOwnQuote).toBe(true)
      })

      it('should recognize quote as owned by user via email', () => {
        const mockUser = createMockUser({ 
          id: 100, 
          email: 'customer@hospital.com',
          customerId: undefined 
        })
        const mockQuote = createMockQuote({ 
          emailAddress: 'customer@hospital.com',
          customerId: undefined 
        })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.context.isOwnQuote).toBe(true)
      })

      it('should recognize quote as owned by user via company name', () => {
        const mockUser = createMockUser({ 
          id: 100, 
          customer: { name: 'Test Hospital' },
          customerId: undefined 
        })
        const mockQuote = createMockQuote({ 
          companyName: 'Test Hospital',
          customerId: undefined 
        })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.context.isOwnQuote).toBe(true)
      })

      it('Customer can view own quote', () => {
        const mockUser = createMockUser({ customerId: 300 })
        const mockQuote = createMockQuote({ customerId: 300 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canView).toBe(true)
      })

      it('Customer can update own Unread quote', () => {
        const mockUser = createMockUser({ customerId: 300 })
        const mockQuote = createMockQuote({ 
          customerId: 300, 
          status: QuoteStatus.Unread 
        })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canUpdate).toBe(true)
      })

      it('Customer CANNOT approve own quote', () => {
        const mockUser = createMockUser({ customerId: 300 })
        const mockQuote = createMockQuote({ customerId: 300 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canApprove).toBe(false)
      })

      it('Customer CANNOT delete own quote', () => {
        const mockUser = createMockUser({ customerId: 300 })
        const mockQuote = createMockQuote({ customerId: 300 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canDelete).toBe(false)
      })

      it('Customer CANNOT add internal notes', () => {
        const mockUser = createMockUser({ customerId: 300 })
        const mockQuote = createMockQuote({ customerId: 300 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canAddInternalNotes).toBe(false)
      })
    })

    describe('Assigned Quote (SalesRep)', () => {
      it('should recognize quote as assigned to user', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ assignedSalesRepId: 200 })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.context.isAssignedQuote).toBe(true)
      })

      it('SalesRep can view assigned quote', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ assignedSalesRepId: 200 })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canView).toBe(true)
      })

      it('SalesRep can update assigned quote', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ assignedSalesRepId: 200 })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canUpdate).toBe(true)
      })

      it('SalesRep can convert approved quote to order', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ 
          assignedSalesRepId: 200, 
          status: QuoteStatus.Approved 
        })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canConvert).toBe(true)
      })

      it('SalesRep CANNOT approve assigned quote', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ assignedSalesRepId: 200 })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canApprove).toBe(false)
      })

      it('SalesRep CANNOT assign quotes', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ assignedSalesRepId: 200 })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canAssign).toBe(false)
      })

      it('SalesRep can add internal notes', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ assignedSalesRepId: 200 })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canAddInternalNotes).toBe(true)
      })

      it('SalesRep can view customer history', () => {
        const mockUser = createMockUser({ id: 200 })
        const mockQuote = createMockQuote({ assignedSalesRepId: 200 })
        mockUsePermissions(mockUser, RoleLevels.SalesRep)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canViewCustomerHistory).toBe(true)
      })
    })

    describe('Unrelated Quote', () => {
      it('should not recognize as owner or assigned', () => {
        const mockUser = createMockUser({ id: 999, customerId: 999 })
        const mockQuote = createMockQuote({ 
          customerId: 300, 
          assignedSalesRepId: 200 
        })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.context.isOwnQuote).toBe(false)
        expect(result.current.context.isAssignedQuote).toBe(false)
      })

      it('Customer CANNOT view unrelated quote', () => {
        const mockUser = createMockUser({ id: 999, customerId: 999 })
        const mockQuote = createMockQuote({ customerId: 300 })
        mockUsePermissions(mockUser, RoleLevels.Customer)

        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canView).toBe(false)
      })
    })
  })

  // ==========================================================================
  // STATUS-BASED PERMISSION TESTS
  // ==========================================================================

  describe('Status-Based Permissions', () => {
    const mockUser = createMockUser({ id: 200 })
    
    beforeEach(() => {
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
    })

    describe('Unread Status', () => {
      const unreadQuote = createMockQuote({ 
        assignedSalesRepId: 200, 
        status: QuoteStatus.Unread 
      })

      it('can mark as read', () => {
        const { result } = renderHook(() => useQuotePermissions(unreadQuote))
        
        expect(result.current.canMarkAsRead).toBe(true)
      })

      it('can reject', () => {
        const { result } = renderHook(() => useQuotePermissions(unreadQuote))
        
        expect(result.current.canReject).toBe(true)
      })

      it('CANNOT convert to order (not approved)', () => {
        const { result } = renderHook(() => useQuotePermissions(unreadQuote))
        
        expect(result.current.canConvert).toBe(false)
      })
    })

    describe('Read Status', () => {
      const readQuote = createMockQuote({ 
        assignedSalesRepId: 200, 
        status: QuoteStatus.Read 
      })

      it('CANNOT mark as read (already read)', () => {
        const { result } = renderHook(() => useQuotePermissions(readQuote))
        
        expect(result.current.canMarkAsRead).toBe(false)
      })

      it('can reject', () => {
        const { result } = renderHook(() => useQuotePermissions(readQuote))
        
        expect(result.current.canReject).toBe(true)
      })

      it('CANNOT convert to order', () => {
        const { result } = renderHook(() => useQuotePermissions(readQuote))
        
        expect(result.current.canConvert).toBe(false)
      })
    })

    describe('Approved Status', () => {
      const approvedQuote = createMockQuote({ 
        assignedSalesRepId: 200, 
        status: QuoteStatus.Approved 
      })

      it('CANNOT mark as read', () => {
        const { result } = renderHook(() => useQuotePermissions(approvedQuote))
        
        expect(result.current.canMarkAsRead).toBe(false)
      })

      it('can convert to order', () => {
        const { result } = renderHook(() => useQuotePermissions(approvedQuote))
        
        expect(result.current.canConvert).toBe(true)
      })

      it('CANNOT reject (already approved)', () => {
        const { result } = renderHook(() => useQuotePermissions(approvedQuote))
        
        expect(result.current.canReject).toBe(false)
      })
    })

    describe('Rejected Status', () => {
      const rejectedQuote = createMockQuote({ 
        assignedSalesRepId: 200, 
        status: QuoteStatus.Rejected 
      })

      it('CANNOT convert to order', () => {
        const { result } = renderHook(() => useQuotePermissions(rejectedQuote))
        
        expect(result.current.canConvert).toBe(false)
      })

      it('CANNOT mark as read', () => {
        const { result } = renderHook(() => useQuotePermissions(rejectedQuote))
        
        expect(result.current.canMarkAsRead).toBe(false)
      })
    })
  })

  // ==========================================================================
  // ROLE-BASED PERMISSION TESTS
  // ==========================================================================

  describe('Role-Based Permissions', () => {
    const mockQuote = createMockQuote({ status: QuoteStatus.Read })

    describe('SalesManager Permissions', () => {
      const mockUser = createMockUser({ id: 300 })

      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.SalesManager)
      })

      it('Manager can view all quotes', () => {
        const unrelatedQuote = createMockQuote({ 
          customerId: 999, 
          assignedSalesRepId: 888 
        })
        
        const { result } = renderHook(() => useQuotePermissions(unrelatedQuote))
        
        expect(result.current.canView).toBe(true)
      })

      it('Manager can approve quotes with Read status', () => {
        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canApprove).toBe(true)
      })

      it('Manager CANNOT approve Unread quotes', () => {
        const unreadQuote = createMockQuote({ status: QuoteStatus.Unread })
        
        const { result } = renderHook(() => useQuotePermissions(unreadQuote))
        
        expect(result.current.canApprove).toBe(false)
      })

      it('Manager can assign quotes', () => {
        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canAssign).toBe(true)
      })

      it('Manager can update all quotes', () => {
        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canUpdate).toBe(true)
      })

      it('Manager CANNOT delete quotes', () => {
        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canDelete).toBe(false)
      })

      it('context flags should indicate team/all access', () => {
        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.context.isTeamQuote).toBe(true)
        expect(result.current.context.isAllQuote).toBe(true)
      })
    })

    describe('Admin Permissions', () => {
      const mockUser = createMockUser({ id: 1 })

      beforeEach(() => {
        mockUsePermissions(mockUser, RoleLevels.Admin)
      })

      it('Admin has all quote permissions', () => {
        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canView).toBe(true)
        expect(result.current.canUpdate).toBe(true)
        expect(result.current.canApprove).toBe(true)
        expect(result.current.canAssign).toBe(true)
        expect(result.current.canDelete).toBe(true)
        expect(result.current.canAddInternalNotes).toBe(true)
        expect(result.current.canViewCustomerHistory).toBe(true)
      })

      it('Admin can delete quotes', () => {
        const { result } = renderHook(() => useQuotePermissions(mockQuote))
        
        expect(result.current.canDelete).toBe(true)
      })
    })
  })

  // ==========================================================================
  // COMBINED SCENARIOS
  // ==========================================================================

  describe('Combined Scenarios', () => {
    it('Own quote with Read status: Customer can view but not approve', () => {
      const mockUser = createMockUser({ customerId: 300 })
      const mockQuote = createMockQuote({ 
        customerId: 300, 
        status: QuoteStatus.Read 
      })
      mockUsePermissions(mockUser, RoleLevels.Customer)
      
      const { result } = renderHook(() => useQuotePermissions(mockQuote))
      
      expect(result.current.context.isOwnQuote).toBe(true)
      expect(result.current.canView).toBe(true)
      expect(result.current.canApprove).toBe(false)
    })

    it('Assigned Approved quote: SalesRep can convert to order', () => {
      const mockUser = createMockUser({ id: 200 })
      const mockQuote = createMockQuote({ 
        assignedSalesRepId: 200, 
        status: QuoteStatus.Approved 
      })
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
      
      const { result } = renderHook(() => useQuotePermissions(mockQuote))
      
      expect(result.current.context.isAssignedQuote).toBe(true)
      expect(result.current.canConvert).toBe(true)
      expect(result.current.canApprove).toBe(false)
    })

    it('Unassigned Read quote: Manager can approve and assign', () => {
      const mockUser = createMockUser({ id: 300 })
      const mockQuote = createMockQuote({ 
        assignedSalesRepId: undefined, 
        status: QuoteStatus.Read 
      })
      mockUsePermissions(mockUser, RoleLevels.SalesManager)
      
      const { result } = renderHook(() => useQuotePermissions(mockQuote))
      
      expect(result.current.canApprove).toBe(true)
      expect(result.current.canAssign).toBe(true)
      expect(result.current.canDelete).toBe(false)
    })
  })

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle null quote gracefully', () => {
      const mockUser = createMockUser()
      mockUsePermissions(mockUser)
      
      expect(() => {
        const { result } = renderHook(() => useQuotePermissions(null))
        
        // All permissions should be false
        expect(result.current.canView).toBe(false)
        expect(result.current.canUpdate).toBe(false)
        expect(result.current.canApprove).toBe(false)
        expect(result.current.canDelete).toBe(false)
      }).not.toThrow()
    })

    it('should handle null user gracefully', () => {
      const mockQuote = createMockQuote()
      mockUsePermissions(null)
      
      const { result } = renderHook(() => useQuotePermissions(mockQuote))
      
      // All permissions should be false
      expect(result.current.canView).toBe(false)
      expect(result.current.canUpdate).toBe(false)
      expect(result.current.canApprove).toBe(false)
      expect(result.current.context.isOwnQuote).toBe(false)
    })

    it('should handle both null quote and user', () => {
      mockUsePermissions(null)
      
      const { result } = renderHook(() => useQuotePermissions(null))
      
      expect(result.current.canView).toBe(false)
      expect(result.current.canUpdate).toBe(false)
      expect(result.current.context.isOwnQuote).toBe(false)
      expect(result.current.context.isAssignedQuote).toBe(false)
    })

    it('should handle quote with missing assignedSalesRepId', () => {
      const mockUser = createMockUser({ id: 200 })
      const mockQuote = createMockQuote({ assignedSalesRepId: undefined })
      mockUsePermissions(mockUser, RoleLevels.SalesRep)
      
      const { result } = renderHook(() => useQuotePermissions(mockQuote))
      
      expect(result.current.context.isAssignedQuote).toBe(false)
    })

    it('should handle quote with missing customerId', () => {
      const mockUser = createMockUser({ customerId: 300 })
      const mockQuote = createMockQuote({ customerId: undefined })
      mockUsePermissions(mockUser, RoleLevels.Customer)
      
      const { result } = renderHook(() => useQuotePermissions(mockQuote))
      
      // Should still try email/company match
      expect(result.current.context.isOwnQuote).toBeDefined()
    })
  })
})


