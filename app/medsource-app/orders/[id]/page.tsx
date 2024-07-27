'use client'

import CustomerOrder from '@/src/components/Orders/CustomerOrder'
import AdminOrder from '@/src/components/Orders/AdminOrder'
import React, { useState, useEffect } from 'react'
import { useAccountStore } from '@/src/stores/user'
import { AccountRole } from '@/classes/Enums'

const Page = (context: any) => {
	const User = useAccountStore((state) => state.User)
	const isAdmin = User.role == AccountRole.Admin
	console.log('isAdmin', isAdmin)
	if (isAdmin) return <AdminOrder {...context} />
	else return <CustomerOrder {...context} />
}

export default Page
