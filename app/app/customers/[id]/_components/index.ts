/**
 * Customer Detail Page Components
 * 
 * Barrel export for customer detail page components.
 * Follows modular architecture pattern from orders feature.
 * 
 * **Components:**
 * - CustomerOverviewCard: Profile overview with badges and contact
 * - CustomerQuickActions: Navigation action buttons
 * - CustomerAccountsSection: Linked accounts DataGrid
 * - CustomerFormSection: Form wrapper with card styling
 * - CustomerDetailSkeleton: Loading state placeholder
 * 
 * **Hooks:**
 * - useCustomerDetails: Data fetching and state management
 * - useCustomerPermissions: RBAC logic
 * 
 * @example
 * ```tsx
 * import {
 *   CustomerOverviewCard,
 *   CustomerQuickActions,
 *   useCustomerDetails,
 *   useCustomerPermissions,
 * } from './_components'
 * ```
 * 
 * @module customers/[id]/components
 */

// Components
export { CustomerOverviewCard } from './CustomerOverviewCard'
export { CustomerQuickActions } from './CustomerQuickActions'
export { CustomerAccountsSection } from './CustomerAccountsSection'
export { CustomerFormSection } from './CustomerFormSection'
export { CustomerDetailSkeleton } from './CustomerDetailSkeleton'

// Hooks
export { useCustomerDetails, useCustomerPermissions } from './hooks'

