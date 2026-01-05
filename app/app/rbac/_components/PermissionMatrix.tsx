/**
 * PermissionMatrix Component - MAANG-Level Implementation
 *
 * Interactive matrix showing permissions by role with:
 * - Sticky headers and first column
 * - Collapsible resource groups with counts
 * - Mobile-responsive card view
 * - Enhanced permission indicators
 * - Keyboard navigation (WCAG 2.1 AA)
 * - Summary bar with filter status
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Database-Driven RBAC
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * All role data comes from the `roles` prop (fetched from database).
 * NO hardcoded role levels - enables white-label customization.
 *
 * Industry References:
 * - AWS IAM Console (collapsible groups, sticky headers)
 * - Google Cloud IAM (permission indicators)
 * - Okta Admin Dashboard (summary stats)
 * - Stripe Dashboard (filter UX)
 *
 * @see prd_rbac_management.md - US-RBAC-002, US-RBAC-003
 * @module app/rbac/_components/PermissionMatrix
 */

'use client'

import { useState, useRef, useCallback, Fragment, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Check,
	Filter,
	Search,
	ChevronRight,
	Shield,
	Loader2,
} from 'lucide-react'

import Card from '@_components/ui/Card'
import type { PermissionMatrixEntry, RoleDefinitionDto } from '@_types/rbac-management'
import { getRoleConfig } from '../_constants'

// =========================================================================
// TYPES
// =========================================================================

interface PermissionMatrixProps {
	matrix: PermissionMatrixEntry[]
	roles: RoleDefinitionDto[]
	canEdit?: boolean
	onPermissionToggle?: (
		resource: string,
		action: string,
		context: string | null,
		roleLevel: number,
		granted: boolean
	) => void
	/** Currently toggling permission (for loading state) */
	togglingPermission?: { roleLevel: number; permissionString: string } | null
	/** Optimistic updates map: key = `${roleLevel}:${permissionString}` */
	optimisticUpdates?: Map<string, boolean>
	/** Helper to generate optimistic key */
	getOptimisticKey?: (roleLevel: number, permissionString: string) => string
}

interface GroupedPermissions {
	resource: string
	entries: PermissionMatrixEntry[]
	grantedByRole: Record<number, number>
	totalGranted: number
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Groups matrix entries by resource and calculates grant counts.
 * DRY: Single pass grouping with statistics.
 */
function groupPermissionsByResource(
	entries: PermissionMatrixEntry[],
	roleLevels: number[]
): GroupedPermissions[] {
	const grouped = new Map<string, PermissionMatrixEntry[]>()

	for (const entry of entries) {
		const existing = grouped.get(entry.resource)
		if (existing) {
			existing.push(entry)
		} else {
			grouped.set(entry.resource, [entry])
		}
	}

	return Array.from(grouped.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([resource, entries]) => {
			const grantedByRole: Record<number, number> = {}
			let totalGranted = 0

			for (const level of roleLevels) {
				const count = entries.filter((e) => e.roleAccess[level]).length
				grantedByRole[level] = count
				totalGranted += count
			}

			return { resource, entries, grantedByRole, totalGranted }
		})
}

/**
 * Capitalizes first letter of string.
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

/**
 * Permission indicator with MAANG-level visual design.
 * - Granted: Filled circle with check (prominent)
 * - Denied: Empty circle border (subtle, not an X)
 * - Loading: Spinner during API call
 * - Supports optimistic updates for instant feedback
 */
function PermissionIndicator({
	hasAccess,
	isClickable,
	isHighestRole,
	roleDisplayName,
	onClick,
	isLoading = false,
	optimisticValue,
}: {
	hasAccess: boolean
	isClickable: boolean
	isHighestRole: boolean
	roleDisplayName: string
	onClick: () => void
	isLoading?: boolean
	optimisticValue?: boolean
}) {
	// Use optimistic value if present, otherwise actual value
	const displayAccess = optimisticValue !== undefined ? optimisticValue : hasAccess

	const title = isHighestRole
		? `${roleDisplayName} always has all permissions`
		: isLoading
			? 'Updating...'
			: displayAccess
				? 'Has access - Click to revoke'
				: 'No access - Click to grant'

	return (
		<button
			onClick={onClick}
			disabled={!isClickable || isLoading}
			className={`
				group relative inline-flex h-7 w-7 items-center justify-center rounded-full
				transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
				${displayAccess
					? 'bg-success text-success-content shadow-sm'
					: 'border-2 border-base-300 bg-transparent'
				}
				${isClickable && !isLoading
					? 'cursor-pointer hover:ring-2 hover:ring-primary/30 hover:ring-offset-1'
					: 'cursor-default'
				}
				${isHighestRole ? 'opacity-60' : ''}
				${isLoading ? 'opacity-70' : ''}
			`}
			title={title}
			aria-label={title}
		>
			{isLoading ? (
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
			) : displayAccess ? (
				<Check className="h-3.5 w-3.5" strokeWidth={3} />
			) : (
				<span className="sr-only">No access</span>
			)}
		</button>
	)
}

/**
 * Mobile permission card for responsive view.
 * Shows single permission with all role states.
 * Supports loading and optimistic states.
 */
function MobilePermissionCard({
	entry,
	roles,
	canEdit,
	highestRoleLevel,
	onToggle,
	togglingPermission,
	optimisticUpdates,
	getOptimisticKey,
}: {
	entry: PermissionMatrixEntry
	roles: RoleDefinitionDto[]
	canEdit: boolean
	highestRoleLevel: number
	onToggle: (roleLevel: number, currentValue: boolean) => void
	togglingPermission?: { roleLevel: number; permissionString: string } | null
	optimisticUpdates?: Map<string, boolean>
	getOptimisticKey?: (roleLevel: number, permissionString: string) => string
}) {
	const permissionString = entry.context
		? `${entry.resource}:${entry.action}:${entry.context}`
		: `${entry.resource}:${entry.action}`

	// Calculate granted count considering optimistic updates
	const grantedCount = roles.filter((r) => {
		const optimisticKey = getOptimisticKey?.(r.level, permissionString)
		const optimisticValue = optimisticKey ? optimisticUpdates?.get(optimisticKey) : undefined
		return optimisticValue !== undefined ? optimisticValue : entry.roleAccess[r.level]
	}).length

	return (
		<div className="rounded-lg border border-base-300 bg-base-100 p-4">
			{/* Permission header */}
			<div className="mb-3">
				<div className="flex items-center gap-2">
					<span className="font-mono text-sm font-medium text-base-content">
						{entry.action}
					</span>
					{entry.context && (
						<span className="rounded bg-base-200 px-1.5 py-0.5 font-mono text-xs text-base-content/60">
							:{entry.context}
						</span>
					)}
				</div>
				{entry.description && (
					<p className="mt-1 text-xs text-base-content/50">{entry.description}</p>
				)}
			</div>

			{/* Role permissions grid */}
			<div className="flex flex-wrap gap-2">
				{roles.map((role) => {
					const hasAccess = entry.roleAccess[role.level] ?? false
					const config = getRoleConfig(role.name)
					const isHighestRole = role.level === highestRoleLevel
					const isClickable = canEdit && !isHighestRole

					// Check for optimistic value
					const optimisticKey = getOptimisticKey?.(role.level, permissionString)
					const optimisticValue = optimisticKey ? optimisticUpdates?.get(optimisticKey) : undefined
					const displayAccess = optimisticValue !== undefined ? optimisticValue : hasAccess

					// Check if this cell is loading
					const isLoading =
						togglingPermission?.roleLevel === role.level &&
						togglingPermission?.permissionString.toLowerCase() === permissionString.toLowerCase()

					return (
						<button
							key={role.id}
							onClick={() => isClickable && !isLoading && onToggle(role.level, hasAccess)}
							disabled={!isClickable || isLoading}
							className={`
								flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
								transition-all duration-200
								${displayAccess
									? `${config.headerColor} text-white`
									: 'bg-base-200 text-base-content/50'
								}
								${isClickable && !isLoading ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
								${isHighestRole ? 'opacity-60' : ''}
								${isLoading ? 'opacity-70' : ''}
							`}
							title={`${role.displayName}: ${displayAccess ? 'Has access' : 'No access'}`}
						>
							{isLoading ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : displayAccess ? (
								<Check className="h-3 w-3" />
							) : null}
							<span>{config.abbreviation}</span>
						</button>
					)
				})}
			</div>

			{/* Summary */}
			<div className="mt-3 text-xs text-base-content/40">
				{grantedCount} of {roles.length} roles have access
			</div>
		</div>
	)
}

/**
 * Resource group header with expand/collapse and counts.
 * Industry pattern: AWS IAM Console.
 */
function ResourceGroupHeader({
	group,
	roles,
	isExpanded,
	onToggle,
}: {
	group: GroupedPermissions
	roles: RoleDefinitionDto[]
	isExpanded: boolean
	onToggle: () => void
}) {
	return (
		<tr className="group">
			<td
				colSpan={roles.length + 1}
				className="cursor-pointer bg-base-200/50 px-3 py-2.5 transition-colors hover:bg-base-200/70"
				onClick={onToggle}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<motion.div
							animate={{ rotate: isExpanded ? 90 : 0 }}
							transition={{ duration: 0.2 }}
						>
							<ChevronRight className="h-4 w-4 text-base-content/50" />
						</motion.div>
						<span className="text-sm font-semibold text-base-content">
							{capitalize(group.resource)}
						</span>
						<span className="rounded-full bg-base-300/50 px-2 py-0.5 text-xs font-medium text-base-content/60">
							{group.entries.length}
						</span>
					</div>
					<div className="flex items-center gap-1 text-xs text-base-content/50">
						<span className="text-success">{group.totalGranted}</span>
						<span>/</span>
						<span>{group.entries.length * roles.length}</span>
						<span className="ml-1">granted</span>
					</div>
				</div>
			</td>
		</tr>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export function PermissionMatrix({
	matrix,
	roles,
	canEdit = false,
	onPermissionToggle,
	togglingPermission,
	optimisticUpdates,
	getOptimisticKey,
}: PermissionMatrixProps) {
	// State
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedResource, setSelectedResource] = useState<string | null>(null)
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
	const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null)

	// Refs for keyboard navigation
	const tableRef = useRef<HTMLTableElement>(null)

	// ---------------------------------------------------------------------------
	// DERIVED STATE
	// React Compiler auto-optimizes - no useMemo needed
	// ---------------------------------------------------------------------------

	// Sort roles by level (ascending: Customer -> Admin)
	const sortedRoles = [...roles].sort((a, b) => a.level - b.level)
	const roleLevels = sortedRoles.map((r) => r.level)

	// Get unique resources for filter dropdown
	const resources = Array.from(new Set(matrix.map((entry) => entry.resource))).sort()

	// Filter matrix entries
	let filteredMatrix = matrix

	if (selectedResource) {
		filteredMatrix = filteredMatrix.filter((entry) => entry.resource === selectedResource)
	}

	if (searchTerm) {
		const term = searchTerm.toLowerCase()
		filteredMatrix = filteredMatrix.filter(
			(entry) =>
				entry.resource.toLowerCase().includes(term) ||
				entry.action.toLowerCase().includes(term) ||
				(entry.context && entry.context.toLowerCase().includes(term)) ||
				entry.description.toLowerCase().includes(term)
		)
	}

	// Group by resource with statistics
	const groupedPermissions = groupPermissionsByResource(filteredMatrix, roleLevels)

	// Initialize expanded groups (expand all by default on first load)
	// FIX: Moved to useEffect to avoid setState during render
	useEffect(() => {
		if (expandedGroups.size === 0 && groupedPermissions.length > 0) {
			setExpandedGroups(new Set(groupedPermissions.map((g) => g.resource)))
		}
	}, [groupedPermissions.length]) // Only re-run when data loads

	// Find highest role level
	const highestRoleLevel = sortedRoles.length > 0
		? Math.max(...sortedRoles.map((r) => r.level))
		: 0

	// Calculate totals for summary
	const totalPermissions = matrix.length
	const totalGranted = matrix.reduce((sum, entry) => {
		return sum + Object.values(entry.roleAccess).filter(Boolean).length
	}, 0)
	const totalPossible = totalPermissions * sortedRoles.length

	// Check if filters are active
	const hasActiveFilters = searchTerm !== '' || selectedResource !== null

	// ---------------------------------------------------------------------------
	// HANDLERS
	// ---------------------------------------------------------------------------

	/**
	 * Handle permission toggle click.
	 * React Compiler auto-memoizes - no useCallback needed.
	 * This ensures we always have the latest prop values.
	 */
	const handlePermissionClick = (
		entry: PermissionMatrixEntry,
		roleLevel: number,
		currentValue: boolean
	) => {
		// Debug: Log click attempt (remove in production)
		console.log('[PermissionMatrix] handlePermissionClick called', {
			canEdit,
			hasOnPermissionToggle: !!onPermissionToggle,
			roleLevel,
			highestRoleLevel,
			entry: `${entry.resource}:${entry.action}`,
		})

		if (!canEdit) {
			console.warn('[PermissionMatrix] Click ignored: canEdit is false')
			return
		}
		if (!onPermissionToggle) {
			console.warn('[PermissionMatrix] Click ignored: onPermissionToggle is undefined')
			return
		}
		if (roleLevel === highestRoleLevel) {
			console.warn('[PermissionMatrix] Click ignored: clicking highest role (admin)')
			return
		}

		console.log('[PermissionMatrix] Calling onPermissionToggle...')
		onPermissionToggle(entry.resource, entry.action, entry.context, roleLevel, !currentValue)
	}

	const toggleGroup = useCallback((resource: string) => {
		setExpandedGroups((prev) => {
			const next = new Set(prev)
			if (next.has(resource)) {
				next.delete(resource)
			} else {
				next.add(resource)
			}
			return next
		})
	}, [])

	const clearFilters = useCallback(() => {
		setSearchTerm('')
		setSelectedResource(null)
	}, [])

	const expandAll = useCallback(() => {
		setExpandedGroups(new Set(groupedPermissions.map((g) => g.resource)))
	}, [groupedPermissions])

	const collapseAll = useCallback(() => {
		setExpandedGroups(new Set())
	}, [])

	// Keyboard navigation handler
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
			const maxRow = filteredMatrix.length - 1
			const maxCol = sortedRoles.length - 1

			switch (e.key) {
				case 'ArrowRight':
					e.preventDefault()
					if (colIndex < maxCol) setFocusedCell({ row: rowIndex, col: colIndex + 1 })
					break
				case 'ArrowLeft':
					e.preventDefault()
					if (colIndex > 0) setFocusedCell({ row: rowIndex, col: colIndex - 1 })
					break
				case 'ArrowDown':
					e.preventDefault()
					if (rowIndex < maxRow) setFocusedCell({ row: rowIndex + 1, col: colIndex })
					break
				case 'ArrowUp':
					e.preventDefault()
					if (rowIndex > 0) setFocusedCell({ row: rowIndex - 1, col: colIndex })
					break
			}
		},
		[filteredMatrix.length, sortedRoles.length]
	)

	// ---------------------------------------------------------------------------
	// RENDER
	// ---------------------------------------------------------------------------

	return (
		<Card className="border border-base-300 bg-base-100 shadow-sm">
			{/* Header */}
			<div className="border-b border-base-200 p-4 sm:p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 className="text-lg font-semibold text-base-content">Permission Matrix</h3>
						<p className="text-sm text-base-content/60">
							View and manage which roles have access to each feature
						</p>
					</div>

					{/* Quick actions */}
					<div className="flex items-center gap-2">
						<button
							onClick={expandAll}
							className="rounded-lg px-3 py-1.5 text-xs font-medium text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content"
						>
							Expand all
						</button>
						<button
							onClick={collapseAll}
							className="rounded-lg px-3 py-1.5 text-xs font-medium text-base-content/60 transition-colors hover:bg-base-200 hover:text-base-content"
						>
							Collapse all
						</button>
					</div>
				</div>

				{/* Summary bar */}
				<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-base-content/60">
					<span>
						<span className="font-medium text-base-content">{filteredMatrix.length}</span>
						{hasActiveFilters && ` of ${totalPermissions}`} permissions
					</span>
					<span className="hidden sm:inline">•</span>
					<span>
						<span className="font-medium text-success">{totalGranted}</span> / {totalPossible} grants
					</span>
					<span className="hidden sm:inline">•</span>
					<span>{resources.length} resources</span>
					<span className="hidden sm:inline">•</span>
					<span>{sortedRoles.length} roles</span>
				</div>
			</div>

			{/* Filters */}
			<div className="border-b border-base-200 bg-base-50 p-4 sm:px-6">
				<div className="flex flex-wrap items-center gap-3">
					{/* Search */}
					<div className="relative min-w-[200px] flex-1 sm:max-w-xs">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
						<input
							type="text"
							placeholder="Search permissions..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full rounded-lg border border-base-300 bg-base-100 py-2 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						/>
					</div>

					{/* Resource filter */}
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-base-content/40" />
						<select
							value={selectedResource ?? ''}
							onChange={(e) => setSelectedResource(e.target.value || null)}
							className="rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						>
							<option value="">All Resources</option>
							{resources.map((resource) => (
								<option key={resource} value={resource}>
									{capitalize(resource)}
								</option>
							))}
						</select>
					</div>

					{/* Clear filters */}
					{hasActiveFilters && (
						<button
							onClick={clearFilters}
							className="rounded-lg bg-base-200 px-3 py-2 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-300 hover:text-base-content"
						>
							Clear filters
						</button>
					)}
				</div>
			</div>

			{/* Desktop Matrix View */}
			<div className="hidden overflow-x-auto lg:block">
				<table ref={tableRef} className="w-full min-w-[800px] border-collapse">
					{/* Sticky header */}
					<thead className="sticky top-0 z-20 bg-base-100">
						<tr>
							<th className="sticky left-0 z-30 border-b border-r border-base-300 bg-base-100 p-3 text-left text-sm font-semibold text-base-content">
								Permission
							</th>
							{sortedRoles.map((role) => {
								const config = getRoleConfig(role.name)
								return (
									<th
										key={role.id}
										className="border-b border-base-300 p-2 text-center"
									>
										<div
											className={`mx-auto rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${config.headerColor}`}
											title={role.displayName}
										>
											{config.abbreviation}
										</div>
									</th>
								)
							})}
						</tr>
					</thead>

					{/* Body grouped by resource */}
					<tbody>
						{groupedPermissions.map((group) => {
							const isExpanded = expandedGroups.has(group.resource)

							return (
								<Fragment key={`group-${group.resource}`}>
									{/* Resource group header */}
									<ResourceGroupHeader
										group={group}
										roles={sortedRoles}
										isExpanded={isExpanded}
										onToggle={() => toggleGroup(group.resource)}
									/>

									{/* Permission rows (animated) */}
									<AnimatePresence initial={false}>
										{isExpanded &&
											group.entries.map((entry, entryIndex) => {
												const permissionKey = `${entry.resource}:${entry.action}${entry.context ? `:${entry.context}` : ''}`
												const globalIndex = filteredMatrix.indexOf(entry)

												return (
													<motion.tr
														key={permissionKey}
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: 'auto' }}
														exit={{ opacity: 0, height: 0 }}
														transition={{ duration: 0.2, delay: entryIndex * 0.02 }}
														className="border-b border-base-200 hover:bg-primary/5"
													>
														{/* Permission name - sticky */}
														<td className="sticky left-0 z-10 border-r border-base-200 bg-base-100 p-3">
															<div className="pl-6">
																<span className="font-mono text-sm text-base-content">
																	{entry.action}
																	{entry.context && (
																		<span className="text-base-content/50">
																			:{entry.context}
																		</span>
																	)}
																</span>
																{entry.description && (
																	<p className="mt-0.5 text-xs text-base-content/50 max-w-[200px] truncate" title={entry.description}>
																		{entry.description}
																	</p>
																)}
															</div>
														</td>

														{/* Role columns */}
														{sortedRoles.map((role, colIndex) => {
															const hasAccess = entry.roleAccess[role.level] ?? false
															const isHighestRole = role.level === highestRoleLevel
															const isClickable = canEdit && !isHighestRole
															const isFocused =
																focusedCell?.row === globalIndex &&
																focusedCell?.col === colIndex

															// Build permission string for optimistic lookup
															const permissionString = entry.context
																? `${entry.resource}:${entry.action}:${entry.context}`
																: `${entry.resource}:${entry.action}`

															// Check for optimistic value
															const optimisticKey = getOptimisticKey?.(role.level, permissionString)
															const optimisticValue = optimisticKey ? optimisticUpdates?.get(optimisticKey) : undefined

															// Check if this cell is loading
															const isLoading =
																togglingPermission?.roleLevel === role.level &&
																togglingPermission?.permissionString.toLowerCase() === permissionString.toLowerCase()

															return (
																<td
																	key={role.id}
																	className={`p-2 text-center ${isFocused ? 'ring-2 ring-inset ring-primary' : ''}`}
																	tabIndex={isClickable ? 0 : -1}
																	onKeyDown={(e) => handleKeyDown(e, globalIndex, colIndex)}
																	onFocus={() => setFocusedCell({ row: globalIndex, col: colIndex })}
																>
																	<PermissionIndicator
																		hasAccess={hasAccess}
																		isClickable={isClickable}
																		isHighestRole={isHighestRole}
																		roleDisplayName={role.displayName}
																		onClick={() => handlePermissionClick(entry, role.level, hasAccess)}
																		isLoading={isLoading}
																		optimisticValue={optimisticValue}
																	/>
																</td>
															)
														})}
													</motion.tr>
												)
											})}
									</AnimatePresence>
								</Fragment>
							)
						})}
					</tbody>
				</table>
			</div>

			{/* Mobile Card View */}
			<div className="block p-4 lg:hidden">
				{groupedPermissions.length > 0 ? (
					<div className="space-y-6">
						{groupedPermissions.map((group) => (
							<div key={group.resource}>
								{/* Resource header */}
								<div
									className="mb-3 flex cursor-pointer items-center justify-between"
									onClick={() => toggleGroup(group.resource)}
								>
									<div className="flex items-center gap-2">
										<motion.div
											animate={{ rotate: expandedGroups.has(group.resource) ? 90 : 0 }}
											transition={{ duration: 0.2 }}
										>
											<ChevronRight className="h-4 w-4 text-base-content/50" />
										</motion.div>
										<h4 className="font-semibold text-base-content">
											{capitalize(group.resource)}
										</h4>
										<span className="rounded-full bg-base-200 px-2 py-0.5 text-xs">
											{group.entries.length}
										</span>
									</div>
								</div>

								{/* Permission cards */}
								<AnimatePresence initial={false}>
									{expandedGroups.has(group.resource) && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											exit={{ opacity: 0, height: 0 }}
											className="space-y-3 overflow-hidden"
										>
											{group.entries.map((entry) => (
												<MobilePermissionCard
													key={`${entry.resource}:${entry.action}:${entry.context ?? ''}`}
													entry={entry}
													roles={sortedRoles}
													canEdit={canEdit}
													highestRoleLevel={highestRoleLevel}
													onToggle={(roleLevel, currentValue) =>
														handlePermissionClick(entry, roleLevel, currentValue)
													}
													togglingPermission={togglingPermission}
													optimisticUpdates={optimisticUpdates}
													getOptimisticKey={getOptimisticKey}
												/>
											))}
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						))}
					</div>
				) : (
					/* Empty state for mobile */
					<EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
				)}
			</div>

			{/* Desktop Empty state */}
			{filteredMatrix.length === 0 && (
				<div className="hidden lg:block">
					<EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
				</div>
			)}

			{/* Legend */}
			<div className="border-t border-base-200 p-4 sm:px-6">
				<div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60 sm:gap-6">
					<div className="flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-content">
							<Check className="h-3 w-3" strokeWidth={3} />
						</div>
						<span>Has access</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-base-300" />
						<span>No access</span>
					</div>
					{canEdit && (
						<div className="ml-auto text-xs text-base-content/40">
							Click indicators to toggle permissions
						</div>
					)}
				</div>
			</div>
		</Card>
	)
}

/**
 * Empty state component - MAANG-level design.
 * Clear messaging with actionable CTA.
 */
function EmptyState({
	hasActiveFilters,
	onClearFilters,
}: {
	hasActiveFilters: boolean
	onClearFilters: () => void
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="mb-4 rounded-full bg-base-200 p-4">
				{hasActiveFilters ? (
					<Search className="h-8 w-8 text-base-content/30" />
				) : (
					<Shield className="h-8 w-8 text-base-content/30" />
				)}
			</div>
			<h4 className="mb-1 font-medium text-base-content">
				{hasActiveFilters ? 'No results found' : 'No permissions configured'}
			</h4>
			<p className="mb-4 max-w-xs text-sm text-base-content/60">
				{hasActiveFilters
					? 'Try adjusting your search or filter to find what you\'re looking for.'
					: 'Permissions will appear here once they are configured in the system.'}
			</p>
			{hasActiveFilters && (
				<button
					onClick={onClearFilters}
					className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content transition-colors hover:bg-primary/90"
				>
					Clear filters
				</button>
			)}
		</div>
	)
}

export default PermissionMatrix
