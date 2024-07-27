import React, { useState, useEffect } from 'react'
import AccountOrdersTable from '@/components/AccountOrdersTable'
import IsBusyLoading from '@/components/isBusyLoading'

function CustomerOrdersPage() {
	const [isLoading, setIsLoading] = useState<boolean>(false)

	return (
		<div className='customer'>
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

export default CustomerOrdersPage
