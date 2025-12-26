/**
 * BulkActionsDropdown - Actions Menu for Selected Rows
 *
 * Provides a dropdown menu with actions for selected rows.
 * Follows AG Grid/MUI DataGrid pattern.
 *
 * @module BulkActionsDropdown
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { useRichDataGridSelection, useRichDataGridContext } from '../../context/RichDataGridContext'
import { useClickOutside } from '../../hooks/useClickOutside'
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
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Shared hook for click outside handling (DRY)
	const closeDropdown = useCallback(() => {
		setIsOpen(false)
		setConfirmAction(null)
	}, [])
	useClickOutside(dropdownRef, closeDropdown, isOpen)

	// Don't render if no selections
	if (selectedCount === 0) {
		return null
	}

	// Get variant classes
	const getVariantClasses = (variant: BulkActionVariant = BulkActionVariant.Default) => {
		switch (variant) {
			case BulkActionVariant.Danger:
				return 'text-error hover:bg-error/10 dark:hover:bg-error/20'
			case BulkActionVariant.Warning:
				return 'text-warning hover:bg-warning/10 dark:hover:bg-warning/20'
			case BulkActionVariant.Primary:
				return 'text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
			default:
				return 'hover:bg-base-200 dark:hover:bg-base-content/10'
		}
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

	// Execute action
	const executeAction = async (action: BulkAction<TData>) => {
		// If confirmation required, show confirm dialog
		if (action.confirmMessage && !confirmAction) {
			setConfirmAction(action)
			return
		}

		setIsExecuting(true)
		try {
			await action.onAction(selectedRows as TData[], selectedIds)
			clearSelection()
			setIsOpen(false)
			setConfirmAction(null)
		} catch (error) {
			console.error('Bulk action failed:', error)
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

	return (
		<div className={`relative ${className}`} ref={dropdownRef}>
			{/* Trigger Button - Touch-friendly */}
			<button 
				type="button" 
				onClick={() => setIsOpen(!isOpen)} 
				className="btn btn-primary btn-sm gap-2 min-h-[44px] sm:min-h-[32px] touch-manipulation" 
				aria-expanded={isOpen}
			>
				<span>Actions</span>
				<span className="badge badge-primary-content">{selectedCount}</span>
				<ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div
					className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 z-50 
						bg-base-100 dark:bg-base-200
						border border-base-300 dark:border-base-content/20 
						rounded-lg shadow-lg dark:shadow-2xl
						min-w-[200px] max-w-[90vw] sm:max-w-[280px]"
					role="menu"
				>
					{/* Confirmation Dialog */}
					{confirmAction ? (
						<div className="p-3 sm:p-4">
							<p className="text-xs sm:text-sm mb-3 sm:mb-4 text-base-content dark:text-base-content/90">
								{getConfirmMessage(confirmAction)}
							</p>
							<div className="flex gap-2 justify-end">
								<button
									type="button"
									onClick={() => setConfirmAction(null)}
									className="btn btn-ghost btn-sm touch-manipulation min-h-[40px] sm:min-h-[32px]"
									disabled={isExecuting}
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={() => executeAction(confirmAction)}
									className={`btn btn-sm touch-manipulation min-h-[40px] sm:min-h-[32px] ${confirmAction.variant === BulkActionVariant.Danger ? 'btn-error' : 'btn-primary'}`}
									disabled={isExecuting}
								>
									{isExecuting ? (
										<span className="loading loading-spinner loading-xs" />
									) : (
										confirmAction.label
									)}
								</button>
							</div>
						</div>
					) : (
						/* Action List */
						<div className="py-1">
							{actions.map((action) => {
								const disabled = isActionDisabled(action)
								return (
									<button
										key={action.id}
										type="button"
										onClick={() => executeAction(action)}
										disabled={disabled}
										className={`
											w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 
											text-left text-sm
											${getVariantClasses(action.variant)}
											${disabled ? 'opacity-50 cursor-not-allowed' : ''}
											transition-colors touch-manipulation
											active:bg-base-300 dark:active:bg-base-content/15
										`}
										role="menuitem"
									>
										{action.icon}
										<span>{action.label}</span>
									</button>
								)
							})}
						</div>
					)}

					{/* Clear Selection */}
					<div className="border-t border-base-300 dark:border-base-content/10 p-2">
						<button
							type="button"
							onClick={() => {
								clearSelection()
								setIsOpen(false)
							}}
							className="btn btn-ghost btn-xs w-full touch-manipulation min-h-[36px]"
						>
							Clear Selection
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default BulkActionsDropdown

