/**
 * Analytics Constants
 * 
 * Constants used across analytics components.
 * 
 * @module components/analytics/constants
 */

import type { TimeRange } from '@_features/analytics'

export const TIME_RANGES: readonly TimeRange[] = ['7d', '30d', '90d', '1y', 'custom'] as const

/**
 * Time range labels mapping.
 * Keys must match TimeRange type exactly (string literals).
 * 
 * Note: Property names use string literals ('7d', '30d', etc.) to match TimeRange union type.
 * These cannot be camelCase as they are type-safe literal keys.
 */
/* eslint-disable @typescript-eslint/naming-convention */
export const rangeLabels: Record<TimeRange, string> = {
	'7d': '7 Days',
	'30d': '30 Days',
	'90d': '90 Days',
	'1y': '1 Year',
	custom: 'Custom',
}
/* eslint-enable @typescript-eslint/naming-convention */
