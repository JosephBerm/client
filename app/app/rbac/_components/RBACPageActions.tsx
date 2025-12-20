/**
 * RBACPageActions Component
 *
 * Header action buttons for the RBAC management page.
 * Contains bulk update and refresh buttons.
 *
 * Architecture: Presentation component with callbacks.
 *
 * @module app/rbac/_components/RBACPageActions
 */

'use client'

import { Users, RefreshCw } from 'lucide-react'

import Button from '@_components/ui/Button'

// =========================================================================
// TYPES
// =========================================================================

interface RBACPageActionsProps {
	/** Whether user can edit (is admin) */
	canEdit: boolean
	/** Whether data is loading */
	isLoading: boolean
	/** Callback for bulk update button */
	onBulkUpdate: () => void
	/** Callback for refresh button */
	onRefresh: () => void
}

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * RBAC Page Header Actions
 *
 * Contains:
 * - Bulk Update Roles button (admin only)
 * - Refresh button with loading spinner
 */
export function RBACPageActions({
	canEdit,
	isLoading,
	onBulkUpdate,
	onRefresh,
}: RBACPageActionsProps) {
	return (
		<div className="flex items-center gap-3">
			{canEdit && (
				<Button
					variant="primary"
					onClick={onBulkUpdate}
					className="gap-2"
				>
					<Users className="h-4 w-4" />
					Bulk Update Roles
				</Button>
			)}
			<Button variant="ghost" onClick={onRefresh} disabled={isLoading}>
				<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
			</Button>
		</div>
	)
}

export default RBACPageActions

