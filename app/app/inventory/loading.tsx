/**
 * Inventory Page Loading State
 *
 * Displays skeleton UI while the inventory page is loading.
 */

export default function InventoryLoading() {
	return (
		<div className='animate-pulse'>
			{/* Header Skeleton */}
			<div className='mb-8'>
				<div className='h-8 w-48 bg-base-300 rounded mb-2' />
				<div className='h-4 w-96 bg-base-300 rounded' />
			</div>

			{/* Stats Cards Skeleton */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8'>
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className='border border-base-300 bg-base-100 p-4 rounded-lg shadow-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<div className='h-4 w-24 bg-base-300 rounded mb-2' />
								<div className='h-8 w-16 bg-base-300 rounded' />
							</div>
							<div className='h-12 w-12 bg-base-300 rounded-lg' />
						</div>
					</div>
				))}
			</div>

			{/* Tabs Skeleton */}
			<div className='flex gap-4 mb-6'>
				<div className='h-10 w-32 bg-base-300 rounded' />
				<div className='h-10 w-24 bg-base-300 rounded' />
				<div className='h-10 w-28 bg-base-300 rounded' />
			</div>

			{/* Table Skeleton */}
			<div className='border border-base-300 bg-base-100 rounded-lg shadow-sm'>
				<div className='p-4 border-b border-base-300'>
					<div className='flex gap-4'>
						<div className='flex-1 h-10 bg-base-300 rounded' />
						<div className='h-10 w-32 bg-base-300 rounded' />
					</div>
				</div>
				<div className='p-4 space-y-4'>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className='h-16 bg-base-300 rounded'
						/>
					))}
				</div>
			</div>
		</div>
	)
}
