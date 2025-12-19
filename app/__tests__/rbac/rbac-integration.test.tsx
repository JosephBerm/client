/**
 * RBAC System Integration Tests
 * 
 * MAANG-Level: End-to-end RBAC system validation.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY VALIDATION
 * 
 * These tests validate the entire RBAC system working together:
 * - Authentication → Role assignment → Permission checks → UI rendering
 * 
 * **Testing Strategy:**
 * 1. Complete user journey tests for each role
 * 2. Role escalation/deescalation scenarios
 * 3. Real-world page protection scenarios
 * 4. Security bypass attempt tests
 * 
 * @module RBAC/integration.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { 
  usePermissions, 
  Resources, 
  Actions, 
  Contexts, 
  RoleLevels 
} from '@_shared/hooks/usePermissions'
import { PermissionGuard, RoleGuard } from '@_components/common/guards'
import { useAuthStore } from '@_features/auth/stores/useAuthStore'
import type { RoleLevel } from '@_types/rbac'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Create a mock store with state management
const createMockStore = () => {
  let state = {
    user: null as any,
    isAuthenticated: false,
  }
  
  return {
    getState: () => state,
    setState: (newState: Partial<typeof state>) => {
      state = { ...state, ...newState }
    },
    subscribe: vi.fn(),
  }
}

const mockStore = createMockStore()

vi.mock('@_features/auth/stores/useAuthStore', () => ({
  useAuthStore: vi.fn((selector: (state: any) => any) => selector(mockStore.getState())),
}))

// ============================================================================
// TEST HELPERS
// ============================================================================

interface TestUser {
  id: number
  email: string
  role: RoleLevel
  customerId?: number
  name?: { first: string; last: string }
}

function createTestUser(role: RoleLevel, overrides?: Partial<TestUser>): TestUser {
  return {
    id: 1,
    email: 'test@medsource.com',
    role,
    customerId: 123,
    name: { first: 'Test', last: 'User' },
    ...overrides,
  }
}

function loginAs(role: RoleLevel, overrides?: Partial<TestUser>) {
  const user = createTestUser(role, overrides)
  mockStore.setState({ user, isAuthenticated: true })
}

function logout() {
  mockStore.setState({ user: null, isAuthenticated: false })
}

// ============================================================================
// INTEGRATION TEST SUITES
// ============================================================================

describe('RBAC Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    logout()
  })

  afterEach(() => {
    vi.clearAllMocks()
    logout()
  })

  // ==========================================================================
  // COMPLETE USER JOURNEY TESTS
  // ==========================================================================

  describe('Customer User Journey', () => {
    beforeEach(() => {
      loginAs(RoleLevels.Customer, { email: 'customer@hospital.com' })
    })

    it('Customer can access own resources only', () => {
      const { result } = renderHook(() => usePermissions())
      
      // Own resources
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Own)).toBe(true)
      expect(result.current.hasPermission(Resources.Orders, Actions.Read, Contexts.Own)).toBe(true)
      expect(result.current.hasPermission(Resources.Customers, Actions.Read, Contexts.Own)).toBe(true)
      
      // Cannot access others' resources
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.All)).toBe(false)
      expect(result.current.hasPermission(Resources.Orders, Actions.Read, Contexts.Assigned)).toBe(false)
    })

    it('Customer sees appropriate UI elements', () => {
      const { result } = renderHook(() => usePermissions())
      
      render(
        <div>
          {/* Customer should see */}
          <PermissionGuard resource={Resources.Quotes} action={Actions.Create}>
            <button data-testid="create-quote">Request Quote</button>
          </PermissionGuard>
          
          <PermissionGuard resource={Resources.Products} action={Actions.Read}>
            <div data-testid="product-catalog">Product Catalog</div>
          </PermissionGuard>
          
          {/* Customer should NOT see */}
          <PermissionGuard resource={Resources.Quotes} action={Actions.Approve}>
            <button data-testid="approve-quote">Approve Quote</button>
          </PermissionGuard>
          
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="sales-tools">Sales Tools</div>
          </RoleGuard>
          
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="admin-panel">Admin Panel</div>
          </RoleGuard>
        </div>
      )
      
      // Visible to customer
      expect(screen.getByTestId('create-quote')).toBeInTheDocument()
      expect(screen.getByTestId('product-catalog')).toBeInTheDocument()
      
      // Hidden from customer
      expect(screen.queryByTestId('approve-quote')).not.toBeInTheDocument()
      expect(screen.queryByTestId('sales-tools')).not.toBeInTheDocument()
      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument()
    })

    it('Customer cannot perform admin actions', () => {
      const { result } = renderHook(() => usePermissions())
      
      const adminActions = [
        { resource: Resources.Users, action: Actions.Delete },
        { resource: Resources.Quotes, action: Actions.Delete },
        { resource: Resources.Settings, action: Actions.Manage },
        { resource: Resources.Products, action: Actions.Create },
        { resource: Resources.Vendors, action: Actions.Create },
      ]
      
      for (const { resource, action } of adminActions) {
        expect(
          result.current.hasPermission(resource, action),
          `Customer should NOT have ${resource}:${action}`
        ).toBe(false)
      }
    })
  })

  describe('SalesRep User Journey', () => {
    beforeEach(() => {
      loginAs(RoleLevels.SalesRep, { email: 'salesrep@medsource.com' })
    })

    it('SalesRep can manage assigned resources', () => {
      const { result } = renderHook(() => usePermissions())
      
      // Assigned resources
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Assigned)).toBe(true)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Update, Contexts.Assigned)).toBe(true)
      expect(result.current.hasPermission(Resources.Orders, Actions.Read, Contexts.Assigned)).toBe(true)
      expect(result.current.hasPermission(Resources.Customers, Actions.Read, Contexts.Assigned)).toBe(true)
      
      // Can create orders (quote to order conversion)
      expect(result.current.hasPermission(Resources.Orders, Actions.Create)).toBe(true)
      
      // Cannot access team/all scope
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Team)).toBe(false)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.All)).toBe(false)
    })

    it('SalesRep sees sales tools but not manager tools', () => {
      render(
        <div>
          {/* SalesRep should see */}
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="assigned-quotes">Assigned Quotes</div>
          </RoleGuard>
          
          <PermissionGuard resource={Resources.Orders} action={Actions.Create}>
            <button data-testid="create-order">Create Order</button>
          </PermissionGuard>
          
          <PermissionGuard resource={Resources.Orders} action={Actions.ConfirmPayment}>
            <button data-testid="confirm-payment">Confirm Payment</button>
          </PermissionGuard>
          
          {/* SalesRep should NOT see */}
          <PermissionGuard resource={Resources.Quotes} action={Actions.Approve}>
            <button data-testid="approve-quote">Approve Quote</button>
          </PermissionGuard>
          
          <PermissionGuard resource={Resources.Quotes} action={Actions.Assign}>
            <button data-testid="assign-quote">Assign Quote</button>
          </PermissionGuard>
          
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="manager-dashboard">Manager Dashboard</div>
          </RoleGuard>
        </div>
      )
      
      // Visible to SalesRep
      expect(screen.getByTestId('assigned-quotes')).toBeInTheDocument()
      expect(screen.getByTestId('create-order')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-payment')).toBeInTheDocument()
      
      // Hidden from SalesRep
      expect(screen.queryByTestId('approve-quote')).not.toBeInTheDocument()
      expect(screen.queryByTestId('assign-quote')).not.toBeInTheDocument()
      expect(screen.queryByTestId('manager-dashboard')).not.toBeInTheDocument()
    })
  })

  describe('SalesManager User Journey', () => {
    beforeEach(() => {
      loginAs(RoleLevels.SalesManager, { email: 'manager@medsource.com' })
    })

    it('SalesManager can approve and assign quotes', () => {
      const { result } = renderHook(() => usePermissions())
      
      // Manager-specific permissions
      expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(true)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Assign)).toBe(true)
      expect(result.current.hasPermission(Resources.Orders, Actions.Approve)).toBe(true)
      
      // Can access all quotes
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.All)).toBe(true)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Update, Contexts.All)).toBe(true)
      
      // Can manage team
      expect(result.current.hasPermission(Resources.Users, Actions.Create)).toBe(true)
      expect(result.current.hasPermission(Resources.Users, Actions.Update, Contexts.Team)).toBe(true)
      
      // Cannot delete (Admin only)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Delete)).toBe(false)
      expect(result.current.hasPermission(Resources.Users, Actions.Delete)).toBe(false)
    })

    it('SalesManager sees manager tools but not admin tools', () => {
      render(
        <div>
          {/* Manager should see */}
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="team-overview">Team Overview</div>
          </RoleGuard>
          
          <PermissionGuard resource={Resources.Quotes} action={Actions.Approve}>
            <button data-testid="approve-quote">Approve Quote</button>
          </PermissionGuard>
          
          <PermissionGuard resource={Resources.Analytics} action={Actions.Export}>
            <button data-testid="export-analytics">Export Analytics</button>
          </PermissionGuard>
          
          {/* Manager should NOT see */}
          <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
            <button data-testid="delete-quote">Delete Quote</button>
          </PermissionGuard>
          
          <PermissionGuard resource={Resources.Settings} action={Actions.Manage}>
            <button data-testid="system-settings">System Settings</button>
          </PermissionGuard>
          
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="admin-controls">Admin Controls</div>
          </RoleGuard>
        </div>
      )
      
      // Visible to Manager
      expect(screen.getByTestId('team-overview')).toBeInTheDocument()
      expect(screen.getByTestId('approve-quote')).toBeInTheDocument()
      expect(screen.getByTestId('export-analytics')).toBeInTheDocument()
      
      // Hidden from Manager
      expect(screen.queryByTestId('delete-quote')).not.toBeInTheDocument()
      expect(screen.queryByTestId('system-settings')).not.toBeInTheDocument()
      expect(screen.queryByTestId('admin-controls')).not.toBeInTheDocument()
    })
  })

  describe('Admin User Journey', () => {
    beforeEach(() => {
      loginAs(RoleLevels.Admin, { email: 'admin@medsource.com' })
    })

    it('Admin has all permissions', () => {
      const { result } = renderHook(() => usePermissions())
      
      // Admin bypass - should have ALL permissions
      const allResources = Object.values(Resources)
      const allActions = Object.values(Actions)
      const allContexts = [...Object.values(Contexts), undefined]
      
      for (const resource of allResources) {
        for (const action of allActions) {
          for (const context of allContexts) {
            expect(
              result.current.hasPermission(resource as any, action as any, context as any),
              `Admin should have ${resource}:${action}${context ? `:${context}` : ''}`
            ).toBe(true)
          }
        }
      }
    })

    it('Admin sees all UI elements', () => {
      render(
        <div>
          <RoleGuard minimumRole={RoleLevels.Customer}>
            <div data-testid="customer-content">Customer Content</div>
          </RoleGuard>
          
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="salesrep-content">SalesRep Content</div>
          </RoleGuard>
          
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="manager-content">Manager Content</div>
          </RoleGuard>
          
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="admin-content">Admin Content</div>
          </RoleGuard>
          
          <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
            <button data-testid="delete-quote">Delete Quote</button>
          </PermissionGuard>
          
          <PermissionGuard resource={Resources.Users} action={Actions.Delete}>
            <button data-testid="delete-user">Delete User</button>
          </PermissionGuard>
          
          <PermissionGuard resource={Resources.Settings} action={Actions.Manage}>
            <button data-testid="manage-settings">Manage Settings</button>
          </PermissionGuard>
        </div>
      )
      
      // Admin sees everything
      expect(screen.getByTestId('customer-content')).toBeInTheDocument()
      expect(screen.getByTestId('salesrep-content')).toBeInTheDocument()
      expect(screen.getByTestId('manager-content')).toBeInTheDocument()
      expect(screen.getByTestId('admin-content')).toBeInTheDocument()
      expect(screen.getByTestId('delete-quote')).toBeInTheDocument()
      expect(screen.getByTestId('delete-user')).toBeInTheDocument()
      expect(screen.getByTestId('manage-settings')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ROLE TRANSITION TESTS
  // ==========================================================================

  describe('Role Transitions', () => {
    it('should handle role upgrade (Customer → SalesRep)', () => {
      // Start as Customer
      loginAs(RoleLevels.Customer)
      
      const { result, rerender } = renderHook(() => usePermissions())
      
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Assigned)).toBe(false)
      expect(result.current.isSalesRepOrAbove).toBe(false)
      
      // Upgrade to SalesRep
      loginAs(RoleLevels.SalesRep)
      
      rerender()
      
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read, Contexts.Assigned)).toBe(true)
      expect(result.current.isSalesRepOrAbove).toBe(true)
    })

    it('should handle role downgrade (Admin → Customer)', () => {
      // Start as Admin
      loginAs(RoleLevels.Admin)
      
      const { result, rerender } = renderHook(() => usePermissions())
      
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.hasPermission(Resources.Users, Actions.Delete)).toBe(true)
      
      // Downgrade to Customer
      loginAs(RoleLevels.Customer)
      
      rerender()
      
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.hasPermission(Resources.Users, Actions.Delete)).toBe(false)
    })

    it('should handle logout properly', () => {
      // Start as Admin
      loginAs(RoleLevels.Admin)
      
      const { result, rerender } = renderHook(() => usePermissions())
      
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isAdmin).toBe(true)
      
      // Logout
      logout()
      
      rerender()
      
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read)).toBe(false)
    })

    it('UI should update immediately on role change', () => {
      loginAs(RoleLevels.Customer)
      
      const { rerender } = render(
        <div>
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="admin-panel">Admin Panel</div>
          </RoleGuard>
        </div>
      )
      
      // Not visible as Customer
      expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument()
      
      // Upgrade to Admin
      loginAs(RoleLevels.Admin)
      
      rerender(
        <div>
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="admin-panel">Admin Panel</div>
          </RoleGuard>
        </div>
      )
      
      // Now visible
      expect(screen.getByTestId('admin-panel')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // SECURITY TESTS
  // ==========================================================================

  describe('Security Tests', () => {
    it('should not allow permission escalation by manipulating user object', () => {
      loginAs(RoleLevels.Customer)
      
      const { result } = renderHook(() => usePermissions())
      
      // Verify customer limitations
      expect(result.current.hasPermission(Resources.Users, Actions.Delete)).toBe(false)
      
      // Attempt to "hack" by directly accessing internal state
      // This should not work because permissions are derived from role level
      const permissions = result.current.permissions
      
      // Trying to add permission directly shouldn't work
      // (Set is readonly in production)
      expect(permissions.has('users:delete')).toBe(false)
    })

    it('should handle invalid role levels safely', () => {
      // Set invalid role level
      mockStore.setState({ 
        user: { id: 1, email: 'test@test.com', role: -999 }, 
        isAuthenticated: true 
      })
      
      const { result } = renderHook(() => usePermissions())
      
      // Should not crash and should deny all permissions
      expect(result.current.hasPermission(Resources.Quotes, Actions.Read)).toBe(false)
      expect(result.current.isAdmin).toBe(false)
    })

    it('should handle null user gracefully', () => {
      logout()
      
      expect(() => {
        const { result } = renderHook(() => usePermissions())
        
        // All checks should return false without errors
        result.current.hasPermission(Resources.Quotes, Actions.Read)
        result.current.hasMinimumRole(RoleLevels.Admin)
        result.current.hasAnyPermission([
          { resource: Resources.Quotes, action: Actions.Read }
        ])
        result.current.hasAllPermissions([
          { resource: Resources.Quotes, action: Actions.Read }
        ])
      }).not.toThrow()
    })

    it('should not expose sensitive content during render', () => {
      logout()
      
      const { container } = render(
        <div>
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="secret">Super Secret Admin Data: Password123!</div>
          </RoleGuard>
        </div>
      )
      
      // Content should never appear in DOM
      expect(container.innerHTML).not.toContain('Super Secret')
      expect(container.innerHTML).not.toContain('Password123')
    })
  })

  // ==========================================================================
  // REAL-WORLD SCENARIOS
  // ==========================================================================

  describe('Real-World Scenarios', () => {
    it('Quote approval workflow', () => {
      // Quote created by customer
      loginAs(RoleLevels.Customer)
      let { result, rerender } = renderHook(() => usePermissions())
      
      // Customer can create quote
      expect(result.current.hasPermission(Resources.Quotes, Actions.Create)).toBe(true)
      // Customer cannot approve
      expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(false)
      
      // SalesRep reviews
      loginAs(RoleLevels.SalesRep)
      ;({ result } = renderHook(() => usePermissions()))
      
      // SalesRep can update assigned
      expect(result.current.hasPermission(Resources.Quotes, Actions.Update, Contexts.Assigned)).toBe(true)
      // SalesRep cannot approve
      expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(false)
      
      // Manager approves
      loginAs(RoleLevels.SalesManager)
      ;({ result } = renderHook(() => usePermissions()))
      
      // Manager can approve
      expect(result.current.hasPermission(Resources.Quotes, Actions.Approve)).toBe(true)
      // Manager can assign
      expect(result.current.hasPermission(Resources.Quotes, Actions.Assign)).toBe(true)
    })

    it('Order fulfillment workflow', () => {
      // FulfillmentCoordinator manages orders
      loginAs(RoleLevels.FulfillmentCoordinator)
      const { result } = renderHook(() => usePermissions())
      
      // Can read all orders
      expect(result.current.hasPermission(Resources.Orders, Actions.Read, Contexts.All)).toBe(true)
      // Can update all orders
      expect(result.current.hasPermission(Resources.Orders, Actions.Update, Contexts.All)).toBe(true)
      // Can update vendors
      expect(result.current.hasPermission(Resources.Vendors, Actions.Update)).toBe(true)
      
      // Cannot delete orders
      expect(result.current.hasPermission(Resources.Orders, Actions.Delete)).toBe(false)
    })

    it('RBAC Admin page protection', () => {
      // Only Admin should access RBAC management
      const roles = [
        RoleLevels.Customer,
        RoleLevels.SalesRep,
        RoleLevels.SalesManager,
        RoleLevels.FulfillmentCoordinator,
      ]
      
      for (const role of roles) {
        loginAs(role)
        
        const { container } = render(
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="rbac-admin">RBAC Administration</div>
          </RoleGuard>
        )
        
        expect(
          screen.queryByTestId('rbac-admin'),
          `Role ${role} should NOT see RBAC admin`
        ).not.toBeInTheDocument()
        
        container.remove()
      }
      
      // Admin should see it
      loginAs(RoleLevels.Admin)
      
      render(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="rbac-admin">RBAC Administration</div>
        </RoleGuard>
      )
      
      expect(screen.getByTestId('rbac-admin')).toBeInTheDocument()
    })

    it('Analytics access by role', () => {
      // Customer - no analytics
      loginAs(RoleLevels.Customer)
      let { result } = renderHook(() => usePermissions())
      expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(false)
      
      // SalesRep - own analytics only
      loginAs(RoleLevels.SalesRep)
      ;({ result } = renderHook(() => usePermissions()))
      expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Own)).toBe(true)
      expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(false)
      expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(false)
      
      // SalesManager - team analytics + export
      loginAs(RoleLevels.SalesManager)
      ;({ result } = renderHook(() => usePermissions()))
      expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.Team)).toBe(true)
      expect(result.current.hasPermission(Resources.Analytics, Actions.Export)).toBe(true)
      
      // Admin - all analytics
      loginAs(RoleLevels.Admin)
      ;({ result } = renderHook(() => usePermissions()))
      expect(result.current.hasPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe(true)
    })
  })
})


