'use client'

/**
 * Permission Group Component
 *
 * Collapsible group of permissions by resource with bulk selection support.
 * Follows patterns from RichDataGrid SelectAllCheckbox.
 *
 * Features:
 * - Expand/collapse toggle
 * - Select all in category (with indeterminate state)
 * - Permission count badge
 * - Selection highlighting
 *
 * @module RBAC PermissionGroup
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Permission } from '@_shared/services/api'
import Card from '@_components/ui/Card'
import PermissionItem from './PermissionItem'

interface PermissionGroupProps {
	/** Resource name (e.g., "orders", "quotes") */
	resource: string
	/** Permissions in this group */
	permissions: Permission[]
	/** Currently selected permission IDs */
	selectedIds: number[]
	/** Toggle selection handler */
	onToggleSelection: (id: number) => void
	/** Edit permission handler */
	onEdit: (permission: Permission) => void
	/** Delete permission handler */
	onDelete: (permission: Permission) => void
}

export default function PermissionGroup({
	resource,
	permissions,
	selectedIds,
	onToggleSelection,
	onEdit,
	onDelete,
}: PermissionGroupProps) {
	const [isExpanded, setIsExpanded] = useState(true)

	// Calculate selection state for category
	const selectedInGroup = permissions.filter((p) => selectedIds.includes(p.id)).length
	const allSelected = selectedInGroup === permissions.length && permissions.length > 0
	const someSelected = selectedInGroup > 0 && selectedInGroup < permissions.length

	// Toggle all permissions in this group
	const handleToggleAll = (e: React.MouseEvent) => {
		e.stopPropagation()

		if (allSelected) {
			// Deselect all in group
			permissions.forEach((p) => {
				if (selectedIds.includes(p.id)) {
					onToggleSelection(p.id)
				}
			})
		} else {
			// Select all in group
			permissions.forEach((p) => {
				if (!selectedIds.includes(p.id)) {
					onToggleSelection(p.id)
				}
			})
		}
	}

	return (
		<Card className="overflow-hidden border border-base-300/50">
			{/* Group Header - Enhanced styling */}
			<div
				className="flex items-center justify-between p-4 min-h-[60px] bg-base-200/30 cursor-pointer
				           hover:bg-base-200/60 transition-colors border-b border-base-300/30"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center gap-3">
					{/* Expand/Collapse Icon */}
					<div className="p-1 rounded hover:bg-base-300/50 transition-colors">
						{isExpanded ? (
							<ChevronDown className="w-5 h-5 text-base-content/70 flex-shrink-0" />
						) : (
							<ChevronRight className="w-5 h-5 text-base-content/70 flex-shrink-0" />
						)}
					</div>

					{/* Select All Checkbox - Using DaisyUI checkbox for consistency */}
					<input
						type="checkbox"
						checked={allSelected}
						ref={(el) => {
							if (el) el.indeterminate = someSelected
						}}
						onChange={(e) => {
							e.stopPropagation()
							handleToggleAll(e as unknown as React.MouseEvent)
						}}
						onClick={(e) => e.stopPropagation()}
						className="checkbox checkbox-sm checkbox-primary"
						aria-label={allSelected ? 'Deselect all in group' : 'Select all in group'}
					/>

					{/* Resource Name - More prominent */}
					<h3 className="text-base sm:text-lg font-semibold capitalize">{resource}</h3>

					{/* Count Badge - Enhanced */}
					<span className="px-2.5 py-1 rounded-full bg-base-content/10 text-xs font-medium text-base-content/80 tabular-nums">
						{permissions.length}
					</span>
				</div>

				{/* Selection Count (when some selected) - More visible */}
				{selectedInGroup > 0 && (
					<span className="px-2.5 py-1 rounded-full bg-primary/20 text-xs text-primary font-semibold tabular-nums">
						{selectedInGroup} selected
					</span>
				)}
			</div>

			{/* Permission Items */}
			{isExpanded && (
				<div className="p-4 space-y-2 bg-base-100">
					{permissions.map((permission) => {
						const isSelected = selectedIds.includes(permission.id)

						return (
							<div
								key={permission.id}
								className={`flex items-center gap-3 p-1 rounded-lg transition-colors ${
									isSelected
										? 'bg-primary/5 ring-1 ring-primary/30'
										: 'hover:bg-base-200/30'
								}`}
							>
								{/* Selection Checkbox - Consistent with header */}
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => onToggleSelection(permission.id)}
									className="checkbox checkbox-sm checkbox-primary flex-shrink-0"
									aria-label={`Select ${permission.resource}:${permission.action}`}
								/>

								{/* Permission Item */}
								<div className="flex-1 min-w-0">
									<PermissionItem
										permission={permission}
										onEdit={onEdit}
										onDelete={onDelete}
									/>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</Card>
	)
}
