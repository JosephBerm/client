/**
 * Account Feature Components - Barrel Export
 * 
 * @module features/accounts/components
 */

// Tab Components (Account Detail Page)
export { default as AccountProfileTab } from './AccountProfileTab'
export type { AccountProfileTabProps } from './AccountProfileTab'

export { default as AccountSecurityTab } from './AccountSecurityTab'
export type { AccountSecurityTabProps } from './AccountSecurityTab'

export { default as AccountActivityTab } from './AccountActivityTab'
export type { AccountActivityTabProps } from './AccountActivityTab'

export { default as AccountDetailSkeleton } from './AccountDetailSkeleton'

// Shared Modal Components (used by both feature and route-level components)
export { default as PasswordResetModal } from './PasswordResetModal'
export type { PasswordResetModalProps } from './PasswordResetModal'

export { default as UserInfoDisplay } from './UserInfoDisplay'
export type { UserInfoDisplayProps } from './UserInfoDisplay'

// Admin Account Creation
export { default as AdminCreateAccountForm } from './AdminCreateAccountForm'
export type { AdminCreateAccountFormProps } from './AdminCreateAccountForm'

// Role Selection (MAANG-level with permission preview)
export { default as RoleSelectionCard } from './RoleSelectionCard'
export type { RoleSelectionCardProps } from './RoleSelectionCard'
