'use client'

/**
 * Permission Bulk Action Bar
 *
 * Floating action bar that appears when permissions are selected.
 * Follows patterns from RichDataGrid BulkActionsDropdown.
 * Mobile-optimized with 44px touch targets.
 *
 * Features:
 * - Selection count display
 * - Clear selection button
 * - Bulk delete action
 * - Sticky positioning
 *
 * @see PLAN_PERMISSIONS_MANAGEMENT_PAGE.md Phase 3
 * @module RBAC PermissionBulkBar
 */

import { Trash2, X } from 'lucide-react'
import Button from '@_components/ui/Button'

interface PermissionBulkBarProps {
	/** Number of selected permissions */
	selectedCount: number
	/** Handler for bulk delete action */
	onDelete: () => void
	/** Handler to clear selection */
	onClearSelection: () => void
}

export default function PermissionBulkBar({
	selectedCount,
	onDelete,
	onClearSelection,
}: PermissionBulkBarProps) {
	return (
		<div
			className="sticky top-0 z-20 flex flex-col sm:flex-row items-start sm:items-center
			           justify-between gap-3 sm:gap-4 rounded-lg bg-primary/20 border-2 border-primary/40
			           p-4 mb-4 shadow-lg shadow-primary/10 backdrop-blur-sm"
		>
			<div className="flex items-center gap-3">
				{/* Selection count with badge styling */}
				<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20">
					<span className="font-semibold text-primary text-base tabular-nums">
						{selectedCount}
					</span>
					<span className="text-primary/80 text-sm">selected</span>
				</div>

				{/* Clear button - more visible */}
				<Button
					variant="ghost"
					size="sm"
					onClick={onClearSelection}
					className="text-base-content/70 hover:text-base-content hover:bg-base-content/10"
					aria-label="Clear selection"
				>
					Clear
				</Button>
			</div>

			<Button
				variant="error"
				size="sm"
				leftIcon={<Trash2 className="w-4 h-4" />}
				onClick={onDelete}
				className="min-h-[44px] w-full sm:w-auto font-medium"
			>
				Delete Selected
			</Button>
		</div>
	)
}
