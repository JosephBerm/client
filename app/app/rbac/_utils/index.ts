/**
 * RBAC Utils Index
 * 
 * Centralized exports for all RBAC utility functions.
 * 
 * @module RBAC Utils
 */

export {
	formatPermissionString,
	groupPermissionsByResource,
	formatPermissionDisplay,
} from './permissionUtils'

export {
	confirmAction,
	confirmDelete,
} from './confirmationUtils'

export {
	toggleArrayItem,
} from './arrayUtils'
