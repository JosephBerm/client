/**
 * CartEmptyState Component
 * 
 * Empty state displayed when cart is empty.
 * Reuses EmptyState component for consistency.
 * 
 * @module components/cart/CartEmptyState
 */

import { ShoppingBag } from 'lucide-react'

import EmptyState from '@_components/common/EmptyState'

export interface CartEmptyStateProps {
	/** Callback when user clicks to browse products */
	onBrowseClick: () => void
}

/**
 * CartEmptyState Component
 * 
 * Displays empty cart message with call-to-action to browse products.
 * 
 * @param props - Component props
 * @returns CartEmptyState component
 */
export default function CartEmptyState({ onBrowseClick }: CartEmptyStateProps) {
	return (
		<EmptyState
			icon={<ShoppingBag className="w-16 h-16" />}
			title="Your cart is empty"
			description="Add some products to your cart to request a quote"
			action={{
				label: 'Browse Products',
				onClick: onBrowseClick,
			}}
		/>
	)
}
