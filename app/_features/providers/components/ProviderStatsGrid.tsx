/**
 * ProviderStatsGrid Component
 * 
 * Displays provider statistics in a responsive grid layout.
 * Shows total, active, suspended, archived, and new providers this month.
 * 
 * STATUS WORKFLOW:
 * Active (green) -> Suspended (yellow) -> Archived (red)
 * 
 * @module providers/components
 */

'use client'

import { Archive, Calendar, CheckCircle, Factory, Package, PauseCircle } from 'lucide-react'

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

interface StatCardProps {
	icon: React.ReactNode
	label: string
	value: number | null
	isLoading: boolean
	color: string
	bgColor: string
	filterKey?: ProviderStatusKey | 'all'
	isSelected?: boolean
	onClick?: () => void
}

/**
 * Individual stat card component with optional click interaction.
 */
function StatCard({ 
	icon, 
	label, 
	value, 
	isLoading, 
	color, 
	bgColor,
	isSelected = false,
	onClick,
}: StatCardProps) {
	const isClickable = !!onClick
	
	return (
		<div 
			className={`
				card bg-base-100 shadow-sm transition-all duration-200
				${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
				${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
			`}
			onClick={onClick}
			role={isClickable ? 'button' : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
		>
			<div className="card-body p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${bgColor} flex items-center justify-center shrink-0`}>
						<span className={color}>{icon}</span>
					</div>
					<div className="min-w-0">
						<p className="text-xs text-base-content/60 truncate">{label}</p>
						<p className="text-lg sm:text-xl font-bold">
							{isLoading ? (
								<span className="loading loading-dots loading-sm" />
							) : (
								value ?? '—'
							)}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
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
			<StatCard
				icon={<Factory className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Total"
				value={stats?.totalProviders ?? null}
				isLoading={isLoading}
				color="text-primary"
				bgColor="bg-primary/10"
				filterKey="all"
				isSelected={selectedFilter === 'all'}
				onClick={onFilterClick ? () => onFilterClick('all') : undefined}
			/>
			<StatCard
				icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Active"
				value={stats?.activeProviders ?? null}
				isLoading={isLoading}
				color="text-success"
				bgColor="bg-success/10"
				filterKey="active"
				isSelected={selectedFilter === 'active'}
				onClick={onFilterClick ? () => onFilterClick('active') : undefined}
			/>
			<StatCard
				icon={<PauseCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Suspended"
				value={stats?.suspendedProviders ?? null}
				isLoading={isLoading}
				color="text-warning"
				bgColor="bg-warning/10"
				filterKey="suspended"
				isSelected={selectedFilter === 'suspended'}
				onClick={onFilterClick ? () => onFilterClick('suspended') : undefined}
			/>
			<StatCard
				icon={<Archive className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Archived"
				value={stats?.archivedProviders ?? null}
				isLoading={isLoading}
				color="text-error"
				bgColor="bg-error/10"
				filterKey="archived"
				isSelected={selectedFilter === 'archived'}
				onClick={onFilterClick ? () => onFilterClick('archived') : undefined}
			/>
			<StatCard
				icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="New This Month"
				value={stats?.newThisMonth ?? null}
				isLoading={isLoading}
				color="text-info"
				bgColor="bg-info/10"
			/>
			<StatCard
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

