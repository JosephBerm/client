'use client'
import { IUser } from '@/classes/User'
import { useEffect } from 'react'

import React from 'react'
import { useCartStore } from '@/src/stores/store'

const WrapperHandlerPublic = () => {
	const Cart = useCartStore((state) => state)

	useEffect(() => {
		const itemsInLocalStorage = localStorage.getItem('cart')

		if (itemsInLocalStorage) Cart.setCart(JSON.parse(itemsInLocalStorage))
	}, [])

	return <></>
}

export default WrapperHandlerPublic
