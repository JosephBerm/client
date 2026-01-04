/**
 * Dashboard Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Dashboard page layout:
 * - Page header with title
 * - Account overview (stats grid)
 * - Two tables side by side (quotes & orders)
 *
 * @module app/loading
 */

import { StatsGridSkeleton } from '@_components/skeletons'
import { InternalPageHeader } from './_components'

/**
 * TableCardSkeleton - Mini table card loading skeleton for dashboard tables.
 * Used for AccountQuotesTable and AccountOrdersTable placeholders.
 */
function TableCardSkeleton() {
	return (
		<div className="card bg-base-100 border border-base-300 shadow-lg p-6">
			{/* Table header skeleton */}
			<div className="h-6 w-32 bg-base-300 rounded motion-safe:animate-pulse mb-4" />
			{/* Table rows skeleton */}
			<div className="space-y-3">
				{[1, 2, 3].map((j) => (
					<div key={j} className="flex items-center gap-4 py-2">
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
				<div className="w-full min-w-0 overflow-hidden">
					<StatsGridSkeleton count={4} className="mb-0" />
				</div>

				{/* Tables Section - 2 tables side by side */}
				<div
					className="grid grid-cols-1 gap-6 sm:gap-6 lg:grid-cols-2 w-full min-w-0 overflow-hidden"
					role="status"
					aria-label="Loading recent activity tables"
				>
					<div className="w-full min-w-0 overflow-hidden">
						<TableCardSkeleton />
					</div>
					<div className="w-full min-w-0 overflow-hidden">
						<TableCardSkeleton />
					</div>
				</div>
			</div>
		</div>
	)
}
