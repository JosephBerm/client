/**
 * Analytics Page Loading State
 *
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 *
 * Matches the Analytics page layout:
 * - Page header with "Analytics Dashboard" title and date picker
 * - Primary KPIs (5 cards)
 * - Secondary KPIs (3 cards)
 * - Charts section (2/3 + 1/3 layout)
 * - Team leaderboard table
 *
 * @module app/analytics/loading
 */

import { InternalPageHeader } from '../_components'

/**
 * KPICardSkeleton - Individual KPI card loading skeleton
 */
function KPICardSkeleton() {
	return (
		<div className="rounded-xl border border-base-300 bg-base-100/80 p-6 shadow-sm">
			<div className="flex items-start justify-between">
				<div className="flex-1 space-y-2">
					{/* Label skeleton */}
					<div className="h-4 w-24 bg-base-300 rounded motion-safe:animate-pulse" />
					{/* Value skeleton */}
					<div className="h-8 w-32 bg-base-300 rounded motion-safe:animate-pulse" />
					{/* Trend skeleton */}
					<div className="h-3 w-20 bg-base-300 rounded motion-safe:animate-pulse" />
				</div>
				{/* Icon skeleton */}
				<div className="h-10 w-10 bg-base-300 rounded-xl motion-safe:animate-pulse" />
			</div>
		</div>
	)
}

/**
 * ChartSkeleton - Chart placeholder loading skeleton
 */
function ChartSkeleton({ className = '' }: { className?: string }) {
	return (
		<div className={`rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm ${className}`}>
			{/* Chart title skeleton */}
			<div className="h-6 w-32 bg-base-300 rounded motion-safe:animate-pulse mb-4" />
			{/* Chart area skeleton */}
			<div className="h-64 bg-base-200 rounded-lg motion-safe:animate-pulse" />
		</div>
	)
}

/**
 * DatePickerSkeleton - Date range picker placeholder
 */
function DatePickerSkeleton() {
	return (
		<div className="h-10 w-48 bg-base-200 rounded-lg motion-safe:animate-pulse" />
	)
}

/**
 * LeaderboardSkeleton - Team leaderboard table skeleton
 */
function LeaderboardSkeleton() {
	return (
		<div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
			{/* Title skeleton */}
			<div className="h-6 w-48 bg-base-300 rounded motion-safe:animate-pulse mb-4" />
			{/* Rows skeleton */}
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="flex items-center gap-4 py-2">
						{/* Avatar skeleton */}
						<div className="h-8 w-8 bg-base-300 rounded-full motion-safe:animate-pulse" />
						{/* Name skeleton */}
						<div className="h-4 w-32 bg-base-300 rounded motion-safe:animate-pulse" />
						{/* Value skeleton */}
						<div className="h-4 w-20 bg-base-300 rounded motion-safe:animate-pulse ml-auto" />
					</div>
				))}
			</div>
		</div>
	)
}

export default function AnalyticsLoading() {
	return (
		<>
			<InternalPageHeader
				title="Analytics Dashboard"
				description="Business intelligence and team performance metrics."
				loading
				actions={<DatePickerSkeleton />}
			/>

			<main className="space-y-6" role="status" aria-label="Loading analytics dashboard">
				{/* Primary KPIs - 5 cards */}
				<section>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
						{Array.from({ length: 5 }).map((_, i) => (
							<KPICardSkeleton key={i} />
						))}
					</div>
				</section>

				{/* Secondary KPIs - 3 cards */}
				<section>
					<div className="grid gap-4 md:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<KPICardSkeleton key={i} />
						))}
					</div>
				</section>

				{/* Charts - 2/3 + 1/3 */}
				<section>
					<div className="grid gap-6 lg:grid-cols-3">
						<ChartSkeleton className="lg:col-span-2" />
						<ChartSkeleton />
					</div>
				</section>

				{/* Team Leaderboard */}
				<section>
					<LeaderboardSkeleton />
				</section>
			</main>
		</>
	)
}
