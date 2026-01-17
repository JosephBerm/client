/**
 * AuditLogTable Component
 *
 * Wrapper component that provides the legacy API while using the modern AuditLogDataGrid.
 * Maintains backwards compatibility with existing consumers.
 *
 * **DRY Compliance:** Delegates to AuditLogDataGrid for actual implementation.
 *
 * @see prd_rbac_management.md - US-RBAC-005
 * @module app/rbac/_components/AuditLogTable
 */

'use client'

import { AuditLogDataGrid } from './AuditLogDataGrid'

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
// MAIN COMPONENT
// =========================================================================

/**
 * Audit Log Table
 *
 * Wrapper that delegates to AuditLogDataGrid for actual implementation.
 * Maintains backwards compatibility with existing consumers.
 */
export function AuditLogTable(props: AuditLogTableProps) {
	// Direct delegation to the DataGrid implementation
	return <AuditLogDataGrid {...props} />
}

export default AuditLogTable
