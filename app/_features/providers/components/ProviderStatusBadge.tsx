/**
 * ProviderStatusBadge Component
 * 
 * Displays the provider's status (Active/Suspended/Archived) with appropriate styling.
 * Follows the industry best practice status workflow.
 * 
 * STATUS WORKFLOW:
 * Active (green) -> Suspended (yellow/warning) -> Archived (red/error)
 * 
 * @module providers/components
 */

'use client'

import { Archive, CheckCircle, PauseCircle } from 'lucide-react'

import { ProviderStatus } from '@_classes/Provider'

import Badge from '@_components/ui/Badge'

import { getProviderStatusConfig } from '../constants'

interface ProviderStatusBadgeProps {
	/** Provider status (new enum-based) */
	status?: ProviderStatus
	/** Legacy: Whether the provider is archived (for backward compatibility) */
	isArchived?: boolean
	/** Badge size variant */
	size?: 'sm' | 'md' | 'lg'
	/** Whether to show only the icon */
	iconOnly?: boolean
	/** Additional CSS classes */
	className?: string
	/** Show tooltip with status description */
	showTooltip?: boolean
}

/**
 * Get the appropriate icon component for a status.
 */
function getStatusIcon(status: ProviderStatus) {
	switch (status) {
		case ProviderStatus.Active:
			return CheckCircle
		case ProviderStatus.Suspended:
			return PauseCircle
		case ProviderStatus.Archived:
			return Archive
		default:
			return CheckCircle
	}
}

/**
 * ProviderStatusBadge Component
 * 
 * Displays a badge showing the provider's status with appropriate color and icon.
 * Supports both new enum-based status and legacy isArchived flag.
 * 
 * @example
 * ```tsx
 * // New status-based usage
 * <ProviderStatusBadge status={ProviderStatus.Active} />
 * // Renders: [✓ Active] badge in green
 * 
 * <ProviderStatusBadge status={ProviderStatus.Suspended} size="sm" />
 * // Renders: [⏸ Suspended] badge in yellow
 * 
 * <ProviderStatusBadge status={ProviderStatus.Archived} iconOnly />
 * // Renders: Archive icon badge in red
 * 
 * // Legacy backward compatibility
 * <ProviderStatusBadge isArchived={true} />
 * // Renders: [📦 Archived] badge in red
 * ```
 */
export function ProviderStatusBadge({ 
	status,
	isArchived, 
	size = 'md',
	iconOnly = false,
	className = '',
	showTooltip = false,
}: ProviderStatusBadgeProps) {
	// Determine status: prefer new enum, fall back to legacy isArchived
	const resolvedStatus = status ?? (isArchived ? ProviderStatus.Archived : ProviderStatus.Active)
	const config = getProviderStatusConfig(resolvedStatus)
	
	const Icon = getStatusIcon(resolvedStatus)
	const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16

	const badge = (
		<Badge 
			variant={config.color}
			size={size}
			className={className}
		>
			<Icon size={iconSize} aria-hidden="true" />
			{!iconOnly && <span>{config.label}</span>}
		</Badge>
	)

	if (showTooltip) {
		return (
			<div className="tooltip" data-tip={config.description}>
				{badge}
			</div>
		)
	}

	return badge
}

export default ProviderStatusBadge

