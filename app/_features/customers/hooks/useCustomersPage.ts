/**
 * useCustomersPage Hook
 * 
 * Encapsulates all business logic for the Customers list page.
 * Manages state, RBAC checks, and CRUD operations.
 * 
 * **React 19 Optimizations:**
 * - No useCallback for stable functions (React 19 auto-memoizes)
 * - useMemo only for expensive computations
 * 
 * @module customers/hooks
 */

'use client'

import { useState } from 'react'

import { useAuthStore } from '@_features/auth'

import { notificationService, API } from '@_shared'

import { logger } from '@/app/_core'

import { AccountRole } from '@_classes/Enums'
import type Company from '@_classes/Company'

import { useAggregateStats } from './useAggregateStats'

import type { CustomerStatusKey } from '../types'

interface DeleteModalState {
	isOpen: boolean
	customer: Company | null
}

interface UseCustomersPageReturn {
	// State
	deleteModal: DeleteModalState
	refreshKey: number
	showArchived: boolean
	isDeleting: boolean
	isArchiving: boolean
	statusFilter: CustomerStatusKey | 'all'

	// Stats
	stats: ReturnType<typeof useAggregateStats>['stats']
	statsLoading: boolean

	// RBAC
	isAdmin: boolean
	canDelete: boolean
	canViewArchived: boolean

	// Actions
	openDeleteModal: (customer: Company) => void
	closeDeleteModal: () => void
	handleDelete: () => void
	handleArchive: () => void
	toggleShowArchived: () => void
	setStatusFilter: (filter: CustomerStatusKey | 'all') => void
	refreshData: () => void
}

/**
 * Hook encapsulating all Customers page business logic.
 * 
 * @example
 * ```tsx
 * const {
 *   deleteModal,
 *   stats,
 *   isAdmin,
 *   handleDelete,
 *   handleArchive,
 * } = useCustomersPage()
 * ```
 */
export function useCustomersPage(): UseCustomersPageReturn {
	// Auth state for RBAC
	const user = useAuthStore((state) => state.user)
	
	// Modal state
	const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
		isOpen: false,
		customer: null,
	})
	
	// Page state
	const [refreshKey, setRefreshKey] = useState(0)
	const [showArchived, setShowArchived] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isArchiving, setIsArchiving] = useState(false)
	const [statusFilter, setStatusFilterState] = useState<CustomerStatusKey | 'all'>('Active')
	
	// Fetch aggregate stats
	const { stats, isLoading: statsLoading, refetch: refetchStats } = useAggregateStats({
		enabled: true,
	})
	
	// RBAC checks - simple comparisons, no memoization needed
	// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
	const userRole = user?.roleLevel ?? AccountRole.Customer
	// Use >= for admin check to include SuperAdmin (9999) and Admin (5000)
	const isAdmin = userRole >= AccountRole.Admin
	const canDelete = isAdmin // Only admins can delete
	const canViewArchived = isAdmin // Only admins can view archived
	
	// Actions - React 19: No useCallback needed for these
	const openDeleteModal = (customer: Company) => {
		setDeleteModal({ isOpen: true, customer })
	}
	
	const closeDeleteModal = () => {
		if (!isDeleting && !isArchiving) {
			setDeleteModal({ isOpen: false, customer: null })
		}
	}
	
	const refreshData = () => {
		setRefreshKey((prev) => prev + 1)
		void refetchStats()
	}
	
	const toggleShowArchived = () => {
		setShowArchived((prev) => !prev)
		// Refresh data to fetch archived/non-archived
		setRefreshKey((prev) => prev + 1)
	}

	/**
	 * Set the status filter for stat card filtering.
	 * Triggers a data refresh to apply the new filter.
	 */
	const setStatusFilter = (filter: CustomerStatusKey | 'all') => {
		setStatusFilterState(filter)
		// Refresh handled by filterKey dependency in page
	}
	
	/**
	 * Archive a customer (soft delete).
	 * Sets isArchived = true, preserves all data.
	 */
	const handleArchive = async () => {
		if (!deleteModal.customer) {
			return
		}
		
		setIsArchiving(true)
		
		try {
			// Update customer with isArchived = true
			const customerToArchive = {
				...deleteModal.customer,
				isArchived: true,
			}
			
			const { data } = await API.Customers.update(customerToArchive)
			
			if (data.statusCode !== 200) {
				notificationService.error(data.message ?? 'Failed to archive customer', {
					metadata: { customerId: deleteModal.customer.id },
					component: 'CustomersPage',
					action: 'archiveCustomer',
				})
				return
			}
			
			notificationService.success('Customer archived successfully', {
				metadata: { customerId: deleteModal.customer.id },
				component: 'CustomersPage',
				action: 'archiveCustomer',
			})
			
			closeDeleteModal()
			refreshData()
		} catch (error) {
			notificationService.error('An error occurred while archiving the customer', {
				metadata: { error, customerId: deleteModal.customer?.id },
				component: 'CustomersPage',
				action: 'archiveCustomer',
			})
			logger.error('Archive customer error', { error })
		} finally {
			setIsArchiving(false)
		}
	}
	
	/**
	 * Permanently delete a customer.
	 * Only admins can perform this action.
	 */
	const handleDelete = async () => {
		if (!deleteModal.customer || !canDelete) {
			return
		}
		
		setIsDeleting(true)
		
		try {
			const { data } = await API.Customers.delete(deleteModal.customer.id)
			
			if (data.statusCode !== 200) {
				// Check for specific error messages
				const errorMessage = data.message ?? 'Failed to delete customer'
				
				// Provide better error messaging for common cases
				if (data.message?.includes('related_data') || data.message?.includes('has_related')) {
					notificationService.error(
						'Cannot delete customer with existing orders, quotes, or accounts. Archive instead.',
						{
							metadata: { customerId: deleteModal.customer.id },
							component: 'CustomersPage',
							action: 'deleteCustomer',
						}
					)
				} else {
					notificationService.error(errorMessage, {
						metadata: { customerId: deleteModal.customer.id },
						component: 'CustomersPage',
						action: 'deleteCustomer',
					})
				}
				return
			}
			
			notificationService.success(data.message ?? 'Customer deleted successfully', {
				metadata: { customerId: deleteModal.customer.id },
				component: 'CustomersPage',
				action: 'deleteCustomer',
			})
			
			closeDeleteModal()
			refreshData()
		} catch (error) {
			notificationService.error('An error occurred while deleting the customer', {
				metadata: { error, customerId: deleteModal.customer?.id },
				component: 'CustomersPage',
				action: 'deleteCustomer',
			})
			logger.error('Delete customer error', { error })
		} finally {
			setIsDeleting(false)
		}
	}
	
	return {
		// State
		deleteModal,
		refreshKey,
		showArchived,
		isDeleting,
		isArchiving,
		statusFilter,

		// Stats
		stats,
		statsLoading,

		// RBAC
		isAdmin,
		canDelete,
		canViewArchived,

		// Actions
		openDeleteModal,
		closeDeleteModal,
		handleDelete: () => void handleDelete(),
		handleArchive: () => void handleArchive(),
		toggleShowArchived,
		setStatusFilter,
		refreshData,
	}
}

export default useCustomersPage

