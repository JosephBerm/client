'use client'

/**
 * Sales Rep Quick Actions
 *
 * Quick action buttons for Sales Representative users.
 * Provides shortcuts to handle quotes, confirm payments, and view orders.
 *
 * @see prd_dashboard.md - Sales Rep Quick Actions
 * @module dashboard/actions/SalesRepQuickActions
 */

import { DollarSign, FileText, Package } from 'lucide-react'

import { QuickActions } from '../QuickActions'

// =============================================================================
// CONSTANTS
// =============================================================================

const SALES_REP_ACTIONS = [
	{
		label: 'Next Quote',
		href: '/app/quotes?status=unread',
		icon: FileText,
		variant: 'primary' as const,
	},
	{
		label: 'Confirm Payment',
		href: '/app/orders?status=placed',
		icon: DollarSign,
	},
	{
		label: 'All Orders',
		href: '/app/orders',
		icon: Package,
	},
]

// =============================================================================
// COMPONENT
// =============================================================================

export function SalesRepQuickActions() {
	return <QuickActions title="Quick Actions" actions={SALES_REP_ACTIONS} />
}

export default SalesRepQuickActions

