/**
 * Payment Status Badge Component
 *
 * Displays payment status with appropriate color coding.
 * Uses DaisyUI badge component with semantic colors.
 *
 * @module payments/components/PaymentStatusBadge
 */

'use client'

import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Loader2,
	RefreshCcw,
	XCircle,
	type LucideIcon,
} from 'lucide-react'

import { PaymentStatus, getPaymentStatusDisplay } from '../types'

// =========================================================================
// COMPONENT TYPES
// =========================================================================

export interface PaymentStatusBadgeProps {
	/** Payment status to display */
	status: PaymentStatus
	/** Whether to show the icon */
	showIcon?: boolean
	/** Size variant */
	size?: 'xs' | 'sm' | 'md' | 'lg'
	/** Additional class names */
	className?: string
}

// =========================================================================
// STATUS CONFIGURATION
// =========================================================================

interface StatusConfig {
	color: string
	icon: LucideIcon
}

const STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
	[PaymentStatus.Pending]: {
		color: 'badge-ghost',
		icon: Clock,
	},
	[PaymentStatus.RequiresPaymentMethod]: {
		color: 'badge-warning',
		icon: AlertCircle,
	},
	[PaymentStatus.RequiresConfirmation]: {
		color: 'badge-warning',
		icon: AlertCircle,
	},
	[PaymentStatus.RequiresAction]: {
		color: 'badge-warning',
		icon: AlertCircle,
	},
	[PaymentStatus.Processing]: {
		color: 'badge-info',
		icon: Loader2,
	},
	[PaymentStatus.Succeeded]: {
		color: 'badge-success',
		icon: CheckCircle2,
	},
	[PaymentStatus.Failed]: {
		color: 'badge-error',
		icon: XCircle,
	},
	[PaymentStatus.Cancelled]: {
		color: 'badge-ghost',
		icon: XCircle,
	},
	[PaymentStatus.Refunded]: {
		color: 'badge-info',
		icon: RefreshCcw,
	},
	[PaymentStatus.PartiallyRefunded]: {
		color: 'badge-warning',
		icon: RefreshCcw,
	},
}

const SIZE_CLASSES = {
	xs: 'badge-xs',
	sm: 'badge-sm',
	md: '',
	lg: 'badge-lg',
}

const ICON_SIZES = {
	xs: 'h-2.5 w-2.5',
	sm: 'h-3 w-3',
	md: 'h-3.5 w-3.5',
	lg: 'h-4 w-4',
}

// =========================================================================
// PAYMENT STATUS BADGE COMPONENT
// =========================================================================

/**
 * PaymentStatusBadge Component
 *
 * Displays a styled badge for payment status.
 *
 * @example
 * ```tsx
 * <PaymentStatusBadge status={PaymentStatus.Succeeded} />
 * <PaymentStatusBadge status={PaymentStatus.Processing} showIcon />
 * <PaymentStatusBadge status={PaymentStatus.Failed} size="lg" />
 * ```
 */
export function PaymentStatusBadge({
	status,
	showIcon = true,
	size = 'sm',
	className = '',
}: PaymentStatusBadgeProps) {
	const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[PaymentStatus.Pending]
	const Icon = config.icon
	const displayText = getPaymentStatusDisplay(status)
	const isAnimating = status === PaymentStatus.Processing

	return (
		<span
			className={`badge ${config.color} ${SIZE_CLASSES[size]} gap-1 font-medium ${className}`}
			title={displayText}
		>
			{showIcon && (
				<Icon className={`${ICON_SIZES[size]} ${isAnimating ? 'animate-spin' : ''}`} />
			)}
			{displayText}
		</span>
	)
}

export default PaymentStatusBadge
