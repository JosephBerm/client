'use client'

/**
 * DashboardSkeleton Component
 *
 * Loading skeleton for the dashboard while data is being fetched.
 * Uses DaisyUI skeleton animations.
 *
 * @module dashboard/DashboardSkeleton
 */

export function DashboardSkeleton() {
	return (
		<div className="container mx-auto p-6 space-y-6 animate-pulse">
			{/* Welcome Header Skeleton */}
			<div className="h-8 w-64 bg-base-300 rounded-lg" />

			{/* Stats Row Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="card bg-base-100 border border-base-300 shadow-lg p-5"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1 space-y-2">
								<div className="h-4 w-24 bg-base-300 rounded" />
								<div className="h-8 w-16 bg-base-300 rounded" />
								<div className="h-3 w-20 bg-base-300 rounded" />
							</div>
							<div className="w-12 h-12 bg-base-300 rounded-xl" />
						</div>
					</div>
				))}
			</div>

			{/* Tasks & Quick Actions Row Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Tasks Skeleton */}
				<div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-lg p-6">
					<div className="h-6 w-32 bg-base-300 rounded mb-4" />
					<div className="space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="flex items-start gap-3 p-3 bg-base-200/50 rounded-xl"
							>
								<div className="w-5 h-5 bg-base-300 rounded-full" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-3/4 bg-base-300 rounded" />
									<div className="h-3 w-1/2 bg-base-300 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Quick Actions Skeleton */}
				<div className="card bg-base-100 border border-base-300 shadow-lg p-6">
					<div className="h-6 w-28 bg-base-300 rounded mb-4" />
					<div className="flex flex-wrap gap-2">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-10 w-24 bg-base-300 rounded-lg" />
						))}
					</div>
				</div>
			</div>

			{/* Recent Items Row Skeleton */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{[1, 2].map((i) => (
					<div
						key={i}
						className="card bg-base-100 border border-base-300 shadow-lg p-6"
					>
						<div className="h-6 w-32 bg-base-300 rounded mb-4" />
						<div className="space-y-3">
							{[1, 2, 3].map((j) => (
								<div key={j} className="flex items-center gap-4 py-2">
									<div className="h-4 w-20 bg-base-300 rounded" />
									<div className="h-4 w-24 bg-base-300 rounded" />
									<div className="h-5 w-16 bg-base-300 rounded-full" />
									<div className="h-4 w-16 bg-base-300 rounded ml-auto" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default DashboardSkeleton

