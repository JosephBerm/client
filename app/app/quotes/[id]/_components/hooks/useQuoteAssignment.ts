/**
 * useQuoteAssignment Hook
 *
 * Custom hook for managing quote assignment to Sales Reps.
 * Uses `useFormSubmit` for DRY form submission handling.
 *
 * **Features:**
 * - Fetch Sales Reps (SalesManager+ can select)
 * - Automatic quote refresh after assignment
 * - Loading states and error handling (via useFormSubmit)
 * - Type-safe with full TypeScript support
 *
 * **Permission Logic:**
 * - SalesManager+: Can assign/unassign Sales Reps
 * - SalesRep and below: Cannot assign (permissions.canAssign = false)
 *
 * **Pattern:**
 * - Follows `useQuoteActions` pattern for consistency
 * - Uses `useFormSubmit` for all API calls (DRY, handles loading/error/success)
 * - Refreshes quote data after successful assignment
 *
 * @module app/quotes/[id]/_components/hooks/useQuoteAssignment
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

import { logger } from '@_core'

import { parseDateOrNow } from '@_lib/dates'

import { useFormSubmit, API } from '@_shared'

import { RoleLevels } from '@_types/rbac'

import Quote from '@_classes/Quote'
import User from '@_classes/User'

import type { UseQuotePermissionsReturn } from './useQuotePermissions'

/**
 * Return type for useQuoteAssignment hook
 */
export interface UseQuoteAssignmentReturn {
	/** Available sales reps */
	salesReps: User[]
	/** Available sales managers (escalation/oversight) */
	salesManagers: User[]
	/** Combined sales team (managers + reps) */
	salesTeam: User[]
	/** Whether sales team is currently loading */
	isLoadingSalesTeam: boolean
	/** Error message if fetching sales team failed */
	salesTeamError: string | null
	/** Handler for assigning quote to a sales rep */
	handleAssign: (salesRepId: string) => Promise<void>
	/** Handler for unassigning quote */
	handleUnassign: () => Promise<void>
	/** Whether assignment action is currently processing */
	isProcessing: boolean
	/** Currently assigned sales rep (if any) */
	assignedSalesRep: User | null
}

/**
 * Custom hook for quote assignment management
 *
 * Provides functionality to assign/unassign quotes to Sales Reps.
 *
 * **Data Fetching:**
 * - Sales team (Sales Managers + Sales Reps) fetched when user can assign
 * - Uses backend role filter endpoint for server-side efficiency
 *
 * @param quote - The quote entity
 * @param permissions - Permission flags from useQuotePermissions
 * @param onRefresh - Callback to refresh quote data after successful assignment
 * @returns Assignment handlers, user lists, and processing state
 *
 * @example
 * ```tsx
 * const { quote, refresh } = useQuoteDetails()
 * const permissions = useQuotePermissions(quote)
 * const { salesReps, handleAssign } = useQuoteAssignment(quote, permissions, refresh)
 *
 * <Select onChange={(e) => handleAssign(e.target.value)}>
 *   {salesReps.map(rep => (
 *     <option key={rep.id} value={rep.id}>{rep.name.getFormattedName()}</option>
 *   ))}
 * </Select>
 * ```
 */
export function useQuoteAssignment(
	quote: Quote | null,
	permissions: UseQuotePermissionsReturn,
	onRefresh?: () => Promise<void>
): UseQuoteAssignmentReturn {
	const [salesReps, setSalesReps] = useState<User[]>([])
	const [salesManagers, setSalesManagers] = useState<User[]>([])
	const [isLoadingSalesTeam, setIsLoadingSalesTeam] = useState(false)
	const [salesTeamError, setSalesTeamError] = useState<string | null>(null)

	// Quote ID
	const quoteId = quote?.id

	// Fetch Sales Team (SalesManager+ can select)
	useEffect(() => {
		if (!permissions.canAssign) {
			// Don't fetch if user can't assign
			logger.debug('Skipping sales team fetch - no assign permission', {
				component: 'useQuoteAssignment',
				action: 'fetchSalesTeam',
			})
			return
		}

		const fetchSalesTeam = async () => {
			try {
				setIsLoadingSalesTeam(true)
				setSalesTeamError(null)

				logger.debug('Fetching sales team...', {
					roles: [RoleLevels.SalesRep, RoleLevels.SalesManager],
					component: 'useQuoteAssignment',
					action: 'fetchSalesTeam',
				})

				// Fetch Sales Managers + Sales Reps in one call (server-side role filtering)
				// Uses backend _accountService.GetByRole([RoleLevels.SalesRep, RoleLevels.SalesManager])
				const { data } = await API.Accounts.getByRole([RoleLevels.SalesRep, RoleLevels.SalesManager])

				if (!data.payload) {
					logger.warn('No payload in sales team response', {
						message: data.message,
						component: 'useQuoteAssignment',
						action: 'fetchSalesTeam',
					})
					setSalesTeamError(data.message ?? 'Failed to load sales team')
					setSalesManagers([])
					setSalesReps([])
					return
				}

				logger.debug('Sales team API response received', {
					payloadLength: data.payload.length,
					rawPayload: data.payload,
					component: 'useQuoteAssignment',
					action: 'fetchSalesTeam',
				})

				const users = data.payload.map((userData: unknown) => new User(userData as Partial<User>))

				// MAANG-Level: Robust type coercion for role comparison
				// API may return role as string or number depending on serialization
				// Use Number() to ensure consistent numeric comparison
				const managers = users.filter((u) => Number(u.roleLevel) === Number(RoleLevels.SalesManager))
				const reps = users.filter((u) => Number(u.roleLevel) === Number(RoleLevels.SalesRep))

				logger.debug('Sales team fetched', {
					totalUsers: users.length,
					salesManagers: managers.length,
					salesReps: reps.length,
					roles: users.map((u) => ({ id: u.id, roleLevel: u.roleLevel, roleType: typeof u.roleLevel })),
					component: 'useQuoteAssignment',
					action: 'fetchSalesTeam',
				})

				setSalesManagers(managers)
				setSalesReps(reps)
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Failed to load sales team'
				setSalesTeamError(errorMessage)
				logger.error('Failed to fetch sales reps', {
					error: err,
					component: 'useQuoteAssignment',
					action: 'fetchSalesTeam',
				})
				setSalesManagers([])
				setSalesReps([])
			} finally {
				setIsLoadingSalesTeam(false)
			}
		}

		void fetchSalesTeam()
	}, [permissions.canAssign])

	// Helper to create updated quote
	const createUpdatedQuote = useCallback(
		(salesRepId: string | null): Quote | null => {
			if (!quote || !quoteId) {
				return null
			}

			return new Quote({
				...quote,
				assignedSalesRepId: salesRepId ?? undefined,
				assignedAt: salesRepId ? parseDateOrNow() : undefined,
			})
		},
		[quote, quoteId]
	)

	// Assign action
	const assignSubmitFn = useCallback(
		async (salesRepId: string) => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}
			if (!salesRepId) {
				throw new Error('Sales rep ID is required')
			}

			const updatedQuote = createUpdatedQuote(salesRepId)
			if (!updatedQuote) {
				throw new Error('Failed to create updated quote')
			}
			return API.Quotes.update<Quote>(updatedQuote)
		},
		[createUpdatedQuote, quoteId]
	)

	// useFormSubmit stores the function and calls it later - dependencies are captured in closure
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const assignSubmit = useFormSubmit(assignSubmitFn, {
		successMessage: 'Quote assigned successfully',
		errorMessage: 'Failed to assign quote',
		componentName: 'useQuoteAssignment',
		actionName: 'assign',
		onSuccess: async () => {
			await onRefresh?.()
		},
	})

	// Unassign action
	const unassignSubmitFn = useCallback(
		async (_data: Record<string, never>) => {
			if (!quoteId) {
				throw new Error('Quote ID is required')
			}
			const updatedQuote = createUpdatedQuote(null)
			if (!updatedQuote) {
				throw new Error('Failed to create updated quote')
			}
			return API.Quotes.update<Quote>(updatedQuote)
		},
		[createUpdatedQuote, quoteId]
	)

	// useFormSubmit stores the function and calls it later - dependencies are captured in closure
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const unassignSubmit = useFormSubmit(unassignSubmitFn, {
		successMessage: 'Quote unassigned successfully',
		errorMessage: 'Failed to unassign quote',
		componentName: 'useQuoteAssignment',
		actionName: 'unassign',
		onSuccess: async () => {
			await onRefresh?.()
		},
	})

	// Wrapper handler for assignment
	const handleAssign = useCallback(
		async (salesRepId: string) => {
			const result = await assignSubmit.submit(salesRepId)
			if (!result.success) {
				logger.error('Assign failed', {
					quoteId,
					salesRepId,
					component: 'useQuoteAssignment',
					action: 'handleAssign',
				})
			}
		},
		[assignSubmit, quoteId]
	)

	const handleUnassign = useCallback(async () => {
		const result = await unassignSubmit.submit({})
		if (!result.success) {
			logger.error('Unassign failed', {
				quoteId,
				component: 'useQuoteAssignment',
				action: 'handleUnassign',
			})
		}
	}, [unassignSubmit, quoteId])

	// Find currently assigned sales rep
	const salesTeam = useMemo(() => [...salesManagers, ...salesReps], [salesManagers, salesReps])

	const assignedSalesRep = useMemo(() => {
		if (!quote?.assignedSalesRepId || salesTeam.length === 0) {
			return null
		}
		return salesTeam.find((rep) => rep.id === quote.assignedSalesRepId) ?? null
	}, [quote?.assignedSalesRepId, salesTeam])

	// Combined processing state
	const isProcessing = assignSubmit.isSubmitting || unassignSubmit.isSubmitting

	return {
		salesReps,
		salesManagers,
		salesTeam,
		isLoadingSalesTeam,
		salesTeamError,
		handleAssign,
		handleUnassign,
		isProcessing,
		assignedSalesRep,
	}
}
