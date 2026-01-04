/**
 * AuditLogRichDataGrid Component
 *
 * Modern data grid for displaying permission audit log entries.
 * Uses RichDataGrid for server-side pagination, filtering, and sorting.
 *
 * Features:
 * - Server-side pagination and sorting
 * - Column filters (date, user, resource, result)
 * - Global search
 * - Export to CSV
 * - Faceted filters for resource and result
 *
 * @see prd_rbac_management.md - US-RBAC-005
 * @module app/rbac/_components/AuditLogRichDataGrid
 */

'use client'

import { useCallback, useState } from 'react'

import {
	Check,
	X,
	User,
	Globe,
	Clock,
	Download,
	Search,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { API, notificationService } from '@_shared'

import {
	RichDataGrid,
	createRichColumnHelper,
	createColumnId,
	FilterType,
	SortDirection,
	BulkActionVariant,
	type BulkAction,
} from '@_components/tables/RichDataGrid'
import type { RichSearchFilter, RichPagedResult, RichColumnDef } from '@_components/tables/RichDataGrid'
import Card from '@_components/ui/Card'

import type { PermissionAuditEntryDto } from '@_types/rbac-management'

// =========================================================================
// TYPES
// =========================================================================

interface AuditLogRichDataGridProps {
	/** Whether audit logs can be viewed */
	canView: boolean
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
// MAIN COMPONENT
// =========================================================================

export function AuditLogRichDataGrid({ canView }: AuditLogRichDataGridProps) {
	const [refreshKey, setRefreshKey] = useState(0)

	// Custom fetcher for RichDataGrid
	const fetcher = useCallback(
		async (filter: RichSearchFilter): Promise<RichPagedResult<PermissionAuditEntryDto>> => {
			const response = await API.RBAC.getAuditLog({
				page: filter.page,
				pageSize: filter.pageSize,
				// Map column filters to audit log specific params
				...(filter.globalSearch && { search: filter.globalSearch }),
			})

			if (response.data?.payload) {
				const payload = response.data.payload
				return {
					data: payload.data ?? [],
					page: payload.page ?? filter.page,
					pageSize: payload.pageSize ?? filter.pageSize,
					total: payload.total ?? 0,
					totalPages: payload.totalPages ?? payload.pageCount ?? 1,
					hasNext: (payload.page ?? filter.page) < (payload.totalPages ?? payload.pageCount ?? 1),
					hasPrevious: (payload.page ?? filter.page) > 1,
				}
			}

			// Return empty result on error
			return {
				data: [],
				page: 1,
				pageSize: filter.pageSize,
				total: 0,
				totalPages: 0,
				hasNext: false,
				hasPrevious: false,
			}
		},
		[]
	)

	// Column helper for type-safe column definitions
	const columnHelper = createRichColumnHelper<PermissionAuditEntryDto>()

	const columns: RichColumnDef<PermissionAuditEntryDto, unknown>[] = [
		// Timestamp - Date filter
		columnHelper.accessor('timestamp', {
			header: 'Timestamp',
			filterType: FilterType.Date,
			cell: ({ row }) => <TimestampCell value={row.original.timestamp} />,
			size: 180,
		}),

		// User - Text filter, searchable
		columnHelper.accessor('userName', {
			header: 'User',
			filterType: FilterType.Text,
			searchable: true,
			cell: ({ row }) => (
				<UserCell
					userName={row.original.userName}
					userId={row.original.userId}
					userEmail={row.original.userEmail}
				/>
			),
			size: 180,
		}),

		// Permission - Text filter
		columnHelper.accessor('resource', {
			header: 'Permission',
			filterType: FilterType.Select,
			faceted: true,
			cell: ({ row }) => (
				<PermissionCell
					resource={row.original.resource}
					action={row.original.action}
					resourceId={row.original.resourceId}
				/>
			),
			size: 180,
		}),

		// Result - Boolean filter
		columnHelper.accessor('allowed', {
			header: 'Result',
			filterType: FilterType.Boolean,
			cell: ({ row }) => <ResultCell allowed={row.original.allowed} />,
			size: 90,
		}),

		// Details
		columnHelper.accessor('reason', {
			header: 'Details',
			cell: ({ row }) => (
				<DetailsCell
					reason={row.original.reason}
					ipAddress={row.original.ipAddress ?? undefined}
				/>
			),
			size: 160,
		}),
	]

	// Bulk actions
	const bulkActions: BulkAction<PermissionAuditEntryDto>[] = [
		{
			id: 'export-csv',
			label: 'Export CSV',
			icon: <Download className="w-4 h-4" />,
			variant: BulkActionVariant.Default,
			onAction: async (rows: PermissionAuditEntryDto[]) => {
				const headers = 'Timestamp,User,Email,Resource,Action,Result,Reason,IP Address\n'
				const csv = rows.map(r =>
					`"${formatDate(r.timestamp)}","${r.userName ?? ''}","${r.userEmail ?? ''}","${r.resource ?? ''}","${r.action ?? ''}",${r.allowed ? 'Allowed' : 'Denied'},"${r.reason ?? ''}","${r.ipAddress ?? ''}"`
				).join('\n')
				const blob = new Blob([headers + csv], { type: 'text/csv' })
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `audit-log-export-${new Date().toISOString().split('T')[0]}.csv`
				a.click()
				URL.revokeObjectURL(url)
				notificationService.success(`Exported ${rows.length} audit log entries`)
			},
		},
	]

	if (!canView) {
		return null
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-3 sm:p-6 shadow-sm">
			{/* Header */}
			<div className="mb-4 sm:mb-6">
				<h3 className="text-base sm:text-lg font-semibold text-base-content">
					Permission Audit Log
				</h3>
				<p className="text-xs sm:text-sm text-base-content/60">
					Track all permission checks in the system
				</p>
			</div>

			{/* Data Grid */}
			<div className="overflow-x-auto -mx-3 sm:mx-0">
				<div className="min-w-[640px] px-3 sm:px-0">
					<RichDataGrid<PermissionAuditEntryDto>
						columns={columns}
						fetcher={fetcher}
						filterKey={String(refreshKey)}
						defaultPageSize={20}
						defaultSorting={[{ columnId: createColumnId('timestamp'), direction: SortDirection.Descending }]}
						enableGlobalSearch
						enableColumnFilters
						enableRowSelection
						enableColumnResizing
						bulkActions={bulkActions}
						searchPlaceholder="Search audit logs..."
						persistStateKey="rbac-audit-log-grid"
						emptyState={
							<div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
								<Search className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-base-content/20" />
								<p className="text-sm text-base-content/60">No audit log entries found</p>
							</div>
						}
						ariaLabel="Permission audit log table"
					/>
				</div>
			</div>
		</Card>
	)
}

export default AuditLogRichDataGrid
