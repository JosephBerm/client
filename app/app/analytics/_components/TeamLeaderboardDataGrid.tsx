/**
 * TeamLeaderboardDataGrid Component
 *
 * Modern data grid for displaying team performance leaderboard.
 * Migrated from TeamLeaderboard table to use DataGrid for consistency.
 * Mobile-first responsive design.
 *
 * Features:
 * - Client-side sorting via DataGrid
 * - Custom cell renderers for metrics
 * - Rank badges with colors
 * - Skeleton loading states
 *
 * @module app/analytics/_components/TeamLeaderboardDataGrid
 */

'use client'

import { useMemo } from 'react'
import { Trophy, TrendingUp, TrendingDown, Minus, User } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { DataGrid } from '@_components/tables'

// =========================================================================
// TYPES
// =========================================================================

interface TeamMemberPerformance {
	id: number
	name: string
	email?: string
	avatar?: string
	quotesCreated: number
	quotesConverted: number
	totalRevenue: number
	rank: number
	previousRank?: number
}

interface TeamLeaderboardDataGridProps {
	data: TeamMemberPerformance[]
	isLoading?: boolean
}

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value)
}

/**
 * Format percentage value
 */
function formatPercent(value: number): string {
	return `${(value * 100).toFixed(1)}%`
}

// =========================================================================
// CELL COMPONENTS
// =========================================================================

/**
 * Rank cell with trophy for top 3 - mobile optimized
 */
function RankCell({ rank, previousRank }: { rank: number; previousRank?: number }) {
	const rankChange = previousRank ? previousRank - rank : 0

	const getRankBadge = (rank: number) => {
		switch (rank) {
			case 1:
				return (
					<div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-yellow-500/20">
						<Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
					</div>
				)
			case 2:
				return (
					<div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-400/20">
						<Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
					</div>
				)
			case 3:
				return (
					<div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-700/20">
						<Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-700" />
					</div>
				)
			default:
				return (
					<div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-base-200 text-xs sm:text-sm font-medium text-base-content/60">
						{rank}
					</div>
				)
		}
	}

	return (
		<div className="flex items-center gap-1.5 sm:gap-2">
			{getRankBadge(rank)}
			{rankChange !== 0 && (
				<span className="flex items-center gap-0.5 text-xs">
					{rankChange > 0 ? (
						<>
							<TrendingUp className="h-3 w-3 text-success" />
							<span className="text-success hidden sm:inline">+{rankChange}</span>
						</>
					) : (
						<>
							<TrendingDown className="h-3 w-3 text-error" />
							<span className="text-error hidden sm:inline">{rankChange}</span>
						</>
					)}
				</span>
			)}
		</div>
	)
}

/**
 * Team member cell with avatar - mobile optimized
 */
function MemberCell({ name, email, avatar }: { name: string; email?: string; avatar?: string }) {
	return (
		<div className="flex items-center gap-2 sm:gap-3 min-w-0">
			{avatar ? (
				<img
					src={avatar}
					alt={name}
					className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover flex-shrink-0"
				/>
			) : (
				<div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
					<User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
				</div>
			)}
			<div className="flex flex-col min-w-0">
				<span className="text-sm font-medium text-base-content truncate">{name}</span>
				{email && (
					<span className="hidden sm:block text-xs text-base-content/50 truncate">{email}</span>
				)}
			</div>
		</div>
	)
}

/**
 * Metric cell with value - mobile optimized
 */
function MetricCell({ value, label }: { value: string | number; label?: string }) {
	return (
		<div className="flex flex-col min-w-0">
			<span className="text-xs sm:text-sm font-medium text-base-content">{value}</span>
			{label && <span className="text-xs text-base-content/50 hidden lg:block">{label}</span>}
		</div>
	)
}

/**
 * Conversion rate cell with visual indicator - mobile optimized
 */
function ConversionCell({ rate }: { rate: number }) {
	const ratePercent = rate * 100
	const getColor = () => {
		if (ratePercent >= 50) return 'text-success'
		if (ratePercent >= 30) return 'text-warning'
		return 'text-error'
	}

	return (
		<div className="flex items-center gap-1.5 sm:gap-2">
			<div className="hidden sm:block h-1.5 w-12 sm:w-16 overflow-hidden rounded-full bg-base-200">
				<div
					className={`h-full rounded-full ${
						ratePercent >= 50
							? 'bg-success'
							: ratePercent >= 30
							? 'bg-warning'
							: 'bg-error'
					}`}
					style={{ width: `${Math.min(ratePercent, 100)}%` }}
				/>
			</div>
			<span className={`text-xs sm:text-sm font-medium ${getColor()}`}>
				{formatPercent(rate)}
			</span>
		</div>
	)
}

/**
 * Revenue cell with currency formatting - mobile optimized
 */
function RevenueCell({ value }: { value: number }) {
	return (
		<span className="text-xs sm:text-sm font-semibold text-success whitespace-nowrap">
			{formatCurrency(value)}
		</span>
	)
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export function TeamLeaderboardDataGrid({
	data,
	isLoading = false,
}: TeamLeaderboardDataGridProps) {
	// Compute averages for context
	const avgConversion =
		data.length > 0
			? data.reduce((sum, m) => sum + (m.quotesConverted / Math.max(m.quotesCreated, 1)), 0) /
			  data.length
			: 0

	const avgRevenue =
		data.length > 0
			? data.reduce((sum, m) => sum + m.totalRevenue, 0) / data.length
			: 0

	// Sort by rank for display
	const displayData = [...data].sort((a, b) => a.rank - b.rank)

	// Column definitions - useMemo is required for TanStack Table stable reference
	const columns = useMemo<ColumnDef<TeamMemberPerformance>[]>(
		() => [
			{
				id: 'rank',
				accessorKey: 'rank',
				header: '#',
				cell: ({ row }) => (
					<RankCell rank={row.original.rank} previousRank={row.original.previousRank} />
				),
				size: 60,
			},
			{
				id: 'member',
				accessorKey: 'name',
				header: 'Team Member',
				cell: ({ row }) => (
					<MemberCell
						name={row.original.name}
						email={row.original.email}
						avatar={row.original.avatar}
					/>
				),
				size: 200,
			},
			{
				id: 'quotesCreated',
				accessorKey: 'quotesCreated',
				header: 'Quotes',
				cell: ({ row }) => (
					<MetricCell value={row.original.quotesCreated} label="created" />
				),
				size: 80,
			},
			{
				id: 'conversion',
				accessorFn: (row) => row.quotesConverted / Math.max(row.quotesCreated, 1),
				header: 'Conv.',
				cell: ({ row }) => (
					<ConversionCell
						rate={row.original.quotesConverted / Math.max(row.original.quotesCreated, 1)}
					/>
				),
				size: 120,
			},
			{
				id: 'revenue',
				accessorKey: 'totalRevenue',
				header: 'Revenue',
				cell: ({ row }) => <RevenueCell value={row.original.totalRevenue} />,
				size: 100,
			},
		],
		[]
	)

	return (
		<div className="space-y-3 sm:space-y-4">
			{/* Summary stats - mobile responsive grid */}
			{data.length > 0 && !isLoading && (
				<div className="grid grid-cols-2 gap-2 sm:gap-4 rounded-lg bg-base-200/50 p-2.5 sm:p-4">
					<div className="text-center">
						<div className="text-xs text-base-content/60">Avg. Conversion</div>
						<div className="text-base sm:text-lg font-semibold text-primary">
							{formatPercent(avgConversion)}
						</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-base-content/60">Avg. Revenue</div>
						<div className="text-base sm:text-lg font-semibold text-success">
							{formatCurrency(avgRevenue)}
						</div>
					</div>
				</div>
			)}

			{/* DataGrid - mobile responsive wrapper */}
			<div className="overflow-x-auto -mx-3 sm:mx-0">
				<div className="min-w-[400px] px-3 sm:px-0">
					<DataGrid<TeamMemberPerformance>
						data={displayData}
						columns={columns}
						isLoading={isLoading}
						loadingVariant="skeleton"
						skeletonRowCount={5}
						enablePagination={displayData.length > 10}
						emptyMessage={
							<div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
								<Trophy className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-base-content/20" />
								<p className="text-sm text-base-content/60">No team data available</p>
							</div>
						}
						ariaLabel="Team performance leaderboard"
					/>
				</div>
			</div>
		</div>
	)
}

export default TeamLeaderboardDataGrid
