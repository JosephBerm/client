'use client'

import { useEffect } from 'react'
import { useCartStore } from '@_stores/store'

/**
 * Component that initializes cart state from localStorage on app mount
 * Should be placed in the root layout
 */
export default function CartInitializer() {
	const setCart = useCartStore((state) => state.setCart)

	useEffect(() => {
		const itemsInLocalStorage = localStorage.getItem('cart')
		if (itemsInLocalStorage) {
			try {
				const cart = JSON.parse(itemsInLocalStorage)
				setCart(cart)
			} catch (error) {
				console.error('Failed to parse cart from localStorage:', error)
				localStorage.removeItem('cart')
			}
		}
	}, [setCart])

	return null
}

