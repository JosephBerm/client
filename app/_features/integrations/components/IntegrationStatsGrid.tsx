'use client'

import {
	AlertCircle,
	ArrowRightLeft,
	CheckCircle,
	Clock,
	Link2,
	XCircle,
} from 'lucide-react'

import Card from '@_components/ui/Card'
import Skeleton from '@_components/ui/Skeleton'

import { useIntegrationStats } from '../hooks'
import type { IntegrationStats } from '../types'

interface IntegrationStatsGridProps {
	/** Optional pre-fetched stats (if not provided, component fetches its own) */
	stats?: IntegrationStats | null
	/** Loading override (only used if stats prop is provided) */
	isLoading?: boolean
}

interface StatCardProps {
	title: string
	value: number | string
	icon: React.ReactNode
	description?: string
	variant?: 'default' | 'success' | 'warning' | 'error'
}

function StatCard({ title, value, icon, description, variant = 'default' }: StatCardProps) {
	const variantStyles = {
		default: 'text-primary',
		success: 'text-success',
		warning: 'text-warning',
		error: 'text-error',
	}

	return (
		<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
			<div className="flex items-center justify-between pb-2">
				<span className="text-sm font-medium text-base-content/70">{title}</span>
				<div className={variantStyles[variant]}>{icon}</div>
			</div>
			<div className="text-2xl font-bold">{value}</div>
			{description && <p className="text-xs text-base-content/60">{description}</p>}
		</Card>
	)
}

function StatCardSkeleton() {
	return (
		<Card className="border border-base-300 bg-base-100 p-4 shadow-sm">
			<div className="flex items-center justify-between pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4" />
			</div>
			<Skeleton className="h-8 w-16" />
			<Skeleton className="mt-1 h-3 w-32" />
		</Card>
	)
}

/**
 * Grid displaying integration statistics.
 * Fetches its own data if stats prop is not provided.
 */
export function IntegrationStatsGrid({ stats: propStats, isLoading: propIsLoading }: IntegrationStatsGridProps) {
	// Fetch stats if not provided via props
	const { data: fetchedStats, isLoading: fetchingStats } = useIntegrationStats({
		enabled: propStats === undefined,
	})

	// Use prop stats if provided, otherwise use fetched stats
	const stats = propStats ?? fetchedStats
	const isLoading = propStats !== undefined ? propIsLoading : fetchingStats

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<StatCardSkeleton key={i} />
				))}
			</div>
		)
	}

	if (!stats) {
		return null
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			<StatCard
				title="Active Connections"
				value={`${stats.activeConnections}/${stats.totalConnections}`}
				icon={<Link2 className="h-4 w-4" />}
				description="Connected ERP systems"
				variant={stats.activeConnections > 0 ? 'success' : 'default'}
			/>

			<StatCard
				title="Entity Mappings"
				value={stats.totalMappings}
				icon={<ArrowRightLeft className="h-4 w-4" />}
				description="Synced entities"
			/>

			<StatCard
				title="Today's Syncs"
				value={stats.todaySyncCount}
				icon={<Clock className="h-4 w-4" />}
				description="Operations today"
			/>

			<StatCard
				title="Successful"
				value={stats.todaySuccessCount}
				icon={<CheckCircle className="h-4 w-4" />}
				description="Completed today"
				variant="success"
			/>

			<StatCard
				title="Failed"
				value={stats.todayFailureCount}
				icon={<XCircle className="h-4 w-4" />}
				description="Failures today"
				variant={stats.todayFailureCount > 0 ? 'error' : 'default'}
			/>

			<StatCard
				title="Pending Queue"
				value={stats.pendingOutboxCount}
				icon={<AlertCircle className="h-4 w-4" />}
				description={`${stats.failedOutboxCount} failed`}
				variant={stats.failedOutboxCount > 0 ? 'warning' : 'default'}
			/>
		</div>
	)
}

export default IntegrationStatsGrid
