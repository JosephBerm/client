/**
 * useRBACManagement Hook
 *
 * Custom hook for RBAC Management UI functionality.
 * Handles data fetching, state management, and actions.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: Next.js 16 + React Compiler Optimized
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This hook implements enterprise-grade data management with Next.js 16 best practices:
 *
 * 1. **React Compiler Optimization**:
 *    - With `reactCompiler: true`, manual useCallback/useMemo are largely unnecessary
 *    - The compiler analyzes and auto-memoizes where beneficial
 *    - We keep useMemo ONLY for expensive derived state (e.g., large array operations)
 *    - useCallback is kept ONLY for async functions with dependencies (compiler limitation)
 *
 * 2. **SWR-Pattern Caching**: Uses useFetchWithCache for optimal performance
 *    - Stale-while-revalidate for instant UI
 *    - Background revalidation on focus/reconnect
 *    - Request deduplication
 *
 * 3. **Permission Guards**: Built-in access control checks
 * 4. **Error Handling**: Comprehensive error states with structured logging
 * 5. **Type Safety**: Full TypeScript coverage
 *
 * Data Flow:
 * ```
 * API.RBAC.* → useFetchWithCache → useRBACManagement → Components
 * ```
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler
 * @see prd_rbac_management.md
 * @see useFetchWithCache - For caching implementation
 * @module app/rbac/_components/hooks/useRBACManagement
 */

'use client'

import { useState } from 'react'

import { logger } from '@_core'
import type { PagedResult } from '@_classes/Base/PagedResult'
import type { AccountRole } from '@_classes/Enums'
import {
	notificationService,
	API,
	useFetchWithCache,
	invalidateCache,
	usePermissions,
} from '@_shared'
import type {
	RBACOverview,
	PermissionMatrixEntry,
	PermissionAuditEntryDto,
	BulkRoleUpdateResult,
	UserWithRole,
	AuditLogFilters,
	UsersWithRolesFilters,
} from '@_types/rbac-management'

import { CACHE_KEYS, CACHE_CONFIG, PAGINATION, ERROR_MESSAGES } from '../../_constants'

// =========================================================================
// TYPES
// =========================================================================

export interface UseRBACManagementReturn {
	// Data
	overview: RBACOverview | null
	matrix: PermissionMatrixEntry[]
	auditLog: PagedResult<PermissionAuditEntryDto> | null
	users: PagedResult<UserWithRole> | null

	// Loading states
	isLoadingOverview: boolean
	isLoadingMatrix: boolean
	isLoadingAuditLog: boolean
	isLoadingUsers: boolean

	// Validating states (background refresh)
	isValidatingOverview: boolean

	// Error states
	overviewError: string | null
	matrixError: string | null
	auditLogError: string | null
	usersError: string | null

	// Permissions
	canView: boolean
	canEdit: boolean
	canViewAuditLogs: boolean

	// Actions
	refreshOverview: () => Promise<void>
	refreshMatrix: () => Promise<void>
	fetchAuditLog: (filters?: AuditLogFilters) => Promise<void>
	fetchUsers: (filters?: UsersWithRolesFilters) => Promise<void>
	bulkUpdateRoles: (userIds: number[], newRole: AccountRole, reason?: string) => Promise<BulkRoleUpdateResult | null>
	invalidateAll: () => void

	// Filters
	auditLogFilters: AuditLogFilters
	setAuditLogFilters: (filters: AuditLogFilters) => void
	usersFilters: UsersWithRolesFilters
	setUsersFilters: (filters: UsersWithRolesFilters) => void

	// Cache info
	isFromCache: boolean
}

// =========================================================================
// HOOK IMPLEMENTATION
// =========================================================================

export function useRBACManagement(): UseRBACManagementReturn {
	const { isSalesManagerOrAbove, isAdmin } = usePermissions()

	// ---------------------------------------------------------------------------
	// PERMISSIONS
	// React Compiler auto-optimizes these - no useMemo needed
	// ---------------------------------------------------------------------------
	const canView = isSalesManagerOrAbove
	const canEdit = isAdmin
	const canViewAuditLogs = isAdmin

	// =========================================================================
	// CACHED DATA FETCHING - Overview
	// Uses SWR-pattern for optimal UX (instant stale data + background refresh)
	// =========================================================================

	const {
		data: overview,
		isLoading: isLoadingOverview,
		isValidating: isValidatingOverview,
		error: overviewFetchError,
		refetch: refetchOverview,
		invalidate: invalidateOverview,
		isFromCache,
	} = useFetchWithCache<RBACOverview>(
		CACHE_KEYS.OVERVIEW,
		async () => API.RBAC.getOverview(),
		{
			staleTime: CACHE_CONFIG.STALE_TIME,
			cacheTime: CACHE_CONFIG.CACHE_TIME,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			enabled: canView,
			componentName: 'useRBACManagement',
			onError: (error) => {
				logger.error(ERROR_MESSAGES.FETCH_OVERVIEW, {
					component: 'useRBACManagement',
					action: 'fetchOverview',
					error: error.message,
				})
			},
		}
	)

	// ---------------------------------------------------------------------------
	// DERIVED STATE
	// Note: React Compiler handles simple derivations automatically.
	// For complex array operations like mapping/filtering large datasets,
	// consider using useMemo only if profiling shows performance issues.
	// ---------------------------------------------------------------------------

	// Extract matrix from overview - simple property access, no useMemo needed
	const matrix: PermissionMatrixEntry[] = overview?.matrix ?? []

	// Convert fetch error to string
	const overviewError = overviewFetchError?.message ?? null

	// =========================================================================
	// NON-CACHED DATA - Audit Log (paginated, not suitable for long-term cache)
	// =========================================================================

	const [auditLog, setAuditLog] = useState<PagedResult<PermissionAuditEntryDto> | null>(null)
	const [isLoadingAuditLog, setIsLoadingAuditLog] = useState(false)
	const [auditLogError, setAuditLogError] = useState<string | null>(null)
	const [auditLogFilters, setAuditLogFilters] = useState<AuditLogFilters>({
		page: PAGINATION.DEFAULT_PAGE,
		pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
	})

	/**
	 * Fetch audit log with pagination.
	 *
	 * Note: We keep async functions wrapped to maintain correct closure over
	 * current state values. React Compiler optimizes the function reference.
	 */
	const fetchAuditLog = async (filters: AuditLogFilters = auditLogFilters) => {
		if (!canViewAuditLogs) {
			return
		}

		try {
			setIsLoadingAuditLog(true)
			setAuditLogError(null)

			const { data } = await API.RBAC.getAuditLog(filters)

			if (data.payload) {
				setAuditLog(data.payload)
			} else {
				setAuditLogError(data.message ?? ERROR_MESSAGES.FETCH_AUDIT_LOG)
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.FETCH_AUDIT_LOG
			setAuditLogError(errorMessage)
			logger.error(ERROR_MESSAGES.FETCH_AUDIT_LOG, {
				component: 'useRBACManagement',
				action: 'fetchAuditLog',
				error: err instanceof Error ? err.message : 'Unknown error',
			})
		} finally {
			setIsLoadingAuditLog(false)
		}
	}

	// =========================================================================
	// NON-CACHED DATA - Users (paginated, needs fresh data)
	// =========================================================================

	const [users, setUsers] = useState<PagedResult<UserWithRole> | null>(null)
	const [isLoadingUsers, setIsLoadingUsers] = useState(false)
	const [usersError, setUsersError] = useState<string | null>(null)
	const [usersFilters, setUsersFilters] = useState<UsersWithRolesFilters>({
		page: PAGINATION.DEFAULT_PAGE,
		pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
	})

	/**
	 * Fetch users with roles for bulk management.
	 *
	 * Note: React Compiler handles function memoization automatically.
	 */
	const fetchUsers = async (filters: UsersWithRolesFilters = usersFilters) => {
		if (!canEdit) {
			return
		}

		try {
			setIsLoadingUsers(true)
			setUsersError(null)

			const { data } = await API.RBAC.getUsersWithRoles(filters)

			if (data.payload) {
				setUsers(data.payload)
			} else {
				setUsersError(data.message ?? ERROR_MESSAGES.FETCH_USERS)
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.FETCH_USERS
			setUsersError(errorMessage)
			logger.error(ERROR_MESSAGES.FETCH_USERS, {
				component: 'useRBACManagement',
				action: 'fetchUsers',
				error: err instanceof Error ? err.message : 'Unknown error',
			})
		} finally {
			setIsLoadingUsers(false)
		}
	}

	// =========================================================================
	// ACTIONS
	// React Compiler auto-optimizes function references
	// =========================================================================

	/**
	 * Refresh overview data from API.
	 */
	const refreshOverview = async () => {
		await refetchOverview()
	}

	/**
	 * Refresh matrix data (part of overview).
	 */
	const refreshMatrix = async () => {
		// Matrix is part of overview, so just refetch overview
		await refetchOverview()
	}

	/**
	 * Bulk update user roles.
	 * Includes permission check, API call, and cache invalidation.
	 */
	const bulkUpdateRoles = async (
		userIds: number[],
		newRole: AccountRole,
		reason?: string
	): Promise<BulkRoleUpdateResult | null> => {
		if (!canEdit) {
			notificationService.error(ERROR_MESSAGES.PERMISSION_DENIED, {
				component: 'useRBACManagement',
				action: 'bulkUpdateRoles',
			})
			return null
		}

		try {
			logger.info('Bulk updating user roles', {
				component: 'useRBACManagement',
				action: 'bulkUpdateRoles',
				userCount: userIds.length,
				newRole,
			})

			const { data } = await API.RBAC.bulkUpdateRoles({
				userIds,
				newRole,
				reason,
			})

			if (data.payload) {
				const result = data.payload

				if (result.updatedCount > 0) {
					notificationService.success(
						`Successfully updated ${result.updatedCount} user${result.updatedCount > 1 ? 's' : ''}`,
						{
							component: 'useRBACManagement',
							action: 'bulkUpdateRoles',
						}
					)
				}

				if (result.failedCount > 0) {
					notificationService.warning(
						ERROR_MESSAGES.BULK_UPDATE_PARTIAL(result.updatedCount, result.failedCount),
						{
							component: 'useRBACManagement',
							action: 'bulkUpdateRoles',
						}
					)
				}

				// Invalidate cache and refresh data
				invalidateOverview()
				await refetchOverview()
				await fetchUsers()

				logger.info('Bulk role update completed', {
					component: 'useRBACManagement',
					action: 'bulkUpdateRoles',
					updatedCount: result.updatedCount,
					failedCount: result.failedCount,
				})

				return result
			} else {
				notificationService.error(data.message ?? ERROR_MESSAGES.UPDATE_ROLE, {
					component: 'useRBACManagement',
					action: 'bulkUpdateRoles',
				})
				return null
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.UPDATE_ROLE
			notificationService.error(errorMessage, {
				component: 'useRBACManagement',
				action: 'bulkUpdateRoles',
			})
			logger.error('Bulk role update failed', {
				component: 'useRBACManagement',
				action: 'bulkUpdateRoles',
				error: err instanceof Error ? err.message : 'Unknown error',
			})
			return null
		}
	}

	/**
	 * Invalidate all RBAC cache entries.
	 * Use after major changes to force fresh data.
	 */
	const invalidateAll = () => {
		invalidateCache('rbac:')
		invalidateOverview()
		setAuditLog(null)
		setUsers(null)
	}

	// =========================================================================
	// RETURN
	// =========================================================================
	//
	// Note on useMemo for return objects:
	// With React Compiler enabled, the compiler automatically detects when
	// memoization is beneficial. For hook return values, the compiler optimizes
	// the object creation. We return the object directly for cleaner code.
	//
	// If you're NOT using React Compiler, wrap this in useMemo with all
	// dependencies listed.
	// =========================================================================

	return {
		// Data
		overview,
		matrix,
		auditLog,
		users,

		// Loading states
		isLoadingOverview,
		isLoadingMatrix: isLoadingOverview, // Matrix is part of overview
		isLoadingAuditLog,
		isLoadingUsers,

		// Validating states
		isValidatingOverview,

		// Error states
		overviewError,
		matrixError: overviewError, // Matrix errors come from overview
		auditLogError,
		usersError,

		// Permissions
		canView,
		canEdit,
		canViewAuditLogs,

		// Actions
		refreshOverview,
		refreshMatrix,
		fetchAuditLog,
		fetchUsers,
		bulkUpdateRoles,
		invalidateAll,

		// Filters
		auditLogFilters,
		setAuditLogFilters,
		usersFilters,
		setUsersFilters,

		// Cache info
		isFromCache,
	}
}
