'use client'

/**
 * TeamWorkloadTable Component
 *
 * Displays team workload distribution for sales managers.
 * Shows active quotes/orders per sales rep with overload indicators.
 *
 * **MAANG-Level Architecture:**
 * - Uses centralized EmptyState component
 * - Uses centralized Card component
 *
 * @see prd_dashboard.md - Section 5.2 Frontend Components
 * @module dashboard/TeamWorkloadTable
 */

import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, CheckCircle, Users } from 'lucide-react'

import EmptyState from '@_components/common/EmptyState'
import Card from '@_components/ui/Card'
import { DataGrid } from '@_components/tables'

import type { SalesRepWorkload } from '@_types/dashboard.types'

interface TeamWorkloadTableProps {
	/** Array of sales rep workload data */
	workload: SalesRepWorkload[]
}

/**
 * Team workload table for manager dashboard.
 *
 * @example
 * ```tsx
 * {stats?.teamWorkload && (
 *   <TeamWorkloadTable workload={stats.teamWorkload} />
 * )}
 * ```
 */
export function TeamWorkloadTable({ workload }: TeamWorkloadTableProps) {
	if (workload.length === 0) {
		return (
			<Card className='h-full'>
				<h3 className='font-semibold text-lg text-base-content mb-4'>Team Workload</h3>
				<EmptyState
					icon={<Users className='w-12 h-12' />}
					title='No team members found'
					description='Team workload data will appear once sales reps are assigned.'
				/>
			</Card>
		)
	}

	// Calculate totals
	const totalQuotes = workload.reduce((sum, rep) => sum + rep.activeQuotes, 0)
	const totalOrders = workload.reduce((sum, rep) => sum + rep.activeOrders, 0)
	const overloadedCount = workload.filter((rep) => rep.isOverloaded).length

	return (
		<Card>
			<div className='flex items-center justify-between mb-4'>
				<h3 className='font-semibold text-lg text-base-content'>Team Workload</h3>
				{overloadedCount > 0 && (
					<span className='badge badge-warning gap-1'>
						<AlertTriangle className='w-3 h-3' />
						{overloadedCount} overloaded
					</span>
				)}
			</div>
			<div className='overflow-x-auto -mx-2'>
				<TeamWorkloadDataGrid
					workload={workload}
					totalQuotes={totalQuotes}
					totalOrders={totalOrders}
				/>
			</div>
		</Card>
	)
}

// =========================================================================
// DATA GRID COMPONENT
// =========================================================================

interface TeamWorkloadDataGridProps {
	workload: SalesRepWorkload[]
	totalQuotes: number
	totalOrders: number
}

/**
 * DataGrid component for displaying team workload - mobile-first responsive
 */
function TeamWorkloadDataGrid({ workload, totalQuotes, totalOrders }: TeamWorkloadDataGridProps) {
	const columns = useMemo<ColumnDef<SalesRepWorkload>[]>(
		() => [
			{
				accessorKey: 'salesRepName',
				header: 'Sales Rep',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm font-medium text-base-content'>
						{row.original.salesRepName}
					</span>
				),
				size: 140,
			},
			{
				accessorKey: 'activeQuotes',
				header: 'Quotes',
				cell: ({ row }) => {
					const rep = row.original
					return (
						<span className={`text-xs sm:text-sm font-semibold text-center block ${rep.isOverloaded ? 'text-warning' : ''}`}>
							{rep.activeQuotes}
						</span>
					)
				},
				size: 70,
			},
			{
				accessorKey: 'activeOrders',
				header: 'Orders',
				cell: ({ row }) => (
					<span className='text-xs sm:text-sm text-center block'>
						{row.original.activeOrders}
					</span>
				),
				size: 70,
			},
			{
				accessorKey: 'isOverloaded',
				header: 'Status',
				cell: ({ row }) => {
					const rep = row.original
					return rep.isOverloaded ? (
						<span className='flex items-center justify-center gap-1 text-warning'>
							<AlertTriangle className='w-3 h-3 sm:w-4 sm:h-4' />
							<span className='text-xs sm:text-sm font-medium hidden sm:inline'>Overloaded</span>
						</span>
					) : (
						<span className='flex items-center justify-center gap-1 text-success'>
							<CheckCircle className='w-3 h-3 sm:w-4 sm:h-4' />
							<span className='text-xs sm:text-sm font-medium hidden sm:inline'>OK</span>
						</span>
					)
				},
				size: 100,
			},
		],
		[]
	)

	// Add footer row data for totals
	const dataWithFooter = useMemo(() => {
		return [
			...workload,
			{
				salesRepId: 'footer',
				salesRepName: 'Total',
				activeQuotes: totalQuotes,
				activeOrders: totalOrders,
				isOverloaded: false,
			} as SalesRepWorkload & { salesRepId: string },
		]
	}, [workload, totalQuotes, totalOrders])

	return (
		<div className='min-w-[300px] px-2 sm:px-0'>
			<DataGrid
				columns={columns}
				data={dataWithFooter}
				ariaLabel='Team workload table'
			/>
		</div>
	)
}

export default TeamWorkloadTable
