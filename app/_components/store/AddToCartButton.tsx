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
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { Product } from '@_classes/Product'
import { useCartStore } from '@_features/cart'
import Button from '@_components/ui/Button'
import { logger } from '@_core'
import { toast } from 'react-toastify'

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

	// Validate and clamp quantity
	const clampQuantity = useCallback((value: number): number => {
		return Math.max(minQuantity, Math.min(maxQuantity, Math.floor(value)))
	}, [minQuantity, maxQuantity])

	// Handle quantity change
	const handleQuantityChange = useCallback((newValue: number) => {
		const clamped = clampQuantity(newValue)
		setQuantity(clamped)
	}, [clampQuantity])

	// Increment quantity
	const handleIncrement = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setQuantity((prev) => clampQuantity(prev + 1))
	}, [clampQuantity])

	// Decrement quantity
	const handleDecrement = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setQuantity((prev) => clampQuantity(prev - 1))
	}, [clampQuantity])

	// Handle input change
	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10)
		if (isNaN(value)) {
			setQuantity(minQuantity)
			return
		}
		handleQuantityChange(value)
	}, [handleQuantityChange, minQuantity])

	// Handle add to cart
	const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (isAdding) return

		setIsAdding(true)

		try {
			// Add to cart (price is 0 in quote-based model)
			addToCart({
				productId: product.id,
				quantity: quantity,
				price: 0, // Quote-based: no price until quote is generated
				name: product.name || 'Unnamed product',
			})

			// Log successful add
			logger.info('Product added to cart', {
				productId: product.id,
				productName: product.name,
				quantity,
				component: 'AddToCartButton',
			})

			// Show success toast
			toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`, {
				position: 'top-right',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			})

			// Reset quantity to default after successful add
			setQuantity(defaultQuantity)
		} catch (error) {
			logger.error('Failed to add product to cart', {
				productId: product.id,
				error,
				component: 'AddToCartButton',
			})

			toast.error('Failed to add item to cart. Please try again.', {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
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
			<div className="flex items-center justify-center gap-2">
				{/* Decrement Button */}
				<button
					type="button"
					onClick={handleDecrement}
					disabled={quantity <= minQuantity || isAdding}
					className="btn btn-sm btn-ghost btn-circle shrink-0 disabled:opacity-50"
					aria-label="Decrease quantity"
				>
					<Minus className="h-4 w-4" />
				</button>

				{/* Quantity Input */}
				<input
					type="number"
					min={minQuantity}
					max={maxQuantity}
					value={quantity}
					onChange={handleInputChange}
					disabled={isAdding}
					className="input input-bordered input-sm w-20 text-center font-medium disabled:opacity-50"
					aria-label="Quantity"
				/>

				{/* Increment Button */}
				<button
					type="button"
					onClick={handleIncrement}
					disabled={quantity >= maxQuantity || isAdding}
					className="btn btn-sm btn-ghost btn-circle shrink-0 disabled:opacity-50"
					aria-label="Increase quantity"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

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

