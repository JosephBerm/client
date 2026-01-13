'use client'

/**
 * SyncStatusBadge Component
 *
 * Displays the ERP synchronization status for an entity (order, customer, etc.).
 *
 * @remarks
 * PRD Reference: prd_erp_integration.md - Section 3 (Customer can see sync status)
 *
 * **Display Conditions:**
 * - Shows only when tenant has an active ERP connection
 * - Indicates if entity is synced to external ERP system
 * - Shows last sync timestamp when available
 *
 * @module components/common/SyncStatusBadge
 */

import { CloudOff, CloudCheck, RefreshCw, AlertTriangle } from 'lucide-react'

import Badge from '@_components/ui/Badge'
import { Tooltip } from '@_components/ui/Tooltip'

export type SyncState = 'synced' | 'pending' | 'error' | 'not_synced'

interface SyncStatusBadgeProps {
	/** Current sync state */
	state: SyncState
	/** Name of the ERP provider (e.g., "QuickBooks", "NetSuite") */
	provider?: string
	/** Last sync timestamp */
	lastSyncAt?: Date | string | null
	/** Error message if sync failed */
	errorMessage?: string
	/** Whether the badge should be compact (icon only) */
	compact?: boolean
}

/**
 * Badge showing ERP synchronization status.
 *
 * @example
 * ```tsx
 * <SyncStatusBadge
 *   state="synced"
 *   provider="QuickBooks"
 *   lastSyncAt="2026-01-12T10:30:00Z"
 * />
 * ```
 */
export function SyncStatusBadge({
	state,
	provider,
	lastSyncAt,
	errorMessage,
	compact = false,
}: SyncStatusBadgeProps) {
	const syncTime = lastSyncAt
		? new Date(lastSyncAt).toLocaleString(undefined, {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		: null

	const config = {
		synced: {
			icon: CloudCheck,
			label: 'Synced',
			variant: 'success' as const,
			tooltip: `Synced to ${provider || 'ERP'}${syncTime ? ` on ${syncTime}` : ''}`,
		},
		pending: {
			icon: RefreshCw,
			label: 'Syncing',
			variant: 'warning' as const,
			tooltip: `Sync pending to ${provider || 'ERP'}`,
		},
		error: {
			icon: AlertTriangle,
			label: 'Sync Error',
			variant: 'error' as const,
			tooltip: errorMessage || `Failed to sync to ${provider || 'ERP'}`,
		},
		not_synced: {
			icon: CloudOff,
			label: 'Not Synced',
			variant: 'neutral' as const,
			tooltip: `Not synced to ${provider || 'ERP'}`,
		},
	}

	const { icon: Icon, label, variant, tooltip } = config[state]

	const badge = (
		<Badge variant={variant} size='sm' className='gap-1'>
			<Icon className='h-3 w-3' />
			{!compact && <span>{label}</span>}
		</Badge>
	)

	if (compact || tooltip) {
		return (
			<Tooltip content={tooltip}>
				<span>{badge}</span>
			</Tooltip>
		)
	}

	return badge
}

export default SyncStatusBadge
