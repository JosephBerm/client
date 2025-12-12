/**
 * Shopping Cart Store
 * 
 * Zustand store for managing shopping cart state with localStorage persistence.
 * Separated from user settings store following the Single Responsibility Principle.
 * 
 * **Separation Rationale:**
 * - **Cart**: Transient shopping data, session-specific
 * - **Settings**: Long-term user preferences
 * - Different lifecycles and concerns warrant separate stores
 * 
 * **Features:**
 * - Add/remove/update cart items
 * - Quantity management
 * - Automatic persistence to localStorage
 * - Clear cart functionality
 * - Type-safe cart operations
 * 
 * **Persistence:**
 * Uses Zustand's persist middleware for automatic localStorage sync.
 * Cart data persists across browser sessions.
 * 
 * @example
 * ```typescript
 * // Access cart
 * const cart = useCartStore(state => state.cart);
 * const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
 * 
 * // Add to cart
 * const addToCart = useCartStore(state => state.addToCart);
 * addToCart({ productId: '123', quantity: 2, price: 99.99, name: 'Product' });
 * 
 * // Clear cart
 * const clearCart = useCartStore(state => state.clearCart);
 * clearCart();
 * ```
 * 
 * @module useCartStore
 */

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react'

/**
 * Shopping cart item structure.
 */
export interface CartItem {
	/** Product unique identifier */
	productId: string
	/** Quantity of this product in cart */
	quantity: number
	/** Unit price of the product */
	price: number
	/** Display name of the product */
	name: string
}

/**
 * Cart store state interface.
 */
interface CartState {
	/** Array of cart items */
	cart: CartItem[]
	/** Indicates if the store has been hydrated from localStorage */
	_hasHydrated: boolean
}

/**
 * Cart store actions interface.
 */
interface CartActions {
	/** Adds item to cart (or updates quantity if exists) */
	addToCart: (item: CartItem) => void
	/** Removes an item from cart by product ID */
	removeFromCart: (productId: string) => void
	/** Updates quantity of a cart item */
	updateCartQuantity: (productId: string, quantity: number) => void
	/** Clears all items from cart */
	clearCart: () => void
	/** Sets hydration status (internal use) */
	setHasHydrated: (state: boolean) => void
}

/**
 * Combined cart store type.
 */
type CartStore = CartState & CartActions

/**
 * Initial state for cart.
 */
const initialState: CartState = {
	cart: [],
	_hasHydrated: false,
}

/**
 * Zustand shopping cart store with localStorage persistence.
 * 
 * **Store Structure:**
 * - cart: Array of cart items
 * 
 * **Actions:**
 * - addToCart(item): Add/update cart item
 * - removeFromCart(productId): Remove cart item
 * - updateCartQuantity(productId, quantity): Update cart item quantity
 * - clearCart(): Empty cart
 * 
 * **Persistence:**
 * Automatically persists to localStorage under key 'cart-storage'.
 * 
 * @example
 * ```typescript
 * // Add item to cart
 * const { addToCart } = useCartStore();
 * addToCart({
 *   productId: 'prod-123',
 *   quantity: 1,
 *   price: 29.99,
 *   name: 'Product Name'
 * });
 * 
 * // Get cart total
 * const cart = useCartStore(state => state.cart);
 * const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
 * 
 * // Clear after checkout
 * const { clearCart } = useCartStore();
 * clearCart();
 * ```
 */
export const useCartStore = create<CartStore>()(
	persist(
		(set, _get) => ({
			...initialState,

			/**
			 * Sets the hydration status.
			 * Called automatically by persist middleware onRehydrateStorage.
			 */
			setHasHydrated: (state: boolean) => {
				set({ _hasHydrated: state })
			},

			/**
			 * Adds an item to the cart or updates quantity if already exists.
			 * Automatically merges quantities for duplicate product IDs.
			 */
			addToCart: (item) => {
				set((state) => {
					const existingItem = state.cart.find((i) => i.productId === item.productId)
					
					if (existingItem) {
						// Update quantity if item already in cart
						return {
							cart: state.cart.map((i) =>
								i.productId === item.productId
									? { ...i, quantity: i.quantity + item.quantity }
									: i
							),
						}
					}
					
					// Add new item to cart
					return {
						cart: [...state.cart, item],
					}
				})
			},

			/**
			 * Removes an item from the cart by product ID.
			 */
			removeFromCart: (productId) => {
				set((state) => ({
					cart: state.cart.filter((item) => item.productId !== productId),
				}))
			},

			/**
			 * Updates the quantity of a specific cart item.
			 * If quantity is 0 or negative, item is removed.
			 */
			updateCartQuantity: (productId, quantity) => {
				set((state) => {
					// If quantity is 0 or negative, remove the item
					if (quantity <= 0) {
						return {
							cart: state.cart.filter((item) => item.productId !== productId),
						}
					}
					
					// Otherwise, update the quantity
					return {
						cart: state.cart.map((item) =>
							item.productId === productId ? { ...item, quantity } : item
						),
					}
				})
			},

			/**
			 * Clears all items from the cart.
			 * Typically called after successful order submission.
			 */
			clearCart: () => {
				set({ cart: [] })
			},
		}),
		{
			name: 'cart-storage', // localStorage key
			storage: createJSONStorage(() => localStorage),
			// Don't persist hydration status
			partialize: (state) => ({ cart: state.cart }),
			// Track when hydration completes
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true)
			},
		}
	)
)

/**
 * Custom hook to safely access cart state with hydration awareness.
 * 
 * **Why this exists:**
 * Zustand persist middleware hydrates asynchronously from localStorage.
 * During SSR and initial client render, the cart appears empty.
 * This hook provides a clean way to handle this hydration period.
 * 
 * @example
 * ```typescript
 * const { cart, isHydrated } = useHydratedCart()
 * 
 * if (!isHydrated) {
 *   return <CartSkeleton />
 * }
 * 
 * return <CartItems items={cart} />
 * ```
 * 
 * @returns Object with cart items and hydration status
 */
export function useHydratedCart() {
	const cart = useCartStore((state) => state.cart)
	const hasHydrated = useCartStore((state) => state._hasHydrated)
	
	// Also track client-side mount for SSR safety
	const [isClient, setIsClient] = useState(false)
	
	useEffect(() => {
		setIsClient(true)
	}, [])
	
	return {
		cart: isClient && hasHydrated ? cart : [],
		isHydrated: isClient && hasHydrated,
		// For cart count display - returns 0 if not hydrated
		itemCount: isClient && hasHydrated 
			? cart.reduce((sum, item) => sum + item.quantity, 0) 
			: 0,
	}
}

