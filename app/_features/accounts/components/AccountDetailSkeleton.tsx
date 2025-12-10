/**
 * AccountDetailSkeleton Component
 * 
 * Skeleton loading state for the account detail page.
 * Provides visual feedback while account data is being fetched.
 * 
 * **Features:**
 * - Matches layout of actual content
 * - Animated pulse effect
 * - Responsive design
 * - Accessible (aria-hidden from screen readers)
 * 
 * @module features/accounts/components/AccountDetailSkeleton
 */

'use client'

import Card from '@_components/ui/Card'

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/** Animated skeleton line */
function SkeletonLine({ width = 'full', height = 'h-4' }: { width?: string; height?: string }) {
	return (
		<div 
			className={`${height} bg-base-300 rounded animate-pulse`}
			style={{ width: width === 'full' ? '100%' : width }}
		/>
	)
}

/** Skeleton for a card section */
function SkeletonCard({ children }: { children: React.ReactNode }) {
	return (
		<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
			{children}
		</Card>
	)
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AccountDetailSkeleton Component
 * 
 * Displays a skeleton loading state that mirrors the account detail layout.
 */
export default function AccountDetailSkeleton() {
	return (
		<div className="space-y-6" aria-hidden="true">
			{/* Tab Skeleton */}
			<div className="flex gap-2 border-b border-base-300 pb-2">
				<div className="h-10 w-24 bg-base-300 rounded animate-pulse" />
				<div className="h-10 w-24 bg-base-300 rounded animate-pulse" />
				<div className="h-10 w-24 bg-base-300 rounded animate-pulse" />
			</div>

			{/* Content Skeleton */}
			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				{/* Main Content */}
				<div className="space-y-6">
					{/* Profile Form Skeleton */}
					<SkeletonCard>
						{/* Header badges */}
						<div className="mb-6 flex flex-wrap items-center gap-3">
							<div className="h-6 w-20 bg-base-300 rounded-full animate-pulse" />
							<div className="h-6 w-16 bg-base-300 rounded-full animate-pulse" />
							<div className="h-4 w-24 bg-base-300 rounded animate-pulse" />
						</div>

						{/* Form fields */}
						<div className="space-y-4">
							{/* Name row */}
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<SkeletonLine width="60px" height="h-3" />
									<div className="mt-2">
										<SkeletonLine height="h-10" />
									</div>
								</div>
								<div>
									<SkeletonLine width="60px" height="h-3" />
									<div className="mt-2">
										<SkeletonLine height="h-10" />
									</div>
								</div>
								<div>
									<SkeletonLine width="60px" height="h-3" />
									<div className="mt-2">
										<SkeletonLine height="h-10" />
									</div>
								</div>
							</div>

							{/* Email row */}
							<div>
								<SkeletonLine width="40px" height="h-3" />
								<div className="mt-2">
									<SkeletonLine height="h-10" />
								</div>
							</div>

							{/* Phone row */}
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<SkeletonLine width="50px" height="h-3" />
									<div className="mt-2">
										<SkeletonLine height="h-10" />
									</div>
								</div>
								<div>
									<SkeletonLine width="50px" height="h-3" />
									<div className="mt-2">
										<SkeletonLine height="h-10" />
									</div>
								</div>
							</div>

							{/* Submit button */}
							<div className="pt-4">
								<div className="h-10 w-32 bg-base-300 rounded animate-pulse" />
							</div>
						</div>
					</SkeletonCard>
				</div>

				{/* Sidebar */}
				<div className="space-y-4">
					{/* Account Details */}
					<SkeletonCard>
						<div className="flex items-center justify-between mb-4">
							<SkeletonLine width="120px" height="h-5" />
						</div>
						<div className="space-y-3">
							<div className="flex justify-between">
								<SkeletonLine width="40px" height="h-4" />
								<SkeletonLine width="140px" height="h-4" />
							</div>
							<div className="flex justify-between">
								<SkeletonLine width="60px" height="h-4" />
								<SkeletonLine width="100px" height="h-4" />
							</div>
							<div className="flex justify-between">
								<SkeletonLine width="40px" height="h-4" />
								<SkeletonLine width="90px" height="h-4" />
							</div>
							<div className="flex justify-between">
								<SkeletonLine width="80px" height="h-4" />
								<SkeletonLine width="80px" height="h-4" />
							</div>
						</div>
					</SkeletonCard>

					{/* Status Card */}
					<SkeletonCard>
						<SkeletonLine width="100px" height="h-5" />
						<div className="mt-1">
							<SkeletonLine width="180px" height="h-3" />
						</div>
						<div className="mt-4">
							<SkeletonLine width="50px" height="h-3" />
							<div className="mt-2">
								<SkeletonLine height="h-9" />
							</div>
						</div>
					</SkeletonCard>

					{/* Activity Summary */}
					<SkeletonCard>
						<SkeletonLine width="130px" height="h-5" />
						<div className="mt-4 grid grid-cols-2 gap-4">
							<div className="flex flex-col items-center rounded-lg border border-base-300 bg-base-200/50 p-4">
								<div className="h-8 w-10 bg-base-300 rounded animate-pulse" />
								<div className="mt-2 h-3 w-12 bg-base-300 rounded animate-pulse" />
							</div>
							<div className="flex flex-col items-center rounded-lg border border-base-300 bg-base-200/50 p-4">
								<div className="h-8 w-10 bg-base-300 rounded animate-pulse" />
								<div className="mt-2 h-3 w-12 bg-base-300 rounded animate-pulse" />
							</div>
						</div>
					</SkeletonCard>

					{/* Quick Actions */}
					<SkeletonCard>
						<SkeletonLine width="100px" height="h-5" />
						<div className="mt-4 flex flex-col gap-3">
							<div className="h-10 bg-base-300 rounded animate-pulse" />
							<div className="h-10 bg-base-300 rounded animate-pulse" />
						</div>
					</SkeletonCard>
				</div>
			</div>
		</div>
	)
}
