/**
 * Tenant API Module
 *
 * Public tenant configuration endpoints used for theming and UI config.
 * Part of the domain-specific API split for better code organization.
 *
 * @module api/tenant
 */

import type { TenantConfigFormData } from '@_core/validation'
import { safeParseTenantConfig } from '@_core/validation'

import { HttpService } from '../httpService'

// =========================================================================
// TENANT API
// =========================================================================

/**
 * Tenant configuration API
 *
 * Routes:
 * - GET /api/tenant/config (public branding + UI config)
 */
export const TenantApi = {
	// =====================================================================
	// CONFIG
	// =====================================================================

	/**
	 * Validates and returns tenant config from API payload.
	 */
	parseConfig: (payload: unknown): TenantConfigFormData => {
		const parsed = safeParseTenantConfig(payload)

		if (!parsed.success || !parsed.data) {
			throw new Error(parsed.error ?? 'Invalid tenant config')
		}

		return parsed.data
	},

	/**
	 * Gets the current tenant configuration for theming + UI config.
	 */
	getConfig: async (
		options: { signal?: AbortSignal; headers?: HeadersInit } = {}
	): Promise<TenantConfigFormData> => {
		const response = await HttpService.get<unknown>('/api/tenant/config', {
			headers: {
				Accept: 'application/json',
				...(options.headers as Record<string, string> | undefined),
			},
			signal: options.signal,
		})

		const payload = response.data?.payload

		if (!payload) {
			throw new Error(response.data?.message ?? 'Failed to load tenant')
		}

		return TenantApi.parseConfig(payload)
	},

	/**
	 * Gets the current tenant configuration (public, non-cacheable).
	 * NO AUTHENTICATION - Does not access cookies().
	 */
	getConfigPublic: async (
		options: { signal?: AbortSignal; headers?: HeadersInit } = {}
	): Promise<TenantConfigFormData> => {
		const response = await HttpService.getPublic<unknown>('/api/tenant/config', {
			headers: {
				Accept: 'application/json',
				...(options.headers as Record<string, string> | undefined),
			},
			signal: options.signal,
		})

		const payload = response.data?.payload

		if (!payload) {
			throw new Error(response.data?.message ?? 'Failed to load tenant')
		}

		return TenantApi.parseConfig(payload)
	},

	/**
	 * Gets the current tenant configuration (public, cacheable).
	 * NO AUTHENTICATION - Does not access cookies().
	 * **SERVER COMPONENTS ONLY - Use with "use cache".**
	 */
	getConfigPublicCacheable: async (
		options: { signal?: AbortSignal; headers?: HeadersInit } = {}
	): Promise<TenantConfigFormData> => {
		const response = await HttpService.getPublic<unknown>('/api/tenant/config', {
			headers: {
				Accept: 'application/json',
				...(options.headers as Record<string, string> | undefined),
			},
			signal: options.signal,
		})

		const payload = response.data?.payload

		if (!payload) {
			throw new Error(response.data?.message ?? 'Failed to load tenant')
		}

		return TenantApi.parseConfig(payload)
	},
}
