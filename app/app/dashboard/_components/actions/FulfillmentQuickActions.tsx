'use client'

/**
 * Fulfillment Quick Actions
 *
 * Quick action buttons for Fulfillment Coordinator users.
 * Provides shortcuts to ship orders, add tracking, and view shipments.
 *
 * @see prd_dashboard.md - Fulfillment Quick Actions
 * @module dashboard/actions/FulfillmentQuickActions
 */

import { Eye, Package, Truck } from 'lucide-react'

import { QuickActions } from '../QuickActions'

// =============================================================================
// CONSTANTS
// =============================================================================

const FULFILLMENT_ACTIONS = [
	{
		label: 'Ship Next',
		href: '/app/orders?status=processing',
		icon: Truck,
		variant: 'primary' as const,
	},
	{
		label: 'Add Tracking',
		href: '/app/orders',
		icon: Package,
	},
	{
		label: 'All Shipments',
		href: '/app/orders?status=shipped',
		icon: Eye,
	},
]

// =============================================================================
// COMPONENT
// =============================================================================

export function FulfillmentQuickActions() {
	return <QuickActions title="Quick Actions" actions={FULFILLMENT_ACTIONS} />
}

export default FulfillmentQuickActions

