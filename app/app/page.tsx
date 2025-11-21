'use client'

import AccountOverview from '@_components/dashboard/AccountOverview'
import AccountOrdersTable from '@_components/tables/AccountOrdersTable'
import AccountQuotesTable from '@_components/tables/AccountQuotesTable'
import { InternalPageHeader } from './_components'

const Page = () => {
	return (
		<>
			<InternalPageHeader
				title="Dashboard"
				description="Monitor recent activity, manage your account, and review the latest quotes and orders."
			/>

			<div className="space-y-8">
				<AccountOverview />

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<AccountQuotesTable />
					<AccountOrdersTable />
				</div>
			</div>
		</>
	)
}

export default Page

