'use client'

import { useAccountStore } from '@/src/stores/user'
import Table from '@/common/table'
import Quote from '@/classes/Quote'
import '@/styles/dashboard.css'
import AccountOverview from '@/src/components/AccountOverview'
import AccountProductsTable from '@/src/components/AccountProductsTable'

const Page = () => {
	const User = useAccountStore((state) => state.User)

	return (
		<div className='Dashboard page-container'>
			<AccountOverview />
			<AccountProductsTable />
		</div>
	)
}

export default Page
