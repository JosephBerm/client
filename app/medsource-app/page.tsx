'use client'

import '@/styles/pages/dashboard.css'
import AccountOverview from '@/src/components/AccountOverview'
import AccountOrdersTable from '@/src/components/AccountOrdersTable'
import AccountQuotesTable from '@/src/components/AccountQuotesTable'

const Page = () => {
	return (
		<div className='Dashboard page-container'>
			<AccountOverview />
			<AccountQuotesTable />
			<AccountOrdersTable />
		</div>
	)
}

export default Page
