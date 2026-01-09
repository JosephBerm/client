/**
 * useCustomerPermissions Hook
 *
 * Centralizes RBAC logic for customer detail page.
 * Follows single responsibility principle - only handles permissions.
 *
 * **Permissions:**
 * - SalesManager+: Can assign sales reps
 * - SalesRep+: Can view internal fields
 * - Customer: View own profile only (backend enforced)
 *
 * @see prd_customers.md - RBAC Requirements
 * @module customers/hooks
 */

'use client'

import { useMemo } from 'react'

import { useAuthStore } from '@_features/auth'

import { RoleLevels } from '@_shared'

/** Hook return type */
interface UseCustomerPermissionsReturn {
	/** Current user role */
	userRole: number
	/** Can assign/reassign sales rep to customer */
	canAssignSalesRep: boolean
	/** Can view internal fields (notes, status changes) */
	canViewInternalFields: boolean
	/** Can change customer status */
	canChangeStatus: boolean
	/** Can delete/archive customers */
	canDelete: boolean
	/** Is sales rep or above */
	isSalesRepOrAbove: boolean
	/** Is sales manager or above */
	isSalesManagerOrAbove: boolean
	/** Is admin */
	isAdmin: boolean
}

/**
 * Hook for customer-related RBAC checks.
 * Memoized for performance.
 */
export function useCustomerPermissions(): UseCustomerPermissionsReturn {
	const currentUser = useAuthStore((state) => state.user)

	return useMemo(() => {
		// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
		const userRole = currentUser?.roleLevel ?? RoleLevels.Customer

		const isSalesRepOrAbove = userRole >= RoleLevels.SalesRep
		const isSalesManagerOrAbove = userRole >= RoleLevels.SalesManager
		const isAdmin = userRole >= RoleLevels.Admin

		return {
			userRole,
			canAssignSalesRep: isSalesManagerOrAbove,
			canViewInternalFields: isSalesRepOrAbove,
			canChangeStatus: isSalesManagerOrAbove,
			canDelete: isAdmin,
			isSalesRepOrAbove,
			isSalesManagerOrAbove,
			isAdmin,
		}
	}, [currentUser?.roleLevel])
}

export default useCustomerPermissions
