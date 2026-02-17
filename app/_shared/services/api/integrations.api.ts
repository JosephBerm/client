/**
 * Integrations API Module
 *
 * ERP Integration - QuickBooks Online, NetSuite, and other accounting systems.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/integrations
 */

import type {
	IntegrationConnectionDTO,
	IntegrationDashboardSummary,
	IntegrationEntityMappingDTO,
	IntegrationProvider,
	IntegrationSettingsDTO,
	IntegrationStats,
	IntegrationSyncCheckpointDTO,
	IntegrationSyncLogDTO,
	PagedIntegrationResult,
	SyncLogSearchFilter,
	SyncOperationResponse,
	SyncOperationStatus,
	TriggerSyncRequest,
	UpdateConnectionSettingsRequest,
} from '@_features/integrations/types'

import { HttpService } from '../httpService'

// =========================================================================
// INTEGRATIONS API
// =========================================================================

/**
 * ERP Integration API (PRD: prd_erp_integration.md)
 * Connect to QuickBooks Online, NetSuite, and other accounting systems.
 *
 * Routes:
 * - Integration endpoints: /Integration/*
 * - QuickBooks OAuth: /QuickBooks/*
 * - NetSuite OAuth: /NetSuite/*
 */
export const IntegrationsApi = {
	// =====================================================================
	// CONNECTIONS
	// =====================================================================

	/**
	 * Gets all integration connections for the current tenant.
	 */
	getConnections: async () => HttpService.get<IntegrationConnectionDTO[]>('/Integration/connections'),

	/**
	 * Gets a specific connection by ID.
	 */
	getConnection: async (connectionId: string) =>
		HttpService.get<IntegrationConnectionDTO>(`/Integration/connections/${connectionId}`),

	/**
	 * Updates connection settings.
	 */
	updateConnectionSettings: async (connectionId: string, request: UpdateConnectionSettingsRequest) =>
		HttpService.put<IntegrationConnectionDTO>(`/Integration/connections/${connectionId}/settings`, request),

	/**
	 * Disconnects an integration.
	 */
	disconnect: async (connectionId: string) =>
		HttpService.post<boolean>(`/Integration/connections/${connectionId}/disconnect`, {}),

	/**
	 * Tests a connection.
	 */
	testConnection: async (connectionId: string) =>
		HttpService.post<{ success: boolean; message: string }>(`/Integration/connections/${connectionId}/test`, {}),

	// =====================================================================
	// SYNC OPERATIONS
	// =====================================================================

	/**
	 * Triggers a manual sync operation.
	 */
	triggerSync: async (request: TriggerSyncRequest) =>
		HttpService.post<SyncOperationResponse>('/Integration/sync', request),

	/**
	 * Gets the status of a sync operation.
	 */
	getSyncStatus: async (correlationId: string) =>
		HttpService.get<SyncOperationStatus>(`/Integration/sync/${correlationId}/status`),

	/**
	 * Gets sync checkpoints for a provider.
	 */
	getSyncCheckpoints: async (provider: string) =>
		HttpService.get<IntegrationSyncCheckpointDTO[]>(`/Integration/checkpoints/${provider}`),

	// =====================================================================
	// ENTITY MAPPINGS
	// =====================================================================

	/**
	 * Gets entity mappings with optional filters.
	 */
	getEntityMappings: async (
		provider?: string,
		entityType?: string,
		pageNumber = 1,
		pageSize = 20,
		prometheusEntityId?: string
	) => {
		const params = new URLSearchParams()
		if (provider) params.append('provider', provider)
		if (entityType) params.append('entityType', entityType)
		if (prometheusEntityId) params.append('prometheusEntityId', prometheusEntityId)
		params.append('pageNumber', pageNumber.toString())
		params.append('pageSize', pageSize.toString())
		return HttpService.get<PagedIntegrationResult<IntegrationEntityMappingDTO>>(
			`/Integration/mappings?${params.toString()}`
		)
	},

	/**
	 * Gets the external ID for a Prometheus entity.
	 */
	getExternalId: async (provider: string, entityType: string, prometheusId: string) =>
		HttpService.get<{ externalId: string }>(
			`/Integration/mappings/external-id?provider=${provider}&entityType=${entityType}&prometheusId=${prometheusId}`
		),

	// =====================================================================
	// SYNC LOGS
	// =====================================================================

	/**
	 * Gets sync logs with filters.
	 */
	getSyncLogs: async (filter: SyncLogSearchFilter) => {
		const params = new URLSearchParams()
		if (filter.provider) params.append('provider', filter.provider)
		if (filter.entityType) params.append('entityType', filter.entityType)
		if (filter.entityId) params.append('entityId', filter.entityId)
		if (filter.direction !== undefined) params.append('direction', filter.direction.toString())
		if (filter.status !== undefined) params.append('status', filter.status.toString())
		if (filter.fromDate) params.append('fromDate', filter.fromDate)
		if (filter.toDate) params.append('toDate', filter.toDate)
		if (filter.searchTerm) params.append('searchTerm', filter.searchTerm)
		params.append('pageNumber', (filter.pageNumber ?? 1).toString())
		params.append('pageSize', (filter.pageSize ?? 20).toString())
		if (filter.sortBy) params.append('sortBy', filter.sortBy)
		if (filter.sortDescending !== undefined) params.append('sortDescending', filter.sortDescending.toString())
		return HttpService.get<PagedIntegrationResult<IntegrationSyncLogDTO>>(`/Integration/logs?${params.toString()}`)
	},

	/**
	 * Gets a specific sync log entry.
	 */
	getSyncLogDetail: async (logId: string) => HttpService.get<IntegrationSyncLogDTO>(`/Integration/logs/${logId}`),

	// =====================================================================
	// DASHBOARD & STATS
	// =====================================================================

	/**
	 * Gets integration dashboard summary.
	 */
	getDashboardSummary: async () => HttpService.get<IntegrationDashboardSummary>('/Integration/dashboard'),

	/**
	 * Gets integration statistics.
	 */
	getStats: async () => HttpService.get<IntegrationStats>('/Integration/stats'),

	// =====================================================================
	// SETTINGS
	// =====================================================================

	/**
	 * Gets integration settings for a provider.
	 */
	getSettings: async (provider: IntegrationProvider) =>
		HttpService.get<IntegrationSettingsDTO>(`/Integration/settings/${provider}`),

	/**
	 * Updates integration settings for a provider.
	 */
	updateSettings: async (provider: IntegrationProvider, settings: IntegrationSettingsDTO) =>
		HttpService.put<IntegrationSettingsDTO>(`/Integration/settings/${provider}`, settings),

	// =====================================================================
	// OAUTH (QuickBooks / NetSuite)
	// =====================================================================

	/**
	 * Initiates QuickBooks OAuth connection.
	 */
	initiateQuickBooksConnection: async () =>
		HttpService.get<{ authorizationUrl: string; state: string }>('/QuickBooks/connect'),

	/**
	 * Initiates NetSuite OAuth connection.
	 */
	initiateNetSuiteConnection: async () =>
		HttpService.get<{ authorizationUrl: string; state: string }>('/NetSuite/connect'),

	/**
	 * Connects NetSuite using Token-Based Authentication.
	 */
	connectNetSuiteTBA: async (credentials: {
		accountId: string
		consumerKey: string
		consumerSecret: string
		tokenId: string
		tokenSecret: string
	}) =>
		HttpService.post<boolean | { authorizationUrl: string; state: string }>(
			'/NetSuite/connect',
			credentials
		),

	// =====================================================================
	// OUTBOX & INBOX
	// =====================================================================

	/**
	 * Gets pending outbox items.
	 */
	getOutboxItems: async (pageNumber = 1, pageSize = 20) =>
		HttpService.get<unknown[]>(`/Integration/outbox?pageNumber=${pageNumber}&pageSize=${pageSize}`),

	/**
	 * Retries a specific outbox item.
	 */
	retryOutboxItem: async (itemId: string) => HttpService.post<boolean>(`/Integration/outbox/${itemId}/retry`, {}),

	/**
	 * Gets inbox items (received webhooks).
	 */
	getInboxItems: async (pageNumber = 1, pageSize = 20) =>
		HttpService.get<PagedIntegrationResult<unknown>>(
			`/Integration/inbox?pageNumber=${pageNumber}&pageSize=${pageSize}`
		),
}
