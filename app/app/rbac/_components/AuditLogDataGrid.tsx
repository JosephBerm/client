/**
 * AuditLogDataGrid Component
 *
 * Modern data grid for displaying permission audit log entries.
 * **Migration:** Phase 4.1 - Migrated from ServerDataGrid to RichDataGrid
 * Mobile-first responsive design.
 *
 * Features:
 * - Client-side data display via RichDataGrid
 * - Custom cell renderers for complex data
 * - Filter panel for date range, user, and resource filtering
 * - Skeleton loading states
 *
 * @see prd_rbac_management.md - US-RBAC-005
 * @see RICHDATAGRID_MIGRATION_PLAN.md
 * @module app/rbac/_components/AuditLogDataGrid
 */

'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
	Check,
	X,
	Filter,
	User,
	Globe,
	Clock,
	Search,
	RefreshCw,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'
import {
	RichDataGrid,
	createRichColumnHelper,
	type RichColumnDef,
} from '@_components/tables/RichDataGrid'

import type { PermissionAuditEntryDto, AuditLogFilters } from '@_types/rbac-management'
import type { PagedResult } from '@_classes/Base/PagedResult'

// =========================================================================
// TYPES
// =========================================================================

interface AuditLogDataGridProps {
	data: PagedResult<PermissionAuditEntryDto> | null
	isLoading: boolean
	error: string | null
	filters: AuditLogFilters
	onFiltersChange: (filters: AuditLogFilters) => void
	onRefresh: () => void
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Format date string to human-readable format
 */
function formatDate(dateString: string): string {
	try {
		return format(parseISO(dateString), 'MMM d, yyyy h:mm a')
	} catch {
		return dateString
	}
}

// =========================================================================
// CELL COMPONENTS
// =========================================================================

/**
 * Timestamp cell with clock icon - mobile optimized
 */
function TimestampCell({ value }: { value: string }) {
	return (
		<div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-base-content/70">
			<Clock className="h-3 w-3 sm:h-4 sm:w-4 text-base-content/40 flex-shrink-0" />
			<span className="whitespace-nowrap truncate">{formatDate(value)}</span>
		</div>
	)
}

/**
 * User cell with name and email - mobile optimized
 */
function UserCell({
	userName,
	userId,
	userEmail,
}: {
	userName: string
	userId: number | null
	userEmail: string
}) {
	return (
		<div className="flex flex-col min-w-0">
			<span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-base-content truncate">
				<User className="h-3 w-3 sm:h-4 sm:w-4 text-base-content/40 flex-shrink-0" />
				<span className="truncate">{userName || `User #${userId}`}</span>
			</span>
			{userEmail && (
				<span className="ml-4 sm:ml-6 text-xs text-base-content/50 truncate">
					{userEmail}
				</span>
			)}
		</div>
	)
}

/**
 * Permission cell with resource:action format - mobile optimized
 */
function PermissionCell({
	resource,
	action,
	resourceId,
}: {
	resource: string
	action: string
	resourceId: number | null
}) {
	return (
		<div className="flex flex-wrap items-center gap-1 sm:gap-2 min-w-0">
			<span className="rounded-md bg-base-200 px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs sm:text-sm text-base-content truncate">
				{resource}:{action}
			</span>
			{resourceId && (
				<span className="text-xs text-base-content/50 whitespace-nowrap">
					(ID: {resourceId})
				</span>
			)}
		</div>
	)
}

/**
 * Result cell with allowed/denied badge - mobile optimized
 */
function ResultCell({ allowed }: { allowed: boolean }) {
	return allowed ? (
		<span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-success/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-success whitespace-nowrap">
			<Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
			<span className="hidden sm:inline">Allowed</span>
			<span className="sm:hidden">OK</span>
		</span>
	) : (
		<span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-error/20 px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium text-error whitespace-nowrap">
			<X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
			<span className="hidden sm:inline">Denied</span>
			<span className="sm:hidden">No</span>
		</span>
	)
}

/**
 * Details cell with reason and IP address - mobile optimized
 */
function DetailsCell({
	reason,
	ipAddress,
}: {
	reason: string | null
	ipAddress?: string
}) {
	return (
		<div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
			{reason && (
				<span className="text-xs text-base-content/60 line-clamp-2">{reason}</span>
			)}
			{ipAddress && (
				<span className="flex items-center gap-1 text-xs text-base-content/40">
					<Globe className="h-3 w-3 flex-shrink-0" />
					<span className="truncate">{ipAddress}</span>
				</span>
			)}
			{!reason && !ipAddress && (
				<span className="text-xs text-base-content/30">—</span>
			)}
		</div>
	)
}

// =========================================================================
// FILTER PANEL COMPONENT
// =========================================================================

interface FilterPanelProps {
	localFilters: AuditLogFilters
	onLocalFiltersChange: (filters: AuditLogFilters) => void
	onApply: () => void
	onClear: () => void
}

function FilterPanel({
	localFilters,
	onLocalFiltersChange,
	onApply,
	onClear,
}: FilterPanelProps) {
	return (
		<motion.div
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: 'auto', opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			className="mb-4 sm:mb-6 overflow-hidden rounded-lg border border-base-300 bg-base-200/30 p-3 sm:p-4"
		>
			{/* Mobile: stack vertically, Desktop: grid */}
			<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{/* Date range */}
				<div>
					<label className="mb-1 block text-xs font-medium text-base-content/60">
						Start Date
					</label>
					<input
						type="date"
						value={localFilters.startDate?.split('T')[0] || ''}
						onChange={(e) =>
							onLocalFiltersChange({
								...localFilters,
								startDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
							})
						}
						className="w-full rounded-lg border border-base-300 bg-base-100 px-2 sm:px-3 py-1.5 sm:py-2 text-sm"
					/>
				</div>
				<div>
					<label className="mb-1 block text-xs font-medium text-base-content/60">
						End Date
					</label>
					<input
						type="date"
						value={localFilters.endDate?.split('T')[0] || ''}
						onChange={(e) =>
							onLocalFiltersChange({
								...localFilters,
								endDate: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
							})
						}
						className="w-full rounded-lg border border-base-300 bg-base-100 px-2 sm:px-3 py-1.5 sm:py-2 text-sm"
					/>
				</div>

				{/* User ID */}
				<div>
					<label className="mb-1 block text-xs font-medium text-base-content/60">
						User ID
					</label>
					<input
						type="number"
						placeholder="Filter by user..."
						value={localFilters.userId || ''}
						onChange={(e) =>
							onLocalFiltersChange({
								...localFilters,
								userId: e.target.value ? parseInt(e.target.value) : undefined,
							})
						}
						className="w-full rounded-lg border border-base-300 bg-base-100 px-2 sm:px-3 py-1.5 sm:py-2 text-sm"
					/>
				</div>

				{/* Resource */}
				<div>
					<label className="mb-1 block text-xs font-medium text-base-content/60">
						Resource
					</label>
					<input
						type="text"
						placeholder="e.g., quotes, orders..."
						value={localFilters.resource || ''}
						onChange={(e) =>
							onLocalFiltersChange({
								...localFilters,
								resource: e.target.value || undefined,
							})
						}
						className="w-full rounded-lg border border-base-300 bg-base-100 px-2 sm:px-3 py-1.5 sm:py-2 text-sm"
					/>
				</div>
			</div>

			<div className="mt-3 sm:mt-4 flex justify-end gap-2">
				<Button variant="ghost" size="sm" onClick={onClear}>
					Clear
				</Button>
				<Button variant="primary" size="sm" onClick={onApply}>
					Apply
				</Button>
			</div>
		</motion.div>
	)
}

// =========================================================================
// COLUMN HELPER
// =========================================================================

const columnHelper = createRichColumnHelper<PermissionAuditEntryDto>()

/**
 * Creates column definitions for the audit log grid.
 * Using createRichColumnHelper for type-safe column definitions.
 */
function createAuditLogColumns(): RichColumnDef<PermissionAuditEntryDto, unknown>[] {
	return [
		columnHelper.accessor('timestamp', {
			id: 'timestamp',
			header: 'Timestamp',
			cell: ({ row }) => <TimestampCell value={row.original.timestamp} />,
			size: 180,
			enableSorting: false,
		}),
		columnHelper.accessor('userName', {
			id: 'user',
			header: 'User',
			cell: ({ row }) => (
				<UserCell
					userName={row.original.userName}
					userId={row.original.userId}
					userEmail={row.original.userEmail}
				/>
			),
			size: 180,
			enableSorting: false,
		}),
		columnHelper.accessor('resource', {
			id: 'permission',
			header: 'Permission',
			cell: ({ row }) => (
				<PermissionCell
					resource={row.original.resource}
					action={row.original.action}
					resourceId={row.original.resourceId}
				/>
			),
			size: 180,
			enableSorting: false,
		}),
		columnHelper.accessor('allowed', {
			id: 'result',
			header: 'Result',
			cell: ({ row }) => <ResultCell allowed={row.original.allowed} />,
			size: 90,
			enableSorting: false,
		}),
		columnHelper.accessor('reason', {
			id: 'details',
			header: 'Details',
			cell: ({ row }) => (
				<DetailsCell
					reason={row.original.reason}
					ipAddress={row.original.ipAddress ?? undefined}
				/>
			),
			size: 160,
			enableSorting: false,
		}),
	]
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export function AuditLogDataGrid({
	data,
	isLoading,
	error,
	filters,
	onFiltersChange,
	onRefresh,
}: AuditLogDataGridProps) {
	const [showFilters, setShowFilters] = useState(false)
	const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters)

	// Column definitions - React Compiler auto-memoizes based on dependencies
	const columns = useMemo(() => createAuditLogColumns(), [])

	// Handlers - no useCallback needed in React 19
	const handleApplyFilters = () => {
		onFiltersChange(localFilters)
	}

	const handleClearFilters = () => {
		const clearedFilters: AuditLogFilters = { page: 1, pageSize: filters.pageSize }
		setLocalFilters(clearedFilters)
		onFiltersChange(clearedFilters)
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-3 sm:p-6 shadow-sm">
			{/* Header - mobile responsive */}
			<div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h3 className="text-base sm:text-lg font-semibold text-base-content">
						Permission Audit Log
					</h3>
					<p className="text-xs sm:text-sm text-base-content/60">
						Track all permission checks in the system
					</p>
				</div>
				<div className="flex items-center gap-2 self-end sm:self-auto">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowFilters(!showFilters)}
						className="gap-1 sm:gap-2"
					>
						<Filter className="h-4 w-4" />
						<span className="hidden sm:inline">Filters</span>
					</Button>
					<Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
						<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					</Button>
				</div>
			</div>

			{/* Filters panel */}
			{showFilters && (
				<FilterPanel
					localFilters={localFilters}
					onLocalFiltersChange={setLocalFilters}
					onApply={handleApplyFilters}
					onClear={handleClearFilters}
				/>
			)}

			{/* Error state */}
			{error && (
				<div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3 sm:p-4 text-error text-sm">
					{error}
				</div>
			)}

			{/* Loading state (initial) */}
			{isLoading && !data && (
				<div className="flex items-center justify-center py-8 sm:py-12">
					<RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
				</div>
			)}

			{/* Data Grid */}
			{data && (
				<div className="overflow-x-auto -mx-3 sm:mx-0">
					<div className="min-w-[640px] px-3 sm:px-0">
						<RichDataGrid<PermissionAuditEntryDto>
							columns={columns}
							data={data.data ?? []}
							defaultPageSize={filters.pageSize ?? 20}
							enableGlobalSearch={false}
							enableColumnFilters={false}
							enableRowSelection={false}
							showToolbar={false}
							showPagination
							emptyState={
								<div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
									<Search className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-base-content/20" />
									<p className="text-sm text-base-content/60">No audit log entries found</p>
									{(filters.startDate ||
										filters.endDate ||
										filters.userId ||
										filters.resource) && (
										<button
											type="button"
											onClick={handleClearFilters}
											className="mt-2 text-sm text-primary hover:underline"
										>
											Clear filters
										</button>
									)}
								</div>
							}
							ariaLabel="Permission audit log table"
						/>
					</div>
				</div>
			)}
		</Card>
	)
}

export default AuditLogDataGrid
