/**
 * CustomerDeleteModal Component
 * 
 * Modal for confirming customer deletion or archiving.
 * Provides option to archive instead of permanently deleting.
 * 
 * @module customers/components
 */

'use client'

import { useState } from 'react'

import { AlertTriangle, Archive, Trash2 } from 'lucide-react'

import Button from '@_components/ui/Button'
import Input from '@_components/ui/Input'
import Modal from '@_components/ui/Modal'

interface CustomerDeleteModalProps {
	isOpen: boolean
	customerName: string
	onClose: () => void
	onDelete: () => void
	onArchive: () => void
	isDeleting?: boolean
	isArchiving?: boolean
}

/**
 * CustomerDeleteModal Component
 * 
 * Two-option modal allowing users to either:
 * 1. Archive the customer (soft delete, preserves data)
 * 2. Permanently delete (hard delete, requires confirmation)
 */
function CustomerDeleteModal({
	isOpen,
	customerName,
	onClose,
	onDelete,
	onArchive,
	isDeleting = false,
	isArchiving = false,
}: CustomerDeleteModalProps) {
	const [showConfirmation, setShowConfirmation] = useState(false)
	const [confirmInput, setConfirmInput] = useState('')
	const isProcessing = isDeleting || isArchiving
	const isDeleteConfirmed = confirmInput.toUpperCase() === 'DELETE'

	const handleClose = () => {
		if (!isProcessing) {
			setShowConfirmation(false)
			setConfirmInput('')
			onClose()
		}
	}

	const handleArchive = () => {
		if (!isProcessing) {
			onArchive()
		}
	}

	const handleShowConfirmation = () => {
		setShowConfirmation(true)
	}

	const handleDelete = () => {
		if (isDeleteConfirmed && !isProcessing) {
			onDelete()
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={showConfirmation ? 'Confirm Permanent Delete' : 'Remove Customer'}
		>
			<div className="space-y-4">
				{showConfirmation ? (
					<>
						<div className="alert alert-error">
							<AlertTriangle size={20} />
							<span>
								This action cannot be undone. All customer data including
								historical records will be permanently removed.
							</span>
						</div>
						<p className="text-base-content/80">
							Type <strong className="text-error">&quot;DELETE&quot;</strong> to confirm
							permanent deletion of <strong>{customerName || 'this customer'}</strong>.
						</p>
						<Input
							type="text"
							value={confirmInput}
							onChange={(e) => setConfirmInput(e.target.value)}
							placeholder="Type DELETE to confirm"
							className={`w-full ${
								confirmInput && !isDeleteConfirmed ? 'input-error' : ''
							} ${isDeleteConfirmed ? 'input-success' : ''}`}
							disabled={isProcessing}
						/>
					</>
				) : (
					<>
						<p>
							How would you like to remove{' '}
							<strong>{customerName || 'this customer'}</strong>?
						</p>

						{/* Archive Option */}
						<div
							className="border border-base-300 rounded-lg p-4 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
							onClick={handleArchive}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === 'Enter' && handleArchive()}
						>
							<div className="flex items-start gap-3">
								<div className="p-2 bg-warning/10 rounded-lg text-warning">
									<Archive size={24} />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-base-content">
										Archive Customer
									</h4>
									<p className="text-sm text-base-content/60 mt-1">
										Hide from active lists but preserve all historical data.
										Can be restored later by an admin.
									</p>
								</div>
								{isArchiving && (
									<span className="loading loading-spinner loading-sm" />
								)}
							</div>
						</div>

						{/* Delete Option */}
						<div
							className="border border-error/30 rounded-lg p-4 hover:border-error hover:bg-error/5 cursor-pointer transition-colors"
							onClick={handleShowConfirmation}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === 'Enter' && handleShowConfirmation()}
						>
							<div className="flex items-start gap-3">
								<div className="p-2 bg-error/10 rounded-lg text-error">
									<Trash2 size={24} />
								</div>
								<div className="flex-1">
									<h4 className="font-semibold text-error">
										Permanently Delete
									</h4>
									<p className="text-sm text-base-content/60 mt-1">
										Remove all customer data permanently. This cannot be undone.
										Only use if required for compliance (e.g., GDPR).
									</p>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Action Buttons */}
				<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-base-300">
					<Button
						variant="ghost"
						onClick={handleClose}
						disabled={isProcessing}
					>
						Cancel
					</Button>
					{showConfirmation && (
						<Button
							variant="error"
							onClick={handleDelete}
							disabled={!isDeleteConfirmed || isProcessing}
							leftIcon={isDeleting ? undefined : <Trash2 size={16} />}
						>
							{isDeleting ? (
								<>
									<span className="loading loading-spinner loading-sm" />
									Deleting...
								</>
							) : (
								'Permanently Delete'
							)}
						</Button>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default CustomerDeleteModal

