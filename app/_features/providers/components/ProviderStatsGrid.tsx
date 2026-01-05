/**
 * ProviderStatsGrid Component
 *
 * Displays provider statistics in a responsive grid layout.
 * Shows total, active, suspended, archived, and new providers this month.
 * Supports click-to-filter functionality on stat cards.
 *
 * STATUS WORKFLOW:
 * Active (green) -> Suspended (yellow) -> Archived (red)
 *
 * @module providers/components
 */

'use client'

import { Archive, Calendar, CheckCircle, Factory, Package, PauseCircle } from 'lucide-react'

import FilterableStatCard from '@_components/ui/FilterableStatCard'

import type { AggregateProviderStats, ProviderStatusKey } from '../types'

interface ProviderStatsGridProps {
	/** Provider statistics data */
	stats: AggregateProviderStats | null
	/** Whether stats are loading */
	isLoading: boolean
	/** Currently selected filter (optional, for highlighting) */
	selectedFilter?: ProviderStatusKey | 'all'
	/** Callback when a stat card is clicked (optional, for filtering) */
	onFilterClick?: (filter: ProviderStatusKey | 'all') => void
}

/**
 * ProviderStatsGrid Component
 *
 * Renders a grid of provider statistics cards.
 * Responsive layout: 2 columns on mobile, 3 on tablet, 6 on desktop.
 * Cards can be clicked to filter the provider list.
 *
 * @example
 * ```tsx
 * const { stats, isLoading } = useProviderStats()
 * const [filter, setFilter] = useState<ProviderStatusKey | 'all'>('all')
 *
 * return (
 *   <ProviderStatsGrid
 *     stats={stats}
 *     isLoading={isLoading}
 *     selectedFilter={filter}
 *     onFilterClick={setFilter}
 *   />
 * )
 * ```
 */
export function ProviderStatsGrid({
	stats,
	isLoading,
	selectedFilter,
	onFilterClick,
}: ProviderStatsGridProps) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
			<FilterableStatCard
				icon={<Factory className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Total"
				value={stats?.totalProviders ?? null}
				isLoading={isLoading}
				color="text-primary"
				bgColor="bg-primary/10"
				isSelected={selectedFilter === 'all'}
				onClick={onFilterClick ? () => onFilterClick('all') : undefined}
			/>
			<FilterableStatCard
				icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Active"
				value={stats?.activeProviders ?? null}
				isLoading={isLoading}
				color="text-success"
				bgColor="bg-success/10"
				isSelected={selectedFilter === 'active'}
				onClick={onFilterClick ? () => onFilterClick('active') : undefined}
			/>
			<FilterableStatCard
				icon={<PauseCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Suspended"
				value={stats?.suspendedProviders ?? null}
				isLoading={isLoading}
				color="text-warning"
				bgColor="bg-warning/10"
				isSelected={selectedFilter === 'suspended'}
				onClick={onFilterClick ? () => onFilterClick('suspended') : undefined}
			/>
			<FilterableStatCard
				icon={<Archive className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Archived"
				value={stats?.archivedProviders ?? null}
				isLoading={isLoading}
				color="text-error"
				bgColor="bg-error/10"
				isSelected={selectedFilter === 'archived'}
				onClick={onFilterClick ? () => onFilterClick('archived') : undefined}
			/>
			{/* Read-only stat cards - no filtering */}
			<FilterableStatCard
				icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="New This Month"
				value={stats?.newThisMonth ?? null}
				isLoading={isLoading}
				color="text-info"
				bgColor="bg-info/10"
			/>
			<FilterableStatCard
				icon={<Package className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="With Products"
				value={stats?.withProducts ?? null}
				isLoading={isLoading}
				color="text-secondary"
				bgColor="bg-secondary/10"
			/>
		</div>
	)
}

export default ProviderStatsGrid
