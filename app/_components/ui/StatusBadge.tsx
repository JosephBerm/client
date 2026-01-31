/**
 * StatusBadge Component - MAANG-Level Status Display
 *
 * Intermediate component that bridges domain-specific status badges with the base Badge component.
 * Provides status-specific features like icons, tooltips, and accessibility enhancements.
 *
 * **Architecture (3-Tier Badge System):**
 * ```
 * TIER 3: Domain Badges (QuoteStatusBadge, OrderStatusBadge, etc.)
 *    ↓ Pass status → StatusBadge props via Helpers
 * TIER 2: StatusBadge (this component)
 *    ↓ Maps variant/label/icon → Badge props
 * TIER 1: Badge (base DaisyUI 5 component)
 * ```
 *
 * **Features:**
 * - Icon support with automatic sizing
 * - Tooltip support for status descriptions
 * - Consistent gap between icon and text (DaisyUI 5 native)
 * - Full Badge prop forwarding (size, style, className)
 * - Accessible (aria-label for screen readers)
 *
 * **Usage:**
 * Domain badges should use this component instead of Badge directly.
 * This ensures consistent status display across the entire application.
 *
 * @example
 * ```tsx
 * import StatusBadge from '@_components/ui/StatusBadge'
 *
 * // Simple status
 * <StatusBadge variant="success" label="Active" />
 *
 * // With icon
 * <StatusBadge
 *   variant="warning"
 *   label="Pending"
 *   icon={<Clock className="size-[1em]" />}
 * />
 *
 * // With tooltip (description)
 * <StatusBadge
 *   variant="error"
 *   label="Rejected"
 *   description="Quote was declined by customer"
 * />
 *
 * // Soft style (for subtle indicators)
 * <StatusBadge
 *   variant="info"
 *   label="Read"
 *   style="soft"
 * />
 * ```
 *
 * @see Badge - Base component
 * @see QuoteStatusBadge - Domain badge example
 * @module StatusBadge
 */

import type { ReactNode } from 'react'

import Badge, { type BadgeVariant, type BadgeStyle, type BadgeSize } from './Badge'

// ============================================================================
// TYPES
// ============================================================================

/**
 * StatusBadge component props interface.
 * Extends Badge capabilities with status-specific features.
 */
export interface StatusBadgeProps {
	/**
	 * Badge color variant.
	 * Semantic colors for status indication.
	 */
	variant: BadgeVariant

	/**
	 * Status label text.
	 * Human-readable status name (e.g., "Approved", "Pending", "Expired").
	 */
	label: string

	/**
	 * Optional icon to display before the label.
	 * Use `className="size-[1em]"` for proper scaling with text.
	 *
	 * @example
	 * ```tsx
	 * <StatusBadge
	 *   variant="success"
	 *   label="Complete"
	 *   icon={<CheckCircle className="size-[1em]" />}
	 * />
	 * ```
	 */
	icon?: ReactNode

	/**
	 * Optional description for tooltip/aria-label.
	 * Provides additional context about the status.
	 */
	description?: string

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
	 * Additional custom classes.
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
 * StatusBadge Component
 *
 * Status-aware badge with icon support and accessibility features.
 * All domain status badges should use this component for consistency.
 *
 * **Design Decisions:**
 * - Icons use `size-[1em]` to scale with badge text
 * - DaisyUI 5 provides native gap-2 between badge content
 * - Description is used for both tooltip title and aria-label
 * - Forwards all Badge props for full customization
 *
 * @param props - StatusBadge configuration props
 * @returns StatusBadge component
 */
export default function StatusBadge({
	variant,
	label,
	icon,
	description,
	badgeStyle = 'solid',
	size = 'md',
	className,
	'data-testid': testId,
}: StatusBadgeProps) {
	// Build accessible label
	const ariaLabel = description ? `${label}: ${description}` : label

	return (
		<Badge
			variant={variant}
			badgeStyle={badgeStyle}
			size={size}
			className={className}
			data-testid={testId}
			aria-label={ariaLabel}
			title={description}
		>
			{icon}
			{label}
		</Badge>
	)
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export types for convenience
export type { BadgeVariant, BadgeStyle, BadgeSize }
