/**
 * AuditLogTable Component
 *
 * Table displaying permission audit log entries.
 * Shows who accessed what when and whether it was allowed.
 *
 * @see prd_rbac_management.md - US-RBAC-005
 * @module app/rbac/_components/AuditLogTable
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
	Check,
	X,
	Calendar,
	Filter,
	ChevronLeft,
	ChevronRight,
	User,
	Globe,
	Clock,
	Search,
	RefreshCw,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

import Card from '@_components/ui/Card'
import Button from '@_components/ui/Button'

import type { PermissionAuditEntryDto, AuditLogFilters } from '@_types/rbac-management'
import type { PagedResult } from '@_classes/Base/PagedResult'

// =========================================================================
// TYPES
// =========================================================================

interface AuditLogTableProps {
	data: PagedResult<PermissionAuditEntryDto> | null
	isLoading: boolean
	error: string | null
	filters: AuditLogFilters
	onFiltersChange: (filters: AuditLogFilters) => void
	onRefresh: () => void
}

// =========================================================================
// COMPONENT
// =========================================================================

export function AuditLogTable({
	data,
	isLoading,
	error,
	filters,
	onFiltersChange,
	onRefresh,
}: AuditLogTableProps) {
	const [showFilters, setShowFilters] = useState(false)

	// Local filter state for input fields
	const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters)

	const handleApplyFilters = () => {
		onFiltersChange(localFilters)
	}

	const handleClearFilters = () => {
		const clearedFilters: AuditLogFilters = { page: 1, pageSize: filters.pageSize }
		setLocalFilters(clearedFilters)
		onFiltersChange(clearedFilters)
	}

	const handlePageChange = (newPage: number) => {
		onFiltersChange({ ...filters, page: newPage })
	}

	const formatDate = (dateString: string) => {
		try {
			return format(parseISO(dateString), 'MMM d, yyyy h:mm:ss a')
		} catch {
			return dateString
		}
	}

	// Calculate pagination info
	const totalPages = data?.totalPages || data?.pageCount || 1
	const currentPage = data?.page || 1
	const hasNext = data?.hasNext ?? currentPage < totalPages
	const hasPrevious = data?.hasPrevious ?? currentPage > 1

	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-base-content">Permission Audit Log</h3>
					<p className="text-sm text-base-content/60">
						Track all permission checks in the system
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowFilters(!showFilters)}
						className="gap-2"
					>
						<Filter className="h-4 w-4" />
						Filters
					</Button>
					<Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
						<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					</Button>
				</div>
			</div>

			{/* Filters panel */}
			{showFilters && (
				<motion.div
					initial={{ height: 0, opacity: 0 }}
					animate={{ height: 'auto', opacity: 1 }}
					exit={{ height: 0, opacity: 0 }}
					className="mb-6 overflow-hidden rounded-lg border border-base-300 bg-base-200/30 p-4"
				>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{/* Date range */}
						<div>
							<label className="mb-1 block text-xs font-medium text-base-content/60">
								Start Date
							</label>
							<input
								type="date"
								value={localFilters.startDate?.split('T')[0] || ''}
								onChange={(e) =>
									setLocalFilters({
										...localFilters,
										startDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
									})
								}
								className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm"
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
									setLocalFilters({
										...localFilters,
										endDate: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
									})
								}
								className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm"
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
									setLocalFilters({
										...localFilters,
										userId: e.target.value ? parseInt(e.target.value) : undefined,
									})
								}
								className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm"
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
									setLocalFilters({
										...localFilters,
										resource: e.target.value || undefined,
									})
								}
								className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm"
							/>
						</div>
					</div>

					<div className="mt-4 flex justify-end gap-2">
						<Button variant="ghost" size="sm" onClick={handleClearFilters}>
							Clear
						</Button>
						<Button variant="primary" size="sm" onClick={handleApplyFilters}>
							Apply Filters
						</Button>
					</div>
				</motion.div>
			)}

			{/* Error state */}
			{error && (
				<div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
					{error}
				</div>
			)}

			{/* Loading state */}
			{isLoading && !data && (
				<div className="flex items-center justify-center py-12">
					<RefreshCw className="h-8 w-8 animate-spin text-primary" />
				</div>
			)}

			{/* Table */}
			{data && (
				<>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[900px] border-collapse">
							<thead>
								<tr className="border-b border-base-300">
									<th className="p-3 text-left text-sm font-semibold text-base-content">
										Timestamp
									</th>
									<th className="p-3 text-left text-sm font-semibold text-base-content">
										User
									</th>
									<th className="p-3 text-left text-sm font-semibold text-base-content">
										Permission
									</th>
									<th className="p-3 text-center text-sm font-semibold text-base-content">
										Result
									</th>
									<th className="p-3 text-left text-sm font-semibold text-base-content">
										Details
									</th>
								</tr>
							</thead>
							<tbody>
								{data.data?.map((entry, index) => (
									<motion.tr
										key={entry.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.02 }}
										className="border-b border-base-200 hover:bg-base-200/30"
									>
										{/* Timestamp */}
										<td className="p-3">
											<div className="flex items-center gap-2 text-sm text-base-content/70">
												<Clock className="h-4 w-4 text-base-content/40" />
												{formatDate(entry.timestamp)}
											</div>
										</td>

										{/* User */}
										<td className="p-3">
											<div className="flex flex-col">
												<span className="flex items-center gap-2 text-sm font-medium text-base-content">
													<User className="h-4 w-4 text-base-content/40" />
													{entry.userName || `User #${entry.userId}`}
												</span>
												{entry.userEmail && (
													<span className="ml-6 text-xs text-base-content/50">
														{entry.userEmail}
													</span>
												)}
											</div>
										</td>

										{/* Permission */}
										<td className="p-3">
											<span className="rounded-md bg-base-200 px-2 py-1 font-mono text-sm text-base-content">
												{entry.resource}:{entry.action}
											</span>
											{entry.resourceId && (
												<span className="ml-2 text-xs text-base-content/50">
													(ID: {entry.resourceId})
												</span>
											)}
										</td>

										{/* Result */}
										<td className="p-3 text-center">
											{entry.allowed ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
													<Check className="h-3 w-3" />
													Allowed
												</span>
											) : (
												<span className="inline-flex items-center gap-1 rounded-full bg-error/20 px-3 py-1 text-xs font-medium text-error">
													<X className="h-3 w-3" />
													Denied
												</span>
											)}
										</td>

										{/* Details */}
										<td className="p-3">
											<div className="flex flex-col gap-1">
												{entry.reason && (
													<span className="text-xs text-base-content/60">
														{entry.reason}
													</span>
												)}
												{entry.ipAddress && (
													<span className="flex items-center gap-1 text-xs text-base-content/40">
														<Globe className="h-3 w-3" />
														{entry.ipAddress}
													</span>
												)}
											</div>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Empty state */}
					{data.data?.length === 0 && (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Search className="mb-4 h-12 w-12 text-base-content/20" />
							<p className="text-base-content/60">No audit log entries found</p>
							{(filters.startDate || filters.endDate || filters.userId || filters.resource) && (
								<button
									onClick={handleClearFilters}
									className="mt-2 text-sm text-primary hover:underline"
								>
									Clear filters
								</button>
							)}
						</div>
					)}

					{/* Pagination */}
					{(data.data?.length ?? 0) > 0 && (
						<div className="mt-6 flex items-center justify-between border-t border-base-200 pt-4">
							<p className="text-sm text-base-content/60">
								Showing {((currentPage - 1) * (filters.pageSize || 20)) + 1} -{' '}
								{Math.min(currentPage * (filters.pageSize || 20), data.total || 0)} of{' '}
								{data.total || 0} entries
							</p>

							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={!hasPrevious || isLoading}
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<span className="text-sm text-base-content/60">
									Page {currentPage} of {totalPages}
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={!hasNext || isLoading}
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</Card>
	)
}

export default AuditLogTable

