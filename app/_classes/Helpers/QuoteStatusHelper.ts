/**
 * QuoteStatusHelper - FAANG-Level Enum Helper
 * 
 * Centralized metadata and helper functions for QuoteStatus enum.
 * Used for tracking quote request (RFQ) review status.
 * 
 * **Pattern:** Exhaustive metadata mapping (Google/Netflix/Stripe standard)
 * 
 * **Features:**
 * - Display names for UI
 * - Badge variants for status indicators
 * - Descriptions for tooltips
 * - Icon names for visual feedback
 * 
 * @example
 * ```typescript
 * import QuoteStatusHelper from '@_classes/Helpers/QuoteStatusHelper'
 * import { QuoteStatus } from '@_classes/Enums'
 * 
 * // Get display name
 * const name = QuoteStatusHelper.getDisplay(QuoteStatus.Unread)
 * // → "Unread"
 * 
 * // Render status badge
 * <Badge variant={QuoteStatusHelper.getVariant(quote.status)}>
 *   {QuoteStatusHelper.getDisplay(quote.status)}
 * </Badge>
 * 
 * // Check if quote needs attention
 * if (QuoteStatusHelper.needsReview(quote.status)) {
 *   // Alert staff
 * }
 * ```
 * 
 * @module Helpers/QuoteStatusHelper
 */

import { QuoteStatus } from '../Enums'

/**
 * Badge variant for status indicators
 */
export type QuoteStatusVariant = 'warning' | 'info' | 'success' | 'error'

/**
 * Complete metadata for a QuoteStatus enum value
 */
export interface QuoteStatusMetadata {
	/** Enum value */
	value: QuoteStatus
	/** Human-readable display name */
	display: string
	/** Badge variant for UI */
	variant: QuoteStatusVariant
	/** Detailed description */
	description: string
	/** Icon name for visual feedback */
	iconName: string
	/** Whether this status requires staff attention */
	needsAttention: boolean
}

/**
 * Exhaustive metadata map for QuoteStatus enum
 * 
 * TypeScript enforces: If you add a new QuoteStatus, you MUST add metadata here.
 */
const QUOTE_STATUS_METADATA_MAP: Record<QuoteStatus, QuoteStatusMetadata> = {
	[QuoteStatus.Unread]: {
		value: QuoteStatus.Unread,
		display: 'Unread',
		variant: 'warning',
		description: 'Quote request has not been reviewed by staff yet',
		iconName: 'MailUnreadIcon',
		needsAttention: true,
	},
	[QuoteStatus.Read]: {
		value: QuoteStatus.Read,
		display: 'Read',
		variant: 'info',
		description: 'Quote request has been reviewed by staff',
		iconName: 'MailReadIcon',
		needsAttention: false,
	},
	[QuoteStatus.Approved]: {
		value: QuoteStatus.Approved,
		display: 'Approved',
		variant: 'success',
		description: 'Staff approved pricing, quote sent to customer',
		iconName: 'CheckCircleIcon',
		needsAttention: false,
	},
	[QuoteStatus.Converted]: {
		value: QuoteStatus.Converted,
		display: 'Converted',
		variant: 'success',
		description: 'Customer accepted, quote converted to order',
		iconName: 'CheckCircleIcon',
		needsAttention: false,
	},
	[QuoteStatus.Rejected]: {
		value: QuoteStatus.Rejected,
		display: 'Rejected',
		variant: 'error',
		description: 'Quote declined by staff or customer',
		iconName: 'XCircleIcon',
		needsAttention: false,
	},
	[QuoteStatus.Expired]: {
		value: QuoteStatus.Expired,
		display: 'Expired',
		variant: 'warning',
		description: 'Quote passed validity period without action',
		iconName: 'ClockIcon',
		needsAttention: false,
	},
}

/**
 * QuoteStatusHelper - Static helper class
 * 
 * Provides type-safe access to QuoteStatus metadata.
 */
export default class QuoteStatusHelper {
	/**
	 * Array of all QuoteStatus metadata
	 * 
	 * @example
	 * ```typescript
	 * // Populate status filter
	 * <FormSelect
	 *   options={QuoteStatusHelper.toList.map(meta => ({
	 *     value: meta.value,
	 *     label: meta.display,
	 *   }))}
	 * />
	 * ```
	 */
	static readonly toList: QuoteStatusMetadata[] = Object.values(QUOTE_STATUS_METADATA_MAP)

	/**
	 * Get display name for a status
	 * 
	 * @param status - QuoteStatus enum value
	 * @returns Display name string
	 * 
	 * @example
	 * ```typescript
	 * QuoteStatusHelper.getDisplay(QuoteStatus.Unread)
	 * // → "Unread"
	 * ```
	 */
	static getDisplay(status: QuoteStatus): string {
		return QUOTE_STATUS_METADATA_MAP[status]?.display || 'Unknown'
	}

	/**
	 * Get badge variant for UI styling
	 * 
	 * @param status - QuoteStatus enum value
	 * @returns Variant string
	 * 
	 * @example
	 * ```typescript
	 * <Badge variant={QuoteStatusHelper.getVariant(quote.status)}>
	 *   {QuoteStatusHelper.getDisplay(quote.status)}
	 * </Badge>
	 * ```
	 */
	static getVariant(status: QuoteStatus): QuoteStatusVariant {
		return QUOTE_STATUS_METADATA_MAP[status]?.variant || 'info'
	}

	/**
	 * Get description for a status
	 * 
	 * @param status - QuoteStatus enum value
	 * @returns Description string
	 * 
	 * @example
	 * ```typescript
	 * const desc = QuoteStatusHelper.getDescription(QuoteStatus.Unread)
	 * // → "Quote request has not been reviewed by staff yet"
	 * ```
	 */
	static getDescription(status: QuoteStatus): string {
		return QUOTE_STATUS_METADATA_MAP[status]?.description || 'No description available'
	}

	/**
	 * Get full metadata for a status
	 * 
	 * @param status - QuoteStatus enum value
	 * @returns Complete metadata object
	 * 
	 * @example
	 * ```typescript
	 * const meta = QuoteStatusHelper.getMetadata(QuoteStatus.Read)
	 * console.log(meta.iconName)         // "MailReadIcon"
	 * console.log(meta.needsAttention)   // false
	 * ```
	 */
	static getMetadata(status: QuoteStatus): QuoteStatusMetadata {
		return QUOTE_STATUS_METADATA_MAP[status]
	}

	/**
	 * Get icon name for a status
	 * 
	 * @param status - QuoteStatus enum value
	 * @returns Icon name string
	 * 
	 * @example
	 * ```typescript
	 * const iconName = QuoteStatusHelper.getIconName(QuoteStatus.Unread)
	 * // → "MailUnreadIcon"
	 * ```
	 */
	static getIconName(status: QuoteStatus): string {
		return QUOTE_STATUS_METADATA_MAP[status]?.iconName || 'MailIcon'
	}

	/**
	 * Check if status requires staff attention
	 * 
	 * @param status - QuoteStatus enum value
	 * @returns True if needs attention (Unread)
	 * 
	 * @example
	 * ```typescript
	 * if (QuoteStatusHelper.needsReview(quote.status)) {
	 *   // Show notification to staff
	 * }
	 * ```
	 */
	static needsReview(status: QuoteStatus): boolean {
		return QUOTE_STATUS_METADATA_MAP[status]?.needsAttention || false
	}

	/**
	 * Get all statuses that need attention
	 * 
	 * @returns Array of QuoteStatus values requiring attention
	 * 
	 * @example
	 * ```typescript
	 * const needsAttention = QuoteStatusHelper.getStatusesNeedingAttention()
	 * // → [QuoteStatus.Unread]
	 * 
	 * // Filter quotes
	 * const unreadQuotes = quotes.filter(q =>
	 *   needsAttention.includes(q.status)
	 * )
	 * ```
	 */
	static getStatusesNeedingAttention(): QuoteStatus[] {
		return this.toList.filter((meta) => meta.needsAttention).map((meta) => meta.value)
	}

	/**
	 * Check if a value is a valid QuoteStatus enum value
	 * 
	 * @param value - Value to check
	 * @returns True if valid QuoteStatus
	 * 
	 * @example
	 * ```typescript
	 * const status = getStatusFromAPI()
	 * 
	 * if (QuoteStatusHelper.isValid(status)) {
	 *   // TypeScript now knows status is QuoteStatus
	 *   const display = QuoteStatusHelper.getDisplay(status)
	 * }
	 * ```
	 */
	static isValid(value: unknown): value is QuoteStatus {
		if (typeof value !== 'number') {return false}
		return Object.values(QuoteStatus).includes(value as QuoteStatus)
	}
}

