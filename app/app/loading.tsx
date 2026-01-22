/**
 * Dashboard Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Dashboard page layout:
 * - Page header with title
 * - Account overview (stats grid)
 * - Recent activity section (orders & quotes tables)
 *
 * @module app/loading
 */

import { StatsGridSkeleton } from '@_components/skeletons'

import { InternalPageHeader } from './_components'

/**
 * TableCardSkeleton - Mini table card loading skeleton for dashboard tables.
 * Matches the RecentItemsTable component structure.
 */
function TableCardSkeleton({ title }: { title: string }) {
	return (
		<div className="card bg-base-100 border border-base-300 shadow-lg p-6 h-full">
			<h3 className="font-semibold text-lg text-base-content mb-4">{title}</h3>
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex items-center gap-4 py-2">
						<div className="h-4 w-20 bg-base-300 rounded motion-safe:animate-pulse" />
						<div className="h-4 w-24 bg-base-300 rounded motion-safe:animate-pulse" />
						<div className="h-5 w-16 bg-base-300 rounded-full motion-safe:animate-pulse" />
						<div className="h-4 w-16 bg-base-300 rounded motion-safe:animate-pulse ml-auto" />
					</div>
				))}
			</div>
		</div>
	)
}

export default function DashboardLoading() {
	return (
		<div className="w-full min-w-0">
			<InternalPageHeader
				title="Dashboard"
				description="Monitor recent activity, manage your account, and review the latest quotes and orders."
				loading
			/>

			{/* Dashboard Content - matches page.tsx layout */}
			<div className="space-y-5 sm:space-y-6 md:space-y-8 w-full min-w-0">
				{/* Account Overview Section - reuse StatsGridSkeleton for DRY */}
				<div className="w-full min-w-0 overflow-hidden" data-testid="stats-section">
					<StatsGridSkeleton count={4} className="mb-0" />
				</div>

				{/* Recent Activity Section - matches RecentActivitySection layout */}
				<div
					className="w-full min-w-0 overflow-hidden"
					data-testid="recent-activity"
					role="status"
					aria-label="Loading recent activity"
				>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<TableCardSkeleton title="Recent Orders" />
						<TableCardSkeleton title="Recent Quotes" />
					</div>
				</div>
			</div>
		</div>
	)
}
