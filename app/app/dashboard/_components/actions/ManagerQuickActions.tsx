'use client'

/**
 * Manager Quick Actions
 *
 * Quick action buttons for Sales Manager users.
 * Provides shortcuts to assign quotes, view team, and check aging quotes.
 *
 * @see prd_dashboard.md - Manager Quick Actions
 * @module dashboard/actions/ManagerQuickActions
 */

import { BarChart3, Clock, Users } from 'lucide-react'

import { QuickActions } from '../QuickActions'

// =============================================================================
// CONSTANTS
// =============================================================================

const MANAGER_ACTIONS = [
	{
		label: 'Assign Quotes',
		href: '/app/quotes?unassigned=true',
		icon: Users,
		variant: 'primary' as const,
	},
	{
		label: 'View Team',
		href: '/app/team',
		icon: BarChart3,
	},
	{
		label: 'Aging Quotes',
		href: '/app/quotes?aging=true',
		icon: Clock,
	},
]

// =============================================================================
// COMPONENT
// =============================================================================

export function ManagerQuickActions() {
	return <QuickActions title="Quick Actions" actions={MANAGER_ACTIONS} />
}

export default ManagerQuickActions

