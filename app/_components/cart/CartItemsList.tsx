/**
 * CartItemsList Component
 * 
 * List container for cart items.
 * Maps cart items to CartItem components.
 * 
 * @module components/cart/CartItemsList
 */

import type { CartItem } from '@_features/cart'

import { Product } from '@_classes/Product'

import CartItem from './CartItem'

export interface CartItemsListProps {
	/** Array of cart items */
	items: CartItem[]
	/** Map of product IDs to Product objects */
	products: Map<string, Product>
	/** Callback when quantity changes */
	onQuantityChange: (productId: string, quantity: number) => void
	/** Callback when item is removed */
	onRemove: (productId: string) => void
}

/**
 * CartItemsList Component
 * 
 * Renders a list of cart items using CartItem components.
 * 
 * @param props - Component props
 * @returns CartItemsList component
 */
export default function CartItemsList({
	items,
	products,
	onQuantityChange,
	onRemove,
}: CartItemsListProps) {
	if (items.length === 0) {
		return null
	}

	return (
		<div className="space-y-3 sm:space-y-4">
			{items.map((item) => (
				<CartItem
					key={item.productId}
					item={item}
					product={products.get(item.productId) || null}
					onQuantityChange={onQuantityChange}
					onRemove={onRemove}
					showProductLink={true}
					compact={false}
				/>
			))}
		</div>
	)
}
