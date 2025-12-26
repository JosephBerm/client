/**
 * Customer Feature Module
 * 
 * Provides components, hooks, constants, and types for customer management.
 * 
 * **Components:**
 * - CustomerStatusBadge: Displays customer account status
 * - BusinessTypeBadge: Displays business type classification
 * - CustomerStatsCard: Shows customer statistics overview
 * 
 * **Hooks:**
 * - useCustomerStats: Fetches customer statistics
 * 
 * **Constants:**
 * - CUSTOMER_STATUS_CONFIG: Status display configuration
 * - BUSINESS_TYPE_CONFIG: Business type display configuration
 * - CUSTOMER_STATUS_OPTIONS: Status select options
 * - BUSINESS_TYPE_OPTIONS: Business type select options
 * 
 * **Types:**
 * - CustomerStats: Statistics data structure
 * - CustomerFilterOptions: Search filter options
 * - CustomerFormData: Form data structure
 * 
 * @module customers
 * 
 * @example
 * ```tsx
 * import {
 *   CustomerStatusBadge,
 *   BusinessTypeBadge,
 *   CustomerStatsCard,
 *   useCustomerStats,
 *   CUSTOMER_STATUS_OPTIONS,
 *   BUSINESS_TYPE_OPTIONS,
 * } from '@_features/customers'
 * 
 * function CustomerDetail({ customer }) {
 *   const { stats, isLoading } = useCustomerStats({ customerId: customer.id })
 *   
 *   return (
 *     <div>
 *       <CustomerStatusBadge status={customer.status} />
 *       <BusinessTypeBadge type={customer.typeOfBusiness} />
 *       <CustomerStatsCard stats={stats} isLoading={isLoading} />
 *     </div>
 *   )
 * }
 * ```
 */

// Components
export {
	AssignSalesRepModal,
	BusinessTypeBadge,
	CustomerDeleteModal,
	CustomerHistory,
	CustomerStatsCard,
	CustomerStatsGrid,
	CustomerStatusBadge,
} from './components'

// Hooks
export { useAggregateStats, useCustomerStats, useCustomersPage } from './hooks'

// Utils
export { createCustomerColumns, createCustomerRichColumns } from './utils'

// Constants
export {
	BUSINESS_TYPE_CONFIG,
	BUSINESS_TYPE_OPTIONS,
	CUSTOMER_STATUS_CONFIG,
	CUSTOMER_STATUS_OPTIONS,
	getBusinessTypeConfig,
	getCustomerStatusConfig,
} from './constants'

// Types
export type {
	AggregateCustomerStats,
	AssignSalesRepRequest,
	BusinessTypeConfig,
	CustomerFilterOptions,
	CustomerListItem,
	CustomerStats,
	CustomerStatusConfig,
} from './types'

