'use client'
import { IUser } from '@/classes/User'
import { useAccountStore } from '@/src/stores/user'
import { useEffect } from 'react'

import React from 'react'

const WrapperHandler = ({ User }: { User: IUser }) => {
	const AccountInformation = useAccountStore((state) => state)
	useEffect(() => {
		AccountInformation.setUser(User)
	}, [User])

	return <></>
}

export default WrapperHandler
