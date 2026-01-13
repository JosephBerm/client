/**
 * Integration Feature Constants
 *
 * Centralizes magic numbers and configuration values for DRY compliance.
 * Follows MAANG best practices for maintainability and consistency.
 *
 * @module integrations/constants
 */

// =========================================================================
// QUERY STALE TIMES (milliseconds)
// =========================================================================

/**
 * Stale time for data that changes frequently (connections, stats).
 * 30 seconds - balances freshness with API load.
 */
export const STALE_TIME_FREQUENT = 30_000 as const

/**
 * Stale time for data that changes less frequently (settings, checkpoints).
 * 60 seconds - reduces unnecessary refetches.
 */
export const STALE_TIME_MODERATE = 60_000 as const

/**
 * Stale time for rarely changing data (templates, configurations).
 */
export const STALE_TIME_RARE = 300_000 as const // 5 minutes

// =========================================================================
// POLLING INTERVALS (milliseconds)
// =========================================================================

/**
 * Dashboard refetch interval - every minute.
 */
export const DASHBOARD_REFETCH_INTERVAL = 60_000 as const

/**
 * Sync status polling interval - every 2 seconds during active sync.
 */
export const SYNC_STATUS_POLL_INTERVAL = 2_000 as const

// =========================================================================
// PAGINATION DEFAULTS
// =========================================================================

export const DEFAULT_PAGE_SIZE = 20 as const
export const DEFAULT_PAGE_NUMBER = 1 as const
export const MAX_PAGE_SIZE = 100 as const

// =========================================================================
// SYNC STATUS VALUES
// =========================================================================

export const SYNC_COMPLETE_STATUSES = ['Completed', 'Failed'] as const

// =========================================================================
// PROVIDER NAMES (match backend IntegrationConstants.cs)
// =========================================================================

export const PROVIDERS = {
	QUICKBOOKS: 'QuickBooks',
	NETSUITE: 'NetSuite',
} as const

// =========================================================================
// ENTITY TYPES (match backend IntegrationConstants.cs)
// =========================================================================

export const ENTITY_TYPES = {
	CUSTOMER: 'Customer',
	INVOICE: 'Invoice',
	PAYMENT: 'Payment',
	PRODUCT: 'Product',
	ORDER: 'Order',
} as const
