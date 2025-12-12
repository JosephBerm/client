/**
 * @fileoverview Store Page Loading Skeleton
 * 
 * Skeleton loading state for the store page.
 * Used as Suspense fallback during server-side data fetching.
 * 
 * @module components/store/StoreSkeleton
 * @category Components
 */

'use client'

/**
 * Store page loading skeleton
 * 
 * Displays a skeleton UI matching the store page layout:
 * - Header skeleton
 * - Toolbar skeleton (search, filters)
 * - Product grid skeleton
 * 
 * @component
 */
export function StoreSkeleton() {
	return (
		<div className="min-h-screen w-full animate-pulse">
			{/* Header Skeleton */}
			<div className="bg-base-200 py-8">
				<div className="container mx-auto px-4 md:px-8 max-w-screen-2xl">
					<div className="h-8 w-64 bg-base-300 rounded mb-4" />
					<div className="h-4 w-96 bg-base-300 rounded" />
				</div>
			</div>

			{/* Toolbar Skeleton */}
			<div className="sticky z-20 border-b border-base-300 bg-base-100 py-4">
				<div className="container mx-auto px-4 md:px-8 max-w-screen-2xl">
					<div className="flex flex-wrap gap-4 items-center justify-between">
						{/* Search bar skeleton */}
						<div className="h-10 w-64 bg-base-200 rounded" />
						{/* Sort/filter skeleton */}
						<div className="flex gap-2">
							<div className="h-10 w-32 bg-base-200 rounded" />
							<div className="h-10 w-24 bg-base-200 rounded" />
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Skeleton */}
			<div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-screen-2xl">
				<div className="flex flex-col gap-6 lg:flex-row">
					{/* Sidebar Skeleton */}
					<div className="w-full lg:w-64 shrink-0">
						<div className="bg-base-100 rounded-lg p-4 shadow">
							<div className="h-6 w-24 bg-base-200 rounded mb-4" />
							<div className="space-y-2">
								{[1, 2, 3, 4, 5].map((i) => (
									<div key={i} className="h-8 bg-base-200 rounded" />
								))}
							</div>
						</div>
					</div>

					{/* Product Grid Skeleton */}
					<div className="flex-1">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
								<div
									key={i}
									className="bg-base-100 rounded-lg shadow overflow-hidden"
								>
									{/* Image skeleton */}
									<div className="aspect-square bg-base-200" />
									{/* Content skeleton */}
									<div className="p-4 space-y-2">
										<div className="h-4 w-3/4 bg-base-200 rounded" />
										<div className="h-4 w-1/2 bg-base-200 rounded" />
										<div className="h-6 w-1/3 bg-base-200 rounded" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StoreSkeleton

