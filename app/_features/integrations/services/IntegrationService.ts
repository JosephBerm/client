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

import {
	ApiRequestError,
	unwrapApiArrayPayload,
	unwrapApiNullablePayload,
	unwrapApiPayload,
} from '@_shared/services'

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
		return unwrapApiArrayPayload<IntegrationConnectionDTO>(response, 'load integration connections')
	},

	async getConnection(connectionId: string): Promise<IntegrationConnectionDTO | null> {
		const response = await API.Integrations.getConnection(connectionId)
		return unwrapApiNullablePayload<IntegrationConnectionDTO>(response, 'load integration connection')
	},

	async updateConnectionSettings(
		connectionId: string,
		request: UpdateConnectionSettingsRequest
	): Promise<IntegrationConnectionDTO | null> {
		const response = await API.Integrations.updateConnectionSettings(connectionId, request)
		return unwrapApiNullablePayload<IntegrationConnectionDTO>(
			response,
			'update integration connection settings'
		)
	},

	async disconnect(connectionId: string): Promise<boolean> {
		const response = await API.Integrations.disconnect(connectionId)
		return unwrapApiPayload<boolean>(response, 'disconnect integration')
	},

	async testConnection(connectionId: string): Promise<{ success: boolean; message: string }> {
		const response = await API.Integrations.testConnection(connectionId)
		return unwrapApiPayload<{ success: boolean; message: string }>(
			response,
			'test integration connection'
		)
	},

	// =========================================================================
	// SYNC OPERATIONS
	// =========================================================================

	async triggerSync(request: TriggerSyncRequest): Promise<SyncOperationResponse | null> {
		const response = await API.Integrations.triggerSync(request)
		return unwrapApiNullablePayload<SyncOperationResponse>(response, 'trigger integration sync')
	},

	async getSyncStatus(correlationId: string): Promise<SyncOperationStatus | null> {
		const response = await API.Integrations.getSyncStatus(correlationId)
		return unwrapApiNullablePayload<SyncOperationStatus>(response, 'load integration sync status')
	},

	async getSyncCheckpoints(provider: string): Promise<IntegrationSyncCheckpointDTO[]> {
		const response = await API.Integrations.getSyncCheckpoints(provider)
		return unwrapApiArrayPayload<IntegrationSyncCheckpointDTO>(response, 'load integration sync checkpoints')
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
		return unwrapApiPayload<PagedIntegrationResult<IntegrationEntityMappingDTO>>(
			response,
			'load integration entity mappings'
		)
	},

	async getExternalId(provider: string, entityType: string, prometheusId: string): Promise<string | null> {
		try {
			const response = await API.Integrations.getExternalId(provider, entityType, prometheusId)
			const payload = unwrapApiPayload<{ externalId?: string }>(response, 'load external entity ID')
			return payload.externalId ?? null
		} catch (error) {
			if (error instanceof ApiRequestError && error.status === 404) {
				return null
			}
			throw error
		}
	},

	// =========================================================================
	// SYNC LOGS
	// =========================================================================

	async getSyncLogs(filter: SyncLogSearchFilter): Promise<PagedIntegrationResult<IntegrationSyncLogDTO>> {
		const response = await API.Integrations.getSyncLogs(filter)
		return unwrapApiPayload<PagedIntegrationResult<IntegrationSyncLogDTO>>(
			response,
			'load integration sync logs'
		)
	},

	async getSyncLogDetail(logId: string): Promise<IntegrationSyncLogDTO | null> {
		const response = await API.Integrations.getSyncLogDetail(logId)
		return unwrapApiNullablePayload<IntegrationSyncLogDTO>(response, 'load integration sync log detail')
	},

	// =========================================================================
	// DASHBOARD & STATS
	// =========================================================================

	async getDashboardSummary(): Promise<IntegrationDashboardSummary | null> {
		const response = await API.Integrations.getDashboardSummary()
		return unwrapApiNullablePayload<IntegrationDashboardSummary>(response, 'load integration dashboard summary')
	},

	async getStats(): Promise<IntegrationStats | null> {
		const response = await API.Integrations.getStats()
		return unwrapApiNullablePayload<IntegrationStats>(response, 'load integration stats')
	},

	// =========================================================================
	// SETTINGS
	// =========================================================================

	async getSettings(provider: IntegrationProvider): Promise<IntegrationSettingsDTO | null> {
		const response = await API.Integrations.getSettings(provider)
		return unwrapApiNullablePayload<IntegrationSettingsDTO>(response, 'load integration settings')
	},

	async updateSettings(
		provider: IntegrationProvider,
		settings: IntegrationSettingsDTO
	): Promise<IntegrationSettingsDTO | null> {
		const response = await API.Integrations.updateSettings(provider, settings)
		return unwrapApiNullablePayload<IntegrationSettingsDTO>(response, 'update integration settings')
	},

	// =========================================================================
	// OAUTH (QuickBooks / NetSuite)
	// =========================================================================

	async initiateQuickBooksConnection(): Promise<{ authorizationUrl: string; state: string }> {
		const response = await API.Integrations.initiateQuickBooksConnection()
		return unwrapApiPayload<{ authorizationUrl: string; state: string }>(
			response,
			'initiate QuickBooks connection'
		)
	},

	async initiateNetSuiteConnection(): Promise<{ authorizationUrl: string; state: string }> {
		const response = await API.Integrations.initiateNetSuiteConnection()
		return unwrapApiPayload<{ authorizationUrl: string; state: string }>(
			response,
			'initiate NetSuite connection'
		)
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
			const payload = unwrapApiPayload<unknown>(response, 'connect NetSuite')

			// Compatibility path: backend may return OAuth redirect payload instead of a boolean.
			if (payload && typeof payload === 'object' && 'authorizationUrl' in payload) {
				const { authorizationUrl } = payload as { authorizationUrl?: string }
				if (authorizationUrl) {
					if (typeof window !== 'undefined') {
						window.location.href = authorizationUrl
					}
					return { isSuccess: true }
				}
				return { isSuccess: false, errorMessage: 'Missing NetSuite authorization URL' }
			}

			return { isSuccess: Boolean(payload) }
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
		return unwrapApiArrayPayload<unknown>(response, 'load integration outbox items')
	},

	async retryOutboxItem(itemId: string): Promise<boolean> {
		const response = await API.Integrations.retryOutboxItem(itemId)
		return unwrapApiPayload<boolean>(response, 'retry integration outbox item')
	},

	async getInboxItems(pageNumber = 1, pageSize = 20): Promise<PagedIntegrationResult<unknown>> {
		const response = await API.Integrations.getInboxItems(pageNumber, pageSize)
		return unwrapApiPayload<PagedIntegrationResult<unknown>>(response, 'load integration inbox items')
	},
}

export default IntegrationService
