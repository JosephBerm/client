/**
 * QuoteStatusBadge Component
 *
 * Specialized badge component for displaying quote status with appropriate colors.
 * Uses centralized QuoteStatusHelper for display names and variants (FAANG pattern).
 * 
 * **Pattern:** Follows OrderStatusBadge component structure for consistency.
 * 
 * **Features:**
 * - Quote status enum from central @_classes/Enums
 * - Automatic color mapping via QuoteStatusHelper.getVariant()
 * - Human-readable labels via QuoteStatusHelper.getDisplay()
 * - DaisyUI Badge integration
 * - Custom className support
 * - Type-safe status handling
 *
 * **Status Mapping (via QuoteStatusHelper):**
 * - Unread: Warning (yellow)
 * - Read: Info (blue)
 * - Approved: Success (green)
 * - Converted: Success (green)
 * - Rejected: Error (red)
 * - Expired: Neutral (gray)
 *
 * **Use Cases:**
 * - Quote list tables
 * - Quote detail pages
 * - Dashboard quote summaries
 * - Customer quote history
 *
 * @example
 * ```tsx
 * import QuoteStatusBadge from '@_components/common/QuoteStatusBadge'
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
 * {
 *   accessorKey: 'status',
 *   header: 'Status',
 *   cell: ({ getValue }) => (
 *     <QuoteStatusBadge status={getValue() as QuoteStatus} />
 *   )
 * }
 *
 * // Conditional rendering based on status
 * {quote.status === QuoteStatus.Approved && (
 *   <div>
 *     <QuoteStatusBadge status={quote.status} />
 *     <span>Ready to convert to order!</span>
 *   </div>
 * )}
 * ```
 *
 * @module QuoteStatusBadge
 */

import classNames from 'classnames'

import type { QuoteStatus } from '@_classes/Enums'
import QuoteStatusHelper from '@_classes/Helpers/QuoteStatusHelper'

/**
 * QuoteStatusBadge component props interface.
 * Extends HTMLSpanElement attributes to support data-testid and other HTML attributes.
 */
interface QuoteStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	/**
	 * Quote status enum value (from central enum)
	 * Numeric values: Unread=0, Read=1, Approved=2, Converted=3, Rejected=4, Expired=5
	 */
	status: QuoteStatus
}

/**
 * QuoteStatusBadge Component
 *
 * Renders a colored badge with the quote status label.
 * Uses QuoteStatusHelper for FAANG-level type-safety and DRY compliance.
 *
 * **Implementation:**
 * - Display name: QuoteStatusHelper.getDisplay(status)
 * - Badge variant: QuoteStatusHelper.getVariant(status)
 * - Zero hardcoded strings or magic values
 *
 * **DaisyUI Badge Variants:**
 * - success: Green background (Approved, Converted)
 * - error: Red background (Rejected)
 * - warning: Yellow/orange background (Unread)
 * - info: Blue background (Read)
 * - neutral: Gray background (Expired)
 *
 * @param props - Component props including status and className
 * @returns QuoteStatusBadge component
 */
export default function QuoteStatusBadge({ status, className, ...rest }: QuoteStatusBadgeProps) {
	// Get display name and variant from QuoteStatusHelper (zero magic strings!)
	const displayName = QuoteStatusHelper.getDisplay(status)
	const variant = QuoteStatusHelper.getVariant(status)

	return (
		<span
			className={classNames(
				'badge',
				{
					'badge-success': variant === 'success',
					'badge-error': variant === 'error',
					'badge-warning': variant === 'warning',
					'badge-info': variant === 'info',
					'badge-neutral': variant === 'neutral',
				},
				className
			)}
			{...rest}
		>
			{displayName}
		</span>
	)
}

