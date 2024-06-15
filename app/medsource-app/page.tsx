'use client'

import '@/styles/dashboard.css'
import AccountOverview from '@/src/components/AccountOverview'
import AccountOrdersTable from '@/src/components/AccountOrdersTable'

const Page = () => {
	return (
		<div className='Dashboard page-container'>
			<AccountOverview />
			<AccountOrdersTable />
		</div>
	)
}

export default Page
