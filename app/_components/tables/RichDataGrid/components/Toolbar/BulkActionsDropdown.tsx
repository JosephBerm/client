/**
 * BulkActionsDropdown - Actions Menu for Selected Rows
 *
 * Provides a dropdown menu with actions for selected rows.
 * Uses the shared Dropdown component for consistent styling.
 *
 * @module BulkActionsDropdown
 */

'use client'

import { useState } from 'react'

import { Dropdown } from '@_components/ui/Dropdown'
import Button from '@_components/ui/Button'
import { useRichDataGridSelection } from '../../context/RichDataGridContext'
import { type BulkAction, BulkActionVariant } from '../../types'

// ============================================================================
// PROPS
// ============================================================================

export interface BulkActionsDropdownProps<TData> {
	/** Available bulk actions */
	actions: BulkAction<TData>[]
	/** Additional CSS classes */
	className?: string
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Maps BulkActionVariant to Dropdown.Item variant
 */
function getItemVariant(variant: BulkActionVariant = BulkActionVariant.Default) {
	switch (variant) {
		case BulkActionVariant.Danger:
			return 'danger' as const
		case BulkActionVariant.Warning:
			return 'warning' as const
		case BulkActionVariant.Primary:
			return 'primary' as const
		default:
			return 'default' as const
	}
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dropdown menu for bulk actions on selected rows.
 * Only visible when rows are selected.
 *
 * @example
 * <BulkActionsDropdown
 *   actions={[
 *     { id: 'delete', label: 'Delete', variant: 'danger', onAction: handleDelete },
 *     { id: 'export', label: 'Export', onAction: handleExport },
 *   ]}
 * />
 */
export function BulkActionsDropdown<TData>({ actions, className = '' }: BulkActionsDropdownProps<TData>) {
	const { selectedRows, selectedIds, selectedCount, clearSelection } = useRichDataGridSelection()
	const [isOpen, setIsOpen] = useState(false)
	const [confirmAction, setConfirmAction] = useState<BulkAction<TData> | null>(null)
	const [isExecuting, setIsExecuting] = useState(false)

	// Don't render if no selections
	if (selectedCount === 0) {
		return null
	}

	// Check if action is disabled
	const isActionDisabled = (action: BulkAction<TData>): boolean => {
		if (typeof action.disabled === 'function') {
			return action.disabled(selectedRows as TData[])
		}
		if (action.disabled) return true
		if (action.minRows && selectedCount < action.minRows) return true
		if (action.maxRows && selectedCount > action.maxRows) return true
		return false
	}

	/**
	 * Execute bulk action with proper error handling.
	 * Selection is only cleared on successful completion.
	 */
	const executeAction = async (action: BulkAction<TData>) => {
		// If confirmation required, show confirm dialog
		if (action.confirmMessage && !confirmAction) {
			setConfirmAction(action)
			return
		}

		setIsExecuting(true)
		try {
			await action.onAction(selectedRows as TData[], selectedIds)
			// Only clear selection on successful completion
			clearSelection()
			setIsOpen(false)
			setConfirmAction(null)
		} catch (error) {
			// Log error but DO NOT clear selection - user may want to retry
			console.error('Bulk action failed:', error)
			// Reset confirmation state so user can retry from action list
			setConfirmAction(null)
		} finally {
			setIsExecuting(false)
		}
	}

	// Get confirmation message
	const getConfirmMessage = (action: BulkAction<TData>): string => {
		if (typeof action.confirmMessage === 'function') {
			return action.confirmMessage(selectedCount)
		}
		return action.confirmMessage ?? `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} items?`
	}

	const handleClearSelection = () => {
		clearSelection()
		setIsOpen(false)
	}

	return (
		<Dropdown
			open={isOpen}
			onOpenChange={setIsOpen}
			className={className}>
			<Dropdown.Trigger
				variant='primary'
				badge={selectedCount}>
				Actions
			</Dropdown.Trigger>

			<Dropdown.Content align='start'>
				{/* Confirmation Dialog State */}
				{confirmAction ? (
					<div className='p-4'>
						<p className='text-sm mb-4 text-base-content/90 leading-relaxed'>
							{getConfirmMessage(confirmAction)}
						</p>
						<div className='flex gap-2 justify-end'>
							<Button
								type='button'
								onClick={() => setConfirmAction(null)}
								variant='ghost'
								size='sm'
								className='min-h-[40px] sm:min-h-[36px] touch-manipulation'
								disabled={isExecuting}>
								Cancel
							</Button>
							<Button
								type='button'
								onClick={() => executeAction(confirmAction)}
								variant={confirmAction.variant === BulkActionVariant.Danger ? 'error' : 'primary'}
								size='sm'
								loading={isExecuting}
								className='min-h-[40px] sm:min-h-[36px] touch-manipulation'
								disabled={isExecuting}>
								{confirmAction.label}
							</Button>
						</div>
					</div>
				) : (
					<>
						{/* Action List */}
						<Dropdown.Section>
							{actions.map((action) => {
								const disabled = isActionDisabled(action)
								return (
									<Dropdown.Item
										key={action.id}
										icon={action.icon}
										variant={getItemVariant(action.variant)}
										disabled={disabled}
										onClick={() => executeAction(action)}>
										{action.label}
									</Dropdown.Item>
								)
							})}
						</Dropdown.Section>

						<Dropdown.Divider />

						{/* Clear Selection */}
						<Dropdown.Footer className='py-2'>
							<Button
								type='button'
								onClick={handleClearSelection}
								variant='ghost'
								size='xs'
								className='w-full text-base-content/70 hover:text-base-content'>
								Clear Selection
							</Button>
						</Dropdown.Footer>
					</>
				)}
			</Dropdown.Content>
		</Dropdown>
	)
}

export default BulkActionsDropdown
