/**
 * Quote Details Page - Shared Types
 * 
 * Type definitions for quote detail components and hooks.
 * Centralized for consistency and reusability.
 * 
 * @module app/quotes/[id]/_components/types
 */

import type Quote from '@_classes/Quote'

/**
 * Props for quote detail components that require quote data
 */
export interface QuoteComponentProps {
	/** The quote entity to display */
	quote: Quote | null
}

/**
 * Props for components that require both quote and permissions
 */
export interface QuoteWithPermissionsProps extends QuoteComponentProps {
	/** Permission flags for the current user and quote context */
	permissions: {
		canView: boolean
		canUpdate: boolean
		canMarkAsRead: boolean
		canApprove: boolean
		canReject: boolean
		canAssign: boolean
		canConvert: boolean
		canDelete: boolean
		canAddInternalNotes: boolean
		canViewCustomerHistory: boolean
	}
}

