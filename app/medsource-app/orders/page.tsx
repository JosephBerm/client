'use client'

import React, { useState, useEffect } from 'react'
import { useAccountStore } from '@/src/stores/user'
import '@/styles/App/orderPage.css'

import { AccountRole } from '@/classes/Enums'

import AdminOrdersPage from '@/components/Orders/AdminOrdersPage'
import CustomerOrdersPage from '@/components/Orders/CustomerOrdersPage'
import AdminView from '@/components/Orders/AdminView'

const Page = () => {
	const User = useAccountStore((state) => state.User)
	const isAdmin = User.role == AccountRole.Admin

	function getPageComponent() {
		if (isAdmin) return <AdminView />
		return <CustomerOrdersPage />
	}
	return <div className='Orders page-container'>{getPageComponent()}</div>
}

export default Page
