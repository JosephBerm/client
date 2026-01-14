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
export type {
	IntegrationProvider,
	SyncDirectionString,
	IntegrationConnectionDTO,
	UpdateConnectionSettingsRequest,
	IntegrationSettingsDTO,
	UpdateIntegrationSettingsRequest,
	IntegrationSyncLogDTO,
	SyncLogSearchFilter,
	IntegrationEntityMappingDTO,
	IntegrationSyncCheckpointDTO,
	TriggerSyncRequest,
	SyncOperationResponse,
	SyncOperationStatus,
	IntegrationDashboardSummary,
	IntegrationStats,
	RecentSyncActivity,
	PendingOutboxItem,
	PagedIntegrationResult,
} from './types'
export {
	SyncDirection,
	SyncStatus,
	OutboxStatus,
	ConnectionStatus,
	getSyncStatusDisplay,
	getSyncStatusColor,
	getSyncDirectionDisplay,
	getProviderLogoUrl,
	formatDuration,
} from './types'

// Constants
export {
	STALE_TIME_FREQUENT,
	STALE_TIME_MODERATE,
	STALE_TIME_RARE,
	DASHBOARD_REFETCH_INTERVAL,
	SYNC_STATUS_POLL_INTERVAL,
	DEFAULT_PAGE_SIZE,
	DEFAULT_PAGE_NUMBER,
	MAX_PAGE_SIZE,
	SYNC_COMPLETE_STATUSES,
	PROVIDERS,
	ENTITY_TYPES,
} from './constants'

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
