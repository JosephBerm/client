/**
 * AddToCartButton Component - B2B Quote-Based Model
 * 
 * Button component for adding products to cart with quantity input.
 * Optimized for quote-based B2B e-commerce where customers specify quantities.
 * 
 * **Features:**
 * - Quantity input with validation (min: 1, max: 9999)
 * - Add to cart functionality
 * - Success feedback (toast notification)
 * - Loading state during add operation
 * - Mobile-first responsive design
 * - Accessible with proper ARIA labels
 * 
 * **Business Model Alignment:**
 * - Quote-based: No prices shown, just quantity selection
 * - B2B focus: Higher quantity limits for bulk orders
 * 
 * @module AddToCartButton
 */

'use client'

import { useState, useCallback } from 'react'

import { ShoppingCart } from 'lucide-react'

import { useCartStore } from '@_features/cart'

import { notificationService } from '@_shared'

import type { Product } from '@_classes/Product'

import Button from '@_components/ui/Button'
import QuantitySelector from '@_components/ui/QuantitySelector'



export interface AddToCartButtonProps {
	/** Product to add to cart */
	product: Product
	
	/** Optional: Initial quantity (default: 1) */
	defaultQuantity?: number
	
	/** Optional: Minimum quantity (default: 1) */
	minQuantity?: number
	
	/** Optional: Maximum quantity (default: 9999) */
	maxQuantity?: number
	
	/** Optional: Custom className */
	className?: string
	
	/** Optional: Button size (default: 'md') */
	size?: 'sm' | 'md' | 'lg'
	
	/** Optional: Show quantity controls inline (default: true) */
	showQuantityControls?: boolean
}

/**
 * AddToCartButton Component
 * 
 * Allows users to specify quantity and add product to cart.
 * Follows quote-based business model (no prices displayed).
 */
export default function AddToCartButton({
	product,
	defaultQuantity = 1,
	minQuantity = 1,
	maxQuantity = 9999,
	className = '',
	size = 'md',
	showQuantityControls = true,
}: AddToCartButtonProps) {
	const [quantity, setQuantity] = useState<number>(defaultQuantity)
	const [isAdding, setIsAdding] = useState(false)
	const addToCart = useCartStore((state) => state.addToCart)

	// Handle quantity change from QuantitySelector
	const handleQuantityChange = useCallback((newValue: number) => {
		setQuantity(newValue)
	}, [])

	// Handle add to cart
	const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (isAdding) {return}

		setIsAdding(true)

		try {
			// Add to cart (price is 0 in quote-based model)
			addToCart({
				productId: product.id,
				quantity: quantity,
				price: 0, // Quote-based: no price until quote is generated
				name: product.name || 'Unnamed product',
			})

		// Show success notification (automatically logs + shows toast)
		notificationService.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`, {
			metadata: {
				productId: product.id,
				productName: product.name,
				quantity,
			},
			component: 'AddToCartButton',
			action: 'addToCart',
		})

			// Reset quantity to default after successful add
			setQuantity(defaultQuantity)
	} catch (error) {
		// Show error notification (automatically logs + shows toast)
		notificationService.error('Failed to add item to cart. Please try again.', {
			metadata: {
				error,
				productId: product.id,
				productName: product.name,
			},
			component: 'AddToCartButton',
			action: 'addToCart',
		})
		} finally {
			setIsAdding(false)
		}
	}, [product, quantity, addToCart, defaultQuantity, isAdding])

	// If quantity controls are hidden, show simple button
	if (!showQuantityControls) {
		return (
			<Button
				variant="primary"
				size={size}
				onClick={handleAddToCart}
				loading={isAdding}
				className={className}
				leftIcon={<ShoppingCart className="h-4 w-4" />}
			>
				Add to Cart
			</Button>
		)
	}

	// Full component with quantity controls
	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			{/* Quantity Controls */}
			<QuantitySelector
				value={quantity}
				onChange={handleQuantityChange}
				min={minQuantity}
				max={maxQuantity}
				editable={true}
				size="sm"
				buttonVariant="ghost"
				useIcons={true}
				disabled={isAdding}
				ariaLabel="Product quantity"
				align="justify-center"
				className="w-full"
			/>

			{/* Add to Cart Button */}
			<Button
				variant="primary"
				size={size}
				onClick={handleAddToCart}
				loading={isAdding}
				className="w-full"
				leftIcon={<ShoppingCart className="h-4 w-4" />}
			>
				Add to Cart
			</Button>
		</div>
	)
}

