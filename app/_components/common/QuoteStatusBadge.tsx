/**
 * QuoteStatusBadge Component
 *
 * Domain-specific badge for displaying quote status.
 * Uses centralized QuoteStatusHelper for display names and variants (FAANG pattern).
 *
 * **Architecture (3-Tier Badge System):**
 * ```
 * QuoteStatusBadge (this - TIER 3)
 *    ↓ Maps QuoteStatus → StatusBadge props via QuoteStatusHelper
 * StatusBadge (TIER 2)
 *    ↓ Adds icon support, accessibility
 * Badge (TIER 1 - native DaisyUI 5)
 * ```
 *
 * **Features:**
 * - Quote status enum from central @_classes/Enums
 * - Automatic color mapping via QuoteStatusHelper.getVariant()
 * - Human-readable labels via QuoteStatusHelper.getDisplay()
 * - Tooltip descriptions via QuoteStatusHelper.getDescription()
 * - Full theme support (light/dark/custom themes)
 * - Zero hardcoded strings or magic values
 *
 * **Status Mapping (via QuoteStatusHelper):**
 * - Unread: Warning (yellow) - Needs staff attention
 * - Read: Info (blue) - Reviewed by staff
 * - Approved: Success (green) - Pricing sent to customer
 * - Converted: Success (green) - Converted to order
 * - Rejected: Error (red) - Quote declined
 * - Expired: Neutral (gray) - Validity period passed
 *
 * **Use Cases:**
 * - Quote list tables
 * - Quote detail pages
 * - Dashboard quote summaries
 * - Customer quote history
 *
 * @example
 * ```tsx
 * import { QuoteStatusBadge } from '@_components/common'
 * import { QuoteStatus } from '@_classes/Enums'
 *
 * // Basic usage
 * <QuoteStatusBadge status={QuoteStatus.Unread} />
 * <QuoteStatusBadge status={QuoteStatus.Approved} />
 *
 * // With numeric value from API
 * <QuoteStatusBadge status={quote.status} />
 *
 * // With custom className
 * <QuoteStatusBadge status={QuoteStatus.Read} className="ml-2" />
 *
 * // In a table cell
 * cell: ({ row }) => <QuoteStatusBadge status={row.original.status} />
 * ```
 *
 * @see QuoteStatusHelper - Status metadata
 * @see StatusBadge - Intermediate component
 * @module QuoteStatusBadge
 */

import type { QuoteStatus } from '@_classes/Enums'
import QuoteStatusHelper from '@_classes/Helpers/QuoteStatusHelper'

import StatusBadge, { type BadgeStyle, type BadgeSize } from '@_components/ui/StatusBadge'

// ============================================================================
// TYPES
// ============================================================================

/**
 * QuoteStatusBadge component props interface.
 * Extends HTMLSpanElement attributes to support data-testid and other HTML attributes.
 */
interface QuoteStatusBadgeProps {
	/**
	 * Quote status enum value (from central enum).
	 * Numeric values: Unread=0, Read=1, Approved=2, Converted=3, Rejected=4, Expired=5
	 */
	status: QuoteStatus

	/**
	 * Badge visual style.
	 * @default 'solid'
	 */
	badgeStyle?: BadgeStyle

	/**
	 * Badge size.
	 * @default 'md'
	 */
	size?: BadgeSize

	/**
	 * Additional CSS classes.
	 */
	className?: string

	/**
	 * HTML data attribute for testing.
	 */
	'data-testid'?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * QuoteStatusBadge Component
 *
 * Renders a colored badge with the quote status label.
 * Uses QuoteStatusHelper for FAANG-level type-safety and DRY compliance.
 *
 * **Implementation:**
 * - Display name: QuoteStatusHelper.getDisplay(status)
 * - Badge variant: QuoteStatusHelper.getVariant(status)
 * - Description: QuoteStatusHelper.getDescription(status)
 * - Zero hardcoded strings or magic values
 *
 * @param props - Component props including status and className
 * @returns QuoteStatusBadge component
 */
export default function QuoteStatusBadge({
	status,
	badgeStyle = 'solid',
	size = 'md',
	className,
	'data-testid': testId,
}: QuoteStatusBadgeProps) {
	// Get all metadata from QuoteStatusHelper (zero magic strings!)
	const label = QuoteStatusHelper.getDisplay(status)
	const variant = QuoteStatusHelper.getVariant(status)
	const description = QuoteStatusHelper.getDescription(status)

	return (
		<StatusBadge
			variant={variant}
			label={label}
			description={description}
			badgeStyle={badgeStyle}
			size={size}
			className={className}
			data-testid={testId}
		/>
	)
}
