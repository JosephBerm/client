'use client'

import AccountOverview from '@_components/dashboard/AccountOverview'
import AccountOrdersTable from '@_components/tables/AccountOrdersTable'
import AccountQuotesTable from '@_components/tables/AccountQuotesTable'
import { InternalPageHeader } from './_components'

const Page = () => {
	return (
		<div className="w-full min-w-0">
			<InternalPageHeader
				title="Dashboard"
				description="Monitor recent activity, manage your account, and review the latest quotes and orders."
			/>

			{/* Dashboard Content - FAANG-level mobile-first spacing */}
			<div className="space-y-5 sm:space-y-6 md:space-y-8 w-full min-w-0">
				{/* Account Overview Section */}
				<div className="w-full min-w-0 overflow-hidden">
					<AccountOverview />
				</div>

				{/* Tables Section - Responsive grid layout */}
				<div className="grid grid-cols-1 gap-6 sm:gap-6 lg:grid-cols-2 w-full min-w-0 overflow-hidden">
					<div className="w-full min-w-0 overflow-hidden">
						<AccountQuotesTable />
					</div>
					<div className="w-full min-w-0 overflow-hidden">
						<AccountOrdersTable />
					</div>
				</div>
			</div>
		</div>
	)
}

export default Page

