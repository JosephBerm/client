/**
 * IntegrationService - Convenience Wrapper for Integration API
 *
 * Provides methods for all ERP integration operations.
 * Uses the centralized API client for proper separation of concerns.
 *
 * **Architecture:**
 * - Raw API calls: `API.Integrations.*` (in @_shared/services/api.ts)
 * - Convenience wrapper: `IntegrationService` (this file) - unwraps responses
 *
 * **DRY Compliance:**
 * - All HTTP calls in centralized API object
 * - This service only unwraps responses for easier usage
 * - Follows same pattern as PaymentService, ProductService
 *
 * @module integrations/services
 */

import { API } from '@_shared'

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
} from '../types'

// Default empty paged result for fallback
const EMPTY_PAGED_RESULT = <T>(): PagedIntegrationResult<T> => ({
	items: [],
	totalCount: 0,
	pageNumber: 1,
	pageSize: 20,
	totalPages: 0,
})

/**
 * IntegrationService - Convenience Wrapper
 *
 * Wraps API.Integrations to provide unwrapped responses for easier usage.
 */
export const IntegrationService = {
	// =========================================================================
	// CONNECTIONS
	// =========================================================================

	async getConnections(): Promise<IntegrationConnectionDTO[]> {
		const response = await API.Integrations.getConnections()
		return response.data.payload ?? []
	},

	async getConnection(connectionId: string): Promise<IntegrationConnectionDTO | null> {
		const response = await API.Integrations.getConnection(connectionId)
		return response.data.payload
	},

	async updateConnectionSettings(
		connectionId: string,
		request: UpdateConnectionSettingsRequest
	): Promise<IntegrationConnectionDTO | null> {
		const response = await API.Integrations.updateConnectionSettings(connectionId, request)
		return response.data.payload
	},

	async disconnect(connectionId: string): Promise<boolean> {
		const response = await API.Integrations.disconnect(connectionId)
		return response.data.payload ?? false
	},

	async testConnection(connectionId: string): Promise<{ success: boolean; message: string }> {
		const response = await API.Integrations.testConnection(connectionId)
		return response.data.payload ?? { success: false, message: 'Unknown error' }
	},

	// =========================================================================
	// SYNC OPERATIONS
	// =========================================================================

	async triggerSync(request: TriggerSyncRequest): Promise<SyncOperationResponse | null> {
		const response = await API.Integrations.triggerSync(request)
		return response.data.payload
	},

	async getSyncStatus(correlationId: string): Promise<SyncOperationStatus | null> {
		const response = await API.Integrations.getSyncStatus(correlationId)
		return response.data.payload
	},

	async getSyncCheckpoints(provider: string): Promise<IntegrationSyncCheckpointDTO[]> {
		const response = await API.Integrations.getSyncCheckpoints(provider)
		return response.data.payload ?? []
	},

	// =========================================================================
	// ENTITY MAPPINGS
	// =========================================================================

	async getEntityMappings(
		provider?: string,
		entityType?: string,
		pageNumber = 1,
		pageSize = 20,
		prometheusEntityId?: string
	): Promise<PagedIntegrationResult<IntegrationEntityMappingDTO>> {
		const response = await API.Integrations.getEntityMappings(
			provider,
			entityType,
			pageNumber,
			pageSize,
			prometheusEntityId
		)
		return response.data.payload ?? EMPTY_PAGED_RESULT<IntegrationEntityMappingDTO>()
	},

	async getExternalId(provider: string, entityType: string, prometheusId: string): Promise<string | null> {
		try {
			const response = await API.Integrations.getExternalId(provider, entityType, prometheusId)
			return response.data.payload?.externalId ?? null
		} catch {
			return null
		}
	},

	// =========================================================================
	// SYNC LOGS
	// =========================================================================

	async getSyncLogs(filter: SyncLogSearchFilter): Promise<PagedIntegrationResult<IntegrationSyncLogDTO>> {
		const response = await API.Integrations.getSyncLogs(filter)
		return response.data.payload ?? EMPTY_PAGED_RESULT<IntegrationSyncLogDTO>()
	},

	async getSyncLogDetail(logId: string): Promise<IntegrationSyncLogDTO | null> {
		const response = await API.Integrations.getSyncLogDetail(logId)
		return response.data.payload
	},

	// =========================================================================
	// DASHBOARD & STATS
	// =========================================================================

	async getDashboardSummary(): Promise<IntegrationDashboardSummary | null> {
		const response = await API.Integrations.getDashboardSummary()
		return response.data.payload
	},

	async getStats(): Promise<IntegrationStats | null> {
		const response = await API.Integrations.getStats()
		return response.data.payload
	},

	// =========================================================================
	// SETTINGS
	// =========================================================================

	async getSettings(provider: IntegrationProvider): Promise<IntegrationSettingsDTO | null> {
		const response = await API.Integrations.getSettings(provider)
		return response.data.payload
	},

	async updateSettings(
		provider: IntegrationProvider,
		settings: IntegrationSettingsDTO
	): Promise<IntegrationSettingsDTO | null> {
		const response = await API.Integrations.updateSettings(provider, settings)
		return response.data.payload
	},

	// =========================================================================
	// OAUTH (QuickBooks / NetSuite)
	// =========================================================================

	async initiateQuickBooksConnection(): Promise<{ authorizationUrl: string; state: string }> {
		const response = await API.Integrations.initiateQuickBooksConnection()
		return response.data.payload ?? { authorizationUrl: '', state: '' }
	},

	async initiateNetSuiteConnection(): Promise<{ authorizationUrl: string; state: string }> {
		const response = await API.Integrations.initiateNetSuiteConnection()
		return response.data.payload ?? { authorizationUrl: '', state: '' }
	},

	async connectNetSuite(credentials: {
		accountId: string
		consumerKey: string
		consumerSecret: string
		tokenId: string
		tokenSecret: string
	}): Promise<{ isSuccess: boolean; errorMessage?: string }> {
		try {
			const response = await API.Integrations.connectNetSuiteTBA(credentials)
			return { isSuccess: response.data.payload ?? false }
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to connect'
			return { isSuccess: false, errorMessage }
		}
	},

	// =========================================================================
	// OUTBOX & INBOX
	// =========================================================================

	async getOutboxItems(pageNumber = 1, pageSize = 20): Promise<unknown[]> {
		const response = await API.Integrations.getOutboxItems(pageNumber, pageSize)
		return response.data.payload ?? []
	},

	async retryOutboxItem(itemId: string): Promise<boolean> {
		const response = await API.Integrations.retryOutboxItem(itemId)
		return response.data.payload ?? false
	},

	async getInboxItems(pageNumber = 1, pageSize = 20): Promise<PagedIntegrationResult<unknown>> {
		const response = await API.Integrations.getInboxItems(pageNumber, pageSize)
		return response.data.payload ?? EMPTY_PAGED_RESULT<unknown>()
	},
}

export default IntegrationService
