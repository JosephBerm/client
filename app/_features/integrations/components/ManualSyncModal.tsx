'use client'

import { useState } from 'react'

import { AlertTriangle, ArrowLeftRight, Loader2, Play, X } from 'lucide-react'

import Badge from '@_components/ui/Badge'
import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'
import Select, { SelectOption } from '@_components/ui/Select'

import { useSyncStatus, useTriggerSync } from '../hooks'
import type { IntegrationProvider, SyncDirectionString, TriggerSyncRequest, SyncStatus } from '../types'
import { formatDuration, getSyncStatusDisplay } from '../types'

interface ManualSyncModalProps {
	/** Whether the modal is open */
	open: boolean
	/** Callback when modal is closed */
	onClose: () => void
	/** Pre-selected provider */
	provider?: IntegrationProvider
	/** Pre-selected entity type */
	entityType?: string
}

// Provider options for Select
const providerOptions: SelectOption<string>[] = [
	{ value: '', label: 'Select provider' },
	{ value: 'QuickBooks', label: 'QuickBooks' },
	{ value: 'NetSuite', label: 'NetSuite' },
]

// Entity type options for Select
const entityTypeOptions: SelectOption<string>[] = [
	{ value: '', label: 'Select entity type' },
	{ value: 'Customer', label: 'Customer' },
	{ value: 'Invoice', label: 'Invoice' },
	{ value: 'Payment', label: 'Payment' },
	{ value: 'Product', label: 'Product' },
]

// Direction options for Select
const directionOptions: SelectOption<string>[] = [
	{ value: 'Outbound', label: 'Outbound (Prometheus → ERP)' },
	{ value: 'Inbound', label: 'Inbound (ERP → Prometheus)' },
	{ value: 'Bidirectional', label: 'Bidirectional' },
]

/**
 * Modal for triggering manual sync operations.
 *
 * @remarks
 * PRD Reference: prd_erp_integration.md - US-ERP-006 (Manual sync trigger)
 *
 * Features:
 * - Select provider, entity type, and sync direction
 * - Real-time status polling during sync
 * - Progress display and error handling
 */
export function ManualSyncModal({
	open,
	onClose,
	provider: defaultProvider,
	entityType: defaultEntityType,
}: ManualSyncModalProps) {
	const [provider, setProvider] = useState<string>(defaultProvider ?? '')
	const [entityType, setEntityType] = useState<string>(defaultEntityType ?? '')
	const [direction, setDirection] = useState<string>('Outbound')
	const [correlationId, setCorrelationId] = useState<string | null>(null)

	const triggerSync = useTriggerSync()
	const { data: syncStatus } = useSyncStatus(correlationId)

	const isInProgress = correlationId && syncStatus?.status !== 'Completed' && syncStatus?.status !== 'Failed'
	const isComplete = syncStatus?.status === 'Completed'
	const isFailed = syncStatus?.status === 'Failed'

	const handleTriggerSync = () => {
		if (!provider || !entityType) return

		const request: TriggerSyncRequest = {
			provider: provider as IntegrationProvider,
			entityType,
			direction: direction as SyncDirectionString,
			forceFullSync: false,
		}

		triggerSync.mutate(request, {
			onSuccess: (response) => {
				if (response?.correlationId) {
					setCorrelationId(response.correlationId)
				}
			},
		})
	}

	const handleClose = () => {
		// Reset state when closing
		setCorrelationId(null)
		triggerSync.reset()
		onClose()
	}

	const canSubmit = provider && entityType && !isInProgress && !triggerSync.isPending

	if (!open) return null

	return (
		<Modal isOpen={open} onClose={handleClose} title="Manual Sync">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-3 text-lg font-semibold">
					<ArrowLeftRight className="h-5 w-5 text-primary" />
					<span>Manual Sync</span>
				</div>
				<p className="text-sm text-base-content/60">
					Trigger a manual synchronization between Prometheus and your ERP system.
				</p>

				{/* Form */}
				<div className="space-y-4">
					{/* Provider Selection */}
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">Provider</span>
						</label>
						<Select
							value={provider}
							onChange={(e) => setProvider(e.target.value)}
							options={providerOptions}
							disabled={Boolean(isInProgress)}
							placeholder="Select provider"
						/>
					</div>

					{/* Entity Type Selection */}
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">Entity Type</span>
						</label>
						<Select
							value={entityType}
							onChange={(e) => setEntityType(e.target.value)}
							options={entityTypeOptions}
							disabled={Boolean(isInProgress)}
							placeholder="Select entity type"
						/>
					</div>

					{/* Direction Selection */}
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">Direction</span>
						</label>
						<Select
							value={direction}
							onChange={(e) => setDirection(e.target.value)}
							options={directionOptions}
							disabled={Boolean(isInProgress)}
						/>
					</div>
				</div>

				{/* Sync Status */}
				{correlationId && syncStatus && (
					<div className="rounded-lg border border-base-300 bg-base-200/50 p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Sync Status</span>
							<Badge
								variant={isComplete ? 'success' : isFailed ? 'error' : 'warning'}
								tone="solid"
							>
								{syncStatus.status}
							</Badge>
						</div>

						{syncStatus.message && (
							<p className="mt-2 text-sm text-base-content/60">{syncStatus.message}</p>
						)}

						{syncStatus.itemsProcessed !== undefined && (
							<div className="mt-2 text-sm">
								<span className="text-base-content/60">Processed: </span>
								<span className="font-mono">
									{syncStatus.itemsProcessed}
									{syncStatus.totalItems !== undefined && ` / ${syncStatus.totalItems}`}
								</span>
							</div>
						)}

						{syncStatus.durationMs !== undefined && (
							<div className="text-sm">
								<span className="text-base-content/60">Duration: </span>
								<span className="font-mono">{formatDuration(syncStatus.durationMs)}</span>
							</div>
						)}
					</div>
				)}

				{/* Error Alert */}
				{(triggerSync.error || isFailed) && (
					<div className="alert alert-error shadow-md">
						<AlertTriangle className="h-5 w-5" />
						<span>
							{triggerSync.error?.message || syncStatus?.errorMessage || 'Sync failed'}
						</span>
					</div>
				)}

				{/* Success Alert */}
				{isComplete && (
					<div className="alert alert-success shadow-md">
						<span>
							Sync completed successfully!
							{syncStatus?.itemsProcessed !== undefined && (
								<> Processed {syncStatus.itemsProcessed} items.</>
							)}
						</span>
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-2">
					<Button variant="ghost" onClick={handleClose}>
						{isComplete || isFailed ? 'Close' : 'Cancel'}
					</Button>
					{!isComplete && !isFailed && (
						<Button
							variant="primary"
							onClick={handleTriggerSync}
							disabled={!canSubmit}
						>
							{triggerSync.isPending || isInProgress ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{isInProgress ? 'Syncing...' : 'Starting...'}
								</>
							) : (
								<>
									<Play className="mr-2 h-4 w-4" />
									Start Sync
								</>
							)}
						</Button>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default ManualSyncModal
