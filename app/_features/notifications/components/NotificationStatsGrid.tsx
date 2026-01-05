/**
 * NotificationStatsGrid Component
 *
 * Displays aggregate notification statistics in a responsive grid layout.
 * Supports click-to-filter functionality on stat cards.
 *
 * **Features:**
 * - Clickable stat cards that filter the notification table
 * - Visual selection indicator (ring) on active filter
 * - Mobile-first responsive grid (2 cols mobile, 4 cols desktop)
 * - DaisyUI theme integration
 *
 * @module notifications/components
 */

'use client'

import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

import FilterableStatCard from '@_components/ui/FilterableStatCard'

import type { NotificationStats, NotificationStatusKey } from '../types'

interface NotificationStatsGridProps {
	/** Notification statistics data (null when loading) */
	stats: NotificationStats | null
	/** Whether stats are loading */
	isLoading: boolean
	/** Currently selected status filter */
	selectedFilter?: NotificationStatusKey
	/** Callback when a stat card is clicked */
	onFilterClick?: (filter: NotificationStatusKey) => void
}

/**
 * NotificationStatsGrid Component
 *
 * Renders a responsive grid of notification statistics cards.
 * Cards are clickable to filter the notification list by status.
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useState<NotificationStatusKey>('all')
 *
 * <NotificationStatsGrid
 *   stats={stats}
 *   isLoading={isLoading}
 *   selectedFilter={filter}
 *   onFilterClick={setFilter}
 * />
 * ```
 */
function NotificationStatsGrid({
	stats,
	isLoading,
	selectedFilter,
	onFilterClick,
}: NotificationStatsGridProps) {
	// Default stats when null (loading state)
	const displayStats = stats ?? {
		totalNotifications: 0,
		unreadCount: 0,
		readCount: 0,
		infoCount: 0,
		warningCount: 0,
		errorCount: 0,
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
			<FilterableStatCard
				icon={<Bell className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Total"
				value={displayStats.totalNotifications}
				isLoading={isLoading}
				color="text-primary"
				bgColor="bg-primary/10"
				isSelected={selectedFilter === 'all'}
				onClick={onFilterClick ? () => onFilterClick('all') : undefined}
			/>
			<FilterableStatCard
				icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Unread"
				value={displayStats.unreadCount}
				isLoading={isLoading}
				color="text-warning"
				bgColor="bg-warning/10"
				isSelected={selectedFilter === 'unread'}
				onClick={onFilterClick ? () => onFilterClick('unread') : undefined}
			/>
			<FilterableStatCard
				icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Read"
				value={displayStats.readCount}
				isLoading={isLoading}
				color="text-success"
				bgColor="bg-success/10"
				isSelected={selectedFilter === 'read'}
				onClick={onFilterClick ? () => onFilterClick('read') : undefined}
			/>
			<FilterableStatCard
				icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
				label="Warnings"
				value={displayStats.warningCount}
				isLoading={isLoading}
				color="text-error"
				bgColor="bg-error/10"
			/>
		</div>
	)
}

export default NotificationStatsGrid
