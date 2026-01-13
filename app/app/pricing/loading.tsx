/**
 * Pricing Loading State
 *
 * Skeleton loading UI displayed while the pricing page is loading.
 * Follows the same pattern as other admin pages.
 *
 * @module app/pricing/loading
 */

import Card from '@_components/ui/Card'

export default function PricingLoading() {
	return (
		<div className="animate-pulse">
			{/* Header Skeleton */}
			<div className="mb-8">
				<div className="h-8 w-48 bg-base-300 rounded mb-2" />
				<div className="h-4 w-96 bg-base-200 rounded" />
			</div>

			{/* Stats Cards Skeleton */}
			<div className="grid gap-4 md:grid-cols-4 mb-8">
				{[...Array(4)].map((_, i) => (
					<Card key={i} className="border border-base-300 bg-base-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-base-300 rounded-lg" />
							<div className="flex-1">
								<div className="h-4 w-16 bg-base-300 rounded mb-2" />
								<div className="h-6 w-12 bg-base-200 rounded" />
							</div>
						</div>
					</Card>
				))}
			</div>

			{/* Quick Actions Skeleton */}
			<div className="grid gap-4 md:grid-cols-3 mb-8">
				{[...Array(3)].map((_, i) => (
					<Card key={i} className="border border-base-300 bg-base-100 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 bg-base-300 rounded-lg" />
							<div className="flex-1">
								<div className="h-4 w-24 bg-base-300 rounded mb-2" />
								<div className="h-3 w-32 bg-base-200 rounded" />
							</div>
						</div>
					</Card>
				))}
			</div>

			{/* Table Skeleton */}
			<Card className="border border-base-300 bg-base-100 p-6 shadow-sm">
				<div className="h-6 w-32 bg-base-300 rounded mb-4" />
				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="h-12 bg-base-200 rounded" />
					))}
				</div>
			</Card>
		</div>
	)
}
