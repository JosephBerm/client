/**
 * Providers API Module
 *
 * Medical supply providers and suppliers management.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/providers
 */

import type { RichSearchFilter, RichPagedResult } from '@_components/tables/RichDataGrid'

import { HttpService } from '../httpService'

// =========================================================================
// PROVIDERS API
// =========================================================================

/**
 * Provider/Supplier Management API
 * Manages medical supply providers and suppliers.
 */
export const ProvidersApi = {
	/**
	 * Gets a single provider by ID (GUID).
	 */
	get: async <Provider>(id: string) => HttpService.get<Provider>(`/provider/${id}`),

	/**
	 * Gets all providers.
	 */
	getAll: async <Provider>() => HttpService.get<Provider[]>('/providers'),

	/**
	 * Gets only active (non-archived) providers.
	 */
	getActive: async <Provider>() => HttpService.get<Provider[]>('/providers/active'),

	/**
	 * Gets aggregate provider statistics for dashboard.
	 */
	getAggregateStats: async () =>
		HttpService.get<{
			totalProviders: number
			activeProviders: number
			suspendedProviders: number
			archivedProviders: number
			newThisMonth: number
			withProducts: number
			withoutProducts: number
		}>('/providers/stats'),

	/**
	 * Creates a new provider.
	 */
	create: async <Provider>(provider: Provider) => HttpService.post<Provider>('/provider', provider),

	/**
	 * Updates an existing provider.
	 */
	update: async <Provider>(provider: Provider) => HttpService.put<Provider>('/provider', provider),

	/**
	 * Archives a provider (final status in workflow).
	 */
	archive: async (providerId: string) => HttpService.put<boolean>(`/provider/${providerId}/archive`, {}),

	/**
	 * Suspends a provider (temporary hold).
	 */
	suspend: async (providerId: string, reason: string) =>
		HttpService.put<boolean>(`/provider/${providerId}/suspend`, { reason }),

	/**
	 * Activates a provider (restores from any status).
	 */
	activate: async (providerId: string) => HttpService.put<boolean>(`/provider/${providerId}/activate`, {}),

	/**
	 * Restores an archived provider (alias for activate).
	 */
	restore: async (providerId: string) => HttpService.put<boolean>(`/provider/${providerId}/restore`, {}),

	/**
	 * Deletes a provider (hard delete).
	 */
	delete: async (providerId: string) => HttpService.delete<boolean>(`/provider/${providerId}`),

	/**
	 * Rich search for providers with advanced filtering, sorting, and facets.
	 */
	richSearch: async <Provider>(filter: RichSearchFilter) =>
		HttpService.post<RichPagedResult<Provider>>(`/providers/search/rich`, filter),
}
