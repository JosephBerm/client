'use client'

/**
 * Admin Quick Actions
 *
 * Quick action buttons for Admin users.
 * Provides shortcuts to manage users, products, and settings.
 *
 * @see prd_dashboard.md - Admin Quick Actions
 * @module dashboard/actions/AdminQuickActions
 */

import { Package, Settings, Users } from 'lucide-react'

import { QuickActions } from '../QuickActions'

// =============================================================================
// CONSTANTS
// =============================================================================

const ADMIN_ACTIONS = [
	{
		label: 'Manage Users',
		href: '/app/accounts',
		icon: Users,
		variant: 'primary' as const,
	},
	{
		label: 'Manage Products',
		href: '/app/products',
		icon: Package,
	},
	{
		label: 'Settings',
		href: '/app/settings',
		icon: Settings,
	},
]

// =============================================================================
// COMPONENT
// =============================================================================

export function AdminQuickActions() {
	return <QuickActions title="Quick Actions" actions={ADMIN_ACTIONS} />
}

export default AdminQuickActions

