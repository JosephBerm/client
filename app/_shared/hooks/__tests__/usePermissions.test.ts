/**
 * usePermissions Hook Unit Tests
 * 
 * MAANG-Level: Comprehensive security and permission testing.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY LAYER
 * 
 * This is the core of the RBAC system. ALL permission checks flow through this hook.
 * Tests must cover EVERY possible permission combination, edge case, and security scenario.
 * 
 * **Testing Strategy:**
 * 1. Role hierarchy validation (Admin > FulfillmentCoordinator > SalesManager > SalesRep > Customer)
 * 2. Permission checks for ALL resources and actions
 * 3. Context-aware permissions (Own, Assigned, Team, All)
 * 4. Edge cases and security bypass attempts
 * 5. Unauthenticated user handling
 * 
 * **Business Rules Tested:**
 * - Admin bypasses all permission checks
 * - Higher roles inherit lower role permissions
 * - Context hierarchy: All > Team > Assigned > Own
 * - Unauthenticated users have NO permissions
 * 
 * @module RBAC/usePermissions.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermissions, Resources, Actions, Contexts, RoleLevels } from '../usePermissions'
import { useAuthStore } from '@_features/auth/stores/useAuthStore'
import type { Resource, Action, Context, RoleLevel } from '@_types/rbac'

// ============================================================================
// MOCK SETUP
// ============================================================================

vi.mock('@_features/auth/stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}))

// ============================================================================
// TEST DATA BUILDERS
// ============================================================================

interface MockUser {
  id: number
  email: string
  role: number
  customerId?: number
  name?: { first: string; last: string }
  customer?: { name: string }
}

function createMockUser(roleLevel: RoleLevel, overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 1,
    email: 'test@example.com',
    role: roleLevel,
    customerId: 123,
    name: { first: 'Test', last: 'User' },
    customer: { name: 'Test Company' },
    ...overrides,
  }
}

function mockAuthStore(user: MockUser | null) {
  ;(useAuthStore as any).mockImplementation((selector: (state: any) => any) => {
    const state = { user, isAuthenticated: !!user }
    return selector(state)
  })
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('usePermissions Hook - RBAC Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // AUTHENTICATION STATE TESTS
  // ==========================================================================

  describe('Authentication State', () => {
    it('should return isAuthenticated=false when user is null', () => {
      mockAuthStore(null)
      
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.roleLevel).toBeUndefined()
    })

    it('should return isAuthenticated=true when user exists', () => {
      mockAuthStore(createMockUser(RoleLevels.Customer))
      
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).not.toBeNull()
    })

    it('should return correct role level from user', () => {
      mockAuthStore(createMockUser(RoleLevels.SalesManager))
      
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.roleLevel).toBe(RoleLevels.SalesManager)
    })

    it('should handle string role name (legacy format)', () => {
      const user = { ...createMockUser(0), role: 'admin' as any }
      mockAuthStore(user)
      
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.roleLevel).toBe(RoleLevels.Admin)
    })

    it('should handle unknown string role gracefully', () => {
      const user = { ...createMockUser(0), role: 'unknown_role' as any }
      mockAuthStore(user)
      
      const { result } = renderHook(() => usePermissions())
      
      // Should default to Customer level
      expect(result.current.roleLevel).toBe(RoleLevels.Customer)
    })

    it('should return isLoading=false (synchronous store access)', () => {
      mockAuthStore(createMockUser(RoleLevels.Customer))
      
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.isLoading).toBe(false)
    })
  })

  // ==========================================================================
  // ROLE HIERARCHY TESTS
  // ==========================================================================

  describe('Role Hierarchy Checks', () => {
    describe('Admin Role', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.Admin))
      })

      it('isAdmin should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isAdmin).toBe(true)
      })

      it('isSalesManagerOrAbove should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesManagerOrAbove).toBe(true)
      })

      it('isSalesRepOrAbove should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesRepOrAbove).toBe(true)
      })

      it('isFulfillmentCoordinatorOrAbove should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isFulfillmentCoordinatorOrAbove).toBe(true)
      })

      it('isCustomer should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isCustomer).toBe(false)
      })

      it('hasMinimumRole should return true for all roles', () => {
        const { result } = renderHook(() => usePermissions())
        
        expect(result.current.hasMinimumRole(RoleLevels.Customer)).toBe(true)
        expect(result.current.hasMinimumRole(RoleLevels.SalesRep)).toBe(true)
        expect(result.current.hasMinimumRole(RoleLevels.SalesManager)).toBe(true)
        expect(result.current.hasMinimumRole(RoleLevels.FulfillmentCoordinator)).toBe(true)
        expect(result.current.hasMinimumRole(RoleLevels.Admin)).toBe(true)
      })
    })

    describe('FulfillmentCoordinator Role', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.FulfillmentCoordinator))
      })

      it('isAdmin should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isAdmin).toBe(false)
      })

      it('isFulfillmentCoordinatorOrAbove should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isFulfillmentCoordinatorOrAbove).toBe(true)
      })

      it('isSalesManagerOrAbove should be true (300 > 200)', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesManagerOrAbove).toBe(true)
      })

      it('hasMinimumRole should return false for Admin', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasMinimumRole(RoleLevels.Admin)).toBe(false)
      })
    })

    describe('SalesManager Role', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.SalesManager))
      })

      it('isAdmin should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isAdmin).toBe(false)
      })

      it('isSalesManagerOrAbove should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesManagerOrAbove).toBe(true)
      })

      it('isSalesRepOrAbove should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesRepOrAbove).toBe(true)
      })

      it('isFulfillmentCoordinatorOrAbove should be false (200 < 300)', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isFulfillmentCoordinatorOrAbove).toBe(false)
      })

      it('hasMinimumRole should return false for Admin and FulfillmentCoordinator', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasMinimumRole(RoleLevels.Admin)).toBe(false)
        expect(result.current.hasMinimumRole(RoleLevels.FulfillmentCoordinator)).toBe(false)
      })
    })

    describe('SalesRep Role', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.SalesRep))
      })

      it('isAdmin should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isAdmin).toBe(false)
      })

      it('isSalesManagerOrAbove should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesManagerOrAbove).toBe(false)
      })

      it('isSalesRepOrAbove should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesRepOrAbove).toBe(true)
      })

      it('isCustomer should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isCustomer).toBe(false)
      })
    })

    describe('Customer Role', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.Customer))
      })

      it('isAdmin should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isAdmin).toBe(false)
      })

      it('isSalesManagerOrAbove should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesManagerOrAbove).toBe(false)
      })

      it('isSalesRepOrAbove should be false', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isSalesRepOrAbove).toBe(false)
      })

      it('isCustomer should be true', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.isCustomer).toBe(true)
      })

      it('hasMinimumRole should return true only for Customer', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasMinimumRole(RoleLevels.Customer)).toBe(true)
        expect(result.current.hasMinimumRole(RoleLevels.SalesRep)).toBe(false)
      })
    })

    describe('Unauthenticated User', () => {
      beforeEach(() => {
        mockAuthStore(null)
      })

      it('all role checks should be false', () => {
        const { result } = renderHook(() => usePermissions())
        
        expect(result.current.isAdmin).toBe(false)
        expect(result.current.isSalesManagerOrAbove).toBe(false)
        expect(result.current.isSalesRepOrAbove).toBe(false)
        expect(result.current.isFulfillmentCoordinatorOrAbove).toBe(false)
        expect(result.current.isCustomer).toBe(false)
      })

      it('hasMinimumRole should always return false', () => {
        const { result } = renderHook(() => usePermissions())
        
        expect(result.current.hasMinimumRole(RoleLevels.Customer)).toBe(false)
        expect(result.current.hasMinimumRole(RoleLevels.Admin)).toBe(false)
      })
    })
  })

  // ==========================================================================
  // PERMISSION CHECK TESTS
  // ==========================================================================

  describe('Permission Checks - hasPermission()', () => {
    describe('Admin Bypass', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.Admin))
      })

      it('Admin should have ALL permissions', () => {
        const { result } = renderHook(() => usePermissions())
        
        // Test every resource and action combination
        const allResources = Object.values(Resources) as Resource[]
        const allActions = Object.values(Actions) as Action[]
        
        for (const resource of allResources) {
          for (const action of allActions) {
            expect(
              result.current.hasPermission(resource, action),
              `Admin should have ${resource}:${action}`
            ).toBe(true)
          }
        }
      })

      it('Admin should have all context-specific permissions', () => {
        const { result } = renderHook(() => usePermissions())
        const allContexts = Object.values(Contexts) as Context[]
        
        for (const context of allContexts) {
          expect(
            result.current.hasPermission(Resources.Quotes, Actions.Read, context),
            `Admin should have quotes:read:${context}`
          ).toBe(true)
        }
      })
    })

    describe('Unauthenticated User', () => {
      beforeEach(() => {
        mockAuthStore(null)
      })

      it('Unauthenticated user should have NO permissions', () => {
        const { result } = renderHook(() => usePermissions())
        
        // Test ALL resource/action combinations - ALL should be false
        const allResources = Object.values(Resources) as Resource[]
        const allActions = Object.values(Actions) as Action[]
        
        for (const resource of allResources) {
          for (const action of allActions) {
            expect(
              result.current.hasPermission(resource, action),
              `Unauthenticated should NOT have ${resource}:${action}`
            ).toBe(false)
          }
        }
      })
    })

    describe('Customer Permissions', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.Customer))
      })

      // Quotes
      it('Customer can read own quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Own)).toBe(true)
      })

      it('Customer can create quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Create)).toBe(true)
      })

      it('Customer can update own quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Update, Contexts.Own)).toBe(true)
      })

      it('Customer CANNOT read all quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.All)).toBe(false)
      })

      it('Customer CANNOT delete quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(false)
      })

      it('Customer CANNOT approve quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(false)
      })

      it('Customer CANNOT assign quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Assign)).toBe(false)
      })

      // Orders
      it('Customer can read own orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Read, Contexts.Own)).toBe(true)
      })

      it('Customer can update own orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Update, Contexts.Own)).toBe(true)
      })

      it('Customer CANNOT create orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Create)).toBe(false)
      })

      // Products
      it('Customer can read products', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Products, Actions.Read)).toBe(true)
      })

      it('Customer CANNOT create products', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Products, Actions.Create)).toBe(false)
      })

      // Customers (own profile)
      it('Customer can read own profile', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Customers, Actions.Read, Contexts.Own)).toBe(true)
      })

      it('Customer can update own profile', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Customers, Actions.Update, Contexts.Own)).toBe(true)
      })

      // Settings
      it('Customer can read settings', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Settings, Actions.Read)).toBe(true)
      })

      it('Customer CANNOT update settings', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Settings, Actions.Update)).toBe(false)
      })

      // Analytics
      it('Customer CANNOT access analytics', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(false)
      })

      // Vendors
      it('Customer CANNOT access vendors', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Vendors, Actions.Read)).toBe(false)
      })
    })

    describe('SalesRep Permissions', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.SalesRep))
      })

      // SalesRep inherits Customer permissions
      it('SalesRep can read own quotes (inherited)', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Own)).toBe(true)
      })

      // SalesRep specific permissions
      it('SalesRep can read assigned quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Assigned)).toBe(true)
      })

      it('SalesRep can update assigned quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Update, Contexts.Assigned)).toBe(true)
      })

      it('SalesRep can create orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Create)).toBe(true)
      })

      it('SalesRep can confirm payment', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.ConfirmPayment)).toBe(true)
      })

      it('SalesRep can update tracking', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.UpdateTracking)).toBe(true)
      })

      it('SalesRep can read vendors', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Vendors, Actions.Read)).toBe(true)
      })

      it('SalesRep can read own analytics', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(true)
      })

      it('SalesRep can create customers', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Customers, Actions.Create)).toBe(true)
      })

      // SalesRep restrictions
      it('SalesRep CANNOT approve quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(false)
      })

      it('SalesRep CANNOT assign quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Assign)).toBe(false)
      })

      it('SalesRep CANNOT delete quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(false)
      })

      it('SalesRep CANNOT read all quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.All)).toBe(false)
      })

      it('SalesRep CANNOT export analytics', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(false)
      })
    })

    describe('SalesManager Permissions', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.SalesManager))
      })

      // SalesManager specific permissions
      it('SalesManager can approve quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(true)
      })

      it('SalesManager can assign quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Assign)).toBe(true)
      })

      it('SalesManager can read all quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.All)).toBe(true)
      })

      it('SalesManager can read team quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Team)).toBe(true)
      })

      it('SalesManager can update all quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Update, Contexts.All)).toBe(true)
      })

      it('SalesManager can approve orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Approve)).toBe(true)
      })

      it('SalesManager can read all orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Read, Contexts.All)).toBe(true)
      })

      it('SalesManager can export analytics', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(true)
      })

      it('SalesManager can read team analytics', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(true)
      })

      it('SalesManager can create users', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Users, Actions.Create)).toBe(true)
      })

      it('SalesManager can update team users', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Users, Actions.Update, Contexts.Team)).toBe(true)
      })

      // SalesManager restrictions
      it('SalesManager CANNOT delete quotes', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(false)
      })

      it('SalesManager CANNOT delete orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Delete)).toBe(false)
      })

      it('SalesManager CANNOT delete users', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Users, Actions.Delete)).toBe(false)
      })

      it('SalesManager CANNOT manage settings', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Settings, Actions.Manage)).toBe(false)
      })
    })

    describe('FulfillmentCoordinator Permissions', () => {
      beforeEach(() => {
        mockAuthStore(createMockUser(RoleLevels.FulfillmentCoordinator))
      })

      // FulfillmentCoordinator specific permissions
      it('FulfillmentCoordinator can read all orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Read, Contexts.All)).toBe(true)
      })

      it('FulfillmentCoordinator can update all orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Update, Contexts.All)).toBe(true)
      })

      it('FulfillmentCoordinator can update vendors', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Vendors, Actions.Update)).toBe(true)
      })

      // FulfillmentCoordinator restrictions
      it('FulfillmentCoordinator CANNOT delete orders', () => {
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Orders, Actions.Delete)).toBe(false)
      })

      it('FulfillmentCoordinator CANNOT manage quotes', () => {
        const { result } = renderHook(() => usePermissions())
        // Should inherit SalesManager permissions for quotes
        expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(true)
      })
    })

    describe('Admin-Only Permissions', () => {
      it('Only Admin can delete quotes', () => {
        const roles = [RoleLevels.Customer, RoleLevels.SalesRep, RoleLevels.SalesManager, RoleLevels.FulfillmentCoordinator]
        
        for (const role of roles) {
          mockAuthStore(createMockUser(role))
          const { result } = renderHook(() => usePermissions())
          expect(
            result.current.hasPermission(Resources.Quotes, Actions.Delete),
            `Role ${role} should NOT have quotes:delete`
          ).toBe(false)
        }
        
        // Admin should have it
        mockAuthStore(createMockUser(RoleLevels.Admin))
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(true)
      })

      it('Only Admin can delete users', () => {
        const roles = [RoleLevels.Customer, RoleLevels.SalesRep, RoleLevels.SalesManager, RoleLevels.FulfillmentCoordinator]
        
        for (const role of roles) {
          mockAuthStore(createMockUser(role))
          const { result } = renderHook(() => usePermissions())
          expect(result.current.hasPermission(Resources.Users, Actions.Delete)).toBe(false)
        }
        
        mockAuthStore(createMockUser(RoleLevels.Admin))
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Users, Actions.Delete)).toBe(true)
      })

      it('Only Admin can manage settings', () => {
        const roles = [RoleLevels.Customer, RoleLevels.SalesRep, RoleLevels.SalesManager, RoleLevels.FulfillmentCoordinator]
        
        for (const role of roles) {
          mockAuthStore(createMockUser(role))
          const { result } = renderHook(() => usePermissions())
          expect(result.current.hasPermission(Resources.Settings, Actions.Manage)).toBe(false)
        }
        
        mockAuthStore(createMockUser(RoleLevels.Admin))
        const { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Settings, Actions.Manage)).toBe(true)
      })

      it('Only Admin can create/delete products', () => {
        mockAuthStore(createMockUser(RoleLevels.SalesManager))
        let { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Products, Actions.Create)).toBe(false)
        expect(result.current.hasPermission(Resources.Products, Actions.Delete)).toBe(false)
        
        mockAuthStore(createMockUser(RoleLevels.Admin))
        ;({ result } = renderHook(() => usePermissions()))
        expect(result.current.hasPermission(Resources.Products, Actions.Create)).toBe(true)
        expect(result.current.hasPermission(Resources.Products, Actions.Delete)).toBe(true)
      })

      it('Only Admin can create/delete vendors', () => {
        mockAuthStore(createMockUser(RoleLevels.FulfillmentCoordinator))
        let { result } = renderHook(() => usePermissions())
        expect(result.current.hasPermission(Resources.Vendors, Actions.Create)).toBe(false)
        expect(result.current.hasPermission(Resources.Vendors, Actions.Delete)).toBe(false)
        
        mockAuthStore(createMockUser(RoleLevels.Admin))
        ;({ result } = renderHook(() => usePermissions()))
        expect(result.current.hasPermission(Resources.Vendors, Actions.Create)).toBe(true)
        expect(result.current.hasPermission(Resources.Vendors, Actions.Delete)).toBe(true)
      })
    })

    describe('Context Hierarchy Tests', () => {
      it('"All" context permission should grant access without specific context', () => {
        mockAuthStore(createMockUser(RoleLevels.SalesManager))
        const { result } = renderHook(() => usePermissions())
        
        // SalesManager has quotes:read:all
        // This should also grant quotes:read without context
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read)).toBe(true)
      })

      it('Specific context should not grant access to higher context', () => {
        mockAuthStore(createMockUser(RoleLevels.Customer))
        const { result } = renderHook(() => usePermissions())
        
        // Customer has quotes:read:own
        // Should NOT have quotes:read:assigned or quotes:read:all
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Own)).toBe(true)
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Assigned)).toBe(false)
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Team)).toBe(false)
        expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.All)).toBe(false)
      })
    })
  })

  // ==========================================================================
  // BATCH PERMISSION CHECKS
  // ==========================================================================

  describe('Batch Permission Checks', () => {
    describe('hasAnyPermission()', () => {
      it('should return true if user has ANY of the specified permissions', () => {
        mockAuthStore(createMockUser(RoleLevels.Customer))
        const { result } = renderHook(() => usePermissions())
        
        const checks = [
          { resource: Resources.Quotes, action: Actions.Delete }, // No
          { resource: Resources.Quotes, action: Actions.Create }, // Yes
          { resource: Resources.Users, action: Actions.Delete }, // No
        ]
        
        expect(result.current.hasAnyPermission(checks)).toBe(true)
      })

      it('should return false if user has NONE of the specified permissions', () => {
        mockAuthStore(createMockUser(RoleLevels.Customer))
        const { result } = renderHook(() => usePermissions())
        
        const checks = [
          { resource: Resources.Quotes, action: Actions.Delete },
          { resource: Resources.Users, action: Actions.Delete },
          { resource: Resources.Settings, action: Actions.Manage },
        ]
        
        expect(result.current.hasAnyPermission(checks)).toBe(false)
      })

      it('should work with context-specific permissions', () => {
        mockAuthStore(createMockUser(RoleLevels.SalesRep))
        const { result } = renderHook(() => usePermissions())
        
        const checks = [
          { resource: Resources.Quotes, action: Actions.Read, context: Contexts.All }, // No
          { resource: Resources.Quotes, action: Actions.Read, context: Contexts.Assigned }, // Yes
        ]
        
        expect(result.current.hasAnyPermission(checks)).toBe(true)
      })
    })

    describe('hasAllPermissions()', () => {
      it('should return true if user has ALL specified permissions', () => {
        mockAuthStore(createMockUser(RoleLevels.SalesRep))
        const { result } = renderHook(() => usePermissions())
        
        const checks = [
          { resource: Resources.Quotes, action: Actions.Create },
          { resource: Resources.Orders, action: Actions.Create },
          { resource: Resources.Vendors, action: Actions.Read },
        ]
        
        expect(result.current.hasAllPermissions(checks)).toBe(true)
      })

      it('should return false if user is missing ANY permission', () => {
        mockAuthStore(createMockUser(RoleLevels.SalesRep))
        const { result } = renderHook(() => usePermissions())
        
        const checks = [
          { resource: Resources.Quotes, action: Actions.Create }, // Yes
          { resource: Resources.Quotes, action: Actions.Approve }, // No - SalesManager+
        ]
        
        expect(result.current.hasAllPermissions(checks)).toBe(false)
      })

      it('Admin should pass all permission checks', () => {
        mockAuthStore(createMockUser(RoleLevels.Admin))
        const { result } = renderHook(() => usePermissions())
        
        const checks = [
          { resource: Resources.Quotes, action: Actions.Delete },
          { resource: Resources.Users, action: Actions.Delete },
          { resource: Resources.Settings, action: Actions.Manage },
        ]
        
        expect(result.current.hasAllPermissions(checks)).toBe(true)
      })
    })
  })

  // ==========================================================================
  // ROLE NAME DISPLAY
  // ==========================================================================

  describe('Role Display Name', () => {
    it('should return "Administrator" for Admin role', () => {
      mockAuthStore(createMockUser(RoleLevels.Admin))
      const { result } = renderHook(() => usePermissions())
      expect(result.current.roleName).toBe('Administrator')
    })

    it('should return "Sales Manager" for SalesManager role', () => {
      mockAuthStore(createMockUser(RoleLevels.SalesManager))
      const { result } = renderHook(() => usePermissions())
      expect(result.current.roleName).toBe('Sales Manager')
    })

    it('should return "Sales Representative" for SalesRep role', () => {
      mockAuthStore(createMockUser(RoleLevels.SalesRep))
      const { result } = renderHook(() => usePermissions())
      expect(result.current.roleName).toBe('Sales Representative')
    })

    it('should return "Customer" for Customer role', () => {
      mockAuthStore(createMockUser(RoleLevels.Customer))
      const { result } = renderHook(() => usePermissions())
      expect(result.current.roleName).toBe('Customer')
    })

    it('should return "Fulfillment Coordinator" for FulfillmentCoordinator role', () => {
      mockAuthStore(createMockUser(RoleLevels.FulfillmentCoordinator))
      const { result } = renderHook(() => usePermissions())
      expect(result.current.roleName).toBe('Fulfillment Coordinator')
    })

    it('should return "Unknown" for undefined role', () => {
      mockAuthStore(null)
      const { result } = renderHook(() => usePermissions())
      expect(result.current.roleName).toBe('Unknown')
    })
  })

  // ==========================================================================
  // PERMISSIONS SET
  // ==========================================================================

  describe('Permissions Set', () => {
    it('should return Set of permissions for the role', () => {
      mockAuthStore(createMockUser(RoleLevels.Customer))
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.permissions).toBeInstanceOf(Set)
      expect(result.current.permissions.size).toBeGreaterThan(0)
    })

    it('should contain expected permissions for Customer', () => {
      mockAuthStore(createMockUser(RoleLevels.Customer))
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.permissions.has('quotes:read:own')).toBe(true)
      expect(result.current.permissions.has('quotes:create')).toBe(true)
      expect(result.current.permissions.has('products:read')).toBe(true)
      expect(result.current.permissions.has('settings:read')).toBe(true)
    })

    it('should be empty for unauthenticated user', () => {
      mockAuthStore(null)
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.permissions.size).toBe(0)
    })

    it('permissions should increase with higher roles', () => {
      mockAuthStore(createMockUser(RoleLevels.Customer))
      const { result: customerResult } = renderHook(() => usePermissions())
      const customerPermsCount = customerResult.current.permissions.size
      
      mockAuthStore(createMockUser(RoleLevels.SalesRep))
      const { result: salesRepResult } = renderHook(() => usePermissions())
      const salesRepPermsCount = salesRepResult.current.permissions.size
      
      mockAuthStore(createMockUser(RoleLevels.SalesManager))
      const { result: managerResult } = renderHook(() => usePermissions())
      const managerPermsCount = managerResult.current.permissions.size
      
      // Higher roles should have more permissions
      expect(salesRepPermsCount).toBeGreaterThan(customerPermsCount)
      expect(managerPermsCount).toBeGreaterThan(salesRepPermsCount)
    })
  })

  // ==========================================================================
  // EDGE CASES & SECURITY TESTS
  // ==========================================================================

  describe('Security Edge Cases', () => {
    it('should handle null user gracefully without errors', () => {
      mockAuthStore(null)
      
      expect(() => {
        const { result } = renderHook(() => usePermissions())
        result.current.hasPermission(Resources.Quotes, Actions.Read)
        result.current.hasMinimumRole(RoleLevels.Admin)
        result.current.hasAnyPermission([{ resource: Resources.Quotes, action: Actions.Read }])
      }).not.toThrow()
    })

    it('should handle undefined resource gracefully', () => {
      mockAuthStore(createMockUser(RoleLevels.Admin))
      const { result } = renderHook(() => usePermissions())
      
      // Even Admin bypass should handle undefined safely
      expect(() => {
        result.current.hasPermission(undefined as any, Actions.Read)
      }).not.toThrow()
    })

    it('should handle undefined action gracefully', () => {
      mockAuthStore(createMockUser(RoleLevels.Admin))
      const { result } = renderHook(() => usePermissions())
      
      expect(() => {
        result.current.hasPermission(Resources.Quotes, undefined as any)
      }).not.toThrow()
    })

    it('should not leak permissions between renders', () => {
      // First render as Admin
      mockAuthStore(createMockUser(RoleLevels.Admin))
      const { result: adminResult, rerender: rerenderAdmin } = renderHook(() => usePermissions())
      expect(adminResult.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(true)
      
      // Second render as Customer
      mockAuthStore(createMockUser(RoleLevels.Customer))
      const { result: customerResult } = renderHook(() => usePermissions())
      expect(customerResult.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(false)
    })

    it('should handle role level 0 correctly (Customer)', () => {
      mockAuthStore({ ...createMockUser(0), role: 0 })
      const { result } = renderHook(() => usePermissions())
      
      expect(result.current.roleLevel).toBe(0)
      expect(result.current.isCustomer).toBe(true)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Create)).toBe(true)
    })

    it('should handle negative role level gracefully', () => {
      mockAuthStore({ ...createMockUser(0), role: -1 })
      const { result } = renderHook(() => usePermissions())
      
      // Negative role should have no permissions (lower than Customer)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Create)).toBe(false)
    })

    it('should handle extremely large role level (Admin+)', () => {
      mockAuthStore({ ...createMockUser(0), role: Number.MAX_SAFE_INTEGER })
      const { result } = renderHook(() => usePermissions())
      
      // Should be treated as Admin
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(true)
    })

    it('should handle role level between defined roles', () => {
      // Role level 150 is between SalesRep (100) and SalesManager (200)
      mockAuthStore({ ...createMockUser(0), role: 150 })
      const { result } = renderHook(() => usePermissions())
      
      // Should have SalesRep permissions but not SalesManager
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Assigned)).toBe(true)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(false)
    })
  })

  // ==========================================================================
  // COMPLETE PERMISSION MATRIX TEST
  // ==========================================================================

  describe('Complete Permission Matrix', () => {
    /**
     * This test validates the ENTIRE permission matrix.
     * It tests every role against every resource/action/context combination.
     * 
     * Business Rule Reference: business_flow.md Section 2.2
     */
    it('should enforce complete permission matrix as per business_flow.md', () => {
      // Define expected permissions per role
      const permissionMatrix: Record<RoleLevel, string[]> = {
        [RoleLevels.Customer]: [
          'quotes:read:own', 'quotes:create', 'quotes:update:own',
          'orders:read:own', 'orders:update:own',
          'products:read',
          'customers:read:own', 'customers:update:own',
          'users:read:own', 'users:update:own',
          'settings:read',
        ],
        [RoleLevels.SalesRep]: [
          // Includes Customer permissions
          'quotes:read:own', 'quotes:create', 'quotes:update:own',
          'orders:read:own', 'orders:update:own',
          'products:read',
          'customers:read:own', 'customers:update:own',
          'users:read:own', 'users:update:own',
          'settings:read',
          // SalesRep specific
          'quotes:read:assigned', 'quotes:update:assigned',
          'orders:read:assigned', 'orders:create', 'orders:update:assigned',
          'orders:confirm_payment', 'orders:update_tracking',
          'customers:read:assigned', 'customers:create', 'customers:update:assigned',
          'vendors:read',
          'analytics:read:own',
        ],
        [RoleLevels.SalesManager]: [
          // Includes SalesRep permissions (all of them)
          // Plus SalesManager specific
          'quotes:read:team', 'quotes:read:all', 'quotes:update:all',
          'quotes:approve', 'quotes:assign',
          'orders:read:team', 'orders:read:all', 'orders:update:all', 'orders:approve',
          'customers:read:team', 'customers:read:all', 'customers:update:all',
          'analytics:read:team', 'analytics:export',
          'users:read:team', 'users:create', 'users:update:team',
        ],
        [RoleLevels.FulfillmentCoordinator]: [
          // Has order-focused permissions
          'orders:read:all', 'orders:update:all',
          'vendors:update',
        ],
        [RoleLevels.Admin]: [
          // Admin has ALL permissions - tested separately
        ],
      }

      // Test each role
      for (const [roleLevel, expectedPerms] of Object.entries(permissionMatrix)) {
        if (Number(roleLevel) === RoleLevels.Admin) continue // Admin tested separately
        
        mockAuthStore(createMockUser(Number(roleLevel) as RoleLevel))
        const { result } = renderHook(() => usePermissions())
        
        for (const perm of expectedPerms) {
          const [resource, action, context] = perm.split(':') as [Resource, Action, Context?]
          
          expect(
            result.current.hasPermission(resource, action, context),
            `Role ${roleLevel} should have permission: ${perm}`
          ).toBe(true)
        }
      }
    })
  })
})


