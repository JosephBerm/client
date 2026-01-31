/**
 * useCustomerDetails Hook
 * 
 * Manages customer detail fetching with proper loading states and error handling.
 * Encapsulates all customer data fetching logic for separation of concerns.
 * 
 * **Features:**
 * - Fetches customer by ID
 * - Fetches linked accounts
 * - Fetches customer statistics
 * - Handles create mode (empty customer)
 * - Uses centralized logger for debugging
 * - Automatic navigation on invalid ID
 * 
 * **RBAC:**
 * - Backend enforces access control
 * - Hook handles API errors gracefully
 * 
 * @see prd_customers.md - Customer Management PRD
 * @module customers/hooks
 */

'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { CustomerStats } from '@_features/customers'

import { logger } from '@_core'

import { notificationService, API } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import Guid from '@_classes/Base/Guid'
import Company from '@_classes/Company'
import User from '@_classes/User'

/** Hook configuration options */
interface UseCustomerDetailsOptions {
	/** Customer ID from route params */
	customerId: string | null
	/** Whether we're in create mode */
	isCreateMode: boolean
}

/** Hook return type */
interface UseCustomerDetailsReturn {
	/** Customer entity */
	customer: Company
	/** Linked user accounts */
	accounts: User[]
	/** Customer statistics */
	stats: CustomerStats | null
	/** Loading states */
	loading: {
		customer: boolean
		accounts: boolean
		stats: boolean
	}
	/** Customer ID (GUID string, null if create mode) */
	customerIdStr: string | null
	/** Update customer state after form submission */
	setCustomer: (customer: Company) => void
	/** Refresh all data */
	refresh: () => void
}

/**
 * Hook for managing customer detail page data fetching.
 * Centralizes all data loading logic with proper error handling.
 */
export function useCustomerDetails({
	customerId,
	isCreateMode,
}: UseCustomerDetailsOptions): UseCustomerDetailsReturn {
	const router = useRouter()

	// State
	const [customer, setCustomer] = useState<Company>(new Company())
	const [accounts, setAccounts] = useState<User[]>([])
	const [stats, setStats] = useState<CustomerStats | null>(null)
	const [loadingCustomer, setLoadingCustomer] = useState(true)
	const [loadingAccounts, setLoadingAccounts] = useState(false)
	const [loadingStats, setLoadingStats] = useState(false)

	// Validate customer ID (GUID format)
	const customerIdStr = isCreateMode ? null : customerId

	// Fetch customer data
	const fetchCustomer = useCallback(async () => {
		if (!customerId) {
			router.back()
			return
		}

		if (isCreateMode) {
			setCustomer(new Company())
			setLoadingCustomer(false)
			return
		}

		try {
			setLoadingCustomer(true)

			// Validate GUID format
			if (!customerIdStr || !Guid.isValid(customerIdStr)) {
				logger.warn('Invalid customer ID format (must be valid GUID)', {
					component: 'useCustomerDetails',
					action: 'fetchCustomer',
					customerId,
				})
				notificationService.error('Invalid customer ID format')
				router.back()
				return
			}

			logger.debug('Fetching customer details', {
				component: 'useCustomerDetails',
				action: 'fetchCustomer',
				customerId: customerIdStr,
			})

			const { data } = await API.Customers.get(customerIdStr)

			if (!data.payload) {
				logger.warn('Customer not found', {
					component: 'useCustomerDetails',
					action: 'fetchCustomer',
					customerId: customerIdStr,
					message: data.message,
				})
				notificationService.error(data.message ?? 'Unable to load customer')
				router.back()
				return
			}

			const loadedCustomer = new Company(data.payload)
			setCustomer(loadedCustomer)
			
			logger.info('Customer loaded successfully', {
				component: 'useCustomerDetails',
				action: 'fetchCustomer',
				customerId: customerIdStr,
				customerName: loadedCustomer.name,
			})
		} catch (error) {
			logger.error('Failed to fetch customer', {
				component: 'useCustomerDetails',
				action: 'fetchCustomer',
				customerId: customerIdStr,
				error,
			})
			notificationService.error('Unable to load customer')
			router.back()
		} finally {
			setLoadingCustomer(false)
		}
	}, [customerId, customerIdStr, isCreateMode, router])

	// Fetch linked accounts
	const fetchAccounts = useCallback(async () => {
		if (!customerIdStr || isCreateMode) {
			return
		}

		try {
			setLoadingAccounts(true)

			const filter = new GenericSearchFilter()
			filter.add('CustomerId', customerIdStr)
			filter.includes.push('Customer')

			logger.debug('Fetching customer accounts', {
				component: 'useCustomerDetails',
				action: 'fetchAccounts',
				customerId: customerIdStr,
			})

			const { data } = await API.Accounts.search(filter)

			if (data.payload?.data) {
				setAccounts(data.payload.data.map((account: Partial<User>) => new User(account)))
			} else {
				setAccounts([])
			}
		} catch (error) {
			logger.error('Failed to fetch customer accounts', {
				component: 'useCustomerDetails',
				action: 'fetchAccounts',
				customerId: customerIdStr,
				error,
			})
			notificationService.error('Unable to load customer accounts')
			setAccounts([])
		} finally {
			setLoadingAccounts(false)
		}
	}, [customerIdStr, isCreateMode])

	// Fetch customer stats
	const fetchStats = useCallback(async () => {
		if (!customerIdStr || isCreateMode) {
			return
		}

		try {
			setLoadingStats(true)

			logger.debug('Fetching customer stats', {
				component: 'useCustomerDetails',
				action: 'fetchStats',
				customerId: customerIdStr,
			})

			const { data } = await API.Customers.getStats(customerIdStr)

			if (data.payload) {
				setStats({
					...data.payload,
					lastOrderDate: data.payload.lastOrderDate
						? new Date(data.payload.lastOrderDate)
						: null,
					createdAt: new Date(data.payload.createdAt),
				})
			}
		} catch (error) {
			// Stats are optional, log but don't show error to user
			logger.debug('Failed to fetch customer stats (non-critical)', {
				component: 'useCustomerDetails',
				action: 'fetchStats',
				customerId: customerIdStr,
				error,
			})
		} finally {
			setLoadingStats(false)
		}
	}, [customerIdStr, isCreateMode])

	// Refresh all data
	const refresh = useCallback(() => {
		void fetchCustomer()
		void fetchAccounts()
		void fetchStats()
	}, [fetchCustomer, fetchAccounts, fetchStats])

	// Initial fetch
	useEffect(() => {
		void fetchCustomer()
	}, [fetchCustomer])

	// Fetch accounts when customer loads
	useEffect(() => {
		void fetchAccounts()
	}, [fetchAccounts])

	// Fetch stats when customer loads
	useEffect(() => {
		void fetchStats()
	}, [fetchStats])

	return {
		customer,
		accounts,
		stats,
		loading: {
			customer: loadingCustomer,
			accounts: loadingAccounts,
			stats: loadingStats,
		},
		customerIdStr,
		setCustomer,
		refresh,
	}
}

export default useCustomerDetails

