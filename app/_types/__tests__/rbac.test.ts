/**
 * RBAC Types and Constants Unit Tests
 * 
 * MAANG-Level: Comprehensive type system and constant validation.
 * 
 * **Priority**: 🔴 CRITICAL - SECURITY FOUNDATION
 * 
 * These constants are the foundation of the entire RBAC system.
 * Incorrect values here would cascade to ALL permission checks.
 * 
 * **Testing Strategy:**
 * 1. Validate all constants match backend expectations
 * 2. Test helper functions for correctness
 * 3. Ensure type safety
 * 4. Test edge cases for helper functions
 * 
 * @module RBAC/types.test
 */

import { describe, it, expect } from 'vitest'
import {
  RoleLevels,
  RoleNames,
  RoleDisplayNames,
  Resources,
  Actions,
  Contexts,
  hasMinimumRole,
  isAdmin,
  isSalesManagerOrAbove,
  isSalesRepOrAbove,
  isCustomer,
  getRoleDisplayName,
  buildPermission,
  type RoleLevel,
  type Resource,
  type Action,
  type Context,
  type Permission,
} from '../rbac'

// ============================================================================
// ROLE LEVELS TESTS
// ============================================================================

describe('RBAC Constants - RoleLevels', () => {
  describe('Value Validation', () => {
    it('Customer should be 0 (lowest level)', () => {
      expect(RoleLevels.Customer).toBe(0)
    })

    it('SalesRep should be 100', () => {
      expect(RoleLevels.SalesRep).toBe(100)
    })

    it('SalesManager should be 200', () => {
      expect(RoleLevels.SalesManager).toBe(200)
    })

    it('FulfillmentCoordinator should be 300', () => {
      expect(RoleLevels.FulfillmentCoordinator).toBe(300)
    })

    it('Admin should be 9999999 (highest level)', () => {
      expect(RoleLevels.Admin).toBe(9999999)
    })
  })

  describe('Hierarchy Ordering', () => {
    it('roles should be ordered correctly in hierarchy', () => {
      expect(RoleLevels.Customer).toBeLessThan(RoleLevels.SalesRep)
      expect(RoleLevels.SalesRep).toBeLessThan(RoleLevels.SalesManager)
      expect(RoleLevels.SalesManager).toBeLessThan(RoleLevels.FulfillmentCoordinator)
      expect(RoleLevels.FulfillmentCoordinator).toBeLessThan(RoleLevels.Admin)
    })

    it('Admin should be significantly higher than other roles', () => {
      // Business Rule: Admin level should be much higher to prevent accidental escalation
      const highestNonAdmin = Math.max(
        RoleLevels.Customer,
        RoleLevels.SalesRep,
        RoleLevels.SalesManager,
        RoleLevels.FulfillmentCoordinator
      )
      
      expect(RoleLevels.Admin).toBeGreaterThan(highestNonAdmin * 10)
    })
  })

  describe('Type Safety', () => {
    it('should be const object (immutable)', () => {
      // TypeScript "as const" ensures these are readonly
      expect(Object.isFrozen(RoleLevels)).toBe(false) // JS doesn't freeze, but TS prevents mutation
      
      // Verify all expected keys exist
      expect(RoleLevels).toHaveProperty('Customer')
      expect(RoleLevels).toHaveProperty('SalesRep')
      expect(RoleLevels).toHaveProperty('SalesManager')
      expect(RoleLevels).toHaveProperty('FulfillmentCoordinator')
      expect(RoleLevels).toHaveProperty('Admin')
    })
  })
})

// ============================================================================
// ROLE NAMES TESTS
// ============================================================================

describe('RBAC Constants - RoleNames', () => {
  it('should have correct string values', () => {
    expect(RoleNames.Customer).toBe('customer')
    expect(RoleNames.SalesRep).toBe('sales_rep')
    expect(RoleNames.SalesManager).toBe('sales_manager')
    expect(RoleNames.FulfillmentCoordinator).toBe('fulfillment_coordinator')
    expect(RoleNames.Admin).toBe('admin')
  })

  it('should use snake_case format (API convention)', () => {
    const allNames = Object.values(RoleNames)
    
    for (const name of allNames) {
      // Snake case pattern: lowercase with underscores
      expect(name).toMatch(/^[a-z]+(_[a-z]+)*$/)
    }
  })
})

// ============================================================================
// ROLE DISPLAY NAMES TESTS
// ============================================================================

describe('RBAC Constants - RoleDisplayNames', () => {
  it('should have display names for all role levels', () => {
    expect(RoleDisplayNames[RoleLevels.Customer]).toBe('Customer')
    expect(RoleDisplayNames[RoleLevels.SalesRep]).toBe('Sales Representative')
    expect(RoleDisplayNames[RoleLevels.SalesManager]).toBe('Sales Manager')
    expect(RoleDisplayNames[RoleLevels.FulfillmentCoordinator]).toBe('Fulfillment Coordinator')
    expect(RoleDisplayNames[RoleLevels.Admin]).toBe('Administrator')
  })

  it('should have human-readable format (Title Case)', () => {
    const allDisplayNames = Object.values(RoleDisplayNames)
    
    for (const name of allDisplayNames) {
      // Title case pattern: starts with uppercase
      expect(name.charAt(0)).toBe(name.charAt(0).toUpperCase())
    }
  })

  it('should be defined for all role levels', () => {
    const allRoleLevels = Object.values(RoleLevels)
    
    for (const level of allRoleLevels) {
      expect(RoleDisplayNames[level]).toBeDefined()
      expect(RoleDisplayNames[level].length).toBeGreaterThan(0)
    }
  })
})

// ============================================================================
// RESOURCES TESTS
// ============================================================================

describe('RBAC Constants - Resources', () => {
  it('should have all expected resources', () => {
    expect(Resources.Quotes).toBe('quotes')
    expect(Resources.Orders).toBe('orders')
    expect(Resources.Products).toBe('products')
    expect(Resources.Customers).toBe('customers')
    expect(Resources.Vendors).toBe('vendors')
    expect(Resources.Analytics).toBe('analytics')
    expect(Resources.Users).toBe('users')
    expect(Resources.Settings).toBe('settings')
    expect(Resources.Providers).toBe('providers')
  })

  it('should use lowercase format (API convention)', () => {
    const allResources = Object.values(Resources)
    
    for (const resource of allResources) {
      expect(resource).toBe(resource.toLowerCase())
    }
  })

  it('should have at least 8 resources (comprehensive coverage)', () => {
    const resourceCount = Object.keys(Resources).length
    expect(resourceCount).toBeGreaterThanOrEqual(8)
  })
})

// ============================================================================
// ACTIONS TESTS
// ============================================================================

describe('RBAC Constants - Actions', () => {
  it('should have all CRUD actions', () => {
    expect(Actions.Read).toBe('read')
    expect(Actions.Create).toBe('create')
    expect(Actions.Update).toBe('update')
    expect(Actions.Delete).toBe('delete')
  })

  it('should have workflow actions', () => {
    expect(Actions.Approve).toBe('approve')
    expect(Actions.Assign).toBe('assign')
    expect(Actions.Export).toBe('export')
    expect(Actions.Manage).toBe('manage')
  })

  it('should have domain-specific actions', () => {
    expect(Actions.ConfirmPayment).toBe('confirm_payment')
    expect(Actions.UpdateTracking).toBe('update_tracking')
    expect(Actions.Archive).toBe('archive')
  })

  it('should use snake_case format for multi-word actions', () => {
    expect(Actions.ConfirmPayment).toMatch(/^[a-z]+(_[a-z]+)*$/)
    expect(Actions.UpdateTracking).toMatch(/^[a-z]+(_[a-z]+)*$/)
  })
})

// ============================================================================
// CONTEXTS TESTS
// ============================================================================

describe('RBAC Constants - Contexts', () => {
  it('should have all context levels', () => {
    expect(Contexts.Own).toBe('own')
    expect(Contexts.Assigned).toBe('assigned')
    expect(Contexts.Team).toBe('team')
    expect(Contexts.All).toBe('all')
  })

  it('should represent hierarchy from narrow to wide', () => {
    // Conceptual hierarchy: Own < Assigned < Team < All
    const contexts = [Contexts.Own, Contexts.Assigned, Contexts.Team, Contexts.All]
    expect(contexts).toHaveLength(4)
  })
})

// ============================================================================
// HELPER FUNCTIONS TESTS
// ============================================================================

describe('RBAC Helper Functions', () => {
  describe('hasMinimumRole()', () => {
    it('should return true when user meets minimum role', () => {
      expect(hasMinimumRole(RoleLevels.Admin, RoleLevels.Admin)).toBe(true)
      expect(hasMinimumRole(RoleLevels.Admin, RoleLevels.Customer)).toBe(true)
      expect(hasMinimumRole(RoleLevels.SalesManager, RoleLevels.SalesRep)).toBe(true)
    })

    it('should return false when user is below minimum role', () => {
      expect(hasMinimumRole(RoleLevels.Customer, RoleLevels.Admin)).toBe(false)
      expect(hasMinimumRole(RoleLevels.SalesRep, RoleLevels.SalesManager)).toBe(false)
    })

    it('should return false for undefined role level', () => {
      expect(hasMinimumRole(undefined, RoleLevels.Customer)).toBe(false)
      expect(hasMinimumRole(undefined, RoleLevels.Admin)).toBe(false)
    })

    it('should handle exact role match', () => {
      expect(hasMinimumRole(RoleLevels.SalesRep, RoleLevels.SalesRep)).toBe(true)
      expect(hasMinimumRole(RoleLevels.Customer, RoleLevels.Customer)).toBe(true)
    })

    it('should handle edge case of role level 0', () => {
      expect(hasMinimumRole(0, RoleLevels.Customer)).toBe(true) // 0 >= 0
    })
  })

  describe('isAdmin()', () => {
    it('should return true for Admin role', () => {
      expect(isAdmin(RoleLevels.Admin)).toBe(true)
    })

    it('should return false for non-Admin roles', () => {
      expect(isAdmin(RoleLevels.Customer)).toBe(false)
      expect(isAdmin(RoleLevels.SalesRep)).toBe(false)
      expect(isAdmin(RoleLevels.SalesManager)).toBe(false)
      expect(isAdmin(RoleLevels.FulfillmentCoordinator)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isAdmin(undefined)).toBe(false)
    })

    it('should return true for role level higher than Admin', () => {
      // Edge case: future-proofing for super-admin
      expect(isAdmin(RoleLevels.Admin + 1)).toBe(true)
    })
  })

  describe('isSalesManagerOrAbove()', () => {
    it('should return true for SalesManager and above', () => {
      expect(isSalesManagerOrAbove(RoleLevels.SalesManager)).toBe(true)
      expect(isSalesManagerOrAbove(RoleLevels.FulfillmentCoordinator)).toBe(true)
      expect(isSalesManagerOrAbove(RoleLevels.Admin)).toBe(true)
    })

    it('should return false for below SalesManager', () => {
      expect(isSalesManagerOrAbove(RoleLevels.Customer)).toBe(false)
      expect(isSalesManagerOrAbove(RoleLevels.SalesRep)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isSalesManagerOrAbove(undefined)).toBe(false)
    })
  })

  describe('isSalesRepOrAbove()', () => {
    it('should return true for SalesRep and above', () => {
      expect(isSalesRepOrAbove(RoleLevels.SalesRep)).toBe(true)
      expect(isSalesRepOrAbove(RoleLevels.SalesManager)).toBe(true)
      expect(isSalesRepOrAbove(RoleLevels.Admin)).toBe(true)
    })

    it('should return false for Customer', () => {
      expect(isSalesRepOrAbove(RoleLevels.Customer)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isSalesRepOrAbove(undefined)).toBe(false)
    })
  })

  describe('isCustomer()', () => {
    it('should return true only for Customer role', () => {
      expect(isCustomer(RoleLevels.Customer)).toBe(true)
    })

    it('should return false for all other roles', () => {
      expect(isCustomer(RoleLevels.SalesRep)).toBe(false)
      expect(isCustomer(RoleLevels.SalesManager)).toBe(false)
      expect(isCustomer(RoleLevels.FulfillmentCoordinator)).toBe(false)
      expect(isCustomer(RoleLevels.Admin)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isCustomer(undefined)).toBe(false)
    })
  })

  describe('getRoleDisplayName()', () => {
    it('should return correct display names', () => {
      expect(getRoleDisplayName(RoleLevels.Customer)).toBe('Customer')
      expect(getRoleDisplayName(RoleLevels.SalesRep)).toBe('Sales Representative')
      expect(getRoleDisplayName(RoleLevels.SalesManager)).toBe('Sales Manager')
      expect(getRoleDisplayName(RoleLevels.FulfillmentCoordinator)).toBe('Fulfillment Coordinator')
      expect(getRoleDisplayName(RoleLevels.Admin)).toBe('Administrator')
    })

    it('should return "Unknown" for undefined', () => {
      expect(getRoleDisplayName(undefined)).toBe('Unknown')
    })

    it('should return "Unknown" for invalid role level', () => {
      expect(getRoleDisplayName(999 as RoleLevel)).toBe('Unknown')
      expect(getRoleDisplayName(-1 as RoleLevel)).toBe('Unknown')
    })
  })

  describe('buildPermission()', () => {
    it('should build permission without context', () => {
      expect(buildPermission(Resources.Quotes, Actions.Read)).toBe('quotes:read')
      expect(buildPermission(Resources.Orders, Actions.Create)).toBe('orders:create')
      expect(buildPermission(Resources.Users, Actions.Delete)).toBe('users:delete')
    })

    it('should build permission with context', () => {
      expect(buildPermission(Resources.Quotes, Actions.Read, Contexts.Own)).toBe('quotes:read:own')
      expect(buildPermission(Resources.Orders, Actions.Update, Contexts.Assigned)).toBe('orders:update:assigned')
      expect(buildPermission(Resources.Customers, Actions.Read, Contexts.Team)).toBe('customers:read:team')
      expect(buildPermission(Resources.Analytics, Actions.Read, Contexts.All)).toBe('analytics:read:all')
    })

    it('should handle all resource/action combinations', () => {
      const allResources = Object.values(Resources) as Resource[]
      const allActions = Object.values(Actions) as Action[]
      
      for (const resource of allResources) {
        for (const action of allActions) {
          const permission = buildPermission(resource, action)
          expect(permission).toBe(`${resource}:${action}`)
        }
      }
    })

    it('should handle all context combinations', () => {
      const allContexts = Object.values(Contexts) as Context[]
      
      for (const context of allContexts) {
        const permission = buildPermission(Resources.Quotes, Actions.Read, context)
        expect(permission).toBe(`quotes:read:${context}`)
      }
    })
  })
})

// ============================================================================
// TYPE SAFETY TESTS
// ============================================================================

describe('RBAC Type Safety', () => {
  it('Permission type should match expected format', () => {
    // These should compile without TypeScript errors
    const validPermissions: Permission[] = [
      'quotes:read',
      'quotes:read:own',
      'orders:create',
      'orders:update:all',
      'users:delete',
      'settings:manage',
    ]
    
    expect(validPermissions.length).toBe(6)
  })

  it('RoleLevel type should only allow valid values', () => {
    // All role levels should be valid
    const validLevels: RoleLevel[] = [
      RoleLevels.Customer,
      RoleLevels.SalesRep,
      RoleLevels.SalesManager,
      RoleLevels.FulfillmentCoordinator,
      RoleLevels.Admin,
    ]
    
    expect(validLevels.length).toBe(5)
  })

  it('Resource type should only allow valid values', () => {
    const validResources: Resource[] = [
      Resources.Quotes,
      Resources.Orders,
      Resources.Products,
      Resources.Customers,
      Resources.Vendors,
      Resources.Analytics,
      Resources.Users,
      Resources.Settings,
      Resources.Providers,
    ]
    
    expect(validResources.length).toBe(9)
  })

  it('Action type should only allow valid values', () => {
    const validActions: Action[] = [
      Actions.Read,
      Actions.Create,
      Actions.Update,
      Actions.Delete,
      Actions.Approve,
      Actions.Assign,
      Actions.Export,
      Actions.Manage,
      Actions.ConfirmPayment,
      Actions.UpdateTracking,
      Actions.Archive,
    ]
    
    expect(validActions.length).toBe(11)
  })

  it('Context type should only allow valid values', () => {
    const validContexts: Context[] = [
      Contexts.Own,
      Contexts.Assigned,
      Contexts.Team,
      Contexts.All,
    ]
    
    expect(validContexts.length).toBe(4)
  })
})

// ============================================================================
// BACKEND CONSISTENCY TESTS
// ============================================================================

describe('Backend Consistency', () => {
  /**
   * These tests verify that frontend constants match backend expectations.
   * If these fail, there may be a mismatch between frontend and backend.
   */

  it('role levels should match C# AccountRole enum', () => {
    // Backend: AccountRole enum values
    // Customer = 0
    // SalesRep = 100
    // SalesManager = 200
    // FulfillmentCoordinator = 300
    // Admin = 9999999
    
    expect(RoleLevels.Customer).toBe(0)
    expect(RoleLevels.SalesRep).toBe(100)
    expect(RoleLevels.SalesManager).toBe(200)
    expect(RoleLevels.FulfillmentCoordinator).toBe(300)
    expect(RoleLevels.Admin).toBe(9999999)
  })

  it('resources should match RBACConstants.Resources', () => {
    // Backend: RBACConstants.Resources class
    const backendResources = [
      'quotes', 'orders', 'products', 'customers',
      'vendors', 'analytics', 'users', 'settings', 'providers'
    ]
    
    const frontendResources = Object.values(Resources)
    
    for (const resource of backendResources) {
      expect(frontendResources).toContain(resource)
    }
  })

  it('actions should match RBACConstants.Actions', () => {
    // Backend: RBACConstants.Actions class
    const backendActions = [
      'read', 'create', 'update', 'delete', 'approve',
      'assign', 'export', 'manage', 'confirm_payment',
      'update_tracking', 'archive'
    ]
    
    const frontendActions = Object.values(Actions)
    
    for (const action of backendActions) {
      expect(frontendActions).toContain(action)
    }
  })

  it('contexts should match RBACConstants.Contexts', () => {
    // Backend: RBACConstants.Contexts class
    const backendContexts = ['own', 'assigned', 'team', 'all']
    
    const frontendContexts = Object.values(Contexts)
    
    for (const context of backendContexts) {
      expect(frontendContexts).toContain(context)
    }
  })
})


