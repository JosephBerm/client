'use client'

import AccountOverview from '@_components/dashboard/AccountOverview'
import ClientPageLayout from '@_components/layouts/ClientPageLayout'
import AccountOrdersTable from '@_components/tables/AccountOrdersTable'
import AccountQuotesTable from '@_components/tables/AccountQuotesTable'

const Page = () => {
	return (
		<ClientPageLayout
			title="Dashboard"
			description="Monitor recent activity, manage your account, and review the latest quotes and orders."
			maxWidth="full"
		>
			<div className="space-y-8">
				<AccountOverview />

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<AccountQuotesTable />
					<AccountOrdersTable />
				</div>
			</div>
		</ClientPageLayout>
	)
}

export default Page
