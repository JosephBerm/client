/**
 * useQuotePermissions Hook - MAANG-Level Permission Management
 *
 * Centralizes all permission logic for the Quote Details page.
 * Wraps the generic `usePermissions` hook to provide quote-specific,
 * context-aware permission flags.
 *
 * **Features:**
 * - Context-aware permissions (Own, Assigned, Team, All)
 * - Memoized for performance (prevents unnecessary re-renders)
 * - Type-safe with full TypeScript support
 * - DRY principle (single source of truth for quote permissions)
 * - Follows existing `usePermissions` pattern
 *
 * **Permission Contexts:**
 * - Own: Customer viewing their own quote
 * - Assigned: SalesRep viewing assigned quote
 * - Team: SalesManager viewing team quotes
 * - All: SalesManager/Admin viewing any quote
 *
 * @module app/quotes/[id]/_components/hooks/useQuotePermissions
 */

'use client'

import { useMemo } from 'react'

import { usePermissions, Resources, Actions, Contexts, RoleLevels } from '@_shared/hooks/usePermissions'

import type Quote from '@_classes/Quote'
import { QuoteStatus } from '@_classes/Enums'

/**
 * Return type for useQuotePermissions hook
 */
export interface UseQuotePermissionsReturn {
	/** Can view this quote (hierarchical: Own -> Assigned -> Team -> All) */
	canView: boolean
	/** Can update this quote (context-aware: Own -> Assigned -> All) */
	canUpdate: boolean
	/** Can mark quote as read (requires canUpdate + Unread status) */
	canMarkAsRead: boolean
	/** Can approve quote (SalesManager+ only, requires Read status) */
	canApprove: boolean
	/** Can reject quote (requires canUpdate + Unread/Read status) */
	canReject: boolean
	/** Can assign/reassign quote (SalesManager+ only) */
	canAssign: boolean
	/** Can convert quote to order (requires Orders:Create permission + Approved status) */
	canConvert: boolean
	/** Can delete quote (Admin only) */
	canDelete: boolean
	/** Can add internal notes (SalesRep+ only) */
	canAddInternalNotes: boolean
	/** Can view customer history (SalesRep+ only) */
	canViewCustomerHistory: boolean
	/** Can submit quote for manager approval (SalesRep, requires Read status + pricing) */
	canSubmitForApproval: boolean
	/** Context flags for debugging/analytics */
	context: {
		isOwnQuote: boolean
		isAssignedQuote: boolean
		isTeamQuote: boolean
		isAllQuote: boolean
	}
}

/**
 * Custom hook for quote-specific permissions
 *
 * Provides memoized boolean flags for all quote-related actions.
 * Context-aware: permissions depend on quote ownership, assignment, and user role.
 *
 * **Permission Hierarchy:**
 * 1. Customer: Can view/update own quotes only
 * 2. SalesRep: Can view/update assigned quotes
 * 3. SalesManager: Can view/update all quotes, assign, approve
 * 4. Admin: Full access including delete
 *
 * @param quote - The quote entity (null if not loaded)
 * @returns Memoized permission flags and context
 *
 * @example
 * ```tsx
 * const { canView, canUpdate, canApprove, context } = useQuotePermissions(quote)
 *
 * if (!canView) {
 *   return <AccessDenied />
 * }
 *
 * {canApprove && (
 *   <Button onClick={handleApprove}>Approve Quote</Button>
 * )}
 * ```
 */
export function useQuotePermissions(quote: Quote | null): UseQuotePermissionsReturn {
	const { user, roleLevel, hasPermission, hasMinimumRole } = usePermissions()

	// Memoize all permission checks for efficiency
	const permissions = useMemo(() => {
		// Early return if no user or quote
		if (!user || !quote) {
			return {
				canView: false,
				canUpdate: false,
				canMarkAsRead: false,
				canApprove: false,
				canReject: false,
				canAssign: false,
				canConvert: false,
				canDelete: false,
				canAddInternalNotes: false,
				canViewCustomerHistory: false,
				canSubmitForApproval: false,
				context: {
					isOwnQuote: false,
					isAssignedQuote: false,
					isTeamQuote: false,
					isAllQuote: false,
				},
			}
		}

		// Determine context for the current quote
		// Check if quote belongs to user's customer account
		// Priority: customerId match (if backend provides it) > email/company name match
		const quoteCustomerId = 'customerId' in quote ? (quote as { customerId?: string }).customerId : undefined
		const isOwnQuote =
			user.customerId && quoteCustomerId
				? user.customerId === quoteCustomerId
				: user.email === quote.emailAddress || user.customer?.name === quote.companyName
		// Compare assignedSalesRepId as strings (backend stores as string, user.id is string|null)
		// Handle type coercion: convert both to string for comparison to avoid type mismatch issues
		const isAssignedQuote =
			quote.assignedSalesRepId != null && user.id != null
				? String(quote.assignedSalesRepId) === String(user.id)
				: false
		const isTeamQuote = hasMinimumRole(RoleLevels.SalesManager) // SalesManager+ can see team quotes
		const isAllQuote = hasMinimumRole(RoleLevels.SalesManager) // SalesManager+ can see all quotes

		// View Permissions (Hierarchical: Own -> Assigned -> Team -> All)
		const canView =
			(isOwnQuote && hasPermission(Resources.Quotes, Actions.Read, Contexts.Own)) ||
			(isAssignedQuote && hasPermission(Resources.Quotes, Actions.Read, Contexts.Assigned)) ||
			(isTeamQuote && hasPermission(Resources.Quotes, Actions.Read, Contexts.Team)) ||
			(isAllQuote && hasPermission(Resources.Quotes, Actions.Read, Contexts.All))

		// Update Permissions (Context-aware: Own -> Assigned -> All)
		const canUpdateOwn = isOwnQuote && hasPermission(Resources.Quotes, Actions.Update, Contexts.Own)
		const canUpdateAssigned = isAssignedQuote && hasPermission(Resources.Quotes, Actions.Update, Contexts.Assigned)
		const canUpdateAll = hasPermission(Resources.Quotes, Actions.Update, Contexts.All)
		const canUpdate = canUpdateOwn || canUpdateAssigned || canUpdateAll

		// Specific Workflow Actions
		const canMarkAsRead = canUpdate && quote.status === QuoteStatus.Unread
		const canApprove = hasPermission(Resources.Quotes, Actions.Approve) && quote.status === QuoteStatus.Read
		const canReject = canUpdate && (quote.status === QuoteStatus.Unread || quote.status === QuoteStatus.Read)
		const canAssign = hasPermission(Resources.Quotes, Actions.Assign)
		const canConvert = hasPermission(Resources.Orders, Actions.Create) && quote.status === QuoteStatus.Approved
		const canDelete = hasPermission(Resources.Quotes, Actions.Delete)
		const canAddInternalNotes = hasMinimumRole(RoleLevels.SalesRep) // SalesRep+ can add notes
		const canViewCustomerHistory = hasMinimumRole(RoleLevels.SalesRep) // SalesRep+ can view customer history

		// Submit for Approval: Sales Reps can submit quotes for manager approval
		// When quote is Read status, has pricing, but user doesn't have approval permission
		const canSubmitForApproval =
			canUpdate &&
			quote.status === QuoteStatus.Read &&
			!hasPermission(Resources.Quotes, Actions.Approve) &&
			hasMinimumRole(RoleLevels.SalesRep)

		return {
			canView,
			canUpdate,
			canMarkAsRead,
			canApprove,
			canReject,
			canAssign,
			canConvert,
			canDelete,
			canAddInternalNotes,
			canViewCustomerHistory,
			canSubmitForApproval,
			context: {
				isOwnQuote,
				isAssignedQuote,
				isTeamQuote,
				isAllQuote,
			},
		}
	}, [user, quote, roleLevel, hasPermission, hasMinimumRole])

	return permissions
}
