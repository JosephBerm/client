/**
 * PermissionGuard Component Unit Tests
 * 
 * MAANG-Level: Comprehensive UI security guard testing.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY LAYER
 * 
 * This component controls what users see based on permissions.
 * A bug here could expose sensitive UI to unauthorized users.
 * 
 * **Testing Strategy:**
 * 1. Render/hide content based on permissions
 * 2. Fallback content rendering
 * 3. Context-aware permission checks
 * 4. All role levels
 * 5. Edge cases and security scenarios
 * 
 * @module RBAC/PermissionGuard.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PermissionGuard, Resources, Actions, Contexts } from '../PermissionGuard'
import * as usePermissionsModule from '@_shared/hooks/usePermissions'
import type { RoleLevel } from '@_types/rbac'
import { RoleLevels } from '@_types/rbac'

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock the usePermissions hook
vi.mock('@_shared/hooks/usePermissions', async () => {
  const actual = await vi.importActual('@_shared/hooks/usePermissions')
  return {
    ...actual,
    usePermissions: vi.fn(),
  }
})

// ============================================================================
// TEST HELPERS
// ============================================================================

interface MockPermissions {
  hasPermission: (resource: string, action: string, context?: string) => boolean
  isAdmin?: boolean
  roleLevel?: RoleLevel
}

function mockUsePermissions(permissions: MockPermissions) {
  ;(usePermissionsModule.usePermissions as any).mockReturnValue({
    hasPermission: permissions.hasPermission,
    isAdmin: permissions.isAdmin ?? false,
    roleLevel: permissions.roleLevel ?? RoleLevels.Customer,
    user: { id: 1 },
    isAuthenticated: true,
  })
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('PermissionGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // BASIC RENDERING TESTS
  // ==========================================================================

  describe('Basic Rendering', () => {
    it('should render children when user has permission', () => {
      mockUsePermissions({
        hasPermission: () => true,
      })

      render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Read}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should NOT render children when user lacks permission', () => {
      mockUsePermissions({
        hasPermission: () => false,
      })

      render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should render fallback when user lacks permission', () => {
      mockUsePermissions({
        hasPermission: () => false,
      })

      render(
        <PermissionGuard 
          resource={Resources.Quotes} 
          action={Actions.Delete}
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('fallback')).toBeInTheDocument()
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })

    it('should render nothing when user lacks permission and no fallback provided', () => {
      mockUsePermissions({
        hasPermission: () => false,
      })

      const { container } = render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
          <div data-testid="protected-content">Protected Content</div>
        </PermissionGuard>
      )

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
      expect(container.firstChild).toBeNull()
    })
  })

  // ==========================================================================
  // PERMISSION CHECK INTEGRATION
  // ==========================================================================

  describe('Permission Check Integration', () => {
    it('should call hasPermission with correct resource and action', () => {
      const mockHasPermission = vi.fn().mockReturnValue(true)
      mockUsePermissions({ hasPermission: mockHasPermission })

      render(
        <PermissionGuard resource={Resources.Orders} action={Actions.Create}>
          <div>Content</div>
        </PermissionGuard>
      )

      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.Orders,
        Actions.Create,
        undefined
      )
    })

    it('should call hasPermission with context when provided', () => {
      const mockHasPermission = vi.fn().mockReturnValue(true)
      mockUsePermissions({ hasPermission: mockHasPermission })

      render(
        <PermissionGuard 
          resource={Resources.Quotes} 
          action={Actions.Read}
          context={Contexts.Own}
        >
          <div>Content</div>
        </PermissionGuard>
      )

      expect(mockHasPermission).toHaveBeenCalledWith(
        Resources.Quotes,
        Actions.Read,
        Contexts.Own
      )
    })

    it('should pass all context values correctly', () => {
      const contexts = [Contexts.Own, Contexts.Assigned, Contexts.Team, Contexts.All]
      
      for (const context of contexts) {
        const mockHasPermission = vi.fn().mockReturnValue(true)
        mockUsePermissions({ hasPermission: mockHasPermission })

        render(
          <PermissionGuard 
            resource={Resources.Orders} 
            action={Actions.Update}
            context={context}
          >
            <div>Content</div>
          </PermissionGuard>
        )

        expect(mockHasPermission).toHaveBeenCalledWith(
          Resources.Orders,
          Actions.Update,
          context
        )

        vi.clearAllMocks()
      }
    })
  })

  // ==========================================================================
  // ROLE-SPECIFIC TESTS
  // ==========================================================================

  describe('Role-Specific Permission Tests', () => {
    it('Customer should see own quotes content', () => {
      mockUsePermissions({
        hasPermission: (resource, action, context) => {
          return resource === Resources.Quotes && 
                 action === Actions.Read && 
                 context === Contexts.Own
        },
        roleLevel: RoleLevels.Customer,
      })

      render(
        <PermissionGuard 
          resource={Resources.Quotes} 
          action={Actions.Read}
          context={Contexts.Own}
        >
          <div data-testid="own-quotes">My Quotes</div>
        </PermissionGuard>
      )

      expect(screen.getByTestId('own-quotes')).toBeInTheDocument()
    })

    it('Customer should NOT see delete button', () => {
      mockUsePermissions({
        hasPermission: (resource, action) => {
          // Customer cannot delete
          if (action === Actions.Delete) return false
          return true
        },
        roleLevel: RoleLevels.Customer,
      })

      render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
          <button data-testid="delete-btn">Delete</button>
        </PermissionGuard>
      )

      expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument()
    })

    it('Admin should see all protected content', () => {
      mockUsePermissions({
        hasPermission: () => true, // Admin has all permissions
        isAdmin: true,
        roleLevel: RoleLevels.Admin,
      })

      render(
        <>
          <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
            <button data-testid="delete-btn">Delete</button>
          </PermissionGuard>
          <PermissionGuard resource={Resources.Users} action={Actions.Delete}>
            <button data-testid="delete-user-btn">Delete User</button>
          </PermissionGuard>
          <PermissionGuard resource={Resources.Settings} action={Actions.Manage}>
            <button data-testid="manage-settings-btn">Manage Settings</button>
          </PermissionGuard>
        </>
      )

      expect(screen.getByTestId('delete-btn')).toBeInTheDocument()
      expect(screen.getByTestId('delete-user-btn')).toBeInTheDocument()
      expect(screen.getByTestId('manage-settings-btn')).toBeInTheDocument()
    })

    it('SalesRep should see assigned content but not all content', () => {
      mockUsePermissions({
        hasPermission: (resource, action, context) => {
          if (resource === Resources.Quotes) {
            if (context === Contexts.Assigned) return true
            if (context === Contexts.All) return false
          }
          return false
        },
        roleLevel: RoleLevels.SalesRep,
      })

      render(
        <>
          <PermissionGuard 
            resource={Resources.Quotes} 
            action={Actions.Read}
            context={Contexts.Assigned}
          >
            <div data-testid="assigned-quotes">Assigned Quotes</div>
          </PermissionGuard>
          <PermissionGuard 
            resource={Resources.Quotes} 
            action={Actions.Read}
            context={Contexts.All}
          >
            <div data-testid="all-quotes">All Quotes</div>
          </PermissionGuard>
        </>
      )

      expect(screen.getByTestId('assigned-quotes')).toBeInTheDocument()
      expect(screen.queryByTestId('all-quotes')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // NESTED GUARDS TESTS
  // ==========================================================================

  describe('Nested Permission Guards', () => {
    it('should handle nested guards correctly', () => {
      mockUsePermissions({
        hasPermission: (resource, action) => {
          if (resource === Resources.Quotes && action === Actions.Read) return true
          if (resource === Resources.Quotes && action === Actions.Update) return true
          if (resource === Resources.Quotes && action === Actions.Delete) return false
          return false
        },
      })

      render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Read}>
          <div data-testid="quote-section">
            Quote Details
            <PermissionGuard resource={Resources.Quotes} action={Actions.Update}>
              <button data-testid="edit-btn">Edit</button>
            </PermissionGuard>
            <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
              <button data-testid="delete-btn">Delete</button>
            </PermissionGuard>
          </div>
        </PermissionGuard>
      )

      expect(screen.getByTestId('quote-section')).toBeInTheDocument()
      expect(screen.getByTestId('edit-btn')).toBeInTheDocument()
      expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument()
    })

    it('should not render children if outer guard fails', () => {
      mockUsePermissions({
        hasPermission: (resource, action) => {
          if (resource === Resources.Quotes && action === Actions.Read) return false
          return true // Even if inner would pass
        },
      })

      render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Read}>
          <div data-testid="quote-section">
            Quote Details
            <PermissionGuard resource={Resources.Quotes} action={Actions.Update}>
              <button data-testid="edit-btn">Edit</button>
            </PermissionGuard>
          </div>
        </PermissionGuard>
      )

      expect(screen.queryByTestId('quote-section')).not.toBeInTheDocument()
      expect(screen.queryByTestId('edit-btn')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // COMPLEX FALLBACK TESTS
  // ==========================================================================

  describe('Complex Fallback Scenarios', () => {
    it('should render React component as fallback', () => {
      mockUsePermissions({ hasPermission: () => false })

      const AccessDeniedComponent = () => (
        <div data-testid="access-denied">
          <h2>Access Denied</h2>
          <p>You need higher privileges</p>
        </div>
      )

      render(
        <PermissionGuard 
          resource={Resources.Settings} 
          action={Actions.Manage}
          fallback={<AccessDeniedComponent />}
        >
          <div>Admin Settings</div>
        </PermissionGuard>
      )

      expect(screen.getByTestId('access-denied')).toBeInTheDocument()
      expect(screen.getByText('You need higher privileges')).toBeInTheDocument()
    })

    it('should render null fallback correctly', () => {
      mockUsePermissions({ hasPermission: () => false })

      const { container } = render(
        <PermissionGuard 
          resource={Resources.Settings} 
          action={Actions.Manage}
          fallback={null}
        >
          <div data-testid="protected">Protected</div>
        </PermissionGuard>
      )

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
      expect(container.innerHTML).toBe('')
    })

    it('should render text string as fallback', () => {
      mockUsePermissions({ hasPermission: () => false })

      render(
        <PermissionGuard 
          resource={Resources.Settings} 
          action={Actions.Manage}
          fallback="No access"
        >
          <div>Protected</div>
        </PermissionGuard>
      )

      expect(screen.getByText('No access')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // ALL RESOURCES AND ACTIONS TESTS
  // ==========================================================================

  describe('All Resources and Actions', () => {
    const allResources = Object.values(Resources)
    const allActions = Object.values(Actions)

    it.each(allResources)('should handle resource: %s', (resource) => {
      mockUsePermissions({ hasPermission: () => true })

      render(
        <PermissionGuard resource={resource} action={Actions.Read}>
          <div data-testid={`${resource}-content`}>Content for {resource}</div>
        </PermissionGuard>
      )

      expect(screen.getByTestId(`${resource}-content`)).toBeInTheDocument()
    })

    it.each(allActions)('should handle action: %s', (action) => {
      mockUsePermissions({ hasPermission: () => true })

      render(
        <PermissionGuard resource={Resources.Quotes} action={action}>
          <div data-testid={`${action}-content`}>Content for {action}</div>
        </PermissionGuard>
      )

      expect(screen.getByTestId(`${action}-content`)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // SECURITY EDGE CASES
  // ==========================================================================

  describe('Security Edge Cases', () => {
    it('should not render content when hasPermission throws', () => {
      mockUsePermissions({
        hasPermission: () => {
          throw new Error('Permission check failed')
        },
      })

      // Component should handle error gracefully
      expect(() => {
        render(
          <PermissionGuard resource={Resources.Quotes} action={Actions.Read}>
            <div data-testid="protected">Protected</div>
          </PermissionGuard>
        )
      }).toThrow() // Or handle gracefully depending on implementation
    })

    it('should default to not showing content when permission is undefined', () => {
      mockUsePermissions({
        hasPermission: () => undefined as any,
      })

      render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Read}>
          <div data-testid="protected">Protected</div>
        </PermissionGuard>
      )

      // Falsy value should result in not showing content
      expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
    })

    it('should handle rapid permission changes', async () => {
      const mockHasPermission = vi.fn().mockReturnValue(true)
      mockUsePermissions({ hasPermission: mockHasPermission })

      const { rerender } = render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Read}>
          <div data-testid="protected">Protected</div>
        </PermissionGuard>
      )

      expect(screen.getByTestId('protected')).toBeInTheDocument()

      // Change permission
      mockHasPermission.mockReturnValue(false)
      
      rerender(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Read}>
          <div data-testid="protected">Protected</div>
        </PermissionGuard>
      )

      expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
    })

    it('should not expose content briefly during permission check', () => {
      // This tests that content is not flashed before permission check completes
      mockUsePermissions({ hasPermission: () => false })

      const { container } = render(
        <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
          <div data-testid="protected">Sensitive Admin Content</div>
        </PermissionGuard>
      )

      // Content should never appear in DOM
      expect(container.innerHTML).not.toContain('Sensitive Admin Content')
    })
  })

  // ==========================================================================
  // INTEGRATION WITH ALL ROLE LEVELS
  // ==========================================================================

  describe('Integration - Complete Permission Matrix', () => {
    /**
     * Test that guards work correctly for the complete permission matrix.
     * This is a critical security test.
     */
    const testCases = [
      // [role, resource, action, context, shouldRender]
      [RoleLevels.Customer, Resources.Quotes, Actions.Read, Contexts.Own, true],
      [RoleLevels.Customer, Resources.Quotes, Actions.Delete, undefined, false],
      [RoleLevels.SalesRep, Resources.Quotes, Actions.Read, Contexts.Assigned, true],
      [RoleLevels.SalesRep, Resources.Quotes, Actions.Approve, undefined, false],
      [RoleLevels.SalesManager, Resources.Quotes, Actions.Approve, undefined, true],
      [RoleLevels.SalesManager, Resources.Quotes, Actions.Delete, undefined, false],
      [RoleLevels.Admin, Resources.Quotes, Actions.Delete, undefined, true],
      [RoleLevels.Admin, Resources.Settings, Actions.Manage, undefined, true],
    ] as const

    it.each(testCases)(
      'Role %i: %s:%s:%s should render=%s',
      (role, resource, action, context, shouldRender) => {
        mockUsePermissions({
          hasPermission: (r, a, c) => {
            // Simulate permission logic
            if (role === RoleLevels.Admin) return true
            
            if (role === RoleLevels.Customer) {
              return r === resource && a === action && c === context && shouldRender
            }
            
            if (role === RoleLevels.SalesRep) {
              if (a === Actions.Approve) return false
              return shouldRender
            }
            
            if (role === RoleLevels.SalesManager) {
              if (a === Actions.Delete) return false
              return shouldRender
            }
            
            return shouldRender
          },
          roleLevel: role,
          isAdmin: role === RoleLevels.Admin,
        })

        render(
          <PermissionGuard 
            resource={resource} 
            action={action}
            context={context}
          >
            <div data-testid="protected">Protected Content</div>
          </PermissionGuard>
        )

        if (shouldRender) {
          expect(screen.getByTestId('protected')).toBeInTheDocument()
        } else {
          expect(screen.queryByTestId('protected')).not.toBeInTheDocument()
        }
      }
    )
  })
})


