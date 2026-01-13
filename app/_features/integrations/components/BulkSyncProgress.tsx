'use client'

/**
 * BulkSyncProgress Component
 *
 * Displays progress indicator for bulk synchronization operations.
 *
 * @remarks
 * PRD Reference: prd_erp_integration.md - Section 6.2 (Dashboard)
 *
 * **Features:**
 * - Real-time progress tracking
 * - Entity type breakdown
 * - Error/success counts
 * - Cancel operation support
 *
 * @module features/integrations/components/BulkSyncProgress
 */

import { useMemo, useCallback } from 'react'

import {
	XCircle,
	CheckCircle,
	AlertTriangle,
	RefreshCw,
	Loader2,
} from 'lucide-react'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Card from '@_components/ui/Card'

import { ENTITY_TYPES, PROVIDERS } from '../constants'

// =========================================================================
// TYPES
// =========================================================================

export interface BulkSyncProgressItem {
	entityType: string
	total: number
	completed: number
	failed: number
	status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

export interface BulkSyncProgressData {
	id: string
	provider: string
	startedAt: Date | string
	estimatedCompletionAt?: Date | string | null
	items: BulkSyncProgressItem[]
	overallStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
	errorMessage?: string
}

interface BulkSyncProgressProps {
	/** Sync progress data */
	data: BulkSyncProgressData
	/** Callback when cancel is requested */
	onCancel?: (syncId: string) => void
	/** Whether cancel is in progress */
	cancelling?: boolean
	/** Whether to show in compact mode */
	compact?: boolean
}

// =========================================================================
// HELPERS
// =========================================================================

const getEntityTypeLabel = (type: string): string => {
	const labels: Record<string, string> = {
		[ENTITY_TYPES.CUSTOMER]: 'Customers',
		[ENTITY_TYPES.INVOICE]: 'Invoices',
		[ENTITY_TYPES.PAYMENT]: 'Payments',
		[ENTITY_TYPES.PRODUCT]: 'Products',
	}
	return labels[type] || type
}

const getProviderLabel = (provider: string): string => {
	const labels: Record<string, string> = {
		[PROVIDERS.QUICKBOOKS]: 'QuickBooks',
		[PROVIDERS.NETSUITE]: 'NetSuite',
	}
	return labels[provider] || provider
}

const getStatusIcon = (status: string) => {
	switch (status) {
		case 'completed':
			return <CheckCircle className="w-4 h-4 text-success" />
		case 'failed':
			return <XCircle className="w-4 h-4 text-error" />
		case 'in_progress':
			return <Loader2 className="w-4 h-4 text-info animate-spin" />
		default:
			return <RefreshCw className="w-4 h-4 text-base-content/40" />
	}
}

// =========================================================================
// COMPONENT
// =========================================================================

export function BulkSyncProgress({
	data,
	onCancel,
	cancelling = false,
	compact = false,
}: BulkSyncProgressProps) {
	// Calculate overall progress
	const { totalItems, completedItems, failedItems, progressPercent } = useMemo(() => {
		const total = data.items.reduce((sum, item) => sum + item.total, 0)
		const completed = data.items.reduce((sum, item) => sum + item.completed, 0)
		const failed = data.items.reduce((sum, item) => sum + item.failed, 0)
		const percent = total > 0 ? Math.round((completed / total) * 100) : 0

		return {
			totalItems: total,
			completedItems: completed,
			failedItems: failed,
			progressPercent: percent,
		}
	}, [data.items])

	const isActive = data.overallStatus === 'in_progress' || data.overallStatus === 'pending'
	const elapsedTime = useMemo(() => {
		const start = new Date(data.startedAt)
		const now = new Date()
		const diffMs = now.getTime() - start.getTime()
		const diffMins = Math.floor(diffMs / 60000)
		const diffSecs = Math.floor((diffMs % 60000) / 1000)
		return diffMins > 0 ? `${diffMins}m ${diffSecs}s` : `${diffSecs}s`
	}, [data.startedAt])

	const handleCancel = useCallback(() => {
		onCancel?.(data.id)
	}, [data.id, onCancel])

	// Compact view for dashboard widget
	if (compact) {
		return (
			<div className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50">
				<Loader2 className="w-5 h-5 text-primary animate-spin" />
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between gap-2 mb-1">
						<span className="text-sm font-medium truncate">
							Syncing to {getProviderLabel(data.provider)}
						</span>
						<span className="text-xs text-base-content/60">{progressPercent}%</span>
					</div>
					<div className="w-full bg-base-300 rounded-full h-1.5">
						<div
							className="bg-primary rounded-full h-1.5 transition-all duration-300"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
				</div>
			</div>
		)
	}

	return (
		<Card className="p-4 border border-base-300 bg-base-100">
			{/* Header */}
			<div className="flex items-start justify-between gap-4 mb-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						{isActive ? (
							<Loader2 className="w-5 h-5 text-primary animate-spin" />
						) : data.overallStatus === 'completed' ? (
							<CheckCircle className="w-5 h-5 text-success" />
						) : data.overallStatus === 'failed' ? (
							<XCircle className="w-5 h-5 text-error" />
						) : (
							<AlertTriangle className="w-5 h-5 text-warning" />
						)}
						<h3 className="font-semibold text-base-content">
							{isActive ? 'Sync In Progress' : 'Sync Complete'}
						</h3>
						<Badge variant={isActive ? 'info' : 'neutral'} size="sm">
							{getProviderLabel(data.provider)}
						</Badge>
					</div>
					<p className="text-sm text-base-content/60">
						{isActive
							? `Running for ${elapsedTime}`
							: `Completed in ${elapsedTime}`}
					</p>
				</div>

				{isActive && onCancel && (
					<Button
						size="sm"
						variant="outline"
						onClick={handleCancel}
						disabled={cancelling}
					>
						{cancelling ? 'Cancelling...' : 'Cancel'}
					</Button>
				)}
			</div>

			{/* Overall Progress */}
			<div className="mb-4">
				<div className="flex items-center justify-between text-sm mb-2">
					<span className="text-base-content/70">Overall Progress</span>
					<span className="font-medium">
						{completedItems} / {totalItems} items ({progressPercent}%)
					</span>
				</div>
				<div className="w-full bg-base-300 rounded-full h-2.5">
					<div
						className={`rounded-full h-2.5 transition-all duration-300 ${
							data.overallStatus === 'failed' ? 'bg-error' : 'bg-primary'
						}`}
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
				{failedItems > 0 && (
					<p className="mt-1 text-xs text-error flex items-center gap-1">
						<AlertTriangle className="w-3 h-3" />
						{failedItems} item{failedItems !== 1 ? 's' : ''} failed
					</p>
				)}
			</div>

			{/* Entity Type Breakdown */}
			<div className="space-y-3">
				<h4 className="text-sm font-medium text-base-content/70 uppercase">
					Breakdown by Type
				</h4>
				{data.items.map((item) => {
					const itemPercent = item.total > 0
						? Math.round((item.completed / item.total) * 100)
						: 0

					return (
						<div key={item.entityType} className="flex items-center gap-3">
							<div className="w-5">{getStatusIcon(item.status)}</div>
							<div className="flex-1">
								<div className="flex items-center justify-between text-sm mb-1">
									<span className="text-base-content">
										{getEntityTypeLabel(item.entityType)}
									</span>
									<span className="text-base-content/60">
										{item.completed}/{item.total}
										{item.failed > 0 && (
											<span className="text-error ml-1">
												({item.failed} failed)
											</span>
										)}
									</span>
								</div>
								<div className="w-full bg-base-300 rounded-full h-1.5">
									<div
										className={`rounded-full h-1.5 transition-all duration-300 ${
											item.status === 'failed' ? 'bg-error' : 'bg-primary/60'
										}`}
										style={{ width: `${itemPercent}%` }}
									/>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* Error Message */}
			{data.errorMessage && (
				<div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20">
					<div className="flex items-start gap-2 text-sm text-error">
						<AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
						<span>{data.errorMessage}</span>
					</div>
				</div>
			)}
		</Card>
	)
}

export default BulkSyncProgress
