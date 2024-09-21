'use client'
import { IUser } from '@/classes/User'
import { useEffect } from 'react'

import React from 'react'
import { useCartStore } from '@/src/stores/store'
import { useAccountStore } from '@/src/stores/user'

const WrapperHandlerPublic = ({ User }: { User?: IUser }) => {
	const AccountInformation = useAccountStore((state) => state)
	const Cart = useCartStore((state) => state)

	useEffect(() => {
		const itemsInLocalStorage = localStorage.getItem('cart')

		if (itemsInLocalStorage) Cart.setCart(JSON.parse(itemsInLocalStorage))
	}, [])

	useEffect(() => {
		console.log("AAM i here")

		if(User?.id != null) {
			if	(!AccountInformation.LoggedIn) AccountInformation.login(User)
			else AccountInformation.setUser(User)
		}
	}, [User])

	return <></>
}

export default WrapperHandlerPublic
