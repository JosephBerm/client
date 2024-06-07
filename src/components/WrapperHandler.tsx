'use client'
import { IUser } from '@/classes/User'
import { useAccountStore } from '@/src/stores/user'
import { useEffect } from 'react'

import React from 'react'

const WrapperHandler = ({ User }: { User: IUser }) => {
	const AccountInformation = useAccountStore((state) => state)
	
	useEffect(() => {
		if(User.id != null) {
			if	(!AccountInformation.LoggedIn) AccountInformation.login(User)
			else AccountInformation.setUser(User)
		}
	}, [])

	return <></>
}

export default WrapperHandler
