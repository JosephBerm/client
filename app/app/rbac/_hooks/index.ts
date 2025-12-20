/**
 * RBAC Hooks Index
 *
 * Centralized exports for all RBAC management hooks.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * HOOK OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * | Hook              | Purpose                           | Auto-fetch |
 * |-------------------|-----------------------------------|------------|
 * | useCRUDEntity     | Generic CRUD with entity state    | ✅ Yes     |
 * | useRoles          | Role management (uses useCRUDEntity) | ✅ Yes  |
 * | usePermissionsData| Permission management             | ✅ Yes     |
 * | useRolePermissions| Role-permission assignments       | ❌ No      |
 *
 * Note: useRBACManagement is in _components/hooks for co-location with page.
 *
 * @see useCRUDEntity - For architecture notes on state management
 * @module RBAC Hooks
 */

export { useCRUDEntity } from './useCRUDEntity'
export { useRoles } from './useRoles'
export { usePermissionsData } from './usePermissions'
export { useRolePermissions } from './useRolePermissions'
