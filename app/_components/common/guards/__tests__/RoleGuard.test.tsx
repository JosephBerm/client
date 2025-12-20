/**
 * RoleGuard Component Unit Tests
 * 
 * MAANG-Level: Comprehensive role-based UI guard testing.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY LAYER
 * 
 * This component controls what users see based on role hierarchy.
 * A bug here could expose admin-only UI to unauthorized users.
 * 
 * **Testing Strategy:**
 * 1. Role hierarchy enforcement
 * 2. Minimum role checks
 * 3. Fallback content rendering
 * 4. All role level combinations
 * 5. Edge cases and security scenarios
 * 
 * @module RBAC/RoleGuard.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard, RoleLevels } from '../RoleGuard'
import * as usePermissionsModule from '@_shared/hooks/usePermissions'
import type { RoleLevel } from '@_types/rbac'

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
// TEST HELPERS
// ============================================================================

function mockUsePermissions(userRoleLevel: RoleLevel | undefined) {
  ;(usePermissionsModule.usePermissions as any).mockReturnValue({
    hasMinimumRole: (minimumRole: RoleLevel) => {
      if (userRoleLevel === undefined) return false
      return userRoleLevel >= minimumRole
    },
    roleLevel: userRoleLevel,
    user: userRoleLevel !== undefined ? { id: 1 } : null,
    isAuthenticated: userRoleLevel !== undefined,
    isAdmin: userRoleLevel !== undefined && userRoleLevel >= RoleLevels.Admin,
  })
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('RoleGuard Component', () => {
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
    it('should render children when user meets minimum role', () => {
      mockUsePermissions(RoleLevels.Admin)

      render(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="admin-content">Admin Only Content</div>
        </RoleGuard>
      )

      expect(screen.getByTestId('admin-content')).toBeInTheDocument()
      expect(screen.getByText('Admin Only Content')).toBeInTheDocument()
    })

    it('should NOT render children when user does not meet minimum role', () => {
      mockUsePermissions(RoleLevels.Customer)

      render(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="admin-content">Admin Only Content</div>
        </RoleGuard>
      )

      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    })

    it('should render fallback when user does not meet minimum role', () => {
      mockUsePermissions(RoleLevels.Customer)

      render(
        <RoleGuard 
          minimumRole={RoleLevels.Admin}
          fallback={<div data-testid="fallback">Access Denied</div>}
        >
          <div data-testid="admin-content">Admin Only Content</div>
        </RoleGuard>
      )

      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('fallback')).toBeInTheDocument()
    })

    it('should render nothing when user does not meet role and no fallback', () => {
      mockUsePermissions(RoleLevels.Customer)

      const { container } = render(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="admin-content">Admin Only Content</div>
        </RoleGuard>
      )

      expect(container.firstChild).toBeNull()
    })
  })

  // ==========================================================================
  // ROLE HIERARCHY TESTS
  // ==========================================================================

  describe('Role Hierarchy', () => {
    describe('Admin (9999999)', () => {
      beforeEach(() => {
        mockUsePermissions(RoleLevels.Admin)
      })

      it('should access Admin-only content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access FulfillmentCoordinator content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.FulfillmentCoordinator}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access SalesManager content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access SalesRep content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access Customer content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Customer}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    describe('FulfillmentCoordinator (300)', () => {
      beforeEach(() => {
        mockUsePermissions(RoleLevels.FulfillmentCoordinator)
      })

      it('should NOT access Admin-only content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should access FulfillmentCoordinator content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.FulfillmentCoordinator}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should NOT access SalesManager content (50 < 200 per corrected hierarchy)', () => {
        // Per PRD: FulfillmentCoordinator (50) is BELOW SalesManager (200)
        render(
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should NOT access SalesRep content (50 < 100 per corrected hierarchy)', () => {
        // Per PRD: FulfillmentCoordinator (50) is BELOW SalesRep (100)
        render(
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should access Customer content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Customer}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    describe('SalesManager (200)', () => {
      beforeEach(() => {
        mockUsePermissions(RoleLevels.SalesManager)
      })

      it('should NOT access Admin-only content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should access FulfillmentCoordinator content (200 > 50 per corrected hierarchy)', () => {
        // Per PRD: SalesManager (200) is ABOVE FulfillmentCoordinator (50)
        render(
          <RoleGuard minimumRole={RoleLevels.FulfillmentCoordinator}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access SalesManager content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access SalesRep content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access Customer content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Customer}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    describe('SalesRep (100)', () => {
      beforeEach(() => {
        mockUsePermissions(RoleLevels.SalesRep)
      })

      it('should NOT access Admin-only content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should NOT access SalesManager content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should access SalesRep content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      it('should access Customer content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Customer}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    describe('Customer (0)', () => {
      beforeEach(() => {
        mockUsePermissions(RoleLevels.Customer)
      })

      it('should NOT access Admin-only content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should NOT access SalesManager content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should NOT access SalesRep content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
      })

      it('should access Customer content', () => {
        render(
          <RoleGuard minimumRole={RoleLevels.Customer}>
            <div data-testid="content">Content</div>
          </RoleGuard>
        )
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })

    describe('Unauthenticated User', () => {
      beforeEach(() => {
        mockUsePermissions(undefined)
      })

      it('should NOT access any role-guarded content', () => {
        const roles = [
          RoleLevels.Customer,
          RoleLevels.SalesRep,
          RoleLevels.SalesManager,
          RoleLevels.FulfillmentCoordinator,
          RoleLevels.Admin,
        ]

        for (const role of roles) {
          const { container } = render(
            <RoleGuard minimumRole={role}>
              <div data-testid="content">Content</div>
            </RoleGuard>
          )
          expect(screen.queryByTestId('content')).not.toBeInTheDocument()
          container.remove()
        }
      })

      it('should render fallback for unauthenticated user', () => {
        render(
          <RoleGuard 
            minimumRole={RoleLevels.Customer}
            fallback={<div data-testid="login-prompt">Please log in</div>}
          >
            <div data-testid="content">Content</div>
          </RoleGuard>
        )

        expect(screen.queryByTestId('content')).not.toBeInTheDocument()
        expect(screen.getByTestId('login-prompt')).toBeInTheDocument()
      })
    })
  })

  // ==========================================================================
  // NESTED GUARDS TESTS
  // ==========================================================================

  describe('Nested Role Guards', () => {
    it('should handle nested guards with different role requirements', () => {
      mockUsePermissions(RoleLevels.SalesManager)

      render(
        <RoleGuard minimumRole={RoleLevels.SalesRep}>
          <div data-testid="salesrep-section">
            SalesRep Section
            <RoleGuard minimumRole={RoleLevels.SalesManager}>
              <button data-testid="manager-action">Manager Action</button>
            </RoleGuard>
            <RoleGuard minimumRole={RoleLevels.Admin}>
              <button data-testid="admin-action">Admin Action</button>
            </RoleGuard>
          </div>
        </RoleGuard>
      )

      expect(screen.getByTestId('salesrep-section')).toBeInTheDocument()
      expect(screen.getByTestId('manager-action')).toBeInTheDocument()
      expect(screen.queryByTestId('admin-action')).not.toBeInTheDocument()
    })

    it('should not render inner content if outer guard fails', () => {
      mockUsePermissions(RoleLevels.Customer)

      render(
        <RoleGuard minimumRole={RoleLevels.SalesRep}>
          <div data-testid="salesrep-section">
            SalesRep Section
            <RoleGuard minimumRole={RoleLevels.Customer}>
              <div data-testid="customer-content">Customer Content</div>
            </RoleGuard>
          </div>
        </RoleGuard>
      )

      // Outer guard fails, so nothing renders
      expect(screen.queryByTestId('salesrep-section')).not.toBeInTheDocument()
      expect(screen.queryByTestId('customer-content')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // COMPLEX FALLBACK TESTS
  // ==========================================================================

  describe('Complex Fallback Scenarios', () => {
    it('should render component fallback', () => {
      mockUsePermissions(RoleLevels.Customer)

      const UpgradePrompt = () => (
        <div data-testid="upgrade-prompt">
          <h2>Upgrade Required</h2>
          <p>Please contact admin for access</p>
        </div>
      )

      render(
        <RoleGuard 
          minimumRole={RoleLevels.Admin}
          fallback={<UpgradePrompt />}
        >
          <div>Admin Content</div>
        </RoleGuard>
      )

      expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument()
      expect(screen.getByText('Please contact admin for access')).toBeInTheDocument()
    })

    it('should render different fallbacks for different sections', () => {
      mockUsePermissions(RoleLevels.Customer)

      render(
        <>
          <RoleGuard 
            minimumRole={RoleLevels.SalesRep}
            fallback={<div data-testid="salesrep-fallback">Sales features locked</div>}
          >
            <div>Sales Content</div>
          </RoleGuard>
          <RoleGuard 
            minimumRole={RoleLevels.Admin}
            fallback={<div data-testid="admin-fallback">Admin features locked</div>}
          >
            <div>Admin Content</div>
          </RoleGuard>
        </>
      )

      expect(screen.getByTestId('salesrep-fallback')).toBeInTheDocument()
      expect(screen.getByTestId('admin-fallback')).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // EDGE CASES AND SECURITY
  // ==========================================================================

  describe('Edge Cases and Security', () => {
    it('should handle role level 0 (below Customer) correctly', () => {
      // Role level 0 is below Customer (100) in PRD hierarchy
      mockUsePermissions(0 as RoleLevel)

      render(
        <RoleGuard 
          minimumRole={RoleLevels.Customer}
          fallback={<div data-testid="customer-fallback">Access Denied</div>}
        >
          <div data-testid="customer-content">Customer Content</div>
        </RoleGuard>
      )

      // Role 0 is below Customer (100), so should show fallback
      expect(screen.queryByTestId('customer-content')).not.toBeInTheDocument()
      expect(screen.getByTestId('customer-fallback')).toBeInTheDocument()
    })

    it('should handle role level between defined roles', () => {
      // Role 350 is between SalesRep (300) and SalesManager (400) per PRD hierarchy
      mockUsePermissions(350 as RoleLevel)

      render(
        <>
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <div data-testid="salesrep-content">SalesRep Content</div>
          </RoleGuard>
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <div data-testid="manager-content">Manager Content</div>
          </RoleGuard>
        </>
      )

      expect(screen.getByTestId('salesrep-content')).toBeInTheDocument()
      expect(screen.queryByTestId('manager-content')).not.toBeInTheDocument()
    })

    it('should handle extremely high role level', () => {
      mockUsePermissions(Number.MAX_SAFE_INTEGER as RoleLevel)

      render(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="admin-content">Admin Content</div>
        </RoleGuard>
      )

      expect(screen.getByTestId('admin-content')).toBeInTheDocument()
    })

    it('should not render content briefly before role check', () => {
      mockUsePermissions(RoleLevels.Customer)

      const { container } = render(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="admin-content">Sensitive Admin Content</div>
        </RoleGuard>
      )

      // Content should never appear in DOM
      expect(container.innerHTML).not.toContain('Sensitive Admin Content')
    })

    it('should handle rapid role changes', () => {
      mockUsePermissions(RoleLevels.Admin)

      const { rerender } = render(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="admin-content">Admin Content</div>
        </RoleGuard>
      )

      expect(screen.getByTestId('admin-content')).toBeInTheDocument()

      // Simulate role downgrade
      mockUsePermissions(RoleLevels.Customer)
      
      rerender(
        <RoleGuard minimumRole={RoleLevels.Admin}>
          <div data-testid="admin-content">Admin Content</div>
        </RoleGuard>
      )

      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // COMPREHENSIVE ROLE MATRIX TEST
  // ==========================================================================

  describe('Complete Role Matrix', () => {
    /**
     * This test validates the ENTIRE role hierarchy.
     * Critical for ensuring no unauthorized access.
     */
    const roleHierarchy = [
      RoleLevels.Customer,       // 0
      RoleLevels.SalesRep,       // 100
      RoleLevels.SalesManager,   // 200
      RoleLevels.FulfillmentCoordinator, // 300
      RoleLevels.Admin,          // 9999999
    ]

    it('should enforce complete role hierarchy', () => {
      for (let i = 0; i < roleHierarchy.length; i++) {
        const userRole = roleHierarchy[i]
        mockUsePermissions(userRole)

        for (let j = 0; j < roleHierarchy.length; j++) {
          const requiredRole = roleHierarchy[j]
          
          const { container } = render(
            <RoleGuard minimumRole={requiredRole}>
              <div data-testid="content">Content</div>
            </RoleGuard>
          )

          const shouldHaveAccess = userRole >= requiredRole
          
          if (shouldHaveAccess) {
            expect(
              screen.queryByTestId('content'),
              `User role ${userRole} should access content requiring role ${requiredRole}`
            ).toBeInTheDocument()
          } else {
            expect(
              screen.queryByTestId('content'),
              `User role ${userRole} should NOT access content requiring role ${requiredRole}`
            ).not.toBeInTheDocument()
          }

          container.remove()
        }
      }
    })
  })

  // ==========================================================================
  // REAL-WORLD SCENARIO TESTS
  // ==========================================================================

  describe('Real-World Scenarios', () => {
    it('should protect admin dashboard', () => {
      mockUsePermissions(RoleLevels.SalesManager)

      render(
        <div>
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <section data-testid="admin-dashboard">
              <h1>Admin Dashboard</h1>
              <button>Delete All Users</button>
              <button>System Settings</button>
            </section>
          </RoleGuard>
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <section data-testid="manager-dashboard">
              <h1>Manager Dashboard</h1>
              <button>Approve Quotes</button>
            </section>
          </RoleGuard>
        </div>
      )

      expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument()
      expect(screen.getByTestId('manager-dashboard')).toBeInTheDocument()
    })

    it('should show appropriate navigation for each role', () => {
      mockUsePermissions(RoleLevels.SalesRep)

      render(
        <nav>
          <RoleGuard minimumRole={RoleLevels.Customer}>
            <a data-testid="nav-store">Store</a>
          </RoleGuard>
          <RoleGuard minimumRole={RoleLevels.SalesRep}>
            <a data-testid="nav-quotes">Manage Quotes</a>
          </RoleGuard>
          <RoleGuard minimumRole={RoleLevels.SalesManager}>
            <a data-testid="nav-analytics">Analytics</a>
          </RoleGuard>
          <RoleGuard minimumRole={RoleLevels.Admin}>
            <a data-testid="nav-settings">System Settings</a>
          </RoleGuard>
        </nav>
      )

      expect(screen.getByTestId('nav-store')).toBeInTheDocument()
      expect(screen.getByTestId('nav-quotes')).toBeInTheDocument()
      expect(screen.queryByTestId('nav-analytics')).not.toBeInTheDocument()
      expect(screen.queryByTestId('nav-settings')).not.toBeInTheDocument()
    })
  })
})


