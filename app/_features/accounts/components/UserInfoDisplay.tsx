'use client'

/**
 * UserInfoDisplay Component
 * 
 * Shared component for displaying user information in modals.
 * Handles the case where username === email by only showing once.
 * 
 * Used by:
 * - RoleChangeModal
 * - PasswordResetModal
 * - AccountSecurityTab
 * 
 * @module features/accounts/components/UserInfoDisplay
 */

import type { ReactNode } from 'react'

import type { AccountInfo } from '@_types'

// ============================================================================
// TYPES
// ============================================================================

export interface UserInfoDisplayProps {
	/** Account to display info for */
	account: AccountInfo
	/** Optional icon to display */
	icon?: ReactNode
	/** Optional header text above the user info */
	headerText?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * UserInfoDisplay Component
 * 
 * Displays user info with smart handling of username/email display.
 * If username === email, only shows once to avoid redundancy.
 */
export default function UserInfoDisplay({ 
	account, 
	icon,
	headerText 
}: UserInfoDisplayProps) {
	// Check if username is different from email
	const hasDistinctUsername = account.username !== account.email
	
	// Display name: prefer username if different from email, otherwise use email
	const displayName = hasDistinctUsername ? account.username : account.email

	return (
		<div className="p-3 rounded-lg bg-base-200">
			{headerText && (
				<p className="text-sm text-base-content/60 mb-1">{headerText}</p>
			)}
			<div className="flex items-center gap-3">
				{icon && (
					<div className="p-2 rounded-lg bg-primary/10 shrink-0">
						{icon}
					</div>
				)}
				<div className="min-w-0">
					<p className="font-medium truncate">{displayName}</p>
					{hasDistinctUsername && (
						<p className="text-sm text-base-content/60 truncate">{account.email}</p>
					)}
				</div>
			</div>
		</div>
	)
}

