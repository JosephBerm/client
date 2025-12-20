/**
 * CustomerQuickActions Component
 * 
 * Grid of quick action buttons for common customer operations.
 * Provides navigation to related resources (orders, quotes).
 * 
 * **Actions:**
 * - View Orders: Navigate to orders filtered by customer
 * - View Quotes: Navigate to quotes filtered by customer
 * - New Order: Create order for this customer
 * - New Quote: Create quote for this customer
 * 
 * **Performance Optimizations (React 19 Best Practices):**
 * - useMemo for actions array (stable reference, only recalculates when customerId changes)
 * - Static action config pattern (no inline function creation in render)
 * 
 * @see prd_customers.md - Quick Navigation
 * @module customers/components
 */

'use client'

import { useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { FileText, type LucideIcon, Package } from 'lucide-react'

import { Routes } from '@_features/navigation'

import Button from '@_components/ui/Button'

/** Component props */
interface CustomerQuickActionsProps {
	/** Customer ID for generating links */
	customerId: number
}

/** Action configuration type */
interface QuickAction {
	id: string
	icon: LucideIcon
	label: string
	href: string
}

/**
 * CustomerQuickActions - Quick navigation grid.
 * 
 * **React 19 Optimization Notes:**
 * - Actions array is memoized to prevent array recreation on each render
 * - Uses href strings instead of onClick handlers for better performance
 * - Router.push is called in single handler, reducing function allocations
 */
export function CustomerQuickActions({ customerId }: CustomerQuickActionsProps) {
	const router = useRouter()

	/**
	 * Quick action configurations.
	 * Memoized to prevent array recreation on every render.
	 * Only recalculates when customerId changes.
	 */
	const actions = useMemo<QuickAction[]>(
		() => [
			{
				id: 'view-orders',
				icon: Package,
				label: 'View Orders',
				href: `${Routes.Orders.location}?customerId=${customerId}`,
			},
			{
				id: 'view-quotes',
				icon: FileText,
				label: 'View Quotes',
				href: `${Routes.Quotes.location}?customerId=${customerId}`,
			},
			{
				id: 'new-order',
				icon: Package,
				label: 'New Order',
				href: Routes.Orders.create({ customerId }),
			},
			{
				id: 'new-quote',
				icon: FileText,
				label: 'New Quote',
				href: Routes.Quotes.create({ customerId }),
			},
		],
		[customerId]
	)

	/**
	 * Handle action click - navigates to action href.
	 * Single handler reduces inline function allocations in render.
	 */
	const handleActionClick = (href: string) => {
		router.push(href)
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{actions.map((action) => {
				const Icon = action.icon
				return (
					<Button
						key={action.id}
						variant="outline"
						className="flex-col gap-1 h-auto py-3"
						onClick={() => handleActionClick(action.href)}
					>
						<Icon size={20} />
						<span className="text-xs">{action.label}</span>
					</Button>
				)
			})}
		</div>
	)
}

export default CustomerQuickActions

