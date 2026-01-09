/**
 * Accounts Route Components - Barrel Export
 *
 * Private folder exports for co-located account management components.
 * Following Next.js project structure conventions.
 *
 * **Architecture:**
 * - Route-specific components (AccountsDataGrid, RoleChangeModal) stay here
 * - Shared components (PasswordResetModal, UserInfoDisplay) are re-exported from @_features/accounts
 * - This prevents circular dependencies and follows proper separation of concerns
 *
 * @module app/accounts/_components
 */

// Main data grid component (route-specific)
export { default as AccountsDataGrid } from './AccountsDataGrid'

// Role management components (route-specific)
export { default as RoleChangeModal } from './RoleChangeModal'
export { default as RoleSelector } from './RoleSelector'

// Re-export shared components from @_features/accounts (single source of truth)
export { 
	PasswordResetModal, 
	UserInfoDisplay,
	type PasswordResetModalProps,
	type UserInfoDisplayProps,
} from '@_features/accounts'

// Types
export type { RoleSelectorProps } from './RoleSelector'
