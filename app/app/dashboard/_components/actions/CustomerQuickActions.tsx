'use client'

/**
 * Customer Quick Actions
 *
 * Quick action buttons for Customer users.
 * Provides shortcuts to browse products, view orders, and view quotes.
 *
 * @see prd_dashboard.md - Customer Quick Actions
 * @module dashboard/actions/CustomerQuickActions
 */

import { FileText, Package, ShoppingCart } from 'lucide-react'

import { QuickActions } from '../QuickActions'

// =============================================================================
// CONSTANTS
// =============================================================================

const CUSTOMER_ACTIONS = [
	{
		label: 'Browse Products',
		href: '/store',
		icon: ShoppingCart,
		variant: 'primary' as const,
	},
	{
		label: 'My Orders',
		href: '/app/orders',
		icon: Package,
	},
	{
		label: 'My Quotes',
		href: '/app/quotes',
		icon: FileText,
	},
]

// =============================================================================
// COMPONENT
// =============================================================================

export function CustomerQuickActions() {
	return <QuickActions title="Quick Actions" actions={CUSTOMER_ACTIONS} />
}

export default CustomerQuickActions

