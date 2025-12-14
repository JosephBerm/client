/**
 * Provider Feature Module
 * 
 * Provides components, hooks, constants, utilities, and types for provider/vendor management.
 * Follows the same architecture as the customers feature module.
 * 
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 * 
 * **Components:**
 * - ProviderStatusBadge: Displays provider status (Active/Suspended/Archived)
 * - ProviderStatsGrid: Dashboard statistics grid with clickable filters
 * - ProviderDeleteModal: Confirmation modal for delete/archive/suspend
 * 
 * **Hooks:**
 * - useProviderStats: Fetches provider aggregate statistics
 * - useProvidersPage: Page state and business logic
 * 
 * **Utils:**
 * - createProviderColumns: Column definitions factory
 * 
 * **Constants:**
 * - PROVIDER_STATUS_CONFIG: Status display configuration
 * - PROVIDER_STATUS_OPTIONS: Status select options
 * - PROVIDER_QUICK_FILTERS: Quick filter button definitions
 * 
 * **Types:**
 * - AggregateProviderStats: Statistics data structure
 * - ProviderStatusKey: Status key type
 * - ProviderFilterOptions: Search filter options
 * - ProviderFormData: Form data structure
 * 
 * @module providers
 * 
 * @example
 * ```tsx
 * import {
 *   ProviderStatusBadge,
 *   ProviderStatsGrid,
 *   ProviderDeleteModal,
 *   useProvidersPage,
 *   createProviderColumns,
 * } from '@_features/providers'
 * 
 * function ProvidersPage() {
 *   const {
 *     stats,
 *     statsLoading,
 *     modal,
 *     handleDelete,
 *     handleArchive,
 *     handleSuspend,
 *     handleActivate,
 *   } = useProvidersPage()
 *   
 *   const columns = useMemo(() => createProviderColumns({...}), [])
 *   
 *   return (
 *     <div>
 *       <ProviderStatsGrid stats={stats} isLoading={statsLoading} />
 *       <ServerDataGrid columns={columns} ... />
 *       <ProviderDeleteModal ... />
 *     </div>
 *   )
 * }
 * ```
 */

// Components
export {
	ProviderStatusBadge,
	ProviderStatsGrid,
	ProviderDeleteModal,
} from './components'

// Hooks
export { useProviderStats, useProvidersPage } from './hooks'

// Utils
export { createProviderColumns } from './utils'

// Constants
export {
	PROVIDER_STATUS_CONFIG,
	PROVIDER_STATUS_OPTIONS,
	PROVIDER_QUICK_FILTERS,
	getProviderStatusConfig,
	getProviderStatusConfigLegacy,
	getStatusKey,
	DEFAULT_PROVIDER_PAGE_SIZE,
	DEFAULT_PROVIDER_SORT_FIELD,
	DEFAULT_PROVIDER_SORT_ORDER,
} from './constants'

// Types
export type {
	AggregateProviderStats,
	ProviderStatusConfig,
	ProviderStatusKey,
	ProviderFilterOptions,
	ProviderListItem,
	ProviderFormData,
} from './types'

