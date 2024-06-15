'use client'
import React, { useEffect, useState } from 'react'
import { useAccountStore } from '@/src/stores/user'
import { TableColumn } from '@/interfaces/Table'
import { toast } from 'react-toastify'

import Link from 'next/link'
import Routes from '@/services/routes'

import API from '@/services/api'

function AccountOrdersTable() {
	const User = useAccountStore((state) => state.User)
	const [isLoadingData, setIsLoadingData] = useState<boolean>(false)

	useEffect(() => {}, [])

	return <div className='recent-orders-table'></div>
}

export default AccountOrdersTable
