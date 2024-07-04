'use client'

import React, { useState, useEffect } from 'react'
import AccountOrdersTable from '@/src/components/AccountOrdersTable'
import IsBusyLoading from '@/components/isBusyLoading'
import '@/styles/App/orderPage.css'

const Page = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false)

	return (
		<div className='Orders page-container'>
			<h2 className='page-title'>Track Your Orders</h2>
			<IsBusyLoading isBusy={isLoading} />
			{!isLoading && (
				<div className='orders-table'>
					<AccountOrdersTable />
				</div>
			)}
		</div>
	)
}

export default Page
