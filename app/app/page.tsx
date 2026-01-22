'use client'

/**
 * Customer Dashboard Page
 *
 * MAANG-level architecture using shared hooks and components:
 * - useRecentItems: SWR-pattern hook with caching, deduplication, revalidation
 * - RecentActivitySection: Reusable component for recent orders/quotes display
 * - AccountOverview: Customer account statistics
 *
 * **Architecture Notes:**
 * - Follows DRY principle by reusing dashboard components
 * - Uses TanStack-style caching via useFetchWithCache
 * - No manual useEffect data fetching
 * - React 19 compliant (no manual memoization)
 *
 * @see prd_dashboard.md
 * @module app/page
 */

import AccountOverview from '@_components/dashboard/AccountOverview'

import { InternalPageHeader } from './_components'
import {
	RecentActivitySection,
	useRecentItems,
} from './dashboard/_components'

export default function Page() {
	// =========================================================================
	// DATA FETCHING
	// Uses SWR-pattern hook with built-in caching, deduplication, revalidation
	// @see useRecentItems for implementation details
	// =========================================================================
	const { recentOrders, recentQuotes, isLoading } = useRecentItems(5)

	return (
		<div className="w-full min-w-0">
			<InternalPageHeader
				title="Dashboard"
				description="Monitor recent activity, manage your account, and review the latest quotes and orders."
			/>

			{/* Dashboard Content - MAANG-level mobile-first spacing */}
			<div className="space-y-5 sm:space-y-6 md:space-y-8 w-full min-w-0">
				{/* Account Overview Section */}
				<div className="w-full min-w-0 overflow-hidden" data-testid="stats-section">
					<AccountOverview />
				</div>

				{/* Recent Activity Section - Reusable component with proper loading states */}
				<div className="w-full min-w-0 overflow-hidden" data-testid="recent-activity">
					{isLoading ? (
						<RecentActivitySkeleton />
					) : (
						<RecentActivitySection orders={recentOrders} quotes={recentQuotes} />
					)}
				</div>
			</div>
		</div>
	)
}

/**
 * Inline skeleton for recent activity section.
 * Matches the RecentActivitySection layout during loading.
 */
function RecentActivitySkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<TableCardSkeleton title="Recent Orders" />
			<TableCardSkeleton title="Recent Quotes" />
		</div>
	)
}

/**
 * Table card skeleton for loading state.
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

