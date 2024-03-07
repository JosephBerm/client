'use client'

import React, { useState } from 'react'
import InputTextBox from '@/components/InputTextBox'
import { useAccountStore } from '@/src/stores/user'

const Page = () => {

	const User = useAccountStore(state => state.User);

	return (
		<>
			<h1>Welcome {User.username}</h1>
		</>
	)
}

export default Page
