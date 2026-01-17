'use client'

/**
 * TeamLeaderboard Component
 *
 * Wrapper component that provides the legacy API while using TeamLeaderboardDataGrid.
 * Maintains backwards compatibility with existing consumers.
 *
 * **DRY Compliance:** Delegates to TeamLeaderboardDataGrid for actual implementation.
 *
 * @see prd_analytics.md - US-ANA-002
 * @module analytics/components/TeamLeaderboard
 */

import { Trophy, Users } from 'lucide-react'

import Card from '@_components/ui/Card'
import { TeamLeaderboardDataGrid } from './TeamLeaderboardDataGrid'

import type { SalesRepPerformance } from '@_types/analytics.types'

// =========================================================================
// TYPES
// =========================================================================

interface TeamLeaderboardProps {
	/** List of sales rep performance data */
	data: SalesRepPerformance[]
	/** Maximum number of rows to display */
	maxRows?: number
	/** Whether data is loading */
	isLoading?: boolean
	/** Click handler for row selection */
	onRowClick?: (salesRepId: string) => void
	/** Title for the card */
	title?: string
}

// =========================================================================
// DATA TRANSFORMATION
// =========================================================================

/**
 * Transform SalesRepPerformance to TeamMemberPerformance format
 * required by TeamLeaderboardDataGrid
 */
function transformToTeamMemberPerformance(
	data: SalesRepPerformance[],
	maxRows: number
): Array<{
	id: number
	name: string
	email?: string
	quotesCreated: number
	quotesConverted: number
	totalRevenue: number
	rank: number
}> {
	return data.slice(0, maxRows).map((rep, index) => ({
		id: parseInt(rep.salesRepId, 10) || index,
		name: rep.salesRepName || 'Unknown',
		quotesCreated: rep.totalQuotes,
		quotesConverted: rep.convertedQuotes,
		totalRevenue: rep.totalRevenue,
		rank: index + 1,
	}))
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

/**
 * Team leaderboard component.
 *
 * Wrapper that transforms data and delegates to TeamLeaderboardDataGrid.
 *
 * @example
 * ```tsx
 * <TeamLeaderboard
 *   data={teamPerformance}
 *   maxRows={10}
 *   onRowClick={(id) => router.push(`/analytics/rep/${id}`)}
 * />
 * ```
 */
export function TeamLeaderboard({
	data,
	maxRows = 10,
	isLoading = false,
	onRowClick,
	title = 'Team Performance',
}: TeamLeaderboardProps) {
	if (isLoading) {
		return (
			<Card
				title={title}
				className='col-span-full'>
				<div className='flex items-center justify-center h-48 sm:h-64'>
					<span className='loading loading-spinner loading-md sm:loading-lg text-primary' />
				</div>
			</Card>
		)
	}

	if (!data.length) {
		return (
			<Card
				title={title}
				className='col-span-full'>
				<div className='flex flex-col items-center justify-center h-48 sm:h-64 text-base-content/50'>
					<Users className='h-10 w-10 sm:h-12 sm:w-12 mb-2' />
					<p className='text-sm'>No team data available</p>
				</div>
			</Card>
		)
	}

	// Transform data to the format expected by TeamLeaderboardDataGrid
	const transformedData = transformToTeamMemberPerformance(data, maxRows)

	return (
		<Card className='col-span-full'>
			{/* Header */}
			<div className='flex items-center justify-between mb-3 sm:mb-4'>
				<div className='flex items-center gap-2'>
					<div className='p-1.5 sm:p-2 bg-primary/10 rounded-lg'>
						<Trophy className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
					</div>
					<h3 className='font-semibold text-sm sm:text-base text-base-content'>{title}</h3>
				</div>
			</div>

			{/* Delegate to DataGrid */}
			<TeamLeaderboardDataGrid
				data={transformedData}
				isLoading={isLoading}
			/>

			{/* Show more indicator */}
			{data.length > maxRows && (
				<div className='mt-3 sm:mt-4 text-center'>
					<span className='text-xs sm:text-sm text-base-content/60'>
						Showing top {maxRows} of {data.length} team members
					</span>
				</div>
			)}
		</Card>
	)
}

export default TeamLeaderboard
