'use client'

/**
 * Integration TanStack Query Hooks
 *
 * MAANG-Level data fetching with React Query:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Query key factories for consistent cache invalidation
 *
 * @module integrations/hooks
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import {
	DASHBOARD_REFETCH_INTERVAL,
	STALE_TIME_FREQUENT,
	STALE_TIME_MODERATE,
	SYNC_COMPLETE_STATUSES,
	SYNC_STATUS_POLL_INTERVAL,
} from '../constants'
import { IntegrationService } from '../services'
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

// =========================================================================
// QUERY KEY FACTORY
// =========================================================================

/**
 * Query key factory for integration-related queries.
 * Ensures consistent cache key structure across the application.
 */
export const integrationKeys = {
	all: ['integrations'] as const,
	connections: () => [...integrationKeys.all, 'connections'] as const,
	connection: (id: string) => [...integrationKeys.connections(), id] as const,
	dashboard: () => [...integrationKeys.all, 'dashboard'] as const,
	stats: () => [...integrationKeys.all, 'stats'] as const,
	settings: (provider: string) => [...integrationKeys.all, 'settings', provider] as const,
	logs: () => [...integrationKeys.all, 'logs'] as const,
	logList: (filter: SyncLogSearchFilter) => [...integrationKeys.logs(), filter] as const,
	logDetail: (id: string) => [...integrationKeys.logs(), id] as const,
	mappings: () => [...integrationKeys.all, 'mappings'] as const,
	mappingList: (provider?: string, entityType?: string) =>
		[...integrationKeys.mappings(), { provider, entityType }] as const,
	checkpoints: (provider: string) => [...integrationKeys.all, 'checkpoints', provider] as const,
	syncStatus: (correlationId: string) => [...integrationKeys.all, 'sync-status', correlationId] as const,
}

// =========================================================================
// CONNECTION QUERIES
// =========================================================================

/**
 * Hook to fetch all integration connections.
 */
export function useIntegrationConnections(
	options?: Omit<UseQueryOptions<IntegrationConnectionDTO[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.connections(),
		queryFn: IntegrationService.getConnections,
		staleTime: STALE_TIME_FREQUENT,
		...options,
	})
}

/**
 * Hook to fetch a specific connection.
 */
export function useIntegrationConnection(
	connectionId: string,
	options?: Omit<UseQueryOptions<IntegrationConnectionDTO | null, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.connection(connectionId),
		queryFn: () => IntegrationService.getConnection(connectionId),
		enabled: !!connectionId,
		staleTime: STALE_TIME_FREQUENT,
		...options,
	})
}

// =========================================================================
// DASHBOARD QUERIES
// =========================================================================

/**
 * Hook to fetch integration dashboard summary.
 */
export function useIntegrationDashboard(
	options?: Omit<UseQueryOptions<IntegrationDashboardSummary | null, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.dashboard(),
		queryFn: IntegrationService.getDashboardSummary,
		staleTime: STALE_TIME_FREQUENT,
		refetchInterval: DASHBOARD_REFETCH_INTERVAL,
		...options,
	})
}

/**
 * Hook to fetch integration statistics.
 */
export function useIntegrationStats(options?: Omit<UseQueryOptions<IntegrationStats | null, Error>, 'queryKey' | 'queryFn'>) {
	return useQuery({
		queryKey: integrationKeys.stats(),
		queryFn: IntegrationService.getStats,
		staleTime: STALE_TIME_FREQUENT,
		...options,
	})
}

// =========================================================================
// SETTINGS QUERIES
// =========================================================================

/**
 * Hook to fetch integration settings for a provider.
 */
export function useIntegrationSettings(
	provider: IntegrationProvider,
	options?: Omit<UseQueryOptions<IntegrationSettingsDTO | null, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.settings(provider),
		queryFn: () => IntegrationService.getSettings(provider),
		enabled: !!provider,
		staleTime: STALE_TIME_MODERATE,
		...options,
	})
}

/**
 * Hook to update integration settings.
 */
export function useUpdateIntegrationSettings() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ provider, settings }: { provider: IntegrationProvider; settings: IntegrationSettingsDTO }) =>
			IntegrationService.updateSettings(provider, settings),
		onSuccess: (data, { provider }) => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.settings(provider) })
			queryClient.invalidateQueries({ queryKey: integrationKeys.connections() })
			queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() })
		},
	})
}

// =========================================================================
// SYNC LOG QUERIES
// =========================================================================

/**
 * Hook to fetch sync logs with filters.
 */
export function useSyncLogs(
	filter: SyncLogSearchFilter,
	options?: Omit<UseQueryOptions<PagedIntegrationResult<IntegrationSyncLogDTO>, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.logList(filter),
		queryFn: () => IntegrationService.getSyncLogs(filter),
		staleTime: STALE_TIME_FREQUENT,
		...options,
	})
}

/**
 * Hook to fetch a specific sync log detail.
 */
export function useSyncLogDetail(
	logId: string,
	options?: Omit<UseQueryOptions<IntegrationSyncLogDTO | null, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.logDetail(logId),
		queryFn: () => IntegrationService.getSyncLogDetail(logId),
		enabled: !!logId,
		staleTime: STALE_TIME_FREQUENT,
		...options,
	})
}

// =========================================================================
// ENTITY MAPPING QUERIES
// =========================================================================

/**
 * Entity mapping search filter.
 */
export interface EntityMappingSearchFilter {
	provider?: string
	entityType?: string
	searchTerm?: string
	pageNumber?: number
	pageSize?: number
	sortBy?: string
	sortDescending?: boolean
}

/**
 * Hook to fetch entity mappings with flexible filtering.
 *
 * @remarks
 * PRD Reference: prd_erp_integration.md - US-ERP-007 (View entity mappings)
 */
export function useEntityMappings(
	filter: EntityMappingSearchFilter = {},
	options?: Omit<UseQueryOptions<PagedIntegrationResult<IntegrationEntityMappingDTO>, Error>, 'queryKey' | 'queryFn'>
) {
	const { provider, entityType, pageNumber = 1, pageSize = 20 } = filter
	return useQuery({
		queryKey: [...integrationKeys.mappingList(provider, entityType), filter] as const,
		queryFn: () => IntegrationService.getEntityMappings(provider, entityType, pageNumber, pageSize),
		staleTime: STALE_TIME_MODERATE,
		...options,
	})
}

// =========================================================================
// SYNC CHECKPOINT QUERIES
// =========================================================================

/**
 * Hook to fetch sync checkpoints for a provider.
 */
export function useSyncCheckpoints(
	provider: IntegrationProvider,
	options?: Omit<UseQueryOptions<IntegrationSyncCheckpointDTO[], Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.checkpoints(provider),
		queryFn: () => IntegrationService.getSyncCheckpoints(provider),
		enabled: !!provider,
		staleTime: STALE_TIME_MODERATE,
		...options,
	})
}

// =========================================================================
// SYNC STATUS QUERY
// =========================================================================

/**
 * Hook to poll sync operation status.
 */
export function useSyncStatus(
	correlationId: string | null,
	options?: Omit<UseQueryOptions<SyncOperationStatus | null, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: integrationKeys.syncStatus(correlationId!),
		queryFn: () => IntegrationService.getSyncStatus(correlationId!),
		enabled: !!correlationId,
		refetchInterval: (query) => {
			// Stop polling when sync is complete
			const data = query.state.data
			if (data?.status && SYNC_COMPLETE_STATUSES.includes(data.status as 'Completed' | 'Failed')) {
				return false
			}
			return SYNC_STATUS_POLL_INTERVAL
		},
		...options,
	})
}

// =========================================================================
// CONNECTION MUTATIONS
// =========================================================================

/**
 * Hook to update connection settings.
 */
export function useUpdateConnectionSettings() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ connectionId, request }: { connectionId: string; request: UpdateConnectionSettingsRequest }) =>
			IntegrationService.updateConnectionSettings(connectionId, request),
		onSuccess: (data, { connectionId }) => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.connection(connectionId) })
			queryClient.invalidateQueries({ queryKey: integrationKeys.connections() })
			queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() })
		},
	})
}

/**
 * Hook to disconnect an integration.
 */
export function useDisconnectIntegration() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (connectionId: string) => IntegrationService.disconnect(connectionId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: integrationKeys.connections() })
			queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() })
		},
	})
}

/**
 * Hook to test a connection.
 */
export function useTestConnection() {
	return useMutation({
		mutationFn: (connectionId: string) => IntegrationService.testConnection(connectionId),
	})
}

// =========================================================================
// SYNC MUTATIONS
// =========================================================================

/**
 * Hook to trigger a manual sync.
 */
export function useTriggerSync() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (request: TriggerSyncRequest) => IntegrationService.triggerSync(request),
		onSuccess: () => {
			// Invalidate logs to show new sync operation
			queryClient.invalidateQueries({ queryKey: integrationKeys.logs() })
			queryClient.invalidateQueries({ queryKey: integrationKeys.dashboard() })
		},
	})
}

// =========================================================================
// OAUTH MUTATIONS
// =========================================================================

/**
 * Hook to initiate QuickBooks OAuth connection.
 */
export function useInitiateQuickBooksConnection() {
	return useMutation({
		mutationFn: () => IntegrationService.initiateQuickBooksConnection(),
		onSuccess: (data) => {
			// Redirect to QuickBooks authorization
			window.location.href = data.authorizationUrl
		},
	})
}

/**
 * Hook to initiate NetSuite OAuth connection.
 */
export function useInitiateNetSuiteConnection() {
	return useMutation({
		mutationFn: () => IntegrationService.initiateNetSuiteConnection(),
		onSuccess: (data) => {
			// Redirect to NetSuite authorization
			window.location.href = data.authorizationUrl
		},
	})
}

// =========================================================================
// ENTITY SYNC STATUS
// =========================================================================

/**
 * Hook to check if an entity is synced to any ERP system.
 * PRD Reference: Section 3 (Customer View - see sync status indicators on orders)
 */
export function useEntitySyncStatus(
	entityType: string,
	entityId: string | number | null | undefined,
	options?: Omit<UseQueryOptions<IntegrationEntityMappingDTO | null, Error>, 'queryKey' | 'queryFn'>
) {
	return useQuery({
		queryKey: [...integrationKeys.mappings(), 'entity', entityType, entityId],
		queryFn: async () => {
			if (!entityId) return null

			// Get mappings for this specific entity (filter server-side)
			const result = await IntegrationService.getEntityMappings(
				undefined,
				entityType,
				1,
				1,
				String(entityId)
			)

			// Return first match (should only be one)
			return result.items?.[0] || null
		},
		enabled: !!entityId,
		staleTime: STALE_TIME_MODERATE,
		...options,
	})
}
