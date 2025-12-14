/**
 * Accounts Feature - Main Barrel Export (Optimized for Tree-Shaking)
 * 
 * Account management functionality including detail pages, role management,
 * and account administration.
 * Client-only (hooks with 'use client' directive).
 * 
 * @example
 * ```typescript
 * import { useAccountDetailLogic, type AccountActivitySummary } from '@_features/accounts'
 * import { AccountProfileTab, AccountSecurityTab, AccountActivityTab } from '@_features/accounts'
 * ```
 * 
 * @module accounts
 */

// ============================================================================
// HOOKS (Client-Only - all have 'use client')
// ============================================================================

export {
	useAccountDetailLogic,
	type UseAccountDetailLogicReturn,
	type AccountActivitySummary,
	type AccountActivityData,
	type AccountTab,
} from './hooks'

// ============================================================================
// COMPONENTS (Client-Only - all have 'use client')
// ============================================================================

export {
	// Tab Components
	AccountProfileTab,
	AccountSecurityTab,
	AccountActivityTab,
	AccountDetailSkeleton,
	type AccountProfileTabProps,
	type AccountSecurityTabProps,
	type AccountActivityTabProps,
	
	// Shared Modal Components
	PasswordResetModal,
	UserInfoDisplay,
	type PasswordResetModalProps,
	type UserInfoDisplayProps,
	
	// Admin Account Management
	AdminCreateAccountForm,
	type AdminCreateAccountFormProps,
} from './components'
