/**
 * RBAC Type Definitions
 *
 * Shared type definitions for RBAC management features.
 *
 * @module app/rbac/_components/rbac-types
 */

/** Available tab identifiers for RBAC management page */
export type RBACTabId = 'hierarchy' | 'matrix' | 'audit' | 'users'

/** Tab configuration interface */
export interface RBACTab {
	id: RBACTabId
	label: string
	/** If true, only visible to admins */
	adminOnly?: boolean
}