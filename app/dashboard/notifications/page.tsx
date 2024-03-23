'use client'

import React, { useState, useEffect } from 'react'
import { useAccountStore } from '@/src/stores/user'

function Page() {
	const user = useAccountStore((state) => state.User)
	console.log(user)
	return (
		<div>
			<h2>hello world</h2>
		</div>
	)
}

export default Page
