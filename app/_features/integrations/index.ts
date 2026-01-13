// =========================================================================
// ERP INTEGRATION FEATURE MODULE
// =========================================================================
//
// PRD Reference: client/md/PRDs/internal-routes/prd_erp_integration.md
//
// This module provides:
// - Types for integration data structures
// - API service for backend communication
// - React Query hooks for data fetching and mutations
//
// Usage:
// import { useIntegrationDashboard, IntegrationService } from '@/app/_features/integrations'
//
// =========================================================================

// Types
export * from './types'

// Constants
export * from './constants'

// Services
export { IntegrationService } from './services'

// Hooks
export {
	// Query key factory
	integrationKeys,
	// Connection queries
	useIntegrationConnections,
	useIntegrationConnection,
	// Dashboard queries
	useIntegrationDashboard,
	useIntegrationStats,
	// Settings queries/mutations
	useIntegrationSettings,
	useUpdateIntegrationSettings,
	// Sync log queries
	useSyncLogs,
	useSyncLogDetail,
	// Entity mapping queries
	useEntityMappings,
	useEntitySyncStatus,
	// Checkpoint queries
	useSyncCheckpoints,
	// Sync status polling
	useSyncStatus,
	// Connection mutations
	useUpdateConnectionSettings,
	useDisconnectIntegration,
	useTestConnection,
	// Sync mutations
	useTriggerSync,
	// OAuth mutations
	useInitiateQuickBooksConnection,
	useInitiateNetSuiteConnection,
	// Types
	type EntityMappingSearchFilter,
} from './hooks'

// Components
export {
	BulkSyncProgress,
	EntityMappingsTable,
	IntegrationConnectionCard,
	IntegrationSettingsForm,
	IntegrationStatsGrid,
	ManualSyncModal,
	NetSuiteConnector,
	OutboxViewer,
	QuickBooksConnect,
	SyncLogsTable,
} from './components'
