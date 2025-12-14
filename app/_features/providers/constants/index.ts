/**
 * Provider Feature Constants
 * 
 * Configuration constants for provider status display and filtering.
 * Provides consistent styling and labeling throughout the application.
 * 
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 * 
 * @module providers/constants
 */

import { ProviderStatus } from '@_classes/Provider'

import type { ProviderStatusConfig, ProviderStatusKey } from '../types'

/**
 * Provider status configuration mapping.
 * Maps status to display properties for consistent UI.
 */
export const PROVIDER_STATUS_CONFIG: Record<ProviderStatusKey, ProviderStatusConfig> = {
	active: {
		label: 'Active',
		color: 'success',
		icon: 'check-circle',
		description: 'Provider is active and available for orders',
		enumValue: ProviderStatus.Active,
	},
	suspended: {
		label: 'Suspended',
		color: 'warning',
		icon: 'pause-circle',
		description: 'Provider is temporarily suspended',
		enumValue: ProviderStatus.Suspended,
	},
	archived: {
		label: 'Archived',
		color: 'error',
		icon: 'archive',
		description: 'Provider is archived and no longer available',
		enumValue: ProviderStatus.Archived,
	},
}

/**
 * Get provider status key from ProviderStatus enum.
 */
export function getStatusKey(status: ProviderStatus): ProviderStatusKey {
	switch (status) {
		case ProviderStatus.Active:
			return 'active'
		case ProviderStatus.Suspended:
			return 'suspended'
		case ProviderStatus.Archived:
			return 'archived'
		default:
			return 'active'
	}
}

/**
 * Get provider status configuration based on status enum.
 * 
 * @param status - ProviderStatus enum value
 * @returns Status configuration object
 */
export function getProviderStatusConfig(status: ProviderStatus): ProviderStatusConfig {
	const key = getStatusKey(status)
	return PROVIDER_STATUS_CONFIG[key]
}

/**
 * Get provider status configuration based on legacy isArchived flag.
 * For backward compatibility.
 * 
 * @param isArchived - Whether the provider is archived
 * @returns Status configuration object
 */
export function getProviderStatusConfigLegacy(isArchived: boolean): ProviderStatusConfig {
	return isArchived ? PROVIDER_STATUS_CONFIG.archived : PROVIDER_STATUS_CONFIG.active
}

/**
 * Provider status options for select dropdowns.
 */
export const PROVIDER_STATUS_OPTIONS = [
	{ value: 'all', label: 'All Providers' },
	{ value: 'active', label: 'Active Only' },
	{ value: 'suspended', label: 'Suspended Only' },
	{ value: 'archived', label: 'Archived Only' },
] as const

/**
 * Provider status filter options for quick filters.
 */
export const PROVIDER_QUICK_FILTERS = [
	{ key: 'all', label: 'All', count: 'totalProviders' as const },
	{ key: 'active', label: 'Active', count: 'activeProviders' as const },
	{ key: 'suspended', label: 'Suspended', count: 'suspendedProviders' as const },
	{ key: 'archived', label: 'Archived', count: 'archivedProviders' as const },
] as const

/**
 * Default page size for provider lists.
 */
export const DEFAULT_PROVIDER_PAGE_SIZE = 10

/**
 * Default sort field for provider lists.
 */
export const DEFAULT_PROVIDER_SORT_FIELD = 'createdAt'

/**
 * Default sort order for provider lists.
 */
export const DEFAULT_PROVIDER_SORT_ORDER = 'desc' as const

