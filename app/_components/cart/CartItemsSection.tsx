/**
 * CartItemsSection Component
 * 
 * Container for cart items section including info card and items list.
 * Combines QuoteInfoCard and CartItemsList in a layout.
 * 
 * @module components/cart/CartItemsSection
 */

import type { CartItem } from '@_features/cart'

import { Product } from '@_classes/Product'

import QuoteInfoCard from './QuoteInfoCard'
import CartItemsList from './CartItemsList'

export interface CartItemsSectionProps {
	/** Array of cart items */
	cart: CartItem[]
	/** Map of product IDs to Product objects */
	products: Map<string, Product>
	/** Whether products are currently being fetched */
	isFetchingProducts: boolean
	/** Callback when quantity changes */
	onQuantityChange: (productId: string, quantity: number) => void
	/** Callback when item is removed */
	onRemove: (productId: string) => void
}

/**
 * CartItemsSection Component
 * 
 * Renders the cart items section with info card and items list.
 * 
 * @param props - Component props
 * @returns CartItemsSection component
 */
export default function CartItemsSection({
	cart,
	products,
	isFetchingProducts,
	onQuantityChange,
	onRemove,
}: CartItemsSectionProps) {
	return (
		<div data-testid="cart-container" className="lg:col-span-2 space-y-4">
			{/* Quote Process Info Card */}
			<QuoteInfoCard />

			{/* Cart Items */}
			<CartItemsList
				items={cart}
				products={products}
				onQuantityChange={onQuantityChange}
				onRemove={onRemove}
			/>
		</div>
	)
}
