'use client'

/**
 * Permission Selector Component
 *
 * MAANG-level permission selector with:
 * - Search/filter functionality (AWS IAM pattern)
 * - Collapsible categories (Stripe pattern)
 * - Select All per category (Okta pattern)
 * - Change counter for dirty state awareness
 * - Keyboard navigation support
 *
 * Industry References:
 * - AWS IAM Policy Editor: Search + categorization
 * - Stripe Dashboard: Collapsible permission groups
 * - Okta Admin: Bulk select per category
 * - Google Cloud IAM: Permission descriptions
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @module RBAC PermissionSelector
 */

import { useState } from 'react'
import { Search, ChevronDown, ChevronRight, Check, Minus } from 'lucide-react'
import type { Permission } from '@_shared/services/api'

import { groupPermissionsByResource, formatPermissionDisplay } from '../_utils'

interface PermissionSelectorProps {
	permissions: Permission[]
	selectedPermissionIds: number[]
	onToggle: (permissionId: number) => void
	/** Optional: IDs that were initially selected (for change tracking) */
	initialPermissionIds?: number[]
}

export default function PermissionSelector({
	permissions,
	selectedPermissionIds,
	onToggle,
	initialPermissionIds = [],
}: PermissionSelectorProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

	// React Compiler auto-optimizes - no useMemo needed
	const groupedPermissions = groupPermissionsByResource(permissions)

	// Filter permissions by search term
	const filteredGroups = Object.entries(groupedPermissions).reduce(
		(acc, [resource, perms]) => {
			if (!searchTerm) {
				acc[resource] = perms
				return acc
			}

			const term = searchTerm.toLowerCase()
			const filtered = perms.filter(
				(p) =>
					p.action.toLowerCase().includes(term) ||
					p.resource.toLowerCase().includes(term) ||
					(p.description?.toLowerCase().includes(term) ?? false)
			)

			if (filtered.length > 0) {
				acc[resource] = filtered
			}
			return acc
		},
		{} as Record<string, Permission[]>
	)

	// Calculate change stats
	const addedCount = selectedPermissionIds.filter((id) => !initialPermissionIds.includes(id)).length
	const removedCount = initialPermissionIds.filter((id) => !selectedPermissionIds.includes(id)).length
	const totalChanges = addedCount + removedCount

	// Toggle category collapse
	const toggleCategory = (resource: string) => {
		setCollapsedCategories((prev) => {
			const next = new Set(prev)
			if (next.has(resource)) {
				next.delete(resource)
			} else {
				next.add(resource)
			}
			return next
		})
	}

	// Select/deselect all in a category
	const toggleCategoryAll = (resource: string, perms: Permission[]) => {
		const permIds = perms.map((p) => p.id)
		const allSelected = permIds.every((id) => selectedPermissionIds.includes(id))

		if (allSelected) {
			// Deselect all in category
			permIds.forEach((id) => {
				if (selectedPermissionIds.includes(id)) {
					onToggle(id)
				}
			})
		} else {
			// Select all in category
			permIds.forEach((id) => {
				if (!selectedPermissionIds.includes(id)) {
					onToggle(id)
				}
			})
		}
	}

	// Get category selection state
	const getCategoryState = (perms: Permission[]): 'all' | 'some' | 'none' => {
		const permIds = perms.map((p) => p.id)
		const selectedCount = permIds.filter((id) => selectedPermissionIds.includes(id)).length

		if (selectedCount === 0) return 'none'
		if (selectedCount === permIds.length) return 'all'
		return 'some'
	}

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
				<input
					type="text"
					placeholder="Search permissions..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full rounded-lg border border-base-300 bg-base-100 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
				/>
			</div>

			{/* Change Counter */}
			{totalChanges > 0 && (
				<div className="flex items-center gap-2 text-sm">
					<span className="text-base-content/60">Changes pending:</span>
					{addedCount > 0 && (
						<span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs">
							+{addedCount} added
						</span>
					)}
					{removedCount > 0 && (
						<span className="px-2 py-0.5 rounded bg-error/10 text-error text-xs">
							-{removedCount} removed
						</span>
					)}
				</div>
			)}

			{/* Selection Summary */}
			<div className="flex items-center justify-between text-sm text-base-content/60">
				<span>
					{selectedPermissionIds.length} of {permissions.length} permissions selected
				</span>
				{searchTerm && (
					<span className="text-xs">
						Showing {Object.values(filteredGroups).flat().length} results
					</span>
				)}
			</div>

			{/* Permission Groups */}
			<div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
				{Object.entries(filteredGroups).map(([resource, perms]) => {
					const isCollapsed = collapsedCategories.has(resource)
					const categoryState = getCategoryState(perms)
					const selectedInCategory = perms.filter((p) =>
						selectedPermissionIds.includes(p.id)
					).length

					return (
						<div
							key={resource}
							className="rounded-lg border border-base-300 overflow-hidden"
						>
							{/* Category Header */}
							<div
								className="flex items-center justify-between p-3 bg-base-200/50 cursor-pointer hover:bg-base-200 transition-colors"
								onClick={() => toggleCategory(resource)}
							>
								<div className="flex items-center gap-3">
									{/* Expand/Collapse Icon */}
									{isCollapsed ? (
										<ChevronRight className="h-4 w-4 text-base-content/60" />
									) : (
										<ChevronDown className="h-4 w-4 text-base-content/60" />
									)}

									{/* Category Checkbox - Indeterminate state for partial selection */}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation()
											toggleCategoryAll(resource, perms)
										}}
										className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
											categoryState === 'all'
												? 'border-primary bg-primary text-white'
												: categoryState === 'some'
													? 'border-primary bg-primary text-white'
													: 'border-base-300 hover:border-base-content/50'
										}`}
									>
										{categoryState === 'all' && <Check className="h-3 w-3" />}
										{categoryState === 'some' && <Minus className="h-3.5 w-3.5 stroke-[3]" />}
									</button>

									{/* Category Name */}
									<span className="font-semibold capitalize">{resource}</span>
								</div>

								{/* Selection Count Badge */}
								<span className="text-xs px-2 py-0.5 rounded-full bg-base-300 text-base-content/70">
									{selectedInCategory}/{perms.length}
								</span>
							</div>

							{/* Permission Items */}
							{!isCollapsed && (
								<div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-1">
									{perms.map((perm) => {
										const isSelected = selectedPermissionIds.includes(perm.id)
										const permString = formatPermissionDisplay(perm)
										const wasInitiallySelected = initialPermissionIds.includes(perm.id)
										const isChanged = isSelected !== wasInitiallySelected

										return (
											<label
												key={perm.id}
												className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-colors ${
													isSelected
														? 'bg-primary/5 hover:bg-primary/10'
														: 'hover:bg-base-200'
												} ${isChanged ? 'ring-1 ring-warning/50' : ''}`}
											>
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() => onToggle(perm.id)}
													className="checkbox checkbox-sm checkbox-primary mt-0.5"
												/>
												<div className="flex-1 min-w-0">
													<span className="font-mono text-xs text-primary block">
														{permString}
													</span>
													{perm.description && (
														<span className="text-xs text-base-content/60 block truncate">
															{perm.description}
														</span>
													)}
												</div>
											</label>
										)
									})}
								</div>
							)}
						</div>
					)
				})}

				{/* No Results */}
				{Object.keys(filteredGroups).length === 0 && searchTerm && (
					<div className="text-center py-8 text-base-content/60">
						<p>No permissions match &quot;{searchTerm}&quot;</p>
						<button
							type="button"
							onClick={() => setSearchTerm('')}
							className="text-primary text-sm mt-2 hover:underline"
						>
							Clear search
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
