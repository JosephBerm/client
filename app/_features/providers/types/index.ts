/**
 * Provider Feature Types
 * 
 * Type definitions for provider/vendor management.
 * Follows the same pattern as customers feature module.
 * 
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 * 
 * @module providers/types
 */

import type { ProviderStatus } from '@_classes/Provider'

/**
 * Aggregate provider statistics for dashboard display.
 * Provides counts of providers by status and other metrics.
 */
export interface AggregateProviderStats {
	/** Total number of providers in the system */
	totalProviders: number
	/** Number of active providers (available for orders) */
	activeProviders: number
	/** Number of suspended providers (on hold) */
	suspendedProviders: number
	/** Number of archived providers (inactive) */
	archivedProviders: number
	/** Number of providers added this month */
	newThisMonth: number
	/** Number of providers with products */
	withProducts: number
	/** Number of providers without products */
	withoutProducts: number
}

/**
 * Provider status key type.
 */
export type ProviderStatusKey = 'active' | 'suspended' | 'archived'

/**
 * Provider status configuration for display.
 */
export interface ProviderStatusConfig {
	label: string
	color: 'success' | 'warning' | 'error' | 'info' | 'neutral'
	icon: string
	description: string
	enumValue: ProviderStatus
}

/**
 * Provider filter options for search.
 */
export interface ProviderFilterOptions {
	/** Filter by archived status */
	isArchived?: boolean
	/** Filter by name (partial match) */
	name?: string
	/** Filter by email */
	email?: string
}

/**
 * Provider list item for table display.
 * Subset of full provider data optimized for list views.
 */
export interface ProviderListItem {
	id: number
	name: string
	email: string
	phone?: string
	website?: string
	identifier?: string
	isArchived: boolean
	createdAt: Date
	productCount?: number
}

/**
 * Provider form data structure for create/update forms.
 */
export interface ProviderFormData {
	name: string
	email: string
	phone?: string
	taxId?: string
	website?: string
	identifier?: string
	address?: {
		street?: string
		city?: string
		state?: string
		zipCode?: string
		country?: string
	}
}

