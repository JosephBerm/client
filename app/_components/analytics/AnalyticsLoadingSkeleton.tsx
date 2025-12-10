/**
 * AnalyticsLoadingSkeleton Component
 * 
 * Loading skeleton components for analytics dashboard.
 * Provides visual feedback during data fetching.
 * 
 * @module components/analytics/AnalyticsLoadingSkeleton
 */

/**
 * Loading skeleton for summary cards.
 */
export function SummaryCardSkeleton() {
	return (
		<div className="rounded-xl border border-base-300 bg-base-100/80 p-6 shadow-sm animate-pulse">
			<div className="h-4 w-24 bg-base-300 rounded mb-3"></div>
			<div className="h-8 w-32 bg-base-300 rounded mb-2"></div>
			<div className="h-3 w-20 bg-base-300 rounded"></div>
		</div>
	)
}

/**
 * Loading skeleton for detailed metrics section.
 */
export function DetailedMetricsSkeleton() {
	return (
		<section className="grid gap-6 lg:grid-cols-3">
			<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm lg:col-span-2">
				<div className="h-6 w-32 bg-base-300 rounded mb-4 animate-pulse"></div>
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="rounded-lg border border-base-200 p-4">
							<div className="h-3 w-24 bg-base-300 rounded mb-2 animate-pulse"></div>
							<div className="h-6 w-20 bg-base-300 rounded animate-pulse"></div>
						</div>
					))}
				</div>
			</div>
			<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
				<div className="h-6 w-32 bg-base-300 rounded mb-4 animate-pulse"></div>
				<div className="mt-4 space-y-4">
					{Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="rounded-lg border border-base-200 p-4">
							<div className="h-3 w-32 bg-base-300 rounded mb-2 animate-pulse"></div>
							<div className="h-6 w-16 bg-base-300 rounded animate-pulse"></div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
