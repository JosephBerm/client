/**
 * ProductDeleteModal Component
 * 
 * Confirmation modal for deleting or archiving products.
 * Follows the same pattern as ProviderDeleteModal and CustomerDeleteModal.
 * 
 * **Features:**
 * - Two modes: delete (permanent) and archive (soft delete)
 * - Warning messages explaining consequences
 * - Loading states during operations
 * - Accessible with proper ARIA attributes
 * 
 * @module internalStore/components
 */

'use client'

import { AlertTriangle, Archive, Trash2 } from 'lucide-react'

import Button from '@_components/ui/Button'
import Modal from '@_components/ui/Modal'

import type { ProductDeleteModalProps } from '../types'

/**
 * ProductDeleteModal - Confirmation modal for product deletion/archiving.
 * 
 * @example
 * ```tsx
 * <ProductDeleteModal
 *   isOpen={deleteModal.isOpen}
 *   productName={deleteModal.product?.name ?? ''}
 *   mode={deleteModal.mode}
 *   onClose={closeModal}
 *   onDelete={handleDelete}
 *   onArchive={handleArchive}
 *   isDeleting={isDeleting}
 *   isArchiving={isArchiving}
 * />
 * ```
 */
export function ProductDeleteModal({
	isOpen,
	productName,
	mode,
	onClose,
	onDelete,
	onArchive,
	isDeleting,
	isArchiving,
}: ProductDeleteModalProps) {
	const isArchiveMode = mode === 'archive'
	const isLoading = isDeleting || isArchiving

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isArchiveMode ? 'Archive Product' : 'Delete Product'}
		>
			<div className="space-y-4">
				{/* Icon */}
				<div className="flex justify-center">
					{isArchiveMode ? (
						<div className="rounded-full bg-warning/10 p-4">
							<Archive className="h-8 w-8 text-warning" />
						</div>
					) : (
						<div className="rounded-full bg-error/10 p-4">
							<Trash2 className="h-8 w-8 text-error" />
						</div>
					)}
				</div>

				{/* Message */}
				<div className="text-center">
					<p className="text-base-content">
						Are you sure you want to {isArchiveMode ? 'archive' : 'delete'}{' '}
						<strong className="font-semibold">{productName}</strong>?
					</p>
				</div>

				{/* Warning */}
				<div 
					className={`rounded-lg p-4 ${
						isArchiveMode ? 'bg-warning/10' : 'bg-error/10'
					}`}
				>
					<div className="flex gap-3">
						<AlertTriangle 
							className={`h-5 w-5 shrink-0 ${
								isArchiveMode ? 'text-warning' : 'text-error'
							}`} 
						/>
						<div className="text-sm">
							{isArchiveMode ? (
								<>
									<p className="font-medium text-warning">
										This will hide the product from the store.
									</p>
									<p className="mt-1 text-base-content/70">
										Archived products can be restored later. Existing quotes 
										referencing this product will not be affected.
									</p>
								</>
							) : (
								<>
									<p className="font-medium text-error">
										This action cannot be undone.
									</p>
									<p className="mt-1 text-base-content/70">
										The product will be permanently removed from the catalog. 
										Existing quotes and orders may be affected.
									</p>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3 pt-2">
					<Button
						variant="ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					{isArchiveMode ? (
						<Button
							variant="warning"
							onClick={onArchive}
							loading={isArchiving}
							disabled={isLoading}
							leftIcon={<Archive className="h-4 w-4" />}
						>
							Archive Product
						</Button>
					) : (
						<Button
							variant="error"
							onClick={onDelete}
							loading={isDeleting}
							disabled={isLoading}
							leftIcon={<Trash2 className="h-4 w-4" />}
						>
							Delete Product
						</Button>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default ProductDeleteModal

