'use client'

// TODO: Migrate AccountOverview component
// import AccountOverview from '@/components/AccountOverview'
import AccountOrdersTable from '@_components/tables/AccountOrdersTable'
import AccountQuotesTable from '@_components/tables/AccountQuotesTable'

const Page = () => {
	return (
		<div className='min-h-screen bg-base-200 p-4 md:p-8'>
			<div className='container mx-auto space-y-6'>
				{/* TODO: Restore AccountOverview */}
				<div className="alert alert-info">
					<span>Dashboard Overview - TODO: Migrate AccountOverview component</span>
				</div>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					<AccountQuotesTable />
					<AccountOrdersTable />
				</div>
			</div>
		</div>
	)
}

export default Page
