/**
 * CustomerStatusBadge Component
 * 
 * Displays customer account status with appropriate styling.
 * Mobile-first responsive design with compact and full modes.
 * 
 * @module customers/components
 */

'use client'

import { Ban, CheckCircle, Clock, PauseCircle, XCircle } from 'lucide-react'

import { CustomerStatus } from '@_classes/Enums'

import { getCustomerStatusConfig } from '../constants'

interface CustomerStatusBadgeProps {
	/** Customer status value */
	status: CustomerStatus
	/** Display size */
	size?: 'sm' | 'md' | 'lg'
	/** Show icon only on mobile */
	iconOnly?: boolean
	/** Additional CSS classes */
	className?: string
}

/**
 * Icon mapping for customer statuses.
 */
const STATUS_ICONS = {
	[CustomerStatus.Active]: CheckCircle,
	[CustomerStatus.Suspended]: Ban,
	[CustomerStatus.PendingVerification]: Clock,
	[CustomerStatus.Inactive]: PauseCircle,
	[CustomerStatus.Churned]: XCircle,
}

/**
 * Color mapping for badge variants.
 */
const COLOR_CLASSES = {
	success: 'badge-success text-success-content',
	warning: 'badge-warning text-warning-content',
	error: 'badge-error text-error-content',
	info: 'badge-info text-info-content',
	neutral: 'badge-neutral text-neutral-content',
}

/**
 * Size classes for badges.
 */
const SIZE_CLASSES = {
	sm: 'badge-sm gap-1 text-xs',
	md: 'badge-md gap-1.5 text-sm',
	lg: 'badge-lg gap-2 text-base',
}

const ICON_SIZES = {
	sm: 12,
	md: 14,
	lg: 16,
}

/**
 * CustomerStatusBadge Component
 * 
 * Renders a badge displaying the customer's account status.
 * Includes appropriate icon and color coding for quick visual identification.
 */
function CustomerStatusBadge({
	status,
	size = 'md',
	iconOnly = false,
	className = '',
}: CustomerStatusBadgeProps) {
	const config = getCustomerStatusConfig(status)
	const Icon = STATUS_ICONS[status] || CheckCircle
	const colorClass = COLOR_CLASSES[config.color]
	const sizeClass = SIZE_CLASSES[size]
	const iconSize = ICON_SIZES[size]

	return (
		<span
			className={`badge ${colorClass} ${sizeClass} ${className}`}
			title={config.label}
		>
			<Icon size={iconSize} aria-hidden="true" />
			<span className={iconOnly ? 'sr-only sm:not-sr-only' : ''}>
				{config.label}
			</span>
		</span>
	)
}

export default CustomerStatusBadge

