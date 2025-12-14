/**
 * ProviderActionModal Component
 * 
 * Confirmation modal for provider status actions:
 * - Delete (permanent removal)
 * - Archive (final status in workflow)
 * - Suspend (temporary hold)
 * 
 * STATUS WORKFLOW (Industry Best Practice):
 * Active -> Suspended -> Archived (can be restored at each step)
 * 
 * @module providers/components
 */

'use client'

import { Archive, PauseCircle, Trash2 } from 'lucide-react'

import Modal from '@_components/ui/Modal'
import Button from '@_components/ui/Button'

type ModalMode = 'delete' | 'archive' | 'suspend'

interface ProviderActionModalProps {
	/** Whether the modal is open */
	isOpen: boolean
	/** Provider name to display */
	providerName: string
	/** Mode: delete (permanent), archive (final), or suspend (temporary) */
	mode: ModalMode
	/** Suspension reason (only used in suspend mode) */
	suspendReason?: string
	/** Suspension reason change callback */
	onSuspendReasonChange?: (reason: string) => void
	/** Close modal callback */
	onClose: () => void
	/** Delete callback */
	onDelete: () => void
	/** Archive callback */
	onArchive: () => void
	/** Suspend callback */
	onSuspend: () => void
	/** Whether delete is in progress */
	isDeleting: boolean
	/** Whether archive is in progress */
	isArchiving: boolean
	/** Whether suspend is in progress */
	isSuspending: boolean
}

/**
 * Modal configuration for each mode.
 */
const MODAL_CONFIG: Record<ModalMode, {
	title: string
	Icon: typeof Trash2
	iconContainerClass: string
	iconClass: string
	buttonVariant: 'error' | 'accent'
	buttonText: string
}> = {
	delete: {
		title: 'Delete Provider',
		Icon: Trash2,
		iconContainerClass: 'w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0',
		iconClass: 'w-6 h-6 text-error',
		buttonVariant: 'error',
		buttonText: 'Delete Permanently',
	},
	archive: {
		title: 'Archive Provider',
		Icon: Archive,
		iconContainerClass: 'w-12 h-12 rounded-full bg-error/10 flex items-center justify-center shrink-0',
		iconClass: 'w-6 h-6 text-error',
		buttonVariant: 'error',
		buttonText: 'Archive Provider',
	},
	suspend: {
		title: 'Suspend Provider',
		Icon: PauseCircle,
		iconContainerClass: 'w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center shrink-0',
		iconClass: 'w-6 h-6 text-warning',
		buttonVariant: 'accent',
		buttonText: 'Suspend Provider',
	},
}

/**
 * ProviderActionModal - Confirmation modal for delete/archive/suspend actions.
 * 
 * @example
 * ```tsx
 * <ProviderActionModal
 *   isOpen={modal.isOpen}
 *   providerName={modal.provider?.name ?? ''}
 *   mode={modal.mode}
 *   suspendReason={suspendReason}
 *   onSuspendReasonChange={setSuspendReason}
 *   onClose={closeModal}
 *   onDelete={handleDelete}
 *   onArchive={handleArchive}
 *   onSuspend={handleSuspend}
 *   isDeleting={isDeleting}
 *   isArchiving={isArchiving}
 *   isSuspending={isSuspending}
 * />
 * ```
 */
export function ProviderDeleteModal({
	isOpen,
	providerName,
	mode,
	suspendReason = '',
	onSuspendReasonChange,
	onClose,
	onDelete,
	onArchive,
	onSuspend,
	isDeleting,
	isArchiving,
	isSuspending,
}: ProviderActionModalProps) {
	const config = MODAL_CONFIG[mode]
	const { title, Icon, iconContainerClass, iconClass, buttonVariant, buttonText } = config
	
	const isLoading = mode === 'delete' ? isDeleting : mode === 'archive' ? isArchiving : isSuspending
	
	const handleConfirm = () => {
		switch (mode) {
			case 'delete':
				onDelete()
				break
			case 'archive':
				onArchive()
				break
			case 'suspend':
				onSuspend()
				break
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="space-y-4">
				<div className="flex items-start gap-4">
					<div className={iconContainerClass}>
						<Icon className={iconClass} />
					</div>
					<div className="flex-1">
						{mode === 'delete' && (
							<>
								<p>
									Are you sure you want to permanently delete{' '}
									<strong className="text-base-content">{providerName}</strong>?
								</p>
								<p className="text-sm text-base-content/60 mt-2">
									This will permanently remove the provider and cannot be undone.
									Consider archiving instead to preserve historical data.
								</p>
							</>
						)}
						{mode === 'archive' && (
							<>
								<p>
									Archive{' '}
									<strong className="text-base-content">{providerName}</strong>?
								</p>
								<p className="text-sm text-base-content/60 mt-2">
									Archived providers are permanently deactivated but their data
									is preserved. You can restore them to active status anytime.
								</p>
							</>
						)}
						{mode === 'suspend' && (
							<>
								<p>
									Suspend{' '}
									<strong className="text-base-content">{providerName}</strong>?
								</p>
								<p className="text-sm text-base-content/60 mt-2">
									Suspended providers are temporarily on hold. They won&apos;t appear
									in active lists but can be reactivated easily.
								</p>
								<div className="mt-4">
									<label className="label">
										<span className="label-text font-medium">Suspension Reason</span>
										<span className="label-text-alt text-error">Required</span>
									</label>
									<textarea
										className="textarea textarea-bordered w-full"
										placeholder="e.g., Compliance review, Performance issues, Payment dispute..."
										value={suspendReason}
										onChange={(e) => onSuspendReasonChange?.(e.target.value)}
										rows={3}
									/>
								</div>
							</>
						)}
					</div>
				</div>
				<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-base-200">
					<Button
						variant="ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button 
						variant={buttonVariant}
						onClick={handleConfirm}
						loading={isLoading}
						disabled={mode === 'suspend' && !suspendReason.trim()}
					>
						{buttonText}
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ProviderDeleteModal

