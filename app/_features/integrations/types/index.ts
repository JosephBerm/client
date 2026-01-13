// =========================================================================
// ERP INTEGRATION TYPES (PRD: prd_erp_integration.md)
// =========================================================================

/**
 * Integration provider identifiers.
 * @remarks MUST match backend: server/Entities/Integration/IntegrationConnection.cs
 */
export type IntegrationProvider = 'QuickBooks' | 'NetSuite'

/**
 * Sync direction for operations.
 * @remarks MUST match backend: server/Entities/Integration/IntegrationSyncLog.cs
 */
export enum SyncDirection {
	ToExternal = 1,
	FromExternal = 2,
}

/**
 * Sync operation status.
 * @remarks MUST match backend: server/Entities/Integration/IntegrationSyncLog.cs
 */
export enum SyncStatus {
	Pending = 1,
	InProgress = 2,
	Completed = 10,
	Failed = 20,
	Skipped = 30,
}

/**
 * Outbox event status.
 * @remarks MUST match backend: server/Entities/Integration/IntegrationOutbox.cs
 */
export enum OutboxStatus {
	Pending = 1,
	Processing = 2,
	Completed = 10,
	Failed = 20,
	Abandoned = 30,
}

/**
 * Connection status for display purposes.
 */
export enum ConnectionStatus {
	Disconnected = 'Disconnected',
	Connected = 'Connected',
	TokenExpired = 'TokenExpired',
	Error = 'Error',
}

// =========================================================================
// CONNECTION TYPES
// =========================================================================

/**
 * Integration connection DTO.
 */
export interface IntegrationConnectionDTO {
	id: string
	provider: IntegrationProvider
	providerDisplayName: string
	externalCompanyId?: string
	companyName?: string
	status: ConnectionStatus
	isActive: boolean
	isConnected: boolean
	isTokenExpired: boolean
	needsReauthorization: boolean
	lastSyncAt?: string
	lastSyncError?: string
	autoSyncEnabled: boolean
	syncCustomers: boolean
	syncInvoices: boolean
	syncPayments: boolean
	syncProducts: boolean
	createdAt: string
	modifiedAt?: string
	connectedBy?: string
}

/**
 * Request to update connection settings.
 */
export interface UpdateConnectionSettingsRequest {
	autoSyncEnabled?: boolean
	syncCustomers?: boolean
	syncInvoices?: boolean
	syncPayments?: boolean
	syncProducts?: boolean
}

/**
 * Integration settings DTO for a specific provider.
 */
export interface IntegrationSettingsDTO {
	provider: IntegrationProvider
	autoSyncEnabled: boolean
	syncIntervalMinutes: number
	syncCustomers: boolean
	syncInvoices: boolean
	syncPayments: boolean
	syncProducts: boolean
	defaultSalesTermId?: string
	webhooksEnabled: boolean
	lastModifiedAt?: string
	lastModifiedBy?: string
}

/**
 * Request to update integration settings.
 */
export interface UpdateIntegrationSettingsRequest {
	provider: IntegrationProvider
	settings: IntegrationSettingsDTO
}

// =========================================================================
// SYNC LOG TYPES
// =========================================================================

/**
 * Sync log DTO.
 */
export interface IntegrationSyncLogDTO {
	id: string
	provider: IntegrationProvider
	entityType: string
	entityId?: string
	externalId?: string
	direction: SyncDirection
	directionDisplay: string
	operation?: string
	status: SyncStatus
	statusDisplay: string
	errorMessage?: string
	errorCode?: string
	startedAt: string
	completedAt?: string
	durationMs?: number
	retryCount: number
	correlationId?: string
}

/**
 * Filter criteria for sync log searches.
 */
export interface SyncLogSearchFilter {
	provider?: IntegrationProvider
	entityType?: string
	entityId?: string
	direction?: SyncDirection
	status?: SyncStatus
	fromDate?: string
	toDate?: string
	searchTerm?: string
	pageNumber?: number
	pageSize?: number
	sortBy?: string
	sortDescending?: boolean
}

// =========================================================================
// ENTITY MAPPING TYPES
// =========================================================================

/**
 * Entity mapping DTO.
 */
export interface IntegrationEntityMappingDTO {
	id: string
	provider: IntegrationProvider
	entityType: string
	prometheusId: string
	externalId: string
	createdAt: string
	lastSyncAt?: string
	lastSyncDirection?: SyncDirection
}

// =========================================================================
// SYNC CHECKPOINT TYPES
// =========================================================================

/**
 * Sync checkpoint DTO.
 */
export interface IntegrationSyncCheckpointDTO {
	id: string
	provider: IntegrationProvider
	entityType: string
	cursor?: string
	cursorType?: string
	lastSuccessAt?: string
	lastError?: string
	lastSyncCount?: number
	updatedAt: string
}

// =========================================================================
// SYNC OPERATION TYPES
// =========================================================================

/**
 * Sync direction for trigger requests (string-based for API compatibility).
 */
export type SyncDirectionString = 'Outbound' | 'Inbound' | 'Bidirectional'

/**
 * Request to trigger a manual sync.
 */
export interface TriggerSyncRequest {
	provider: IntegrationProvider
	entityType: string
	entityId?: string
	/** Sync direction: Outbound (Prometheus → ERP), Inbound (ERP → Prometheus), or Bidirectional */
	direction?: SyncDirectionString
	/** Force a full sync ignoring checkpoints */
	forceFullSync?: boolean
}

/**
 * Response for sync operation.
 */
export interface SyncOperationResponse {
	correlationId: string
	status: string
	message: string
	itemsQueued?: number
}

/**
 * Status of a sync operation.
 */
export interface SyncOperationStatus {
	correlationId: string
	provider: IntegrationProvider
	entityType: string
	status: string
	/** Total number of items to process */
	totalItems?: number
	/** Number of items processed so far */
	processedItems?: number
	/** Alias for processedItems for API compatibility */
	itemsProcessed?: number
	successCount?: number
	failureCount?: number
	skippedCount?: number
	startedAt: string
	completedAt?: string
	/** Duration in milliseconds */
	durationMs?: number
	/** Status message */
	message?: string
	/** Error message if failed */
	errorMessage?: string
	errors?: string[]
}

// =========================================================================
// DASHBOARD TYPES
// =========================================================================

/**
 * Dashboard summary.
 */
export interface IntegrationDashboardSummary {
	connections: IntegrationConnectionDTO[]
	stats: IntegrationStats
	recentActivity: RecentSyncActivity[]
	pendingItems: PendingOutboxItem[]
}

/**
 * Integration statistics.
 */
export interface IntegrationStats {
	totalConnections: number
	activeConnections: number
	totalMappings: number
	todaySyncCount: number
	todaySuccessCount: number
	todayFailureCount: number
	pendingOutboxCount: number
	failedOutboxCount: number
}

/**
 * Recent sync activity.
 */
export interface RecentSyncActivity {
	provider: IntegrationProvider
	entityType: string
	operation: string
	status: string
	timestamp: string
	errorMessage?: string
}

/**
 * Pending outbox item.
 */
export interface PendingOutboxItem {
	id: string
	eventType: string
	entityType: string
	entityId: string
	targetSystem?: string
	createdAt: string
	scheduledFor?: string
	retryCount: number
	lastError?: string
}

// =========================================================================
// PAGINATED RESULT TYPES
// =========================================================================

/**
 * Paginated result for integration queries.
 */
export interface PagedIntegrationResult<T> {
	items: T[]
	totalCount: number
	pageNumber: number
	pageSize: number
	totalPages: number
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Get display string for sync status.
 */
export function getSyncStatusDisplay(status: SyncStatus): string {
	switch (status) {
		case SyncStatus.Pending:
			return 'Pending'
		case SyncStatus.InProgress:
			return 'In Progress'
		case SyncStatus.Completed:
			return 'Completed'
		case SyncStatus.Failed:
			return 'Failed'
		case SyncStatus.Skipped:
			return 'Skipped'
		default:
			return 'Unknown'
	}
}

/**
 * Get status color for badges.
 */
export function getSyncStatusColor(
	status: SyncStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' {
	switch (status) {
		case SyncStatus.Completed:
			return 'success'
		case SyncStatus.Pending:
		case SyncStatus.InProgress:
			return 'warning'
		case SyncStatus.Failed:
			return 'error'
		case SyncStatus.Skipped:
			return 'info'
		default:
			return 'default'
	}
}

/**
 * Get display string for sync direction.
 */
export function getSyncDirectionDisplay(direction: SyncDirection): string {
	switch (direction) {
		case SyncDirection.ToExternal:
			return 'To ERP'
		case SyncDirection.FromExternal:
			return 'From ERP'
		default:
			return 'Unknown'
	}
}

/**
 * Get provider logo URL.
 */
export function getProviderLogoUrl(provider: IntegrationProvider): string {
	switch (provider) {
		case 'QuickBooks':
			return '/images/quickbooks-logo.svg'
		case 'NetSuite':
			return '/images/netsuite-logo.svg'
		default:
			return '/images/integration-default.svg'
	}
}

/**
 * Format duration in milliseconds to human-readable string.
 */
export function formatDuration(ms?: number): string {
	if (!ms) return '-'
	if (ms < 1000) return `${ms}ms`
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
	return `${(ms / 60000).toFixed(1)}m`
}
