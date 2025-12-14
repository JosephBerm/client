/**
 * Permission and Role Guards
 * 
 * Export all guard components for easy importing.
 * 
 * @example
 * ```tsx
 * import { PermissionGuard, RoleGuard, Resources, Actions, RoleLevels } from '@_components/common/guards'
 * 
 * <PermissionGuard resource={Resources.Quotes} action={Actions.Delete}>
 *   <DeleteButton />
 * </PermissionGuard>
 * 
 * <RoleGuard minimumRole={RoleLevels.Admin}>
 *   <AdminPanel />
 * </RoleGuard>
 * ```
 */

export { PermissionGuard, Resources, Actions, Contexts } from './PermissionGuard'
export { RoleGuard, RoleLevels } from './RoleGuard'

