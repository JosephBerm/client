/**
 * CustomerDetailSkeleton Component
 * 
 * Loading skeleton for customer detail page.
 * Provides visual feedback while data is being fetched.
 * 
 * **Skeleton Sections:**
 * - Overview card placeholder
 * - Stats card placeholder
 * - Quick actions placeholder
 * - Form placeholder
 * 
 * @module customers/components
 */

'use client'

/**
 * CustomerDetailSkeleton - Loading state placeholder.
 * Uses DaisyUI skeleton classes for consistent styling.
 */
export function CustomerDetailSkeleton() {
	return (
		<div className="space-y-6 animate-pulse">
			{/* Overview Card Skeleton */}
			<div className="card bg-base-100 border border-base-300 shadow-sm">
				<div className="card-body p-4 sm:p-6">
					<div className="flex gap-4">
						{/* Icon placeholder */}
						<div className="hidden sm:block w-16 h-16 rounded-xl bg-base-300" />
						
						{/* Content placeholder */}
						<div className="flex-1 space-y-3">
							<div className="h-6 w-48 bg-base-300 rounded" />
							<div className="flex gap-2">
								<div className="h-5 w-20 bg-base-300 rounded" />
								<div className="h-5 w-24 bg-base-300 rounded" />
							</div>
						</div>
					</div>
					
					{/* Sales rep section skeleton */}
					<div className="mt-4 pt-4 border-t border-base-300">
						<div className="h-5 w-64 bg-base-300 rounded" />
					</div>
				</div>
			</div>

			{/* Stats Card Skeleton */}
			<div className="card bg-base-100 border border-base-300 shadow-sm">
				<div className="card-body p-4 sm:p-6">
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="space-y-2">
								<div className="h-4 w-16 bg-base-300 rounded" />
								<div className="h-8 w-12 bg-base-300 rounded" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Quick Actions Skeleton */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-20 bg-base-100 border border-base-300 rounded-lg"
					/>
				))}
			</div>

			{/* Form Section Skeleton */}
			<div className="card bg-base-100 border border-base-300 shadow-sm">
				<div className="card-body p-4 sm:p-6">
					<div className="h-6 w-32 bg-base-300 rounded mb-4" />
					<div className="space-y-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-12 bg-base-300 rounded" />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default CustomerDetailSkeleton

