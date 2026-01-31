/**
 * @fileoverview Server-Side Tenant Config Fetching with Cache Components
 *
 * Public tenant configuration is cacheable and safe to share across users.
 * Uses Next.js 16 Cache Components (`"use cache"`) for fast, consistent theming.
 *
 * @module features/tenant/server
 */

import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import { logger } from '@_core'

import { TenantApi } from '@_shared/services/api/tenant.api'
import type { TenantConfigFormData } from '@_core/validation'

/**
 * Fetch tenant config server-side with shared caching.
 *
 * @param host - Request host for tenant resolution
 */
export async function fetchTenantConfigServer(
	host: string | null
): Promise<TenantConfigFormData | null> {
	'use cache'

	cacheTag('tenant-config', host ? `tenant-config-${host}` : 'tenant-config-default')
	cacheLife('minutes')

	try {
		const headers = host ? { host } : undefined
		return await TenantApi.getConfigPublicCacheable({ headers })
	} catch (error) {
		logger.warn('Failed to fetch tenant config on server', {
			error,
			component: 'TenantServerConfig',
			host,
		})
		return null
	}
}
