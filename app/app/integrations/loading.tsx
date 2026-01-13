import Card from '@_components/ui/Card'
import Skeleton from '@_components/ui/Skeleton'

/**
 * Loading state for Integrations pages.
 * Shows skeleton placeholders while data is being fetched.
 */
export default function IntegrationsLoading() {
	return (
		<div className="space-y-6 pb-8">
			{/* Header Skeleton */}
			<div className="space-y-2">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-96" />
			</div>

			{/* Tabs Skeleton */}
			<Skeleton className="h-10 w-80" />

			{/* Stats Grid Skeleton */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<Skeleton className="h-20 w-full" />
					</Card>
				))}
			</div>

			{/* Connection Cards Skeleton */}
			<div className="grid gap-6 md:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<Card key={i}>
						<Skeleton className="mb-4 h-6 w-40" />
						<Skeleton className="h-32 w-full" />
					</Card>
				))}
			</div>

			{/* Activity Skeleton */}
			<Card>
				<Skeleton className="mb-4 h-6 w-48" />
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			</Card>
		</div>
	)
}
