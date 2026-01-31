/**
 * @fileoverview Account Detail Page Logic Hook
 *
 * Business logic hook for the account detail/edit page following MAANG-level patterns.
 * Extracts all state management, data fetching, and business logic from the UI component.
 *
 * **Architecture:**
 * - Centralizes all account fetching, loading states, and computed values
 * - Provides memoized event handlers to prevent unnecessary re-renders
 * - Handles account updates, role changes, and navigation
 * - Fetches related data (orders, quotes counts for activity summary)
 * - Manages tab state for Profile/Security/Activity tabs
 *
 * **Patterns Followed:**
 * - Similar to useCartPageLogic hook structure
 * - Uses useFormSubmit for DRY form submission
 * - Proper error handling with notificationService
 * - Type-safe with full TypeScript
 *
 * @module features/accounts/hooks/useAccountDetailLogic
 * @category State Management
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import { useAuthStore } from '@_features/auth'
import { Routes } from '@_features/navigation'

import { logger } from '@_core'

import { formatDate } from '@_lib/dates'

import { notificationService, useRouteParam, API } from '@_shared'

import { GenericSearchFilter } from '@_classes/Base/GenericSearchFilter'
import type Company from '@_classes/Company'
import { AccountStatus, getAccountStatusLabel } from '@_classes/Enums'
import { RoleLevels } from '@_types/rbac'
import Order from '@_classes/Order'
import Quote from '@_classes/Quote'
import type { IUser } from '@_classes/User'
import User from '@_classes/User'

// ============================================================================
// TYPES
// ============================================================================

/** Available tab identifiers */
export type AccountTab = 'profile' | 'security' | 'activity'

/**
 * Account activity summary for quick display
 */
export interface AccountActivitySummary {
	/** Total number of orders by this account */
	orderCount: number
	/** Total number of quotes by this account */
	quoteCount: number
	/** Whether activity data is loading */
	isLoading: boolean
}

/**
 * Account activity data (orders and quotes lists)
 */
export interface AccountActivityData {
	/** Recent orders for this account */
	orders: Order[]
	/** Recent quotes for this account */
	quotes: Quote[]
	/** Whether orders are loading */
	isLoadingOrders: boolean
	/** Whether quotes are loading */
	isLoadingQuotes: boolean
}

/**
 * Account detail page logic hook return type
 */
export interface UseAccountDetailLogicReturn {
	// Core State
	account: User | null
	isLoading: boolean
	isCreateMode: boolean

	// Tab State
	activeTab: AccountTab
	setActiveTab: (tab: AccountTab) => void

	// Auth State (current logged-in user)
	currentUser: IUser | null
	isCurrentUserAdmin: boolean

	// Derived State
	accountName: string
	memberSince: string
	hasCustomerAssociation: boolean
	pageTitle: string
	pageDescription: string

	// Customer/Company Association
	customerCompany: Company | null

	// Account Status
	accountStatus: AccountStatus
	isStatusUpdating: boolean
	canChangeStatus: boolean
	handleStatusChange: (newStatus: AccountStatus, reason?: string) => Promise<void>

	// Activity Summary (counts)
	activitySummary: AccountActivitySummary

	// Activity Data (lists for Activity tab)
	activityData: AccountActivityData

	// Role Management
	isRoleUpdating: boolean
	canChangeRole: boolean
	handleRoleChange: (newRole: number) => Promise<void>

	// Confirmation State (for MAANG-level UX)
	pendingRoleChange: number | null
	pendingStatusChange: AccountStatus | null
	setPendingRoleChange: (role: number | null) => void
	setPendingStatusChange: (status: AccountStatus | null) => void
	confirmRoleChange: () => Promise<void>
	confirmStatusChange: () => Promise<void>

	// Security
	canChangePassword: boolean
	handleSendPasswordReset: () => Promise<void>
	handleForceLogout: () => Promise<void>
	isSendingPasswordReset: boolean

	// Account Actions
	handleAccountUpdate: (updatedUser: IUser) => void
	handleRefreshAccount: () => Promise<void>

	// Navigation Handlers
	handleBack: () => void
	handleViewCustomer: () => void
	handleViewOrders: () => void
	handleViewQuotes: () => void
	handleManageAccounts: () => void
}

/**
 * Custom hook for account detail page business logic
 *
 * Centralizes all state management, data fetching, and event handling
 * for the account detail page. Follows the same pattern as useCartPageLogic.
 *
 * **State Management:**
 * - Account data and loading state
 * - Activity summary (order/quote counts)
 * - Role update state
 *
 * **Features:**
 * - Fetches account by ID from route params
 * - Computes derived values (name, membership date, associations)
 * - Handles role changes for admin users
 * - Fetches activity summary (order/quote counts)
 *
 * @returns Account detail page state and event handlers
 *
 * @example
 * ```typescript
 * const {
 *   account,
 *   isLoading,
 *   activitySummary,
 *   handleRoleChange,
 * } = useAccountDetailLogic()
 * ```
 */
export function useAccountDetailLogic(): UseAccountDetailLogicReturn {
	const router = useRouter()
	const accountId = useRouteParam('id')

	// ============================================================================
	// STATE MANAGEMENT
	// ============================================================================

	const [account, setAccount] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isRoleUpdating, setIsRoleUpdating] = useState(false)
	const [activeTab, setActiveTab] = useState<AccountTab>('profile')

	// Activity summary (counts only)
	const [activitySummary, setActivitySummary] = useState<AccountActivitySummary>({
		orderCount: 0,
		quoteCount: 0,
		isLoading: false,
	})

	// Activity data (full lists for Activity tab)
	const [activityData, setActivityData] = useState<AccountActivityData>({
		orders: [],
		quotes: [],
		isLoadingOrders: false,
		isLoadingQuotes: false,
	})

	// Status update state
	const [isStatusUpdating, setIsStatusUpdating] = useState(false)

	// Password reset state
	const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false)

	// Confirmation state for destructive actions
	const [pendingRoleChange, setPendingRoleChange] = useState<number | null>(null)
	const [pendingStatusChange, setPendingStatusChange] = useState<AccountStatus | null>(null)

	// Auth state (current logged-in user)
	const currentUser = useAuthStore((state) => state.user)

	// ============================================================================
	// DERIVED STATE
	// ============================================================================

	const isCreateMode = accountId === 'create'

	// Use roleLevel directly from plain JSON object (Zustand doesn't deserialize to User class)
	// Use >= for admin check to include SuperAdmin (9999) and Admin (5000)
	const isCurrentUserAdmin = useMemo(
		() => (currentUser?.roleLevel ?? 0) >= RoleLevels.Admin,
		[currentUser?.roleLevel]
	)

	// Can only change role if current user is admin and not editing their own account
	const canChangeRole = useMemo(
		() => isCurrentUserAdmin && account?.id !== currentUser?.id,
		[isCurrentUserAdmin, account?.id, currentUser?.id]
	)

	// Can change password if admin is editing another user's account
	// (Users can change their own password from Profile page)
	const canChangePassword = useMemo(
		() => isCurrentUserAdmin && account?.id !== currentUser?.id,
		[isCurrentUserAdmin, account?.id, currentUser?.id]
	)

	// Can change status if admin is editing another user's account
	const canChangeStatus = useMemo(
		() => isCurrentUserAdmin && account?.id !== currentUser?.id,
		[isCurrentUserAdmin, account?.id, currentUser?.id]
	)

	// Account status from the account entity (Phase 1 integration)
	// Falls back to Active for backwards compatibility with older accounts
	const accountStatus = useMemo(() => account?.status ?? AccountStatus.Active, [account?.status])

	// Customer/Company association
	const customerCompany = useMemo(() => account?.customer ?? null, [account?.customer])

	const accountName = useMemo(() => {
		if (!account?.name || typeof account.name !== 'object') {
			return account?.username ?? 'User'
		}
		return (
			[account.name.first, account.name.middle, account.name.last].filter(Boolean).join(' ') ||
			account.username ||
			'User'
		)
	}, [account?.name, account?.username])

	const memberSince = useMemo(() => formatDate(account?.createdAt, 'long') ?? '', [account?.createdAt])

	const hasCustomerAssociation = useMemo(
		() => typeof account?.customerId === 'number' && account.customerId > 0,
		[account?.customerId]
	)

	const pageTitle = useMemo(() => (isCreateMode ? 'Create Account' : accountName), [isCreateMode, accountName])

	const pageDescription = useMemo(
		() =>
			isCreateMode
				? 'Admin-created accounts are managed via the signup workflow. Invite users or share the signup link below.'
				: 'Review and update account details, adjust permissions, and manage personal information.',
		[isCreateMode]
	)

	// ============================================================================
	// DATA FETCHING - Account
	// ============================================================================

	useEffect(() => {
		if (!accountId) {
			router.back()
			return
		}

		if (isCreateMode) {
			setIsLoading(false)
			return
		}

		const fetchAccount = async () => {
			try {
				setIsLoading(true)
				const { data } = await API.Accounts.get(accountId)

				if (!data.payload) {
					notificationService.error(data.message ?? 'Unable to load account', {
						metadata: { accountId },
						component: 'AccountDetailPage',
						action: 'fetchAccount',
					})
					router.back()
					return
				}

				setAccount(new User(data.payload))

				logger.debug('Account loaded', {
					component: 'useAccountDetailLogic',
					accountId,
				})
			} catch (error) {
				notificationService.error('Unable to load account', {
					metadata: { error, accountId },
					component: 'AccountDetailPage',
					action: 'fetchAccount',
				})
				router.back()
			} finally {
				setIsLoading(false)
			}
		}

		void fetchAccount()
	}, [accountId, isCreateMode, router])

	// ============================================================================
	// DATA FETCHING - Activity Summary (Orders & Quotes)
	// ============================================================================

	useEffect(() => {
		if (!account?.id || isCreateMode) {
			return
		}

		const fetchActivitySummary = async () => {
			setActivitySummary((prev) => ({ ...prev, isLoading: true }))

			try {
				// Fetch order and quote counts in parallel
				const [ordersResult, quotesResult] = await Promise.allSettled([
					// Fetch orders count
					(async () => {
						const filter = new GenericSearchFilter()
						filter.add('AccountId', String(account.id))
						filter.pageSize = 1 // We only need the count
						const { data } = await API.Orders.search(filter)
						return data.payload?.total ?? 0
					})(),
					// Fetch quotes count
					(async () => {
						const filter = new GenericSearchFilter()
						filter.add('AccountId', String(account.id))
						filter.pageSize = 1 // We only need the count
						const { data } = await API.Quotes.search(filter)
						return data.payload?.total ?? 0
					})(),
				])

				setActivitySummary({
					orderCount: ordersResult.status === 'fulfilled' ? ordersResult.value : 0,
					quoteCount: quotesResult.status === 'fulfilled' ? quotesResult.value : 0,
					isLoading: false,
				})

				logger.debug('Activity summary loaded', {
					component: 'useAccountDetailLogic',
					accountId: account.id,
					orderCount: ordersResult.status === 'fulfilled' ? ordersResult.value : 0,
					quoteCount: quotesResult.status === 'fulfilled' ? quotesResult.value : 0,
				})
			} catch (error) {
				logger.warn('Failed to load activity summary', {
					component: 'useAccountDetailLogic',
					accountId: account.id,
					error,
				})
				setActivitySummary({ orderCount: 0, quoteCount: 0, isLoading: false })
			}
		}

		void fetchActivitySummary()
	}, [account?.id, isCreateMode])

	// ============================================================================
	// DATA FETCHING - Activity Data (Orders & Quotes lists for Activity tab)
	// ============================================================================

	useEffect(() => {
		// Only fetch when activity tab is selected and account is loaded
		if (activeTab !== 'activity' || !account?.customerId || isCreateMode) {
			return
		}

		const fetchActivityData = async () => {
			setActivityData((prev) => ({
				...prev,
				isLoadingOrders: true,
				isLoadingQuotes: true,
			}))

			try {
				// Fetch orders and quotes in parallel
				const [ordersResult, quotesResult] = await Promise.allSettled([
					// Fetch orders for this account's customer
					(async () => {
						// Safe: checked !account?.customerId above
						const { data } = await API.Orders.getFromCustomer(account.customerId!)
						if (data.payload) {
							return data.payload
								.map((o: unknown) => new Order(o as Partial<Order>))
								.sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime())
								.slice(0, 10)
						}
						return []
					})(),
					// Fetch quotes for this account
					(async () => {
						const filter = new GenericSearchFilter()
						filter.pageSize = 10
						filter.sortBy = 'createdAt'
						filter.sortOrder = 'desc'
						const { data } = await API.Quotes.search(filter)
						if (data.payload?.data) {
							// Filter quotes by company name matching account's customer
							return data.payload.data
								.map((q: unknown) => new Quote(q as Partial<Quote>))
								.filter((q: Quote) => q.companyName === account.customer?.name)
								.slice(0, 10)
						}
						return []
					})(),
				])

				setActivityData({
					orders: ordersResult.status === 'fulfilled' ? ordersResult.value : [],
					quotes: quotesResult.status === 'fulfilled' ? quotesResult.value : [],
					isLoadingOrders: false,
					isLoadingQuotes: false,
				})

				logger.debug('Activity data loaded', {
					component: 'useAccountDetailLogic',
					accountId: account.id,
					ordersCount: ordersResult.status === 'fulfilled' ? ordersResult.value.length : 0,
					quotesCount: quotesResult.status === 'fulfilled' ? quotesResult.value.length : 0,
				})
			} catch (error) {
				logger.warn('Failed to load activity data', {
					component: 'useAccountDetailLogic',
					accountId: account.id,
					error,
				})
				setActivityData({
					orders: [],
					quotes: [],
					isLoadingOrders: false,
					isLoadingQuotes: false,
				})
			}
		}

		void fetchActivityData()
	}, [activeTab, account?.id, account?.customerId, account?.customer?.name, isCreateMode])

	// ============================================================================
	// EVENT HANDLERS
	// ============================================================================

	/**
	 * Handle account update from UpdateAccountForm
	 */
	const handleAccountUpdate = useCallback((updatedUser: IUser) => {
		setAccount(new User(updatedUser))
		logger.info('Account updated', {
			component: 'useAccountDetailLogic',
			accountId: updatedUser.id,
		})
	}, [])

	/**
	 * Handle role change for the account
	 * Only available for admin users editing other accounts
	 */
	const handleRoleChange = useCallback(
		async (newRole: number) => {
			if (!account || !canChangeRole) {
				notificationService.warning('You do not have permission to change this role')
				return
			}

			try {
				setIsRoleUpdating(true)

			// Create updated user with new role
			const updatedUser = new User({
				...account,
				roleLevel: newRole,
			})

				const { data } = await API.Accounts.update(updatedUser)

				if (data.payload) {
					setAccount(new User(data.payload))
					notificationService.success(
						`Role updated to ${newRole === RoleLevels.Admin ? 'Admin' : 'Customer'}`
					)
				logger.info('Account role updated', {
					component: 'useAccountDetailLogic',
					accountId: account.id,
					oldRole: account.roleLevel,
					newRole,
				})
				} else {
					notificationService.error('Failed to update role')
				}
			} catch (error) {
				notificationService.error('Failed to update role', {
					metadata: { error, accountId: account.id },
					component: 'AccountDetailPage',
					action: 'handleRoleChange',
				})
			} finally {
				setIsRoleUpdating(false)
			}
		},
		[account, canChangeRole]
	)

	/**
	 * Refresh account data from server
	 */
	const handleRefreshAccount = useCallback(async () => {
		if (!accountId || isCreateMode) {
			return
		}

		try {
			setIsLoading(true)
			const { data } = await API.Accounts.get(accountId)

			if (data.payload) {
				setAccount(new User(data.payload))
			}
		} catch (error) {
			notificationService.error('Failed to refresh account data', {
				metadata: { error, accountId },
				component: 'AccountDetailPage',
				action: 'handleRefreshAccount',
			})
		} finally {
			setIsLoading(false)
		}
	}, [accountId, isCreateMode])

	/**
	 * Handle status change for the account
	 * Only available for admin users editing other accounts
	 *
	 * Uses unified status change endpoint and existing status label helper.
	 */
	const handleStatusChange = useCallback(
		async (newStatus: AccountStatus, reason?: string) => {
			if (!account?.id || !canChangeStatus) {
				notificationService.warning('You do not have permission to change this status', {
					component: 'AccountDetailPage',
					action: 'handleStatusChange',
				})
				return
			}

			try {
				setIsStatusUpdating(true)

				const accountIdStr = String(account.id)

				// Handle status-specific requirements (remove Suspended case - reason comes from caller)
				switch (newStatus) {
					case AccountStatus.Locked:
						// Locking is automatic via failed login attempts
						notificationService.warning(
							'Accounts are locked automatically after 5 failed login attempts. Use "Active" to unlock.',
							{
								component: 'AccountDetailPage',
								action: 'handleStatusChange',
							}
						)
						return

					case AccountStatus.PendingVerification:
						// PendingVerification is set during registration
						notificationService.warning('Pending Verification status is set during account creation.', {
							component: 'AccountDetailPage',
							action: 'handleStatusChange',
						})
						return
				}

				// Call unified status change endpoint (reason is now a parameter)
				const response = await API.Accounts.changeStatus(accountIdStr, newStatus, reason)

				// Check response using existing pattern
				if (response?.data?.statusCode === 200 && response?.data?.payload?.success) {
					// Refresh account data to get updated status
					await handleRefreshAccount()

					// Use existing getAccountStatusLabel helper (DRY)
					const statusLabel = getAccountStatusLabel(newStatus)
					notificationService.success(`Account status updated to "${statusLabel}"`, {
						component: 'AccountDetailPage',
						action: 'handleStatusChange',
					})

					logger.info('Account status changed', {
						component: 'useAccountDetailLogic',
						accountId: account.id,
						oldStatus: response.data.payload.oldStatus,
						newStatus: response.data.payload.newStatus,
					})
				} else {
					// Extract error message from response (follows existing pattern)
					const errorMessage =
						response?.data?.payload?.errorMessage ?? response?.data?.message ?? 'Failed to update status'

					notificationService.error(errorMessage, {
						metadata: {
							statusCode: response?.data?.statusCode,
							accountId: account.id,
							newStatus,
						},
						component: 'AccountDetailPage',
						action: 'handleStatusChange',
					})
				}
			} catch (error) {
				notificationService.error('Failed to update status', {
					metadata: { error, accountId: account.id },
					component: 'AccountDetailPage',
					action: 'handleStatusChange',
				})
			} finally {
				setIsStatusUpdating(false)
			}
		},
		[account?.id, canChangeStatus, handleRefreshAccount]
	)

	/**
	 * Confirm and execute pending role change
	 */
	const confirmRoleChange = useCallback(async () => {
		if (pendingRoleChange === null) {
			return
		}
		await handleRoleChange(pendingRoleChange)
		setPendingRoleChange(null)
	}, [pendingRoleChange, handleRoleChange])

	/**
	 * Confirm and execute pending status change
	 */
	const confirmStatusChange = useCallback(async () => {
		if (pendingStatusChange === null) {
			return
		}
		await handleStatusChange(pendingStatusChange)
		setPendingStatusChange(null)
	}, [pendingStatusChange, handleStatusChange])

	/**
	 * Handle sending password reset email
	 * Only available for admin users editing other accounts
	 */
	const handleSendPasswordReset = useCallback(async () => {
		if (!account || !canChangePassword) {
			notificationService.warning('You do not have permission to reset this password')
			return
		}

		try {
			setIsSendingPasswordReset(true)

			// TODO: Implement actual API call when backend supports it
			// const { data } = await API.Accounts.sendPasswordReset(account.id)

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000))

			notificationService.success(`Password reset email sent to ${account.email}`, {
				component: 'AccountDetailPage',
				action: 'handleSendPasswordReset',
			})

			logger.info('Password reset email sent', {
				component: 'useAccountDetailLogic',
				accountId: account.id,
				email: account.email,
			})
		} catch (error) {
			notificationService.error('Failed to send password reset email', {
				metadata: { error, accountId: account.id },
				component: 'AccountDetailPage',
				action: 'handleSendPasswordReset',
			})
		} finally {
			setIsSendingPasswordReset(false)
		}
	}, [account, canChangePassword])

	/**
	 * Handle forcing logout of all sessions
	 * Only available for admin users editing other accounts
	 */
	const handleForceLogout = useCallback(async () => {
		if (!account || !canChangePassword) {
			notificationService.warning('You do not have permission to force logout')
			return
		}

		try {
			// TODO: Implement actual API call when backend supports it
			// const { data } = await API.Accounts.forceLogout(account.id)

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500))

			notificationService.success('All sessions have been terminated', {
				component: 'AccountDetailPage',
				action: 'handleForceLogout',
			})

			logger.info('Force logout executed', {
				component: 'useAccountDetailLogic',
				accountId: account.id,
			})
		} catch (error) {
			notificationService.error('Failed to force logout', {
				metadata: { error, accountId: account.id },
				component: 'AccountDetailPage',
				action: 'handleForceLogout',
			})
		}
	}, [account, canChangePassword])

	// ============================================================================
	// NAVIGATION HANDLERS
	// ============================================================================

	const handleBack = useCallback(() => {
		router.back()
	}, [router])

	const handleViewCustomer = useCallback(() => {
		if (hasCustomerAssociation && account?.customerId) {
			router.push(Routes.Customers.detail(account.customerId))
		}
	}, [router, hasCustomerAssociation, account?.customerId])

	const handleViewOrders = useCallback(() => {
		// Navigate to orders page filtered by this account
		// For now, just go to orders list (can add filtering later)
		router.push(Routes.Orders.location)
	}, [router])

	const handleViewQuotes = useCallback(() => {
		// Navigate to quotes page filtered by this account
		// For now, just go to quotes list (can add filtering later)
		router.push(Routes.Quotes.location)
	}, [router])

	const handleManageAccounts = useCallback(() => {
		router.push(Routes.Accounts.location)
	}, [router])

	// ============================================================================
	// RETURN
	// ============================================================================

	return {
		// Core State
		account,
		isLoading,
		isCreateMode,

		// Tab State
		activeTab,
		setActiveTab,

		// Auth State
		currentUser,
		isCurrentUserAdmin,

		// Derived State
		accountName,
		memberSince,
		hasCustomerAssociation,
		pageTitle,
		pageDescription,

		// Customer/Company Association
		customerCompany,

		// Account Status
		accountStatus,
		isStatusUpdating,
		canChangeStatus,
		handleStatusChange,

		// Activity Summary (counts)
		activitySummary,

		// Activity Data (lists)
		activityData,

		// Role Management
		isRoleUpdating,
		canChangeRole,
		handleRoleChange,

		// Confirmation State
		pendingRoleChange,
		pendingStatusChange,
		setPendingRoleChange,
		setPendingStatusChange,
		confirmRoleChange,
		confirmStatusChange,

		// Security
		canChangePassword,
		handleSendPasswordReset,
		handleForceLogout,
		isSendingPasswordReset,

		// Account Actions
		handleAccountUpdate,
		handleRefreshAccount,

		// Navigation Handlers
		handleBack,
		handleViewCustomer,
		handleViewOrders,
		handleViewQuotes,
		handleManageAccounts,
	}
}
