/**
 * PermissionMatrix Component
 *
 * Interactive matrix showing permissions by role.
 * Rows are resources/actions, columns are roles.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * With React Compiler (`reactCompiler: true`):
 * - No useMemo needed for derived state - compiler auto-optimizes
 * - Filtering and grouping operations are handled efficiently by the compiler
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @see prd_rbac_management.md - US-RBAC-002, US-RBAC-003
 * @module app/rbac/_components/PermissionMatrix
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Check, X, Filter, Search, Info } from 'lucide-react'

import Card from '@_components/ui/Card'
import { RoleLevels, RoleDisplayNames } from '@_types/rbac'
import type { PermissionMatrixEntry, RoleDefinitionDto } from '@_types/rbac-management'

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
}

// =========================================================================
// CONSTANTS
// =========================================================================

const ROLE_LEVELS = [
	RoleLevels.Customer,
	RoleLevels.SalesRep,
	RoleLevels.SalesManager,
	RoleLevels.FulfillmentCoordinator,
	RoleLevels.Admin,
]

const ROLE_HEADER_COLORS: Record<number, string> = {
	0: 'bg-slate-500',
	100: 'bg-blue-500',
	200: 'bg-purple-500',
	300: 'bg-amber-500',
	9999999: 'bg-rose-500',
}

// =========================================================================
// COMPONENT
// =========================================================================

export function PermissionMatrix({
	matrix,
	roles,
	canEdit = false,
	onPermissionToggle,
}: PermissionMatrixProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedResource, setSelectedResource] = useState<string | null>(null)

	// ---------------------------------------------------------------------------
	// DERIVED STATE
	// React Compiler auto-optimizes - no useMemo needed
	// ---------------------------------------------------------------------------

	// Get unique resources for filter dropdown
	const resources = Array.from(new Set(matrix.map((entry) => entry.resource))).sort()

	// Filter matrix entries
	let filteredMatrix = matrix

	// Filter by resource
	if (selectedResource) {
		filteredMatrix = filteredMatrix.filter((entry) => entry.resource === selectedResource)
	}

	// Filter by search term
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

	// Group by resource for better visualization
	const groupedMatrix: Record<string, PermissionMatrixEntry[]> = {}
	filteredMatrix.forEach((entry) => {
		if (!groupedMatrix[entry.resource]) {
			groupedMatrix[entry.resource] = []
		}
		groupedMatrix[entry.resource].push(entry)
	})

	const handlePermissionClick = (
		entry: PermissionMatrixEntry,
		roleLevel: number,
		currentValue: boolean
	) => {
		if (!canEdit || !onPermissionToggle) return

		// Admin always has all permissions (cannot be toggled)
		if (roleLevel === RoleLevels.Admin) return

		onPermissionToggle(entry.resource, entry.action, entry.context, roleLevel, !currentValue)
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			{/* Header */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-base-content">Permission Matrix</h3>
				<p className="text-sm text-base-content/60">
					View which roles have access to each feature
				</p>
			</div>

			{/* Filters */}
			<div className="mb-6 flex flex-wrap items-center gap-4">
				{/* Search */}
				<div className="relative flex-1 min-w-[200px]">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
					<input
						type="text"
						placeholder="Search permissions..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full rounded-lg border border-base-300 bg-base-100 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>

				{/* Resource filter */}
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-base-content/40" />
					<select
						value={selectedResource || ''}
						onChange={(e) => setSelectedResource(e.target.value || null)}
						className="rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					>
						<option value="">All Resources</option>
						{resources.map((resource) => (
							<option key={resource} value={resource}>
								{resource.charAt(0).toUpperCase() + resource.slice(1)}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Matrix Table */}
			<div className="overflow-x-auto">
				<table className="w-full min-w-[800px] border-collapse">
					{/* Header */}
					<thead>
						<tr>
							<th className="sticky left-0 z-10 bg-base-100 p-3 text-left text-sm font-semibold text-base-content border-b border-base-300">
								Permission
							</th>
							{ROLE_LEVELS.map((level) => (
								<th
									key={level}
									className="p-3 text-center text-sm font-semibold text-white border-b border-base-300"
								>
									<div
										className={`rounded-lg px-3 py-2 ${ROLE_HEADER_COLORS[level]}`}
									>
										{RoleDisplayNames[level]?.split(' ')[0] || 'Unknown'}
									</div>
								</th>
							))}
						</tr>
					</thead>

					{/* Body grouped by resource */}
					<tbody>
						{Object.entries(groupedMatrix).map(([resource, entries], groupIndex) => (
							<>
								{/* Resource group header */}
								<tr key={`group-${resource}`}>
									<td
										colSpan={ROLE_LEVELS.length + 1}
										className="bg-base-200/50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-base-content/60"
									>
										{resource.charAt(0).toUpperCase() + resource.slice(1)}
									</td>
								</tr>

								{/* Permission rows */}
								{entries.map((entry, entryIndex) => {
									const permissionKey = `${entry.resource}:${entry.action}${
										entry.context ? `:${entry.context}` : ''
									}`

									return (
										<motion.tr
											key={permissionKey}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: (groupIndex * entries.length + entryIndex) * 0.02 }}
											className="border-b border-base-200 hover:bg-base-200/30"
										>
											{/* Permission name */}
											<td className="sticky left-0 z-10 bg-base-100 p-3">
												<div className="flex items-start gap-2">
													<div>
														<span className="font-mono text-sm text-base-content">
															{entry.action}
															{entry.context && (
																<span className="text-base-content/50">
																	:{entry.context}
																</span>
															)}
														</span>
														{entry.description && (
															<p className="mt-0.5 text-xs text-base-content/50">
																{entry.description}
															</p>
														)}
													</div>
												</div>
											</td>

											{/* Role columns */}
											{ROLE_LEVELS.map((level) => {
												const hasAccess = entry.roleAccess[level] ?? false
												const isAdmin = level === RoleLevels.Admin
												const isClickable = canEdit && !isAdmin

												return (
													<td key={level} className="p-3 text-center">
														<button
															onClick={() =>
																handlePermissionClick(entry, level, hasAccess)
															}
															disabled={!isClickable}
															className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
																hasAccess
																	? 'bg-success/20 text-success'
																	: 'bg-base-200 text-base-content/30'
															} ${
																isClickable
																	? 'cursor-pointer hover:scale-110 hover:shadow-md'
																	: 'cursor-default'
															} ${isAdmin ? 'opacity-75' : ''}`}
															title={
																isAdmin
																	? 'Admin always has all permissions'
																	: hasAccess
																		? 'Has access'
																		: 'No access'
															}
														>
															{hasAccess ? (
																<Check className="h-4 w-4" />
															) : (
																<X className="h-4 w-4" />
															)}
														</button>
													</td>
												)
											})}
										</motion.tr>
									)
								})}
							</>
						))}
					</tbody>
				</table>
			</div>

			{/* Empty state */}
			{filteredMatrix.length === 0 && (
				<div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
					<Info className="mb-4 h-12 w-12 text-base-content/20" />
					<p className="text-base-content/60">No permissions match your filters</p>
					<button
						onClick={() => {
							setSearchTerm('')
							setSelectedResource(null)
						}}
						className="mt-2 text-sm text-primary hover:underline"
					>
						Clear filters
					</button>
				</div>
			)}

			{/* Legend */}
			<div className="mt-6 flex items-center gap-6 border-t border-base-200 pt-4 text-sm text-base-content/60">
				<div className="flex items-center gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded bg-success/20 text-success">
						<Check className="h-3 w-3" />
					</div>
					<span>Has access</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded bg-base-200 text-base-content/30">
						<X className="h-3 w-3" />
					</div>
					<span>No access</span>
				</div>
				{canEdit && (
					<div className="ml-auto text-xs text-base-content/40">
						Click to toggle permissions (except Admin)
					</div>
				)}
			</div>
		</Card>
	)
}

export default PermissionMatrix

