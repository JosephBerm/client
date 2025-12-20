/**
 * RBACTabNav Component
 *
 * Tab navigation for RBAC management page sections.
 * Supports admin-only tabs with visual indicators.
 *
 * Architecture: Controlled component - tab state managed by parent.
 *
 * @see prd_rbac_management.md
 * @module app/rbac/_components/RBACTabNav
 */

'use client'

import { Shield, Table, History, UserCog } from 'lucide-react'

// =========================================================================
// TYPES
// =========================================================================

/** Available tab identifiers */
export type RBACTabId = 'hierarchy' | 'matrix' | 'audit' | 'users'

/** Tab configuration */
export interface RBACTab {
	id: RBACTabId
	label: string
	icon: typeof Shield
	/** If true, only visible to admins */
	adminOnly?: boolean
}

interface RBACTabNavProps {
	/** Currently active tab */
	activeTab: RBACTabId
	/** Callback when tab changes */
	onTabChange: (tabId: RBACTabId) => void
	/** Whether user can edit (is admin) */
	canEdit: boolean
}

// =========================================================================
// TAB CONFIGURATION
// =========================================================================

/**
 * Tab definitions - single source of truth for tab metadata.
 * Exported for reuse in parent components if needed.
 */
export const RBAC_TABS: RBACTab[] = [
	{ id: 'hierarchy', label: 'Role Hierarchy', icon: Shield },
	{ id: 'matrix', label: 'Permission Matrix', icon: Table },
	{ id: 'audit', label: 'Audit Log', icon: History, adminOnly: true },
	{ id: 'users', label: 'User Roles', icon: UserCog, adminOnly: true },
]

// =========================================================================
// COMPONENT
// =========================================================================

/**
 * RBAC Tab Navigation
 *
 * Features:
 * - Underline indicator for active tab
 * - Admin-only badge for restricted tabs
 * - Keyboard accessible
 * - Responsive layout
 */
export function RBACTabNav({ activeTab, onTabChange, canEdit }: RBACTabNavProps) {
	return (
		<div className="mb-6 border-b border-base-300">
			<nav className="-mb-px flex gap-6" aria-label="RBAC Management Tabs">
				{RBAC_TABS.map((tab) => {
					// Hide admin-only tabs from non-admins
					if (tab.adminOnly && !canEdit) return null

					const isActive = activeTab === tab.id
					const Icon = tab.icon

					return (
						<button
							key={tab.id}
							onClick={() => onTabChange(tab.id)}
							className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
								isActive
									? 'border-primary text-primary'
									: 'border-transparent text-base-content/60 hover:border-base-content/30 hover:text-base-content'
							}`}
							aria-selected={isActive}
							role="tab"
						>
							<Icon className="h-4 w-4" />
							{tab.label}
							{tab.adminOnly && (
								<span className="ml-1 rounded bg-base-200 px-1.5 py-0.5 text-xs">
									Admin
								</span>
							)}
						</button>
					)
				})}
			</nav>
		</div>
	)
}

export default RBACTabNav

